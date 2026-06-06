"use client";

import { useState } from "react";

interface CopyButtonProps {
  text: string;
}

type CopyStatus = "idle" | "copied" | "error";

/** Best-effort clipboard write with a legacy fallback for non-secure contexts. */
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the legacy path
  }

  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

/** Copy the social-formatted text; reflects idle / copied / error states. */
export default function CopyButton({ text }: CopyButtonProps) {
  const [status, setStatus] = useState<CopyStatus>("idle");

  async function handleCopy() {
    const ok = await copyToClipboard(text);
    setStatus(ok ? "copied" : "error");
    window.setTimeout(() => setStatus("idle"), 2200);
  }

  const label =
    status === "copied"
      ? "Đã copy"
      : status === "error"
        ? "Không copy được"
        : "Copy nội dung";

  const glyph = status === "copied" ? "✓" : status === "error" ? "✕" : "⧉";

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-live="polite"
      className={[
        "inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium text-paper-card transition-colors",
        status === "error" ? "bg-accent hover:bg-accent-deep" : "bg-ink hover:bg-ink/85",
      ].join(" ")}
    >
      <span aria-hidden className="text-[13px]">
        {glyph}
      </span>
      {label}
    </button>
  );
}
