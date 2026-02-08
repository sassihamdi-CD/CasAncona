/**
 * GET /api/admin/appointments/[id]/receipt
 * Returns appointment + service name for printing a receipt. Admin auth required.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { mapAppointment } from "@/lib/db/map";
import type { AppointmentRow } from "@/lib/db/map";
import { requireAdminAuth } from "@/lib/auth/admin";
import { unauthorized, notFound, serverError } from "@/lib/api/response";
import type { Appointment } from "@/lib/types";

export type GetReceiptResponse = {
  appointment: Appointment;
  serviceName: string;
};

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

    const { data: aptRow, error: aptError } = await supabase
      .from("appointments")
      .select("*")
      .eq("id", id)
      .single();

    if (aptError || !aptRow) {
      return notFound("Appointment not found");
    }

    const appointment = mapAppointment(aptRow as AppointmentRow);
    const { data: serviceRow } = await supabase
      .from("services")
      .select("name")
      .eq("id", appointment.serviceId)
      .single();

    const serviceName = (serviceRow as { name?: string } | null)?.name ?? "Consultation";

    const body: GetReceiptResponse = { appointment, serviceName };
    return NextResponse.json(body);
  } catch (e) {
    console.error("[api/admin/appointments/[id]/receipt]", e);
    return serverError();
  }
}
