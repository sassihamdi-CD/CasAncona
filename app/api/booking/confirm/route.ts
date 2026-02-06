/**
 * GET /api/booking/confirm?session_id=xxx | ?appointment_id=xxx
 * - session_id: after Stripe payment (online).
 * - appointment_id: in-person (free) booking confirmation.
 * Returns appointment summary (and video link for online when webhook has run).
 */

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import { badRequest, notFound, serverError } from "@/lib/api/response";
import type { GetBookingConfirmResponse, AppointmentStatus } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");
    const appointmentId = searchParams.get("appointment_id");

    if (sessionId && sessionId.trim().length > 0) {
      if (sessionId === "dev_no_stripe") {
        return NextResponse.json({
          appointment: {
            id: "",
            serviceName: "Development (no Stripe)",
            requestedStartAt: "",
            durationMinutes: 0,
            videoRoomUrl: null,
            status: "pending_payment",
          },
        } satisfies GetBookingConfirmResponse);
      }

      const supabase = getSupabaseAdmin();
      const { data: appointment, error } = await supabase
        .from("appointments")
        .select("id, requested_start_at, duration_minutes, video_room_url, status, service_id")
        .eq("stripe_session_id", sessionId)
        .single();

      if (error || !appointment) {
        return notFound("Appointment not found");
      }

      type AppointmentRow = Database["public"]["Tables"]["appointments"]["Row"];
      const row = appointment as AppointmentRow;
      const { data: service } = await supabase
        .from("services")
        .select("name")
        .eq("id", row.service_id)
        .single();
      const serviceName = (service as { name?: string } | null)?.name ?? "Consultation";

      const body: GetBookingConfirmResponse = {
        appointment: {
          id: row.id,
          serviceName,
          requestedStartAt: row.requested_start_at,
          durationMinutes: row.duration_minutes,
          videoRoomUrl: row.video_room_url,
          status: row.status as AppointmentStatus,
        },
      };
      return NextResponse.json(body);
    }

    if (appointmentId && appointmentId.trim().length > 0) {
      const supabase = getSupabaseAdmin();
      const { data: appointment, error } = await supabase
        .from("appointments")
        .select("id, requested_start_at, duration_minutes, video_room_url, status, service_id")
        .eq("id", appointmentId)
        .single();

      if (error || !appointment) {
        return notFound("Appointment not found");
      }

      type AppointmentRow = Database["public"]["Tables"]["appointments"]["Row"];
      const row = appointment as AppointmentRow;
      const { data: service } = await supabase
        .from("services")
        .select("name")
        .eq("id", row.service_id)
        .single();
      const serviceName = (service as { name?: string } | null)?.name ?? "Consultation";

      const body: GetBookingConfirmResponse = {
        appointment: {
          id: row.id,
          serviceName,
          requestedStartAt: row.requested_start_at,
          durationMinutes: row.duration_minutes,
          videoRoomUrl: row.video_room_url,
          status: row.status as AppointmentStatus,
        },
      };
      return NextResponse.json(body);
    }

    return badRequest("Missing query: session_id or appointment_id");
  } catch (e) {
    console.error("[api/booking/confirm]", e);
    return serverError();
  }
}
