"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAdminLocale } from "../AdminLocaleProvider";

const navKeys = [
  { href: "/admin", key: "shell.navDashboard", icon: "📊" },
  { href: "/admin/appointments", key: "shell.navAppointments", icon: "📅" },
  { href: "/admin/create-appointment", key: "shell.navCreateAppointment", icon: "➕" },
  { href: "/admin/clients", key: "shell.navClients", icon: "👥" },
  { href: "/admin/contact-hours", key: "shell.navContactHours", icon: "📞" },
  { href: "/admin/services", key: "shell.navServices", icon: "⚙️" },
] as const;

export function AdminDashboardShell({
  children,
  email,
}: {
  children: React.ReactNode;
  email: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { locale, setLocale, t } = useAdminLocale();
  const [userOpen, setUserOpen] = useState(false);

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen bg-stone-100">
      <aside className="flex w-56 flex-col border-r border-stone-200 bg-white">
        <div className="border-b border-stone-200 p-4">
          <Link href="/admin/dashboard" className="text-lg font-semibold text-stone-900">
            {t("shell.adminTitle")}
          </Link>
        </div>
        <nav className="flex-1 space-y-0.5 p-3">
          {navKeys.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                }`}
              >
                <span className="text-lg" aria-hidden>{item.icon}</span>
                {t(item.key)}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-stone-200 p-3">
          <p className="mb-1.5 text-xs font-medium text-stone-500">{t("shell.language")}</p>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setLocale("it")}
              className={`rounded px-2 py-1 text-sm ${locale === "it" ? "bg-stone-800 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}
            >
              IT
            </button>
            <button
              type="button"
              onClick={() => setLocale("en")}
              className={`rounded px-2 py-1 text-sm ${locale === "en" ? "bg-stone-800 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}
            >
              EN
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-stone-200 bg-white px-6">
          <div />
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserOpen((o) => !o)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-900"
            >
              <span className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">
                {email.slice(0, 1).toUpperCase()}
              </span>
              <span className="max-w-[140px] truncate">{email}</span>
            </button>
            {userOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  aria-hidden
                  onClick={() => setUserOpen(false)}
                />
                <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-lg border border-stone-200 bg-white py-1 shadow-lg">
                  <button
                    type="button"
                    onClick={logout}
                    className="w-full px-4 py-2 text-left text-sm text-stone-700 hover:bg-stone-50"
                  >
                    {t("shell.logout")}
                  </button>
                </div>
              </>
            )}
          </div>
        </header>
        <div className="flex-1 p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
