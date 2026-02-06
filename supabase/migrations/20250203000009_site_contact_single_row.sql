-- Use one row with fixed ID so admin and main site always read/update the same row.
-- Preserves existing phone/email/hours from any current row.

-- Insert our config row if missing (copy data from any existing row)
insert into public.site_contact (id, phone, email, hours, created_at, updated_at)
select
  '11111111-1111-1111-1111-111111111111'::uuid,
  (select phone from public.site_contact limit 1),
  (select email from public.site_contact limit 1),
  (select hours from public.site_contact limit 1),
  now(),
  now()
where not exists (select 1 from public.site_contact where id = '11111111-1111-1111-1111-111111111111'::uuid);

-- Keep only this row
delete from public.site_contact where id <> '11111111-1111-1111-1111-111111111111'::uuid;
