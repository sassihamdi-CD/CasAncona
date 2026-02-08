/**
 * POST /api/booking/retrieve — get upcoming appointments (and video links) by client email.
 * No auth: client proves identity by knowing the email. Used when they lost the confirmation page.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import { badRequest, serverError } from "@/lib/api/response";

export const dynamic = "force-dynamic";

type AppointmentRow = Database["public"]["Tables"]["appointments"]["Row"];
type ServiceRow = Database["public"]["Tables"]["services"]["Row"];

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return badRequest("Invalid JSON");
    }
    const { email } = body as { email?: string };
    const trimmed = typeof email === "string" ? email.trim().toLowerCase() : "";
    if (!trimmed) {
      return badRequest("Email is required");
    }

    const supabase = getSupabaseAdmin();
    const now = new Date().toISOString();

    const { data: rows, error } = await supabase
      .from("appointments")
      .select("id, requested_start_at, duration_minutes, video_room_url, service_id")
      .eq("client_email", trimmed)
      .gte("requested_start_at", now)
      .in("status", ["confirmed", "pending_payment"])
      .order("requested_start_at", { ascending: true })
      .limit(10);

    if (error) {
      console.error("[api/booking/retrieve]", error);
      return serverError();
    }

    const appointments = (rows ?? []) as (Pick<AppointmentRow, "id" | "requested_start_at" | "duration_minutes" | "video_room_url" | "service_id">)[];
    if (appointments.length === 0) {
      return NextResponse.json({ appointments: [] });
    }

    const serviceIds = [...new Set(appointments.map((a) => a.service_id))];
    const { data: services } = await supabase
      .from("services")
      .select("id, name")
      .in("id", serviceIds);
    const serviceMap = new Map((services ?? []).map((s) => [s.id, (s as ServiceRow).name]));

    const result = appointments.map((a) => ({
      id: a.id,
      requestedStartAt: a.requested_start_at,
      durationMinutes: a.duration_minutes,
      videoRoomUrl: a.video_room_url,
      serviceName: serviceMap.get(a.service_id) ?? "Consultation",
    }));

    return NextResponse.json({ appointments: result });
  } catch (e) {
    console.error("[api/booking/retrieve]", e);
    return serverError();
  }
}
