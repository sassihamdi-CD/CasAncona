# Vercel env — copy-paste

Open **vercel-env-paste.txt** in your project root. Each line is `NAME=value`.

In Vercel: **Settings → Environment Variables** → for each line, **Name** = part before `=`, **Value** = part after `=`.

1. Replace **NEXT_PUBLIC_APP_URL** with your real Vercel URL (e.g. `https://cas-ancona-xxx.vercel.app`).
2. For **STRIPE_WEBHOOK_SECRET**: Stripe → Webhooks → Add endpoint → URL = `https://YOUR-VERCEL-URL.vercel.app/api/webhooks/stripe` → copy the Signing secret and use that as the value.

Then **Redeploy**.
