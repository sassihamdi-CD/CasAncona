/**
 * GET /api/services/[id] — get one service by id.
 * Returns 404 if not found or inactive.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { mapService } from "@/lib/db/map";
import type { Database } from "@/lib/supabase/database.types";
import { serverError, notFound } from "@/lib/api/response";
import type { GetServiceResponse } from "@/lib/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("id", id)
      .eq("active", true)
      .single();

    if (error || !data) {
      return notFound("Service not found");
    }

    type ServiceRow = Database["public"]["Tables"]["services"]["Row"];
    const body: GetServiceResponse = { service: mapService(data as ServiceRow) };
    return NextResponse.json(body);
  } catch (e) {
    console.error("[api/services/[id]]", e);
    return serverError();
  }
}
