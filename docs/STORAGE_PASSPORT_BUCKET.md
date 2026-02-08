# Step 2: Create the passport-documents Storage bucket

The booking flow uploads the passport first-page photo to Supabase Storage. You need one **private** bucket.

---

## Option A: Supabase Dashboard (recommended)

1. Open your project → **Storage** in the left sidebar.
2. Click **New bucket**.
3. Set:
   - **Name:** `passport-documents` (must be exactly this; the app uses this name).
   - **Public bucket:** **Off** (private). Only the backend (service role) will access files.
   - **File size limit:** `5` MB (optional but recommended).
   - **Allowed MIME types:** (optional) `image/jpeg`, `image/png`, `application/pdf` — or leave empty to allow any; the API will validate.
4. Click **Create bucket**.

No RLS policies are required for backend-only access: the server uses the **service role** key, which bypasses Storage RLS. Do **not** enable public access.

---

## Option B: SQL (if your project allows it)

Some Supabase projects allow inserting into `storage.buckets`. Run this in the **SQL Editor** only if Option A is not possible:

```sql
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
```

If you get a permission or “read-only” error, use **Option A** (Dashboard) instead.

---

## Check

- In **Storage**, you should see bucket **passport-documents**.
- It must be **private** (no public URL). The app will generate short-lived signed URLs for admin viewing.

After this, the API (Step 3) can upload files to `passport-documents/{appointment_id}/passport.{ext}`.
