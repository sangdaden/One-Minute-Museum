"use client";

import { Search, ArrowRight } from "lucide-react";
import { OBJECT_NAME_MAX } from "@/lib/constants";

interface ObjectInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

/** Object-name field, styled like an archive search (docs/mvp_scope.md F01). */
export default function ObjectInput({
  value,
  onChange,
  onSubmit,
  disabled,
}: ObjectInputProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="group flex w-full flex-col gap-2"
    >
      <label className="eyebrow text-ink-faint">Hiện vật của bạn</label>
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-stretch">
        <div className="relative flex-1">
          <Search
            aria-hidden
            strokeWidth={1.75}
            className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-accent/60"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            maxLength={OBJECT_NAME_MAX}
            placeholder="Ví dụ: dép tổ ong, ghế nhựa đỏ, ly cà phê sữa đá"
            aria-label="Tên vật thể"
            disabled={disabled}
            className="w-full rounded-none border-b-2 border-border-strong bg-transparent py-3.5 pl-10 pr-4 font-serif text-xl text-ink outline-none transition-colors placeholder:font-sans placeholder:text-base placeholder:text-ink-faint/70 focus:border-accent disabled:opacity-60"
          />
        </div>
        <button
          type="submit"
          disabled={disabled || value.trim().length === 0}
          className="group/btn inline-flex items-center justify-center gap-2 self-start rounded-full bg-accent px-7 py-3 text-sm font-medium tracking-wide text-paper-card shadow-[0_1px_0_var(--color-accent-deep)] transition-all hover:bg-accent-deep disabled:cursor-not-allowed disabled:opacity-35 sm:self-stretch"
        >
          Tạo triển lãm
          <ArrowRight
            aria-hidden
            strokeWidth={2}
            className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5"
          />
        </button>
      </div>
    </form>
  );
}
