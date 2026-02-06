import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { HeroSlider } from "@/components/landing/HeroSlider";
import { IconCalendar, IconPayment, IconVideo } from "@/components/icons/ServiziIcons";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import { mapService } from "@/lib/db/map";
import type { Service } from "@/lib/types";
import { getServiceName, getServiceDescription, getServiceDocumentsRequired } from "@/lib/i18n/service";
import type { Locale } from "@/lib/i18n/service";
import { ServiceCard } from "@/components/ui/ServiceCard";

type Props = { params: Promise<{ locale: string }> };
type ServiceRow = Database["public"]["Tables"]["services"]["Row"];

export const dynamic = "force-dynamic";

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const tAteco = await getTranslations("ateco");
  const tCommon = await getTranslations("common");
  const safeLocale = locale as Locale;

  const typicalActivities = tAteco.raw("typicalActivities") as string[];

  const supabase = getSupabaseAdmin();
  const { data: rows } = await supabase
    .from("services")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });
  const services: Service[] = (rows ?? []).map((row) => mapService(row as ServiceRow));

  return (
    <>
      <HeroSlider />

        <section
          id="cosa-facciamo"
          className="container-wide scroll-mt-20 py-16 sm:py-20"
          aria-labelledby="cosa-facciamo-heading"
        >
          <p className="section-label">{t("section1.label")}</p>
          <h2
            id="cosa-facciamo-heading"
            className="mt-2 text-2xl font-semibold text-stone-900 sm:text-3xl lg:text-4xl"
          >
            {t("section1.title")}
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-stone-600">
            {t("section1.lead")}
          </p>
          <ul className="mt-10 grid gap-4 sm:grid-cols-1 md:grid-cols-3">
            {typicalActivities.map((activity, i) => (
              <li
                key={i}
                className="flex items-start gap-4 rounded-xl border border-primary/15 bg-primary/[0.04] p-5 opacity-0 shadow-sm transition-shadow duration-200 hover:border-primary/20 hover:shadow-md animate-in"
                style={{ animationDelay: `${(i + 1) * 0.08}s` }}
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary text-sm font-semibold"
                  aria-hidden
                >
                  {i + 1}
                </span>
                <span className="text-stone-700 leading-snug">{activity}</span>
              </li>
            ))}
          </ul>
        </section>

        <section
          id="servizi-online"
          className="border-t border-stone-200 bg-stone-100/90 py-16 sm:py-20"
          aria-labelledby="servizi-online-heading"
        >
          <div className="container-wide">
            <p className="section-label">{t("section2.label")}</p>
            <h2
              id="servizi-online-heading"
              className="mt-2 text-2xl font-semibold text-stone-900 sm:text-3xl lg:text-4xl"
            >
              {t("section2.title")}
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-stone-600">
              {t("section2.lead")}
            </p>
            <ul className="mt-8 flex flex-wrap gap-6 sm:gap-8" aria-hidden>
              <li className="flex items-center gap-3 text-stone-600">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <IconCalendar />
                </span>
                <span className="font-medium text-stone-700">{t("section2.prenota")}</span>
              </li>
              <li className="flex items-center gap-3 text-stone-600">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <IconPayment />
                </span>
                <span className="font-medium text-stone-700">{t("section2.pagaOnline")}</span>
              </li>
              <li className="flex items-center gap-3 text-stone-600">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <IconVideo />
                </span>
                <span className="font-medium text-stone-700">{t("section2.videoConsulenza")}</span>
              </li>
            </ul>
            {services.length > 0 ? (
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {services.map((service) => (
                  <ServiceCard
                    key={`${service.id}-${locale}`}
                    service={service}
                    displayName={getServiceName(service, safeLocale)}
                    displayDescription={getServiceDescription(service, safeLocale)}
                    displayDocumentsRequired={getServiceDocumentsRequired(service, safeLocale)}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-10 rounded-2xl border border-primary/15 bg-primary/[0.04] p-8 shadow-sm sm:p-10 text-center">
                <p className="text-stone-600 text-lg">{t("section2.placeholder")}</p>
                <p className="mt-2 text-sm text-stone-500">{t("section2.placeholderHint")}</p>
                <div className="mt-6 flex flex-wrap justify-center gap-4">
                  <Button href="/book" variant="primary" size="md">
                    {tCommon("buttons.bookConsultation")}
                  </Button>
                  <Button href="/contatti" variant="outline" size="md">
                    {tCommon("buttons.contact")}
                  </Button>
                </div>
              </div>
            )}
            <p className="mt-6 text-center">
              <Link
                href="/servizi"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
              >
                {tCommon("buttons.viewAllServices")}
                <span aria-hidden>→</span>
              </Link>
            </p>
          </div>
        </section>

        <section
          id="contatti-cta"
          className="container-wide scroll-mt-20 py-16 sm:py-20"
          aria-labelledby="contatti-cta-heading"
        >
          <div className="rounded-2xl bg-primary px-6 py-12 text-center text-white shadow-lg sm:px-10 sm:py-16">
            <h2
              id="contatti-cta-heading"
              className="text-2xl font-semibold sm:text-3xl"
            >
              {t("section3.title")}
            </h2>
            <p className="mt-4 max-w-xl mx-auto text-lg text-white/90 leading-relaxed">
              {t("section3.lead")}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button href="/contatti" variant="white" size="lg">
                {tCommon("buttons.contact")}
              </Button>
              <Link
                href="/book"
                className="inline-flex items-center justify-center rounded-lg border-2 border-white/80 bg-transparent px-6 py-3 text-base font-medium text-white transition-colors hover:bg-white/10"
              >
                {tCommon("buttons.bookOnline")}
              </Link>
            </div>
          </div>
        </section>
    </>
  );
}
