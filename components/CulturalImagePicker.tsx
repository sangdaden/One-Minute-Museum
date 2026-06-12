"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Search, Loader2, Check } from "lucide-react";
import type { ScoredImage, ImageCandidate } from "@/lib/image-curation";
import SelectedImageCard from "./SelectedImageCard";

interface CulturalImagePickerProps {
  topic: string;
  onPick: (dataUri: string, candidate: ImageCandidate) => void;
}

type Status = "idle" | "loading" | "ready" | "error";

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(new Error("read failed"));
    r.readAsDataURL(blob);
  });
}

/**
 * Search real cultural images (Wikimedia-first curation) and pick one as the
 * featured image. The picked image is proxied + converted to a data URI so it
 * works through the existing pipeline (crop / publish / share-card export), and
 * its attribution is carried via the candidate.
 */
export default function CulturalImagePicker({
  topic,
  onPick,
}: CulturalImagePickerProps) {
  const t = useTranslations("Cultural");
  const [query, setQuery] = useState(topic);
  const [status, setStatus] = useState<Status>("idle");
  const [results, setResults] = useState<ScoredImage[]>([]);
  const [picking, setPicking] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function search() {
    const q = query.trim();
    if (!q) return;
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/images/curate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: q }),
      });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { results: ScoredImage[] };
      setResults(data.results ?? []);
      setStatus("ready");
    } catch {
      setError(t("error"));
      setStatus("error");
    }
  }

  async function pick(s: ScoredImage) {
    setPicking(s.candidate.id);
    setError(null);
    try {
      const src = s.candidate.thumbnailUrl || s.candidate.imageUrl;
      let dataUri: string;
      if (/^https?:\/\//.test(src)) {
        const res = await fetch(`/api/images/proxy?url=${encodeURIComponent(src)}`);
        if (!res.ok) throw new Error();
        dataUri = await blobToDataUrl(await res.blob());
      } else {
        dataUri = src; // local placeholder (offline mock)
      }
      onPick(dataUri, s.candidate);
    } catch {
      setError(t("pickError"));
    } finally {
      setPicking(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="eyebrow text-ink">{t("header")}</span>
        <span className="h-px flex-1 bg-border-strong" />
      </div>
      <p className="text-sm leading-relaxed text-ink-soft">{t("hint")}</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          search();
        }}
        className="flex gap-2"
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("placeholder")}
          className="flex-1 rounded-full border border-border bg-paper-card px-4 py-2 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint/70 focus:border-accent"
        />
        <button
          type="submit"
          disabled={status === "loading" || query.trim().length === 0}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2 text-sm font-medium text-paper-card transition-colors hover:bg-accent-deep disabled:opacity-60"
        >
          {status === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
          ) : (
            <Search className="h-4 w-4" strokeWidth={1.75} />
          )}
          {t("search")}
        </button>
      </form>

      {error && <p className="text-xs text-accent">{error}</p>}

      {status === "ready" && results.length === 0 && (
        <p className="text-sm text-ink-soft">{t("empty")}</p>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {results.map((s) => (
            <div key={s.candidate.id} className="flex flex-col gap-2">
              <SelectedImageCard candidate={s.candidate} score={s.score} />
              <button
                type="button"
                onClick={() => pick(s)}
                disabled={picking !== null}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border-strong px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:border-accent hover:text-accent disabled:opacity-60"
              >
                {picking === s.candidate.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
                ) : (
                  <Check className="h-4 w-4" strokeWidth={2} />
                )}
                {t("use")}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
