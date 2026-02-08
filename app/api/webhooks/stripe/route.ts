/**
 * POST /api/webhooks/stripe — Stripe webhook handler.
 * On checkout.session.completed: confirm appointment, create video room, email client, notify lawyer.
 *
 * CRITICAL FOR REAL MONEY: This is the only place that moves a booking from pending_payment to
 * confirmed. If this webhook is not called (wrong URL or Stripe cannot reach it) or fails
 * (wrong STRIPE_WEBHOOK_SECRET, wrong DB), the client has paid but the booking stays pending.
 * See docs/LIVE_PAYMENTS_CHECKLIST.md for production setup.
 */

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import { createVideoRoom } from "@/lib/video/create-room";
import { sendBookingConfirmationEmail } from "@/lib/notifications";
import { notifyLawyerTelegram } from "@/lib/notifications";
import { AppointmentStatus } from "@/lib/types";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("[webhooks/stripe] STRIPE_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[webhooks/stripe] Signature verification failed:", message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const appointmentId = session.metadata?.appointment_id;
  if (!appointmentId) {
    console.error("[webhooks/stripe] No appointment_id in metadata");
    return NextResponse.json({ received: true });
  }

  const supabase = getSupabaseAdmin();

  type AppointmentRow = Database["public"]["Tables"]["appointments"]["Row"];
  type StaffRow = Database["public"]["Tables"]["staff"]["Row"];

  const { data: appointment, error: fetchError } = await supabase
    .from("appointments")
    .select("*")
    .eq("id", appointmentId)
    .single();

  if (fetchError || !appointment) {
    console.error("[webhooks/stripe] Appointment not found:", appointmentId);
    return NextResponse.json({ received: true });
  }

  const apt = appointment as AppointmentRow;
  if (apt.status !== AppointmentStatus.PENDING_PAYMENT) {
    return NextResponse.json({ received: true });
  }

  const isOnline = apt.consultation_type === "online";
  let roomId: string | null = null;
  let roomUrl: string | null = null;
  if (isOnline) {
    const room = await createVideoRoom({
      appointmentId,
      clientName: apt.client_name,
    });
    roomId = room.roomId;
    roomUrl = room.roomUrl;
  }

  const { error: updateError } = await supabase
    .from("appointments")
    .update({
      status: AppointmentStatus.CONFIRMED,
      amount_paid_cents: session.amount_total ?? undefined,
      currency: session.currency ?? undefined,
      video_room_id: roomId,
      video_room_url: roomUrl,
      updated_at: new Date().toISOString(),
    } as never)
    .eq("id", appointmentId);

  if (updateError) {
    console.error("[webhooks/stripe] Update failed:", updateError);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  console.log("[webhooks/stripe] Appointment confirmed:", appointmentId, "amount:", session.amount_total, "online:", isOnline);

  const { data: serviceRow } = await supabase
    .from("services")
    .select("name")
    .eq("id", apt.service_id)
    .single();
  const serviceName = (serviceRow as { name?: string } | null)?.name ?? "Consultation";

  await sendBookingConfirmationEmail({
    to: apt.client_email,
    clientName: apt.client_name,
    serviceName,
    requestedStartAt: apt.requested_start_at,
    videoRoomUrl: roomUrl,
  });

  if (apt.assigned_staff_id) {
    const { data: staff } = await supabase
      .from("staff")
      .select("telegram_chat_id")
      .eq("id", apt.assigned_staff_id)
      .single();
    const staffRow = staff as StaffRow | null;
    if (staffRow?.telegram_chat_id && roomUrl) {
      await notifyLawyerTelegram({
        telegramChatId: staffRow.telegram_chat_id,
        clientName: apt.client_name,
        serviceName,
        requestedStartAt: apt.requested_start_at,
        videoRoomUrl: roomUrl,
      });
    }
  }

  return NextResponse.json({ received: true });
}
