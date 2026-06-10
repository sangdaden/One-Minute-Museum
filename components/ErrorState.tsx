interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
  onChangeObject: () => void;
}

/** Friendly error plate with retry / change-object (docs/ui_spec.md §7). */
export default function ErrorState({
  message,
  onRetry,
  onChangeObject,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="reveal relative bg-paper-card px-6 py-12 text-center ring-1 ring-border sm:px-10"
    >
      <div className="pointer-events-none absolute inset-[7px] border border-border/70" />

      <div className="relative mx-auto max-w-md space-y-5">
        <span
          aria-hidden
          className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-gold/50 font-serif text-2xl text-gold"
        >
          !
        </span>
        <p className="eyebrow text-ink-faint">Phòng triển lãm tạm đóng</p>
        <p className="font-serif text-xl leading-snug text-ink">
          {message ?? "Không tạo được triển lãm lúc này. Thử lại nhé."}
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-1">
          <button
            type="button"
            onClick={onRetry}
            className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-paper-card transition-colors hover:bg-accent-deep"
          >
            Thử lại
          </button>
          <button
            type="button"
            onClick={onChangeObject}
            className="rounded-full border border-border-strong px-6 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:border-ink/40 hover:text-ink"
          >
            Đổi vật khác
          </button>
        </div>
      </div>
    </div>
  );
}
