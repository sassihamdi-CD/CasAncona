/**
 * POST /api/booking — create appointment (pending_payment) and return Stripe Checkout URL.
 * Body: serviceId, startAt (ISO UTC), clientName, clientEmail, clientPhone (required), clientMessage?
 */

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import { getAvailableSlots } from "@/lib/slots/compute";
import { badRequest, conflict, notFound, serverError } from "@/lib/api/response";
import type { CreateBookingBody, CreateBookingResponse } from "@/lib/types";
import { AppointmentStatus } from "@/lib/types";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const CONSULTATION_TYPES = ["in_person", "online"] as const;

/** In-person at office: fixed 100 €, paid in advance (lawyer requirement). */
const IN_PERSON_PRICE_CENTS = 10000;

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
    b.clientEmail.trim().length > 0 &&
    typeof b.clientPhone === "string" &&
    b.clientPhone.trim().length > 0
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
      return badRequest("Missing or invalid fields: serviceId, consultationType (in_person|online), startAt, clientName, clientEmail, clientPhone");
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

    const { data: appointment, error: insertError } = await supabase
      .from("appointments")
      .insert({
        service_id: serviceId,
        assigned_staff_id: slotMatch.staffId ?? null,
        consultation_type: consultationType,
        client_name: clientName.trim(),
        client_email: clientEmail.trim().toLowerCase(),
        client_phone: clientPhone.trim(),
        client_message: clientMessage?.trim() || null,
        requested_start_at: startAt,
        duration_minutes: durationMinutes,
        status: AppointmentStatus.PENDING_PAYMENT,
      } as never)
      .select("id")
      .single();

    if (insertError || !appointment) {
      if ((insertError as { code?: string } | null)?.code === "23505") {
        return conflict("Slot no longer available");
      }
      console.error("[api/booking] insert error:", insertError);
      return serverError();
    }

    const apt = appointment as { id: string };
    // Use request origin so redirect goes to the same port/host the user is on (avoids -102 when .env has different port)
    const baseUrl = request.nextUrl.origin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const locale = (body as CreateBookingBody).locale ?? "it";
    const localePrefix = locale ? `/${locale}` : "";

    // Both in-person and online: paid via Stripe (prices set per service in admin)
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
    const isInPerson = consultationType === "in_person";
    const stripePriceId = !isInPerson ? svc.stripe_price_id : null;
    const amountCents = isInPerson ? IN_PERSON_PRICE_CENTS : svc.price_cents;
    const productName = isInPerson ? `Consulenza in sede — ${svc.name}` : svc.name;

    const lineItem: Stripe.Checkout.SessionCreateParams["line_items"] = [{
      quantity: 1,
      ...(stripePriceId
        ? { price: stripePriceId }
        : {
            price_data: {
              currency: (svc.currency ?? "eur").toLowerCase(),
              unit_amount: amountCents,
              product_data: {
                name: productName,
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
