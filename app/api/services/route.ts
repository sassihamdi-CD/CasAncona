/**
 * GET /api/services — list active services (for landing + booking).
 * Services are fully data-driven; add rows in DB to add more services.
 */

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { mapService } from "@/lib/db/map";
import type { Database } from "@/lib/supabase/database.types";
import { serverError, serviceUnavailable } from "@/lib/api/response";
import type { GetServicesResponse } from "@/lib/types";

const SUPABASE_ENV_MESSAGE =
  "Database not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env, then run the migrations. See docs/SETUP_STEP_BY_STEP.md.";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("[api/services] Supabase error:", error);
      return serverError();
    }

    type ServiceRow = Database["public"]["Tables"]["services"]["Row"];
    const services = (data ?? []).map((row) => mapService(row as ServiceRow));
    const body: GetServicesResponse = { services };
    return NextResponse.json(body, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("Missing Supabase env")) {
      console.error("[api/services] Missing Supabase env. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env");
      return serviceUnavailable(SUPABASE_ENV_MESSAGE);
    }
    console.error("[api/services]", e);
    return serverError();
  }
}
