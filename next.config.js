const createNextIntlPlugin = require("next-intl/plugin");

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const noCacheHeaders = [
  { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, max-age=0" },
  { key: "Pragma", value: "no-cache" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    const locales = ["it", "en", "fr", "ar"];
    const entries = [];
    for (const locale of locales) {
      entries.push({ source: `/${locale}`, headers: noCacheHeaders });
      entries.push({ source: `/${locale}/servizi`, headers: noCacheHeaders });
    }
    return entries;
  },
};

module.exports = withNextIntl(nextConfig);
