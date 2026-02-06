"use client";

import { useState, useEffect, useCallback } from "react";
import type { Service } from "@/lib/types";
import { useAdminLocale } from "../../AdminLocaleProvider";

type Appointment = {
  id: string;
  serviceId: string;
  consultationType: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string | null;
  requestedStartAt: string;
  durationMinutes: number;
  status: string;
  videoRoomUrl: string | null;
};

function formatDate(iso: string, locale: string): string {
  try {
    return new Date(iso).toLocaleString(locale === "en" ? "en-GB" : "it-IT", {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: "Europe/Rome",
    });
  } catch {
    return iso;
  }
}

export default function AdminAppointmentsPage() {
  const { locale, t } = useAdminLocale();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const from = new Date();
      const to = new Date();
      to.setDate(to.getDate() + 14);
      const fromStr = from.toISOString().slice(0, 10);
      const toStr = to.toISOString().slice(0, 10);

      const [appRes, svcRes] = await Promise.all([
        fetch(`/api/admin/appointments?from=${fromStr}&to=${toStr}`, { credentials: "include" }),
        fetch("/api/admin/services", { credentials: "include" }),
      ]);

      if (!appRes.ok) {
        if (appRes.status === 401) throw new Error(t("appointments.sessionExpired"));
        throw new Error(`Error ${appRes.status}`);
      }
      const appData = (await appRes.json()) as { appointments: Appointment[] };
      setAppointments(appData.appointments ?? []);

      if (svcRes.ok) {
        const svcData = (await svcRes.json()) as { services: Service[] };
        setServices(svcData.services ?? []);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t("appointments.loadError"));
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const serviceName = (id: string) => services.find((s) => s.id === id)?.name ?? id.slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900">{t("appointments.title")}</h1>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-50"
        >
          {loading ? t("appointments.loading") : t("appointments.refresh")}
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {!loading && !error && appointments.length === 0 && (
        <p className="text-stone-600">{t("appointments.noAppointments")}</p>
      )}

      {appointments.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-stone-900">{t("appointments.dateTime")}</th>
                <th className="px-4 py-3 font-semibold text-stone-900">{t("appointments.client")}</th>
                <th className="px-4 py-3 font-semibold text-stone-900">{t("appointments.service")}</th>
                <th className="px-4 py-3 font-semibold text-stone-900">{t("appointments.type")}</th>
                <th className="px-4 py-3 font-semibold text-stone-900">{t("appointments.status")}</th>
                <th className="px-4 py-3 font-semibold text-stone-900">{t("appointments.video")}</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt) => (
                <tr key={apt.id} className="border-b border-stone-100">
                  <td className="px-4 py-3 text-stone-700">{formatDate(apt.requestedStartAt, locale)}</td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-stone-900">{apt.clientName}</span>
                    <br />
                    <span className="text-stone-500">{apt.clientEmail}</span>
                  </td>
                  <td className="px-4 py-3 text-stone-700">{serviceName(apt.serviceId)}</td>
                  <td className="px-4 py-3 text-stone-700">
                    {apt.consultationType === "online" ? t("appointments.online") : t("appointments.inPerson")}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        apt.status === "confirmed"
                          ? "text-green-600"
                          : apt.status === "pending_payment"
                            ? "text-amber-600"
                            : "text-stone-600"
                      }
                    >
                      {apt.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {apt.videoRoomUrl ? (
                      <a
                        href={apt.videoRoomUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {t("appointments.openVideo")}
                      </a>
                    ) : (
                      <span className="text-stone-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-sm text-stone-500">{t("appointments.note")}</p>
    </div>
  );
}
