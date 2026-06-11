"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import type { Exhibition } from "@/lib/types";
import { getTheme } from "@/lib/themes";

interface StoryViewerProps {
  exhibition: Exhibition;
  imageUrl?: string;
  onClose: () => void;
}

type Slide =
  | { kind: "cover" }
  | {
      kind: "section";
      label: "hook" | "what" | "story" | "insight" | "why" | "reflection";
      body: string;
      emphasis?: boolean;
    }
  | { kind: "fact"; index: number; body: string }
  | { kind: "outro" };

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

  const slides = useMemo<Slide[]>(() => {
    const s: Slide[] = [{ kind: "cover" }];
    if (ex.hook) s.push({ kind: "section", label: "hook", body: ex.hook, emphasis: true });
    if (ex.what_it_is) s.push({ kind: "section", label: "what", body: ex.what_it_is });
    if (ex.origin_or_context)
      s.push({ kind: "section", label: "story", body: ex.origin_or_context });
    ex.three_fun_facts.slice(0, 3).forEach((f, i) => {
      if (f) s.push({ kind: "fact", index: i, body: f });
    });
    if (ex.design_or_cultural_insight)
      s.push({ kind: "section", label: "insight", body: ex.design_or_cultural_insight });
    if (ex.why_it_matters)
      s.push({ kind: "section", label: "why", body: ex.why_it_matters });
    if (ex.reflection_question)
      s.push({
        kind: "section",
        label: "reflection",
        body: ex.reflection_question,
        emphasis: true,
      });
    s.push({ kind: "outro" });
    return s;
  }, [ex]);

  const [index, setIndex] = useState(0);
  const startX = useRef(0);
  const moved = useRef(false);

  const current = slides[index];
  const onImage = current.kind === "cover" && !!imageUrl;

  function next() {
    // Decide outside the updater — calling onClose() (a parent setState) inside
    // a setIndex updater runs during render and triggers a React warning.
    if (index >= slides.length - 1) {
      onClose();
      return;
    }
    setIndex((i) => Math.min(slides.length - 1, i + 1));
  }
  function prev() {
    setIndex((i) => Math.max(0, i - 1));
  }

  // Lock body scroll while the viewer is open (run once).
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  // Keyboard navigation — re-bound per render so it sees the current index.
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
        {/* Slide content (non-interactive; taps pass to the zones below). */}
        <div className="pointer-events-none absolute inset-0">
          <SlideBody
            slide={current}
            ex={ex}
            imageUrl={imageUrl}
            fg={fg}
            accent={accent}
            inkSoft={theme.inkSoft}
            kicker={
              current.kind === "section"
                ? tCard(current.label)
                : current.kind === "fact"
                  ? tStory("factKicker", {
                      n: String(current.index + 1).padStart(2, "0"),
                    })
                  : current.kind === "outro"
                    ? tStory("outro")
                    : ""
            }
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

        {/* Top scrim (only over an image cover, for header contrast). */}
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

function SlideBody({
  slide,
  ex,
  imageUrl,
  fg,
  accent,
  inkSoft,
  kicker,
}: {
  slide: Slide;
  ex: Exhibition;
  imageUrl?: string;
  fg: string;
  accent: string;
  inkSoft: string;
  kicker: string;
}) {
  if (slide.kind === "cover") {
    if (imageUrl) {
      return (
        <div className="relative flex h-full w-full items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="" className="h-full w-full object-contain" />
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-2/3"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.72), transparent)",
            }}
          />
          <div className="absolute inset-x-0 bottom-0 p-7">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/80">
              {ex.object_name}
            </p>
            <h2 className="mt-2 font-serif text-[2rem] font-semibold leading-[1.05] text-white sm:text-[2.4rem]">
              {ex.title}
            </h2>
          </div>
        </div>
      );
    }
    return (
      <div className="flex h-full w-full flex-col justify-center px-8">
        <p
          className="text-[11px] font-medium uppercase tracking-[0.2em]"
          style={{ color: accent }}
        >
          {ex.object_name}
        </p>
        <h2
          className="mt-3 font-serif text-[2.4rem] font-semibold leading-[1.04] sm:text-[3rem]"
          style={{ color: fg }}
        >
          {ex.title}
        </h2>
      </div>
    );
  }

  if (slide.kind === "outro") {
    return (
      <div className="flex h-full w-full flex-col justify-center px-8">
        <p
          className="text-[11px] font-medium uppercase tracking-[0.2em]"
          style={{ color: accent }}
        >
          {kicker}
        </p>
        <p
          className="mt-4 font-serif text-[1.7rem] font-medium leading-snug sm:text-[2.1rem]"
          style={{ color: fg }}
        >
          “{ex.share_quote}”
        </p>
        <div className="mt-6 flex flex-wrap gap-x-3 gap-y-1">
          {ex.hashtags.map((tag) => (
            <span
              key={tag}
              className="text-[11px] font-medium uppercase tracking-[0.14em]"
              style={{ color: inkSoft }}
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    );
  }

  const big = slide.kind === "section" && slide.emphasis;
  const number = slide.kind === "fact";

  return (
    <div className="flex h-full w-full flex-col justify-center px-8">
      <p
        className="text-[11px] font-medium uppercase tracking-[0.2em]"
        style={{ color: accent }}
      >
        {kicker}
      </p>
      {number && (
        <span
          className="mt-3 font-serif text-5xl font-semibold leading-none"
          style={{ color: accent }}
        >
          {String((slide as { index: number }).index + 1).padStart(2, "0")}
        </span>
      )}
      <p
        className={`font-serif font-medium leading-snug ${
          big
            ? "mt-4 text-[2rem] sm:text-[2.6rem]"
            : "mt-4 text-[1.6rem] sm:text-[2.05rem]"
        }`}
        style={{ color: fg }}
      >
        {slide.body}
      </p>
    </div>
  );
}
