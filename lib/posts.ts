import type { Comment, Exhibition, ExhibitionContent, Post } from "./types";

/**
 * Pure mappers between the `Exhibition` shape and the `posts` table. No Supabase
 * import here so both client and server code can use them safely.
 */

/** Split an exhibition into a `posts` insert payload (text-only; no image). */
export function exhibitionToPostInsert(ex: Exhibition, userId: string) {
  const content: ExhibitionContent = {
    title: ex.title,
    hook: ex.hook,
    what_it_is: ex.what_it_is,
    origin_or_context: ex.origin_or_context,
    three_fun_facts: ex.three_fun_facts,
    design_or_cultural_insight: ex.design_or_cultural_insight,
    why_it_matters: ex.why_it_matters,
    reflection_question: ex.reflection_question,
    share_quote: ex.share_quote,
    hashtags: ex.hashtags,
    ...(ex.note ? { note: ex.note } : {}),
  };
  return {
    user_id: userId,
    object_name: ex.object_name,
    mode: ex.mode,
    voice: ex.voice ?? null,
    language: ex.language,
    content,
  };
}

interface PostRow {
  id: string;
  user_id: string;
  object_name: string;
  mode: string;
  voice: string | null;
  language: string;
  created_at: string;
  content: ExhibitionContent;
  theme?: string | null;
  image_url?: string | null;
  profiles?: { display_name: string | null; avatar_url: string | null } | null;
  reactions?: { type: string; user_id: string }[] | null;
  comments?: { count: number }[] | null;
}

/** Map a DB row (optionally with a joined `profiles`) to a `Post`. */
export function rowToPost(row: PostRow): Post {
  return {
    id: row.id,
    user_id: row.user_id,
    object_name: row.object_name,
    mode: row.mode,
    voice: row.voice,
    language: row.language,
    created_at: row.created_at,
    content: row.content,
    theme: row.theme ?? null,
    image_url: row.image_url ?? null,
    author: row.profiles
      ? {
          display_name: row.profiles.display_name,
          avatar_url: row.profiles.avatar_url,
        }
      : undefined,
    reactions: row.reactions ?? [],
    comment_count: row.comments?.[0]?.count ?? 0,
  };
}

interface CommentRow {
  id: string;
  post_id: string;
  user_id: string;
  body: string;
  created_at: string;
  profiles?: { display_name: string | null; avatar_url: string | null } | null;
}

/** Map a DB comment row (optionally joined with `profiles`) to a `Comment`. */
export function rowToComment(row: CommentRow): Comment {
  return {
    id: row.id,
    post_id: row.post_id,
    user_id: row.user_id,
    body: row.body,
    created_at: row.created_at,
    author: row.profiles
      ? {
          display_name: row.profiles.display_name,
          avatar_url: row.profiles.avatar_url,
        }
      : undefined,
  };
}

/** Reconstruct an `Exhibition` from a `Post` (for rendering with existing cards). */
export function postToExhibition(post: Post): Exhibition {
  return {
    id: post.id,
    object_name: post.object_name,
    mode: post.mode,
    voice: post.voice ?? undefined,
    language: post.language,
    created_at: post.created_at,
    theme: post.theme ?? undefined,
    ...post.content,
  };
}
