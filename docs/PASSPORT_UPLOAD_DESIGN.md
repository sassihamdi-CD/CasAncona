# System design: Passport (first page) upload in booking

## Goal

During the booking process, collect **one photo of the first page of the client’s passport**, store it securely, and make it available to staff in the admin dashboard. All work is based on this document, so it is **mandatory** for every booking.

---

## 1. User flow (booking)

- **Where:** Same step as today’s “I tuoi dati” (name, email, phone, reason). Add one **required** field: “Photo of passport first page”.
- **Behaviour:**
  - User selects **one file** (photo or scan): image (JPEG, PNG) or PDF.
  - Max size: **5 MB**.
  - Optional: show file name and a small preview/icon after selection; clear “Required” if missing.
- **Submit:** One action: “Conferma e continua” sends **all form data + the file** in a single request. No separate “upload passport” step.
- **After submit:** Same as today: redirect to Stripe Checkout (or confirmation if no payment). No change to payment or confirmation flow.

---

## 2. Storage (where the file lives)

- **Provider:** **Supabase Storage** (same project as the rest of the app).
- **Bucket:** `passport-documents` (private; no public read).
- **Path:** `{appointment_id}/passport.{ext}`  
  Example: `a1b2c3d4-.../passport.jpg`.  
  One file per appointment; overwrite if we ever allow “replace”.
- **Access:** Only **service role** (backend) can upload and generate read URLs. No public URL. No direct client access to the bucket.

---

## 3. Database

- **Table:** `appointments`.
- **New column:** `passport_document_path` (type `text`, nullable).
  - Stores the **Storage path** used for this appointment, e.g. `{appointment_id}/passport.jpg`.
  - `NULL` = no document (e.g. legacy appointments, or if we later make it optional for some services).
- **When set:** Immediately after creating the appointment and uploading the file (see API below).

---

## 4. API design

### 4.1 Booking (create appointment + upload passport)

- **Endpoint:** `POST /api/booking` (same as today; body format changes).
- **Body:** **Multipart form data** (not JSON), so we can send the file in the same request.

  **Fields (same as today, as form fields):**

  - `serviceId`, `consultationType`, `startAt`, `clientName`, `clientEmail`, `clientPhone`, `clientMessage`, `locale`

  **New field:**

  - `passport`: **file** (required). Accepted types: `image/jpeg`, `image/png`, `application/pdf`. Max size: 5 MB.

- **Server flow:**

  1. Parse multipart body; validate all fields and file (type, size, required).
  2. Check slot availability (same logic as today).
  3. **Insert** appointment row (get `appointment_id`). Do **not** set `passport_document_path` yet.
  4. Upload file to Supabase Storage: path = `{appointment_id}/passport.{ext}` (ext from file).
  5. **Update** same appointment row: set `passport_document_path = '{appointment_id}/passport.{ext}'`.
  6. Create Stripe Checkout session (same as today); return `checkoutUrl` (and optional `appointmentId`).

- **Errors:**

  - Missing/invalid file → 400 with clear message (e.g. “Passport photo is required (image or PDF, max 5 MB)”).
  - Slot no longer available → 409 (same as today). Optionally: if we already created the row, we could mark it cancelled or leave it for admin; for simplicity we can fail before insert if slot check fails, so no orphan row.
  - Upload or DB update failure after insert → log, return 500; admin can see appointment without document and follow up.

---

### 4.2 Admin: view passport

- **Endpoint:** `GET /api/admin/appointments/[id]/passport-url` (or similar).
- **Auth:** Admin only (same as other `/api/admin/*`).
- **Behaviour:**  
  - Load appointment; check `passport_document_path`.  
  - If null → 404.  
  - Else create a **signed URL** for that path in bucket `passport-documents` (short expiry, e.g. 60 seconds).  
  - Return `{ url: "https://..." }`.  
- **Frontend:** Admin clicks “View passport” → call this API → open returned URL in new tab. No direct Storage URL in client.

---

## 5. Frontend (booking form)

- **Component:** In `BookingFlow`, step “I tuoi dati”:
  - Add state for the selected file (e.g. `passportFile: File | null`).
  - Add an input: `type="file"` with `accept="image/jpeg,image/png,application/pdf"`. Label and hint: e.g. “Photo of passport first page (required). Image or PDF, max 5 MB.”
  - Before submit: validate that a file is selected, and optionally size/type in the client (to give immediate feedback).
  - On submit: build `FormData`, append all current fields (same names as today) plus `passport` = file.  
  - Send `POST /api/booking` with `Content-Type: multipart/form-data` (browser sets it when using FormData).
- **API client:** Replace JSON `createBooking(body)` with a function that accepts FormData and posts it to `/api/booking` (no `Content-Type` header so browser sets boundary).

---

## 6. Admin dashboard

- **Appointments list:** Add a column or cell “Passport”. If `passport_document_path` is set, show a link/button “View passport” that calls `GET /api/admin/appointments/[id]/passport-url` and opens the URL in a new tab. If not set, show “—” or “Not uploaded”.
- **Optional:** Dedicated “Appointment detail” page later with same “View passport” action.

---

## 7. Security and privacy

- **Storage:** Bucket private; only backend (service role) reads/writes. Signed URLs for viewing only.
- **Transit:** HTTPS only (same as rest of site).
- **Access:** Only authenticated admin can request a passport URL; check appointment exists and admin is allowed.
- **GDPR:** Mention in privacy policy that we store passport first-page image for the purpose of the consultation; retention as per your policy (e.g. until end of case or X years). Deletion: can add later (e.g. “Delete document” in admin or scheduled job for old/cancelled appointments).

---

## 8. Implementation order

1. **DB:** Migration adding `passport_document_path` to `appointments`; update Supabase types and any maps. ✅
2. **Storage:** Create bucket `passport-documents` in Supabase (Dashboard or SQL), private. See **docs/STORAGE_PASSPORT_BUCKET.md**.
3. **API booking:** Change `POST /api/booking` to accept multipart; create appointment → upload file → update path → Stripe → response.
4. **Booking UI:** Add file input and FormData submit in `BookingFlow`.
5. **Admin:** API to get signed passport URL; “View passport” in appointments list (and detail if exists).
6. **i18n:** Copy/labels for “Passport first page”, “View passport”, errors (required, type, size).

---

## 9. Edge cases

- **User selects file then changes slot:** No problem; we validate slot at submit time; file is sent with the final slot.
- **Stripe fails after upload:** Appointment and document exist; admin can see both; payment can be retried or handled manually.
- **Very large file:** Rejected by size limit (5 MB) on client and server.
- **Wrong file type:** Rejected with clear message (image or PDF only).

---

## 10. Summary

| Item | Choice |
|------|--------|
| When | During booking, step “I tuoi dati”, required field |
| Format | Multipart form: same fields + file `passport` |
| Storage | Supabase Storage, bucket `passport-documents`, path `{id}/passport.{ext}` |
| DB | `appointments.passport_document_path` (text) |
| Admin | “View passport” → API returns signed URL → open in new tab |
| Validation | Required, image/PDF, max 5 MB |

This keeps the flow simple (one step, one submit), uses your existing stack (Supabase, same DB and auth), and keeps documents private and professional.
