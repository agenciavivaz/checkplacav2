create table public.reports (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id),
  owner_user_id uuid references auth.users(id),
  status text not null default 'queued' check (status in ('queued', 'processing', 'completed', 'partial', 'failed')),
  report_schema_version integer not null default 1,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.report_modules (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  module_code text not null references public.integration_modules(code),
  module_status text not null check (module_status in ('clear', 'alert', 'inconclusive', 'unavailable', 'not_found', 'not_included', 'not_applicable')),
  normalized_json jsonb not null default '{}'::jsonb,
  queried_at timestamptz,
  source_updated_at timestamptz,
  estimated_cost_cents integer not null check (estimated_cost_cents >= 0),
  actual_cost_cents integer check (actual_cost_cents >= 0),
  attempt_number integer not null check (attempt_number > 0),
  created_at timestamptz not null default now(),
  unique (report_id, module_code, attempt_number)
);

create table public.provider_calls (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id),
  module_code text not null references public.integration_modules(code),
  attempt_number integer not null check (attempt_number > 0),
  provider_request_id text,
  result_status text not null,
  error_code text,
  estimated_cost_cents integer not null check (estimated_cost_cents >= 0),
  actual_cost_cents integer check (actual_cost_cents >= 0),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  unique (report_id, module_code, attempt_number)
);

alter table public.report_jobs
  add column lease_until timestamptz,
  add column worker_id text,
  add column next_attempt_at timestamptz,
  add column last_error_code text;

create index report_jobs_ready_idx on public.report_jobs(state, next_attempt_at, lease_until);
create index report_modules_report_idx on public.report_modules(report_id);

alter table public.reports enable row level security;
alter table public.report_modules enable row level security;
alter table public.provider_calls enable row level security;

revoke all on public.reports, public.report_modules, public.provider_calls from anon, authenticated;
grant select (id, order_id, owner_user_id, status, report_schema_version, created_at, completed_at)
  on public.reports to authenticated;
grant select (id, report_id, module_code, module_status, normalized_json, queried_at, source_updated_at, created_at)
  on public.report_modules to authenticated;

create policy "reports_select_own" on public.reports
  for select to authenticated using (owner_user_id = (select auth.uid()));
create policy "report_modules_select_own" on public.report_modules
  for select to authenticated using (
    exists (select 1 from public.reports
      where reports.id = report_modules.report_id
        and reports.owner_user_id = (select auth.uid()))
  );
