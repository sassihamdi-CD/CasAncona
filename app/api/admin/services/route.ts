/**
 * GET /api/admin/services — list all services (including inactive).
 * POST /api/admin/services — create a service.
 * Protected: x-admin-key header.
 */

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { mapService, serviceToDbInsert } from "@/lib/db/map";
import type { ServiceRow } from "@/lib/db/map";
import { requireAdminAuth } from "@/lib/auth/admin";
import { unauthorized, serverError, badRequest } from "@/lib/api/response";
import type {
  GetAdminServicesResponse,
  CreateAdminServiceBody,
  CreateAdminServiceResponse,
} from "@/lib/types";
import { translateServiceContent } from "@/lib/translate";

export async function GET(request: NextRequest) {
  if (!requireAdminAuth(request)) return unauthorized();

  try {
    const { data, error } = await getSupabaseAdmin()
      .from("services")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("[api/admin/services] GET", error);
      return serverError();
    }

    const services = (data ?? []).map((row) => mapService(row as ServiceRow));
    const body: GetAdminServicesResponse = { services };
    return NextResponse.json(body);
  } catch (e) {
    console.error("[api/admin/services] GET", e);
    return serverError();
  }
}

export async function POST(request: NextRequest) {
  if (!requireAdminAuth(request)) return unauthorized();

  try {
    const raw = await request.json();
    const body = raw as CreateAdminServiceBody;

    if (
      typeof body.name !== "string" ||
      body.name.trim() === "" ||
      typeof body.durationMinutes !== "number" ||
      typeof body.priceCents !== "number" ||
      typeof body.currency !== "string"
    ) {
      return badRequest(
        "Missing or invalid: name (non-empty string), durationMinutes (number), priceCents (number), currency (string)."
      );
    }

    const source = {
      name: body.name.trim(),
      description: body.description ?? null,
      documentsRequired: body.documentsRequired ?? null,
    };
    const translated = await translateServiceContent(source);

    const insert = serviceToDbInsert({
      name: body.name.trim(),
      nameEn: translated?.nameEn ?? body.nameEn ?? null,
      nameAr: translated?.nameAr ?? body.nameAr ?? null,
      nameFr: translated?.nameFr ?? body.nameFr ?? null,
      description: body.description ?? null,
      descriptionEn: translated?.descriptionEn ?? body.descriptionEn ?? null,
      descriptionAr: translated?.descriptionAr ?? body.descriptionAr ?? null,
      descriptionFr: translated?.descriptionFr ?? body.descriptionFr ?? null,
      documentsRequired: body.documentsRequired ?? null,
      documentsRequiredEn: translated?.documentsRequiredEn ?? body.documentsRequiredEn ?? null,
      documentsRequiredAr: translated?.documentsRequiredAr ?? body.documentsRequiredAr ?? null,
      documentsRequiredFr: translated?.documentsRequiredFr ?? body.documentsRequiredFr ?? null,
      durationMinutes: body.durationMinutes,
      priceCents: body.priceCents,
      currency: body.currency,
      stripePriceId: body.stripePriceId ?? null,
      active: body.active ?? true,
      sortOrder: body.sortOrder ?? 0,
    });

    const { data, error } = await getSupabaseAdmin()
      .from("services")
      // @ts-expect-error Supabase generated type is overly strict for insert
      .insert(insert)
      .select()
      .single();

    if (error) {
      console.error("[api/admin/services] POST", error);
      return serverError();
    }

    const service = mapService(data as ServiceRow);
    const res: CreateAdminServiceResponse = { service };
    return NextResponse.json(res, { status: 201 });
  } catch (e) {
    console.error("[api/admin/services] POST", e);
    return serverError();
  }
}
