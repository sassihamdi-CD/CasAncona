"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";

const HERO_IMAGES = [
  { src: "/images/hero-1.jpeg", altKey: "hero.alt1" },
  { src: "/images/hero-2.jpeg", altKey: "hero.alt2" },
  { src: "/images/hero-3.jpeg", altKey: "hero.alt3" },
];

const INTERVAL_MS = 5500;

export function HeroSlider() {
  const t = useTranslations("home");
  const [index, setIndex] = useState(0);

  const goTo = useCallback((i: number) => {
    setIndex((i + HERO_IMAGES.length) % HERO_IMAGES.length);
  }, []);

  useEffect(() => {
    const id = setInterval(() => goTo(index + 1), INTERVAL_MS);
    return () => clearInterval(id);
  }, [index, goTo]);

  return (
    <section className="relative h-[50vh] min-h-[320px] w-full overflow-hidden sm:h-[55vh] md:h-[60vh] lg:h-[65vh]">
      {HERO_IMAGES.map((img, i) => (
        <div
          key={img.src}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            i === index ? "z-0 opacity-100" : "z-[-1] opacity-0"
          }`}
          aria-hidden={i !== index}
        >
          <Image
            src={img.src}
            alt={t(img.altKey)}
            fill
            className="object-cover object-center"
            sizes="100vw"
            priority={i === 0}
          />
          <div
            className="absolute inset-0 bg-stone-900/50"
            aria-hidden
          />
        </div>
      ))}

      <div className="container-narrow relative z-10 flex h-full flex-col items-center justify-center text-center text-white">
        <h1 className="text-3xl font-bold tracking-tight drop-shadow-sm sm:text-4xl lg:text-5xl">
          {t("hero.title")}
        </h1>
        <p className="mt-4 max-w-xl text-lg drop-shadow-sm sm:text-xl">
          {t("hero.subtitle")}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button href="/book" variant="primary" size="lg">
            {t("hero.bookCta")}
          </Button>
          <Link
            href="/servizi"
            className="inline-flex items-center justify-center rounded-lg border-2 border-white bg-transparent px-5 py-2.5 text-base font-medium text-white transition-colors hover:bg-white/10"
          >
            {t("hero.servicesCta")}
          </Link>
        </div>
      </div>

      <div className="absolute bottom-4 left-0 right-0 z-10 flex justify-center gap-2">
        {HERO_IMAGES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            className={`h-2 rounded-full transition-all ${
              i === index ? "w-6 bg-white" : "w-2 bg-white/60 hover:bg-white/80"
            }`}
            aria-label={t("hero.slideLabel", { n: i + 1 })}
          />
        ))}
      </div>
    </section>
  );
}
