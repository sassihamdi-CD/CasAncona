/**
 * Supabase server client — use only in API routes or server components.
 * Uses service role so it bypasses RLS; keep SUPABASE_SERVICE_ROLE_KEY secret.
 *
 * Custom fetch with cache: 'no-store' so Next.js does NOT cache Supabase responses.
 * Without this, admin changes (services, site_contact) would not show on the main site
 * because Next.js would serve cached fetch() results.
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let _admin: ReturnType<typeof createClient> | null = null;

/** Fetch that opts out of Next.js Data Cache so we always get fresh data from Supabase. */
const noStoreFetch: typeof fetch = (input, init) => {
  return fetch(input, { ...init, cache: "no-store" });
};

export function getSupabaseAdmin() {
  if (!_admin) {
    if (!url || !serviceRoleKey) {
      throw new Error(
        "Missing Supabase env: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
      );
    }
    _admin = createClient(url, serviceRoleKey, {
      auth: { persistSession: false },
      global: { fetch: noStoreFetch },
    });
  }
  return _admin;
}
