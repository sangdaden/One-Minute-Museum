"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Share2,
  Download,
  Loader2,
} from "lucide-react";
import type { Exhibition } from "@/lib/types";
import { getTheme } from "@/lib/themes";
import { slugifyObjectName } from "@/lib/format";
import FlashcardArtwork, {
  FLASHCARD_SIZE,
  type FlashCard,
} from "./FlashcardArtwork";

interface FlashcardsProps {
  exhibition: Exhibition;
  imageUrl?: string;
  onClose: () => void;
}

type Status = "idle" | "working" | "error";

/**
 * Modal carousel of square flashcards with share/download. Renders all card
 * nodes at full 1080px (scaled into a responsive frame, the ShareCard trick) so
 * html-to-image can export any of them deterministically.
 */
export default function Flashcards({
  exhibition: ex,
  imageUrl,
  onClose,
}: FlashcardsProps) {
  const t = useTranslations("Flashcards");
  const theme = getTheme(ex.theme);

  const cards = useMemo<FlashCard[]>(() => {
    const c: FlashCard[] = [{ kind: "cover" }];
    ex.three_fun_facts.slice(0, 3).forEach((f, i) => {
      if (f) c.push({ kind: "fact", index: i, text: f });
    });
    if (ex.share_quote) c.push({ kind: "quote" });
    return c;
  }, [ex]);

  const frameRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [slotW, setSlotW] = useState(0);
  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const [canShare, setCanShare] = useState(false);

  const scale = slotW > 0 ? slotW / FLASHCARD_SIZE : 0;

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  // Keep the preview scaled to the frame, and lock scroll while open.
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const update = () => setSlotW(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      ro.disconnect();
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight")
        setIndex((i) => Math.min(cards.length - 1, i + 1));
      else if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [cards.length, onClose]);

  const slug = slugifyObjectName(ex.object_name);

  async function nodeToBlob(i: number): Promise<Blob | null> {
    const node = nodeRefs.current[i];
    if (!node) return null;
    if (document.fonts?.ready) await document.fonts.ready;
    const { toBlob } = await import("html-to-image");
    return toBlob(node, {
      width: FLASHCARD_SIZE,
      height: FLASHCARD_SIZE,
      canvasWidth: FLASHCARD_SIZE,
      canvasHeight: FLASHCARD_SIZE,
      pixelRatio: 1,
      cacheBust: true,
      backgroundColor: theme.bgSolid,
    });
  }

  function fileName(i: number) {
    return `flashcard-${slug}-${String(i + 1).padStart(2, "0")}.png`;
  }

  async function nodeToFile(i: number): Promise<File | null> {
    const blob = await nodeToBlob(i);
    return blob ? new File([blob], fileName(i), { type: "image/png" }) : null;
  }

  function downloadBlob(blob: Blob, name: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = name;
    link.href = url;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function withStatus(fn: () => Promise<void>) {
    if (status === "working") return;
    setStatus("working");
    try {
      await fn();
      setStatus("idle");
    } catch (err) {
      // A user-cancelled share is not an error.
      if (err instanceof DOMException && err.name === "AbortError") {
        setStatus("idle");
        return;
      }
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2400);
    }
  }

  function downloadCurrent() {
    return withStatus(async () => {
      const blob = await nodeToBlob(index);
      if (blob) downloadBlob(blob, fileName(index));
    });
  }

  function downloadAll() {
    return withStatus(async () => {
      for (let i = 0; i < cards.length; i++) {
        const blob = await nodeToBlob(i);
        if (blob) downloadBlob(blob, fileName(i));
        // Small gap so browsers don't drop rapid-fire downloads.
        await new Promise((r) => setTimeout(r, 350));
      }
    });
  }

  function share() {
    return withStatus(async () => {
      const files: File[] = [];
      for (let i = 0; i < cards.length; i++) {
        const f = await nodeToFile(i);
        if (f) files.push(f);
      }
      const title = `${ex.object_name} — Bảo Tàng 1 Phút`;
      // Prefer sharing the whole deck; fall back to the current card, then
      // to downloads if the platform can't share files.
      if (files.length && navigator.canShare?.({ files })) {
        await navigator.share({ files, title });
        return;
      }
      const one = files[index] ?? files[0];
      if (one && navigator.canShare?.({ files: [one] })) {
        await navigator.share({ files: [one], title });
        return;
      }
      for (const f of files) {
        downloadBlob(f, f.name);
        await new Promise((r) => setTimeout(r, 350));
      }
    });
  }

  const busy = status === "working";

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-[460px] rounded-2xl bg-paper-card p-4 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <span className="eyebrow text-ink">{t("title")}</span>
          <div className="flex items-center gap-3">
            <span className="eyebrow tabular-nums text-ink-faint">
              {index + 1} / {cards.length}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label={t("close")}
              className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft transition-colors hover:text-accent"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div
          ref={frameRef}
          className="relative aspect-square w-full overflow-hidden rounded-xl ring-1 ring-border"
        >
          <div
            className="flex h-full"
            style={{
              transform: `translateX(${-index * slotW}px)`,
              transition: "transform 0.3s ease",
            }}
          >
            {cards.map((card, i) => (
              <div
                key={i}
                style={{ width: slotW, height: slotW, flex: "0 0 auto" }}
              >
                <div
                  style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
                >
                  <FlashcardArtwork
                    ref={(el) => {
                      nodeRefs.current[i] = el;
                    }}
                    exhibition={ex}
                    imageUrl={imageUrl}
                    theme={theme}
                    card={card}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nav */}
        <div className="mt-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0}
            aria-label={t("prev")}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft transition-colors hover:text-accent disabled:opacity-30"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2} />
          </button>
          <div className="flex items-center gap-1.5">
            {cards.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`${i + 1}`}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: i === index ? 18 : 6,
                  background:
                    i === index ? "var(--color-accent)" : "var(--color-border-strong)",
                }}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setIndex((i) => Math.min(cards.length - 1, i + 1))}
            disabled={index === cards.length - 1}
            aria-label={t("next")}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft transition-colors hover:text-accent disabled:opacity-30"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        {/* Actions */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5 border-t border-border pt-4">
          {canShare && (
            <button
              type="button"
              onClick={share}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-paper-card transition-colors hover:bg-accent-deep disabled:opacity-60"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
              ) : (
                <Share2 className="h-4 w-4" strokeWidth={1.75} />
              )}
              {t("shareAll")}
            </button>
          )}
          <button
            type="button"
            onClick={downloadCurrent}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-full border border-border-strong px-4 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:border-accent hover:text-accent disabled:opacity-60"
          >
            <Download className="h-4 w-4" strokeWidth={1.75} />
            {t("download")}
          </button>
          <button
            type="button"
            onClick={downloadAll}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-full border border-border-strong px-4 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:border-accent hover:text-accent disabled:opacity-60"
          >
            {t("downloadAll")}
          </button>
        </div>

        {status === "error" && (
          <p className="mt-2 text-center text-xs text-accent">{t("error")}</p>
        )}
      </div>
    </div>,
    document.body,
  );
}
