/**
 * Auto-translation for service content (name, description, documents).
 * Uses MyMemory Translation API — completely free (no API key required).
 * Optional: set MYMEMORY_EMAIL in .env for higher daily limit.
 * Source language: Italian (it). Target: en, ar, fr.
 */

const API_BASE = "https://api.mymemory.translated.net/get";

const SOURCE_LANG = "it";
const TARGET_LANGS = ["en", "ar", "fr"] as const;

/** MyMemory allows max 500 bytes per request; stay under to be safe. */
const MAX_QUERY_CHARS = 450;

export type TargetLocale = (typeof TARGET_LANGS)[number];

function getEmail(): string | null {
  const e = process.env.MYMEMORY_EMAIL?.trim();
  return e || null;
}

/**
 * Translate a single text via MyMemory (free). One request per text.
 */
async function translateOne(
  text: string,
  targetLang: string,
  sourceLang: string
): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return "";

  const langpair = `${sourceLang}|${targetLang}`;
  const params = new URLSearchParams();
  params.set("q", trimmed.length > MAX_QUERY_CHARS ? trimmed.slice(0, MAX_QUERY_CHARS) : trimmed);
  params.set("langpair", langpair);
  const email = getEmail();
  if (email) params.set("de", email);

  try {
    const res = await fetch(`${API_BASE}?${params.toString()}`);
    if (!res.ok) return "";

    const data = (await res.json()) as {
      responseData?: { translatedText?: string };
      quotaFinished?: boolean;
    };
    if (data.quotaFinished) {
      console.warn("[translate] MyMemory daily quota finished.");
      return "";
    }
    const t = data.responseData?.translatedText;
    return typeof t === "string" ? t.trim() : "";
  } catch (e) {
    console.error("[translate]", e);
    return "";
  }
}

/**
 * Translate one or more texts. Runs sequentially with a short delay to respect free tier.
 * Returns array of translated strings in same order as input.
 */
export async function translateBatch(
  texts: string[],
  targetLang: string,
  sourceLang: string = SOURCE_LANG
): Promise<string[]> {
  const filtered = texts.map((t) => (typeof t === "string" && t.trim() ? t.trim() : ""));
  if (filtered.every((t) => !t)) return texts.map(() => "");

  const toTranslate = filtered.map((t) => (t === "" ? "." : t));
  const results: string[] = [];

  for (let i = 0; i < toTranslate.length; i++) {
    const text = toTranslate[i];
    const translated = text === "." ? "" : await translateOne(text, targetLang, sourceLang);
    results.push(translated);
    // Small delay between requests to be nice to the free API
    if (i < toTranslate.length - 1) await new Promise((r) => setTimeout(r, 150));
  }

  return filtered.map((orig, i) => (orig === "" ? "" : results[i] ?? ""));
}

/**
 * Translate a single text. Convenience wrapper.
 */
export async function translateText(
  text: string,
  targetLang: string,
  sourceLang: string = SOURCE_LANG
): Promise<string> {
  const [result] = await translateBatch([text], targetLang, sourceLang);
  return result ?? text;
}

export type ServiceTexts = {
  name: string;
  description: string | null;
  documentsRequired: string | null;
};

export type TranslatedServiceTexts = {
  nameEn: string | null;
  nameAr: string | null;
  nameFr: string | null;
  descriptionEn: string | null;
  descriptionAr: string | null;
  descriptionFr: string | null;
  documentsRequiredEn: string | null;
  documentsRequiredAr: string | null;
  documentsRequiredFr: string | null;
};

/**
 * Fill EN, AR, FR from Italian using MyMemory (free).
 * Always runs (no API key required). Returns null only on total failure.
 */
export async function translateServiceContent(
  source: ServiceTexts,
  sourceLang: string = SOURCE_LANG
): Promise<TranslatedServiceTexts | null> {
  const name = source.name?.trim() ?? "";
  const description = source.description?.trim() ?? "";
  const documents = source.documentsRequired?.trim() ?? "";

  const result: TranslatedServiceTexts = {
    nameEn: null,
    nameAr: null,
    nameFr: null,
    descriptionEn: null,
    descriptionAr: null,
    descriptionFr: null,
    documentsRequiredEn: null,
    documentsRequiredAr: null,
    documentsRequiredFr: null,
  };

  const empty = (s: string) => !s || s === ".";

  for (const target of TARGET_LANGS) {
    const [tName, tDesc, tDoc] = await translateBatch(
      [name || ".", description || ".", documents || "."],
      target,
      sourceLang
    );
    if (target === "en") {
      result.nameEn = name && !empty(tName) ? tName : null;
      result.descriptionEn = description && !empty(tDesc) ? tDesc : null;
      result.documentsRequiredEn = documents && !empty(tDoc) ? tDoc : null;
    } else if (target === "ar") {
      result.nameAr = name && !empty(tName) ? tName : null;
      result.descriptionAr = description && !empty(tDesc) ? tDesc : null;
      result.documentsRequiredAr = documents && !empty(tDoc) ? tDoc : null;
    } else {
      result.nameFr = name && !empty(tName) ? tName : null;
      result.descriptionFr = description && !empty(tDesc) ? tDesc : null;
      result.documentsRequiredFr = documents && !empty(tDoc) ? tDoc : null;
    }
  }

  return result;
}

/** MyMemory is always available (no key required). */
export function isTranslationConfigured(): boolean {
  return true;
}
