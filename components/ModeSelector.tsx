"use client";

import { Home, Landmark, Sparkles, Ruler } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { MODES } from "@/lib/types";
import type { Mode } from "@/lib/types";
import { MODE_META } from "@/lib/constants";

const MODE_ICONS: Record<Mode, LucideIcon> = {
  "Vietnamese Culture": Home,
  Museum: Landmark,
  "Fun Fact": Sparkles,
  Design: Ruler,
};

interface ModeSelectorProps {
  value: Mode;
  onChange: (mode: Mode) => void;
  disabled?: boolean;
}

/** Mode cards styled like catalogue category plates (docs/mvp_scope.md F02). */
export default function ModeSelector({
  value,
  onChange,
  disabled,
}: ModeSelectorProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Chọn góc nhìn"
      className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border lg:grid-cols-4"
    >
      {MODES.map((mode, i) => {
        const meta = MODE_META[mode];
        const Icon = MODE_ICONS[mode];
        const selected = mode === value;
        return (
          <button
            key={mode}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(mode)}
            className={[
              "group relative flex min-h-[8.5rem] flex-col justify-between p-4 text-left transition-colors disabled:opacity-60",
              selected
                ? "bg-paper-card"
                : "bg-paper-card/70 hover:bg-paper-card",
            ].join(" ")}
          >
            {/* selection mark — lacquer top edge */}
            <span
              aria-hidden
              className={[
                "absolute inset-x-0 top-0 h-[3px] origin-left transition-transform",
                selected
                  ? "scale-x-100 bg-accent"
                  : "scale-x-0 bg-accent/50 group-hover:scale-x-100",
              ].join(" ")}
            />
            <div className="flex items-start justify-between">
              <Icon
                aria-hidden
                strokeWidth={1.75}
                className={[
                  "h-[22px] w-[22px]",
                  selected ? "text-accent" : "text-ink-soft",
                ].join(" ")}
              />
              <span
                className={[
                  "eyebrow",
                  selected ? "text-accent" : "text-ink-faint",
                ].join(" ")}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
            <div className="space-y-1">
              <span className="block font-serif text-[15px] font-semibold leading-snug text-ink">
                {mode}
              </span>
              <span className="block text-xs leading-relaxed text-ink-soft">
                {meta.description}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
