# What’s next — make the website functional step by step

The site already has: data model, Supabase migrations, API routes, booking flow (service → type → slot → form → Stripe or confirmation), confirmation page, i18n, and branding. To make it **fully functional** in production, follow these steps in order.

**→ Start here:** For **database setup (free Supabase), env, and getting the calendar/booking real**, follow **`docs/SETUP_STEP_BY_STEP.md`** first. Then return to this document for Stripe, email, video, Telegram, and admin.

---

## Step 1 — Environment and database (do this first)

**Goal:** App runs against a real database and can complete bookings.

1. **Supabase**
   - Create a Supabase project (e.g. EU region).
   - Copy `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from Project Settings → API.

2. **Run migrations**
   - Link the project: `npx supabase link --project-ref YOUR_REF` (or use Supabase Dashboard → SQL Editor).
   - Run the SQL in `supabase/migrations/` in order:
     - `20250203000001_initial_schema.sql`
     - `20250203000002_consultation_type.sql`
     - `20250203000004_seed_services.sql`
     - `20250203000005_seed_staff.sql`

3. **Environment file**
   - Copy `.env.example` to `.env`.
   - Fill in at least:
     - `NEXT_PUBLIC_APP_URL` (e.g. `http://localhost:3000` for dev).
     - `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
     - `OFFICE_TIMEZONE=Europe/Rome` (optional but recommended).

**Check:** Open the site, go to “Prenota”, pick a service and in-person slot, submit the form. You should be redirected to the confirmation page (in-person is free and confirmed immediately).

---

## Step 2 — Stripe (paid online consultations)

**Goal:** Online consultations go through Stripe Checkout; after payment, the appointment is confirmed and the client gets a confirmation.

1. **Stripe account**
   - Create or use an existing Stripe account.
   - Get **Publishable key** and **Secret key** from Developers → API keys.

2. **Env**
   - Set `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` and `STRIPE_SECRET_KEY` in `.env`.

3. **Webhook (important)**
   - In Stripe Dashboard: Developers → Webhooks → Add endpoint.
   - URL: `https://your-domain.com/api/webhooks/stripe` (for local dev use Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`).
   - Event: `checkout.session.completed`.
   - Copy the **Signing secret** and set `STRIPE_WEBHOOK_SECRET` in `.env`.

**Check:** Complete an **online** booking; pay with test card `4242 4242 4242 4242`. After payment you should land on the success page and the appointment should be confirmed in the DB (and later in the admin dashboard).

---

## Step 3 — Email (confirmation to client)

**Goal:** After a paid booking, the client receives a real confirmation email with the video link.

1. **Brevo (email)**
   - Sign up at brevo.com, get an API key from SMTP & API → API Keys.
   - Set `RESEND_API_KEY` and `EMAIL_FROM` (e.g. `noreply@yourdomain.com`) in `.env`.

2. **Implement in code**
   - Brevo is already integrated in `lib/notifications/index.ts`. Set `BREVO_API_KEY` and `EMAIL_FROM` in `.env`. See `docs/BREVO_EMAIL_SETUP.md`.

**Check:** After completing a paid booking, the client email address receives the confirmation with the video link (or placeholder until Step 4).

---

## Step 4 — Video room (link for online consultations)

**Goal:** Each confirmed online appointment gets a working video meeting link. **Already implemented with a free solution.**

### Free option (default): Jitsi Meet

- **No API key, no account, no cost.** The app generates a link like `https://meet.jit.si/StudioCAS-{appointmentId}`.
- Client and lawyer open the link in the **browser** (or install the Jitsi app). No sign-up required.
- **Nothing to configure** — it works as soon as Stripe + webhook are set up. The confirmation page and (when you add it) the confirmation email will show this link.

### Other free options (if you prefer)

- **Zoom** — Zoom has a free tier; you can create meetings via the Zoom API (developer account, then use Meeting API). Users join via Zoom app or browser. Requires `ZOOM_CLIENT_ID`, `ZOOM_CLIENT_SECRET`, and implementing OAuth or JWT to create meetings. More setup, but familiar to many users.
- **Google Meet** — Create meetings via Google Calendar API (Google Cloud project, free quota). Users get a Meet link. Requires Google credentials and a bit more code.

### Optional paid (Daily.co / Whereby)

- If you later want a paid provider, set `DAILY_API_KEY` (and implement the Daily API call in `lib/video/create-room.ts`). The code is prepared to check for this env var first.

**Check:** After paying for an online booking, the confirmation page (and email when Step 3 is done) shows a **Jitsi Meet** link. Open it in two browsers or devices to test the call.

---

## Step 5 — Lawyer notifications (Telegram)

**Goal:** When a paid booking is confirmed, the assigned lawyer gets a Telegram message with client and video link.

1. **Telegram bot**
   - Create a bot with @BotFather, get `TELEGRAM_BOT_TOKEN`.
   - Get the lawyer’s chat ID (e.g. by messaging the bot and calling `getUpdates`).
   - Store `telegram_chat_id` on the `staff` row in Supabase (column already in schema).

2. **Env**
   - Set `TELEGRAM_BOT_TOKEN` in `.env`.

3. **Implement in code**
   - In `lib/notifications/index.ts`, replace `notifyLawyerTelegram` with a real call to the Telegram Bot API (`sendMessage`).

**Check:** After a paid booking, the lawyer receives a Telegram message with appointment details and the video link.

---

## Step 6 — Admin dashboard (staff)

**Goal:** Staff can log in, see upcoming appointments, and open video links.

1. **Auth**
   - Option A: Use Supabase Auth and protect `/admin` so only staff can access.
   - Option B: Simple password or API key behind a single “staff” login (e.g. `ADMIN_API_KEY` for `/api/admin/*`; add a simple login page that stores a token and calls admin APIs).

2. **Pages**
   - List appointments: already have `GET /api/admin/appointments` (and by id). Build a page that calls it and shows a table (date, client, service, status, video link).
   - Optional: filters by date, status; link to open the video URL in a new tab.

**Check:** Staff can open the admin area, see today’s (or week’s) appointments, and click to join the video room.

---

## Optional later

- **In-person confirmation email** — Send an email when an in-person booking is created (reuse the same notification helper with `videoRoomUrl: null`).
- **Cancellation / reschedule** — Endpoints and UI to cancel or change an appointment.
- **More content** — Real contact info, lawyer bios, office map fine-tuning.

---

## Quick reference — env vars by step

| Step | Variables |
|------|-----------|
| 1    | `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `OFFICE_TIMEZONE` |
| 2    | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |
| 3    | `BREVO_API_KEY`, `EMAIL_FROM` |
| 4    | None for Jitsi (free). Optional: `DAILY_API_KEY` if you switch to Daily.co |
| 5    | `TELEGRAM_BOT_TOKEN` (+ `telegram_chat_id` on staff row) |
| 6    | Optional: `ADMIN_API_KEY` or Supabase Auth |

Start with **Step 1**; once the DB is linked and env is set, the booking flow (at least in-person) is already functional. Then add Stripe, email, video, Telegram, and admin in order.
