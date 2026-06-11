"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { HelpCircle } from "lucide-react";
import type { Exhibition } from "@/lib/types";
import QuizModal from "./QuizModal";

interface QuizButtonProps {
  exhibition: Exhibition;
  /** Optional style overrides so the button can match a themed card. */
  className?: string;
  style?: React.CSSProperties;
}

/**
 * "Đố vui" trigger — a client island embedded in ExhibitionCard so a quiz is
 * available everywhere a card renders. Opens the QuizModal on click.
 */
export default function QuizButton({
  exhibition,
  className,
  style,
}: QuizButtonProps) {
  const t = useTranslations("Quiz");
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
        <HelpCircle className="h-4 w-4" strokeWidth={1.75} />
        {t("view")}
      </button>
      {open && (
        <QuizModal exhibition={exhibition} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
