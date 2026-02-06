"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { fetchServices, fetchSlots, createBooking } from "@/lib/api/client";
import type { Service } from "@/lib/types";
import type { AvailableSlot } from "@/lib/types";
import { getServiceName } from "@/lib/i18n/service";
import type { Locale } from "@/lib/i18n/service";
import { Button } from "@/components/ui/Button";
import { DateSlotPicker } from "@/components/booking/DateSlotPicker";

const LOCALES: readonly Locale[] = ["it", "en", "fr", "ar"];

/** Derive locale from URL path (e.g. /ar/book → "ar"). Single source of truth for service labels. */
function useLocaleFromPath(): Locale {
  const pathname = usePathname();
  const segment = pathname?.split("/")[1] ?? "";
  return (LOCALES.includes(segment as Locale) ? segment : "it") as Locale;
}

type Step = 1 | 2 | 3 | 4 | 5;

function formatSlotTime(isoUtc: string): string {
  const d = new Date(isoUtc);
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function formatPrice(cents: number, currency: string): string {
  if (cents === 0) return "—";
  const amount = (cents / 100).toFixed(2);
  if (currency.toUpperCase() === "EUR") return `€${amount}`;
  return `${amount} ${currency}`;
}

type BookingFlowProps = { preselectedServiceId?: string };

export function BookingFlow({ preselectedServiceId }: BookingFlowProps) {
  const t = useTranslations("book");
  const locale = useLocaleFromPath();
  const [step, setStep] = useState<Step>(1);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [serviceId, setServiceId] = useState<string | null>(preselectedServiceId ?? null);
  const [consultationType, setConsultationType] = useState<"in_person" | "online" | null>(null);
  const [date, setDate] = useState<string>("");
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [startAt, setStartAt] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetchServices();
        if (!cancelled) {
          setServices(res.services);
          if (preselectedServiceId && res.services.some((s) => s.id === preselectedServiceId)) {
            setServiceId(preselectedServiceId);
          }
        }
      } catch (e) {
        if (!cancelled) {
          const message = e instanceof Error ? e.message : t("errorLoad");
          setError(message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [preselectedServiceId, t]);

  const loadSlots = useCallback(async () => {
    if (!serviceId || !date) return;
    setSlotsLoading(true);
    setSlotsError(null);
    setSlots([]);
    setStartAt(null);
    try {
      const res = await fetchSlots(date, serviceId);
      setSlots(res.slots);
    } catch {
      setSlotsError(t("errorSlots"));
    } finally {
      setSlotsLoading(false);
    }
  }, [serviceId, date, t]);

  useEffect(() => {
    if (date && serviceId) loadSlots();
  }, [date, serviceId, loadSlots]);

  const selectedService = services.find((s) => s.id === serviceId);
  const weekdayLabels = useMemo(() => {
    return [1, 2, 3, 4, 5, 6, 7].map((day) => {
      const d = new Date(2024, 0, day);
      return d.toLocaleDateString(locale === "ar" ? "ar" : locale === "fr" ? "fr" : locale === "en" ? "en-GB" : "it", { weekday: "short" });
    });
  }, [locale]);
  const minDate = new Date();
  minDate.setDate(minDate.getDate());
  const minDateStr = minDate.toISOString().slice(0, 10);
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 2);
  const maxDateStr = maxDate.toISOString().slice(0, 10);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceId || !consultationType || !startAt || !name.trim() || !email.trim() || !message.trim()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await createBooking({
        serviceId,
        consultationType,
        startAt,
        clientName: name.trim(),
        clientEmail: email.trim().toLowerCase(),
        clientPhone: phone.trim() || undefined,
        clientMessage: message.trim() || undefined,
        locale: locale as string,
      });
      if (res.confirmationUrl) {
        window.location.href = res.confirmationUrl;
        return;
      }
      if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
        return;
      }
      setSubmitError(t("errorSubmit"));
    } catch {
      setSubmitError(t("errorSubmit"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-8 rounded-xl border border-stone-200 bg-stone-50 p-8 text-center text-stone-600">
        {t("submitting")}
      </div>
    );
  }
  if (error) {
    return (
      <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
        {error}
      </div>
    );
  }
  if (services.length === 0) {
    return (
      <div className="mt-8 rounded-xl border border-stone-200 bg-stone-50 p-8 text-center text-stone-600">
        {t("errorLoad")}
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-8">
      {/* Step 1: Service */}
      <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-stone-900">{t("stepService")}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => { setServiceId(s.id); setStep(2); }}
              className={`rounded-lg border-2 p-4 text-left transition-colors ${
                serviceId === s.id
                  ? "border-primary bg-primary/5"
                  : "border-stone-200 hover:border-primary/30"
              }`}
            >
              <span className="font-medium text-stone-900">{getServiceName(s, locale as Locale)}</span>
              <p className="mt-1 text-sm text-stone-600">{s.durationMinutes} min</p>
              <p className="mt-1 text-sm font-medium text-primary">
                {s.priceCents === 0 ? t("free") : formatPrice(s.priceCents, s.currency)}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Step 2: Type */}
      {serviceId && (
        <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-900">{t("stepType")}</h2>
          <div className="mt-4 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => { setConsultationType("in_person"); setStep(3); }}
              className={`rounded-lg border-2 px-6 py-3 font-medium transition-colors ${
                consultationType === "in_person"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-stone-200 hover:border-primary/30"
              }`}
            >
              {t("inPerson")}
            </button>
            <button
              type="button"
              onClick={() => { setConsultationType("online"); setStep(3); }}
              className={`rounded-lg border-2 px-6 py-3 font-medium transition-colors ${
                consultationType === "online"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-stone-200 hover:border-primary/30"
              }`}
            >
              {t("online")}
            </button>
          </div>
        </section>
      )}

      {/* Step 3: Date & slot — calendar + time grid */}
      {consultationType && (
        <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-900">{t("stepDateTime")}</h2>
          <div className="mt-4">
            <DateSlotPicker
              locale={locale}
              selectedDate={date}
              onSelectDate={setDate}
              slots={slots}
              slotsLoading={slotsLoading}
              slotsError={slotsError}
              selectedStartAt={startAt}
              onSelectSlot={setStartAt}
              minDate={minDate}
              maxDate={maxDate}
              formatSlotTime={formatSlotTime}
              labels={{
                selectDate: t("selectDate"),
                selectTime: t("selectTime"),
                loading: t("submitting"),
                noSlots: t("noSlots"),
                error: t("errorSlots"),
                weekdays: weekdayLabels,
              }}
            />
          </div>
        </section>
      )}

      {/* Step 4: Form */}
      {startAt && (
        <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-900">{t("stepDetails")}</h2>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700">{t("name")}</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-stone-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700">{t("email")}</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-stone-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700">{t("phone")}</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-stone-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700">{t("reasonForBooking")}</label>
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder={t("reasonForBookingPlaceholder")}
                className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-stone-900"
              />
            </div>
            {submitError && (
              <p className="text-sm text-red-600">{submitError}</p>
            )}
            <Button
              type="submit"
              size="lg"
              disabled={submitting}
              className="w-full sm:w-auto"
            >
              {submitting ? t("submitting") : t("submit")}
            </Button>
          </form>
        </section>
      )}

      {selectedService && (
        <p className="text-sm text-stone-500">
          {getServiceName(selectedService, locale as Locale)}
          {consultationType === "in_person" && ` · ${t("inPerson")}`}
          {consultationType === "online" && ` · ${t("online")}`}
          {date && ` · ${date}`}
          {startAt && ` · ${formatSlotTime(startAt)}`}
        </p>
      )}
    </div>
  );
}
