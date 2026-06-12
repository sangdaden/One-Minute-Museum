"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Globe, Share2, Play } from "lucide-react";
import Logo from "./Logo";
import LotusMotif from "./decor/LotusMotif";

/**
 * Global footer: brand block + three link columns over a faint lotus watermark,
 * closed by a red copyright band with the slogan. Links to not-yet-built pages
 * point at the nearest existing route or "#" placeholders (FAQ/guide/terms).
 */
export default function SiteFooter() {
  const t = useTranslations("Footer");
  const col = (heading: string, links: { label: string; href: string }[]) => (
    <div>
      <h3 className="eyebrow mb-3 text-ink">{heading}</h3>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.label}>
            <Link href={l.href} className="text-sm text-ink-soft transition-colors hover:text-accent">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
  return (
    <footer className="relative mt-16 overflow-hidden border-t border-border bg-paper-card">
      <LotusMotif className="absolute -right-6 bottom-6 w-40 text-gold/10" />
      <div className="mx-auto grid w-full max-w-[1440px] gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <div>
          <Logo className="text-[1.2rem]" />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-faint">{t("blurb")}</p>
          <div className="mt-4 flex gap-2.5 text-ink-soft">
            <Globe className="h-5 w-5" strokeWidth={1.6} />
            <Share2 className="h-5 w-5" strokeWidth={1.6} />
            <Play className="h-5 w-5" strokeWidth={1.6} />
          </div>
        </div>
        {col(t("explore"), [
          { label: t("explorePosts"), href: "/kham-pha" },
          { label: t("exploreTopics"), href: "/chu-de" },
          { label: t("exploreCollections"), href: "/chu-de" },
        ])}
        {col(t("support"), [
          { label: t("supportFaq"), href: "/gioi-thieu" },
          { label: t("supportGuide"), href: "/gioi-thieu" },
          { label: t("supportContact"), href: "/gioi-thieu" },
        ])}
        {col(t("about"), [
          { label: t("aboutIntro"), href: "/gioi-thieu" },
          { label: t("aboutTerms"), href: "/gioi-thieu" },
          { label: t("aboutPrivacy"), href: "/gioi-thieu" },
        ])}
      </div>
      <div className="bg-accent py-2.5 text-center text-xs text-paper-card/90">
        {t("rights")} {t("slogan")}
      </div>
    </footer>
  );
}
