/**
 * Locale-aware display for service name and description.
 * - Italian (it): name, description
 * - English (en): nameEn, descriptionEn
 * - Arabic (ar): nameAr → nameEn → name
 * - French (fr): nameFr → nameEn → name
 */

import type { Service } from "@/lib/types";

export type Locale = "it" | "en" | "fr" | "ar";

export function getServiceName(service: Service, locale: Locale): string {
  if (locale === "en" && service.nameEn?.trim()) return service.nameEn;
  if (locale === "ar") return (service.nameAr?.trim() || service.nameEn?.trim() || service.name) ?? service.name ?? "";
  if (locale === "fr") return (service.nameFr?.trim() || service.nameEn?.trim() || service.name) ?? service.name ?? "";
  // Italian (it): primary is name; fallback to nameEn if name empty (e.g. content was entered in EN)
  return (service.name?.trim() || service.nameEn?.trim() || service.nameAr?.trim() || service.nameFr?.trim()) ?? "";
}

export function getServiceDescription(service: Service, locale: Locale): string | null {
  if (locale === "en" && service.descriptionEn?.trim()) return service.descriptionEn;
  if (locale === "ar") return (service.descriptionAr?.trim() || service.descriptionEn?.trim() || service.description) ?? null;
  if (locale === "fr") return (service.descriptionFr?.trim() || service.descriptionEn?.trim() || service.description) ?? null;
  return (service.description?.trim() || service.descriptionEn?.trim() || service.descriptionAr?.trim() || service.descriptionFr?.trim()) || null;
}

/** Required documents / what to bring for this service (locale-aware). */
export function getServiceDocumentsRequired(service: Service, locale: Locale): string | null {
  if (locale === "en" && service.documentsRequiredEn?.trim()) return service.documentsRequiredEn;
  if (locale === "ar") return (service.documentsRequiredAr?.trim() || service.documentsRequiredEn?.trim() || service.documentsRequired?.trim()) || null;
  if (locale === "fr") return (service.documentsRequiredFr?.trim() || service.documentsRequiredEn?.trim() || service.documentsRequired?.trim()) || null;
  return (service.documentsRequired?.trim() || service.documentsRequiredEn?.trim() || service.documentsRequiredAr?.trim() || service.documentsRequiredFr?.trim()) || null;
}
