create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) <= 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin')),
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;

revoke all on public.profiles from anon, authenticated;
revoke all on public.user_roles from anon, authenticated;
grant select (user_id, display_name, created_at, updated_at) on public.profiles to authenticated;
grant update (display_name) on public.profiles to authenticated;

create policy "profiles_select_own" on public.profiles
  for select to authenticated using (user_id = (select auth.uid()));
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create schema if not exists private;

create function private.create_profile_for_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id) values (new.id);
  return new;
end;
$$;

revoke all on function private.create_profile_for_auth_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.create_profile_for_auth_user();

comment on table public.user_roles is 'Roles are assigned only by trusted backend or database administrators.';
