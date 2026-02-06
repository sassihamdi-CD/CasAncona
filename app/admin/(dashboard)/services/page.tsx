"use client";

import { useState, useEffect, useCallback } from "react";
import type { Service } from "@/lib/types";
import { getServiceName } from "@/lib/i18n/service";
import type { Locale } from "@/lib/i18n/service";
import { AdminServiceForm } from "../../AdminServiceForm";
import { useAdminLocale } from "../../AdminLocaleProvider";

export default function AdminServicesPage() {
  const { t, locale } = useAdminLocale();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [serviceForm, setServiceForm] = useState<Service | null | "new">(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/services", { credentials: "include" });
      if (!res.ok) {
        if (res.status === 401) throw new Error(t("services.sessionExpired"));
        throw new Error(`Error ${res.status}`);
      }
      const data = (await res.json()) as { services: Service[] };
      setServices(data.services ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("services.loadError"));
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSaved = useCallback(() => {
    load();
  }, [load]);

  const handleDeactivate = useCallback(
    async (s: Service) => {
      try {
        const res = await fetch(`/api/admin/services/${s.id}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (res.ok) load();
      } catch {
        setError(t("services.errorDeactivate"));
      }
    },
    [load, t]
  );

  const handleReactivate = useCallback(
    async (s: Service) => {
      try {
        const res = await fetch(`/api/admin/services/${s.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ active: true }),
        });
        if (res.ok) load();
      } catch {
        setError(t("services.errorReactivate"));
      }
    },
    [load, t]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900">{t("services.title")}</h1>
        <button
          type="button"
          onClick={() => setServiceForm("new")}
          className="rounded-lg bg-stone-800 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700"
        >
          {t("services.addService")}
        </button>
      </div>

      <p className="text-sm text-stone-600">{t("services.description")}</p>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {loading && <p className="text-stone-500">{t("appointments.loading")}</p>}

      {!loading && services.length === 0 && !error && (
        <p className="text-stone-600">{t("services.noServices")}</p>
      )}

      {!loading && services.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-stone-900">{t("services.name")}</th>
                <th className="px-4 py-3 font-semibold text-stone-900">{t("services.active")}</th>
                <th className="px-4 py-3 font-semibold text-stone-900">{t("services.order")}</th>
                <th className="px-4 py-3 font-semibold text-stone-900">{t("services.duration")}</th>
                <th className="px-4 py-3 font-semibold text-stone-900">{t("services.price")}</th>
                <th className="px-4 py-3 font-semibold text-stone-900">{t("services.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr
                  key={s.id}
                  className={`border-b border-stone-100 ${!s.active ? "bg-stone-50" : ""}`}
                >
                  <td className="px-4 py-3 font-medium text-stone-900">{getServiceName(s, locale as Locale) || s.name}</td>
                  <td className="px-4 py-3">{s.active ? t("services.yes") : t("services.no")}</td>
                  <td className="px-4 py-3 text-stone-700">{s.sortOrder}</td>
                  <td className="px-4 py-3 text-stone-700">{s.durationMinutes} min</td>
                  <td className="px-4 py-3 text-stone-700">
                    {(s.priceCents / 100).toFixed(2)} {s.currency}
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setServiceForm(s)}
                      className="text-stone-700 underline hover:text-stone-900"
                    >
                      {t("services.edit")}
                    </button>
                    {s.active ? (
                      <button
                        type="button"
                        onClick={() => handleDeactivate(s)}
                        className="text-amber-700 underline hover:text-amber-800"
                      >
                        {t("services.deactivate")}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleReactivate(s)}
                        className="text-green-700 underline hover:text-green-800"
                      >
                        {t("services.reactivate")}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {serviceForm !== null && (
        <AdminServiceForm
          service={serviceForm === "new" ? null : serviceForm}
          onClose={() => setServiceForm(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
