"use client";

import { useTranslations } from "next-intl";
import type { Service } from "@/lib/types";
import { Button } from "./Button";

function formatPrice(cents: number, currency: string): string {
  const amount = (cents / 100).toFixed(2);
  if (currency.toUpperCase() === "EUR") return `€${amount}`;
  return `${amount} ${currency}`;
}

/**
 * Presentational card: displays only the strings passed in.
 * Name, description and required documents are resolved on the server by locale.
 */
export type ServiceCardProps = {
  service: Service;
  displayName: string;
  displayDescription: string | null;
  /** Required documents / what to bring (locale-aware). Shown as expandable section when present. */
  displayDocumentsRequired: string | null;
};

export function ServiceCard({ service, displayName, displayDescription, displayDocumentsRequired }: ServiceCardProps) {
  const t = useTranslations("common.nav");
  const tServizi = useTranslations("servizi");

  const documentLines = displayDocumentsRequired
    ? displayDocumentsRequired.trim().split(/\r?\n/).filter(Boolean)
    : [];

  return (
    <article className="flex flex-col rounded-xl border border-stone-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <h3 className="text-lg font-semibold text-stone-900">{displayName}</h3>
      {displayDescription && (
        <p className="mt-2 line-clamp-3 text-sm text-stone-600">{displayDescription}</p>
      )}
      {documentLines.length > 0 && (
        <details className="mt-3 group">
          <summary className="cursor-pointer list-none text-sm font-medium text-primary hover:text-primary-hover [&::-webkit-details-marker]:hidden">
            <span className="inline-flex items-center gap-1">
              {tServizi("documentsRequired")}
              <svg className="h-4 w-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </summary>
          <ul className="mt-2 space-y-1 border-l-2 border-primary/30 pl-4 text-sm text-stone-600">
            {documentLines.map((line, i) => (
              <li key={i}>{line.trim()}</li>
            ))}
          </ul>
        </details>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-primary">
          {formatPrice(service.priceCents, service.currency)}
        </span>
        <span className="text-sm text-stone-500">{service.durationMinutes} min</span>
      </div>
      <div className="mt-auto pt-4">
        <Button href={`/book?service=${service.id}`} variant="primary" size="sm">
          {t("book")}
        </Button>
      </div>
    </article>
  );
}
