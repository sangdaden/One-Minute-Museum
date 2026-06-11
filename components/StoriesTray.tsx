"use client";

import { useState } from "react";
import type { Post } from "@/lib/types";
import { getTheme } from "@/lib/themes";
import StoriesPlayer from "./StoriesPlayer";

/**
 * Facebook-style story tray: a horizontal row of ringed bubbles at the top of
 * the feed. Tapping one opens the multi-post StoriesPlayer at that index.
 */
export default function StoriesTray({ posts }: { posts: Post[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (posts.length === 0) return null;

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {posts.map((post, i) => {
          const theme = getTheme(post.theme ?? undefined);
          return (
            <button
              key={post.id}
              type="button"
              onClick={() => setOpenIndex(i)}
              className="flex w-16 shrink-0 flex-col items-center gap-1.5"
            >
              <span className="rounded-full bg-gradient-to-tr from-accent to-gold p-[2px]">
                <span className="block rounded-full bg-paper p-[2px]">
                  <span className="block h-14 w-14 overflow-hidden rounded-full ring-1 ring-border">
                    {post.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.image_url}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span
                        className="flex h-full w-full items-center justify-center font-serif text-xl"
                        style={{ background: theme.bg, color: theme.accent }}
                      >
                        ❦
                      </span>
                    )}
                  </span>
                </span>
              </span>
              <span className="w-full truncate text-center text-[11px] leading-tight text-ink-soft">
                {post.object_name}
              </span>
            </button>
          );
        })}
      </div>

      {openIndex !== null && (
        <StoriesPlayer
          posts={posts}
          startIndex={openIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </>
  );
}
