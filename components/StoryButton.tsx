"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Play } from "lucide-react";
import type { Exhibition } from "@/lib/types";
import StoryViewer from "./StoryViewer";

interface StoryButtonProps {
  exhibition: Exhibition;
  imageUrl?: string;
  /** Optional style overrides so the button can match a themed card. */
  className?: string;
  style?: React.CSSProperties;
}

/**
 * "View as story" trigger. A client island embedded in ExhibitionCard so it
 * works everywhere a card renders (create, feed, detail). Opens the full-screen
 * StoryViewer on click.
 */
export default function StoryButton({
  exhibition,
  imageUrl,
  className,
  style,
}: StoryButtonProps) {
  const t = useTranslations("Story");
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
        <Play className="h-4 w-4" strokeWidth={1.75} />
        {t("view")}
      </button>
      {open && (
        <StoryViewer
          exhibition={exhibition}
          imageUrl={imageUrl}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
