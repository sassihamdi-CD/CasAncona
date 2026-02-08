-- Delete all appointments (e.g. test data) so you can permanently delete services in admin.
-- Run this in Supabase Dashboard → SQL Editor, then in Admin → Services you can use
-- "Elimina definitivamente" on the services you want to remove.
--
-- WARNING: This deletes EVERY appointment. If you only want to delete old/test ones,
-- use the optional version below with a date filter.

-- Option 1: Delete ALL appointments
delete from public.appointments;

-- Option 2 (optional): Delete only appointments before a certain date (e.g. keep recent)
-- Uncomment and set the date, then comment out "Option 1" above.
-- delete from public.appointments
-- where requested_start_at < '2025-02-01T00:00:00Z';
