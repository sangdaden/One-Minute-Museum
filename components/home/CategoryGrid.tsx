"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Building2, Landmark, Shirt, Drama } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import SectionTitle from "@/components/decor/SectionTitle";

const ICONS: Record<string, LucideIcon> = { Building2, Landmark, Shirt, Drama };

export default function CategoryGrid() {
  const t = useTranslations("Home");
  const tCat = useTranslations("Categories");
  return (
    <section className="mt-14">
      <SectionTitle allHref="/chu-de" allLabel={t("seeAll")}>{t("categoriesTitle")}</SectionTitle>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORIES.map((c) => {
          const Icon = ICONS[c.icon];
          return (
            <Link
              key={c.slug}
              href={`/kham-pha?chu-de=${c.slug}`}
              className="group overflow-hidden rounded-2xl border border-border bg-paper-card transition-shadow hover:shadow-md"
            >
              <div className="relative flex h-28 items-end bg-gradient-to-br from-teal to-teal-deep">
                <span className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-paper-card">
                  <Icon className="h-4 w-4" strokeWidth={2} />
                </span>
              </div>
              <div className="p-3.5">
                <h3 className="text-sm font-semibold text-ink transition-colors group-hover:text-accent">{tCat(`${c.slug}.label`)}</h3>
                <p className="mt-0.5 text-xs text-ink-faint">{tCat(`${c.slug}.description`)}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
