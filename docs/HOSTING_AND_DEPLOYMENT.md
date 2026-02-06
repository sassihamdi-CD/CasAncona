# Hosting and deployment – recommended options

Your stack: **Next.js 14**, **Supabase** (DB), **Stripe** (payments), **server-side API routes + webhooks**. You need a host that runs Node.js and gives you a **public HTTPS URL** for Stripe webhooks.

---

## Recommended: **Vercel** (best fit)

**Why it fits your project:**
- Built by the Next.js team – **zero config** for your app (no Docker, no server setup).
- **Automatic HTTPS** and a free `.vercel.app` domain so Stripe can call your webhook.
- **Environment variables** in the dashboard – you paste the same keys from `.env` (no secrets in code).
- **Deploy from Git** – push to GitHub/GitLab, Vercel builds and deploys. Easy updates.
- **Secure** – serverless, no SSH, no server to patch; Vercel handles SSL and infrastructure.
- **Free tier** is enough for a small office site (bandwidth and serverless limits are generous).

**What you need to do:**
1. Put your code on **GitHub** (or GitLab/Bitbucket).
2. Sign up at [vercel.com](https://vercel.com) and **Import** the repo.
3. Add **Environment Variables** (see list below) in Vercel → Project → Settings → Environment Variables.
4. Deploy. You’ll get a URL like `your-project.vercel.app`.
5. In **Stripe Dashboard → Developers → Webhooks**, add endpoint:  
   `https://your-project.vercel.app/api/webhooks/stripe`  
   Event: `checkout.session.completed`. Copy the **Signing secret** and add it in Vercel as `STRIPE_WEBHOOK_SECRET`.
6. Set **NEXT_PUBLIC_APP_URL** in Vercel to your final URL (e.g. `https://your-project.vercel.app` or your custom domain).

**Custom domain (e.g. studiocas.it):** In Vercel → Project → Settings → Domains, add the domain and follow the DNS instructions. Then set `NEXT_PUBLIC_APP_URL` to that domain and update the Stripe webhook URL to `https://yourdomain.com/api/webhooks/stripe`.

---

## Alternative: **Netlify**

Also works well with Next.js and is easy and secure. Similar flow: connect repo, add env vars, deploy. You get an HTTPS URL for the webhook.  
[netlify.com](https://netlify.com) → Add new site → Import from Git → Configure build: Build command `npm run build`, Publish directory `.next` (or use the Next.js runtime they suggest).

---

## Alternative: **Railway** or **Render**

Good if you prefer an “always-on” server instead of serverless. You deploy a Node app; they run `npm run build` and `npm run start`. Slightly more manual (you set start command, port, env vars) but still straightforward.  
- [railway.app](https://railway.app)  
- [render.com](https://render.com) (free tier available)

---

## Environment variables to set on the host

Use the same names and values as in your local `.env` (values stay secret; never commit them to Git).

| Variable | Required | Notes |
|----------|----------|--------|
| `NEXT_PUBLIC_APP_URL` | Yes | Full URL of your site, e.g. `https://your-project.vercel.app` or `https://studiocas.it` |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | From Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | From Supabase → Settings → API (service_role key) |
| `STRIPE_SECRET_KEY` | Yes | Live key when going live (starts with `sk_live_`) |
| `STRIPE_WEBHOOK_SECRET` | Yes | From Stripe webhook endpoint (starts with `whsec_`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Optional* | Live key when going live (`pk_live_`) – only if you add client-side Stripe later |
| `ADMIN_EMAIL` | Yes | For admin login |
| `ADMIN_PASSWORD` | Yes | For admin login |
| `ADMIN_SESSION_SECRET` | Yes | Random string (e.g. `openssl rand -hex 32`) for session cookies |
| `RESEND_API_KEY` | If you use email | From Resend dashboard |
| `EMAIL_FROM` | If you use email | Sender address |
| `TELEGRAM_BOT_TOKEN` | Optional | If you use lawyer notifications |
| `MYMEMORY_EMAIL` | Optional | For translation quota |

\* Your current flow uses Stripe Checkout (redirect); the publishable key is only needed if you add Stripe.js on the client later.

---

## Security checklist

- [ ] All secrets only in the host’s **environment variables**, never in the repo.
- [ ] Use **live** Stripe keys and a **live** webhook in production.
- [ ] **NEXT_PUBLIC_APP_URL** is your real production URL (so Stripe redirects and links are correct).
- [ ] If you use a custom domain, use **HTTPS** (Vercel/Netlify provide it automatically).
- [ ] Keep Supabase **service_role** key only on the server (never in client-side code); your app already does this.

---

## Summary

| Need | Solution |
|------|----------|
| Easy | **Vercel** – import repo, add env vars, deploy. |
| Secure | HTTPS, env vars for secrets, server-side Stripe and Supabase; no extra config. |
| Fits project | Next.js, API routes, webhooks, and serverless all supported by Vercel (and Netlify/Railway/Render). |

**Recommended path:** Deploy on **Vercel**, add env vars, then add the Stripe webhook URL and secret. After that, connect your custom domain if you have one.
