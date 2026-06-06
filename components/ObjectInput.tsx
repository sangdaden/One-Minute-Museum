"use client";

import { OBJECT_NAME_MAX } from "@/lib/constants";

interface ObjectInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

/** Text input for the object name (docs/mvp_scope.md F01). */
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
      className="flex w-full flex-col gap-3 sm:flex-row"
    >
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={OBJECT_NAME_MAX}
        placeholder="Ví dụ: dép tổ ong, ghế nhựa đỏ, ly cà phê sữa đá"
        aria-label="Tên vật thể"
        disabled={disabled}
        className="flex-1 rounded-xl border border-border bg-paper-card px-5 py-3.5 text-base text-ink shadow-sm outline-none transition-colors placeholder:text-ink-soft/60 focus:border-accent disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={disabled || value.trim().length === 0}
        className="rounded-xl bg-accent px-7 py-3.5 text-base font-semibold text-paper-card transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Tạo triển lãm
      </button>
    </form>
  );
}
