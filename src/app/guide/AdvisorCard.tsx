import { useState } from "react";
import { Check, ChevronDown, Languages } from "lucide-react";
import { cn } from "@/lib/cn";
import { ethnicityLabels, type Advisor } from "@/data/advisors";

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

/** Round face avatar. If the image fails to load it falls back to initials. */
export function AdvisorAvatar({ advisor, size = 48, ring, className }: { advisor: Advisor; size?: number; ring?: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  const style = { width: size, height: size };
  if (failed)
    return (
      <span style={style} className={cn("inline-flex shrink-0 items-center justify-center rounded-full bg-navy-100 font-bold text-navy-800", ring, className)} aria-hidden>
        {initialsOf(advisor.name)}
      </span>
    );
  return (
    <img
      src={advisor.face}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailed(true)}
      style={style}
      className={cn("ge-skeleton shrink-0 rounded-full object-cover", ring, className)}
    />
  );
}

/** Selectable advisor card with an expandable profile. */
export function AdvisorCard({ advisor, selected, onSelect }: { advisor: Advisor; selected: boolean; onSelect: () => void }) {
  const [open, setOpen] = useState(false);
  const [portraitFailed, setPortraitFailed] = useState(false);
  return (
    <div className={cn("rounded-2xl ring-1 transition-colors", selected ? "bg-navy-50 ring-navy-900" : "bg-surface ring-ink/10")} data-ethnicity={advisor.ethnicity} data-advisor={advisor.id}>
      <button type="button" role="radio" aria-checked={selected} onClick={onSelect} className="flex min-h-[4.5rem] w-full items-center gap-3 px-3 py-2.5 text-left">
        <AdvisorAvatar advisor={advisor} size={52} />
        <span className="min-w-0 flex-1">
          <span className="block text-body font-semibold text-navy-950">{advisor.name}</span>
          <span className="block text-caption text-ink-secondary">{advisor.specialization}</span>
          <span className="mt-0.5 flex items-center gap-1 text-[11px] text-ink-muted">
            <Languages size={12} aria-hidden /> {advisor.languages.join(" · ")}
          </span>
        </span>
        <span className={cn("inline-flex size-6 shrink-0 items-center justify-center rounded-full ring-2", selected ? "bg-navy-900 ring-navy-900 text-white" : "ring-ink/20")} aria-hidden>
          {selected && <Check size={14} />}
        </span>
      </button>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex min-h-11 w-full items-center gap-1 border-t border-ink/[0.07] px-3 text-caption font-semibold text-navy-800"
      >
        {open ? "Hide profile" : "View profile"}
        <ChevronDown size={14} className={cn("transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      {open && (
        <div className="grid grid-cols-[6.5rem_1fr] gap-3 px-3 pb-3">
          {portraitFailed ? (
            <span className="flex aspect-[4/5] items-center justify-center rounded-xl bg-navy-100 text-heading font-bold text-navy-800" aria-hidden>
              {initialsOf(advisor.name)}
            </span>
          ) : (
            <img
              src={advisor.portrait}
              alt={`Portrait of ${advisor.name}, a fictional advisor.`}
              onError={() => setPortraitFailed(true)}
              className="ge-skeleton aspect-[4/5] w-full rounded-xl object-cover object-[50%_25%]"
            />
          )}
          <dl className="grid content-start gap-1 text-caption">
            <div><dt className="inline text-ink-muted">Background: </dt><dd className="inline font-semibold text-navy-950">{ethnicityLabels[advisor.ethnicity]}</dd></div>
            <div><dt className="inline text-ink-muted">Age: </dt><dd className="inline font-semibold text-navy-950">{advisor.age} (fictional)</dd></div>
            <div><dt className="inline text-ink-muted">Speaks: </dt><dd className="inline font-semibold text-navy-950">{advisor.languages.join(", ")}</dd></div>
            <div><dt className="inline text-ink-muted">Focus: </dt><dd className="inline font-semibold text-navy-950">{advisor.specialization}</dd></div>
            <p className="mt-1 text-body-sm text-ink-secondary">{advisor.intro}</p>
          </dl>
        </div>
      )}
    </div>
  );
}
