"use client";

import { GraduationCap, Armchair, Store, Feather } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { VOICES } from "@/lib/types";
import type { Voice } from "@/lib/types";
import { VOICE_META } from "@/lib/constants";

const VOICE_ICONS: Record<Voice, LucideIcon> = {
  "Nhà nghiên cứu": GraduationCap,
  "Bà kể chuyện": Armchair,
  "Chú bán hàng": Store,
  "Nhà thơ": Feather,
};

interface VoiceSelectorProps {
  value: Voice;
  onChange: (voice: Voice) => void;
  disabled?: boolean;
}

/**
 * Curator-voice picker — a compact pill row, deliberately lighter than the
 * mode cards so the two parallel axes don't read as two heavy grids.
 */
export default function VoiceSelector({
  value,
  onChange,
  disabled,
}: VoiceSelectorProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Chọn giọng kể"
      className="flex flex-wrap gap-2"
    >
      {VOICES.map((voice) => {
        const meta = VOICE_META[voice];
        const Icon = VOICE_ICONS[voice];
        const selected = voice === value;
        return (
          <button
            key={voice}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(voice)}
            title={meta.description}
            className={[
              "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all disabled:cursor-not-allowed disabled:opacity-50",
              selected
                ? "border-accent bg-accent/5 text-accent ring-1 ring-accent/30"
                : "border-border-strong bg-paper-card/60 text-ink-soft hover:border-accent/50 hover:text-ink",
            ].join(" ")}
          >
            <Icon
              aria-hidden
              strokeWidth={1.75}
              className={[
                "h-4 w-4",
                selected ? "text-accent" : "text-gold",
              ].join(" ")}
            />
            {voice}
          </button>
        );
      })}
    </div>
  );
}
