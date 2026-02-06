-- Single-row config for contact info and hours shown on the main site (Contatti, footer).
-- Admin can edit via dashboard; public API reads this for display.
create table if not exists public.site_contact (
  id uuid primary key default gen_random_uuid(),
  phone text,
  email text,
  hours text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ensure exactly one row (admin will update it).
insert into public.site_contact (phone, email, hours)
select null, null, null
where not exists (select 1 from public.site_contact);

-- Allow only one row: use a constant id for the single config row (optional; we'll just .single() in code).
comment on table public.site_contact is 'Single-row: contact phone, email, working hours for the main website.';
