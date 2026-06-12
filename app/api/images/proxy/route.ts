import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** Allowed image hosts (SSRF guard). */
function isAllowed(host: string): boolean {
  return (
    host === "upload.wikimedia.org" ||
    host.endsWith(".wikimedia.org") ||
    host === "images.unsplash.com" ||
    host === "images.pexels.com"
  );
}

const MAX_BYTES = 8_000_000; // 8 MB

/**
 * GET /api/images/proxy?url=<https image url>
 *
 * Fetches an allowlisted external image server-side and streams it back, so it
 * can be used same-origin (no canvas taint on share-card export, downloadable,
 * publishable). Restricted to known image hosts to avoid SSRF.
 */
export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("url");
  if (!raw) {
    return NextResponse.json({ error: "Missing 'url'." }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return NextResponse.json({ error: "Invalid url." }, { status: 400 });
  }
  if (target.protocol !== "https:" || !isAllowed(target.hostname)) {
    return NextResponse.json({ error: "Host not allowed." }, { status: 400 });
  }

  try {
    const res = await fetch(target, {
      headers: { "User-Agent": "OneMinuteMuseum/1.0 (image proxy)" },
      signal: AbortSignal.timeout(8000),
    });
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok || !type.startsWith("image/")) {
      return NextResponse.json({ error: "Upstream not an image." }, { status: 502 });
    }
    const buf = await res.arrayBuffer();
    if (buf.byteLength > MAX_BYTES) {
      return NextResponse.json({ error: "Image too large." }, { status: 413 });
    }
    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "Fetch failed." }, { status: 502 });
  }
}
