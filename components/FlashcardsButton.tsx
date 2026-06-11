"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Images } from "lucide-react";
import type { Exhibition } from "@/lib/types";
import Flashcards from "./Flashcards";

interface FlashcardsButtonProps {
  exhibition: Exhibition;
  imageUrl?: string;
  /** Optional style overrides so the button can match a themed card. */
  className?: string;
  style?: React.CSSProperties;
}

/**
 * "Flashcards" trigger — a client island embedded in ExhibitionCard so a
 * shareable flashcard deck is available everywhere a card renders.
 */
export default function FlashcardsButton({
  exhibition,
  imageUrl,
  className,
  style,
}: FlashcardsButtonProps) {
  const t = useTranslations("Flashcards");
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ??
          "inline-flex items-center gap-2 rounded-full border border-border-strong px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:border-accent hover:text-accent"
        }
        style={style}
      >
        <Images className="h-4 w-4" strokeWidth={1.75} />
        {t("view")}
      </button>
      {open && (
        <Flashcards
          exhibition={exhibition}
          imageUrl={imageUrl}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
