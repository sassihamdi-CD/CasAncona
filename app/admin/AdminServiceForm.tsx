"use client";

import { useState, useEffect } from "react";
import type { Service } from "@/lib/types";
import { useAdminLocaleOptional } from "./AdminLocaleProvider";

type ServiceFormState = {
  name: string;
  nameEn: string;
  nameAr: string;
  nameFr: string;
  description: string;
  descriptionEn: string;
  descriptionAr: string;
  descriptionFr: string;
  documentsRequired: string;
  documentsRequiredEn: string;
  documentsRequiredAr: string;
  documentsRequiredFr: string;
  durationMinutes: number;
  priceCents: number;
  currency: string;
  stripePriceId: string;
  active: boolean;
  sortOrder: number;
};

const emptyForm: ServiceFormState = {
  name: "",
  nameEn: "",
  nameAr: "",
  nameFr: "",
  description: "",
  descriptionEn: "",
  descriptionAr: "",
  descriptionFr: "",
  documentsRequired: "",
  documentsRequiredEn: "",
  documentsRequiredAr: "",
  documentsRequiredFr: "",
  durationMinutes: 30,
  priceCents: 0,
  currency: "EUR",
  stripePriceId: "",
  active: true,
  sortOrder: 0,
};

function serviceToForm(s: Service | null): ServiceFormState {
  if (!s) return { ...emptyForm };
  return {
    name: s.name ?? "",
    nameEn: s.nameEn ?? "",
    nameAr: s.nameAr ?? "",
    nameFr: s.nameFr ?? "",
    description: s.description ?? "",
    descriptionEn: s.descriptionEn ?? "",
    descriptionAr: s.descriptionAr ?? "",
    descriptionFr: s.descriptionFr ?? "",
    documentsRequired: s.documentsRequired ?? "",
    documentsRequiredEn: s.documentsRequiredEn ?? "",
    documentsRequiredAr: s.documentsRequiredAr ?? "",
    documentsRequiredFr: s.documentsRequiredFr ?? "",
    durationMinutes: s.durationMinutes ?? 30,
    priceCents: s.priceCents ?? 0,
    currency: s.currency ?? "EUR",
    stripePriceId: s.stripePriceId ?? "",
    active: s.active ?? true,
    sortOrder: s.sortOrder ?? 0,
  };
}

type Props = {
  service: Service | null;
  onClose: () => void;
  onSaved: () => void;
  /** Optional: when not provided, session cookie is used (dashboard login). */
  adminKey?: string;
};

export function AdminServiceForm({ service, onClose, onSaved, adminKey }: Props) {
  const localeContext = useAdminLocaleOptional();
  const t = localeContext?.t ?? ((key: string) => key);
  const [form, setForm] = useState<ServiceFormState>(() => serviceToForm(service));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm(serviceToForm(service ?? null));
    setError(null);
  }, [service]);

  const isEdit = !!service?.id;

  const update = (updates: Partial<ServiceFormState>) => {
    setForm((prev) => ({ ...prev, ...updates }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (adminKey) headers["x-admin-key"] = adminKey;
      const body = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        documentsRequired: form.documentsRequired.trim() || null,
        durationMinutes: form.durationMinutes,
        priceCents: form.priceCents,
        currency: form.currency.trim() || "EUR",
        stripePriceId: form.stripePriceId.trim() || null,
        active: form.active,
        sortOrder: form.sortOrder,
      };

      const fetchOpts: RequestInit = { headers, body: JSON.stringify(body), credentials: "include" };
      if (isEdit) {
        const res = await fetch(`/api/admin/services/${service.id}`, { ...fetchOpts, method: "PATCH" });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.message ?? `Errore ${res.status}`);
        }
      } else {
        const res = await fetch("/api/admin/services", { ...fetchOpts, method: "POST" });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.message ?? `Errore ${res.status}`);
        }
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore salvataggio");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 border-b border-stone-200 bg-white px-4 py-3">
          <h2 className="text-lg font-semibold text-stone-900">
            {isEdit ? t("serviceForm.editService") : t("serviceForm.addService")}
          </h2>
        </div>
        <form onSubmit={submit} className="space-y-4 p-4">
          {error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <p className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-stone-700">
            {t("serviceForm.autoTranslateNote")}
          </p>

          <div>
            <label className="block text-sm font-medium text-stone-700">{t("serviceForm.nameDefault")}</label>
            <input
              required
              value={form.name}
              onChange={(e) => update({ name: e.target.value })}
              className="mt-1 w-full rounded border border-stone-300 px-3 py-2 text-stone-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700">{t("serviceForm.descriptionDefault")}</label>
            <textarea
              value={form.description}
              onChange={(e) => update({ description: e.target.value })}
              rows={3}
              className="mt-1 w-full rounded border border-stone-300 px-3 py-2 text-stone-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700">{t("serviceForm.documentsDefault")}</label>
            <textarea
              value={form.documentsRequired}
              onChange={(e) => update({ documentsRequired: e.target.value })}
              rows={2}
              placeholder={t("serviceForm.documentsPlaceholder")}
              className="mt-1 w-full rounded border border-stone-300 px-3 py-2 text-stone-900"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-stone-700">{t("serviceForm.durationMin")}</label>
              <input
                type="number"
                min={1}
                required
                value={form.durationMinutes}
                onChange={(e) => update({ durationMinutes: Number(e.target.value) || 0 })}
                className="mt-1 w-full rounded border border-stone-300 px-3 py-2 text-stone-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700">{t("serviceForm.priceCents")}</label>
              <p className="mt-0.5 text-xs text-stone-500">{t("serviceForm.priceEurosHint")}</p>
              <input
                type="number"
                min={0}
                step={1}
                required
                placeholder="50"
                value={form.priceCents === 0 ? 0 : Math.round(form.priceCents / 100)}
                onChange={(e) => update({ priceCents: (Number(e.target.value) || 0) * 100 })}
                className="mt-1 w-full rounded border border-stone-300 px-3 py-2 text-stone-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700">{t("serviceForm.currency")}</label>
              <input
                value={form.currency}
                onChange={(e) => update({ currency: e.target.value })}
                className="mt-1 w-full rounded border border-stone-300 px-3 py-2 text-stone-900"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={form.active}
                onChange={(e) => update({ active: e.target.checked })}
                className="rounded border-stone-300"
              />
              <label htmlFor="active" className="text-sm text-stone-700">{t("serviceForm.activeHint")}</label>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700">{t("serviceForm.sortOrder")}</label>
              <input
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(e) => update({ sortOrder: Number(e.target.value) || 0 })}
                className="mt-1 w-full rounded border border-stone-300 px-3 py-2 text-stone-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700">{t("serviceForm.stripePriceId")}</label>
            <input
              value={form.stripePriceId}
              onChange={(e) => update({ stripePriceId: e.target.value })}
              className="mt-1 w-full rounded border border-stone-300 px-3 py-2 text-stone-900"
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-stone-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-stone-300 px-4 py-2 text-stone-700 hover:bg-stone-50"
            >
              {t("serviceForm.cancel")}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-stone-800 px-4 py-2 text-white hover:bg-stone-700 disabled:opacity-50"
            >
              {saving ? t("serviceForm.saving") : t("serviceForm.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
