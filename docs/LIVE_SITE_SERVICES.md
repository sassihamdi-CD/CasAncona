# Why new services don’t appear on the live website

The live site and your local app use **different Supabase databases** (unless you pointed both to the same project). Data does **not** sync between them.

---

## 1. Where did you add the new services?

- **On local (localhost)**  
  You ran the app with `npm run dev` and added services in `http://localhost:3000/admin` → those are saved in the Supabase project set in your **local `.env`** (e.g. a dev project).  
  The **live site** reads from the Supabase project set in **Vercel env vars** (production). So it will **not** see services that exist only in your local/dev DB.

- **On the live admin**  
  You added services in `https://your-live-site.com/admin` → they are saved in the **production** Supabase project. If they still don’t show on the homepage or `/servizi`, check steps 2 and 3 below.

---

## 2. Add services in the **live** admin so they appear on the live site

To have new services on the **live** website:

1. Open your **live** site: `https://your-domain.com` (or your Vercel URL).
2. Go to **Admin**: `https://your-domain.com/admin` and log in.
3. Open **Services** and add (or edit) services there.  
   Everything you save here is stored in the **production** Supabase project that the live site uses, so it will show on the main site and in booking.

You can still use local admin for testing; just remember that local data stays in the DB your local `.env` points to.

---

## 3. Make sure production Supabase is set up like local

The live site needs the **same schema** in the production Supabase project. If you created a new/fresh project for production, run the **same migrations** there.

1. Open the **production** Supabase project in the [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to **SQL Editor**.
3. Run the migrations in order (same as local), for example:
   - `supabase/migrations/20250203000001_initial_schema.sql`
   - `supabase/migrations/20250203000002_consultation_type.sql`
   - … and any later ones that add or change the `services` table or related tables.

If the `services` table (and any new columns) already exist in production, you don’t need to re-run those parts.

---

## 4. Check Vercel environment variables

The live site must use the **production** Supabase project:

- **NEXT_PUBLIC_SUPABASE_URL** = Production project URL (Supabase → Settings → API).
- **SUPABASE_SERVICE_ROLE_KEY** = Production project **service_role** key (Settings → API).

If these point to a different project (e.g. an empty dev project), the live site will show no services even if you added them in the live admin.  
After changing env vars in Vercel, **redeploy** the project (e.g. trigger a new deployment or push a commit).

---

## Summary

| Situation | What to do |
|-----------|------------|
| You added services **on local** | Add them again in the **live** admin (`https://your-site.com/admin` → Services), or copy data to production Supabase. |
| You added services **on live** but they don’t show | 1) Confirm Vercel env vars point to the **production** Supabase project. 2) Confirm the production project has the `services` table and migrations applied. 3) Redeploy after any env change. |
| New Supabase project for production | Run the same migrations in the production project’s SQL Editor so the schema (including `services`) matches. |

No separate “run in Supabase” step is needed for services to appear **as long as** (1) you add them via the **live** admin, (2) production Supabase has the right schema, and (3) Vercel is configured with that project’s URL and service role key.

---

## 5. Admin shows more services than the main site (e.g. "Prima consulenza 12" missing on Servizi)

The public **Servizi** page and **homepage** only show services where **Attivo = Sì** (active = true). The admin list shows **all** services.

- **Cache:** The site sends Cache-Control: no-store for homepage and Servizi. After deploying, hard refresh (Ctrl+Shift+R) or open in incognito.
- **Check in Supabase:** Table Editor → services → open the missing row → ensure **active** = true.
- **Redeploy** after code changes, then test in incognito.
