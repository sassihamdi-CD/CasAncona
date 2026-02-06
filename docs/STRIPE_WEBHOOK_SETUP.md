# How to create the Stripe webhook and get the secret

The webhook tells your app when a customer has paid, so you can confirm the booking, create the video room, and send emails.

---

## For this platform (Studio CAS)

| Generic Stripe idea | In this project |
|---------------------|------------------|
| **Webhook URL** | `https://YOUR-DOMAIN.com/api/webhooks/stripe` (or use CLI for localhost) |
| **Event to listen to** | `checkout.session.completed` only (we use Stripe Checkout) |
| **Signature verification** | Already implemented in `app/api/webhooks/stripe/route.ts` |
| **Secret** | Put the `whsec_...` value in `.env` as `STRIPE_WEBHOOK_SECRET` |

You only need to **create the endpoint in Stripe** (Dashboard or CLI) and **add the signing secret to `.env`**. The handler code is already in place.

---

## Option A: Production (site already online)

Use this when your site is deployed (e.g. `https://your-site.com`).

### 1. Open the Stripe Webhooks page

- Go to: **https://dashboard.stripe.com/webhooks**
- Log in if asked.

### 2. Create the endpoint

- Click **“Add an endpoint”** or **“Create an event destination”** (wording depends on your Stripe Dashboard version).

### 3. Fill in the form

| Field | What to enter |
|--------|----------------|
| **Endpoint URL** | `https://YOUR-DOMAIN.com/api/webhooks/stripe`  
|   | Example: `https://studiocas.it/api/webhooks/stripe` |
| **Description** | Optional, e.g. `Studio CAS – confirm paid bookings` |
| **Events to send** | Click “Select events” and choose: **`checkout.session.completed`** only. |

### 4. Save

- Click **“Add endpoint”** (or **“Create”**).

### 5. Get the signing secret

- Open the webhook you just created.
- In **“Signing secret”**, click **“Reveal”** (or “Click to reveal”).
- Copy the value; it starts with **`whsec_`**.

### 6. Put it in your app

- In your project’s **`.env`** file, add (use your real value):

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxx
```

- Restart your server so it loads the new variable.

---

## Option B: Local testing (localhost)

Stripe cannot call `http://localhost` directly. Use the **Stripe CLI** to forward events to your machine.

### 1. Install Stripe CLI

- **Mac (Homebrew):** `brew install stripe/stripe-cli/stripe`
- **Windows:** https://github.com/stripe/stripe-cli/releases  
- Or: https://docs.stripe.com/stripe-cli

### 2. Log in

```bash
stripe login
```

### 3. Forward webhooks to your app

With your Next.js app running (e.g. `npm run dev` — usually port 3000):

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Use **port 3000** (or whatever port your app uses), not 4242. The path must be **`/api/webhooks/stripe`** (this project’s route).

### 4. Use the secret the CLI shows

The command will print something like:

```text
Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxxxxxxxxx
```

- Copy that **`whsec_...`** value.
- In **`.env`** set:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxx
```

- Restart your dev server.

### 5. Test a payment

- Do a test booking on your site with test card `4242 4242 4242 4242`.
- The CLI will show the event being forwarded; your app should confirm the booking and send emails.

**Optional – trigger a test event from the CLI:**  
This project listens for `checkout.session.completed`, not `payment_intent.succeeded`. To simulate the webhook without a real payment:

```bash
stripe trigger checkout.session.completed
```

Note: the triggered event may not contain your real `appointment_id` in metadata, so your handler might not update a real booking. For full flow testing, doing a real test booking (step above) is better.

---

## Summary

| Where you run the app | Endpoint URL | How you get the secret |
|-----------------------|--------------|-------------------------|
| **Production** (e.g. Vercel) | `https://your-domain.com/api/webhooks/stripe` | Dashboard → Webhooks → Add endpoint → Reveal signing secret |
| **Local** (localhost) | (Stripe CLI forwards to your app) | Run `stripe listen --forward-to localhost:3000/api/webhooks/stripe` and copy the `whsec_...` it prints |

Your app only listens for **`checkout.session.completed`**. No other events need to be selected.
