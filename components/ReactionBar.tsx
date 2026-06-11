"use client";

import { useEffect, useState } from "react";
import { REACTIONS } from "@/lib/types";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";

interface ReactionBarProps {
  postId: string;
  initialReactions: { type: string; user_id: string }[];
}

/** Curated reactions; one per user/post (toggle to change/remove). */
export default function ReactionBar({
  postId,
  initialReactions,
}: ReactionBarProps) {
  const [reactions, setReactions] = useState(initialReactions);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    createClient()
      .auth.getUser()
      .then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  if (!isSupabaseConfigured()) return null;

  const myReaction = userId
    ? (reactions.find((r) => r.user_id === userId)?.type ?? null)
    : null;

  async function react(type: string) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      return;
    }
    const uid = user.id;
    setUserId(uid);

    if (myReaction === type) {
      setReactions((prev) => prev.filter((r) => r.user_id !== uid));
      await supabase
        .from("reactions")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", uid);
    } else {
      setReactions((prev) => [
        ...prev.filter((r) => r.user_id !== uid),
        { type, user_id: uid },
      ]);
      await supabase
        .from("reactions")
        .upsert(
          { post_id: postId, user_id: uid, type },
          { onConflict: "post_id,user_id" },
        );
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {REACTIONS.map((r) => {
        const count = reactions.filter((x) => x.type === r.type).length;
        const active = myReaction === r.type;
        return (
          <button
            key={r.type}
            type="button"
            onClick={() => react(r.type)}
            title={r.label}
            aria-pressed={active}
            className={[
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
              active
                ? "border-accent bg-accent/10 text-accent"
                : "border-border-strong text-ink-soft hover:border-accent/50 hover:text-ink",
            ].join(" ")}
          >
            <span aria-hidden>{r.emoji}</span>
            {count > 0 && <span className="tabular-nums">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
