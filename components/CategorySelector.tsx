"use client";

import { useTranslations } from "next-intl";
import {
  Armchair,
  UtensilsCrossed,
  Bike,
  ToyBrick,
  Shirt,
  Landmark,
  Drama,
  Shapes,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import type { Category } from "@/lib/categories";

const ICONS: Record<Category["icon"], LucideIcon> = {
  Armchair,
  UtensilsCrossed,
  Bike,
  ToyBrick,
  Shirt,
  Landmark,
  Drama,
  Shapes,
};

interface Props {
  value: string;
  onChange: (slug: string) => void;
  disabled?: boolean;
}

/** Chip selector for a post's content topic. Includes the "Khác" catch-all. */
export default function CategorySelector({ value, onChange, disabled }: Props) {
  const t = useTranslations("Categories");
  const tc = useTranslations("Create");
  return (
    <div role="radiogroup" aria-label={tc("sectionCategory")} className="flex flex-wrap gap-2">
      {CATEGORIES.map((c) => {
        const Icon = ICONS[c.icon];
        const selected = c.slug === value;
        return (
          <button
            key={c.slug}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(c.slug)}
            className={[
              "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-colors disabled:opacity-60",
              selected
                ? "border-accent bg-accent/5 text-accent ring-1 ring-accent/30"
                : "border-border-strong text-ink-soft hover:border-accent/50 hover:text-ink",
            ].join(" ")}
          >
            <Icon className="h-4 w-4" strokeWidth={2} />
            {t(`${c.slug}.label`)}
          </button>
        );
      })}
    </div>
  );
}
