-- Prevent double-booking: one confirmed/pending_payment appointment per staff per start time.
-- App logic already checks getAvailableSlots before insert; this is a safety net at DB level.
create unique index if not exists idx_appointments_staff_start_unique
  on public.appointments (assigned_staff_id, requested_start_at)
  where assigned_staff_id is not null
    and status in ('pending_payment', 'confirmed');
