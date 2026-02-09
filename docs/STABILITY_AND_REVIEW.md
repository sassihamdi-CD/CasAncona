# Project stability and review

Quick reference for what keeps the site stable and what to check in production.

---

## What was reviewed and hardened

### 1. Stripe webhook (`/api/webhooks/stripe`)
- **STRIPE_SECRET_KEY** is now checked before use; if missing, returns 500 with a clear message (so you fix env instead of cryptic Stripe errors).
- **Top-level try/catch** wraps the whole handler: any unexpected error returns 500 so Stripe can retry; the failure is logged.
- **Telegram** is called inside a try/catch: if Telegram fails (e.g. network), the webhook still returns 200 and the appointment stays confirmed. Email already had internal try/catch.

### 2. Admin PATCH appointment (record payment)
- **Telegram** when recording in-person payment is in a try/catch: if Telegram fails, the API still returns 200 with the updated appointment. The payment is saved; only the notification might be missing (you can resend or tell the lawyer manually).

### 3. Other critical paths (already in good shape)
- **Booking API**: try/catch, validation, conflict handling, graceful fallback when Stripe is not configured (dev_no_stripe).
- **Confirm / retrieve**: try/catch, proper 4xx/5xx responses.
- **Slots API**: try/catch, input validation.
- **Notifications**: Email and Telegram have internal try/catch and never throw to the caller.
- **Supabase**: `getSupabaseAdmin()` throws if env is missing (fail fast); API routes that use it have try/catch and return serverError().

---

## Env vars that can bring the site down if missing

| Env var | Where it’s critical | Effect if missing |
|--------|----------------------|-------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | All DB and Storage | Server throws in API routes / server components that use Supabase. |
| `SUPABASE_SERVICE_ROLE_KEY` | Same as above | Same. |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook | Webhook returns 500; payments are not confirmed. |
| `STRIPE_SECRET_KEY` | Webhook + booking | Webhook returns 500 if missing; booking uses dev fallback. |

Optional (degraded but no crash): `TELEGRAM_BOT_TOKEN`, `RESEND_API_KEY`, `ADMIN_API_KEY`, `ADMIN_SESSION_SECRET`. The app skips Telegram/email or allows all admin access when not set.

---

## Checklist before / after go-live

- [ ] **Vercel**: All required env vars set (Supabase, Stripe, webhook secret, optional: Telegram, Resend, admin).
- [ ] **Stripe**: Webhook URL points to `https://yourdomain.com/api/webhooks/stripe`; endpoint returns 200 on success.
- [ ] **Supabase**: Passport bucket exists and RLS/policies allow uploads and admin reads (see `CREATE_PASSPORT_BUCKET.sql`).
- [ ] **Admin**: Test login, create appointment, record payment, print receipt, Telegram page (fetch chat IDs and link to staff).
- [ ] **Public**: Test book flow (service → date → slot → form + passport → redirect to Stripe or confirm). Test “Recupera prenotazione” with client email.

---

## If something breaks

1. **Vercel logs**: Deployment → Functions → select the failing route → check logs.
2. **Stripe**: Dashboard → Developers → Webhooks → your endpoint → “Recent deliveries” for payload and response.
3. **Supabase**: Logs and Database for failed queries or RLS.
4. **Telegram/email**: Notifications are best-effort; if they fail, the main flow (booking confirmed, payment saved) is still correct. Check env and external service status.
