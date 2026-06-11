import { NextResponse } from "next/server";
import { curateImages } from "@/lib/image-curation";

// External provider fetches need the Node.js runtime.
export const runtime = "nodejs";

/**
 * POST /api/images/curate  { topic: string, limit?: number }
 *
 * Searches providers (Wikimedia first), scores, and returns the top relevant
 * images with source/license/author metadata. Works offline via mock data.
 */
export async function POST(request: Request) {
  let body: { topic?: unknown; limit?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const topic = typeof body.topic === "string" ? body.topic.trim() : "";
  if (topic.length < 1 || topic.length > 200) {
    return NextResponse.json(
      { error: "Missing or invalid 'topic'." },
      { status: 400 },
    );
  }
  const limit =
    typeof body.limit === "number" ? Math.min(6, Math.max(1, body.limit)) : 3;

  try {
    const results = await curateImages(topic, { limit });
    return NextResponse.json({ topic, results });
  } catch (err) {
    console.error("[images/curate] unexpected error:", err);
    return NextResponse.json(
      { error: "Image curation failed." },
      { status: 500 },
    );
  }
}
