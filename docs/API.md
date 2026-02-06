# API Design — CAS Office

Contract for all HTTP endpoints. Request/response shapes use the shared types from `lib/types`. All JSON; `Content-Type: application/json` unless noted.

---

## Conventions

- **Base URL:** Same origin (e.g. `/api/...`) when called from the frontend.
- **Auth:** Public endpoints require no auth. Admin endpoints require valid session (Supabase Auth); use `Authorization: Bearer <access_token>` or cookie-based session.
- **Errors:** Non-2xx responses return a JSON body with a consistent shape (see [Error shape](#error-shape)).
- **Ids:** All IDs are UUIDs (strings). Dates/times in ISO 8601 (UTC): `YYYY-MM-DD`, `YYYY-MM-DDTHH:mm:ss.sssZ`.
- **Idempotency:** `POST /api/booking` creates a new appointment and a new Stripe Checkout Session each time. Idempotency key can be added later if needed (e.g. for retries).

---

## Error shape

All error responses (4xx, 5xx) should follow:

```ts
{
  error: string;        // Machine-readable code (e.g. "SLOT_UNAVAILABLE")
  message: string;      // Human-readable message
  details?: unknown;    // Optional extra (e.g. validation errors)
}
```

**HTTP status:**

- `400` — Bad request (validation, business rule)
- `401` — Unauthorized (admin only)
- `403` — Forbidden
- `404` — Not found
- `409` — Conflict (e.g. slot taken)
- `500` — Server error

---

## Public endpoints

### 1. List services

**GET** `/api/services`

Returns active services for the booking flow and marketing.

**Query:** None.

**Response:** `200 OK`

```ts
{
  services: Service[];
}
```

`Service` shape: see `lib/types/service.ts` (id, name, nameEn?, description?, descriptionEn?, durationMinutes, priceCents, currency, active, sortOrder; no stripe_price_id in public response if you want to hide it).

---

### 2. Get one service

**GET** `/api/services/[id]`

**Params:** `id` — service UUID.

**Response:** `200 OK` — `{ service: Service }`  
**Response:** `404` — service not found or inactive.

---

### 3. Get available slots

**GET** `/api/slots`

Returns available time windows for a given date and service (computed from staff availability minus blocked dates and existing appointments).

**Query:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `date` | string | Yes | `YYYY-MM-DD` (interpreted in office timezone) |
| `serviceId` | string | Yes | Service UUID |

**Response:** `200 OK`

```ts
{
  slots: Array<{
    startAt: string;   // ISO 8601 UTC
    endAt: string;     // ISO 8601 UTC
    staffId?: string;  // Optional; omit for “office” slots (any lawyer)
  }>;
}
```

**Errors:**  
- `400` — invalid date or serviceId.  
- `404` — service not found.

---

### 4. Create booking (start payment flow)

**POST** `/api/booking`

Creates an appointment in `pending_payment` and returns a Stripe Checkout URL. Client is redirected to Stripe; on success, webhook confirms the appointment and creates the video room.

**Body:**

```ts
{
  serviceId: string;
  startAt: string;       // ISO 8601 UTC; must match a slot from GET /api/slots
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  clientMessage?: string;
}
```

**Response:** `201 Created`

```ts
{
  appointmentId: string;
  checkoutUrl: string;   // Redirect client here (Stripe Checkout)
}
```

**Errors:**  
- `400` — validation (missing/invalid fields).  
- `404` — service not found.  
- `409` — slot no longer available (e.g. taken in the meantime).

---

### 5. Booking success / confirmation (post-payment)

**GET** `/api/booking/confirm`

Called after Stripe redirect with `?session_id=cs_xxx`. Verifies session, returns appointment summary (and video link) for the confirmation page. Optional: only allow one successful read per session to avoid leaking links.

**Query:** `session_id` — Stripe Checkout Session ID.

**Response:** `200 OK`

```ts
{
  appointment: {
    id: string;
    serviceName: string;
    requestedStartAt: string;
    durationMinutes: number;
    videoRoomUrl: string | null;  // Present if payment already processed by webhook
    status: AppointmentStatus;
  };
}
```

**Errors:**  
- `400` — missing or invalid session_id.  
- `404` — session or appointment not found.

---

### 6. Stripe webhook

**POST** `/api/webhooks/stripe`

Stripe sends events here. Verify signature with `STRIPE_WEBHOOK_SECRET`. Handle at least:

- `checkout.session.completed` → confirm appointment (status → `confirmed`), create video room, send client confirmation email, notify lawyer (dashboard + Telegram/WhatsApp).

**Body:** Raw Stripe event (Stripe signature in header).

**Response:** `200 OK` — always return 200 after processing (or after ignoring unknown event types) so Stripe does not retry. Return 4xx only for invalid signature.

---

## Admin endpoints (protected)

All under `/api/admin/*`. Require authenticated staff (Supabase Auth); middleware checks session and optionally role.

### 7. List appointments

**GET** `/api/admin/appointments`

**Query:**

| Param | Type | Description |
|-------|------|-------------|
| `from` | string | Optional; `YYYY-MM-DD` (inclusive) |
| `to` | string | Optional; `YYYY-MM-DD` (inclusive) |
| `status` | string | Optional; filter by AppointmentStatus |
| `staffId` | string | Optional; filter by assigned lawyer |

**Response:** `200 OK`

```ts
{
  appointments: Appointment[];
}
```

Paginate later with `limit`/`offset` or cursor if needed.

---

### 8. Get one appointment

**GET** `/api/admin/appointments/[id]`

**Params:** `id` — appointment UUID.

**Response:** `200 OK` — `{ appointment: Appointment }`  
**Response:** `404` — not found.

---

### 9. Update appointment (assign staff, cancel, etc.)

**PATCH** `/api/admin/appointments/[id]`

**Params:** `id` — appointment UUID.

**Body:** Partial update; only allowed fields.

```ts
{
  assignedStaffId?: string | null;
  status?: AppointmentStatus;
}
```

**Response:** `200 OK` — `{ appointment: Appointment }`  
**Errors:** `400` (validation), `404` (not found).

---

## Summary table

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/services | Public | List active services |
| GET | /api/services/[id] | Public | Get one service |
| GET | /api/slots | Public | Available slots (date + serviceId) |
| POST | /api/booking | Public | Create booking, return Stripe Checkout URL |
| GET | /api/booking/confirm | Public | Post-payment confirmation (session_id) |
| POST | /api/webhooks/stripe | Stripe | Webhook handler |
| GET | /api/admin/appointments | Staff | List appointments |
| GET | /api/admin/appointments/[id] | Staff | Get one appointment |
| PATCH | /api/admin/appointments/[id] | Staff | Update appointment |

All response shapes reference `lib/types`. Implementations must return exactly these shapes (or document any deviation).
