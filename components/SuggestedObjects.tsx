"use client";

import { SUGGESTED_OBJECTS } from "@/lib/constants";

interface SuggestedObjectsProps {
  onPick: (name: string) => void;
  disabled?: boolean;
}

/** Suggested-object chips as a named collection (docs/mvp_scope.md F06). */
export default function SuggestedObjects({
  onPick,
  disabled,
}: SuggestedObjectsProps) {
  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center gap-3">
        <span className="eyebrow text-ink-faint">
          Vietnam Everyday Collection
        </span>
        <span className="h-px flex-1 bg-border-strong" />
        <span className="eyebrow text-ink-faint">
          {String(SUGGESTED_OBJECTS.length).padStart(2, "0")}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {SUGGESTED_OBJECTS.map((name) => (
          <button
            key={name}
            type="button"
            disabled={disabled}
            onClick={() => onPick(name)}
            className="group inline-flex items-center gap-1.5 rounded-full border border-border-strong bg-paper-card/60 px-3.5 py-1.5 text-sm text-ink-soft transition-all hover:-translate-y-0.5 hover:border-accent hover:bg-paper-card hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span
              aria-hidden
              className="text-[8px] text-gold transition-colors group-hover:text-accent"
            >
              ◆
            </span>
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}
