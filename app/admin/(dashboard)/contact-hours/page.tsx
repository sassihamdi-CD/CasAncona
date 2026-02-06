"use client";

import { useState, useEffect, useCallback } from "react";
import { useAdminLocale } from "../../AdminLocaleProvider";

type ContactData = { phone: string; email: string; hours: string };

export default function AdminContactHoursPage() {
  const { t } = useAdminLocale();
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [hours, setHours] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/site-contact", { credentials: "include" });
      if (!res.ok) {
        if (res.status === 401) throw new Error(t("appointments.sessionExpired"));
        throw new Error(t("siteContact.loadError"));
      }
      const data = (await res.json()) as ContactData;
      setPhone(data.phone ?? "");
      setEmail(data.email ?? "");
      setHours(data.hours ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : t("siteContact.loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch("/api/admin/site-contact", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone: phone.trim() || null, email: email.trim() || null, hours: hours.trim() || null }),
      });
      if (!res.ok) throw new Error(t("siteContact.saveError"));
      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("siteContact.saveError"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-stone-500">
        {t("appointments.loading")}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">{t("siteContact.title")}</h1>
        <p className="mt-1 text-sm text-stone-600">{t("siteContact.description")}</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      {success && (
        <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{t("siteContact.success")}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">{t("siteContact.phone")}</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+39 071 123 4567"
            className="w-full rounded-lg border border-stone-200 px-3 py-2 text-stone-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">{t("siteContact.email")}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="studio@example.com"
            className="w-full rounded-lg border border-stone-200 px-3 py-2 text-stone-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">{t("siteContact.hours")}</label>
          <textarea
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            placeholder={t("siteContact.hoursPlaceholder")}
            rows={3}
            className="w-full rounded-lg border border-stone-200 px-3 py-2 text-stone-900"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? t("siteContact.saving") : t("siteContact.save")}
        </button>
      </form>
    </div>
  );
}
