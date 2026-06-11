import Link from "next/link";
import { useTranslations } from "next-intl";
import type { Post } from "@/lib/types";
import { postToExhibition } from "@/lib/posts";
import { formatDate } from "@/lib/format";
import ExhibitionCard from "./ExhibitionCard";
import ReactionBar from "./ReactionBar";

/**
 * One post in the community feed: author header + the full exhibition card.
 * Presentational (no hooks) so it renders both server-side (first page) and
 * client-side (load-more).
 */
export default function FeedPost({ post }: { post: Post }) {
  const t = useTranslations("Feed");
  const tCommon = useTranslations("Common");
  const name = post.author?.display_name || tCommon("anon");
  const avatar = post.author?.avatar_url;

  return (
    <article className="space-y-3">
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
            className="h-8 w-8 rounded-full object-cover ring-1 ring-border"
          />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-sunk text-sm font-medium text-ink-soft">
            {name.charAt(0).toUpperCase()}
          </span>
        )}
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-medium text-ink group-hover:text-accent">
            {name}
          </span>
          <span className="eyebrow text-ink-faint">
            {formatDate(post.created_at)}
          </span>
        </div>
      </Link>

      <ExhibitionCard
        exhibition={postToExhibition(post)}
        imageUrl={post.image_url ?? undefined}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <ReactionBar postId={post.id} initialReactions={post.reactions ?? []} />
        <Link
          href={`/p/${post.id}`}
          className="eyebrow text-ink-soft transition-colors hover:text-accent"
        >
          {post.comment_count ?? 0} {t("comments")} →
        </Link>
      </div>
    </article>
  );
}
