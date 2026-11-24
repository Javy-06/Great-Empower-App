import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * GREAT EMPOWER 2.0 editorial vocabulary. Pages are composed from full-bleed Bands with an
 * inner Container, introduced by a numbered Chapter heading. Boxes are the exception.
 */

export type BandTone = "night" | "paper" | "canvas" | "white" | "sand";

const bandTone: Record<BandTone, string> = {
  night: "bg-navy-950 text-white",
  paper: "bg-paper text-ink",
  canvas: "bg-canvas text-ink",
  white: "bg-surface text-ink",
  sand: "bg-sand-50 text-ink",
};

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-12", className)}>
      {children}
    </div>
  );
}

export function Band({
  tone = "canvas",
  children,
  className,
  id,
  labelledBy,
  label,
  flush,
}: {
  tone?: BandTone;
  children: ReactNode;
  className?: string;
  id?: string;
  labelledBy?: string;
  label?: string;
  /** Remove vertical padding (for full-bleed media bands). */
  flush?: boolean;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      aria-label={label}
      className={cn(bandTone[tone], !flush && "py-14 sm:py-20 lg:py-28", "scroll-mt-16", className)}
    >
      {children}
    </section>
  );
}

/** Numbered chapter heading: "01 — Label" over a large serif title and an optional one-line lede. */
export function Chapter({
  number,
  label,
  title,
  lede,
  id,
  onDark,
  className,
  as: Heading = "h2",
}: {
  number?: string;
  label: string;
  title: ReactNode;
  lede?: ReactNode;
  id?: string;
  onDark?: boolean;
  className?: string;
  as?: "h1" | "h2";
}) {
  return (
    <div className={cn("max-w-3xl", className)}>
      <p
        className={cn(
          "flex items-center gap-3 text-overline uppercase",
          onDark ? "text-teal-200" : "text-teal-700",
        )}
      >
        {number && <span className="tabular-nums">{number}</span>}
        {number && (
          <span className={cn("h-px w-8", onDark ? "bg-white/30" : "bg-ink/20")} aria-hidden />
        )}
        {label}
      </p>
      <Heading
        id={id}
        className={cn(
          "mt-4 font-brand",
          Heading === "h1" ? "text-mega" : "text-chapter",
          onDark ? "text-white" : "text-navy-950",
        )}
      >
        {title}
      </Heading>
      {lede && (
        <p
          className={cn("mt-5 max-w-xl text-lede", onDark ? "text-white/75" : "text-ink-secondary")}
        >
          {lede}
        </p>
      )}
    </div>
  );
}

/** Inline text action with an arrow — the default secondary action. */
export function TextLink({
  children,
  onClick,
  href,
  onDark,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  onDark?: boolean;
  className?: string;
}) {
  const cls = cn(
    "group inline-flex min-h-11 items-center gap-2 text-body font-semibold underline-offset-[6px] hover:underline",
    onDark ? "text-white" : "text-navy-900",
    className,
  );
  const inner = (
    <>
      {children}
      <ArrowRight
        size={18}
        className="transition-transform group-hover:translate-x-1"
        aria-hidden
      />
    </>
  );
  if (href)
    return (
      <a href={href} className={cls}>
        {inner}
      </a>
    );
  return (
    <button type="button" onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}

/** Thin horizontal rule used to separate editorial rows. */
export function Rule({ onDark, className }: { onDark?: boolean; className?: string }) {
  return (
    <hr
      className={cn("border-0 border-t", onDark ? "border-white/15" : "border-ink/10", className)}
    />
  );
}
