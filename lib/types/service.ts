/**
 * Service entity — see docs/DATA_MODEL.md § services
 */

export interface Service {
  id: string;
  name: string;
  nameEn: string | null;
  nameAr: string | null;
  nameFr: string | null;
  description: string | null;
  descriptionEn: string | null;
  descriptionAr: string | null;
  descriptionFr: string | null;
  /** Required documents / what to bring (locale-aware). */
  documentsRequired: string | null;
  documentsRequiredEn: string | null;
  documentsRequiredAr: string | null;
  documentsRequiredFr: string | null;
  durationMinutes: number;
  priceCents: number;
  currency: string;
  stripePriceId: string | null;
  active: boolean;
  sortOrder: number;
  createdAt: string; // ISO 8601
  updatedAt: string;
}

/** For public listing; omit stripePriceId if you don't want it in client */
export type ServicePublic = Omit<Service, "stripePriceId">;
