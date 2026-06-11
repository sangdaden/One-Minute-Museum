"use client";

import { useTranslations } from "next-intl";
import { THEMES } from "@/lib/themes";

interface ThemePickerProps {
  value: string;
  onChange: (themeId: string) => void;
  disabled?: boolean;
}

/** Swatch row to pick a Vietnamese theme (style pattern as VoiceSelector). */
export default function ThemePicker({
  value,
  onChange,
  disabled,
}: ThemePickerProps) {
  const t = useTranslations("Themes");
  const tc = useTranslations("Create");
  return (
    <div
      role="radiogroup"
      aria-label={tc("sectionStyle")}
      className="flex flex-wrap gap-2"
    >
      {THEMES.map((theme) => {
        const selected = theme.id === value;
        return (
          <button
            key={theme.id}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(theme.id)}
            className={[
              "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-all disabled:cursor-not-allowed disabled:opacity-50",
              selected
                ? "border-accent bg-accent/5 text-accent ring-1 ring-accent/30"
                : "border-border-strong text-ink-soft hover:border-accent/50 hover:text-ink",
            ].join(" ")}
          >
            <span
              aria-hidden
              className="h-4 w-4 rounded-full ring-1 ring-black/10"
              style={{ background: theme.swatch }}
            />
            {t(theme.id)}
          </button>
        );
      })}
    </div>
  );
}
