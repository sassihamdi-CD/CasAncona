/**
 * Storage bucket names and config for Supabase Storage.
 * See docs/PASSPORT_UPLOAD_DESIGN.md and docs/STORAGE_PASSPORT_BUCKET.md.
 */

/** Private bucket for passport first-page uploads. Create it in Supabase Dashboard (Storage → New bucket). */
export const PASSPORT_DOCUMENTS_BUCKET = "passport-documents";

/** Max file size for passport upload (bytes). 5 MB. */
export const PASSPORT_UPLOAD_MAX_BYTES = 5 * 1024 * 1024;

/** Allowed MIME types for passport document. */
export const PASSPORT_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
] as const;

export type PassportAllowedMimeType = (typeof PASSPORT_ALLOWED_MIME_TYPES)[number];

export function isPassportAllowedMimeType(value: string): value is PassportAllowedMimeType {
  return (PASSPORT_ALLOWED_MIME_TYPES as readonly string[]).includes(value);
}
