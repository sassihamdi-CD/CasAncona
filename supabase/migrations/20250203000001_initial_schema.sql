-- CAS Office — Initial schema
-- Services are fully data-driven: add/edit rows to change what appears on the site.
-- Run this in Supabase Dashboard SQL Editor or via: supabase db push

-- Enable UUID extension if not already
create extension if not exists "uuid-ossp";

-- 1. services — legal services (add more rows anytime; no code change)
create table public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_en text,
  description text,
  description_en text,
  duration_minutes int not null check (duration_minutes > 0),
  price_cents int not null check (price_cents >= 0),
  currency text not null default 'EUR',
  stripe_price_id text,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_services_active on public.services (active);
create index idx_services_sort_order on public.services (sort_order);

comment on table public.services is 'Legal services offered; add/edit rows to change landing page and bookable services.';

-- 2. staff — lawyers and admins
create table public.staff (
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

create index idx_staff_email on public.staff (email);
create index idx_staff_role on public.staff (role);
create index idx_staff_active on public.staff (active);

-- 3. staff_availability — recurring weekly hours
create table public.staff_availability (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.staff (id) on delete cascade,
  day_of_week int not null check (day_of_week >= 0 and day_of_week <= 6),
  start_time time not null,
  end_time time not null check (end_time > start_time),
  created_at timestamptz not null default now(),
  unique (staff_id, day_of_week, start_time)
);

create index idx_staff_availability_staff_id on public.staff_availability (staff_id);
create index idx_staff_availability_staff_day on public.staff_availability (staff_id, day_of_week);

-- 4. staff_blocked_dates — holidays / absences
create table public.staff_blocked_dates (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.staff (id) on delete cascade,
  date date not null,
  reason text,
  created_at timestamptz not null default now(),
  unique (staff_id, date)
);

create index idx_staff_blocked_dates_staff_id on public.staff_blocked_dates (staff_id);
create index idx_staff_blocked_dates_staff_date on public.staff_blocked_dates (staff_id, date);

-- 5. appointments
create table public.appointments (
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

create index idx_appointments_service_id on public.appointments (service_id);
create index idx_appointments_assigned_staff_id on public.appointments (assigned_staff_id);
create index idx_appointments_status on public.appointments (status);
create index idx_appointments_requested_start_at on public.appointments (requested_start_at);
create index idx_appointments_stripe_session_id on public.appointments (stripe_session_id);
create index idx_appointments_client_email on public.appointments (client_email);

-- updated_at trigger (optional but useful)
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_services_updated_at before update on public.services
  for each row execute function public.set_updated_at();
create trigger set_staff_updated_at before update on public.staff
  for each row execute function public.set_updated_at();
create trigger set_appointments_updated_at before update on public.appointments
  for each row execute function public.set_updated_at();

-- RLS: enable on all tables
alter table public.services enable row level security;
alter table public.staff enable row level security;
alter table public.staff_availability enable row level security;
alter table public.staff_blocked_dates enable row level security;
alter table public.appointments enable row level security;

-- services: anyone can read active services (for landing + booking)
create policy "Public can read active services"
  on public.services for select
  using (active = true);

-- staff: no public access (API uses service_role for server-side)
create policy "No public access to staff"
  on public.staff for select
  using (false);

create policy "Staff can read staff (via service_role or future auth)"
  on public.staff for select
  using (
    exists (select 1 from public.staff s where s.auth_user_id = auth.uid())
  );

-- availability and blocked_dates: no anon access
create policy "No anon staff_availability"
  on public.staff_availability for select using (false);
create policy "No anon staff_blocked_dates"
  on public.staff_blocked_dates for select using (false);

-- appointments: no direct client access (booking via API)
create policy "No anon appointments"
  on public.appointments for all using (false);

-- Service role (used by Next.js API) bypasses RLS by default.
