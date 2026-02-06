/**
 * GET /api/admin/appointments — list appointments (filter: from, to, status, staffId).
 * Protected: set ADMIN_API_KEY and send x-admin-key header, or use Supabase Auth later.
 */

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { mapAppointment } from "@/lib/db/map";
import type { AppointmentRow } from "@/lib/db/map";
import { requireAdminAuth } from "@/lib/auth/admin";
import { unauthorized, serverError } from "@/lib/api/response";
import type { GetAdminAppointmentsResponse } from "@/lib/types";

export async function GET(request: NextRequest) {
  if (!requireAdminAuth(request)) {
    return unauthorized();
  }

  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const status = searchParams.get("status");
    const staffId = searchParams.get("staffId");

    let query = getSupabaseAdmin()
      .from("appointments")
      .select("*")
      .order("requested_start_at", { ascending: true });

    if (from) query = query.gte("requested_start_at", `${from}T00:00:00.000Z`);
    if (to) query = query.lte("requested_start_at", `${to}T23:59:59.999Z`);
    if (status) query = query.eq("status", status);
    if (staffId) query = query.eq("assigned_staff_id", staffId);

    const { data, error } = await query;

    if (error) {
      console.error("[api/admin/appointments]", error);
      return serverError();
    }

    const appointments = (data ?? []).map((row) => mapAppointment(row as AppointmentRow));
    const body: GetAdminAppointmentsResponse = { appointments };
    return NextResponse.json(body);
  } catch (e) {
    console.error("[api/admin/appointments]", e);
    return serverError();
  }
}
