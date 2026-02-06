import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { ATECO_CODE, ATECO_DESCRIPTION } from "@/lib/constants/office";

export async function Footer() {
  const t = await getTranslations("common.footer");
  const tNav = await getTranslations("common.nav");

  const footerLinks = [
    { href: "/", label: tNav("home") },
    { href: "/servizi", label: tNav("services") },
    { href: "/chi-siamo", label: tNav("about") },
    { href: "/contatti", label: tNav("contact") },
    { href: "/book", label: tNav("book") },
  ];

  return (
    <footer className="border-t border-stone-200 bg-stone-100/80">
      <div className="container-wide py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-base font-semibold leading-tight text-primary">
              Studio CAS Settore Legale
              <br />
              di Souiai SNC
            </p>
            <p className="mt-1 text-sm text-stone-600">{t("tagline")}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-stone-900">{t("links")}</p>
            <ul className="mt-2 space-y-1">
              {footerLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-stone-600 hover:text-stone-900 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium text-stone-900">{t("activity")}</p>
            <p className="mt-1 text-xs text-stone-600">
              ATECO {ATECO_CODE} — {ATECO_DESCRIPTION}
            </p>
          </div>
        </div>
        <div className="mt-10 border-t border-stone-200 pt-6 text-center text-sm text-stone-500">
          © {new Date().getFullYear()} Studio CAS Settore Legale di Souiai SNC. {t("copyright")}
        </div>
      </div>
    </footer>
  );
}
