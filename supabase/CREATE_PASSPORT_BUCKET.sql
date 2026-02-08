-- Create the private Storage bucket for passport uploads.
-- Run in Supabase SQL Editor only if Dashboard creation is not possible.
-- If you get a permission/read-only error, create the bucket via Dashboard instead (see docs/STORAGE_PASSPORT_BUCKET.md).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'passport-documents',
  'passport-documents',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
