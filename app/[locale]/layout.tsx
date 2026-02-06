import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/i18n/routing";
import { SetLocaleAttrs } from "@/components/i18n/SetLocaleAttrs";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export const dynamic = "force-dynamic";

const locales = routing.locales as readonly string[];

function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale);
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!isValidLocale(locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <>
      <SetLocaleAttrs locale={locale} />
      <NextIntlClientProvider locale={locale} messages={messages}>
        <div className="flex min-h-screen w-full flex-col">
          <Header />
          <main className="min-h-0 flex-1 w-full">{children}</main>
          <Footer />
        </div>
      </NextIntlClientProvider>
    </>
  );
}
