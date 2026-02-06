"use client";

import { useEffect } from "react";
import type { Locale } from "@/i18n/routing";

export function SetLocaleAttrs({ locale }: { locale: Locale }) {
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);
  return null;
}
