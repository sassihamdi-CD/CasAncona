"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminLocale } from "../AdminLocaleProvider";

export default function AdminLoginPage() {
  const router = useRouter();
  const { locale, setLocale, t } = useAdminLocale();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.message ?? t("login.loginFailed"));
        return;
      }
      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError(t("login.connectionError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-100 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-4 flex justify-end gap-1">
          <button
            type="button"
            onClick={() => setLocale("it")}
            className={`rounded px-2 py-1 text-sm font-medium ${locale === "it" ? "bg-stone-800 text-white" : "bg-stone-200 text-stone-600 hover:bg-stone-300"}`}
          >
            IT
          </button>
          <button
            type="button"
            onClick={() => setLocale("en")}
            className={`rounded px-2 py-1 text-sm font-medium ${locale === "en" ? "bg-stone-800 text-white" : "bg-stone-200 text-stone-600 hover:bg-stone-300"}`}
          >
            EN
          </button>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-lg">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-bold tracking-tight text-stone-900">
              {t("login.title")}
            </h1>
            <p className="mt-1 text-sm text-stone-500">{t("login.subtitle")}</p>
          </div>
          <form onSubmit={submit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-stone-700">
                {t("login.email")}
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-stone-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-stone-700">
                {t("login.password")}
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-stone-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-stone-800 py-2.5 font-medium text-white hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-600 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? t("login.signingIn") : t("login.signIn")}
            </button>
          </form>
        </div>
        <p className="mt-4 text-center text-xs text-stone-500">
          {t("login.footerHint")}
        </p>
      </div>
    </div>
  );
}
