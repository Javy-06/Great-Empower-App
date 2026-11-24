import type { ReactNode } from "react";
import { ArrowRight, ChevronRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

type Tone = "navy" | "teal" | "crimson" | "gold" | "neutral";

const eyebrowTone: Record<Tone, string> = {
  navy: "text-navy-700",
  teal: "text-teal-700",
  crimson: "text-crimson-700",
  gold: "text-gold-700",
  neutral: "text-ink-muted",
};

/** Page introduction: eyebrow, editorial serif title, one short lede, up to two actions. */
export function PageHeader({
  eyebrow,
  title,
  lede,
  actions,
  tone = "navy",
  aside,
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  actions?: ReactNode;
  tone?: Tone;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex flex-col gap-5 md:flex-row md:items-end md:justify-between md:gap-10",
        className,
      )}
    >
      <div className="min-w-0 max-w-2xl">
        <p className={cn("text-overline uppercase", eyebrowTone[tone])}>{eyebrow}</p>
        <h1 className="mt-2 font-brand text-serif-title text-navy-900 md:text-serif-hero">
          {title}
        </h1>
        {lede && <p className="mt-3 text-body text-ink-secondary md:text-body-lg">{lede}</p>}
        {actions && <div className="mt-5 flex flex-wrap gap-3">{actions}</div>}
      </div>
      {aside && <div className="min-w-0 md:shrink-0">{aside}</div>}
    </header>
  );
}

/** Section heading: a plain name, an optional one-line description and an optional text link. */
export function SectionHeader({
  title,
  description,
  action,
  id,
}: {
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  id?: string;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4 border-b border-line pb-3">
      <div className="min-w-0">
        <h2 id={id} className="text-heading text-ink">
          {title}
        </h2>
        {description && <p className="mt-1 text-body-sm text-ink-muted">{description}</p>}
      </div>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="group inline-flex min-h-11 shrink-0 items-center gap-1 rounded-lg px-1 text-body-sm font-semibold text-navy-800 hover:text-navy-900"
        >
          {action.label}
          <ArrowRight
            size={16}
            className="transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </button>
      )}
    </div>
  );
}

/** A full-width navigable row: icon, title, supporting line, optional trailing meta. */
export function ListRow({
  icon: Icon,
  title,
  description,
  meta,
  onClick,
  href,
  tone = "navy",
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  meta?: ReactNode;
  onClick?: () => void;
  href?: string;
  tone?: Tone;
}) {
  const iconTone: Record<Tone, string> = {
    navy: "bg-navy-50 text-navy-900",
    teal: "bg-teal-50 text-teal-700",
    crimson: "bg-crimson-50 text-crimson-700",
    gold: "bg-gold-50 text-gold-700",
    neutral: "bg-sunken text-ink-secondary",
  };
  const body = (
    <>
      {Icon && (
        <span
          className={cn(
            "inline-flex size-11 shrink-0 items-center justify-center rounded-xl",
            iconTone[tone],
          )}
          aria-hidden
        >
          <Icon size={20} strokeWidth={1.75} />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-body font-semibold text-ink">{title}</span>
        {description && (
          <span className="mt-0.5 block text-body-sm text-ink-muted">{description}</span>
        )}
        {meta && (
          <span className="mt-1 block text-caption font-semibold text-ink-secondary sm:hidden">
            {meta}
          </span>
        )}
      </span>
      {meta && (
        <span className="hidden shrink-0 text-body-sm text-ink-secondary sm:block">{meta}</span>
      )}
      {(onClick || href) && (
        <ChevronRight
          size={18}
          className="shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      )}
    </>
  );
  const cls =
    "group flex min-h-16 w-full items-center gap-4 py-3 text-left transition-colors hover:bg-sunken/60 sm:px-2 sm:-mx-2 sm:rounded-xl";
  if (href)
    return (
      <a href={href} className={cls}>
        {body}
      </a>
    );
  if (onClick)
    return (
      <button type="button" onClick={onClick} className={cls}>
        {body}
      </button>
    );
  return <div className={cls}>{body}</div>;
}

/** Compact inline statistics separated by hairlines — replaces stacks of metric cards. */
export function StatStrip({
  items,
  className,
  onDark,
}: {
  items: Array<{ label: string; value: ReactNode; hint?: string }>;
  className?: string;
  onDark?: boolean;
}) {
  return (
    <dl
      className={cn(
        "grid grid-cols-2 gap-y-4 sm:flex sm:flex-wrap sm:gap-0",
        onDark ? "text-white" : "text-ink",
        className,
      )}
    >
      {items.map(({ label, value, hint }, index) => (
        <div
          key={label}
          className={cn(
            "min-w-0 pr-4 sm:px-6 sm:first:pl-0",
            index > 0 && (onDark ? "sm:border-l sm:border-white/15" : "sm:border-l sm:border-line"),
          )}
        >
          <dt className={cn("text-caption", onDark ? "text-white/70" : "text-ink-muted")}>
            {label}
          </dt>
          <dd className="mt-0.5 text-numeric tabular-nums">{value}</dd>
          {hint && (
            <dd className={cn("text-caption", onDark ? "text-white/60" : "text-ink-muted")}>
              {hint}
            </dd>
          )}
        </div>
      ))}
    </dl>
  );
}
