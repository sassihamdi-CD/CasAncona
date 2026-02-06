/**
 * GET /api/site-contact — public read of phone, email, working hours for the main site.
 */

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { SITE_CONTACT_ROW_ID } from "@/lib/constants/site-contact";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("site_contact")
      .select("phone, email, hours")
      .eq("id", SITE_CONTACT_ROW_ID)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json(
        { phone: null, email: null, hours: null },
        { headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    }

    const row = data as { phone: string | null; email: string | null; hours: string | null };
    return NextResponse.json({
      phone: row.phone ?? null,
      email: row.email ?? null,
      hours: row.hours ?? null,
    }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch (e) {
    console.error("[api/site-contact]", e);
    return NextResponse.json({ phone: null, email: null, hours: null });
  }
}
