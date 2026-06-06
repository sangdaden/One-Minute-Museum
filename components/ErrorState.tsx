interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
  onChangeObject: () => void;
}

/** Error panel with retry / change-object actions (docs/ui_spec.md §7). */
export default function ErrorState({
  message,
  onRetry,
  onChangeObject,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-accent/30 bg-accent/5 p-8 text-center"
    >
      <p className="font-serif text-lg text-ink">
        {message ?? "Không tạo được triển lãm lúc này. Thử lại nhé."}
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-paper-card transition-colors hover:bg-accent/90"
        >
          Thử lại
        </button>
        <button
          type="button"
          onClick={onChangeObject}
          className="rounded-full border border-ink/20 px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-ink/40"
        >
          Đổi vật khác
        </button>
      </div>
    </div>
  );
}
