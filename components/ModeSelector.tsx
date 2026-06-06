"use client";

import { MODES } from "@/lib/types";
import type { Mode } from "@/lib/types";
import { MODE_META } from "@/lib/constants";

interface ModeSelectorProps {
  value: Mode;
  onChange: (mode: Mode) => void;
  disabled?: boolean;
}

/** Card-style mode selector (docs/mvp_scope.md F02, docs/ui_spec.md §3). */
export default function ModeSelector({
  value,
  onChange,
  disabled,
}: ModeSelectorProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Chọn góc nhìn"
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
    >
      {MODES.map((mode) => {
        const meta = MODE_META[mode];
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
              "flex flex-col gap-1.5 rounded-xl border p-4 text-left transition-all disabled:opacity-60",
              selected
                ? "border-accent bg-accent/5 shadow-sm ring-1 ring-accent/30"
                : "border-border bg-paper-card hover:border-accent/40",
            ].join(" ")}
          >
            <span className="text-xl" aria-hidden>
              {meta.icon}
            </span>
            <span className="font-serif text-base font-semibold text-ink">
              {mode}
            </span>
            <span className="text-xs leading-relaxed text-ink-soft">
              {meta.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}
