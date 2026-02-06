import { getTranslations, setRequestLocale } from "next-intl/server";
import { ATECO_CODE, ATECO_DESCRIPTION } from "@/lib/constants/office";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "chiSiamo" });
  return {
    title: `${t("title")} — Studio CAS Settore Legale di Souiai SNC`,
    description: "Centro di Ascolto Ancona. Assistenza sociale non residenziale, sportelli informativi per migranti, mediazione culturale.",
  };
}

export default async function ChiSiamoPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("chiSiamo");
  const tAteco = await getTranslations("ateco");

  const typicalActivities = tAteco.raw("typicalActivities") as string[];

  return (
    <div className="container-wide py-12 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
        {t("title")}
      </h1>
      <p className="mt-3 text-lg text-stone-600">{t("lead")}</p>

      <section className="mt-10 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-stone-900">{t("ourActivity")}</h2>
          <p className="mt-2 text-stone-600">{tAteco("includes")}</p>
          <p className="mt-2 text-stone-600">
            {t("sectorLead")} <strong>{tAteco("sector")}</strong>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-stone-900">{t("whatWeOffer")}</h2>
          <ul className="mt-3 list-inside list-disc space-y-2 text-stone-600">
            {typicalActivities.map((activity, i) => (
              <li key={i}>{activity}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-stone-200 bg-stone-50 p-6">
          <h2 className="text-lg font-semibold text-stone-900">{tAteco("classification")}</h2>
          <p className="mt-2 text-sm text-stone-600">
            {tAteco("codeDescription", { code: ATECO_CODE, description: ATECO_DESCRIPTION })}
          </p>
        </div>
      </section>
    </div>
  );
}
