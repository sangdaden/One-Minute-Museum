"use client";

import { useState } from "react";
import { Globe } from "lucide-react";
import type { Exhibition } from "@/lib/types";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import { exhibitionToPostInsert } from "@/lib/posts";

interface PublishButtonProps {
  exhibition: Exhibition;
}

type Status = "idle" | "working" | "done" | "error" | "need-login";

/** Publish a generated exhibition to the public feed (login required). */
export default function PublishButton({ exhibition }: PublishButtonProps) {
  const [status, setStatus] = useState<Status>("idle");

  if (!isSupabaseConfigured()) return null;

  async function handlePublish() {
    const supabase = createClient();
    setStatus("working");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setStatus("need-login");
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      return;
    }

    const { error } = await supabase
      .from("posts")
      .insert(exhibitionToPostInsert(exhibition, user.id));

    setStatus(error ? "error" : "done");
  }

  const label =
    status === "working"
      ? "Đang đăng…"
      : status === "done"
        ? "Đã đăng lên cộng đồng ✓"
        : status === "error"
          ? "Đăng lỗi — thử lại"
          : "Đăng lên cộng đồng";

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={handlePublish}
        disabled={status === "working" || status === "done"}
        className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper-card transition-colors hover:bg-ink/85 disabled:opacity-60"
      >
        <Globe className="h-4 w-4" strokeWidth={1.75} />
        {label}
      </button>
      {status === "need-login" && (
        <span className="eyebrow text-ink-faint">Đăng nhập rồi đăng lại nhé</span>
      )}
    </div>
  );
}
