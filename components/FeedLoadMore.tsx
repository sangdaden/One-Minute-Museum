"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import type { Post } from "@/lib/types";
import FeedPost from "./FeedPost";

interface FeedLoadMoreProps {
  /** Cursor (created_at of the last server-rendered post), or null if no more. */
  initialNextBefore: string | null;
}

/**
 * Appends more feed posts via /api/feed (keyset pagination). Loads the next page
 * automatically as the bottom approaches (IntersectionObserver), and keeps a
 * manual "Tải thêm" button as a fallback on error / no-observer.
 */
export default function FeedLoadMore({ initialNextBefore }: FeedLoadMoreProps) {
  const t = useTranslations("LoadMore");
  const [posts, setPosts] = useState<Post[]>([]);
  const [before, setBefore] = useState<string | null>(initialNextBefore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (!before || loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/feed?before=${encodeURIComponent(before)}`);
      if (!res.ok) throw new Error("feed request failed");
      const data = (await res.json()) as {
        posts: Post[];
        nextBefore: string | null;
      };
      setPosts((prev) => [...prev, ...data.posts]);
      setBefore(data.nextBefore);
    } catch {
      setError(true); // surface the fallback button for a manual retry
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [before]);

  // Auto-load when the sentinel nears the viewport. Pauses after an error so the
  // user retries manually instead of hammering a failing endpoint.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !before || error) return;
    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [before, error, loadMore]);

  return (
    <>
      {posts.map((post) => (
        <FeedPost key={post.id} post={post} />
      ))}

      {before && (
        <div className="flex flex-col items-center gap-3 pt-2">
          <div ref={sentinelRef} aria-hidden className="h-px w-full" />
          {loading ? (
            <span className="inline-flex items-center gap-2 text-sm text-ink-soft">
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
              {t("loading")}
            </span>
          ) : (
            <button
              type="button"
              onClick={loadMore}
              className="rounded-full border border-border-strong px-6 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:border-accent hover:text-accent"
            >
              {t("loadMore")}
            </button>
          )}
        </div>
      )}
    </>
  );
}
