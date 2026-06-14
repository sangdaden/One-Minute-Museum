import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * Serif section heading with a gold gradient rule and an optional "see all"
 * link. `center` renders the rule on both sides (used by "Cách hoạt động").
 */
export default function SectionTitle({
  children,
  allHref,
  allLabel,
  center = false,
  as = "h2",
}: {
  children: React.ReactNode;
  allHref?: string;
  allLabel?: string;
  center?: boolean;
  as?: "h1" | "h2";
}) {
  const Heading = as;
  const rule = (
    <span
      aria-hidden
      className="h-px flex-1 bg-gradient-to-r from-gold/45 to-transparent"
    />
  );
  return (
    <div className="mb-6 flex items-center gap-4">
      {center && <span aria-hidden className="h-px flex-1 bg-gradient-to-l from-gold/45 to-transparent" />}
      <Heading className="font-serif text-2xl font-medium text-ink sm:text-[1.7rem]">
        {children}
      </Heading>
      {rule}
      {allHref && (
        <Link href={allHref} className="inline-flex shrink-0 items-center gap-1 text-sm text-accent transition-colors hover:text-accent-deep">
          {allLabel}
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </Link>
      )}
    </div>
  );
}
