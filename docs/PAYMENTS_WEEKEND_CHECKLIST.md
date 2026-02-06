# Payments – weekend checklist (no new code)

**You do not need to build a payment panel.** The site already uses **Stripe Checkout**: when a user books an **online** consultation and clicks pay, they are sent to Stripe’s hosted payment page, then back to your confirmation page.

---

## What’s already done

| Piece | Status |
|--------|--------|
| Booking form (service, date, time, details) | ✅ Done |
| “Pay” → creates appointment + Stripe Checkout session | ✅ Done |
| Redirect to Stripe’s payment page | ✅ Done |
| After payment → redirect to your confirmation page | ✅ Done |
| Stripe keys in `.env` | ✅ Done |

So the payment **method** and **flow** are already integrated. What’s left is **one setting** so that when the user pays, your app marks the booking as paid and can send the confirmation email and video link.

---

## What you need to do (only this)

### 1. Webhook secret (so “paid” is recorded and emails go out)

When the user pays on Stripe, Stripe calls your app. Your app only accepts that call if you set the **webhook signing secret**.

**If the site is already online (e.g. Vercel):**

1. Go to **https://dashboard.stripe.com/webhooks**
2. Click **Add an endpoint**
3. **Endpoint URL:** `https://YOUR-DOMAIN.com/api/webhooks/stripe`
4. **Events:** select only **`checkout.session.completed`**
5. Save, then open the endpoint and **Reveal** the **Signing secret** (`whsec_...`)
6. In your project **`.env`** (or your host’s env vars) add:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxx
   ```
7. Restart the app (or redeploy).

**If you’re only testing on your computer (localhost):**

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli  
   (e.g. Mac: `brew install stripe/stripe-cli/stripe`)
2. Log in: `stripe login`
3. Start your app (`npm run dev`), then in another terminal run:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
4. Copy the **Signing secret** the CLI prints (`whsec_...`)
5. In **`.env`** add: `STRIPE_WEBHOOK_SECRET=whsec_...`
6. Restart your app.

That’s it. No new code, no “payment panel” to build.

---

## When you go live

- In Stripe Dashboard, switch to **Live** and use **live** API keys in `.env` (or production env vars).
- Create a **new** webhook endpoint in Stripe for your **live** site URL and use that endpoint’s **new** signing secret for production.

---

## Quick test

1. On your site: **Book a consultation** → choose **Online** (paid) → pick service, date, time → fill details → submit.
2. You should be redirected to **Stripe’s payment page** (card form).
3. Use test card: **4242 4242 4242 4242**, any future expiry, any CVC.
4. After payment you should land on your **confirmation page**; the booking should be marked paid and (if email is set up) the confirmation email can be sent.

If step 2 doesn’t happen, check that `STRIPE_SECRET_KEY` is set in `.env` and restart the app. If step 4 doesn’t update the booking or send email, add `STRIPE_WEBHOOK_SECRET` as above.
