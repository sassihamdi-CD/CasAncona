import { getTranslations } from "next-intl/server";
import { OFFICE_ADDRESS, OFFICE_ADDRESS_LINE, OFFICE_COORDS } from "@/lib/constants/office";

/** OpenStreetMap embed URL — no API key. bbox = minLng, minLat, maxLng, maxLat; marker = lat,lng */
function getEmbedSrc(lat: number, lng: number) {
  const delta = 0.0025; // tight zoom so the address is clearly centered
  const bbox = [lng - delta, lat - delta, lng + delta, lat + delta].join("%2C");
  const marker = `${lat}%2C${lng}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${marker}`;
}

/** Google Maps "search" URL — opens in new tab with address */
function getGoogleMapsUrl(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

export async function OfficeMap() {
  const t = await getTranslations("common.buttons");
  const tMap = await getTranslations("officeMap");
  const embedSrc = getEmbedSrc(OFFICE_COORDS.lat, OFFICE_COORDS.lng);
  const googleMapsUrl = getGoogleMapsUrl(OFFICE_ADDRESS_LINE);

  return (
    <section
      className="rounded-xl border border-stone-200 bg-white overflow-hidden shadow-sm"
      aria-labelledby="office-map-heading"
    >
      <h2 id="office-map-heading" className="sr-only">
        {tMap("heading")}
      </h2>
      <div className="grid sm:grid-cols-1 lg:grid-cols-5">
        <div className="p-6 lg:col-span-2 lg:p-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            {t("address")}
          </p>
          <address className="mt-2 not-italic text-stone-700">
            <p>{OFFICE_ADDRESS.street}</p>
            <p>
              {OFFICE_ADDRESS.postalCode} {OFFICE_ADDRESS.city} {OFFICE_ADDRESS.province}
            </p>
            <p>{OFFICE_ADDRESS.country}</p>
          </address>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
          >
            {t("openInGoogleMaps")}
            <span aria-hidden>↗</span>
          </a>
        </div>
        <div className="relative h-64 w-full lg:col-span-3 lg:h-72">
          <iframe
            src={embedSrc}
            width="100%"
            height="100%"
            className="absolute inset-0 border-0"
            title="Mappa: sede Studio CAS Settore Legale di Souiai SNC"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}
