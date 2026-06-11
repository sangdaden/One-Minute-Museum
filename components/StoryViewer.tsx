"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import type { Exhibition } from "@/lib/types";
import { getTheme } from "@/lib/themes";
import { buildStorySlides, StorySlideBody, type Slide } from "./StorySlides";

interface StoryViewerProps {
  exhibition: Exhibition;
  imageUrl?: string;
  onClose: () => void;
}

/**
 * Full-screen Stories-style viewer for one exhibition: cover image first, then
 * one piece of content per slide. Manual advance (tap zones / swipe / keyboard).
 * Portalled to <body>; AI content stays in its original language.
 */
export default function StoryViewer({
  exhibition: ex,
  imageUrl,
  onClose,
}: StoryViewerProps) {
  const tCard = useTranslations("Card");
  const tStory = useTranslations("Story");
  const theme = getTheme(ex.theme);

  const slides = useMemo<Slide[]>(() => buildStorySlides(ex), [ex]);

  const [index, setIndex] = useState(0);
  const startX = useRef(0);
  const moved = useRef(false);

  const current = slides[index];
  const onImage = current.kind === "cover" && !!imageUrl;

  function next() {
    if (index >= slides.length - 1) {
      onClose();
      return;
    }
    setIndex((i) => Math.min(slides.length - 1, i + 1));
  }
  function prev() {
    setIndex((i) => Math.max(0, i - 1));
  }

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight" || e.key === " " || e.key === "Enter") {
        if (index >= slides.length - 1) onClose();
        else setIndex((i) => Math.min(slides.length - 1, i + 1));
      } else if (e.key === "ArrowLeft") {
        setIndex((i) => Math.max(0, i - 1));
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [index, slides.length, onClose]);

  const fg = onImage ? "#ffffff" : theme.ink;
  const accent = onImage ? "#ffffff" : theme.accent;
  const kicker =
    current.kind === "section"
      ? tCard(current.label)
      : current.kind === "fact"
        ? tStory("factKicker", { n: String(current.index + 1).padStart(2, "0") })
        : current.kind === "outro"
          ? tStory("outro")
          : "";

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative h-full w-full overflow-hidden sm:h-[92vh] sm:max-w-[440px] sm:rounded-2xl"
        style={{ background: theme.bg }}
        onTouchStart={(e) => {
          startX.current = e.touches[0].clientX;
          moved.current = false;
        }}
        onTouchMove={(e) => {
          if (Math.abs(e.touches[0].clientX - startX.current) > 10)
            moved.current = true;
        }}
        onTouchEnd={(e) => {
          const dx = e.changedTouches[0].clientX - startX.current;
          if (Math.abs(dx) > 40) (dx < 0 ? next : prev)();
        }}
      >
        <div className="pointer-events-none absolute inset-0">
          <StorySlideBody
            slide={current}
            ex={ex}
            imageUrl={imageUrl}
            fg={fg}
            accent={accent}
            inkSoft={theme.inkSoft}
            kicker={kicker}
          />
        </div>

        {/* Tap zones: left third = prev, right two-thirds = next. */}
        <button
          type="button"
          aria-label={tStory("prev")}
          onClick={() => {
            if (moved.current) return;
            prev();
          }}
          className="absolute inset-y-0 left-0 z-10 w-[35%] cursor-default"
        />
        <button
          type="button"
          aria-label={tStory("next")}
          onClick={() => {
            if (moved.current) return;
            next();
          }}
          className="absolute inset-y-0 right-0 z-10 w-[65%] cursor-default"
        />

        {onImage && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 z-20 h-28"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.45), transparent)",
            }}
          />
        )}

        {/* Progress bar + header */}
        <div className="absolute inset-x-0 top-0 z-30 px-3 pt-3">
          <div className="flex gap-1">
            {slides.map((_, i) => (
              <span
                key={i}
                className="h-[3px] flex-1 rounded-full transition-colors"
                style={{
                  background:
                    i <= index
                      ? accent
                      : onImage
                        ? "rgba(255,255,255,0.35)"
                        : `${theme.inkSoft}40`,
                }}
              />
            ))}
          </div>
          <div className="mt-2.5 flex items-center justify-between gap-3">
            <span
              className="truncate text-[11px] font-medium uppercase tracking-[0.18em]"
              style={{ color: onImage ? "rgba(255,255,255,0.85)" : theme.inkSoft }}
            >
              {ex.object_name}
              {ex.voice ? ` · ${ex.voice}` : ""}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label={tStory("close")}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
              style={{
                color: fg,
                background: onImage ? "rgba(0,0,0,0.25)" : "transparent",
              }}
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
