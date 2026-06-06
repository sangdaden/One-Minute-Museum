"use client";

import { SUGGESTED_OBJECTS } from "@/lib/constants";

interface SuggestedObjectsProps {
  onPick: (name: string) => void;
  disabled?: boolean;
}

/** Suggested-object chips (docs/mvp_scope.md F06). Clicking picks + generates. */
export default function SuggestedObjects({
  onPick,
  disabled,
}: SuggestedObjectsProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-ink-soft">
        Hoặc thử một vật quen thuộc
      </p>
      <div className="flex flex-wrap gap-2">
        {SUGGESTED_OBJECTS.map((name) => (
          <button
            key={name}
            type="button"
            disabled={disabled}
            onClick={() => onPick(name)}
            className="rounded-full border border-border bg-paper-card px-4 py-1.5 text-sm text-ink transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}
