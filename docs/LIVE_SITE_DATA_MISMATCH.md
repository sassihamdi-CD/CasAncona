# Live site shows different data than admin (or old “local” data)

If the **live** main site (Servizi, homepage) shows **old or test data** (e.g. services/appointments you created on local) while the **live admin** shows new services you just added, then **admin and the main site are not using the same database** on the same deployment.

---

## Why this happens

1. **Same code, same project, but different env**
   - **Admin** and **main site** both use `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from the **deployment** that serves the request.
   - If you open admin on one URL and the main site on another (e.g. different Vercel project or Production vs Preview), they can use **different env vars** → **different Supabase** → different data.

2. **Live site showing “local” data**
   - That means the deployment you’re viewing is using the **same Supabase project as your local `.env`** (your dev project).
   - So “live” is still pointed at the **dev** DB, not a separate production DB.

3. **Admin shows new service, main site doesn’t**
   - Either:
     - You’re on **different deployments** (e.g. admin on Preview, main on Production, with different env), or
     - **Caching**: browser or CDN is serving an old version of the page (we added no-cache headers; try incognito and the steps below).

---

## What to do (step by step)

### 1. Use one URL for both admin and main site

- Pick **one** live URL, e.g. `https://cas-ancona.vercel.app`.
- **Always** open:
  - Admin: `https://cas-ancona.vercel.app/admin`
  - Main site / Servizi: `https://cas-ancona.vercel.app/it` or `https://cas-ancona.vercel.app/it/servizi`
- Do **not** mix:
  - another Vercel project (e.g. casancona.vercel.app),
  - or Preview URLs (e.g. `*-xxx-cas-ancona.vercel.app`)  
  when checking “live” data. Use the **same** project and the **same** environment (Production).

### 2. Make sure env vars are the same for that deployment

- Vercel → your project (e.g. **cas-ancona**) → **Settings** → **Environment Variables**.
- For **Production** (and for the deployment you use as “live”):
  - `NEXT_PUBLIC_SUPABASE_URL` = the Supabase project you want for **live**.
  - `SUPABASE_SERVICE_ROLE_KEY` = that project’s **service_role** key.
- If you have a **Preview** environment with different values, then opening a Preview URL will show different data than Production. For “live,” use **Production** only and the same URL for admin and main site.

### 3. Decide: one DB (dev) or two (dev + production)

**Option A – One Supabase (e.g. same as local)**

- Set Vercel **Production** env to your **current** (dev) Supabase URL and service role key.
- Then **live admin** and **live main site** both use that DB. Add a service in live admin → it should appear on the live main site **on the same URL** (after cache clear / incognito).

**Option B – Separate production DB**

- Create a **new** Supabase project (production).
- Run the **same migrations** there (SQL Editor).
- Set Vercel **Production** env to this **production** project’s URL and service_role key.
- Add services only via **live** admin; they’ll be in the production DB and the live main site will show them (same URL, same env).

### 4. Clear cache and test

- After any env or code change: **Redeploy** the project in Vercel.
- Then open the **main site** (e.g. `/it/servizi`) in an **incognito/private** window (or hard refresh: Ctrl+Shift+R / Cmd+Shift+R).
- Add a test service in **admin** on the **same** URL, then reload the main site in incognito again. It should appear if admin and main site share the same Supabase and env.

### 5. If it still doesn’t match

- In Supabase Dashboard, open the project that **Vercel Production** points to (check `NEXT_PUBLIC_SUPABASE_URL`).
- In **Table Editor** → **services**, confirm the new row exists and **active** = true.
- If it’s there but the live site doesn’t show it, you’re likely viewing a **cached** response or a **different** deployment (different project/Preview). Stick to one Production URL and incognito for testing.

---

## Summary

| Symptom | Likely cause | Action |
|--------|---------------|--------|
| Live site shows old/local data | Vercel env = dev Supabase, or you’re on a different deployment | Use one Production URL; set env to the DB you want for “live”; redeploy; test in incognito |
| Admin has new service, main site doesn’t | Different env (e.g. Production vs Preview) or caching | Same URL for admin and main site; same env for that deployment; no-cache + incognito |
| Want clean “production” data | No separate production DB | Create production Supabase, run migrations, set Vercel Production env to it; use only live admin to add data |

No code change can fix “admin and main site use different databases”; that is entirely **Vercel env** and **which deployment/URL** you use for admin vs main site.
