# Admin login: "Invalid email or password" (local)

The admin login **does not use a database**. It only checks that what you type **exactly matches** two environment variables:

- **ADMIN_EMAIL**
- **ADMIN_PASSWORD**

So "Invalid email or password" means: either the app is reading different values from your `.env`, or what you’re typing doesn’t match.

---

## Fix it on local

1. **Open your local `.env`** in the project root (same folder as `package.json`).

2. **Check that these two lines exist and have no typos:**
   ```env
   ADMIN_EMAIL=admin@studiocas.it
   ADMIN_PASSWORD=StudioCAS-Admin-2025!
   ```
   - No spaces around `=`.
   - No quotes unless the value really has spaces (e.g. `ADMIN_PASSWORD="my pass"`).
   - If you use different credentials locally, that’s fine — just type **exactly** what you put in `.env` (same email, same password).

3. **If you copied env from Vercel** (e.g. from `vercel-env-paste.txt`), that file has:
   - `ADMIN_EMAIL=admin@studiocas.it`
   - `ADMIN_PASSWORD=StudioCAS-Admin-2025!`  
   So use **admin@studiocas.it** and **StudioCAS-Admin-2025!** (exactly, no extra space).

4. **Restart the dev server** after changing `.env`:
   ```bash
   # Stop the server (Ctrl+C), then:
   npm run dev
   ```
   Next.js loads `.env` at startup; it doesn’t reload it until you restart.

5. **Try again** on http://localhost:3000/admin/login with the same email and password as in `.env`.

---

## If you still get "Invalid email or password"

- **"Admin login not configured"** (503) = `.env` is missing `ADMIN_EMAIL` or `ADMIN_PASSWORD` (or they’re empty). Add them and restart.
- **401 "Invalid email or password"** = the values in `.env` and what you type don’t match. Copy the password from `.env` and paste it into the password field (no extra space at the end), and use the exact email from `.env`.

Nothing in the app code was changed for login; the behaviour is entirely controlled by your `.env` and what you type in the form.
