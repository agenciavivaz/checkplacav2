#!/usr/bin/env bash
set -euo pipefail

container_name="checkplaca-rls-${RANDOM}"
cleanup() { docker rm -f "$container_name" >/dev/null 2>&1 || true; }
trap cleanup EXIT

docker run -d --rm --name "$container_name" -e POSTGRES_PASSWORD=localtest postgres:17-alpine >/dev/null
for attempt in {1..30}; do
  if docker exec "$container_name" pg_isready -U postgres >/dev/null 2>&1; then break; fi
  sleep 1
done

docker exec -i "$container_name" psql -U postgres -v ON_ERROR_STOP=1 >/dev/null <<'SQL'
create role anon nologin;
create role authenticated nologin;
create role service_role nologin;
create schema auth;
create table auth.users (id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema auth to authenticated;
SQL

docker exec -i "$container_name" psql -U postgres -v ON_ERROR_STOP=1 >/dev/null < supabase/migrations/20261118000100_profiles_and_roles.sql
docker exec -i "$container_name" psql -U postgres -v ON_ERROR_STOP=1 >/dev/null < supabase/migrations/20261118000200_catalog.sql
docker exec -i "$container_name" psql -U postgres -v ON_ERROR_STOP=1 >/dev/null < supabase/migrations/20261118000300_orders_and_payment_events.sql

docker exec -i "$container_name" psql -U postgres -v ON_ERROR_STOP=1 >/dev/null <<'SQL'
insert into auth.users (id) values ('00000000-0000-0000-0000-000000000001'), ('00000000-0000-0000-0000-000000000002');
do $$ begin
  if (select count(*) from public.profiles) <> 2 then raise exception 'profile trigger failed'; end if;
  if has_table_privilege('authenticated', 'public.user_roles', 'select') then raise exception 'roles exposed'; end if;
  if has_table_privilege('anon', 'public.profiles', 'select') then raise exception 'profiles exposed to anon'; end if;
  if has_table_privilege('anon', 'public.integration_modules', 'select') then raise exception 'module costs exposed'; end if;
  if has_table_privilege('anon', 'public.orders', 'select') then raise exception 'orders exposed to anon'; end if;
  if has_function_privilege('authenticated', 'private.apply_payment_event(uuid,text,text,text)', 'execute') then raise exception 'payment processor exposed'; end if;
  if has_function_privilege('authenticated', 'public.apply_payment_event(uuid,text,text,text)', 'execute') then raise exception 'payment RPC exposed'; end if;
  if (select count(*) from public.integration_modules where license_approved or enabled) <> 0 then raise exception 'module activated without license'; end if;
  if (select price_cents from public.plan_versions where plan_id = (select id from public.plans where code = 'essential')) <> 1990 then raise exception 'essential price changed'; end if;
  if (select price_cents from public.plan_versions where plan_id = (select id from public.plans where code = 'complete')) <> 3990 then raise exception 'complete price changed'; end if;
  if (select sum(estimated_cost_cents) from public.integration_modules where code in (select unnest(modules) from public.plan_versions where plan_id = (select id from public.plans where code = 'essential'))) <> 971 then raise exception 'essential cost changed'; end if;
  if (select sum(estimated_cost_cents) from public.integration_modules where code in (select unnest(modules) from public.plan_versions where plan_id = (select id from public.plans where code = 'complete'))) <> 2970 then raise exception 'complete cost changed'; end if;
end $$;
begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);
do $$ declare changed integer; begin
  if (select count(*) from public.profiles) <> 1 then raise exception 'profile isolation failed'; end if;
  update public.profiles set display_name = 'Other' where user_id = '00000000-0000-0000-0000-000000000002';
  get diagnostics changed = row_count;
  if changed <> 0 then raise exception 'cross-user update succeeded'; end if;
  update public.profiles set display_name = 'Owner' where user_id = '00000000-0000-0000-0000-000000000001';
  get diagnostics changed = row_count;
  if changed <> 1 then raise exception 'own update failed'; end if;
end $$;
rollback;
begin;
set local role anon;
do $$ begin
  if (select count(*) from public.plans) <> 0 then raise exception 'unpublished plans visible'; end if;
end $$;
rollback;
insert into public.orders (id, buyer_email_hash, plan_version_id, price_snapshot_cents, modules_snapshot, provider_checkout_id, idempotency_key)
select '00000000-0000-0000-0000-000000000010', 'synthetic-hash', id, price_cents, modules, 'sandbox-checkout', '00000000-0000-0000-0000-000000000011'
from public.plan_versions where price_cents = 1990;
select private.apply_payment_event('00000000-0000-0000-0000-000000000010', 'sandbox-checkout', 'evt-expired', 'expired');
select private.apply_payment_event('00000000-0000-0000-0000-000000000010', 'sandbox-checkout', 'evt-paid', 'paid');
select private.apply_payment_event('00000000-0000-0000-0000-000000000010', 'sandbox-checkout', 'evt-paid', 'paid');
select private.apply_payment_event('00000000-0000-0000-0000-000000000010', 'sandbox-checkout', 'evt-late-expired', 'expired');
do $$ begin
  if (select status from public.orders where provider_checkout_id = 'sandbox-checkout') <> 'paid' then raise exception 'paid state lost'; end if;
  if (select count(*) from public.report_jobs where order_id = '00000000-0000-0000-0000-000000000010') <> 1 then raise exception 'duplicate report job'; end if;
  if (select count(*) from public.payment_events where order_id = '00000000-0000-0000-0000-000000000010') <> 3 then raise exception 'payment dedupe failed'; end if;
end $$;
select private.apply_payment_event('00000000-0000-0000-0000-000000000010', 'sandbox-checkout', 'evt-refund', 'refunded');
do $$ begin
  if (select status from public.orders where provider_checkout_id = 'sandbox-checkout') <> 'refunded' then raise exception 'refund failed'; end if;
  if (select state from public.report_jobs where order_id = '00000000-0000-0000-0000-000000000010') <> 'canceled' then raise exception 'queued job not canceled'; end if;
end $$;
begin;
set local role service_role;
do $$ begin
  if public.apply_payment_event('00000000-0000-0000-0000-000000000010', 'sandbox-checkout', 'evt-refund', 'refunded') then
    raise exception 'service RPC accepted duplicate event';
  end if;
end $$;
rollback;
SQL

echo "RLS and payment state checks passed"
