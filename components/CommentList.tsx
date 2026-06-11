"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Comment } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";

/** Flat comment list (oldest→newest); shows a delete action on your own. */
export default function CommentList({ comments }: { comments: Comment[] }) {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    createClient()
      .auth.getUser()
      .then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  async function remove(id: string) {
    await createClient().from("comments").delete().eq("id", id);
    router.refresh();
  }

  if (comments.length === 0) {
    return (
      <p className="text-sm leading-relaxed text-ink-soft">
        Chưa có bình luận. Hãy là người đầu tiên.
      </p>
    );
  }

  return (
    <ul className="space-y-5">
      {comments.map((c) => {
        const name = c.author?.display_name || "Người dùng ẩn danh";
        return (
          <li key={c.id} className="flex gap-3">
            <Link href={`/u/${c.user_id}`} className="shrink-0">
              {c.author?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.author.avatar_url}
                  alt=""
                  className="mt-0.5 h-8 w-8 rounded-full object-cover ring-1 ring-border"
                />
              ) : (
                <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-paper-sunk text-sm font-medium text-ink-soft">
                  {name.charAt(0).toUpperCase()}
                </span>
              )}
            </Link>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Link
                  href={`/u/${c.user_id}`}
                  className="text-sm font-medium text-ink transition-colors hover:text-accent"
                >
                  {name}
                </Link>
                <span className="eyebrow text-ink-faint">
                  {formatDate(c.created_at)}
                </span>
                {userId === c.user_id && (
                  <button
                    type="button"
                    onClick={() => remove(c.id)}
                    className="ml-auto text-xs text-ink-faint transition-colors hover:text-accent"
                  >
                    Xóa
                  </button>
                )}
              </div>
              <p className="mt-0.5 whitespace-pre-wrap text-[15px] leading-relaxed text-ink/90">
                {c.body}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
