import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { getTranslations } from "next-intl/server";
import SiteHeader from "@/components/SiteHeader";
import SectionTitle from "@/components/decor/SectionTitle";
import HowItWorks from "@/components/home/HowItWorks";
import DongSonWatermark from "@/components/decor/DongSonWatermark";
import { LANDING_IMAGES } from "@/lib/landing-images";

export default async function AboutPage() {
  const t = await getTranslations("About");
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-[900px] px-5 pb-24 pt-10 sm:px-8">
        <section className="relative overflow-hidden rounded-3xl bg-paper-sunk px-6 py-12 sm:px-10">
          <DongSonWatermark className="absolute -right-10 -top-10 w-64 text-gold/10" />
          <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <h1 className="font-serif text-4xl font-medium text-ink">{t("title")}</h1>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">{t("lead")}</p>
            </div>
            {/* Heritage collage — real Public-Domain / CC0 photos (credited below). */}
            <div className="relative hidden h-56 lg:block" aria-hidden>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/landing/hero-1.jpg"
                alt=""
                className="absolute left-2 top-2 h-36 w-52 -rotate-6 rounded-xl border-4 border-paper-card object-cover shadow-xl"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/landing/hero-3.jpg"
                alt=""
                className="absolute bottom-1 right-4 h-32 w-44 rotate-3 rounded-xl border-4 border-paper-card object-cover shadow-xl"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/landing/di-san.jpg"
                alt=""
                className="absolute bottom-2 left-6 h-24 w-24 rounded-full border-4 border-paper-card object-cover shadow-xl"
              />
            </div>
          </div>
        </section>

        <section className="mt-12">
          <SectionTitle>{t("storyTitle")}</SectionTitle>
          <p className="max-w-2xl leading-relaxed text-ink-soft">{t("storyBody")}</p>
        </section>

        <HowItWorks />

        <section className="mt-12">
          <SectionTitle>{t("missionTitle")}</SectionTitle>
          <p className="max-w-2xl leading-relaxed text-ink-soft">{t("missionBody")}</p>
          <Link href="/create" className="mt-6 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-medium text-paper-card transition-colors hover:bg-accent-deep">
            {t("cta")}
          </Link>
        </section>

        <section className="mt-12">
          <SectionTitle>{t("creditsTitle")}</SectionTitle>
          <p className="mb-5 max-w-2xl text-sm leading-relaxed text-ink-soft">{t("creditsIntro")}</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {LANDING_IMAGES.map((img) => (
              <a
                key={img.slug}
                href={img.sourceUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="group block overflow-hidden rounded-xl border border-border bg-paper-card transition-shadow hover:shadow-md"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.src}
                  alt={img.title}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="p-2.5">
                  <p className="truncate text-xs font-medium text-ink">{img.title}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] text-ink-faint">
                    <span className="truncate">{img.author} · {img.license}</span>
                    <ExternalLink className="h-3 w-3 shrink-0" strokeWidth={2} />
                  </p>
                </div>
              </a>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
