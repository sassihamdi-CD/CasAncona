-- Add consultation type: in_person (free, at office) vs online (paid, video)
-- In person = free, no payment. Online = pay after choosing date/time, then video link.

alter table public.appointments
  add column if not exists consultation_type text not null default 'online'
  check (consultation_type in ('in_person', 'online'));

create index if not exists idx_appointments_consultation_type on public.appointments (consultation_type);

comment on column public.appointments.consultation_type is 'in_person = free at office; online = paid, video consultation';
