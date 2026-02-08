import { getSupabaseAdmin } from "@/lib/supabase/server";
import { getSessionFromCookies } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { DashboardHomeClient } from "./dashboard/DashboardHomeClient";

export const dynamic = "force-dynamic";

/** YYYY-MM-DD for a date, then add days (in UTC). */
function addDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return date.toISOString().slice(0, 10);
}

export default async function DashboardHomePage() {
  const session = await getSessionFromCookies();
  if (!session) redirect("/admin/login");

  const supabase = getSupabaseAdmin();
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = addDays(today, 1);
  const inSevenDays = addDays(today, 7);

  // UTC boundaries matching stored timestamptz. Today = full day; Next 7 = today + 6 more days (7 total).
  const todayStart = `${today}T00:00:00.000Z`;
  const todayEnd = `${tomorrow}T00:00:00.000Z`;
  const next7End = `${inSevenDays}T00:00:00.000Z`;

  const [todayRes, upcomingRes, servicesRes] = await Promise.all([
    supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .gte("requested_start_at", todayStart)
      .lt("requested_start_at", todayEnd),
    supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .gte("requested_start_at", todayStart)
      .lt("requested_start_at", next7End),
    supabase.from("services").select("id, active"),
  ]);

  const todayCount = todayRes.count ?? 0;
  const upcomingCount = upcomingRes.count ?? 0;
  const services = (servicesRes.data ?? []) as { id: string; active: boolean }[];
  const totalServices = services.length;
  const activeServices = services.filter((s) => s.active === true).length;

  return (
    <DashboardHomeClient
      todayCount={todayCount}
      upcomingCount={upcomingCount}
      totalServices={totalServices}
      activeServices={activeServices}
    />
  );
}
