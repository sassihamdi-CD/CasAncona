import { getTranslations, setRequestLocale } from "next-intl/server";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };

const SECTIONS = ["s1", "s2", "s3", "s4", "s5", "s6"] as const;

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "terms" });
  return {
    title: `${t("title")} — Studio CAS Settore Legale di Souiai SNC`,
    description: t("metaDescription"),
  };
}

export default async function TerminiCondizioniPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("terms");

  return (
    <div className="container-wide py-12 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
        {t("title")}
      </h1>
      <p className="mt-2 text-sm text-stone-500">
        {t("lastUpdate")}: 2025
      </p>
      <p className="mt-4 text-lg text-stone-600 leading-relaxed">
        {t("intro")}
      </p>

      <div className="mt-10 space-y-8">
        {SECTIONS.map((key) => (
          <section key={key}>
            <h2 className="text-xl font-semibold text-stone-900">
              {t(`${key}Title`)}
            </h2>
            <p className="mt-2 text-stone-600 leading-relaxed whitespace-pre-line">
              {t(`${key}Body`)}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
