"use client";

import { useRef, useState } from "react";
import type { ApiError, Exhibition, Mode } from "@/lib/types";
import { DEFAULT_MODE } from "@/lib/constants";
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

  const inputRef = useRef<HTMLDivElement>(null);

  async function generate(name: string, selectedMode: Mode) {
    const trimmed = name.trim();
    if (trimmed.length === 0) return;

    setIsLoading(true);
    setError(null);

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
      // Keep the old result visible until the new one is ready, then swap.
      setExhibition(data);
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
    inputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-12 px-5 py-12 sm:px-8 sm:py-20">
      {/* Hero */}
      <header ref={inputRef} className="flex flex-col gap-6">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
            One-Minute Museum
          </p>
          <h1 className="font-serif text-4xl leading-tight text-ink sm:text-5xl">
            Bảo Tàng 1 Phút
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-ink-soft">
            Biến những vật bình thường quanh bạn thành một triển lãm mini.
          </p>
        </div>

        <ObjectInput
          value={objectName}
          onChange={setObjectName}
          onSubmit={() => generate(objectName, mode)}
          disabled={isLoading}
        />

        <SuggestedObjects onPick={handlePickSuggested} disabled={isLoading} />
      </header>

      {/* Mode selector */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft">
          Chọn góc nhìn
        </h2>
        <ModeSelector value={mode} onChange={setMode} disabled={isLoading} />
      </section>

      {/* Result area */}
      <section className="min-h-[8rem]">
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
          <div className="rounded-2xl border border-dashed border-border bg-paper-card/60 p-10 text-center">
            <p className="font-serif text-lg text-ink-soft">
              Chọn một vật bình thường và biến nó thành một triển lãm nhỏ.
            </p>
          </div>
        )}
      </section>

      <footer className="border-t border-border pt-6 text-center text-xs text-ink-soft">
        Bảo Tàng 1 Phút — bản MVP. Nội dung hiện tại được tạo bằng dữ liệu mẫu.
      </footer>
    </main>
  );
}
