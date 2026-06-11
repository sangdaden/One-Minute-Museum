"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { X, Check, Loader2, RotateCcw, ArrowRight } from "lucide-react";
import type { ApiError, Exhibition, QuizQuestion } from "@/lib/types";

interface QuizModalProps {
  exhibition: Exhibition;
  onClose: () => void;
}

type Status = "loading" | "playing" | "error";

/**
 * Interactive multiple-choice quiz generated from an exhibition. One question at
 * a time with immediate feedback + explanation, then a score screen. Portalled
 * to <body>; AI content stays in its original language.
 */
export default function QuizModal({ exhibition, onClose }: QuizModalProps) {
  const t = useTranslations("Quiz");
  const [status, setStatus] = useState<Status>("loading");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/exhibitions/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exhibition }),
      });
      if (!res.ok) {
        const data = (await res.json()) as ApiError;
        throw new Error(data.error?.message);
      }
      const data = (await res.json()) as { questions: QuizQuestion[] };
      setQuestions(data.questions ?? []);
      setIndex(0);
      setSelected(null);
      setScore(0);
      setDone(false);
      setStatus("playing");
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : t("error"));
      setStatus("error");
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  function pick(i: number) {
    if (selected !== null) return;
    setSelected(i);
    if (i === questions[index]?.answer_index) setScore((s) => s + 1);
  }
  function next() {
    if (index >= questions.length - 1) {
      setDone(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
  }
  function replay() {
    setIndex(0);
    setSelected(null);
    setScore(0);
    setDone(false);
  }

  const q = questions[index];
  const total = questions.length;
  const isCorrect = selected !== null && selected === q?.answer_index;
  const praise =
    score === total
      ? t("praisePerfect")
      : score >= total - 1
        ? t("praiseGood")
        : t("praiseTry");

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-[460px] rounded-2xl bg-paper-card p-5 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <span className="eyebrow text-ink">{t("title")}</span>
          <div className="flex items-center gap-3">
            {status === "playing" && !done && (
              <span className="eyebrow tabular-nums text-ink-faint">
                {index + 1} / {total}
              </span>
            )}
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

        {status === "loading" && (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-ink-soft">
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
            {t("loading")}
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <p className="text-sm text-accent">{error ?? t("error")}</p>
            <button
              type="button"
              onClick={load}
              className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-paper-card transition-colors hover:bg-accent-deep"
            >
              {t("replay")}
            </button>
          </div>
        )}

        {status === "playing" && !done && q && (
          <div className="space-y-4">
            <p className="font-serif text-xl font-medium leading-snug text-ink">
              {q.question}
            </p>
            <div className="space-y-2.5">
              {q.options.map((opt, i) => {
                const answered = selected !== null;
                const isAnswer = i === q.answer_index;
                const isPicked = i === selected;
                const cls = !answered
                  ? "border-border-strong text-ink-soft hover:border-accent hover:text-ink"
                  : isAnswer
                    ? "border-teal bg-teal/10 text-teal"
                    : isPicked
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border text-ink-faint opacity-60";
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => pick(i)}
                    disabled={answered}
                    className={`flex w-full items-center gap-2.5 rounded-xl border px-4 py-3 text-left text-[15px] transition-colors ${cls}`}
                  >
                    <span className="flex-1">{opt}</span>
                    {answered && isAnswer && (
                      <Check className="h-4 w-4 shrink-0" strokeWidth={2.5} />
                    )}
                    {answered && isPicked && !isAnswer && (
                      <X className="h-4 w-4 shrink-0" strokeWidth={2.5} />
                    )}
                  </button>
                );
              })}
            </div>

            {selected !== null && (
              <div className="space-y-3 rounded-xl bg-paper-sunk p-3.5">
                <p
                  className={`text-sm font-semibold ${isCorrect ? "text-teal" : "text-accent"}`}
                >
                  {isCorrect ? t("correct") : t("wrong")}
                </p>
                {q.explanation && (
                  <p className="text-sm leading-relaxed text-ink-soft">
                    {q.explanation}
                  </p>
                )}
                <button
                  type="button"
                  onClick={next}
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2 text-sm font-medium text-paper-card transition-colors hover:bg-accent-deep"
                >
                  {index >= total - 1 ? t("seeResult") : t("next")}
                  <ArrowRight className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
            )}
          </div>
        )}

        {status === "playing" && done && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <span className="eyebrow text-ink-faint">{t("result")}</span>
            <p className="font-serif text-3xl font-semibold text-ink">
              {t("score", { correct: score, total })}
            </p>
            <p className="max-w-xs text-sm leading-relaxed text-ink-soft">
              {praise}
            </p>
            <div className="mt-2 flex items-center gap-2.5">
              <button
                type="button"
                onClick={replay}
                className="inline-flex items-center gap-2 rounded-full border border-border-strong px-4 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:border-accent hover:text-accent"
              >
                <RotateCcw className="h-4 w-4" strokeWidth={1.75} />
                {t("replay")}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-paper-card transition-colors hover:bg-accent-deep"
              >
                {t("close")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
