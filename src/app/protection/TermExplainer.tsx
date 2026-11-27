import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Ban, CalendarClock, Check, Gauge, Percent, Receipt, X } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Insurance terms in pictures. Each term = one plain sentence + one code-drawn diagram + one
 * illustrative example. All figures are made up for illustration and are internally consistent:
 * RM10,000 bill, RM500 deductible, 10% co-payment → you RM1,450, plan RM8,550.
 */
const BILL = 10_000;
const DEDUCTIBLE = 500;
const COPAY = 0.1;
const AFTER_DEDUCTIBLE = BILL - DEDUCTIBLE; // 9,500
const YOUR_COPAY = AFTER_DEDUCTIBLE * COPAY; // 950
const PLAN_PAYS = AFTER_DEDUCTIBLE - YOUR_COPAY; // 8,550
const rm = (n: number) => `RM${n.toLocaleString("en-MY")}`;

type TermId = "deductible" | "copay" | "limit" | "waiting" | "exclusion" | "preexisting";
const TERMS: { id: TermId; label: string; icon: typeof Receipt; line: string }[] = [
  { id: "deductible", label: "Deductible", icon: Receipt, line: "A fixed amount you pay first, before the plan pays." },
  { id: "copay", label: "Co-payment", icon: Percent, line: "After the deductible, you share a percentage of the rest." },
  { id: "limit", label: "Annual limit", icon: Gauge, line: "The most the plan pays in a policy year. Costs above it are yours." },
  { id: "waiting", label: "Waiting period", icon: CalendarClock, line: "A period after cover starts when some illnesses aren't covered yet." },
  { id: "exclusion", label: "Exclusion", icon: Ban, line: "Something the policy says it will never pay for." },
  { id: "preexisting", label: "Pre-existing condition", icon: CalendarClock, line: "A condition you had before buying. It may be excluded or limited." },
];

export function TermExplainer() {
  const [active, setActive] = useState<TermId>("deductible");
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const idx = TERMS.findIndex((t) => t.id === active);
  const onKey = (e: KeyboardEvent) => {
    const d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const next = (idx + d + TERMS.length) % TERMS.length;
    setActive(TERMS[next].id);
    tabs.current[next]?.focus();
  };
  const term = TERMS[idx];
  return (
    <section aria-labelledby="terms-title" className="mt-8">
      <p className="text-overline uppercase text-teal-700">Six terms, in pictures</p>
      <h2 id="terms-title" className="font-brand text-[1.875rem] font-semibold leading-tight text-navy-950">What you pay, and when</h2>
      <div role="tablist" aria-label="Insurance terms" onKeyDown={onKey} className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {TERMS.map((t, i) => {
          const sel = t.id === active;
          return (
            <button
              key={t.id}
              ref={(el) => { tabs.current[i] = el; }}
              type="button"
              role="tab"
              id={`term-tab-${t.id}`}
              aria-selected={sel}
              aria-controls="term-panel"
              tabIndex={sel ? 0 : -1}
              onClick={() => setActive(t.id)}
              className={cn(
                "flex min-h-12 items-center gap-2 rounded-xl px-3 text-left text-body-sm font-semibold transition-colors",
                sel ? "bg-navy-900 text-white shadow-e2" : "bg-surface text-navy-900 ring-1 ring-ink/[0.08] hover:bg-navy-50",
              )}
            >
              <t.icon size={17} className={sel ? "text-white" : "text-crimson-600"} aria-hidden />
              <span className="leading-tight">{t.label}</span>
            </button>
          );
        })}
      </div>
      <div id="term-panel" role="tabpanel" aria-labelledby={`term-tab-${term.id}`} className="mt-3 rounded-2xl bg-surface p-4 ring-1 ring-ink/[0.08] sm:p-5">
        <p className="text-body font-semibold text-navy-950">{term.line}</p>
        <div className="mt-4">{diagrams[term.id]}</div>
        <p className="mt-4 text-caption text-ink-muted">Illustrative figures, not a real plan. Your policy wording sets the actual amounts and rules.</p>
      </div>
    </section>
  );
}

