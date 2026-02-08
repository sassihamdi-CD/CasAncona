/**
 * GET /api/admin/appointments/[id] — get one appointment.
 * PATCH /api/admin/appointments/[id] — update (assignedStaffId, status).
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { mapAppointment } from "@/lib/db/map";
import type { AppointmentRow } from "@/lib/db/map";
import { requireAdminAuth } from "@/lib/auth/admin";
import { unauthorized, notFound, badRequest, serverError } from "@/lib/api/response";
import type { GetAdminAppointmentResponse, PatchAdminAppointmentBody } from "@/lib/types";
import { AppointmentStatus } from "@/lib/types";

const VALID_STATUSES = new Set([
  AppointmentStatus.CONFIRMED,
  AppointmentStatus.COMPLETED,
  AppointmentStatus.CANCELLED,
  AppointmentStatus.NO_SHOW,
]);

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
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return notFound("Appointment not found");
    }

    const body: GetAdminAppointmentResponse = { appointment: mapAppointment(data as AppointmentRow) };
    return NextResponse.json(body);
  } catch (e) {
    console.error("[api/admin/appointments/[id]] GET", e);
    return serverError();
  }
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
      return badRequest("Invalid JSON body");
    }

    const b = body as PatchAdminAppointmentBody;
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (b.assignedStaffId !== undefined) updates.assigned_staff_id = b.assignedStaffId;
    if (b.status !== undefined) {
      if (!VALID_STATUSES.has(b.status as typeof AppointmentStatus.CONFIRMED)) {
        return badRequest("Invalid status");
      }
      updates.status = b.status;
    }
    if (b.amountPaidCents !== undefined) {
      if (b.amountPaidCents !== null && (typeof b.amountPaidCents !== "number" || b.amountPaidCents < 0)) {
        return badRequest("amountPaidCents must be a non-negative number or null");
      }
      updates.amount_paid_cents = b.amountPaidCents;
    }
    if (b.currency !== undefined) updates.currency = b.currency ?? null;

    if (Object.keys(updates).length <= 1) {
      return badRequest("No allowed fields to update");
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("appointments")
      .update(updates as never)
      .eq("id", id)
      .select("*")
      .single();

    if (error || !data) {
      if (error?.code === "PGRST116") return notFound("Appointment not found");
      console.error("[api/admin/appointments/[id]] PATCH", error);
      return serverError();
    }

    return NextResponse.json({ appointment: mapAppointment(data as AppointmentRow) });
  } catch (e) {
    console.error("[api/admin/appointments/[id]] PATCH", e);
    return serverError();
  }
}
