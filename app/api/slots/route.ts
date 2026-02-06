/**
 * GET /api/slots — available slots for a date and service.
 * Query: date (YYYY-MM-DD), serviceId (UUID).
 */

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { getAvailableSlots } from "@/lib/slots/compute";
import { badRequest, notFound, serverError } from "@/lib/api/response";
import type { GetSlotsResponse } from "@/lib/types";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const serviceId = searchParams.get("serviceId");

    if (!date || !DATE_REGEX.test(date)) {
      return badRequest("Invalid or missing query: date (YYYY-MM-DD)");
    }
    if (!serviceId || !UUID_REGEX.test(serviceId)) {
      return badRequest("Invalid or missing query: serviceId (UUID)");
    }

    const slots = await getAvailableSlots(date, serviceId);
    const body: GetSlotsResponse = { slots };
    return NextResponse.json(body);
  } catch (e) {
    console.error("[api/slots]", e);
    return serverError();
  }
}
