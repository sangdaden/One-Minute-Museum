import Link from "next/link";
import { useTranslations } from "next-intl";
import { Heart, MessageCircle, ArrowRight } from "lucide-react";
import type { Post } from "@/lib/types";
import { postToExhibition } from "@/lib/posts";
import { formatDate } from "@/lib/format";
import { getTheme } from "@/lib/themes";

/**
 * Compact feed card: author + a highlight preview (thumbnail, object name,
 * hook) and read-only reaction/comment counts. The card links to the post
 * detail page, where the full exhibition and interactions live. Presentational
 * (renders server-side for the first page and client-side via load-more).
 */
export default function FeedPost({ post }: { post: Post }) {
  const t = useTranslations("Feed");
  const tCommon = useTranslations("Common");
  const ex = postToExhibition(post);
  const theme = getTheme(ex.theme);
  const name = post.author?.display_name || tCommon("anon");
  const avatar = post.author?.avatar_url;
  const reactionCount = post.reactions?.length ?? 0;
  const commentCount = post.comment_count ?? 0;

  return (
    <article className="space-y-2.5">
      {/* Author */}
      <Link
        href={`/u/${post.user_id}`}
        className="group inline-flex items-center gap-2.5"
      >
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatar}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-7 w-7 rounded-full object-cover ring-1 ring-border"
          />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal/10 text-xs font-medium text-teal">
            {name.charAt(0).toUpperCase()}
          </span>
        )}
        <span className="text-sm font-medium text-ink group-hover:text-accent">
          {name}
        </span>
        <span className="eyebrow text-ink-faint">
          {formatDate(post.created_at)}
        </span>
      </Link>

      {/* Highlight preview → detail */}
      <Link
        href={`/p/${post.id}`}
        className="group block overflow-hidden rounded-2xl border border-border bg-paper-card transition-colors hover:border-accent/40"
      >
        <div className="flex gap-4 p-3.5 sm:p-4">
          {/* Thumbnail (1:1) */}
          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl ring-1 ring-border sm:h-28 sm:w-28">
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
              <div
                className="flex h-full w-full items-center justify-center"
                style={{ background: theme.bg, color: theme.accent }}
              >
                <span className="font-serif text-3xl">❦</span>
              </div>
            )}
          </div>

          {/* Text */}
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="eyebrow text-ink-faint">
              {ex.mode}
              {ex.voice ? ` · ${ex.voice}` : ""}
            </span>
            <h3 className="mt-1 line-clamp-2 font-serif text-lg font-semibold leading-snug text-ink sm:text-xl">
              {ex.object_name}
            </h3>
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-ink-soft">
              {ex.hook}
            </p>

            {/* Read-only interaction summary */}
            <div className="mt-auto flex items-center gap-4 pt-2.5 text-ink-faint">
              <span className="inline-flex items-center gap-1.5 text-xs tabular-nums">
                <Heart className="h-4 w-4" strokeWidth={1.75} />
                {reactionCount}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs tabular-nums">
                <MessageCircle className="h-4 w-4" strokeWidth={1.75} />
                {commentCount}
              </span>
              <span className="eyebrow ml-auto inline-flex items-center gap-1 text-ink-soft transition-colors group-hover:text-accent">
                {t("viewDetail")}
                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                  strokeWidth={2}
                />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
