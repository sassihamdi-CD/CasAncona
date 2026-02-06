"use client";

import { useState, useMemo } from "react";
import type { AvailableSlot } from "@/lib/types";

type DateSlotPickerProps = {
  /** Current UI locale for month/weekday formatting (e.g. "it", "en", "fr", "ar"). */
  locale: string;
  /** Selected date YYYY-MM-DD */
  selectedDate: string;
  onSelectDate: (date: string) => void;
  /** Slots for the selected date */
  slots: AvailableSlot[];
  slotsLoading: boolean;
  slotsError: string | null;
  /** Selected slot startAt (ISO) */
  selectedStartAt: string | null;
  onSelectSlot: (startAt: string) => void;
  minDate: Date;
  maxDate: Date;
  formatSlotTime: (iso: string) => string;
  labels: {
    selectDate: string;
    selectTime: string;
    loading: string;
    noSlots: string;
    error: string;
    /** Optional: Mon–Sun short labels (Monday first). Default: Italian. */
    weekdays?: string[];
  };
};

function toYYYYMMDD(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

/** Monday = 0. For Sunday = 0 use (d.getDay() + 6) % 7 */
function getDayOfWeek(d: Date): number {
  return (d.getDay() + 6) % 7;
}

/** Map app locale to BCP 47 for Intl date formatting. */
function toDateLocale(locale: string): string {
  switch (locale) {
    case "ar": return "ar";
    case "en": return "en-GB";
    case "fr": return "fr";
    case "it":
    default: return "it-IT";
  }
}

export function DateSlotPicker({
  locale,
  selectedDate,
  onSelectDate,
  slots,
  slotsLoading,
  slotsError,
  selectedStartAt,
  onSelectSlot,
  minDate,
  maxDate,
  formatSlotTime,
  labels,
}: DateSlotPickerProps) {
  const minStr = toYYYYMMDD(minDate);
  const maxStr = toYYYYMMDD(maxDate);
  const weekdayLabels = labels.weekdays ?? ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
  const dateLocale = toDateLocale(locale);

  const initialViewDate = selectedDate
    ? new Date(selectedDate + "T12:00:00")
    : new Date();
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(initialViewDate));

  const monthLabel = useMemo(() => {
    return viewMonth.toLocaleDateString(dateLocale, { month: "long", year: "numeric" });
  }, [viewMonth, dateLocale]);

  const calendarDays = useMemo(() => {
    const start = startOfMonth(viewMonth);
    const end = endOfMonth(viewMonth);
    const startPad = getDayOfWeek(start);
    const days: (Date | null)[] = [];
    for (let i = 0; i < startPad; i++) days.push(null);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    return days;
  }, [viewMonth]);

  const canPrev = useMemo(() => {
    const prevMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1);
    return toYYYYMMDD(endOfMonth(prevMonth)) >= minStr;
  }, [viewMonth, minStr]);

  const canNext = useMemo(() => {
    const nextMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1);
    return toYYYYMMDD(startOfMonth(nextMonth)) <= maxStr;
  }, [viewMonth, maxStr]);

  const goPrev = () => {
    if (!canPrev) return;
    setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1));
  };

  const goNext = () => {
    if (!canNext) return;
    setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1));
  };

  const isDisabled = (d: Date): boolean => {
    const s = toYYYYMMDD(d);
    return s < minStr || s > maxStr;
  };

  const isSelected = (d: Date): boolean => toYYYYMMDD(d) === selectedDate;

  const isToday = (d: Date): boolean => toYYYYMMDD(d) === toYYYYMMDD(new Date());

  return (
    <div className="space-y-6">
      {/* Calendar */}
      <div dir="ltr" className="rounded-xl border border-stone-200 bg-stone-50/50 p-4 sm:p-5">
        <p className="mb-3 text-sm font-medium text-stone-700">{labels.selectDate}</p>
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={goPrev}
            disabled={!canPrev}
            aria-label="Mese precedente"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900 disabled:pointer-events-none disabled:opacity-40"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-base font-semibold capitalize text-stone-900">
            {monthLabel}
          </span>
          <button
            type="button"
            onClick={goNext}
            disabled={!canNext}
            aria-label="Mese successivo"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900 disabled:pointer-events-none disabled:opacity-40"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-1">
          {weekdayLabels.map((label) => (
            <div
              key={label}
              className="py-1 text-center text-xs font-medium text-stone-500"
            >
              {label}
            </div>
          ))}
          {calendarDays.map((d, i) => {
            if (!d) {
              return <div key={`empty-${i}`} />;
            }
            const disabled = isDisabled(d);
            const selected = isSelected(d);
            const today = isToday(d);
            return (
              <button
                key={d.toISOString()}
                type="button"
                disabled={disabled}
                onClick={() => !disabled && onSelectDate(toYYYYMMDD(d))}
                className={`
                  flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors
                  ${disabled ? "cursor-not-allowed text-stone-300" : ""}
                  ${!disabled && !selected ? "text-stone-700 hover:bg-stone-200 hover:text-stone-900" : ""}
                  ${selected ? "bg-primary text-white hover:bg-primary-hover" : ""}
                  ${!selected && today ? "ring-1 ring-stone-300 ring-inset" : ""}
                `}
              >
                {d.getDate()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div className="rounded-xl border border-stone-200 bg-white p-4 sm:p-5">
          <p className="mb-3 text-sm font-medium text-stone-700">{labels.selectTime}</p>
          {slotsLoading ? (
            <p className="py-6 text-center text-sm text-stone-500">{labels.loading}</p>
          ) : slotsError ? (
            <p className="py-4 text-sm text-red-600">{labels.error}</p>
          ) : slots.length === 0 ? (
            <p className="py-6 text-center text-sm text-stone-500">{labels.noSlots}</p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
              {slots.map((slot) => {
                const selected = selectedStartAt === slot.startAt;
                return (
                  <button
                    key={slot.startAt}
                    type="button"
                    onClick={() => onSelectSlot(slot.startAt)}
                    className={`
                      rounded-lg border-2 py-2.5 text-sm font-medium transition-colors
                      ${selected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-stone-200 text-stone-700 hover:border-primary/40 hover:bg-primary/5"
                      }
                    `}
                  >
                    {formatSlotTime(slot.startAt)}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
