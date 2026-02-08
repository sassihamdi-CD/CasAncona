"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAdminLocale } from "../../../../AdminLocaleProvider";
import Link from "next/link";
import { OFFICE_ADDRESS_LINE, STUDIO_LEGAL_NAME } from "@/lib/constants/office";
import type { Appointment } from "@/lib/types";
type ReceiptData = { appointment: Appointment; serviceName: string };

function formatDate(iso: string, locale: string): string {
  try {
    return new Date(iso).toLocaleDateString(locale === "en" ? "en-GB" : "it-IT", {
      dateStyle: "long",
      timeZone: "Europe/Rome",
    });
  } catch {
    return iso;
  }
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("it-IT", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Rome",
    });
  } catch {
    return iso;
  }
}

function formatAmount(cents: number | null, currency: string): string {
  if (cents == null) return "—";
  const amount = (cents / 100).toFixed(2);
  const c = (currency || "eur").toUpperCase();
  if (c === "EUR") return `€ ${amount}`;
  return `${amount} ${c}`;
}

export default function AdminReceiptPage() {
  const params = useParams();
  const { t, locale } = useAdminLocale();
  const id = typeof params?.id === "string" ? params.id : null;
  const [data, setData] = useState<ReceiptData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [recordSaving, setRecordSaving] = useState(false);
  const [recordError, setRecordError] = useState<string | null>(null);

  const loadReceipt = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/admin/appointments/${id}/receipt`, {
        credentials: "include",
      });
      if (!res.ok) {
        setError("Not found");
        return;
      }
      const json = (await res.json()) as ReceiptData;
      setData(json);
    } catch {
      setError("Failed to load");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("Invalid appointment");
      return;
    }
    loadReceipt();
  }, [id, loadReceipt]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-stone-600">{t("appointments.loading")}</p>
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="space-y-4 p-6">
        <p className="text-red-600">{error ?? "Not found"}</p>
        <Link
          href="/admin/appointments"
          className="inline-block rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
        >
          ← {t("appointments.title")}
        </Link>
      </div>
    );
  }

  const { appointment, serviceName } = data;
  const apt = appointment as Appointment;
  const receiptDate = new Date().toLocaleDateString(locale === "en" ? "en-GB" : "it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Europe/Rome",
  });
  const receiptNumber = `REC-${apt.id.slice(0, 8).toUpperCase()}`;
  const isOnline = apt.consultationType === "online";
  const needsRecordPayment =
    (apt.amountPaidCents == null || apt.amountPaidCents === 0) && apt.consultationType !== "online";

  const handleRecordPayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const eurosInput = form.querySelector<HTMLInputElement>('input[name="amountEuros"]');
    const euros = eurosInput ? parseFloat(eurosInput.value) : NaN;
    if (!Number.isFinite(euros) || euros < 0) {
      setRecordError(t("receipt.recordError"));
      return;
    }
    setRecordError(null);
    setRecordSaving(true);
    try {
      const res = await fetch(`/api/admin/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          amountPaidCents: Math.round(euros * 100),
          currency: "eur",
        }),
      });
      if (!res.ok) {
        setRecordError(t("receipt.recordError"));
        return;
      }
      await loadReceipt();
    } catch {
      setRecordError(t("receipt.recordError"));
    } finally {
      setRecordSaving(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .receipt-print-area,
          .receipt-print-area * { visibility: visible; }
          .receipt-print-area { position: absolute; left: 0; top: 0; width: 100%; padding: 0; }
          .receipt-no-print { display: none !important; }
          @page { size: A4; margin: 1.5cm; }
        }
      `}</style>
      <div className="receipt-no-print space-y-4 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/appointments"
            className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
          >
            ← {t("appointments.title")}
          </Link>
          <button
            type="button"
            onClick={handlePrint}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
          >
            {t("receipt.print")}
          </button>
        </div>
        {needsRecordPayment && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <h2 className="text-sm font-semibold text-amber-900">{t("receipt.recordPayment")}</h2>
            <p className="mt-1 text-sm text-amber-800">{t("receipt.recordPaymentHint")}</p>
            <form onSubmit={handleRecordPayment} className="mt-4 flex flex-wrap items-end gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-stone-600">{t("receipt.amountEuros")}</span>
                <input
                  type="number"
                  name="amountEuros"
                  min="0"
                  step="0.01"
                  required
                  className="w-28 rounded-lg border border-stone-300 px-3 py-2 text-sm"
                  placeholder="0"
                />
              </label>
              <button
                type="submit"
                disabled={recordSaving}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
              >
                {recordSaving ? t("receipt.saving") : t("receipt.saveAndShowReceipt")}
              </button>
            </form>
            {recordError && <p className="mt-2 text-sm text-red-600">{recordError}</p>}
          </div>
        )}
      </div>
      <div className="receipt-print-area mx-auto max-w-xl bg-white p-8 pb-12">
        <div className="border-b border-stone-300 pb-4">
          <h1 className="text-2xl font-bold uppercase tracking-wide text-stone-900">
            {t("receipt.title")}
          </h1>
          <p className="mt-1 text-lg font-semibold text-stone-800">{STUDIO_LEGAL_NAME}</p>
          <p className="mt-1 text-sm text-stone-600">{OFFICE_ADDRESS_LINE}</p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
          <span className="text-stone-500">{t("receipt.receiptNumber")}</span>
          <span className="font-medium">{receiptNumber}</span>
          <span className="text-stone-500">{t("receipt.date")}</span>
          <span className="font-medium">{receiptDate}</span>
        </div>

        <div className="mt-8 border-t border-stone-200 pt-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            {t("receipt.client")}
          </h2>
          <p className="mt-1 font-medium text-stone-900">{apt.clientName}</p>
          {apt.clientEmail && (
            <p className="text-sm text-stone-600">{apt.clientEmail}</p>
          )}
          {apt.clientPhone && (
            <p className="text-sm text-stone-600">{apt.clientPhone}</p>
          )}
        </div>

        <div className="mt-6 border-t border-stone-200 pt-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            {t("receipt.service")}
          </h2>
          <p className="mt-1 font-medium text-stone-900">{serviceName}</p>
          <p className="mt-0.5 text-sm text-stone-600">
            {isOnline ? t("receipt.typeOnline") : t("receipt.typeInPerson")} · {apt.durationMinutes} min
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
          <span className="text-stone-500">{t("receipt.appointmentDate")}</span>
          <span className="font-medium">
            {formatDate(apt.requestedStartAt, locale)} {formatTime(apt.requestedStartAt)}
          </span>
        </div>

        <div className="mt-8 border-t-2 border-stone-300 pt-6">
          <div className="flex justify-between text-base">
            <span className="font-semibold text-stone-700">{t("receipt.amountPaid")}</span>
            <span className="font-bold text-stone-900">
              {formatAmount(apt.amountPaidCents, apt.currency ?? "eur")}
            </span>
          </div>
          <p className="mt-1 text-xs text-stone-500">
              {isOnline ? t("receipt.paymentMethodOnline") : t("receipt.paymentMethodInPerson")}
            </p>
        </div>

        <div className="mt-10 border-t border-stone-200 pt-6 text-center text-xs text-stone-500">
          <p>{t("receipt.footer")}</p>
          <p className="mt-2">{STUDIO_LEGAL_NAME}</p>
          <p className="mt-1">{OFFICE_ADDRESS_LINE}</p>
        </div>

        <div className="mt-12 pt-8">
          <p className="text-sm text-stone-500">{t("receipt.signatureLine")}</p>
          <div className="mt-8 border-b border-stone-400" style={{ width: "12rem" }} />
        </div>
      </div>
    </>
  );
}
