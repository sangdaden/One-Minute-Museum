import type { ImageSource } from "@/lib/image-curation";

const LABEL: Record<ImageSource, string> = {
  wikimedia: "Wikimedia",
  unsplash: "Unsplash",
  pexels: "Pexels",
  user_upload: "Ảnh của bạn",
};

const STYLE: Record<ImageSource, string> = {
  wikimedia: "bg-teal/10 text-teal", // cultural / trusted source
  unsplash: "bg-paper-sunk text-ink-soft",
  pexels: "bg-paper-sunk text-ink-soft",
  user_upload: "bg-gold/15 text-gold",
};

/** Small pill showing where an image came from. */
export default function ImageSourceBadge({ source }: { source: ImageSource }) {
  return (
    <span
      className={`eyebrow inline-flex items-center rounded-full px-2.5 py-1 ${STYLE[source]}`}
    >
      {LABEL[source]}
    </span>
  );
}
