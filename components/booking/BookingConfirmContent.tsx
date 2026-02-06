"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { fetchBookingConfirm } from "@/lib/api/client";
import type { AppointmentConfirmation } from "@/lib/types";

function formatDateTime(isoUtc: string): string {
  const d = new Date(isoUtc);
  return d.toLocaleString(undefined, {
    dateStyle: "long",
    timeStyle: "short",
  });
}

export function BookingConfirmContent() {
  const searchParams = useSearchParams();
  const t = useTranslations("bookingConfirm");
  const [data, setData] = useState<AppointmentConfirmation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const sessionId = searchParams?.get("session_id");
    const appointmentId = searchParams?.get("appointment_id");
    if (!sessionId && !appointmentId) {
      setError("Missing session_id or appointment_id");
      setLoading(false);
      return;
    }
    try {
      const res = await fetchBookingConfirm({
        sessionId: sessionId ?? undefined,
        appointmentId: appointmentId ?? undefined,
      });
      setData(res.appointment);
    } catch {
      setError("Could not load booking details.");
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="container-narrow py-12 text-center text-stone-600">
        Loading…
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="container-narrow py-12 text-center">
        <p className="text-red-600">{error ?? "Booking not found."}</p>
        <Link href="/book" className="mt-4 inline-block text-primary hover:text-primary-hover">
          {t("backHome")}
        </Link>
      </div>
    );
  }

  return (
    <div className="container-narrow py-12">
        <div className="rounded-2xl border border-primary/15 bg-primary/[0.04] p-8 shadow-sm sm:p-10">
          <h1 className="text-2xl font-bold text-stone-900 sm:text-3xl">{t("title")}</h1>
          <dl className="mt-6 space-y-3">
            <div>
              <dt className="text-sm font-medium text-stone-500">{t("when")}</dt>
              <dd className="mt-0.5 text-stone-900">{formatDateTime(data.requestedStartAt)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-stone-500">Servizio</dt>
              <dd className="mt-0.5 text-stone-900">{data.serviceName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-stone-500">{t("duration")}</dt>
              <dd className="mt-0.5 text-stone-900">{data.durationMinutes} min</dd>
            </div>
            {data.videoRoomUrl && (
              <div>
                <dt className="text-sm font-medium text-stone-500">{t("videoLink")}</dt>
                <dd className="mt-0.5">
                  <a
                    href={data.videoRoomUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary-hover underline"
                  >
                    {data.videoRoomUrl}
                  </a>
                </dd>
              </div>
            )}
            {data.status === "confirmed" && !data.videoRoomUrl && (
              <p className="mt-4 text-sm text-stone-500">{t("videoLinkHint")}</p>
            )}
          </dl>
          <p className="mt-8">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
            >
              {t("backHome")}
            </Link>
          </p>
        </div>
    </div>
  );
}
