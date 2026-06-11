"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Volume2, Pause, Play, Loader2 } from "lucide-react";
import type { ApiError, Exhibition } from "@/lib/types";

interface ListenButtonProps {
  exhibition: Exhibition;
  /** Optional style overrides so the button can match a themed card. */
  className?: string;
  style?: React.CSSProperties;
}

type Status = "idle" | "loading" | "playing" | "paused" | "error";

/**
 * "Nghe" — reads the exhibition aloud (OpenAI TTS) in a voice matching the
 * curator persona. Generates on first play, then toggles pause/resume. A client
 * island embedded in ExhibitionCard. Audio is ephemeral (object URL only).
 */
export default function ListenButton({
  exhibition,
  className,
  style,
}: ListenButtonProps) {
  const t = useTranslations("Listen");
  const [status, setStatus] = useState<Status>("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);

  function cleanup() {
    audioRef.current?.pause();
    audioRef.current = null;
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
  }

  useEffect(() => cleanup, []);

  async function start() {
    setStatus("loading");
    try {
      const res = await fetch("/api/exhibitions/listen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exhibition }),
      });
      if (!res.ok) {
        let msg: string | undefined;
        try {
          msg = ((await res.json()) as ApiError).error?.message;
        } catch {
          // non-JSON error
        }
        throw new Error(msg);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      urlRef.current = url;
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        cleanup();
        setStatus("idle");
      };
      await audio.play();
      setStatus("playing");
    } catch {
      cleanup();
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2400);
    }
  }

  function onClick() {
    if (status === "loading") return;
    if (status === "playing") {
      audioRef.current?.pause();
      setStatus("paused");
      return;
    }
    if (status === "paused") {
      audioRef.current?.play();
      setStatus("playing");
      return;
    }
    start();
  }

  const Icon =
    status === "loading"
      ? Loader2
      : status === "playing"
        ? Pause
        : status === "paused"
          ? Play
          : Volume2;
  const label =
    status === "loading"
      ? t("loading")
      : status === "playing"
        ? t("pause")
        : status === "paused"
          ? t("resume")
          : status === "error"
            ? t("error")
            : t("view");

  return (
    <button
      type="button"
      onClick={onClick}
      className={
        className ??
        "inline-flex items-center gap-2 rounded-full border border-border-strong px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:border-accent hover:text-accent"
      }
      style={style}
    >
      <Icon
        className={`h-4 w-4 ${status === "loading" ? "animate-spin" : ""}`}
        strokeWidth={1.75}
      />
      {label}
    </button>
  );
}
