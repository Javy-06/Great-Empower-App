import { ArrowUpRight, ChevronDown, Clock3, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { IconTile } from "@/components/ui/IconTile";
import { cn } from "@/lib/cn";

export function ArticleRow({
  icon,
  category,
  title,
  minutes,
  href = "#cards",
  imageSrc,
}: {
  icon: LucideIcon;
  category: string;
  title: string;
  minutes: number;
  href?: string;
  imageSrc?: string;
}) {
  const [imageUnavailable, setImageUnavailable] = useState(false);
  return (
    <a
      href={href}
      className="group flex min-h-18 items-center gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-sunken sm:gap-4"
    >
      {imageSrc && !imageUnavailable ? (
        // Decorative crop: the adjacent title already names the topic.
        <img
          src={imageSrc}
          alt=""
          width={1200}
          height={800}
          loading="lazy"
          decoding="async"
          onError={() => setImageUnavailable(true)}
          className="h-12 w-16 shrink-0 rounded-xl bg-sunken object-cover sm:h-14 sm:w-20"
        />
      ) : (
        <IconTile icon={icon} tone="neutral" size="lg" />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-caption text-ink-muted">
          {category} · <Clock3 size={12} className="inline align-[-1px]" aria-hidden /> {minutes}{" "}
          min read
        </p>
        <p className="mt-0.5 text-body font-semibold text-ink group-hover:text-navy-700">{title}</p>
      </div>
      <ArrowUpRight
        size={20}
        className="shrink-0 text-ink-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        aria-hidden
      />
    </a>
  );
}

export function TopicCard({
  icon,
  title,
  count,
}: {
  icon: LucideIcon;
  title: string;
  count: number;
}) {
  return (
    <Card padding="md" interactive className="flex flex-col gap-3">
      <IconTile icon={icon} tone="navy" />
      <div>
        <h3 className="text-body font-semibold text-ink">{title}</h3>
        <p className="text-caption text-ink-muted">{count} articles</p>
      </div>
    </Card>
  );
}

export function FaqItem({ q, a, defaultOpen }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="border-b border-line last:border-b-0">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-14 w-full items-center justify-between gap-4 py-3 text-left"
      >
        <span className="text-body font-semibold text-ink">{q}</span>
        <ChevronDown
          size={20}
          className={cn(
            "shrink-0 text-ink-muted transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>
      {open && <p className="ge-reveal pb-4 pr-8 text-body-sm text-ink-secondary">{a}</p>}
    </div>
  );
}
