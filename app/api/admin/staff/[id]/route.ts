/**
 * PATCH /api/admin/staff/[id] — update staff (e.g. telegram_chat_id for Telegram notifications).
 * Admin auth required.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { mapStaff } from "@/lib/db/map";
import type { StaffRow } from "@/lib/db/map";
import { requireAdminAuth } from "@/lib/auth/admin";
import { unauthorized, notFound, badRequest, serverError } from "@/lib/api/response";

type PatchBody = { telegramChatId?: string | null };

function parseBody(body: unknown): PatchBody | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if ("telegramChatId" in b) {
    const v = b.telegramChatId;
    if (v !== null && v !== undefined && typeof v !== "string") return null;
    return { telegramChatId: v as string | null };
  }
  return null;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!requireAdminAuth(request)) {
    return unauthorized();
  }

  try {
    const { id } = await params;
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return badRequest("Invalid JSON");
    }

    const patch = parseBody(body);
    if (!patch) {
      return badRequest("Body must include telegramChatId (string or null)");
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
      telegram_chat_id: patch.telegramChatId ?? null,
    };

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("staff")
      .update(updates as never)
      .eq("id", id)
      .select("*")
      .single();

    if (error || !data) {
      if (error?.code === "PGRST116") return notFound("Staff not found");
      console.error("[api/admin/staff/[id]]", error);
      return serverError();
    }

    return NextResponse.json({ staff: mapStaff(data as StaffRow) });
  } catch (e) {
    console.error("[api/admin/staff/[id]]", e);
    return serverError();
  }
}
