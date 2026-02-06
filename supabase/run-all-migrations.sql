-- Run this ONCE in Supabase Dashboard: SQL Editor → New query → paste all → Run
-- Project: https://dardpjfoovkqlaxfggeb.supabase.co

-- ========== 1. Initial schema ==========
create extension if not exists "uuid-ossp";

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_en text,
  name_ar text,
  description text,
  description_en text,
  description_ar text,
  duration_minutes int not null check (duration_minutes > 0),
  price_cents int not null check (price_cents >= 0),
  currency text not null default 'EUR',
  stripe_price_id text,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_services_active on public.services (active);
create index if not exists idx_services_sort_order on public.services (sort_order);

create table if not exists public.staff (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users (id) on delete set null,
  name text not null,
  email text not null unique,
  telegram_chat_id text,
  whatsapp_phone text,
  role text not null check (role in ('admin', 'lawyer')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_staff_email on public.staff (email);
create index if not exists idx_staff_role on public.staff (role);
create index if not exists idx_staff_active on public.staff (active);

create table if not exists public.staff_availability (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.staff (id) on delete cascade,
  day_of_week int not null check (day_of_week >= 0 and day_of_week <= 6),
  start_time time not null,
  end_time time not null check (end_time > start_time),
  created_at timestamptz not null default now(),
  unique (staff_id, day_of_week, start_time)
);
create index if not exists idx_staff_availability_staff_id on public.staff_availability (staff_id);
create index if not exists idx_staff_availability_staff_day on public.staff_availability (staff_id, day_of_week);

create table if not exists public.staff_blocked_dates (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.staff (id) on delete cascade,
  date date not null,
  reason text,
  created_at timestamptz not null default now(),
  unique (staff_id, date)
);
create index if not exists idx_staff_blocked_dates_staff_id on public.staff_blocked_dates (staff_id);
create index if not exists idx_staff_blocked_dates_staff_date on public.staff_blocked_dates (staff_id, date);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services (id) on delete restrict,
  assigned_staff_id uuid references public.staff (id) on delete set null,
  client_name text not null,
  client_email text not null,
  client_phone text,
  client_message text,
  requested_start_at timestamptz not null,
  duration_minutes int not null,
  status text not null check (status in ('pending_payment', 'confirmed', 'completed', 'cancelled', 'no_show')),
  stripe_session_id text unique,
  stripe_payment_intent_id text,
  amount_paid_cents int,
  currency text,
  video_room_id text,
  video_room_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_appointments_service_id on public.appointments (service_id);
create index if not exists idx_appointments_assigned_staff_id on public.appointments (assigned_staff_id);
create index if not exists idx_appointments_status on public.appointments (status);
create index if not exists idx_appointments_requested_start_at on public.appointments (requested_start_at);
create index if not exists idx_appointments_stripe_session_id on public.appointments (stripe_session_id);
create index if not exists idx_appointments_client_email on public.appointments (client_email);

create or replace function public.set_updated_at()
returns trigger as $$ begin new.updated_at = now(); return new; end; $$ language plpgsql;
drop trigger if exists set_services_updated_at on public.services;
create trigger set_services_updated_at before update on public.services for each row execute function public.set_updated_at();
drop trigger if exists set_staff_updated_at on public.staff;
create trigger set_staff_updated_at before update on public.staff for each row execute function public.set_updated_at();
drop trigger if exists set_appointments_updated_at on public.appointments;
create trigger set_appointments_updated_at before update on public.appointments for each row execute function public.set_updated_at();

alter table public.services enable row level security;
alter table public.staff enable row level security;
alter table public.staff_availability enable row level security;
alter table public.staff_blocked_dates enable row level security;
alter table public.appointments enable row level security;

drop policy if exists "Public can read active services" on public.services;
create policy "Public can read active services" on public.services for select using (active = true);
drop policy if exists "No public access to staff" on public.staff;
create policy "No public access to staff" on public.staff for select using (false);
drop policy if exists "Staff can read staff (via service_role or future auth)" on public.staff;
create policy "Staff can read staff (via service_role or future auth)" on public.staff for select using (exists (select 1 from public.staff s where s.auth_user_id = auth.uid()));
drop policy if exists "No anon staff_availability" on public.staff_availability;
create policy "No anon staff_availability" on public.staff_availability for select using (false);
drop policy if exists "No anon staff_blocked_dates" on public.staff_blocked_dates;
create policy "No anon staff_blocked_dates" on public.staff_blocked_dates for select using (false);
drop policy if exists "No anon appointments" on public.appointments;
create policy "No anon appointments" on public.appointments for all using (false);

-- ========== 2. Consultation type ==========
alter table public.appointments add column if not exists consultation_type text not null default 'online' check (consultation_type in ('in_person', 'online'));
create index if not exists idx_appointments_consultation_type on public.appointments (consultation_type);

-- ========== 3. Seed services (only if empty) ==========
insert into public.services (name, name_en, description, description_en, duration_minutes, price_cents, currency, active, sort_order)
select * from (values
  ('Prima consulenza immigrazione'::text, 'First immigration consultation'::text, 'Consulenza iniziale per orientamento su permessi di soggiorno, ricongiungimento familiare e pratiche relative.'::text, 'Initial consultation for guidance on residence permits, family reunification and related procedures.'::text, 45, 8000, 'EUR'::text, true, 1),
  ('Rinnovo permesso di soggiorno'::text, 'Residence permit renewal'::text, 'Supporto per la preparazione della documentazione e il rinnovo del permesso di soggiorno.'::text, 'Support for preparing documentation and renewing your residence permit.'::text, 30, 5000, 'EUR'::text, true, 2),
  ('Consulenza amministrativa generale'::text, 'General administrative consultation'::text, 'Assistenza su pratiche amministrative, documenti e orientamento ai servizi del territorio.'::text, 'Assistance with administrative procedures, documents and signposting to local services.'::text, 30, 0, 'EUR'::text, true, 3)
) as v(name, name_en, description, description_en, duration_minutes, price_cents, currency, active, sort_order)
where not exists (select 1 from public.services limit 1);

-- ========== 4. Seed staff + availability ==========
insert into public.staff (name, email, role, active)
values ('Operatore CAS', 'operatore@cas-ancona.example', 'lawyer', true)
on conflict (email) do nothing;

do $$
declare sid uuid;
begin
  select id into sid from public.staff where email = 'operatore@cas-ancona.example' limit 1;
  if sid is not null then
    insert into public.staff_availability (staff_id, day_of_week, start_time, end_time)
    values (sid, 1, '09:00', '13:00'), (sid, 1, '14:00', '18:00'), (sid, 2, '09:00', '13:00'), (sid, 2, '14:00', '18:00'), (sid, 3, '09:00', '13:00'), (sid, 3, '14:00', '18:00'), (sid, 4, '09:00', '13:00'), (sid, 4, '14:00', '18:00'), (sid, 5, '09:00', '13:00'), (sid, 5, '14:00', '18:00')
    on conflict (staff_id, day_of_week, start_time) do nothing;
  end if;
end $$;

-- ========== 5. Arabic for services ==========
alter table public.services add column if not exists name_ar text, add column if not exists description_ar text;
update public.services set name_ar = 'استشارة أولى في مجال الهجرة', description_ar = 'توجيه أولي بخصوص تصاريح الإقامة وجمع الشمل والإجراءات ذات الصلة.' where name = 'Prima consulenza immigrazione';
update public.services set name_ar = 'تجديد تصريح الإقامة', description_ar = 'الدعم في تجهيز الوثائق وتجديد تصريح الإقامة.' where name = 'Rinnovo permesso di soggiorno';
update public.services set name_ar = 'استشارة إدارية عامة', description_ar = 'المساعدة في الإجراءات الإدارية والوثائق والتوجيه إلى خدمات المنطقة.' where name = 'Consulenza amministrativa generale';
