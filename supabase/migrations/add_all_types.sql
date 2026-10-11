-- Prepare public.providers for all provider types (doctor, lab, radiology,
-- pharmacy, hospital, clinic ...). Idempotent: safe to run more than once.
-- NOTE: the repo had no schema file, so this creates the table if missing and
-- otherwise only adds whatever columns are absent. Review against the live DB.

create table if not exists public.providers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

alter table public.providers add column if not exists type          text;  -- doctor | lab | radiology | pharmacy | hospital | clinic
alter table public.providers add column if not exists specialty     text;
alter table public.providers add column if not exists sub_specialty text;
alter table public.providers add column if not exists name          text;
alter table public.providers add column if not exists city          text;
alter table public.providers add column if not exists area          text;
alter table public.providers add column if not exists address       text;
alter table public.providers add column if not exists phone         text;
alter table public.providers add column if not exists whatsapp      text;
alter table public.providers add column if not exists price         numeric;
alter table public.providers add column if not exists is_featured   boolean not null default false;
alter table public.providers add column if not exists image_url     text;
alter table public.providers add column if not exists description   text;

-- Existing rows without a type are doctors.
update public.providers set type = 'doctor' where type is null;
alter table public.providers alter column type set default 'doctor';
alter table public.providers alter column type set not null;

alter table public.providers drop constraint if exists providers_type_check;
alter table public.providers add constraint providers_type_check
  check (type in ('doctor','lab','radiology','pharmacy','hospital','clinic','dental','physiotherapy'));

create index if not exists providers_type_idx      on public.providers (type);
create index if not exists providers_specialty_idx on public.providers (specialty);
create index if not exists providers_area_idx      on public.providers (area);
create index if not exists providers_featured_idx  on public.providers (is_featured) where is_featured;
