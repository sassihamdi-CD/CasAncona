# Setup step by step — make the website real

This document is the **single priority order** to get the site functional: free database first, then calendar and booking (in person + online), with a clear “reason for booking” and no steps skipped.

---

## What we have (quick review)

| Piece | Status |
|-------|--------|
| **Data model** | Defined in `docs/DATA_MODEL.md`: `services`, `staff`, `staff_availability`, `staff_blocked_dates`, `appointments`. |
| **Database** | Supabase (free tier). Schema in `supabase/migrations/`. Not applied until you run Step 1. |
| **API** | `GET /api/services`, `GET /api/slots?date=&serviceId=`, `POST /api/booking`, `GET /api/booking/confirm`, Stripe webhook. |
| **Booking flow** | Service → In person / Online → Date → Time slots → Your details + **reason for booking** → Submit. |
| **Calendar** | No separate “calendar” table. **Available slots** are computed from staff availability and existing appointments. User picks a **date** (input) then sees **time slots** for that day. |
| **Reason for booking** | Stored in `appointments.client_message`. Form shows “Reason for booking” and it is **required**. |

After Step 1 and 2, the app uses a **real free database**, the **calendar** (date + slots) works for both in-person and online, and every booking has a **reason**.

---

## Step 1 — Free database (Supabase)

**Goal:** Create a real database and apply the schema so the app can list services, compute slots, and save appointments.

### 1.1 Create a Supabase project (free)

1. Go to [supabase.com](https://supabase.com) and sign in (or create an account).
2. Click **New project**.
3. Choose your organization, set a **name** (e.g. `cas-office`), set a **database password** (store it safely).
4. Choose a **region** (e.g. Frankfurt for EU).
5. Click **Create new project** and wait until it is ready.
ƒ
Supabase free tier is enough for this project.

### 1.2 Get connection details

1. In the project, go to **Project Settings** (gear) → **API**.
2. You will see:
   - **Project URL** (shown as **Primary Database** / “RESTful endpoint for querying and managing your database”) — Copy this URL. The app uses it as `NEXT_PUBLIC_SUPABASE_URL` in `.env`. This is the one you need.
   - **Publishable API Key** (e.g. `sb_publishable_...` or “anon”) — **Do not use this.** Our app does not use the publishable key. It is for browser/client access with RLS; we use the server-side secret key instead.
   - **Secret key (service_role)** — On the same API page, find the **service_role** key (may be under “Project API keys”, “Secret”, or “Reveal”). It is usually a long JWT (starts with `eyJ...`). Copy that and use it as `SUPABASE_SERVICE_ROLE_KEY` in `.env`.  
     ⚠️ **Never** put the service_role key in client-side code or in the browser. It bypasses RLS and must stay only in server-side env (e.g. `.env`).
3. Summary for `.env` (the app’s `.env` is already set up with your secret key; add the Project URL if missing):
   - `NEXT_PUBLIC_SUPABASE_URL` = **Project URL** (Primary Database / RESTful endpoint — copy from the same API page)
   - `SUPABASE_SERVICE_ROLE_KEY` = **service_role** secret key (already set)
   - Then run `npm run verify-db` to confirm the database connection and that migrations have been run.

### 1.3 Run migrations (schema + seed data)

Migrations must run **in this order** (number in filename is the order):

| Order | File | Purpose |
|-------|------|--------|
| 1 | `20250203000001_initial_schema.sql` | Tables: services, staff, staff_availability, staff_blocked_dates, appointments, RLS |
| 2 | `20250203000002_consultation_type.sql` | Adds `consultation_type` (in_person / online) to appointments |
| 3 | `20250203000004_seed_services.sql` | Inserts example services (e.g. Prima consulenza immigrazione, etc.) |
| 4 | `20250203000005_seed_staff.sql` | Inserts one staff member and Mon–Fri 09:00–13:00, 14:00–18:00 |

**How to run them:**

- **Option A — Supabase Dashboard**  
  1. In the project, open **SQL Editor**.  
  2. For each file above, open `supabase/migrations/<filename>` in your repo, copy its full content, paste into the SQL Editor, then click **Run**.  
  3. Do this for all four files in order.

- **Option B — Supabase CLI**  
  1. Install: `npm i -g supabase` (or see [Supabase CLI](https://supabase.com/docs/guides/cli)).  
  2. In the project folder: `npx supabase link --project-ref YOUR_PROJECT_REF` (ref is in Project Settings → General).  
  3. Run: `npx supabase db push` (if your migrations are in the default folder).  
  Or run the SQL files manually as in Option A.

**Check:** In Supabase Dashboard → **Table Editor**, you should see tables `services`, `staff`, `staff_availability`, `staff_blocked_dates`, `appointments`. `services` and `staff` should have rows (from seeds).

---

## Step 2 — Environment and run the app

**Goal:** App connects to the database; you can open the site, go to booking, and see real services and slots (calendar behaviour).

### 2.1 Environment file

1. In the project root, copy the example env file:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and set at least:

   ```env
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   OFFICE_TIMEZONE=Europe/Rome
   ```

   - Use your real Supabase URL and `service_role` key from Step 1.2.  
   - `OFFICE_TIMEZONE` is used for slot computation (e.g. office in Italy).  
   - For production, set `NEXT_PUBLIC_APP_URL` to your real domain.

### 2.2 Run the app

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), go to **Prenota** (or the booking page in your locale).

### 2.3 Verify calendar and booking

1. **Services** — You should see the seeded services (e.g. “Prima consulenza immigrazione”).
2. **Type** — Choose “In sede (gratuito)” or “Online (a pagamento)”.
3. **Date** — Pick a date (e.g. next Monday).  
   → The app calls `GET /api/slots?date=YYYY-MM-DD&serviceId=...`. Slots are computed from `staff_availability` and existing appointments.
4. **Time** — You should see time slots (e.g. 09:00, 09:30, …) for that day.
5. **Your details** — Fill name, email, phone, and **Reason for booking** (required).
6. **Submit**  
   - **In person:** You should be redirected to the confirmation page and a new row in `appointments` (status `confirmed`).  
   - **Online:** Without Stripe configured yet, the flow may redirect to checkout only after we add Stripe (Step 3 in WHATS_NEXT.md).

So: **database is real, calendar (date + slots) works for both in-person and online**, and **reason for booking** is saved in `appointments.client_message`.

---

## What’s next (after the site is “real”)

Once Step 1 and 2 are done:

- **Online (paid) bookings:** Configure Stripe (keys + webhook) and optionally payment flow — see `docs/WHATS_NEXT.md` from Step 2 onward.
- **Email, video link (Jitsi), Telegram, admin:** Same doc, Steps 3–6.

Keep this order: **database and env first** → **then** payments and extras.

---

## Quick reference — migrations and env (Step 1 & 2)

**Migrations (run in order):**

1. `20250203000001_initial_schema.sql`
2. `20250203000002_consultation_type.sql`
3. `20250203000004_seed_services.sql`
4. `20250203000005_seed_staff.sql`

**Minimum env for a working booking (in-person + calendar):**

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OFFICE_TIMEZONE=Europe/Rome` (recommended)
