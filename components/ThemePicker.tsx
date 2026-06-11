"use client";

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
  return (
    <div
      role="radiogroup"
      aria-label="Chọn phong cách"
      className="flex flex-wrap gap-2"
    >
      {THEMES.map((t) => {
        const selected = t.id === value;
        return (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(t.id)}
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
              style={{ background: t.swatch }}
            />
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
