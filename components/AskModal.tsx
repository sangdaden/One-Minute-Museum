"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { X, Send, Loader2 } from "lucide-react";
import type { ApiError, ChatMessage, Exhibition } from "@/lib/types";

interface AskModalProps {
  exhibition: Exhibition;
  onClose: () => void;
}

/**
 * Ephemeral chat to ask follow-up questions about an exhibition's object. The
 * AI answers grounded in the exhibition, in its curator voice. Portalled to
 * <body>; nothing is stored.
 */
export default function AskModal({ exhibition, onClose }: AskModalProps) {
  const t = useTranslations("Ask");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || loading) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: q }];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/exhibitions/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exhibition, messages: next }),
      });
      if (!res.ok) {
        const data = (await res.json()) as ApiError;
        throw new Error(data.error?.message);
      }
      const data = (await res.json()) as { answer: string };
      setMessages([...next, { role: "assistant", content: data.answer }]);
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : t("error"));
    } finally {
      setLoading(false);
    }
  }

  const suggestions = [t("suggest1"), t("suggest2"), t("suggest3")];

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4">
      <div className="flex h-[80vh] max-h-[620px] w-full max-w-[460px] flex-col rounded-2xl bg-paper-card shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <span className="eyebrow text-ink">{t("title")}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("close")}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft transition-colors hover:text-accent"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
          {messages.length === 0 && (
            <p className="text-sm leading-relaxed text-ink-soft">{t("hint")}</p>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
            >
              <p
                className={[
                  "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[15px] leading-relaxed",
                  m.role === "user"
                    ? "bg-accent text-paper-card"
                    : "bg-paper-sunk text-ink",
                ].join(" ")}
              >
                {m.content}
              </p>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <p className="inline-flex items-center gap-2 rounded-2xl bg-paper-sunk px-3.5 py-2.5 text-sm text-ink-soft">
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
                {t("thinking")}
              </p>
            </div>
          )}
          {error && <p className="text-xs text-accent">{error}</p>}
        </div>

        {/* Suggestions (only before the first message) */}
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2 px-5 pb-1">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="rounded-full border border-border-strong px-3 py-1.5 text-sm text-ink-soft transition-colors hover:border-accent hover:text-accent"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-end gap-2 border-t border-border p-3"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={1}
            maxLength={500}
            placeholder={t("placeholder")}
            className="max-h-28 flex-1 resize-none rounded-xl border border-border bg-paper px-3.5 py-2.5 text-[15px] text-ink outline-none transition-colors placeholder:text-ink-faint/70 focus:border-accent"
          />
          <button
            type="submit"
            disabled={loading || input.trim().length === 0}
            aria-label={t("send")}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-paper-card transition-colors hover:bg-accent-deep disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send className="h-4 w-4" strokeWidth={2} />
          </button>
        </form>
      </div>
    </div>,
    document.body,
  );
}
