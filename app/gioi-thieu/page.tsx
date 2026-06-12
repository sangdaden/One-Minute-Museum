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
          <DongSonWatermark className="absolute -right-8 -top-8 w-56 text-gold/15" />
          <h1 className="font-serif text-4xl font-medium text-ink">{t("title")}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">{t("lead")}</p>
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
          <p className="mb-4 max-w-2xl text-sm leading-relaxed text-ink-soft">{t("creditsIntro")}</p>
          <ul className="space-y-2 text-sm text-ink-faint">
            {LANDING_IMAGES.map((img) => (
              <li key={img.slug} className="flex flex-wrap items-center gap-x-2">
                <a
                  href={img.sourceUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 text-teal transition-colors hover:underline"
                >
                  {img.title}
                  <ExternalLink className="h-3 w-3" strokeWidth={2} />
                </a>
                <span>· {img.author} · {img.license} · Wikimedia Commons</span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}
