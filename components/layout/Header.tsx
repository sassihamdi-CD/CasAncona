"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { LanguageSwitcher } from "./LanguageSwitcher";

const FULL_SITE_NAME = "Studio CAS Settore Legale di Souiai SNC";

export function Header() {
  const t = useTranslations("common.nav");
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: t("home") },
    { href: "/servizi", label: t("services") },
    { href: "/chi-siamo", label: t("about") },
    { href: "/contatti", label: t("contact") },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-stone-50/95 backdrop-blur-sm">
      <div className="container-wide flex h-16 items-center justify-between">
        <Link
          href="/"
          className="shrink-0 text-lg font-semibold tracking-tight text-primary hover:text-primary-hover transition-colors md:text-xl"
          title={FULL_SITE_NAME}
        >
          {tCommon("headerSiteName")}
        </Link>

        <nav className="hidden md:flex md:items-center md:gap-8">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm font-medium transition-colors ${
                pathname === href
                  ? "text-primary"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              {label}
            </Link>
          ))}
          <LanguageSwitcher />
          <Link
            href="/book"
            className="ml-2 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
          >
            {t("book")}
          </Link>
        </nav>

        <div className="flex md:hidden items-center gap-2">
          <LanguageSwitcher />
          <button
            type="button"
            className="rounded-lg p-2 text-stone-600 hover:bg-stone-100"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-label="Menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-stone-200 bg-stone-50 md:hidden">
          <nav className="container-wide flex flex-col gap-1 py-4">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  pathname === href
                    ? "bg-primary/10 text-primary"
                    : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                {label}
              </Link>
            ))}
            <Link
              href="/book"
              onClick={() => setMenuOpen(false)}
              className="mt-2 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
            >
              {t("book")}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
