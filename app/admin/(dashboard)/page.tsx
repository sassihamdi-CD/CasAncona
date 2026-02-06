import { getSupabaseAdmin } from "@/lib/supabase/server";
import { getSessionFromCookies } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { DashboardHomeClient } from "./dashboard/DashboardHomeClient";

export const dynamic = "force-dynamic";

export default async function DashboardHomePage() {
  const session = await getSessionFromCookies();
  if (!session) redirect("/admin/login");

  const supabase = getSupabaseAdmin();
  const today = new Date().toISOString().slice(0, 10);
  const inSeven = new Date();
  inSeven.setDate(inSeven.getDate() + 7);
  const toStr = inSeven.toISOString().slice(0, 10);

  const [todayRes, upcomingRes, servicesRes] = await Promise.all([
    supabase.from("appointments").select("*", { count: "exact", head: true }).gte("requested_start_at", `${today}T00:00:00`).lt("requested_start_at", `${today}T23:59:59`),
    supabase.from("appointments").select("*", { count: "exact", head: true }).gte("requested_start_at", `${today}T00:00:00`).lte("requested_start_at", `${toStr}T23:59:59`),
    supabase.from("services").select("id, active"),
  ]);

  const todayCount = todayRes.count ?? 0;
  const upcomingCount = upcomingRes.count ?? 0;
  const services = servicesRes.data ?? [];
  const totalServices = services.length;
  const activeServices = services.filter((s: { active: boolean }) => s.active).length;

  return (
    <DashboardHomeClient
      todayCount={todayCount}
      upcomingCount={upcomingCount}
      totalServices={totalServices}
      activeServices={activeServices}
    />
  );
}
