"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { Exhibition } from "@/lib/types";
import {
  getExhibitions,
  clearExhibitions,
} from "@/lib/gallery";
import GalleryItem from "@/components/GalleryItem";
import SiteHeader from "@/components/SiteHeader";

export default function GalleryPage() {
  const t = useTranslations("Gallery");
  const tCommon = useTranslations("Common");
  // null = not yet loaded from localStorage (client-only).
  const [items, setItems] = useState<Exhibition[] | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    setItems(getExhibitions());
  }, []);

  function handleClear() {
    clearExhibitions();
    setItems([]);
    setConfirming(false);
  }

  const count = items?.length ?? 0;
  const loaded = items !== null;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1440px] px-5 pb-24 pt-9 sm:px-8 sm:pt-12">
      <div className="lg:grid lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-12">
      {/* Header (sticky hero on large screens) */}
      <header
        className="reveal space-y-5 lg:sticky lg:top-24"
        style={{ animationDelay: "100ms" }}
      >
        <div className="space-y-3">
          <h1 className="font-serif text-[2.6rem] font-medium leading-none tracking-[-0.02em] text-ink sm:text-[3.4rem]">
            {t("title")}<span className="text-accent">.</span>
          </h1>
          <p className="text-base leading-relaxed text-ink-soft">
            {t("subtitle")}
          </p>
        </div>

        {loaded && count > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            <span className="eyebrow text-ink-faint">
              {String(count).padStart(2, "0")} {tCommon("objects")}
            </span>
            {confirming ? (
              <span className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClear}
                  className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-paper-card transition-colors hover:bg-accent-deep"
                >
                  {t("clearConfirm")}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  className="rounded-full border border-border-strong px-4 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
                >
                  {t("cancel")}
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className="rounded-full border border-border-strong px-4 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:border-accent hover:text-accent"
              >
                {t("clearAll")}
              </button>
            )}
          </div>
        )}
      </header>

      {/* Body */}
      <section className="mt-10 lg:mt-0">
        {!loaded ? null : count === 0 ? (
          <div className="reveal flex flex-col items-center gap-4 border border-dashed border-border-strong bg-paper-card/40 px-6 py-20 text-center">
            <span aria-hidden className="font-serif text-5xl text-gold/50">
              ❦
            </span>
            <p className="font-serif text-xl leading-snug text-ink">
              {t("empty")}
            </p>
            <p className="max-w-sm text-sm leading-relaxed text-ink-soft">
              {t("emptyHint")}
            </p>
            <Link
              href="/"
              className="mt-2 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-paper-card transition-colors hover:bg-accent-deep"
            >
              {t("emptyCta")}
              <ArrowRight aria-hidden className="h-4 w-4" strokeWidth={2} />
            </Link>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {items!.map((ex, i) => (
              <li key={ex.id}>
                <GalleryItem exhibition={ex} index={i} />
              </li>
            ))}
          </ul>
        )}
      </section>
      </div>

      <footer className="mt-16 flex items-center justify-between border-t border-border pt-5">
        <span className="eyebrow text-ink-faint">One-Minute Museum</span>
        <span className="eyebrow text-ink-faint">{t("localNote")}</span>
      </footer>
      </main>
    </>
  );
}
