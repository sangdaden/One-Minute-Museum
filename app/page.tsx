"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { ApiError, Exhibition, Mode } from "@/lib/types";
import { DEFAULT_MODE } from "@/lib/constants";
import { saveExhibition } from "@/lib/gallery";
import ObjectInput from "@/components/ObjectInput";
import ModeSelector from "@/components/ModeSelector";
import SuggestedObjects from "@/components/SuggestedObjects";
import ExhibitionCard from "@/components/ExhibitionCard";
import LoadingExhibition from "@/components/LoadingExhibition";
import ErrorState from "@/components/ErrorState";

export default function Home() {
  const [objectName, setObjectName] = useState("");
  const [mode, setMode] = useState<Mode>(DEFAULT_MODE);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exhibition, setExhibition] = useState<Exhibition | null>(null);

  const topRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  async function generate(name: string, selectedMode: Mode) {
    const trimmed = name.trim();
    if (trimmed.length === 0) return;

    setIsLoading(true);
    setError(null);
    // Bring the result area into view on smaller screens.
    requestAnimationFrame(() =>
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );

    try {
      const res = await fetch("/api/exhibitions/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          object_name: trimmed,
          mode: selectedMode,
          language: "vi",
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as ApiError;
        throw new Error(data.error?.message);
      }

      const data = (await res.json()) as Exhibition;
      setExhibition(data);
      // Persist to the local gallery (dedupes by id).
      saveExhibition(data);
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : "Không tạo được triển lãm lúc này. Thử lại nhé.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handlePickSuggested(name: string) {
    setObjectName(name);
    generate(name, mode);
  }

  function handleChangeObject() {
    setError(null);
    setExhibition(null);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main className="mx-auto w-full max-w-[760px] px-5 pb-24 pt-10 sm:px-8 sm:pt-16">
      {/* Masthead */}
      <div ref={topRef} className="reveal flex items-center justify-between">
        <span className="eyebrow text-ink-faint">Bảo Tàng 1 Phút</span>
        <Link
          href="/gallery"
          className="eyebrow group inline-flex items-center gap-1.5 text-ink-soft transition-colors hover:text-accent"
        >
          Bộ sưu tập
          <span
            aria-hidden
            className="transition-transform group-hover:translate-x-0.5"
          >
            →
          </span>
        </Link>
      </div>
      <div
        className="reveal mt-3 h-px bg-ink/80"
        style={{ animationDelay: "60ms" }}
      />

      {/* Hero */}
      <header className="mt-9 flex flex-col gap-6 sm:mt-12">
        <div className="space-y-4">
          <h1
            className="reveal font-serif text-[2.9rem] font-medium leading-[0.98] tracking-[-0.02em] text-ink sm:text-[4.2rem]"
            style={{ animationDelay: "100ms" }}
          >
            Bảo Tàng
            <br />
            <span className="italic text-accent">Một Phút</span>
          </h1>
          <p
            className="reveal max-w-xl text-lg leading-relaxed text-ink-soft sm:text-xl"
            style={{ animationDelay: "160ms" }}
          >
            Biến những vật bình thường quanh bạn thành một triển lãm mini —
            đọc xong trong đúng một phút.
          </p>
        </div>

        <div className="reveal mt-2" style={{ animationDelay: "220ms" }}>
          <ObjectInput
            value={objectName}
            onChange={setObjectName}
            onSubmit={() => generate(objectName, mode)}
            disabled={isLoading}
          />
        </div>

        <div className="reveal mt-1" style={{ animationDelay: "280ms" }}>
          <SuggestedObjects onPick={handlePickSuggested} disabled={isLoading} />
        </div>
      </header>

      {/* Mode selector */}
      <section
        className="reveal mt-14 flex flex-col gap-4"
        style={{ animationDelay: "340ms" }}
      >
        <div className="flex items-center gap-3">
          <span className="eyebrow text-ink">Chọn góc nhìn</span>
          <span className="h-px flex-1 bg-border-strong" />
        </div>
        <ModeSelector value={mode} onChange={setMode} disabled={isLoading} />
      </section>

      {/* Result */}
      <section ref={resultRef} className="mt-14 scroll-mt-6">
        {isLoading ? (
          <LoadingExhibition />
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={() => generate(objectName, mode)}
            onChangeObject={handleChangeObject}
          />
        ) : exhibition ? (
          <ExhibitionCard
            exhibition={exhibition}
            onRegenerate={() => generate(exhibition.object_name, mode)}
          />
        ) : (
          <div className="flex flex-col items-center gap-3 border border-dashed border-border-strong bg-paper-card/40 px-6 py-16 text-center">
            <span aria-hidden className="font-serif text-4xl text-gold/50">
              ❦
            </span>
            <p className="max-w-sm font-serif text-lg italic leading-snug text-ink-soft">
              Chọn một vật bình thường và biến nó thành một triển lãm nhỏ.
            </p>
          </div>
        )}
      </section>

      <footer className="mt-16 flex items-center justify-between border-t border-border pt-5">
        <span className="eyebrow text-ink-faint">One-Minute Museum</span>
        <span className="eyebrow text-ink-faint">© 2026</span>
      </footer>
    </main>
  );
}
