-- Passport upload: store path to first-page document in Supabase Storage.
-- See docs/PASSPORT_UPLOAD_DESIGN.md.

alter table public.appointments
  add column if not exists passport_document_path text;

comment on column public.appointments.passport_document_path is
  'Storage path in bucket passport-documents, e.g. {appointment_id}/passport.jpg. Set after upload during booking.';
