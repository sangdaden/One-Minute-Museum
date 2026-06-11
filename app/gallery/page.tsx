"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Exhibition } from "@/lib/types";
import {
  getExhibitions,
  clearExhibitions,
} from "@/lib/gallery";
import GalleryItem from "@/components/GalleryItem";
import ThemeToggle from "@/components/ThemeToggle";

export default function GalleryPage() {
  // null = not yet loaded from localStorage (client-only).
  const [items, setItems] = useState<Exhibition[] | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    setItems(getExhibitions());
  }, []);

  function handleClear() {
    clearExhibitions();
    setItems([]);
    setConfirming(false);
  }

  const count = items?.length ?? 0;
  const loaded = items !== null;

  return (
    <main className="mx-auto w-full max-w-[1160px] px-5 pb-24 pt-10 sm:px-8 sm:pt-16">
      {/* Masthead */}
      <div className="reveal flex items-center justify-between">
        <Link
          href="/"
          className="eyebrow group inline-flex items-center gap-1.5 text-ink-soft transition-colors hover:text-accent"
        >
          <span
            aria-hidden
            className="transition-transform group-hover:-translate-x-0.5"
          >
            ←
          </span>
          Trang chủ
        </Link>
        <div className="flex items-center gap-3">
          <span className="eyebrow text-ink-faint">Bộ sưu tập</span>
          <ThemeToggle />
        </div>
      </div>
      <div
        className="reveal mt-3 h-px bg-ink/80"
        style={{ animationDelay: "60ms" }}
      />

      {/* Header */}
      <header
        className="reveal mt-9 flex flex-wrap items-end justify-between gap-4 sm:mt-12"
        style={{ animationDelay: "100ms" }}
      >
        <div className="space-y-3">
          <h1 className="font-serif text-[2.6rem] font-medium leading-none tracking-[-0.02em] text-ink sm:text-[3.4rem]">
            Bộ sưu tập<span className="text-accent">.</span>
          </h1>
          <p className="text-base leading-relaxed text-ink-soft">
            Những hiện vật bạn đã đưa vào bảo tàng của riêng mình.
          </p>
        </div>

        {loaded && count > 0 && (
          <div className="flex items-center gap-3">
            <span className="eyebrow text-ink-faint">
              {String(count).padStart(2, "0")} hiện vật
            </span>
            {confirming ? (
              <span className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClear}
                  className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-paper-card transition-colors hover:bg-accent-deep"
                >
                  Xóa tất cả?
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  className="rounded-full border border-border-strong px-4 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
                >
                  Hủy
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className="rounded-full border border-border-strong px-4 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:border-accent hover:text-accent"
              >
                Xóa bộ sưu tập
              </button>
            )}
          </div>
        )}
      </header>

      {/* Body */}
      <section className="mt-10">
        {!loaded ? null : count === 0 ? (
          <div className="reveal flex flex-col items-center gap-4 border border-dashed border-border-strong bg-paper-card/40 px-6 py-20 text-center">
            <span aria-hidden className="font-serif text-5xl text-gold/50">
              ❦
            </span>
            <p className="font-serif text-xl leading-snug text-ink">
              Bảo tàng của bạn chưa có hiện vật nào.
            </p>
            <p className="max-w-sm text-sm leading-relaxed text-ink-soft">
              Thử bắt đầu với “dép tổ ong” hoặc “ghế nhựa đỏ”.
            </p>
            <Link
              href="/"
              className="mt-2 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-paper-card transition-colors hover:bg-accent-deep"
            >
              Tạo triển lãm đầu tiên
              <span aria-hidden>→</span>
            </Link>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items!.map((ex, i) => (
              <li key={ex.id}>
                <GalleryItem exhibition={ex} index={i} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="mt-16 flex items-center justify-between border-t border-border pt-5">
        <span className="eyebrow text-ink-faint">One-Minute Museum</span>
        <span className="eyebrow text-ink-faint">Lưu cục bộ trên máy bạn</span>
      </footer>
    </main>
  );
}
