"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";

/** Write a comment (login required; prompts Google sign-in otherwise). */
export default function CommentForm({ postId }: { postId: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  if (!isSupabaseConfigured()) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = body.trim();
    if (!text || busy) return;
    setBusy(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      setBusy(false);
      return;
    }

    const { error } = await supabase
      .from("comments")
      .insert({ post_id: postId, user_id: user.id, body: text });
    setBusy(false);
    if (!error) {
      setBody("");
      router.refresh();
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={2000}
        rows={3}
        placeholder="Viết bình luận…"
        className="w-full rounded-xl border border-border bg-paper-card px-4 py-3 text-[15px] text-ink outline-none transition-colors placeholder:text-ink-faint/70 focus:border-accent"
      />
      <button
        type="submit"
        disabled={busy || body.trim().length === 0}
        className="self-end rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-paper-card transition-colors hover:bg-accent-deep disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? "Đang gửi…" : "Gửi bình luận"}
      </button>
    </form>
  );
}
