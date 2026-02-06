import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BookingFlow } from "@/components/booking/BookingFlow";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "book" });
  return {
    title: `${t("title")} — Studio CAS Settore Legale di Souiai SNC`,
    description: "Prenota una consulenza online. Scegli servizio, data e orario.",
  };
}

export default async function BookPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("book");
  const sp = await searchParams;
  const serviceId = typeof sp?.service === "string" ? sp.service : undefined;

  return (
    <div className="container-narrow py-12">
        <h1 className="text-2xl font-bold text-stone-900 sm:text-3xl">{t("title")}</h1>
        <p className="mt-2 text-stone-600">{t("lead")}</p>
        <BookingFlow preselectedServiceId={serviceId} />
        <p className="mt-8 text-center">
          <Link
            href="/servizi"
            className="text-sm font-medium text-primary hover:text-primary-hover"
          >
            {t("viewServices")} →
          </Link>
        </p>
    </div>
  );
}
