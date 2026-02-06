/**
 * Supabase server client — use only in API routes or server components.
 * Uses service role so it bypasses RLS; keep SUPABASE_SERVICE_ROLE_KEY secret.
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let _admin: ReturnType<typeof createClient> | null = null;

export function getSupabaseAdmin() {
  if (!_admin) {
    if (!url || !serviceRoleKey) {
      throw new Error(
        "Missing Supabase env: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
      );
    }
    _admin = createClient(url, serviceRoleKey, {
      auth: { persistSession: false },
    });
  }
  return _admin;
}
