# Data Model — CAS Office

Single source of truth for entities, relations, and conventions. All backend (Supabase) and shared TypeScript types must stay in sync with this document.

---

## Conventions

- **IDs:** UUID v4 for all primary keys (`id`). Expose only UUIDs to clients; no sequential IDs in URLs.
- **Timestamps:** Every table has `created_at` and `updated_at` (timestamptz). Use `updated_at` for optimistic locking or cache invalidation where needed.
- **Soft delete:** Not used in MVP. Use status flags (e.g. `cancelled`) or a future `deleted_at` if required later.
- **Naming:** `snake_case` in DB and in API JSON for consistency; TypeScript types use `camelCase` in code, with mapping at the API boundary if needed.
- **Currency:** Amounts stored in **cents** (integer) to avoid floating point. Currency code (e.g. `EUR`) stored alongside.

---

## Entity Relationship Overview

```
services (catalog of legal services + price)
    │
    ├── staff_availability (recurring weekly hours per lawyer)
    ├── staff_blocked_dates (holidays / absences)
    │
    └── appointments (bookings)
            ├── service_id → services
            ├── assigned_staff_id → staff (nullable until assigned)
            └── video room url/id on appointment row
```

---

## Tables

### 1. `services`

Legal services offered (e.g. "Prima consulenza immigrazione", "Rinnovo permesso").

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK, default gen_random_uuid() | |
| `name` | text | NOT NULL | Display name (Italian) |
| `name_en` | text | | Optional English name |
| `description` | text | | Short description (Italian) |
| `description_en` | text | | Optional English description |
| `duration_minutes` | int | NOT NULL, > 0 | Consultation length |
| `price_cents` | int | NOT NULL, >= 0 | Price in cents (e.g. 8000 = €80) |
| `currency` | text | NOT NULL, default 'EUR' | ISO 4217 |
| `stripe_price_id` | text | | Stripe Price ID for Checkout (optional until Stripe is set up) |
| `active` | boolean | NOT NULL, default true | If false, hidden from booking |
| `sort_order` | int | NOT NULL, default 0 | Order on services list (lower = first) |
| `created_at` | timestamptz | NOT NULL, default now() | |
| `updated_at` | timestamptz | NOT NULL, default now() | |

**Indexes:** `(active)`, `(sort_order)` for listing.

---

### 2. `staff`

Lawyers and admins. Used for availability, assignment to appointments, and notifications (Telegram/WhatsApp).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK, default gen_random_uuid() | |
| `auth_user_id` | uuid | UNIQUE, FK → auth.users(id) | Supabase Auth user; nullable if staff added before auth |
| `name` | text | NOT NULL | Full name |
| `email` | text | NOT NULL, UNIQUE | Login + notifications |
| `telegram_chat_id` | text | | For Telegram bot notifications |
| `whatsapp_phone` | text | | E.164 if using WhatsApp later |
| `role` | text | NOT NULL, check (role in ('admin','lawyer')) | |
| `active` | boolean | NOT NULL, default true | If false, excluded from assignment |
| `created_at` | timestamptz | NOT NULL, default now() | |
| `updated_at` | timestamptz | NOT NULL, default now() | |

**Indexes:** `(email)`, `(role)`, `(active)`.

**RLS:** Only staff (and admins) can read/update staff. Public cannot see staff table.

---

### 3. `staff_availability`

Recurring weekly availability per lawyer (e.g. Mon 09:00–13:00, Tue 14:00–18:00).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK, default gen_random_uuid() | |
| `staff_id` | uuid | NOT NULL, FK → staff(id) ON DELETE CASCADE | |
| `day_of_week` | int | NOT NULL, 0–6 | 0 = Sunday, 1 = Monday, … 6 = Saturday |
| `start_time` | time | NOT NULL | Local time (office timezone) |
| `end_time` | time | NOT NULL, > start_time | Local time |
| `created_at` | timestamptz | NOT NULL, default now() | |

**Unique:** `(staff_id, day_of_week, start_time)` to avoid duplicate windows. One row per contiguous window per day (e.g. two rows for same day = morning and afternoon).

**Indexes:** `(staff_id)`, `(staff_id, day_of_week)` for slot computation.

---

### 4. `staff_blocked_dates`

Dates when a lawyer is unavailable (holiday, absence). No slots offered on these dates for that staff.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK, default gen_random_uuid() | |
| `staff_id` | uuid | NOT NULL, FK → staff(id) ON DELETE CASCADE | |
| `date` | date | NOT NULL | |
| `reason` | text | | Optional note |
| `created_at` | timestamptz | NOT NULL, default now() | |

