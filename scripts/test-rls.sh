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
create schema auth;
create table auth.users (id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema auth to authenticated;
SQL

docker exec -i "$container_name" psql -U postgres -v ON_ERROR_STOP=1 >/dev/null < supabase/migrations/20261118000100_profiles_and_roles.sql

docker exec -i "$container_name" psql -U postgres -v ON_ERROR_STOP=1 >/dev/null <<'SQL'
insert into auth.users (id) values ('00000000-0000-0000-0000-000000000001'), ('00000000-0000-0000-0000-000000000002');
do $$ begin
  if (select count(*) from public.profiles) <> 2 then raise exception 'profile trigger failed'; end if;
  if has_table_privilege('authenticated', 'public.user_roles', 'select') then raise exception 'roles exposed'; end if;
  if has_table_privilege('anon', 'public.profiles', 'select') then raise exception 'profiles exposed to anon'; end if;
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
SQL

echo "RLS checks passed"
