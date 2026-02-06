/**
 * GET /api/admin/site-contact — read contact & hours (admin).
 * PATCH /api/admin/site-contact — update phone, email, hours (admin).
 */

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { requireAdminAuth } from "@/lib/auth/admin";
import { unauthorized, serverError, badRequest } from "@/lib/api/response";
import { SITE_CONTACT_ROW_ID } from "@/lib/constants/site-contact";

type ContactRow = { id: string; phone: string | null; email: string | null; hours: string | null };

export async function GET(request: NextRequest) {
  if (!requireAdminAuth(request)) return unauthorized();

  try {
    const { data, error } = await getSupabaseAdmin()
      .from("site_contact")
      .select("id, phone, email, hours")
      .eq("id", SITE_CONTACT_ROW_ID)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({
        phone: null,
        email: null,
        hours: null,
      });
    }

    const row = data as ContactRow;
    return NextResponse.json({
      phone: row.phone ?? "",
      email: row.email ?? "",
      hours: row.hours ?? "",
    });
  } catch (e) {
    console.error("[api/admin/site-contact] GET", e);
    return serverError();
  }
}

export async function PATCH(request: NextRequest) {
  if (!requireAdminAuth(request)) return unauthorized();

  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") return badRequest("Invalid JSON");

    const { phone, email, hours } = body as Record<string, unknown>;
    const updates: { phone?: string | null; email?: string | null; hours?: string | null; updated_at: string } = {
      updated_at: new Date().toISOString(),
    };
    if (phone !== undefined) updates.phone = typeof phone === "string" ? phone.trim() || null : null;
    if (email !== undefined) updates.email = typeof email === "string" ? email.trim() || null : null;
    if (hours !== undefined) updates.hours = typeof hours === "string" ? hours.trim() || null : null;

    const { data: row } = await getSupabaseAdmin()
      .from("site_contact")
      .select("id")
      .eq("id", SITE_CONTACT_ROW_ID)
      .maybeSingle();

    if (!row) {
      const { data: inserted } = await getSupabaseAdmin()
        .from("site_contact")
        .insert({
          id: SITE_CONTACT_ROW_ID,
          phone: updates.phone ?? null,
          email: updates.email ?? null,
          hours: updates.hours ?? null,
        } as never)
        .select("phone, email, hours")
        .single();
      return NextResponse.json({
        phone: (inserted as ContactRow)?.phone ?? "",
        email: (inserted as ContactRow)?.email ?? "",
        hours: (inserted as ContactRow)?.hours ?? "",
      });
    }

    const { data: updated, error } = await getSupabaseAdmin()
      .from("site_contact")
      .update(updates as never)
      .eq("id", SITE_CONTACT_ROW_ID)
      .select("phone, email, hours")
      .single();

    if (error) {
      console.error("[api/admin/site-contact] PATCH", error);
      return serverError();
    }

    const u = updated as ContactRow;
    return NextResponse.json({
      phone: u?.phone ?? "",
      email: u?.email ?? "",
      hours: u?.hours ?? "",
    });
  } catch (e) {
    console.error("[api/admin/site-contact] PATCH", e);
    return serverError();
  }
}
