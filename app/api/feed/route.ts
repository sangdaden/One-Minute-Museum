import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { rowToPost } from "@/lib/posts";
import { FEED_PAGE_SIZE } from "@/lib/constants";
import { MODES } from "@/lib/types";
import type { Mode } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/feed?before=<ISO created_at>
 * Returns the next page of public posts (newest first) for keyset pagination.
 */
export async function GET(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ posts: [], nextBefore: null });
  }

  const params = new URL(request.url).searchParams;
  const before = params.get("before");
  const modeParam = params.get("mode");
  const mode = MODES.includes(modeParam as Mode) ? (modeParam as Mode) : null;
  const supabase = await createClient();

  let query = supabase
    .from("posts")
    .select(
      "*, profiles(display_name, avatar_url), reactions(type, user_id), comments(count)",
    )
    .order("created_at", { ascending: false })
    .limit(FEED_PAGE_SIZE);

  if (before) query = query.lt("created_at", before);
  if (mode) query = query.eq("mode", mode);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ posts: [], nextBefore: null });
  }

  const posts = (data ?? []).map(rowToPost);
  const nextBefore =
    posts.length === FEED_PAGE_SIZE
      ? posts[posts.length - 1].created_at
      : null;

  return NextResponse.json({ posts, nextBefore });
}
