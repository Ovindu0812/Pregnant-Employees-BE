-- SafeMum research prototype schema for Supabase PostgreSQL.
-- Run this once in the Supabase SQL Editor before starting the API.

create extension if not exists pgcrypto;

create type public.app_role as enum ('user', 'admin');
create type public.risk_level as enum ('LOW', 'MEDIUM', 'HIGH');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name varchar(120) not null,
  email varchar(254) not null,
  role public.app_role not null default 'user',
  phone varchar(30),
  occupation varchar(120),
  workplace varchar(160),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.risk_assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  pregnancy_stage varchar(80) not null,
  occupation varchar(120) not null,
  working_hours numeric(4,1) not null check (working_hours between 0 and 24),
  prolonged_standing boolean not null default false,
  heavy_lifting boolean not null default false,
  chemical_exposure boolean not null default false,
  workplace_stress boolean not null default false,
  repetitive_movement boolean not null default false,
  night_shift boolean not null default false,
  environmental_hazards boolean not null default false,
  physical_risk_score smallint not null check (physical_risk_score between 0 and 3),
  ergonomic_risk_score smallint not null check (ergonomic_risk_score between 0 and 2),
  environmental_risk_score smallint not null check (environmental_risk_score between 0 and 4),
  psychological_risk_score smallint not null check (psychological_risk_score between 0 and 2),
  total_score smallint not null check (total_score between 0 and 11),
  risk_level public.risk_level not null,
  created_at timestamptz not null default now()
);

create table public.recommendations (
  id uuid primary key default gen_random_uuid(),
  category varchar(80) not null,
  risk_level public.risk_level not null,
  title varchar(200) not null,
  description text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.legal_information (
  id uuid primary key default gen_random_uuid(),
  title varchar(200) not null,
  category varchar(80) not null check (category in ('maternity', 'workplace-safety', 'working-conditions', 'employment-rights')),
  summary varchar(1000) not null,
  content text not null,
  source_reference varchar(1000),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  assessment_id uuid not null references public.risk_assessments(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment varchar(2000),
  created_at timestamptz not null default now(),
  unique (user_id, assessment_id)
);

create index risk_assessments_user_created_idx on public.risk_assessments (user_id, created_at desc);
create index risk_assessments_level_idx on public.risk_assessments (risk_level);
create index feedback_user_created_idx on public.feedback (user_id, created_at desc);
create index legal_information_active_category_idx on public.legal_information (active, category);
create index recommendations_active_level_idx on public.recommendations (active, risk_level);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger recommendations_set_updated_at before update on public.recommendations
for each row execute function public.set_updated_at();
create trigger legal_information_set_updated_at before update on public.legal_information
for each row execute function public.set_updated_at();

-- Registration passes full_name as trusted auth metadata. The role is always user.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email, role, phone)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), 'User'),
    new.email,
    'user'::public.app_role,
    nullif(trim(new.raw_user_meta_data ->> 'phone'), '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

-- SECURITY DEFINER avoids recursive profiles RLS checks. It returns only the
-- caller's role and does not expose profile records.
create or replace function public.current_user_role()
returns public.app_role
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(public.current_user_role() = 'admin'::public.app_role, false);
$$;

revoke all on function public.current_user_role() from public;
revoke all on function public.is_admin() from public;
grant execute on function public.current_user_role() to authenticated;
grant execute on function public.is_admin() to authenticated;

alter table public.profiles enable row level security;
alter table public.risk_assessments enable row level security;
alter table public.recommendations enable row level security;
alter table public.legal_information enable row level security;
alter table public.feedback enable row level security;

create policy profiles_select_own on public.profiles
for select to authenticated using (id = auth.uid());
create policy profiles_select_admin on public.profiles
for select to authenticated using ((select public.is_admin()));
create policy profiles_update_own on public.profiles
for update to authenticated
using (id = auth.uid())
with check (id = auth.uid() and role = (select public.current_user_role()));
create policy profiles_manage_admin on public.profiles
for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy assessments_insert_own on public.risk_assessments
for insert to authenticated with check (user_id = auth.uid());
create policy assessments_select_own on public.risk_assessments
for select to authenticated using (user_id = auth.uid());
create policy assessments_manage_admin on public.risk_assessments
for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy recommendations_read_active_anon on public.recommendations
for select to anon using (active = true);
create policy recommendations_read_active_user on public.recommendations
for select to authenticated using (active = true);
create policy recommendations_manage_admin on public.recommendations
for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy legal_read_active_anon on public.legal_information
for select to anon using (active = true);
create policy legal_read_active_user on public.legal_information
for select to authenticated using (active = true);
create policy legal_manage_admin on public.legal_information
for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy feedback_insert_own on public.feedback
for insert to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.risk_assessments assessment
    where assessment.id = assessment_id and assessment.user_id = auth.uid()
  )
);
create policy feedback_select_own on public.feedback
for select to authenticated using (user_id = auth.uid());
create policy feedback_select_admin on public.feedback
for select to authenticated using ((select public.is_admin()));

revoke all on public.profiles from anon, authenticated;
revoke all on public.risk_assessments from anon, authenticated;
revoke all on public.recommendations from anon, authenticated;
revoke all on public.legal_information from anon, authenticated;
revoke all on public.feedback from anon, authenticated;

grant select on public.profiles to authenticated;
grant update (full_name, phone, occupation, workplace) on public.profiles to authenticated;
grant select, insert, update, delete on public.risk_assessments to authenticated;
grant select on public.recommendations to anon;
grant select, insert, update, delete on public.recommendations to authenticated;
grant select on public.legal_information to anon;
grant select, insert, update, delete on public.legal_information to authenticated;
grant select, insert on public.feedback to authenticated;

-- No legal claims are seeded. Add only content verified against authoritative
-- Sri Lankan sources, and clearly mark unverified drafts as placeholders.
