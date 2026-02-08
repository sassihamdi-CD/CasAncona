/**
 * POST /api/booking — create appointment (pending_payment), upload passport, return Stripe Checkout URL.
 * Body: multipart/form-data with serviceId, consultationType, startAt, clientName, clientEmail,
 * clientPhone, clientMessage?, locale?, and required file "passport" (image or PDF, max 5 MB).
 */

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import { getAvailableSlots } from "@/lib/slots/compute";
import { badRequest, conflict, notFound, serverError } from "@/lib/api/response";
import type { CreateBookingResponse } from "@/lib/types";
import { AppointmentStatus } from "@/lib/types";
import {
  PASSPORT_DOCUMENTS_BUCKET,
  PASSPORT_UPLOAD_MAX_BYTES,
  isPassportAllowedMimeType,
} from "@/lib/constants/storage";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const CONSULTATION_TYPES = ["in_person", "online"] as const;

/** In-person at office: fixed 100 €, paid in advance (lawyer requirement). */
const IN_PERSON_PRICE_CENTS = 10000;

function getString(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
}

function getPassportFile(formData: FormData): File | null {
  const v = formData.get("passport");
  return v instanceof File && v.size > 0 ? v : null;
}

/** Derive safe file extension for storage path. */
function getPassportExtension(file: File): string {
  const name = file.name?.trim() || "";
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "jpg" || ext === "jpeg" || ext === "png" || ext === "pdf") return ext;
  if (file.type === "image/jpeg") return "jpg";
  if (file.type === "image/png") return "png";
  if (file.type === "application/pdf") return "pdf";
  return "jpg";
}

export async function POST(request: NextRequest) {
  try {
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return badRequest("Invalid form data");
    }

    const serviceId = getString(formData, "serviceId").trim();
    const consultationType = getString(formData, "consultationType").trim();
    const startAt = getString(formData, "startAt").trim();
    const clientName = getString(formData, "clientName").trim();
    const clientEmail = getString(formData, "clientEmail").trim();
    const clientPhone = getString(formData, "clientPhone").trim();
    const clientMessage = getString(formData, "clientMessage").trim();
    const locale = getString(formData, "locale").trim() || "it";

    if (
      !UUID_REGEX.test(serviceId) ||
      !CONSULTATION_TYPES.includes(consultationType as (typeof CONSULTATION_TYPES)[number]) ||
      !startAt ||
      !clientName ||
      !clientEmail ||
      !clientPhone
    ) {
      return badRequest(
        "Missing or invalid fields: serviceId, consultationType (in_person|online), startAt, clientName, clientEmail, clientPhone"
      );
    }

    const passportFile = getPassportFile(formData);
    if (!passportFile) {
      return badRequest("Passport photo is required (image or PDF, max 5 MB)");
    }
    if (passportFile.size > PASSPORT_UPLOAD_MAX_BYTES) {
      return badRequest("Passport file is too large (max 5 MB)");
    }
    const mime = (passportFile.type || "").toLowerCase().split(";")[0].trim();
    if (!isPassportAllowedMimeType(mime)) {
      return badRequest("Passport must be image (JPEG, PNG) or PDF");
    }

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
        client_name: clientName,
        client_email: clientEmail.toLowerCase(),
        client_phone: clientPhone,
        client_message: clientMessage || null,
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
    const ext = getPassportExtension(passportFile);
    const storagePath = `${apt.id}/passport.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(PASSPORT_DOCUMENTS_BUCKET)
      .upload(storagePath, passportFile, {
        contentType: passportFile.type || (ext === "pdf" ? "application/pdf" : "image/jpeg"),
        upsert: true,
      });

    if (uploadError) {
      console.error("[api/booking] passport upload error:", uploadError);
      return serverError();
    }

    await supabase
      .from("appointments")
      .update({
        passport_document_path: storagePath,
        updated_at: new Date().toISOString(),
      })
      .eq("id", apt.id);

    const baseUrl = request.nextUrl.origin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const localePrefix = locale ? `/${locale}` : "";

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

    const lineItem: Stripe.Checkout.SessionCreateParams["line_items"] = [
      {
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
      },
    ];

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItem,
      success_url: `${baseUrl}${localePrefix}/booking/confirm?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}${localePrefix}/book?cancelled=1`,
      metadata: { appointment_id: apt.id },
      customer_email: clientEmail,
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    await supabase
      .from("appointments")
      .update({
        stripe_session_id: session.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", apt.id);

    const checkoutUrl =
      session.url ?? `${baseUrl}/booking/confirm?session_id=${session.id}`;

    return NextResponse.json(
      { appointmentId: apt.id, checkoutUrl } satisfies CreateBookingResponse,
      { status: 201 }
    );
  } catch (e) {
    console.error("[api/booking]", e);
    return serverError();
  }
}
