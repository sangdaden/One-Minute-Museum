import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { rowToPost, rowToComment, postToExhibition } from "@/lib/posts";
import { formatDate } from "@/lib/format";
import type { Comment } from "@/lib/types";
import ExhibitionCard from "@/components/ExhibitionCard";
import AccountMenu from "@/components/AccountMenu";
import ReactionBar from "@/components/ReactionBar";
import CommentList from "@/components/CommentList";
import CommentForm from "@/components/CommentForm";

export const dynamic = "force-dynamic";

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isSupabaseConfigured()) notFound();
  const tNav = await getTranslations("Nav");
  const t = await getTranslations("Post");
  const tCommon = await getTranslations("Common");

  const supabase = await createClient();
  const { data: postRow } = await supabase
    .from("posts")
    .select(
      "*, profiles(display_name, avatar_url), reactions(type, user_id), comments(count)",
    )
    .eq("id", id)
    .maybeSingle();

  if (!postRow) notFound();
  const post = rowToPost(postRow);

  const { data: commentRows } = await supabase
    .from("comments")
    .select("*, profiles(display_name, avatar_url)")
    .eq("post_id", id)
    .order("created_at", { ascending: true });
  const comments: Comment[] = (commentRows ?? []).map(rowToComment);

  const authorName = post.author?.display_name || tCommon("anon");

  return (
    <main className="mx-auto w-full max-w-[760px] px-5 pb-24 pt-10 sm:px-8 sm:pt-16">
      {/* Masthead */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/"
          className="eyebrow group inline-flex items-center gap-1.5 text-ink-soft transition-colors hover:text-accent"
        >
          <span aria-hidden>←</span> {tNav("explore")}
        </Link>
        <AccountMenu />
      </div>
      <div className="mt-3 h-px bg-ink/80" />

      {/* Author */}
      <Link
        href={`/u/${post.user_id}`}
        className="group mt-8 inline-flex items-center gap-2.5"
      >
        {post.author?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.author.avatar_url}
            alt=""
            className="h-8 w-8 rounded-full object-cover ring-1 ring-border"
          />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-sunk text-sm font-medium text-ink-soft">
            {authorName.charAt(0).toUpperCase()}
          </span>
        )}
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-medium text-ink group-hover:text-accent">
            {authorName}
          </span>
          <span className="eyebrow text-ink-faint">
            {formatDate(post.created_at)}
          </span>
        </div>
      </Link>

      <div className="mt-4">
        <ExhibitionCard
          exhibition={postToExhibition(post)}
          imageUrl={post.image_url ?? undefined}
        />
      </div>

      <div className="mt-5">
        <ReactionBar postId={post.id} initialReactions={post.reactions ?? []} />
      </div>

      {/* Comments */}
      <section className="mt-12 space-y-6">
        <div className="flex items-center gap-3">
          <h2 className="eyebrow text-ink">
            {t("comments", { count: comments.length })}
          </h2>
          <span className="h-px flex-1 bg-border-strong" />
        </div>
        <CommentList comments={comments} />
        <CommentForm postId={post.id} />
      </section>
    </main>
  );
}
