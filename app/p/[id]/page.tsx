import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { rowToPost, rowToComment, postToExhibition } from "@/lib/posts";
import { formatDate } from "@/lib/format";
import type { Comment } from "@/lib/types";
import ExhibitionCard from "@/components/ExhibitionCard";
import SiteHeader from "@/components/SiteHeader";
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
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1440px] px-5 pb-24 pt-9 sm:px-8 sm:pt-12">
      <div className="lg:grid lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-12">
        {/* Left: author + reactions + comment count (sticky) */}
        <aside className="space-y-5 lg:sticky lg:top-24">
          <Link
            href={`/u/${post.user_id}`}
            className="group flex items-center gap-3"
          >
            {post.author?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.author.avatar_url}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-12 w-12 rounded-full object-cover ring-1 ring-border"
              />
            ) : (
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-teal/10 font-serif text-lg text-teal">
                {authorName.charAt(0).toUpperCase()}
              </span>
            )}
            <div className="flex flex-col leading-tight">
              <span className="font-medium text-ink group-hover:text-accent">
                {authorName}
              </span>
              <span className="eyebrow text-ink-faint">
                {formatDate(post.created_at)}
              </span>
            </div>
          </Link>

          <div className="space-y-3 border-t border-border pt-5">
            <ReactionBar
              postId={post.id}
              initialReactions={post.reactions ?? []}
            />
            <span className="inline-flex items-center gap-1.5 text-xs text-ink-faint">
              <MessageCircle className="h-4 w-4" strokeWidth={1.75} />
              {comments.length}
            </span>
          </div>
        </aside>

        {/* Right: exhibition card + comments */}
        <div className="mt-10 space-y-10 lg:mt-0">
          <ExhibitionCard
            exhibition={postToExhibition(post)}
            imageUrl={post.image_url ?? undefined}
          />

          {/* Comments */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="eyebrow text-ink">
                {t("comments", { count: comments.length })}
              </h2>
              <span className="h-px flex-1 bg-border-strong" />
            </div>
            <CommentList comments={comments} />
            <CommentForm postId={post.id} />
          </section>
        </div>
      </div>
      </main>
    </>
  );
}