**Unique:** `(staff_id, date)`.

**Indexes:** `(staff_id)`, `(staff_id, date)`.

---

### 5. `appointments`

A single booked consultation (client + service + slot). **Two booking types:**

- **In person** — at the physical office, **free**. No payment; appointment is confirmed immediately.
- **Online** — video consultation, **paid**. Client pays after choosing date/time; then video room and lawyer notification.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK, default gen_random_uuid() | |
| `service_id` | uuid | NOT NULL, FK → services(id) | |
| `consultation_type` | text | NOT NULL, check in ('in_person','online') | In person = free; online = paid + video |
| `assigned_staff_id` | uuid | FK → staff(id) | Set on booking or later (round‑robin / manual) |
| `client_name` | text | NOT NULL | |
| `client_email` | text | NOT NULL | |
| `client_phone` | text | | Optional |
| `client_message` | text | | Optional note from client |
| `requested_start_at` | timestamptz | NOT NULL | Chosen slot start (store in UTC) |
| `duration_minutes` | int | NOT NULL | Copied from service at booking time |
| `status` | text | NOT NULL, see enum below | |
| `stripe_session_id` | text | UNIQUE | Stripe Checkout Session ID (online only; set when redirecting to payment) |
| `stripe_payment_intent_id` | text | | Optional; for disputes |
| `amount_paid_cents` | int | | Set when payment succeeds |
| `currency` | text | | Set when payment succeeds |
| `video_room_id` | text | | Daily.co / Whereby room ID |
| `video_room_url` | text | | Link for client and lawyer |
| `created_at` | timestamptz | NOT NULL, default now() | |
| `updated_at` | timestamptz | NOT NULL, default now() | |

**Appointment status enum:**

| Value | Meaning |
|-------|---------|
| `pending_payment` | Created; client not yet paid (Stripe Checkout in progress or abandoned) |
| `confirmed` | Paid; video room created; lawyer notified |
| `completed` | Consultation took place (manual or automatic) |
| `cancelled` | Cancelled (refund handled outside this model if needed) |
| `no_show` | Client did not attend (manual) |

**Indexes:** `(service_id)`, `(assigned_staff_id)`, `(status)`, `(requested_start_at)`, `(stripe_session_id)`, `(client_email)` (for “my appointments” lookup if we add it).

**RLS:**  
- Public: no direct read/write. Booking is done via API that creates row with `pending_payment`.  
- Confirmation page: access by short token (e.g. in URL) or by `stripe_session_id` once only.  
- Staff: read all appointments; update allowed for assigned staff or admin (e.g. status, assign lawyer).

---

## Slot computation (no separate table)

**Available slots** for a given `date` and `service_id` are computed in the API:

1. Get `duration_minutes` from `services`.
2. Find staff who:
   - Have `staff_availability` for that weekday and time range,
   - Have no `staff_blocked_dates` for that date,
   - Are `active`.
3. For each such staff, generate time windows (e.g. every 30 min) within their availability.
4. Remove windows that overlap existing `appointments` for that staff with status in `('confirmed','pending_payment')` (and optionally `completed` if we block past slots).
5. Return aggregated list (e.g. by start time, optionally with or without `staff_id`). For MVP we can return “office” slots (any available lawyer) and assign staff on booking (e.g. round‑robin or first available).

**Timezone:** Store `requested_start_at` in UTC. Use a configurable office timezone (e.g. `Europe/Rome`) for displaying and generating slots.

---

## Future extensions (out of scope for Phase 1)

- **notification_log:** Audit of sent emails/Telegram/WhatsApp (appointment_id, channel, recipient, sent_at, status).
- **client_accounts:** Optional auth for clients to see “my appointments”; link by email.
- **recurring_availability_exceptions:** Override specific dates without adding a full blocked date.

---

## Summary for TypeScript

- **Enums:** `AppointmentStatus`, `ConsultationType`, `StaffRole` (and optionally `DayOfWeek`).
- **Entities:** `Service`, `Staff`, `StaffAvailability`, `StaffBlockedDate`, `Appointment`.
- **Computed:** `Slot` or `AvailableSlot` (startAt, endAt, staffId?) — not stored; returned by API only.

All shared types live in `lib/types/` and are exported from `lib/types/index.ts`.
