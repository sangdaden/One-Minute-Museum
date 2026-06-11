"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MessageCircleQuestion } from "lucide-react";
import type { Exhibition } from "@/lib/types";
import AskModal from "./AskModal";

interface AskButtonProps {
  exhibition: Exhibition;
  /** Optional style overrides so the button can match a themed card. */
  className?: string;
  style?: React.CSSProperties;
}

/**
 * "Hỏi thêm" trigger — a client island embedded in ExhibitionCard so an AI Q&A
 * chat is available everywhere a card renders. Opens the AskModal on click.
 */
export default function AskButton({
  exhibition,
  className,
  style,
}: AskButtonProps) {
  const t = useTranslations("Ask");
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
        <MessageCircleQuestion className="h-4 w-4" strokeWidth={1.75} />
        {t("view")}
      </button>
      {open && (
        <AskModal exhibition={exhibition} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
