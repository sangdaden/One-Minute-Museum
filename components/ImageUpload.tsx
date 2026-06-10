"use client";

import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { fileToDownscaledDataUrl } from "@/lib/image";

interface ImageUploadProps {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  disabled?: boolean;
}

/**
 * "Thêm ảnh" control. Uses a native file input (camera on mobile), downscales
 * the picked photo client-side, and emits a JPEG data URI. Never persisted.
 */
export default function ImageUpload({
  value,
  onChange,
  disabled,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      onChange(await fileToDownscaledDataUrl(file));
    } catch {
      setError("Không xử lý được ảnh. Thử ảnh khác nhé.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFile}
        disabled={disabled || busy}
      />

      {value ? (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Ảnh vật thể"
            className="h-16 w-16 rounded-lg object-cover ring-1 ring-border"
          />
          <div className="flex flex-col gap-1">
            <span className="eyebrow text-ink-faint">Ảnh đã thêm</span>
            <button
              type="button"
              onClick={() => onChange(null)}
              disabled={disabled}
              className="inline-flex items-center gap-1 text-sm text-ink-soft transition-colors hover:text-accent"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2} />
              Xóa ảnh
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || busy}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-border-strong bg-paper-card/60 px-4 py-2 text-sm text-ink-soft transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ImagePlus className="h-4 w-4" strokeWidth={1.75} />
          {busy ? "Đang xử lý ảnh…" : "Thêm ảnh"}
        </button>
      )}

      {error && <span className="text-xs text-accent">{error}</span>}
      <span className="eyebrow text-ink-faint">
        Ảnh chỉ dùng để tạo, không được lưu.
      </span>
    </div>
  );
}
