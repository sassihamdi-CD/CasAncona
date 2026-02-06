# Supabase — CAS Office

## Running migrations (one-time)

**Fastest: run everything in one go**

1. Open **[SQL Editor](https://supabase.com/dashboard/project/dardpjfoovkqlaxfggeb/sql/new)** for this project.
2. Open the file **`supabase/run-all-migrations.sql`** in this repo, copy its full contents, paste into the SQL Editor, then click **Run**.
3. You should see “Success” and tables `services`, `staff`, `staff_availability`, `staff_blocked_dates`, `appointments` in **Table Editor**, with seed data in `services` and `staff`.

After that, restart `npm run dev` and the booking page will load services.

**If you already ran the migrations before:** run **`migrations/20250203000006_services_arabic.sql`** in the SQL Editor to add Arabic name/description for services (so Arabic locale shows translated service names and descriptions).

**Option B — Supabase CLI**

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

## Adding more services later

- **No code change needed.** Insert rows into `public.services` (or use a future admin UI).
- Set `active = true` and `sort_order` to control visibility and order on the site.
- The landing page and booking flow read from this table; new rows appear automatically.

## Environment variables

After creating the project, set in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL` — Project URL
- `SUPABASE_SERVICE_ROLE_KEY` — Service role key (for API routes; keep secret)

Use the **anon** key only from the browser if you ever use Supabase client-side with RLS; the current API uses the service role server-side.
