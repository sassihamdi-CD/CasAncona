# Changelog

## [Unreleased]

### Added
- **Admin receipt**: Printable payment receipt for any appointment (online or in-person). Same professional layout: studio name, client, service, amount paid, payment method, receipt number. Link from appointments table ("Stampa ricevuta" / "Print receipt"); A4 print-friendly.
- **In-person payment recording**: For admin-created (walk-in) appointments, receipt page shows "Record payment" form when no amount is set. Admin enters amount (€), saves; receipt then shows the amount and can be printed for the client. PATCH `/api/admin/appointments/[id]` accepts `amountPaidCents` and `currency`.
- **Passport upload**: Clients can upload passport document during booking (multipart). Stored in Supabase Storage bucket `passport-documents`. Admin can view/print passport per appointment (`/admin/appointments/[id]/passport`), A4 print.
- **Dashboard cards**: Today, Next 7 days, and Active services counts use correct UTC date boundaries and match appointments list and services data.
- **Docs**: `LIVE_PAYMENTS_CHECKLIST.md`, `PASSPORT_UPLOAD_DESIGN.md`, `STORAGE_PASSPORT_BUCKET.md`. Migration and script for passport bucket.

### Changed
- **Office constants**: `STUDIO_LEGAL_NAME` added for receipts and official documents.
- **Admin i18n**: Receipt strings (IT/EN), record-payment form. Appointments table: receipt column and viewReceipt.
- **Database**: Migration `20250203000010_appointments_passport_document.sql` adds `passport_document_path` to appointments; `run-all-migrations.sql` updated.

### Before going live
- Clear test data if needed: run `supabase/DELETE_ALL_TEST_APPOINTMENTS.sql` in Supabase SQL Editor (Option 2 with a date filter to keep recent appointments, or Option 1 to delete all).
- Ensure Stripe webhook and live keys are set per `docs/LIVE_PAYMENTS_CHECKLIST.md`.
- Create Storage bucket for passports per `supabase/CREATE_PASSPORT_BUCKET.sql` and policy.
