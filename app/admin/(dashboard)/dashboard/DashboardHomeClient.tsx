"use client";

import Link from "next/link";
import { useAdminLocale } from "../../AdminLocaleProvider";

type Props = {
  todayCount: number;
  upcomingCount: number;
  totalServices: number;
  activeServices: number;
};

export function DashboardHomeClient({
  todayCount,
  upcomingCount,
  totalServices,
  activeServices,
}: Props) {
  const { t } = useAdminLocale();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-stone-900">{t("dashboard.title")}</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/admin/appointments"
          className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-primary/30 hover:shadow"
        >
          <p className="text-sm font-medium text-stone-500">{t("dashboard.today")}</p>
          <p className="mt-1 text-2xl font-bold text-stone-900">{todayCount}</p>
          <p className="mt-0.5 text-xs text-stone-400">{t("dashboard.appointments")}</p>
        </Link>
        <Link
          href="/admin/appointments"
          className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-primary/30 hover:shadow"
        >
          <p className="text-sm font-medium text-stone-500">{t("dashboard.next7Days")}</p>
          <p className="mt-1 text-2xl font-bold text-stone-900">{upcomingCount}</p>
          <p className="mt-0.5 text-xs text-stone-400">{t("dashboard.appointments")}</p>
        </Link>
        <Link
          href="/admin/services"
          className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-primary/30 hover:shadow"
        >
          <p className="text-sm font-medium text-stone-500">{t("dashboard.activeServices")}</p>
          <p className="mt-1 text-2xl font-bold text-stone-900">{activeServices}</p>
          <p className="mt-0.5 text-xs text-stone-400">
            {t("dashboard.ofTotal", { total: String(totalServices) })}
          </p>
        </Link>
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-stone-500">{t("dashboard.panel")}</p>
          <p className="mt-1 text-sm text-stone-600">{t("dashboard.panelDesc")}</p>
        </div>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-stone-900">{t("dashboard.quickAccess")}</h2>
        <ul className="mt-3 space-y-2 text-sm">
          <li>
            <Link href="/admin/appointments" className="text-primary hover:underline">
              {t("dashboard.viewAppointments")}
            </Link>
          </li>
          <li>
            <Link href="/admin/services" className="text-primary hover:underline">
              {t("dashboard.editServices")}
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
