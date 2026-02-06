# Technology & Infrastructure — CAS Office Website

Project: **Website for Italian CAS office** (Centro di Ascolto) — online appointment booking and video legal consultations.

**Classificazione ATECO:** 89.99.00 — *Altre attività di assistenza sociale non residenziale n.e.c.* (assistenza sociale non residenziale; sportelli informativi per migranti; mediazione culturale/sociale non specialistica).

---

## 1. Overview of Goals

- Clients **book appointments online**
- **Online payment** for legal consultations (pay before the consultation)
- Clients submit **legal questions via video** to reduce pressure on the physical office
- **Lawyers get notified** about upcoming consultations: via **dashboard** and via **WhatsApp or Telegram** (or similar) bot
- Later: display **list of services** the office provides
- Professional, trustworthy, and compliant (privacy/GDPR for Italy/EU)

---

## 2. Chosen Stack (Summary)

| Area | Choice | Why |
|------|--------|-----|
| **Frontend** | Next.js 14 (App Router) + TypeScript + Tailwind CSS | SEO, fast UI, type safety, great DX |
| **Backend** | Next.js API Routes + optional serverless | Single codebase, easy deploy |
| **Database** | Supabase (PostgreSQL) | Auth + DB + realtime, EU regions, free tier |
| **Booking** | Custom calendar + Supabase (or Cal.com later) | Full control, no per-booking fees |
| **Video** | Daily.co or Whereby | EU-friendly, embeddable, simple API |
| **Auth** | Supabase Auth (clients + staff) | Integrated with DB, secure |
| **Hosting** | Vercel | Best fit for Next.js, EU region available |
| **Email** | Resend or SendGrid | Booking confirmations, reminders |
| **Payments** | Stripe | Cards, SEPA, EU-ready; webhooks for “payment succeeded” |
| **Lawyer notifications** | Dashboard + WhatsApp Business API or Telegram Bot | In-app + instant mobile alerts |

---

## 3. Frontend

- **Next.js 14** (App Router)
  - Server components where useful, client where needed (forms, video).
  - Good for SEO (important for “studio legale”, “consulenza immigrazione”, etc.).
  - Built-in API routes for booking and video room creation.
- **TypeScript**
  - Fewer bugs, better refactors when we add services and forms.
- **Tailwind CSS**
  - Fast, consistent styling; easy to make a professional, accessible UI.
- **React Hook Form + Zod**
  - Reliable form handling and validation for bookings and legal question forms.

**Alternatives considered:** Plain React (no SSR/SEO), Remix (good but smaller ecosystem than Next.js).

---

## 4. Backend

- **Next.js API Routes** (Route Handlers in App Router)
  - Create appointments, validate slots, create video rooms, webhooks if needed.
- **Serverless** on Vercel: no server to maintain, scales with traffic.
- If later we need heavy background jobs (e.g. reminders, reports), we can add:
  - Vercel Cron or a small worker (e.g. Inngest, QStash) calling our API.

---

## 5. Database

- **Supabase** (PostgreSQL)
  - Tables: `appointments`, `clients` (or anonymised booking data), `services`, `video_sessions`, etc.
  - Realtime optional (e.g. live availability).
  - Row Level Security (RLS) for multi-tenant safety.
  - **Region:** choose EU (e.g. Frankfurt) for GDPR and data residency.
- **ORM / client:** Supabase JS client; optional Prisma if we want a separate ORM layer later.

---

## 6. Booking System

- **Flow:** Client picks service → date → time → enters details → **pays online** → appointment is confirmed → **video room is created** → **lawyers are notified** (dashboard + WhatsApp/Telegram).
- **Phase 1:** Custom booking
  - Define “services” (e.g. “Prima consulenza immigrazione”, “Rinnovo permesso”) with **price** and duration.
  - Store available slots (e.g. weekly schedule or manual slots) in DB.
  - Client picks service → date → time → submits name/email/phone (and any short message) → **redirect to payment** (Stripe Checkout).
  - On **payment success** (Stripe webhook): confirm appointment, create video room, send client confirmation email, **notify assigned lawyer(s)** via dashboard and WhatsApp/Telegram.
- **Phase 2 (optional):** Integrate **Cal.com** (open source) if we want a full calendar UI and sync with staff calendars; can be self-hosted or cloud.

---

## 7. Online Payments

- **Stripe**
  - Supports cards and SEPA (ideal for Italy/EU); can add other methods later (e.g. Bancomat Pay).
  - **Flow:** After client selects slot and fills the form, we create a Stripe Checkout Session for the chosen service/price and redirect the client to Stripe. On success, Stripe sends a **webhook** to our API; we then confirm the appointment, create the video room, and trigger lawyer notifications.
  - Store only minimal payment info we need (e.g. "paid", "stripe_payment_id" for disputes); no card numbers in our DB.
- **Pricing:** Each "service" has a price (e.g. "Prima consulenza 30 min — €80"). Prices can be stored in DB or in Stripe Products.
- **Compliance:** Stripe is PCI-compliant; we never touch card data. For Italian invoicing (fatturazione) you can use Stripe Tax or integrate with your existing accounting later.

**Alternatives:** PayPal (familiar but higher fees), Braintree, local Italian gateways (Nexi, etc.) if you need them later.

