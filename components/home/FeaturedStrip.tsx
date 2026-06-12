"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Clock, Bookmark, Lightbulb } from "lucide-react";
import SectionTitle from "@/components/decor/SectionTitle";

export interface FeaturedData {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string | null;
  categoryLabel: string | null;
  hashtags: string[];
  funFact: string | null;
}

export default function FeaturedStrip({ featured }: { featured: FeaturedData | null }) {
  const t = useTranslations("Home");

  const title = featured?.title ?? t("featuredFallbackTitle");
  const excerpt = featured?.excerpt ?? t("featuredFallbackExcerpt");
  const funFact = featured?.funFact ?? t("funFactFallback");
  const href = featured ? `/p/${featured.id}` : "/kham-pha";

  return (
    <section className="mt-14">
      <SectionTitle allHref="/kham-pha" allLabel={t("seeAll")}>{t("featuredTitle")}</SectionTitle>
      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <Link href={href} className="group grid overflow-hidden rounded-2xl border border-border bg-paper-card sm:grid-cols-[200px_1fr]">
          <div className="min-h-[150px] bg-gradient-to-br from-[#caa24a] to-[#7e5b23]">
            {featured?.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={featured.imageUrl} alt="" className="h-full w-full object-cover" />
            )}
          </div>
          <div className="p-5">
            {featured?.categoryLabel && (
              <span className="mb-2 inline-block rounded-full border border-accent px-2.5 py-1 text-[10px] uppercase tracking-wide text-accent">
                {featured.categoryLabel}
              </span>
            )}
            <h3 className="font-serif text-xl text-ink transition-colors group-hover:text-accent">{title}</h3>
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-soft">{excerpt}</p>
            {featured && featured.hashtags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {featured.hashtags.slice(0, 3).map((h) => (
                  <span key={h} className="rounded-md bg-paper-sunk px-2 py-1 text-[11px] text-ink-soft">{h}</span>
                ))}
              </div>
            )}
            <div className="mt-3 flex items-center gap-3 text-xs text-ink-faint">
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {t("readTime")}</span>
              <span className="flex items-center gap-1"><Bookmark className="h-3.5 w-3.5" /> {t("save")}</span>
            </div>
          </div>
        </Link>

        <div className="rounded-2xl border border-gold/40 bg-[#fbf3df] p-6">
          <div className="mb-3 inline-flex items-center gap-2 font-medium text-ink">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold text-paper-card">
              <Lightbulb className="h-4 w-4" />
            </span>
            {t("funFact")}
          </div>
          <p className="text-sm leading-relaxed text-ink-soft">{funFact}</p>
        </div>
      </div>
    </section>
  );
}
