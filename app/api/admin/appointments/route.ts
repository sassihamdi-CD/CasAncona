/**
 * GET /api/admin/appointments — list appointments (filter: from, to, status, staffId).
 * POST /api/admin/appointments — create walk-in appointment (in person). Uses same slot check as public booking.
 * Protected: set ADMIN_API_KEY and send x-admin-key header, or use Supabase Auth later.
 */

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import { mapAppointment } from "@/lib/db/map";
import type { AppointmentRow } from "@/lib/db/map";
import { requireAdminAuth } from "@/lib/auth/admin";
import { getAvailableSlots } from "@/lib/slots/compute";
import { unauthorized, serverError, badRequest, conflict, notFound } from "@/lib/api/response";
import type { GetAdminAppointmentsResponse, CreateAdminAppointmentBody, CreateAdminAppointmentResponse } from "@/lib/types";
import { AppointmentStatus } from "@/lib/types";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validateCreateBody(body: unknown): body is CreateAdminAppointmentBody {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.serviceId === "string" &&
    UUID_REGEX.test(b.serviceId) &&
    typeof b.startAt === "string" &&
    typeof b.clientName === "string" &&
    b.clientName.trim().length > 0 &&
    typeof b.clientEmail === "string" &&
    b.clientEmail.trim().length > 0 &&
    typeof b.clientPhone === "string" &&
    b.clientPhone.trim().length > 0
  );
}

export async function POST(request: NextRequest) {
  if (!requireAdminAuth(request)) {
    return unauthorized();
  }

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return badRequest("Invalid JSON body");
    }

    if (!validateCreateBody(body)) {
      return badRequest("Missing or invalid: serviceId, startAt, clientName, clientEmail, clientPhone");
    }

    const { serviceId, startAt, clientName, clientEmail, clientPhone, clientMessage } = body;
    const supabase = getSupabaseAdmin();
    type ServiceRow = Database["public"]["Tables"]["services"]["Row"];

    const { data: service, error: serviceError } = await supabase
      .from("services")
      .select("*")
      .eq("id", serviceId)
      .eq("active", true)
      .single();

    if (serviceError || !service) {
      return notFound("Service not found");
    }

    const svc = service as ServiceRow;
    const dateStr = startAt.slice(0, 10);
    const slots = await getAvailableSlots(dateStr, serviceId);
    const slotMatch = slots.find((s) => s.startAt === startAt);
    if (!slotMatch) {
      return conflict("Slot no longer available (already booked or outside office hours). Choose another time.");
    }

    const durationMinutes = svc.duration_minutes;

    const { data: appointment, error: insertError } = await supabase
      .from("appointments")
      .insert({
        service_id: serviceId,
        assigned_staff_id: slotMatch.staffId ?? null,
        consultation_type: "in_person",
        client_name: clientName.trim(),
        client_email: clientEmail.trim().toLowerCase(),
        client_phone: clientPhone.trim(),
        client_message: clientMessage?.trim() || null,
        requested_start_at: startAt,
        duration_minutes: durationMinutes,
        status: AppointmentStatus.CONFIRMED,
      } as never)
      .select("*")
      .single();

    if (insertError || !appointment) {
      if ((insertError as { code?: string } | null)?.code === "23505") {
        return conflict("Slot no longer available (already booked or outside office hours). Choose another time.");
      }
      console.error("[api/admin/appointments] POST insert error:", insertError);
      return serverError();
    }

    const out = mapAppointment(appointment as AppointmentRow);
    const response: CreateAdminAppointmentResponse = { appointment: out };
    return NextResponse.json(response, { status: 201 });
  } catch (e) {
    console.error("[api/admin/appointments] POST", e);
    return serverError();
  }
}

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
