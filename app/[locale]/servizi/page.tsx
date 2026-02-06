import { getTranslations, setRequestLocale } from "next-intl/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import { mapService } from "@/lib/db/map";
import type { Service } from "@/lib/types";
import { getServiceName, getServiceDescription, getServiceDocumentsRequired } from "@/lib/i18n/service";
import type { Locale } from "@/lib/i18n/service";
import { ServiceCard } from "@/components/ui/ServiceCard";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };
type ServiceRow = Database["public"]["Tables"]["services"]["Row"];

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "servizi" });
  return {
    title: `${t("title")} — Studio CAS Settore Legale di Souiai SNC`,
    description: t("metaDescription"),
  };
}

export default async function ServiziPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "servizi" });
  const safeLocale = locale as Locale;

  const supabase = getSupabaseAdmin();
  const { data: rows } = await supabase
    .from("services")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });
  const services: Service[] = (rows ?? []).map((row) => mapService(row as ServiceRow));

  return (
    <div className="container-wide py-12 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
        {t("title")}
      </h1>
      <p className="mt-3 text-lg text-stone-600">{t("lead")}</p>

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
        <div className="mt-10 rounded-xl border border-stone-200 bg-white p-12 text-center">
          <p className="text-stone-600">{t("empty")}</p>
          <p className="mt-2 text-sm text-stone-500">{t("emptyHint")}</p>
        </div>
      )}
    </div>
  );
}
