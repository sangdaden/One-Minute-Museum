"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { X, ZoomIn } from "lucide-react";

interface ImageCropperProps {
  src: string;
  onCancel: () => void;
  onDone: (dataUri: string) => void;
}

const OUT = 1080; // exported square size
const MAX_ZOOM = 3;

/**
 * Square (1:1) image reframer — drag to pan, slider/wheel to zoom. Maps the
 * viewport square to source pixels and exports a 1080² JPEG. Used in /create on
 * in-session data URIs (uploaded photos or AI images), so the canvas never
 * tainted by remote CORS.
 */
export default function ImageCropper({
  src,
  onCancel,
  onDone,
}: ImageCropperProps) {
  const t = useTranslations("Cropper");
  const wrapRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);

  const [v, setV] = useState(320); // viewport side in display px
  const [nat, setNat] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  // Measure the square viewport + lock body scroll while open.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setV(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      ro.disconnect();
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  // Natural image size (once).
  useEffect(() => {
    const img = new Image();
    img.onload = () => setNat({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = src;
  }, [src]);

  const base = nat ? Math.max(v / nat.w, v / nat.h) : 1;
  const displayScale = base * zoom;
  const dw = nat ? nat.w * displayScale : 0;
  const dh = nat ? nat.h * displayScale : 0;

  function clamp(p: { x: number; y: number }, z: number) {
    if (!nat) return p;
    const ds = base * z;
    const w = nat.w * ds;
    const h = nat.h * ds;
    const mx = Math.max(0, (w - v) / 2);
    const my = Math.max(0, (h - v) / 2);
    return {
      x: Math.min(mx, Math.max(-mx, p.x)),
      y: Math.min(my, Math.max(-my, p.y)),
    };
  }

  // Re-clamp the pan whenever zoom / viewport / image changes.
  useEffect(() => {
    setPos((p) => clamp(p, zoom));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom, v, nat]);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    drag.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    drag.current = { x: e.clientX, y: e.clientY };
    setPos((p) => clamp({ x: p.x + dx, y: p.y + dy }, zoom));
  }
  function onPointerUp() {
    drag.current = null;
  }
  function onWheel(e: React.WheelEvent<HTMLDivElement>) {
    setZoom((z) => Math.min(MAX_ZOOM, Math.max(1, z - e.deltaY * 0.0015)));
  }

  function done() {
    if (!nat) return;
    const img = new Image();
    img.onload = () => {
      const ds = base * zoom;
      const w = nat.w * ds;
      const h = nat.h * ds;
      const left = v / 2 - w / 2 + pos.x;
      const top = v / 2 - h / 2 + pos.y;
      const sx = (0 - left) / ds;
      const sy = (0 - top) / ds;
      const sSize = v / ds;
      const canvas = document.createElement("canvas");
      canvas.width = OUT;
      canvas.height = OUT;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, sx, sy, sSize, sSize, 0, 0, OUT, OUT);
      onDone(canvas.toDataURL("image/jpeg", 0.88));
    };
    img.src = src;
  }

  const left = nat ? v / 2 - dw / 2 + pos.x : 0;
  const top = nat ? v / 2 - dh / 2 + pos.y : 0;

  return createPortal(
    <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-[400px] rounded-2xl bg-paper-card p-4 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]">
        <div className="mb-3 flex items-center justify-between">
          <span className="eyebrow text-ink">{t("title")}</span>
          <button
            type="button"
            onClick={onCancel}
            aria-label={t("close")}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft transition-colors hover:text-accent"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        <div
          ref={wrapRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onWheel={onWheel}
          className="relative aspect-square w-full cursor-grab touch-none overflow-hidden rounded-xl bg-paper-sunk active:cursor-grabbing"
        >
          {nat && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt=""
              draggable={false}
              className="absolute select-none"
              style={{ left, top, width: dw, height: dh, maxWidth: "none" }}
            />
          )}
          {/* Frame guide */}
          <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/50" />
        </div>

        <p className="mt-2 text-center text-xs text-ink-faint">{t("hint")}</p>

        <div className="mt-2 flex items-center gap-3">
          <ZoomIn className="h-4 w-4 shrink-0 text-ink-soft" strokeWidth={1.75} />
          <input
            type="range"
            min={1}
            max={MAX_ZOOM}
            step={0.01}
            value={zoom}
            aria-label={t("zoom")}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="h-1 w-full cursor-pointer accent-accent"
          />
        </div>

        <div className="mt-4 flex items-center justify-end gap-3 border-t border-border pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-border-strong px-5 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:border-ink/40 hover:text-ink"
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            onClick={done}
            disabled={!nat}
            className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-paper-card transition-colors hover:bg-accent-deep disabled:opacity-50"
          >
            {t("done")}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
