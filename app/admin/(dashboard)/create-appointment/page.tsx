"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import type { Service } from "@/lib/types";
import type { AvailableSlot } from "@/lib/types";
import { useAdminLocale } from "../../AdminLocaleProvider";
import { DateSlotPicker } from "@/components/booking/DateSlotPicker";

function formatSlotTime(isoUtc: string): string {
  const d = new Date(isoUtc);
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export default function AdminCreateAppointmentPage() {
  const { locale, t } = useAdminLocale();
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState<string | null>(null);

  const [serviceId, setServiceId] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [startAt, setStartAt] = useState<string | null>(null);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [bookedSlots, setBookedSlots] = useState<AvailableSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientMessage, setClientMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/services", { credentials: "include" });
        if (!res.ok) throw new Error("Services failed");
        const data = (await res.json()) as { services: Service[] };
        if (!cancelled) {
          setServices(data.services ?? []);
          const active = (data.services ?? []).filter((s) => s.active);
          if (active[0]) setServiceId((prev) => (prev ? prev : active[0].id));
        }
      } catch {
        if (!cancelled) setServicesError(t("appointments.loadError"));
      } finally {
        if (!cancelled) setServicesLoading(false);
      }
    })();
    return () => { cancelled = true; };
    // Intentionally run once on mount to load services and set initial serviceId
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  const loadSlots = useCallback(async () => {
    if (!serviceId || !date) return;
    setSlotsLoading(true);
    setSlotsError(null);
    setSlots([]);
    setBookedSlots([]);
    setStartAt(null);
    try {
      const res = await fetch(
        `/api/slots?date=${encodeURIComponent(date)}&serviceId=${encodeURIComponent(serviceId)}&includeBooked=true`
      );
      if (!res.ok) throw new Error("Slots failed");
      const data = (await res.json()) as { slots: AvailableSlot[]; bookedSlots?: AvailableSlot[] };
      setSlots(data.slots ?? []);
      setBookedSlots(data.bookedSlots ?? []);
    } catch {
      setSlotsError(t("appointments.noSlots"));
    } finally {
      setSlotsLoading(false);
    }
  }, [serviceId, date, t]);

  useEffect(() => {
    if (date && serviceId) loadSlots();
  }, [date, serviceId, loadSlots]);

  const minDate = useMemo(() => new Date(), []);
  const maxDate = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 2);
    return d;
  }, []);
  const weekdayLabels = useMemo(() => {
    return [1, 2, 3, 4, 5, 6, 7].map((day) => {
      const d = new Date(2024, 0, day);
      return d.toLocaleDateString(locale === "en" ? "en-GB" : "it-IT", { weekday: "short" });
    });
  }, [locale]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceId || !startAt || !clientName.trim() || !clientEmail.trim() || !clientPhone.trim()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/admin/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          serviceId,
          startAt,
          clientName: clientName.trim(),
          clientEmail: clientEmail.trim().toLowerCase(),
          clientPhone: clientPhone.trim(),
          clientMessage: clientMessage.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 409) {
        setSubmitError(t("appointments.createErrorSlot"));
        setSubmitting(false);
        loadSlots();
        return;
      }
      if (!res.ok) {
        setSubmitError((data as { message?: string })?.message ?? t("appointments.createError"));
        setSubmitting(false);
        return;
      }
      setSuccess(true);
      setServiceId(services.filter((s) => s.active)[0]?.id ?? "");
      setDate("");
      setStartAt(null);
      setClientName("");
      setClientEmail("");
      setClientPhone("");
      setClientMessage("");
      setSubmitError(null);
    } catch {
      setSubmitError(t("appointments.createError"));
    } finally {
      setSubmitting(false);
    }
  };

  const activeServices = services.filter((s) => s.active);

  if (servicesLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-stone-500">
        {t("appointments.loading")}
      </div>
    );
  }

  if (servicesError) {
    return (
      <div className="space-y-4">
        <p className="text-red-600">{servicesError}</p>
        <Link
          href="/admin/appointments"
          className="text-sm text-primary hover:underline"
        >
          ← {t("appointments.title")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/appointments"
          className="text-sm text-stone-500 hover:text-stone-700"
        >
          ← {t("appointments.title")}
        </Link>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-stone-900 mb-1">
          {t("appointments.createTitle")}
        </h1>
        <p className="text-sm text-stone-500 mb-6">
          {t("appointments.createAppointment")}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              {t("appointments.createService")} *
            </label>
            <select
              value={serviceId}
              onChange={(e) => {
                setServiceId(e.target.value);
                setDate("");
                setStartAt(null);
              }}
              required
              className="w-full rounded-lg border border-stone-200 px-3 py-2 text-stone-900"
            >
              <option value="">—</option>
              {activeServices.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.durationMinutes} min)
                </option>
              ))}
            </select>
          </div>

          {serviceId && (
            <DateSlotPicker
              locale={locale}
              selectedDate={date}
              onSelectDate={setDate}
              slots={slots}
              bookedSlots={bookedSlots}
              slotsLoading={slotsLoading}
              slotsError={slotsError}
              selectedStartAt={startAt}
              onSelectSlot={setStartAt}
              minDate={minDate}
              maxDate={maxDate}
              formatSlotTime={formatSlotTime}
              labels={{
                selectDate: t("appointments.selectDate"),
                selectTime: t("appointments.selectTime"),
                loading: t("appointments.loading"),
                noSlots: t("appointments.noSlots"),
                error: t("appointments.loadError"),
                slotBooked: t("appointments.slotBooked"),
                weekdays: weekdayLabels,
              }}
            />
          )}

          <div className="border-t border-stone-200 pt-6">
            <p className="text-sm font-medium text-stone-700 mb-3">
              {t("appointments.client")}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">
                  {t("appointments.createClientName")} *
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                  className="w-full rounded-lg border border-stone-200 px-3 py-2 text-stone-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">
                  {t("appointments.createClientEmail")} *
                </label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-stone-200 px-3 py-2 text-stone-900"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-stone-600 mb-1">
                {t("appointments.createClientPhone")} *
              </label>
              <input
                type="tel"
                required
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full max-w-xs rounded-lg border border-stone-200 px-3 py-2 text-stone-900"
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-stone-600 mb-1">
                {t("appointments.createClientMessage")}
              </label>
              <textarea
                value={clientMessage}
                onChange={(e) => setClientMessage(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-stone-900"
              />
            </div>
          </div>

          {success && (
            <p className="text-sm font-medium text-green-600">
              {t("appointments.createSuccess")}
            </p>
          )}
          {submitError && (
            <p className="text-sm text-red-600">{submitError}</p>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting || !startAt || !clientPhone.trim()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {submitting ? t("appointments.createSubmitting") : t("appointments.createSubmit")}
            </button>
            <Link
              href="/admin/appointments"
              className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
            >
              {t("appointments.title")}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
