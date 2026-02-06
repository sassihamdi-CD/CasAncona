# Roadmap — fixes, improvements, new features

**Live site:** [https://cas-ancona.vercel.app](https://cas-ancona.vercel.app/it)

Use this as a backlog. Pick items by priority and add new ideas at the bottom.

---

## Fixes & stability

- [ ] **Email in production** — Set `RESEND_API_KEY` and `EMAIL_FROM` in Vercel so confirmation emails send after payment.
- [ ] **Stripe webhook for production** — Ensure webhook endpoint in Stripe uses your live Vercel URL and the signing secret is in Vercel env.
- [ ] **Custom domain** — Add your domain (e.g. studiocas.it) in Vercel → Domains and set `NEXT_PUBLIC_APP_URL` to it.
- [ ] **Admin session** — If admin login is flaky, add or verify `ADMIN_SESSION_SECRET` in Vercel.

---

## UX improvements

- [ ] **Servizi page** — Show services when they exist (translations + DB); if “I servizi online saranno visibili qui…” still shows, ensure active services are in DB and the API returns them.
- [ ] **Booking flow** — Clearer step labels, loading states, or back button between steps.
- [ ] **Confirmation page** — Add “Add to calendar” (ICS) or “Copy link” for the video URL.
- [ ] **Mobile** — Review nav, forms, and cards on small screens; adjust spacing or font size if needed.
- [ ] **404 / error pages** — Custom not-found and error pages with your branding and links home.

---

## Features to add

- [ ] **In-person confirmation email** — Send an email when someone books in-person (reuse notification helper with `videoRoomUrl: null`).
- [ ] **Telegram for staff** — Finish `notifyLawyerTelegram` and set `TELEGRAM_BOT_TOKEN` + staff `telegram_chat_id` so lawyers get notified on new bookings.
- [ ] **Cancel / reschedule** — API + UI for the client (or admin) to cancel or change an appointment.
- [ ] **Admin: appointments filters** — Filter by date range, status, or service.
- [ ] **Admin: edit appointment** — Change time, assign different staff, or add notes.
- [ ] **Contact form** — If “Contatti” is just info, add a form that sends email or saves to DB.
- [ ] **SEO** — Per-page meta (title/description), optional sitemap, and correct `lang`/hreflang for it/en/ar/fr.

---

## Content & polish

- [ ] **Real copy** — Replace placeholders (e.g. ATECO, “Cosa facciamo”) with final text and links.
- [ ] **Office map** — Confirm address and map embed on Contatti.
- [ ] **Services** — Add or refine services in Admin; ensure names/descriptions/documents are translated (MyMemory or manual).

---

## When you’re ready

- Switch Stripe to **live** keys and create a **live** webhook; set live env vars in Vercel.
- Harden security: strong `ADMIN_PASSWORD`, rotate secrets if they were ever shared.
- Optional: analytics (e.g. Vercel Analytics or Plausible) and a cookie/privacy note if required.

---

Add new items below as you go.
