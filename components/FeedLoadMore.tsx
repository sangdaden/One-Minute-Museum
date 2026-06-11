"use client";

import { useState } from "react";
import type { Post } from "@/lib/types";
import FeedPost from "./FeedPost";

interface FeedLoadMoreProps {
  /** Cursor (created_at of the last server-rendered post), or null if no more. */
  initialNextBefore: string | null;
}

/** Appends more feed posts via /api/feed (keyset pagination). */
export default function FeedLoadMore({ initialNextBefore }: FeedLoadMoreProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [before, setBefore] = useState<string | null>(initialNextBefore);
  const [loading, setLoading] = useState(false);

  async function loadMore() {
    if (!before || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/feed?before=${encodeURIComponent(before)}`);
      const data = (await res.json()) as {
        posts: Post[];
        nextBefore: string | null;
      };
      setPosts((prev) => [...prev, ...data.posts]);
      setBefore(data.nextBefore);
    } catch {
      // leave the button so the user can retry
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {posts.map((post) => (
        <FeedPost key={post.id} post={post} />
      ))}

      {before && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="rounded-full border border-border-strong px-6 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:border-accent hover:text-accent disabled:opacity-60"
          >
            {loading ? "Đang tải…" : "Tải thêm"}
          </button>
        </div>
      )}
    </>
  );
}
