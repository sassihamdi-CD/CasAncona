/**
 * POST /api/booking — create appointment (pending_payment) and return Stripe Checkout URL.
 * Body: serviceId, startAt (ISO UTC), clientName, clientEmail, clientPhone?, clientMessage?
 */

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import { getAvailableSlots } from "@/lib/slots/compute";
import { badRequest, conflict, notFound, serverError } from "@/lib/api/response";
import type { CreateBookingBody, CreateBookingResponse } from "@/lib/types";
import { AppointmentStatus, ConsultationType } from "@/lib/types";
import { sendBookingConfirmationEmail } from "@/lib/notifications";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const CONSULTATION_TYPES = ["in_person", "online"] as const;

function validateBody(body: unknown): body is CreateBookingBody {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.serviceId === "string" &&
    UUID_REGEX.test(b.serviceId) &&
    typeof b.consultationType === "string" &&
    CONSULTATION_TYPES.includes(b.consultationType as (typeof CONSULTATION_TYPES)[number]) &&
    typeof b.startAt === "string" &&
    typeof b.clientName === "string" &&
    b.clientName.trim().length > 0 &&
    typeof b.clientEmail === "string" &&
    b.clientEmail.trim().length > 0
  );
}

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return badRequest("Invalid JSON body");
    }

    if (!validateBody(body)) {
      return badRequest("Missing or invalid fields: serviceId, consultationType (in_person|online), startAt, clientName, clientEmail");
    }

    const { serviceId, consultationType, startAt, clientName, clientEmail, clientPhone, clientMessage } = body;

    const supabase = getSupabaseAdmin();

    type ServiceRow = Database["public"]["Tables"]["services"]["Row"];
    type AppointmentRow = Database["public"]["Tables"]["appointments"]["Row"];

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
      return conflict("Slot no longer available");
    }

    const durationMinutes = svc.duration_minutes;
    const isInPerson = consultationType === ConsultationType.IN_PERSON;
    const initialStatus = isInPerson ? AppointmentStatus.CONFIRMED : AppointmentStatus.PENDING_PAYMENT;

    const { data: appointment, error: insertError } = await supabase
      .from("appointments")
      .insert({
        service_id: serviceId,
        assigned_staff_id: slotMatch.staffId ?? null,
        consultation_type: consultationType,
        client_name: clientName.trim(),
        client_email: clientEmail.trim().toLowerCase(),
        client_phone: clientPhone?.trim() || null,
        client_message: clientMessage?.trim() || null,
        requested_start_at: startAt,
        duration_minutes: durationMinutes,
        status: initialStatus,
      } as never)
      .select("id")
      .single();

    if (insertError || !appointment) {
      console.error("[api/booking] insert error:", insertError);
      return serverError();
    }

    const apt = appointment as { id: string };
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
    const locale = (body as CreateBookingBody).locale ?? "it";
    const localePrefix = locale ? `/${locale}` : "";

    // In-person: free, no payment — return confirmation page URL and send confirmation email
    if (isInPerson) {
      sendBookingConfirmationEmail({
        to: clientEmail.trim().toLowerCase(),
        clientName: clientName.trim(),
        serviceName: svc.name,
        requestedStartAt: startAt,
        videoRoomUrl: null,
      }).catch((e) => console.error("[api/booking] in-person email failed:", e));
      return NextResponse.json(
        {
          appointmentId: apt.id,
          confirmationUrl: `${baseUrl}${localePrefix}/booking/confirm?appointment_id=${apt.id}`,
        } satisfies CreateBookingResponse,
        { status: 201 }
      );
    }

    // Online: paid — create Stripe Checkout and return checkout URL
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json(
        {
          appointmentId: apt.id,
          checkoutUrl: `${baseUrl}${localePrefix}/booking/confirm?session_id=dev_no_stripe`,
        } satisfies CreateBookingResponse,
        { status: 201 }
      );
    }

    const stripe = new Stripe(stripeSecretKey);
    const stripePriceId = svc.stripe_price_id;

    const lineItem: Stripe.Checkout.SessionCreateParams["line_items"] = [{
      quantity: 1,
      ...(stripePriceId
        ? { price: stripePriceId }
        : {
            price_data: {
              currency: (svc.currency ?? "eur").toLowerCase(),
              unit_amount: svc.price_cents,
              product_data: {
                name: svc.name,
                description: svc.description ?? undefined,
              },
            },
          }),
    }];

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItem,
      success_url: `${baseUrl}${localePrefix}/booking/confirm?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}${localePrefix}/book?cancelled=1`,
      metadata: {
        appointment_id: apt.id,
      },
      customer_email: clientEmail.trim(),
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    // @ts-expect-error Supabase untyped client update
    await supabase.from("appointments").update({
      stripe_session_id: session.id,
      updated_at: new Date().toISOString(),
    }).eq("id", apt.id);

    const checkoutUrl =
      session.url ?? `${baseUrl}/booking/confirm?session_id=${session.id}`;

    return NextResponse.json(
      {
        appointmentId: apt.id,
        checkoutUrl,
      } satisfies CreateBookingResponse,
      { status: 201 }
    );
  } catch (e) {
    console.error("[api/booking]", e);
    return serverError();
  }
}
