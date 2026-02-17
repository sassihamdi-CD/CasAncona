# Weekend-ready checklist

Use this list to get the site **fully functional** by the weekend. Order matters.

---

## ✅ Already done (code)

- Database schema + migrations (Supabase)
- Services in 4 languages (IT, EN, AR, FR) — cards and booking
- Booking flow: service → type (in person / online) → date → slot → form → submit
- In-person: free, instant confirmation + **confirmation email** (if Brevo is set)
- Online: Stripe Checkout → webhook confirms appointment, creates **Jitsi** video link, sends **email** + **Telegram**
- **Email:** Brevo implemented in `lib/notifications` (set `BREVO_API_KEY` + `EMAIL_FROM`)
- **Telegram:** Implemented in `lib/notifications` (set `TELEGRAM_BOT_TOKEN`; store `telegram_chat_id` on staff row)
- **Admin:** `/admin` — enter admin key, see next 14 days appointments and **open video** links

---

## 1. Environment (do first)

In `.env` you must have:

| Variable | Where to get it |
|----------|------------------|
| `NEXT_PUBLIC_APP_URL` | Your site URL (e.g. `https://yourdomain.com` or `http://localhost:3000`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role key |
| `OFFICE_TIMEZONE` | `Europe/Rome` (for slots) |

**Check:** `npm run verify-db` — should print "Database OK" and list services.

---

## 2. Stripe (online paid bookings)

| Variable | Where |
|----------|--------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → Developers → API keys |
| `STRIPE_SECRET_KEY` | Same page (secret key) |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Developers → Webhooks → Add endpoint → `https://yourdomain.com/api/webhooks/stripe` → event `checkout.session.completed` → copy signing secret |

**Local dev:** Run `stripe listen --forward-to localhost:3000/api/webhooks/stripe` and use the printed webhook secret in `.env`.

**Check:** Book an **online** consultation, pay with test card `4242 4242 4242 4242`, land on confirmation page and see video link.

---

## 3. Email (Brevo)

| Variable | Where |
|----------|--------|
| `BREVO_API_KEY` | brevo.com → SMTP & API → API Keys (transactional key, not MCP) |
| `EMAIL_FROM` | Verified sender address (e.g. `noreply@yourdomain.com`) — must be registered in Brevo |

**Check:** After a booking (in-person or online), the client receives the confirmation email.

---

## 4. Telegram (lawyer notification)

| Variable | Where |
|----------|--------|
| `TELEGRAM_BOT_TOKEN` | @BotFather on Telegram → /newbot → copy token |

Then get the lawyer’s **chat ID** (message the bot, then open `https://api.telegram.org/bot<TOKEN>/getUpdates`) and put it in Supabase: table `staff` → column `telegram_chat_id` for the right staff row.

**Check:** After a paid (online) booking, the lawyer gets a Telegram message with client and video link.

---

## 5. Admin

| Variable | Where |
|----------|--------|
| `ADMIN_API_KEY` | Choose a long random string (e.g. `openssl rand -hex 24`) and put it in `.env`. **Do not** commit it. |

**Check:** Open `/admin`, enter the same key, click “Carica”. You should see appointments and “Apri video” for confirmed online ones.

---

## 6. Production

- Deploy the app (Vercel, etc.) and set all env vars in the dashboard.
- Point Stripe webhook to `https://yourdomain.com/api/webhooks/stripe`.
- Set `NEXT_PUBLIC_APP_URL` to your real domain.

---

## Quick env summary

```
# Required for booking + DB
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
OFFICE_TIMEZONE=Europe/Rome

# Online payments
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Email (Brevo)
BREVO_API_KEY=
EMAIL_FROM=
EMAIL_FROM_NAME=Studio CAS

# Telegram (optional)
TELEGRAM_BOT_TOKEN=

# Admin (optional but recommended)
ADMIN_API_KEY=
```

Video = **Jitsi** (free, no config). No extra env for video.
