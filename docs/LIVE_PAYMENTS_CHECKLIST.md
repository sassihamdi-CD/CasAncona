# Live payments checklist — real money, no problems

This explains why you sometimes see **pending_payment** after paying, and exactly what must be in place so **real client payments** on the live site always confirm the booking and never lose money or leave the client without confirmation.

---

## Why does it stay "pending_payment" after I paid with the test card?

**Short answer:** The booking is only moved from `pending_payment` to `confirmed` when Stripe calls your **webhook**. That call often never reaches your machine when you test locally.

| Where you pay | What happens |
|---------------|--------------|
| **On localhost** | You pay → Stripe redirects you to the confirmation page. Stripe also tries to send a webhook to your server. Stripe **cannot** call `http://localhost`. So the webhook never runs → the appointment stays `pending_payment`. **This is normal when testing locally.** |
| **On live site (production)** | Client pays → Stripe redirects them to the confirmation page. Stripe sends the webhook to **your live URL** (e.g. `https://cas-ancona.vercel.app/api/webhooks/stripe`). If the webhook is set up correctly, your server receives it, confirms the appointment, creates the video link, sends email/Telegram. **The appointment becomes `confirmed`.** |

So: **test cards are not “fake” for the flow** — Stripe treats them as successful payments. The only difference is **where** the webhook is sent. Locally, without Stripe CLI forwarding, the webhook never hits your app, so status stays pending. On the live site, with a live webhook configured, it will confirm.

---

## What must be true on the LIVE site (real client money)

Use this checklist. If any item is wrong, a real payment can succeed in Stripe but the booking can stay `pending_payment` and the client may not get confirmation or video link.

### 1. Stripe is in **Live** mode for production

- In Stripe Dashboard, switch to **Live** (toggle top right).
- Production must use **live** keys and a **live** webhook (see below). Do not use test keys or test webhook secret on the live site.

### 2. Live API keys in Vercel (production env)

In Vercel → Project → Settings → Environment variables (Production):

| Variable | Value | Check |
|----------|--------|--------|
| `STRIPE_SECRET_KEY` | `sk_live_...` | From Stripe Dashboard → Developers → API keys (Live) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | Same page (Live) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | From the **live** webhook (step 3), **not** the test one |

If `STRIPE_WEBHOOK_SECRET` is missing or is the **test** webhook secret, the webhook will fail signature verification and the appointment will never be confirmed.

### 3. Live webhook in Stripe (Live mode)

- Stripe Dashboard → switch to **Live** → **Developers** → **Webhooks**.
- **Add endpoint** (or use existing one that points to your live site):
  - **Endpoint URL:** `https://YOUR-LIVE-DOMAIN.com/api/webhooks/stripe`  
    (e.g. `https://cas-ancona.vercel.app/api/webhooks/stripe`)
  - **Events:** select **`checkout.session.completed`** only.
- After saving, open the endpoint → **Signing secret** → **Reveal** → copy the `whsec_...` value.
- That value must be the one in Vercel as `STRIPE_WEBHOOK_SECRET` (see step 2).

Stripe will send **only** to this URL when a **live** payment completes. Test-mode payments use a different webhook (or CLI), so the live webhook is only for real money.

### 4. Redeploy after changing env

After you add or change any of the three variables above in Vercel, trigger a **redeploy** so the new values are used. Old deployments keep the old env until redeployed.

### 5. Same database for booking and webhook

The app that receives the webhook (e.g. Vercel) must use the **same** Supabase project as the one used when the client booked. So in Vercel you must have:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

pointing to the production Supabase project. Otherwise the webhook updates the wrong DB (or fails) and the booking stays pending.

---

## Flow on the live site (real payment)

1. Client fills the form and pays with a **real** card on Stripe Checkout.
2. Stripe charges the card and redirects the client to your confirmation page (`?session_id=...`).
3. Stripe sends a **POST** request to `https://YOUR-LIVE-DOMAIN.com/api/webhooks/stripe` with event `checkout.session.completed`.
4. Your webhook handler (same code for test and live):
   - Verifies the signature with `STRIPE_WEBHOOK_SECRET`.
   - Reads `appointment_id` from the session metadata.
   - Updates that appointment to `status = confirmed`, sets `amount_paid_cents`, and (for online) creates the video room and saves the link.
   - Sends confirmation email (if Brevo is configured) and Telegram to the lawyer (if configured).
5. The client already sees the confirmation page; the admin and client see the booking as **confirmed** and (for online) with video link.

If step 3 or 4 fails (wrong URL, wrong secret, wrong DB, or code error), the appointment can stay `pending_payment` even though Stripe has the money. So the checklist above is critical.

---

## How to verify before going live

1. **Checklist** – Go through every item in the “What must be true on the LIVE site” section.
2. **Stripe Dashboard (Live)** – Webhooks → your endpoint → recent events. After a real test payment you should see `checkout.session.completed` with response 200. If you see 400/500, fix the URL, secret, or code.
3. **Vercel logs** – After a real payment, check the function logs for the webhook request. The handler logs errors (e.g. signature failure, appointment not found); success returns 200 and updates the row.
4. **One real test** – Do **one** small real payment (e.g. 1 €) on the live site, then:
   - In Stripe (Live): payment appears.
   - In your admin: the appointment is **confirmed** and (for online) has a video link.
   - Client receives confirmation (email if configured) and can open the confirmation page and video link.

---

## Summary

| Question | Answer |
|----------|--------|
| Why does my test payment stay pending locally? | Stripe cannot call localhost; the webhook never runs, so the app never confirms the booking. Normal for local testing. |
| Are test cards treated differently by our code? | No. Same code path. Only the webhook URL and secret differ (test vs live). |
| Will real payments confirm on the live site? | Yes, **if** the live webhook URL is correct, `STRIPE_WEBHOOK_SECRET` in Vercel is the **live** webhook signing secret, and the same Supabase project is used for booking and webhook. |
| What if we break something? | The webhook is the only place that moves a booking from pending to confirmed. Do not disable or change the webhook handler without testing; use this checklist and one small real payment before relying on it for real clients. |

Real client money is only safe if the checklist is correct and you verify once on the live site with a real payment.
