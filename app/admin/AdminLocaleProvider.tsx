"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import type { AdminLocale } from "@/lib/admin-i18n";
import {
  getStoredAdminLocale,
  setStoredAdminLocale,
  t as translate,
} from "@/lib/admin-i18n";

type AdminLocaleContextValue = {
  locale: AdminLocale;
  setLocale: (locale: AdminLocale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
};

const AdminLocaleContext = createContext<AdminLocaleContextValue | null>(null);

export function AdminLocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<AdminLocale>("it");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLocaleState(getStoredAdminLocale());
    setMounted(true);
  }, []);

  const setLocale = useCallback((next: AdminLocale) => {
    setStoredAdminLocale(next);
    setLocaleState(next);
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) =>
      translate(mounted ? locale : "it", key, params),
    [locale, mounted]
  );

  const value = useMemo<AdminLocaleContextValue>(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t]
  );

  return (
    <AdminLocaleContext.Provider value={value}>
      {/* key so locale change forces full re-render and clears any stale translations */}
      <div key={locale}>
        {children}
      </div>
    </AdminLocaleContext.Provider>
  );
}

export function useAdminLocale(): AdminLocaleContextValue {
  const ctx = useContext(AdminLocaleContext);
  if (!ctx) {
    throw new Error("useAdminLocale must be used within AdminLocaleProvider");
  }
  return ctx;
}

export function useAdminLocaleOptional(): AdminLocaleContextValue | null {
  return useContext(AdminLocaleContext);
}
