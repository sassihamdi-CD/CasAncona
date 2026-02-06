import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { OfficeMap } from "@/components/contact/OfficeMap";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contatti" });
  return {
    title: `${t("title")} — Studio CAS Settore Legale di Souiai SNC`,
    description: "Contatta Studio CAS Settore Legale di Souiai SNC per informazioni o per fissare un appuntamento.",
  };
}

export default async function ContattiPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contatti");

  return (
    <div className="container-wide py-12 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
        {t("title")}
      </h1>
      <p className="mt-3 text-lg text-stone-600">{t("lead")}</p>

      <section className="mt-10" aria-labelledby="dove-siamo-heading">
        <h2 id="dove-siamo-heading" className="text-xl font-semibold text-stone-900 sm:text-2xl">
          {t("whereWeAre")}
        </h2>
        <p className="mt-2 text-stone-600">{t("whereWeAreLead")}</p>
        <div className="mt-6">
          <OfficeMap />
        </div>
      </section>

      <div className="mt-10 rounded-xl border border-stone-200 bg-white p-8 sm:p-10">
        <h2 className="text-lg font-semibold text-stone-900">{t("phoneHours")}</h2>
        <p className="mt-3 text-stone-600">{t("phonePlaceholder")}</p>
        <p className="mt-4 text-sm text-stone-500">
          {t("bookLink")}{" "}
          <Link href="/book" className="font-medium text-primary hover:text-primary-hover">
            {t("bookLinkText")}
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
