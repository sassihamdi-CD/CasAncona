# Implementation Plan — Step by Step

We build in this order so the frontend always has a **clear contract** (data model + API) to work against. No guesswork, no rework.

---

## Recommended order

| Phase | What | Why first |
|-------|------|-----------|
| **1** | **Data model + API design** | Single source of truth: tables, types, endpoints. Frontend and backend both follow this. |
| **2** | **Backend implementation** | Supabase schema, API routes, Stripe webhook skeleton. Real backend to integrate with. |
| **3** | **Frontend structure** | App routes, layout, shared components. Then pages that call the API. |
| **4** | **Features end-to-end** | Booking flow, payment, video link, notifications — each wired to real backend. |

---

## Phase 1 — Data model + API design

**Goal:** Define *what* we store and *what* the frontend can call. No UI yet.

**Deliverables:**

1. **Data model (document + TypeScript types)**
   - Entities: `services`, `appointments`, `slots` (or availability), `staff` (lawyers), `video_sessions`, etc.
   - Fields, relations, and any enums (e.g. appointment status: `pending_payment`, `confirmed`, `completed`, `cancelled`).

2. **API surface (document)**
   - List of endpoints (e.g. `GET /api/services`, `GET /api/slots?date=...&serviceId=...`, `POST /api/booking`, Stripe webhook `POST /api/webhooks/stripe`).
   - Request/response shapes (or “see data model”).

3. **Shared types** in the repo (e.g. `types/` or `lib/types/`) so both API routes and frontend can import the same interfaces.

**Outcome:** One document (or file) that describes the “contract”. Backend and frontend can be implemented in parallel later if needed.

**Phase 1 deliverables (done):**
- `docs/DATA_MODEL.md` — entities, tables, relations, enums, slot computation, RLS notes
- `docs/API.md` — endpoints, methods, request/response shapes, error shape
- `lib/types/` — shared TypeScript types (enums, entities, API DTOs); single import from `lib/types`

---

## Phase 2 — Backend implementation

**Goal:** Make the data model and API real.

**Deliverables:**

1. **Supabase**
   - Create project (EU region).
   - Tables matching the data model; RLS policies for staff vs public.

2. **API routes (Next.js)**
   - Implement the planned endpoints (services, slots, booking creation, etc.).
   - Stripe webhook: receive `checkout.session.completed`, confirm appointment, create video room, trigger notifications (stub or real Telegram later).

3. **Integrations (minimal for now)**
   - Stripe: create Checkout Session, verify webhook signature.
   - Video (Daily.co or Whereby): create room and store link on appointment.
   - Notifications: stub “send to lawyer” (e.g. log or DB flag); replace with Telegram/WhatsApp in a later step.

**Outcome:** Working backend. Frontend can call real APIs and complete a booking → payment → confirmation flow.

---

## Phase 3 — Frontend structure

**Goal:** Clear app structure and reusable building blocks.

**Deliverables:**

1. **App routes and layout**
   - `(marketing)/`: home, services, about, contact.
   - `book/`: booking flow (steps: service → date/time → form → redirect to Stripe).
   - `video/`: video consultation entry (client + lawyer link).
   - `admin/`: staff dashboard (auth-protected).

2. **Shared components**
   - Header, footer, buttons, form inputs, cards.
   - Layouts for marketing vs booking vs admin.

3. **API client**
   - Small `lib/api.ts` (or similar) that calls our API routes; use shared types from Phase 1.

**Outcome:** Navigable shell and components. Pages can be filled with real data and flows in Phase 4.

---

## Phase 4 — Features end-to-end

**Goal:** Complete user and staff flows.

**Deliverables:**

1. **Marketing + services**
   - Home page, services list (with prices), about, contact.

2. **Booking + payment**
   - Select service → pick slot → form → Stripe Checkout → success/cancel pages.
   - Confirmation email (Resend/SendGrid).

3. **Video**
   - Client: link in email and/or “My appointment” page.
   - Staff: video link in dashboard.

4. **Staff dashboard**
   - List upcoming consultations; open video link; optional filters.

5. **Lawyer notifications**
   - Telegram (or WhatsApp) bot: on new paid booking, send lawyer a message with details and video link.

**Outcome:** Full flow live: book → pay → confirm → video link → lawyer notified.

---

## What we do next

**Start with Phase 1:** data model + API design + shared types.

After Phase 1 we can either:
- **Continue to Phase 2** (backend implementation), or  
- **Do Phase 3** (frontend structure) and use mock data until the backend is ready.

If you confirm, the next step is to add the Phase 1 deliverables (data model doc, TypeScript types, API surface) to the repo.
