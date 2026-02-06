# CAS Office — Website

Website for the Italian CAS office: **online appointment booking** and **video legal consultations**.

## Stack

- **Next.js 14** (App Router), **TypeScript**, **Tailwind CSS**
- See **[TECHNOLOGY_AND_INFRASTRUCTURE.md](./TECHNOLOGY_AND_INFRASTRUCTURE.md)** for full technology and infrastructure choices (database, video, hosting, etc.).

## Setup

```bash
npm install
cp .env.example .env   # then fill in when you add Supabase / video / email
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Next steps

1. Confirm or adjust the technology choices in `TECHNOLOGY_AND_INFRASTRUCTURE.md`.
2. Share the **list of services** the office provides so we can add them to the site and booking flow.
3. Then we implement: home, services page, booking flow, and video consultation.
