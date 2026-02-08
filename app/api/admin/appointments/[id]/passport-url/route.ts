/**
 * GET /api/admin/appointments/[id]/passport-url
 * Returns a short-lived signed URL to view the passport document. Admin auth required.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { requireAdminAuth } from "@/lib/auth/admin";
import { unauthorized, notFound, serverError } from "@/lib/api/response";
import { PASSPORT_DOCUMENTS_BUCKET } from "@/lib/constants/storage";

const SIGNED_URL_EXPIRES_SEC = 60;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!requireAdminAuth(request)) {
    return unauthorized();
  }

  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();

    const { data: row, error: fetchError } = await supabase
      .from("appointments")
      .select("passport_document_path")
      .eq("id", id)
      .single();

    if (fetchError || !row) {
      return notFound("Appointment not found");
    }

    const path = (row as { passport_document_path: string | null }).passport_document_path;
    if (!path || typeof path !== "string" || !path.trim()) {
      return notFound("No passport document for this appointment");
    }

    const { data: signed, error: signError } = await supabase.storage
      .from(PASSPORT_DOCUMENTS_BUCKET)
      .createSignedUrl(path, SIGNED_URL_EXPIRES_SEC);

    if (signError || !signed?.signedUrl) {
      console.error("[api/admin/appointments/[id]/passport-url]", signError);
      return serverError();
    }

    return NextResponse.json({ url: signed.signedUrl });
  } catch (e) {
    console.error("[api/admin/appointments/[id]/passport-url]", e);
    return serverError();
  }
}