---

## 8. Video (Legal Questions via Video)

- **Preferred: Daily.co** or **Whereby**
  - Both support EU data and are used for professional/legal use cases.
  - Embeddable room: we create a room **after successful payment** and attach link to the appointment. Client and lawyer use same link (or show in “My appointment” page).
  - Staff join same link; recording optional (only if legally allowed and with consent).
- **Flow:** On **payment success** (Stripe webhook), “video consultation” service), we create a video room and attach the link to the appointment. Client sees the link in confirmation email (and optional "My appointment" page); lawyer sees it in the dashboard and in the WhatsApp/Telegram notification.

**Alternatives:** Twilio Video (more control, more setup), Zoom SDK (familiar but heavier).

---

## 9. Lawyer Notifications (Dashboard + WhatsApp / Telegram)

- **Dashboard (in-app)**
  - Staff area (e.g. `/admin` or `/dashboard`) lists **upcoming consultations** with client name, service, date/time, and **video link**.
  - Optional: realtime updates (Supabase Realtime or polling) so new bookings appear as soon as payment succeeds.
  - Lawyers can open the video link in one click.

- **WhatsApp or Telegram (bot)**
  - When a new paid booking is created, the system sends a message to the assigned lawyer(s) with: client name (or “Nuova prenotazione”), service, date/time, and video link.
  - **Options:**
    - **Telegram Bot:** Simple and free. Create a bot via [@BotFather](https://t.me/BotFather), get API token, store each lawyer’s `chat_id`. On new booking, call Telegram API to send a message. No business verification needed.
    - **WhatsApp Business API:** Official; requires Meta Business verification and (often) a solution provider (e.g. Twilio, MessageBird, 360dialog). Better if clients already expect WhatsApp; more setup and possible cost.
  - **Recommendation for MVP:** Start with **Telegram** (faster to set up, no approval process). Add WhatsApp later if the office prefers it.
  - Implementation: in the same “payment success” webhook handler, after creating the appointment and video room, call Telegram (or WhatsApp) API to send the notification to the lawyer’s chat.

**Flow summary:** Payment success → confirm appointment + create video room → send client email → **update dashboard** → **send Telegram/WhatsApp message to lawyer** with appointment details and video link.

---

## 10. Authentication

- **Supabase Auth**
  - **Clients:** Optional account (e.g. “Accedi per vedere i tuoi appuntamenti”) or guest booking (only name/email/phone).
  - **Staff/Admin:** Email+password or magic link; protect `/admin` and API routes with middleware.
- No need for social login in first version unless you want “Login with Google” for clients.

---

## 11. Infrastructure & Hosting

- **Hosting:** **Vercel**
  - Deploy from Git; previews for every branch.
  - Set project to **EU region** (e.g. Frankfurt) for Next.js and serverless.
- **Domain:** You can connect your own domain (e.g. `studiolegale-cas.it`) in Vercel.
- **Environment:** Store secrets in Vercel (Supabase URL/key, Daily.co API key, email API key); never in code.

---

## 12. Email

- **Provider:** **Resend** or **SendGrid**
  - Transactional only: booking confirmation, reminder (e.g. 24h before), and optional “legal question received” confirmation.
- Use a domain you control for “From” address (e.g. `noreply@tuodominio.it`) for trust and deliverability.

---

## 13. Compliance & Privacy (Italy / EU)

- **GDPR:** Personal data only for booking and video (name, email, phone, and messages). Document in Privacy Policy; lawful basis (e.g. contract, consent where needed).
- **Cookie / consent:** Use a simple cookie banner and consent for non-essential cookies if we add analytics.
- **Data residency:** Supabase and Vercel in EU; Daily.co/Whereby support EU; keep everything outside USA for default storage where possible.
- **Accessibility:** Aim for WCAG 2.1 AA where feasible (forms, buttons, contrast).

---

## 14. Project Structure (Planned)

```
cas-office-website/
├── app/
│   ├── (marketing)/          # Home, services list, about, contact
│   ├── book/                 # Booking flow → payment → confirmation
│   ├── video/                # Video consultation entry (client + lawyer link)
│   ├── admin/                # Staff dashboard: upcoming consultations, video links
│   └── api/                  # API routes (booking, Stripe webhook, notifications)
├── components/
├── lib/                      # Supabase, Stripe, video API, email, Telegram/WhatsApp
├── styles/
└── public/
```

---

## 15. Next Steps (After You Confirm)

1. **You:** Share the **list of services** the office provides (with prices if known) → we add them to the site and to the booking flow.
2. **We:** Implement in order:
   - Home + services page (with prices)
   - Booking flow: select service → date/time → form → **Stripe Checkout** → on payment success: confirm appointment, create video room, send client email
   - **Stripe webhook** handler: on `checkout.session.completed` → confirm booking, create video link, **notify lawyer** (dashboard + Telegram or WhatsApp)
   - Staff dashboard: list upcoming consultations with video links; optional realtime
   - Telegram (or WhatsApp) bot: send lawyer a message with appointment details and video link when a new paid booking is created

If you want to change any choice (e.g. WhatsApp instead of Telegram for MVP, or a different payment provider), we can adjust this document and then proceed.
