# Phone & hours: Supabase setup

If you save contact info in the admin but the main site still shows empty, run the following in **Supabase**.

## 1. Open SQL Editor

- Go to [Supabase Dashboard](https://supabase.com/dashboard) → your project  
- **SQL Editor** → **New query**

## 2. Create table (if needed) and fix the single row

Paste and run this entire script:

```sql
-- Table for contact phone, email, working hours (one row only)
create table if not exists public.site_contact (
  id uuid primary key,
  phone text,
  email text,
  hours text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Insert the single config row if it doesn't exist (copy existing data from any row if present)
insert into public.site_contact (id, phone, email, hours, created_at, updated_at)
select
  '11111111-1111-1111-1111-111111111111'::uuid,
  (select phone from public.site_contact limit 1),
  (select email from public.site_contact limit 1),
  (select hours from public.site_contact limit 1),
  now(),
  now()
where not exists (select 1 from public.site_contact where id = '11111111-1111-1111-1111-111111111111'::uuid);

-- If table was empty, the insert above does nothing (subqueries return null). So insert one row:
insert into public.site_contact (id, phone, email, hours, created_at, updated_at)
values ('11111111-1111-1111-1111-111111111111'::uuid, null, null, null, now(), now())
on conflict (id) do nothing;

-- Keep only this one row (remove any duplicates with other ids)
delete from public.site_contact where id <> '11111111-1111-1111-1111-111111111111'::uuid;
```

**If you get “relation already exists” or “column default” errors**, run only this part (ensures one row with the fixed id and removes others):

```sql
insert into public.site_contact (id, phone, email, hours, created_at, updated_at)
values ('11111111-1111-1111-1111-111111111111'::uuid, null, null, null, now(), now())
on conflict (id) do update set updated_at = now();

delete from public.site_contact where id <> '11111111-1111-1111-1111-111111111111'::uuid;
```

## 3. After running

1. In **Admin** → **Telefono e orari**, enter phone, email and hours again and click **Salva**.  
2. Open the main site **Contatti** page (and refresh). The same data should appear.

The app always reads and updates the row with id `11111111-1111-1111-1111-111111111111`. One row in Supabase = one config for the whole site.
