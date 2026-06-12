import Link from "next/link";

/**
 * Serif section heading with a gold gradient rule and an optional "see all"
 * link. `center` renders the rule on both sides (used by "Cách hoạt động").
 */
export default function SectionTitle({
  children,
  allHref,
  allLabel,
  center = false,
}: {
  children: React.ReactNode;
  allHref?: string;
  allLabel?: string;
  center?: boolean;
}) {
  const rule = (
    <span
      aria-hidden
      className="h-px flex-1 bg-gradient-to-r from-gold/45 to-transparent"
    />
  );
  return (
    <div className="mb-6 flex items-center gap-4">
      {center && <span aria-hidden className="h-px flex-1 bg-gradient-to-l from-gold/45 to-transparent" />}
      <h2 className="font-serif text-2xl font-medium text-ink sm:text-[1.7rem]">
        {children}
      </h2>
      {rule}
      {allHref && (
        <Link href={allHref} className="shrink-0 text-sm text-accent transition-colors hover:text-accent-deep">
          {allLabel} →
        </Link>
      )}
    </div>
  );
}
