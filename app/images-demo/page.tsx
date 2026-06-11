import SiteHeader from "@/components/SiteHeader";
import SelectedImageCard from "@/components/SelectedImageCard";
import { curateImages } from "@/lib/image-curation";

// Live provider fetches per request.
export const dynamic = "force-dynamic";

/**
 * Demo of the image curation pipeline (foundation): topic → Wikimedia search →
 * scoring → top 3 culturally-relevant images with credits. Works offline (mock).
 */
export default async function ImagesDemoPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>;
}) {
  const { topic: raw } = await searchParams;
  const topic = (raw ?? "Trống đồng Đông Sơn").trim() || "Trống đồng Đông Sơn";
  const results = await curateImages(topic, { limit: 3 });

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-5 pb-24 pt-9 sm:px-8 sm:pt-12">
        <header className="space-y-2">
          <h1 className="font-serif text-[2.4rem] font-medium leading-none tracking-[-0.02em] text-ink sm:text-[3rem]">
            Tìm ảnh văn hoá<span className="text-accent">.</span>
          </h1>
          <p className="text-base leading-relaxed text-ink-soft">
            Demo pipeline: Wikimedia Commons → chấm điểm → 3 ảnh phù hợp, kèm dẫn
            nguồn &amp; giấy phép.
          </p>
        </header>

        <form action="/images-demo" method="get" className="mt-6 flex gap-2">
          <input
            name="topic"
            defaultValue={topic}
            placeholder="Chủ đề (vd: Múa rối nước)…"
            className="flex-1 rounded-full border border-border bg-paper-card px-4 py-2.5 text-[15px] text-ink outline-none transition-colors placeholder:text-ink-faint/70 focus:border-accent"
          />
          <button
            type="submit"
            className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-paper-card shadow-[0_8px_20px_-8px_rgba(168,50,42,0.4)] transition-colors hover:bg-accent-deep"
          >
            Tìm
          </button>
        </form>

        {results.length === 0 ? (
          <div className="mt-10 flex flex-col items-center gap-3 border border-dashed border-border-strong bg-paper-card/40 px-6 py-16 text-center">
            <span aria-hidden className="font-serif text-4xl text-gold/50">
              ❦
            </span>
            <p className="text-sm leading-relaxed text-ink-soft">
              Chưa tìm thấy ảnh phù hợp cho “{topic}”. Thử chủ đề khác nhé.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((r) => (
              <SelectedImageCard
                key={r.candidate.id}
                candidate={r.candidate}
                score={r.score}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