/** A horizontal split bar with a legend. Widths are proportional to the amounts. */
function Split({ parts, total, label }: { parts: { amount: number; label: string; tone: "you" | "plan" | "muted" }[]; total: number; label: string }) {
  const tone = { you: "bg-crimson-600", plan: "bg-navy-900", muted: "bg-navy-200" };
  const dot = { you: "bg-crimson-600", plan: "bg-navy-900", muted: "bg-navy-200" };
  return (
    <figure>
      <figcaption className="flex items-baseline justify-between text-caption text-ink-muted">
        <span>{label}</span>
        <span className="font-semibold text-navy-950">{rm(total)}</span>
      </figcaption>
      <div className="mt-2 flex h-4 overflow-hidden rounded-full" aria-hidden>
        {parts.map((p) => (
          <span key={p.label} className={cn("h-full first:rounded-l-full last:rounded-r-full", tone[p.tone])} style={{ width: `${(p.amount / total) * 100}%`, minWidth: 6 }} />
        ))}
      </div>
      <ul className="mt-3 grid gap-1.5">
        {parts.map((p) => (
          <li key={p.label} className="flex items-center justify-between gap-3 text-body-sm">
            <span className="flex items-center gap-2 text-navy-950"><span className={cn("size-2.5 rounded-full", dot[p.tone])} aria-hidden /> {p.label}</span>
            <span className={cn("font-semibold tabular-nums", p.tone === "you" ? "text-crimson-700" : "text-navy-950")}>{rm(p.amount)}</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

function Timeline({ marks, band }: { marks: { at: number; label: string; ok: boolean }[]; band: { from: number; to: number; label: string } }) {
  return (
    <figure>
      <div className="relative mx-2 mt-8 h-2 rounded-full bg-teal-100" aria-hidden>
        <span className="absolute inset-y-0 rounded-full bg-[repeating-linear-gradient(135deg,var(--color-crimson-200)_0_6px,var(--color-crimson-100)_6px_12px)]" style={{ left: `${band.from}%`, width: `${band.to - band.from}%` }} />
        <span className="absolute -top-7 text-caption font-semibold text-crimson-700" style={{ left: `${band.from}%` }}>{band.label}</span>
        {marks.map((m) => (
          <span key={m.label} className={cn("absolute top-1/2 inline-flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full ring-2 ring-white", m.ok ? "bg-teal-600 text-white" : "bg-crimson-600 text-white")} style={{ left: `${m.at}%` }}>
            {m.ok ? <Check size={13} strokeWidth={3} /> : <X size={13} strokeWidth={3} />}
          </span>
        ))}
      </div>
      <ul className="mt-6 grid gap-1.5">
        {marks.map((m) => (
          <li key={m.label} className="flex items-start gap-2 text-body-sm text-navy-950">
            {m.ok ? <Check size={16} className="mt-0.5 shrink-0 text-teal-700" aria-hidden /> : <X size={16} className="mt-0.5 shrink-0 text-crimson-600" aria-hidden />}
            <span><span className="sr-only">{m.ok ? "May be covered: " : "Not covered: "}</span>{m.label}</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

const diagrams: Record<TermId, ReactNode> = {
  deductible: (
    <Split
      label="Hospital bill"
      total={BILL}
      parts={[
        { amount: DEDUCTIBLE, label: "Deductible — you pay this first", tone: "you" },
        { amount: AFTER_DEDUCTIBLE, label: "Left for the plan's rules", tone: "muted" },
      ]}
    />
  ),
  copay: (
    <Split
      label="After the deductible"
      total={AFTER_DEDUCTIBLE}
      parts={[
        { amount: YOUR_COPAY, label: "Your 10% co-payment", tone: "you" },
        { amount: PLAN_PAYS, label: "Plan pays", tone: "plan" },
      ]}
    />
  ),
  limit: (
    <figure>
      <figcaption className="text-caption text-ink-muted">Annual limit {rm(100_000)} — this year&apos;s claims</figcaption>
      <div className="relative mt-7" aria-hidden>
        <div className="flex h-4 overflow-hidden rounded-full">
          <span className="h-full bg-navy-300" style={{ width: `${(60 / 115) * 100}%` }} />
          <span className="h-full bg-navy-900" style={{ width: `${(40 / 115) * 100}%` }} />
          <span className="h-full bg-crimson-600" style={{ width: `${(15 / 115) * 100}%` }} />
        </div>
        <span className="absolute -top-6 -translate-x-1/2 text-caption font-semibold text-navy-950" style={{ left: `${(100 / 115) * 100}%` }}>Limit</span>
        <span className="absolute -top-1.5 h-7 w-0.5 -translate-x-1/2 bg-navy-950" style={{ left: `${(100 / 115) * 100}%` }} />
      </div>
      <ul className="mt-3 grid gap-1.5 text-body-sm">
        <li className="flex justify-between gap-3"><span className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-navy-300" aria-hidden />Already claimed earlier this year</span><b className="tabular-nums">{rm(60_000)}</b></li>
        <li className="flex justify-between gap-3"><span className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-navy-900" aria-hidden />New bill — plan pays up to the limit</span><b className="tabular-nums">{rm(40_000)}</b></li>
        <li className="flex justify-between gap-3 text-crimson-700"><span className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-crimson-600" aria-hidden />New bill above the limit — you pay</span><b className="tabular-nums">{rm(15_000)}</b></li>
      </ul>
      <p className="mt-2 text-caption text-ink-secondary">A {rm(55_000)} bill when {rm(40_000)} of the limit is left. Many plans also have sub-limits, e.g. for room and board.</p>
    </figure>
  ),
  waiting: (
    <Timeline
      band={{ from: 0, to: 45, label: "Waiting period" }}
      marks={[
        { at: 22, label: "Illness diagnosed during the waiting period — not covered.", ok: false },
        { at: 75, label: "Illness after the waiting period ends — may be covered.", ok: true },
      ]}
    />
  ),
  exclusion: (
    <div className="grid gap-2 sm:grid-cols-2">
      <div className="rounded-xl bg-sunken p-3">
        <p className="text-caption font-semibold text-ink-muted">Policy wording, page 12</p>
        <p className="mt-1 text-body-sm font-semibold text-navy-950">&ldquo;We will not pay for…&rdquo;</p>
        <ul className="mt-2 grid gap-1 text-body-sm text-navy-950">
          {["Cosmetic treatment", "Self-inflicted injury", "Conditions named as excluded"].map((x) => (
            <li key={x} className="flex items-center gap-2"><X size={15} className="text-crimson-600" aria-hidden />{x}</li>
          ))}
        </ul>
      </div>
      <p className="self-center text-body-sm text-ink-secondary">Exclusions apply even within the limits. Common examples are shown; each policy lists its own — read that section before you buy.</p>
    </div>
  ),
  preexisting: (
    <Timeline
      band={{ from: 0, to: 40, label: "Before you bought cover" }}
      marks={[
        { at: 18, label: "A condition you already had — a claim for it may be excluded or limited, especially if you didn't disclose it.", ok: false },
        { at: 72, label: "A new, unrelated illness after cover starts (and any waiting period) — may be covered.", ok: true },
      ]}
    />
  ),
};
