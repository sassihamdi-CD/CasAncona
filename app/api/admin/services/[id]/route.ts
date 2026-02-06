/**
 * GET /api/admin/services/[id] — get one service.
 * PATCH /api/admin/services/[id] — update service.
 * DELETE /api/admin/services/[id] — soft delete (set active = false).
 * Protected: x-admin-key header.
 */

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { mapService, serviceToDbUpdate } from "@/lib/db/map";
import type { ServiceRow } from "@/lib/db/map";
import { requireAdminAuth } from "@/lib/auth/admin";
import { unauthorized, serverError, notFound, badRequest, conflict } from "@/lib/api/response";
import type {
  GetAdminServiceResponse,
  PatchAdminServiceBody,
  PatchAdminServiceResponse,
} from "@/lib/types";
import { translateServiceContent } from "@/lib/translate";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  if (!requireAdminAuth(_request)) return unauthorized();

  const { id } = await context.params;
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("services")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return notFound("Service not found");
    }

    const service = mapService(data as ServiceRow);
    const body: GetAdminServiceResponse = { service };
    return NextResponse.json(body);
  } catch (e) {
    console.error("[api/admin/services/[id]] GET", e);
    return serverError();
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  if (!requireAdminAuth(request)) return unauthorized();

  const { id } = await context.params;
  try {
    const raw = await request.json();
    const body = raw as PatchAdminServiceBody;

    const hasTextUpdate =
      body.name !== undefined ||
      body.description !== undefined ||
      body.documentsRequired !== undefined;

    let mergedBody = body;
    if (hasTextUpdate) {
      const { data: current } = await getSupabaseAdmin()
        .from("services")
        .select("name, description, documents_required")
        .eq("id", id)
        .single();

      const row = current as { name: string; description: string | null; documents_required: string | null } | null;
      const source = {
        name: (body.name ?? row?.name ?? "").trim(),
        description: body.description !== undefined ? body.description : (row?.description ?? null),
        documentsRequired: body.documentsRequired !== undefined ? body.documentsRequired : (row?.documents_required ?? null),
      };
      const translated = await translateServiceContent(source);
      if (translated) {
        mergedBody = {
          ...body,
          nameEn: body.nameEn ?? translated.nameEn,
          nameAr: body.nameAr ?? translated.nameAr,
          nameFr: body.nameFr ?? translated.nameFr,
          descriptionEn: body.descriptionEn ?? translated.descriptionEn,
          descriptionAr: body.descriptionAr ?? translated.descriptionAr,
          descriptionFr: body.descriptionFr ?? translated.descriptionFr,
          documentsRequiredEn: body.documentsRequiredEn ?? translated.documentsRequiredEn,
          documentsRequiredAr: body.documentsRequiredAr ?? translated.documentsRequiredAr,
          documentsRequiredFr: body.documentsRequiredFr ?? translated.documentsRequiredFr,
        };
      }
    }

    const update = serviceToDbUpdate(mergedBody);
    if (Object.keys(update).length === 0) {
      return badRequest("No fields to update.");
    }

    const { data, error } = await getSupabaseAdmin()
      .from("services")
      // @ts-expect-error Supabase generated type is overly strict for partial update
      .update(update)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[api/admin/services/[id]] PATCH", error);
      return serverError();
    }
    if (!data) return notFound("Service not found");

    const service = mapService(data as ServiceRow);
    const res: PatchAdminServiceResponse = { service };
    return NextResponse.json(res);
  } catch (e) {
    console.error("[api/admin/services/[id]] PATCH", e);
    return serverError();
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!requireAdminAuth(request)) return unauthorized();

  const { id } = await context.params;
  const url = new URL(request.url);
  const permanent = url.searchParams.get("permanent") === "true";

  const supabase = getSupabaseAdmin();

  if (permanent) {
    try {
      const { count, error: countError } = await supabase
        .from("appointments")
        .select("id", { count: "exact", head: true })
        .eq("service_id", id);

      if (countError) {
        console.error("[api/admin/services/[id]] DELETE count", countError);
        return serverError();
      }
      if ((count ?? 0) > 0) {
        return conflict("Cannot delete: this service has appointments. Deactivate it instead.");
      }

      const { error } = await supabase.from("services").delete().eq("id", id);

      if (error) {
        console.error("[api/admin/services/[id]] DELETE permanent", error);
        return serverError();
      }
      return NextResponse.json({ deleted: true });
    } catch (e) {
      console.error("[api/admin/services/[id]] DELETE permanent", e);
      return serverError();
    }
  }

  try {
    const { data, error } = await supabase
      .from("services")
      // @ts-expect-error Supabase generated type is overly strict for partial update
      .update({ active: false })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[api/admin/services/[id]] DELETE", error);
      return serverError();
    }
    if (!data) return notFound("Service not found");

    const service = mapService(data as ServiceRow);
    return NextResponse.json({ service });
  } catch (e) {
    console.error("[api/admin/services/[id]] DELETE", e);
    return serverError();
  }
}
