"use client";

import { useState, useEffect, useCallback } from "react";
import { useAdminLocale } from "../../AdminLocaleProvider";
import type { AdminClientSummary } from "@/lib/types";

function formatAmount(cents: number, currency: string): string {
  if (cents === 0) return "—";
  const amount = (cents / 100).toFixed(2);
  const c = (currency || "eur").toUpperCase();
  if (c === "EUR") return `€${amount}`;
  return `${amount} ${c}`;
}

export default function AdminClientsPage() {
  const { t } = useAdminLocale();
  const [clients, setClients] = useState<AdminClientSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      const res = await fetch(`/api/admin/clients?${params}`, { credentials: "include" });
      if (!res.ok) {
        if (res.status === 401) throw new Error(t("appointments.sessionExpired"));
        throw new Error(t("clients.loadError"));
      }
      const data = (await res.json()) as { clients: AdminClientSummary[]; total: number };
      setClients(data.clients ?? []);
      setTotal(data.total ?? 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("clients.loadError"));
      setClients([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [search, t]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-stone-900">{t("clients.title")}</h1>
        <p className="text-sm text-stone-600">
          {t("clients.clientCount", { count: loading ? "…" : total })}
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <label htmlFor="client-search" className="sr-only">
          {t("clients.searchPlaceholder")}
        </label>
        <input
          id="client-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("clients.searchPlaceholder")}
          className="w-full max-w-md rounded-lg border border-stone-200 px-4 py-2.5 text-stone-900 placeholder:text-stone-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          autoComplete="off"
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="rounded-xl border border-stone-200 bg-white p-8 text-center text-stone-500">
          {t("appointments.loading")}
        </div>
      ) : clients.length === 0 ? (
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-8 text-center text-stone-600">
          {t("clients.noClients")}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
          <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="sticky top-0 z-10 border-b border-stone-200 bg-stone-50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-stone-900">{t("clients.name")}</th>
                  <th className="px-4 py-3 font-semibold text-stone-900">{t("clients.email")}</th>
                  <th className="px-4 py-3 font-semibold text-stone-900">{t("clients.phone")}</th>
                  <th className="px-4 py-3 font-semibold text-stone-900">{t("clients.totalPaid")}</th>
                  <th className="px-4 py-3 font-semibold text-stone-900">{t("clients.appointments")}</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c, i) => (
                  <tr
                    key={`${c.clientEmail}-${i}`}
                    className="border-b border-stone-100 hover:bg-stone-50/50"
                  >
                    <td className="px-4 py-3 font-medium text-stone-900">{c.clientName || "—"}</td>
                    <td className="px-4 py-3 text-stone-700">{c.clientEmail}</td>
                    <td className="px-4 py-3 text-stone-700">{c.clientPhone || "—"}</td>
                    <td className="px-4 py-3 text-stone-700">
                      {formatAmount(c.totalPaidCents, c.currency)}
                    </td>
                    <td className="px-4 py-3 text-stone-600">{c.appointmentCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && clients.length > 0 && (
        <p className="text-sm text-stone-500">
          {t("clients.clientCount", { count: total })}
        </p>
      )}
    </div>
  );
}
