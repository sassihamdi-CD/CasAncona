/**
 * GET /api/admin/staff — list staff (for Telegram linking and admin use).
 * Returns id, name, email, telegramChatId. Admin auth required.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { mapStaff } from "@/lib/db/map";
import type { StaffRow } from "@/lib/db/map";
import { requireAdminAuth } from "@/lib/auth/admin";
import { unauthorized, serverError } from "@/lib/api/response";
import type { Staff } from "@/lib/types";

export type GetAdminStaffResponse = { staff: Staff[] };

export async function GET(request: NextRequest) {
  if (!requireAdminAuth(request)) {
    return unauthorized();
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("staff")
      .select("id, auth_user_id, name, email, telegram_chat_id, whatsapp_phone, role, active, created_at, updated_at")
      .order("name");

    if (error) {
      console.error("[api/admin/staff]", error);
      return serverError();
    }

    const staff = (data ?? []).map((row) => mapStaff(row as StaffRow));
    return NextResponse.json({ staff } satisfies GetAdminStaffResponse);
  } catch (e) {
    console.error("[api/admin/staff]", e);
    return serverError();
  }
}
