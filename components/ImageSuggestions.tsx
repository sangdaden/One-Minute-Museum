"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Sparkles, RefreshCw, X, Wand2 } from "lucide-react";
import type { ApiError } from "@/lib/types";

interface ImageSuggestionsProps {
  objectName: string;
  /** The currently chosen AI image (data URI), or null if none picked yet. */
  chosen: string | null;
  onPick: (dataUri: string) => void;
  onClear: () => void;
}

type Status = "idle" | "loading" | "ready" | "error";

const COUNT = 3;

/**
 * Generate a few AI sample images of the object and let the user pick one.
 * Shown in the /create result area only when no photo is attached yet. The
 * chosen image flows up via onPick and reuses the normal photo pipeline.
 */
export default function ImageSuggestions({
  objectName,
  chosen,
  onPick,
  onClear,
}: ImageSuggestionsProps) {
  const t = useTranslations("Illustrate");
  const [status, setStatus] = useState<Status>("idle");
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/exhibitions/illustrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ object_name: objectName }),
      });
      if (!res.ok) {
        const data = (await res.json()) as ApiError;
        throw new Error(data.error?.message);
      }
      const data = (await res.json()) as { images: string[] };
      setImages(data.images ?? []);
      setStatus("ready");
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : t("error"));
      setStatus("error");
    }
  }

  // A picture has been chosen: show a compact bar with change/remove.
  if (chosen) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <span className="eyebrow text-ink">{t("header")}</span>
          <span className="h-px flex-1 bg-border-strong" />
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-paper-card/60 p-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={chosen}
            alt=""
            className="h-12 w-12 rounded-lg object-cover ring-1 ring-border"
          />
          <span className="inline-flex items-center gap-1.5 text-sm text-ink-soft">
            <Wand2 className="h-4 w-4 text-accent" strokeWidth={1.75} />
            {t("aiBadge")}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClear();
                setStatus("idle");
                setImages([]);
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-border-strong px-3 py-1.5 text-sm text-ink-soft transition-colors hover:border-accent hover:text-accent"
            >
              <RefreshCw className="h-3.5 w-3.5" strokeWidth={2} />
              {t("change")}
            </button>
            <button
              type="button"
              onClick={() => {
                onClear();
                setStatus("idle");
                setImages([]);
              }}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-ink-faint transition-colors hover:text-accent"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2} />
              {t("remove")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="eyebrow text-ink">{t("header")}</span>
        <span className="h-px flex-1 bg-border-strong" />
      </div>

      {status === "idle" && (
        <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-border-strong bg-paper-card/40 px-5 py-6">
          <p className="text-sm leading-relaxed text-ink-soft">{t("hint")}</p>
          <button
            type="button"
            onClick={generate}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-paper-card transition-colors hover:bg-accent-deep"
          >
            <Sparkles className="h-4 w-4" strokeWidth={1.75} />
            {t("cta")}
          </button>
        </div>
      )}

      {status === "loading" && (
        <div className="grid grid-cols-3 gap-3" role="status" aria-live="polite">
          {Array.from({ length: COUNT }).map((_, i) => (
            <div key={i} className="shimmer aspect-square rounded-xl" />
          ))}
          <span className="sr-only">{t("loading")}</span>
        </div>
      )}

      {status === "ready" && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-ink-soft">{t("pick")}</p>
          <div className="grid grid-cols-3 gap-3">
            {images.map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onPick(src)}
                className="group relative aspect-square overflow-hidden rounded-xl ring-1 ring-border transition-all hover:-translate-y-0.5 hover:ring-2 hover:ring-accent"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={generate}
            className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border-strong px-4 py-2 text-sm text-ink-soft transition-colors hover:border-accent hover:text-accent"
          >
            <RefreshCw className="h-3.5 w-3.5" strokeWidth={2} />
            {t("regenerate")}
          </button>
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-border-strong bg-paper-card/40 px-5 py-6">
          <p className="text-sm text-accent">{error ?? t("error")}</p>
          <button
            type="button"
            onClick={generate}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-paper-card transition-colors hover:bg-accent-deep"
          >
            <Sparkles className="h-4 w-4" strokeWidth={1.75} />
            {t("cta")}
          </button>
        </div>
      )}
    </div>
  );
}
