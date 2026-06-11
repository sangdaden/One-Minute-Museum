"use client";

import { useState } from "react";
import { Globe } from "lucide-react";
import type { Exhibition } from "@/lib/types";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import { exhibitionToPostInsert } from "@/lib/posts";
import { dataUrlToBlob } from "@/lib/image";

interface PublishButtonProps {
  exhibition: Exhibition;
  /** In-session object photo (data URI) to publish alongside the post. */
  imageUrl?: string;
}

type Status = "idle" | "working" | "done" | "error" | "need-login";

/** Publish a generated exhibition (and its photo, if any) to the public feed. */
export default function PublishButton({
  exhibition,
  imageUrl,
}: PublishButtonProps) {
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

    // Upload the photo to Storage first (if present).
    let publishedImageUrl: string | null = null;
    if (imageUrl) {
      const path = `${user.id}/${crypto.randomUUID()}.jpg`;
      const { error: upErr } = await supabase.storage
        .from("post-images")
        .upload(path, dataUrlToBlob(imageUrl), { contentType: "image/jpeg" });
      if (upErr) {
        setStatus("error");
        return;
      }
      publishedImageUrl = supabase.storage
        .from("post-images")
        .getPublicUrl(path).data.publicUrl;
    }

    // Only reference image_url when there's an image, so text-only publishing
    // still works on databases that haven't run the 0003 migration yet.
    const payload: Record<string, unknown> = exhibitionToPostInsert(
      exhibition,
      user.id,
    );
    if (publishedImageUrl) payload.image_url = publishedImageUrl;
    if (exhibition.theme && exhibition.theme !== "macdinh") {
      payload.theme = exhibition.theme;
    }

    const { error } = await supabase.from("posts").insert(payload);

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
