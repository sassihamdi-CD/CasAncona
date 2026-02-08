/**
 * Office / business constants for Studio CAS Settore Legale di Souiai SNC.
 * Use in landing page, footer, "Chi siamo", or legal/transparency sections.
 */

/** Office address — for map, contact page, and "in person" booking */
export const OFFICE_ADDRESS = {
  street: "Via Manfredo Fanti, 3",
  city: "Ancona",
  province: "AN",
  postalCode: "60121",
  country: "Italia",
} as const;

/** Full legal name for receipts and official documents */
export const STUDIO_LEGAL_NAME = "Studio CAS Settore Legale di Souiai SNC" as const;

/** Single-line address for links and display */
export const OFFICE_ADDRESS_LINE =
  `${OFFICE_ADDRESS.street}, ${OFFICE_ADDRESS.postalCode} ${OFFICE_ADDRESS.city} ${OFFICE_ADDRESS.province}, ${OFFICE_ADDRESS.country}` as const;

/** Coordinates for map embed — Via Manfredo Fanti 3, 60121 Ancona (exact building) */
export const OFFICE_COORDS = {
  lat: 43.61608,
  lng: 13.50868,
} as const;

/** ATECO code — classificazione attività economica */
export const ATECO_CODE = "89.99.00" as const;

/** Descrizione ufficiale ATECO */
export const ATECO_DESCRIPTION =
  "Altre attività di assistenza sociale non residenziale n.e.c." as const;

/** Breve spiegazione per il sito (italiano) */
export const ATECO_SCOPE = {
  sector: "Assistenza sociale non residenziale",
  includes:
    "Attività di supporto sociale e assistenziale che non rientrano in altre categorie più specifiche.",
  typicalActivities: [
    "Sportelli informativi per migranti",
    "Assistenza amministrativa o di supporto (senza ricovero o residenza)",
    "Mediazione culturale o sociale non specialistica (non sanitaria)",
  ] as const,
} as const;
