import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth/session";
import { AdminDashboardShell } from "./AdminDashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionFromCookies();
  if (!session) redirect("/admin/login");
  return <AdminDashboardShell email={session.email}>{children}</AdminDashboardShell>;
}
