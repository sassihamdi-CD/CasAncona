# Local payment test – do this now

## What’s running

- **Next.js app:** http://localhost:3002  
- **Stripe webhook listener:** forwarding events to `localhost:3002/api/webhooks/stripe`  
- **Webhook secret:** already in `.env` (`STRIPE_WEBHOOK_SECRET`)

## Test as a user (pay with card)

1. Open: **http://localhost:3002/en/book** (or `/it/book`, `/ar/book`, `/fr/book`).

2. **Step 1 – Service:** choose a service (e.g. the test one).

3. **Step 2 – Type:** choose **“Online (paid)”**.

4. **Step 3 – Date & time:** pick a date, then a time slot.

5. **Step 4 – Your details:** fill name, email, phone (optional), then click the button to **pay**.

6. You’ll be redirected to **Stripe’s payment page**. Use:
   - **Card:** `4242 4242 4242 4242`
   - **Expiry:** any future date (e.g. 12/34)
   - **CVC:** any 3 digits (e.g. 123)
   - **ZIP:** any (e.g. 12345)

7. After payment, Stripe sends you back to **your confirmation page** on the site. The webhook will mark the booking as paid and (if configured) create the video room and send the confirmation email.

## If the service is €0.00

Stripe Checkout may still open; for a clear “card payment” test, use or create a service with **price &gt; 0** in Admin → Services.

## If something fails

- **Stripe listener:** in a terminal run:  
  `stripe listen --forward-to localhost:3002/api/webhooks/stripe`  
  and leave it open. Use the `whsec_...` it prints in `.env` as `STRIPE_WEBHOOK_SECRET` and restart the app.
- **App:** from project root run `npm run dev` and open the URL it shows (e.g. http://localhost:3002).
