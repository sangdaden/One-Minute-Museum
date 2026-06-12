import Link from "next/link";
import { getTranslations } from "next-intl/server";
import SiteHeader from "@/components/SiteHeader";
import SectionTitle from "@/components/decor/SectionTitle";
import HowItWorks from "@/components/home/HowItWorks";
import DongSonWatermark from "@/components/decor/DongSonWatermark";

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
      </main>
    </>
  );
}
