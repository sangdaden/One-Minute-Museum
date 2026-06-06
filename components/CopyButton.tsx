"use client";

import { useState } from "react";

interface CopyButtonProps {
  text: string;
}

/** Copies plain text to the clipboard, shows an "Đã copy" confirmation. */
export default function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-live="polite"
      className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2 text-sm font-medium text-paper-card transition-colors hover:bg-ink/85"
    >
      <span aria-hidden className="text-[13px]">
        {copied ? "✓" : "⧉"}
      </span>
      {copied ? "Đã copy" : "Copy nội dung"}
    </button>
  );
}
