"use client";

import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { Link } from "@/i18n/navigation";

type RetrievedAppointment = {
  id: string;
  requestedStartAt: string;
  durationMinutes: number;
  videoRoomUrl: string | null;
  serviceName: string;
};

function formatDateTime(isoUtc: string): string {
  const d = new Date(isoUtc);
  return d.toLocaleString(undefined, {
    dateStyle: "long",
    timeStyle: "short",
  });
}

export function RetrieveBookingContent() {
  const t = useTranslations("bookingRetrieve");
  const [email, setEmail] = useState("");
  const [appointments, setAppointments] = useState<RetrievedAppointment[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = email.trim().toLowerCase();
      if (!trimmed) return;
      setLoading(true);
      setError(null);
      setAppointments(null);
      try {
        const res = await fetch("/api/booking/retrieve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: trimmed }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data?.message ?? "Request failed");
          return;
        }
        const data = await res.json();
        setAppointments(data.appointments ?? []);
      } catch {
        setError("Request failed");
      } finally {
        setLoading(false);
      }
    },
    [email]
  );

  const copyLink = useCallback((url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  return (
    <div className="container-narrow py-12">
      <div className="rounded-2xl border border-primary/15 bg-primary/[0.04] p-8 shadow-sm sm:p-10">
        <h1 className="text-2xl font-bold text-stone-900 sm:text-3xl">{t("title")}</h1>
        <p className="mt-2 text-stone-600">{t("lead")}</p>

        <form onSubmit={submit} className="mt-6">
          <label htmlFor="retrieve-email" className="sr-only">
            {t("emailPlaceholder")}
          </label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              id="retrieve-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("emailPlaceholder")}
              className="min-w-0 flex-1 rounded-lg border border-stone-300 px-3 py-2 text-stone-900 placeholder:text-stone-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              required
              autoComplete="email"
            />
            <button
              type="submit"
              disabled={loading}
              className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60"
            >
              {loading ? "…" : t("submit")}
            </button>
          </div>
        </form>

        {error && (
          <p className="mt-4 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        {appointments && (
          <div className="mt-8">
            {appointments.length === 0 ? (
              <p className="text-stone-600">{t("noResults")}</p>
            ) : (
              <ul className="space-y-4">
                {appointments.map((a) => (
                  <li
                    key={a.id}
                    className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm"
                  >
                    <dl className="grid gap-2 sm:grid-cols-2">
                      <div>
                        <dt className="text-sm font-medium text-stone-500">{t("when")}</dt>
                        <dd className="text-stone-900">{formatDateTime(a.requestedStartAt)}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-stone-500">{t("service")}</dt>
                        <dd className="text-stone-900">{a.serviceName}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-stone-500">{t("duration")}</dt>
                        <dd className="text-stone-900">{a.durationMinutes} min</dd>
                      </div>
                      {a.videoRoomUrl && (
                        <div className="sm:col-span-2">
                          <dt className="text-sm font-medium text-stone-500">{t("videoLink")}</dt>
                          <dd className="mt-0.5 flex flex-wrap items-center gap-2">
                            <a
                              href={a.videoRoomUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary-hover underline break-all"
                            >
                              {a.videoRoomUrl}
                            </a>
                            <button
                              type="button"
                              onClick={() => copyLink(a.videoRoomUrl!, a.id)}
                              className="shrink-0 rounded border border-stone-300 bg-white px-2 py-1 text-xs font-medium text-stone-700 hover:bg-stone-50"
                            >
                              {copiedId === a.id ? t("copied") : t("copyLink")}
                            </button>
                          </dd>
                        </div>
                      )}
                    </dl>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <p className="mt-8">
          <Link
            href="/book"
            className="inline-flex items-center justify-center rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
          >
            {t("backToBook")}
          </Link>
        </p>
      </div>
    </div>
  );
}
