"use client";

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
          <span
            aria-hidden
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-serif text-lg text-accent/60"
          >
            ❡
          </span>
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
          <span
            aria-hidden
            className="transition-transform group-hover/btn:translate-x-0.5"
          >
            →
          </span>
        </button>
      </div>
    </form>
  );
}
