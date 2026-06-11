"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import type { Post } from "@/lib/types";
import { postToExhibition } from "@/lib/posts";
import { getTheme } from "@/lib/themes";
import { buildStorySlides, StorySlideBody } from "./StorySlides";

interface StoriesPlayerProps {
  posts: Post[];
  startIndex: number;
  onClose: () => void;
}

/**
 * Facebook-style multi-post story player: plays through one post's story, then
 * advances to the next post; horizontal swipe switches posts. Tap zones /
 * keyboard advance slides. Portalled to <body>.
 */
export default function StoriesPlayer({
  posts,
  startIndex,
  onClose,
}: StoriesPlayerProps) {
  const tCard = useTranslations("Card");
  const tStory = useTranslations("Story");
  const tCommon = useTranslations("Common");

  const [postIndex, setPostIndex] = useState(startIndex);
  const [slideIndex, setSlideIndex] = useState(0);
  const startX = useRef(0);
  const moved = useRef(false);

  const post = posts[postIndex];
  const ex = useMemo(() => postToExhibition(post), [post]);
  const slides = useMemo(() => buildStorySlides(ex), [ex]);
  const theme = getTheme(ex.theme);
  const imageUrl = post.image_url ?? undefined;
  const authorName = post.author?.display_name || tCommon("anon");

  const current = slides[Math.min(slideIndex, slides.length - 1)];
  const onImage = current.kind === "cover" && !!imageUrl;

  // Advance / rewind a slide; roll into the next/prev post at the boundaries.
  function goSlide(dir: 1 | -1) {
    if (dir > 0) {
      if (slideIndex < slides.length - 1) setSlideIndex(slideIndex + 1);
      else if (postIndex < posts.length - 1) {
        setPostIndex(postIndex + 1);
        setSlideIndex(0);
      } else onClose();
    } else {
      if (slideIndex > 0) setSlideIndex(slideIndex - 1);
      else if (postIndex > 0) {
        setPostIndex(postIndex - 1);
        setSlideIndex(0);
      }
    }
  }
  // Jump whole posts (horizontal swipe = switch "person").
  function goPost(dir: 1 | -1) {
    if (dir > 0) {
      if (postIndex < posts.length - 1) {
        setPostIndex(postIndex + 1);
        setSlideIndex(0);
      } else onClose();
    } else if (postIndex > 0) {
      setPostIndex(postIndex - 1);
      setSlideIndex(0);
    }
  }

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  // Re-bound per render so the handler sees the current indices.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight" || e.key === " " || e.key === "Enter") {
        if (slideIndex < slides.length - 1) setSlideIndex(slideIndex + 1);
        else if (postIndex < posts.length - 1) {
          setPostIndex(postIndex + 1);
          setSlideIndex(0);
        } else onClose();
      } else if (e.key === "ArrowLeft") {
        if (slideIndex > 0) setSlideIndex(slideIndex - 1);
        else if (postIndex > 0) {
          setPostIndex(postIndex - 1);
          setSlideIndex(0);
        }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [postIndex, slideIndex, slides.length, posts.length, onClose]);

  const fg = onImage ? "#ffffff" : theme.ink;
  const accent = onImage ? "#ffffff" : theme.accent;
  // The top scrim is always present in the player, so the header is light.
  const headerColor = "rgba(255,255,255,0.9)";
  const kicker =
    current.kind === "section"
      ? tCard(current.label)
      : current.kind === "fact"
        ? tStory("factKicker", { n: String(current.index + 1).padStart(2, "0") })
        : current.kind === "outro"
          ? tStory("outro")
          : "";

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative h-full w-full overflow-hidden sm:h-[92vh] sm:max-w-[440px] sm:rounded-2xl"
        style={{ background: theme.bg }}
        onTouchStart={(e) => {
          startX.current = e.touches[0].clientX;
          moved.current = false;
        }}
        onTouchMove={(e) => {
          if (Math.abs(e.touches[0].clientX - startX.current) > 10)
            moved.current = true;
        }}
        onTouchEnd={(e) => {
          const dx = e.changedTouches[0].clientX - startX.current;
          // A clear horizontal swipe switches posts (FB-style).
          if (Math.abs(dx) > 50) goPost(dx < 0 ? 1 : -1);
        }}
      >
        <div className="pointer-events-none absolute inset-0">
          <StorySlideBody
            slide={current}
            ex={ex}
            imageUrl={imageUrl}
            fg={fg}
            accent={accent}
            inkSoft={theme.inkSoft}
            kicker={kicker}
          />
        </div>

        {/* Tap zones: left third = prev slide, right = next slide. */}
        <button
          type="button"
          aria-label={tStory("prev")}
          onClick={() => {
            if (moved.current) return;
            goSlide(-1);
          }}
          className="absolute inset-y-0 left-0 z-10 w-[35%] cursor-default"
        />
        <button
          type="button"
          aria-label={tStory("next")}
          onClick={() => {
            if (moved.current) return;
            goSlide(1);
          }}
          className="absolute inset-y-0 right-0 z-10 w-[65%] cursor-default"
        />

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-20 h-32"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)",
          }}
        />

        {/* Progress (current post slides) + author header */}
        <div className="absolute inset-x-0 top-0 z-30 px-3 pt-3">
          <div className="flex gap-1">
            {slides.map((_, i) => (
              <span
                key={i}
                className="h-[3px] flex-1 rounded-full transition-colors"
                style={{
                  background:
                    i <= slideIndex ? "#ffffff" : "rgba(255,255,255,0.35)",
                }}
              />
            ))}
          </div>
          <div className="mt-2.5 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              {post.author?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.author.avatar_url}
                  alt=""
                  className="h-7 w-7 rounded-full object-cover ring-1 ring-white/40"
                />
              ) : (
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium"
                  style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}
                >
                  {authorName.charAt(0).toUpperCase()}
                </span>
              )}
              <span
                className="truncate text-sm font-medium"
                style={{ color: headerColor }}
              >
                {authorName}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={tStory("close")}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
              style={{ color: "#fff", background: "rgba(0,0,0,0.3)" }}
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
