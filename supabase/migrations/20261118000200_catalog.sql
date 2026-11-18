create table public.plans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code in ('essential', 'complete')),
  name text not null,
  active boolean not null default false,
  sort_order integer not null,
  published_version_id uuid,
  created_at timestamptz not null default now()
);

create table public.plan_versions (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.plans(id),
  version integer not null check (version > 0),
  price_cents integer not null check (price_cents >= 0),
  modules text[] not null,
  description text not null,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  unique (plan_id, version)
);

alter table public.plans add constraint plans_published_version_id_fkey
  foreign key (published_version_id) references public.plan_versions(id);

create table public.integration_modules (
  code text primary key,
  estimated_cost_cents integer not null check (estimated_cost_cents >= 0),
  license_approved boolean not null default false,
  enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.plans enable row level security;
alter table public.plan_versions enable row level security;
alter table public.integration_modules enable row level security;

revoke all on public.plans, public.plan_versions, public.integration_modules from anon, authenticated;
grant select on public.plans, public.plan_versions to anon, authenticated;

create policy "published_plans_read" on public.plans
  for select to anon, authenticated using (active and published_version_id is not null);
create policy "published_versions_read" on public.plan_versions
  for select to anon, authenticated using (
    is_published and exists (
      select 1 from public.plans
      where plans.id = plan_versions.plan_id
        and plans.active
        and plans.published_version_id = plan_versions.id
    )
  );

insert into public.integration_modules (code, estimated_cost_cents) values
  ('nacional', 110), ('estadual', 190), ('gravame', 180),
  ('roubo_furto', 145), ('renajud', 190), ('recall', 120),
  ('multas_radar', 36), ('leilao', 1200),
  ('historico_proprietarios', 410), ('fipe', 389);

insert into public.plans (code, name, sort_order) values
  ('essential', 'Essencial', 1), ('complete', 'Completo', 2);

insert into public.plan_versions (plan_id, version, price_cents, modules, description)
select id, 1, 1990,
  array['nacional', 'estadual', 'gravame', 'roubo_furto', 'renajud', 'recall', 'multas_radar'],
  'Situação do veículo'
from public.plans where code = 'essential';

insert into public.plan_versions (plan_id, version, price_cents, modules, description)
select id, 1, 3990,
  array['nacional', 'estadual', 'gravame', 'roubo_furto', 'renajud', 'recall', 'multas_radar', 'leilao', 'historico_proprietarios', 'fipe'],
  'Histórico pré-compra'
from public.plans where code = 'complete';
