create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  buyer_email_hash text not null,
  plan_version_id uuid not null references public.plan_versions(id),
  price_snapshot_cents integer not null check (price_snapshot_cents > 0),
  modules_snapshot text[] not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'expired', 'canceled', 'refunded')),
  provider_checkout_id text unique,
  idempotency_key uuid not null unique,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create table public.payment_events (
  provider_event_id text primary key,
  order_id uuid not null references public.orders(id),
  event_type text not null check (event_type in ('paid', 'expired', 'canceled', 'refunded')),
  received_at timestamptz not null default now(),
  processed_at timestamptz not null default now()
);

create table public.report_jobs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id),
  state text not null default 'queued' check (state in ('queued', 'processing', 'completed', 'failed', 'canceled')),
  attempts integer not null default 0,
  created_at timestamptz not null default now()
);

create index orders_user_recent_idx on public.orders(user_id, created_at desc);

alter table public.orders enable row level security;
alter table public.payment_events enable row level security;
alter table public.report_jobs enable row level security;

revoke all on public.orders, public.payment_events, public.report_jobs from anon, authenticated;
grant select (id, user_id, plan_version_id, price_snapshot_cents, status, created_at, paid_at) on public.orders to authenticated;

create policy "orders_select_own" on public.orders
  for select to authenticated using (user_id = (select auth.uid()));

create function private.apply_payment_event(
  p_order_id uuid,
  p_checkout_id text,
  p_event_id text,
  p_event_type text
) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_status text;
begin
  if p_event_id is null or length(p_event_id) < 4 or p_event_type not in ('paid', 'expired', 'canceled', 'refunded') then
    raise exception 'Invalid payment event';
  end if;

  select status into current_status
  from public.orders
  where id = p_order_id and provider_checkout_id = p_checkout_id
  for update;
  if not found then raise exception 'Order checkout mismatch'; end if;

  insert into public.payment_events (provider_event_id, order_id, event_type)
  values (p_event_id, p_order_id, p_event_type)
  on conflict (provider_event_id) do nothing;
  if not found then return false; end if;

  if p_event_type = 'paid' and current_status in ('pending', 'expired') then
    update public.orders set status = 'paid', paid_at = now() where id = p_order_id;
    insert into public.report_jobs (order_id) values (p_order_id)
    on conflict (order_id) do nothing;
  elsif p_event_type = 'expired' and current_status = 'pending' then
    update public.orders set status = 'expired' where id = p_order_id;
  elsif p_event_type = 'canceled' and current_status in ('pending', 'expired') then
    update public.orders set status = 'canceled' where id = p_order_id;
  elsif p_event_type = 'refunded' and current_status = 'paid' then
    update public.orders set status = 'refunded' where id = p_order_id;
    update public.report_jobs set state = 'canceled'
    where order_id = p_order_id and state = 'queued';
  end if;

  return true;
end;
$$;

revoke all on function private.apply_payment_event(uuid, text, text, text) from public, anon, authenticated;
grant usage on schema private to service_role;
grant execute on function private.apply_payment_event(uuid, text, text, text) to service_role;

create function public.apply_payment_event(
  p_order_id uuid,
  p_checkout_id text,
  p_event_id text,
  p_event_type text
) returns boolean
language sql
security invoker
set search_path = ''
as $$
  select private.apply_payment_event(p_order_id, p_checkout_id, p_event_id, p_event_type);
$$;

revoke all on function public.apply_payment_event(uuid, text, text, text) from public, anon, authenticated;
grant execute on function public.apply_payment_event(uuid, text, text, text) to service_role;
