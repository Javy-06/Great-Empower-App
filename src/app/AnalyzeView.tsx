import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Donut } from "@/components/cards/AnalyzeCards";
import { PageHeader, SectionHeader } from "@/components/layout/Page";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

const rm = (value: number) => `RM ${value.toLocaleString("en-MY")}`;

// Illustrative sample figures (unchanged from the previous Analyze screen).
const incomeProtection = { current: 36000, reference: 90000 };
// SVG presentation attributes cannot resolve CSS variables, so the brand token hex values are used.
const spending = [
  { label: "Needs", value: 52, color: "#0f294a" }, // navy-900
  { label: "Wants", value: 26, color: "#9cb2d2" }, // navy-300
  { label: "Savings", value: 14, color: "#297e85" }, // teal-600
  { label: "Protection", value: 8, color: "#c8102e" }, // crimson-600
];

export function AnalyzeView() {
  const [showAbout, setShowAbout] = useState(false);
  const pct = Math.round((incomeProtection.current / incomeProtection.reference) * 100);
  const gap = incomeProtection.reference - incomeProtection.current;

  return (
    <div className="flex flex-col gap-12 md:gap-14">
      <PageHeader
        eyebrow="Analyze"
        title="See the gaps, not just the numbers."
        lede="Two simple views of a sample young-adult budget: how protected the income is, and where the money goes."
        aside={
          <Badge tone="neutral" size="md">
            Sample data · not your account
          </Badge>
        }
      />

      <section aria-labelledby="gap-title" className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
        <div>
          <SectionHeader id="gap-title" title="Income protection gap" />
          <p className="text-caption text-ink-muted">Estimated gap</p>
          <p className="mt-1 text-numeric-xl tabular-nums text-navy-900">{rm(gap)}</p>
          <div className="relative mt-5 h-3 rounded-full bg-sunken" aria-hidden>
            <div className="h-full rounded-full bg-navy-900" style={{ width: `${pct}%` }} />
            <div className="absolute -inset-y-1 right-0 w-0.5 rounded bg-crimson-600" />
          </div>
          <div className="mt-3 flex flex-wrap justify-between gap-2 text-body-sm tabular-nums text-ink-secondary">
            <span className="inline-flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-navy-900" aria-hidden />
              Current {rm(incomeProtection.current)} ({pct}%)
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-crimson-600" aria-hidden />
              Reference {rm(incomeProtection.reference)}
            </span>
          </div>
          <p className="mt-6 max-w-xl text-body text-ink-secondary">
            If income stopped, this sample person's existing support would cover about{" "}
            <strong className="font-semibold text-ink">{pct}%</strong> of a common reference
            amount. Real needs depend on income, dependants, commitments and savings.
          </p>
        </div>

        <aside
          aria-label="How to read the gap"
          className="self-start rounded-2xl bg-sand-50 p-5 text-body-sm text-ink-secondary"
        >
          <p className="font-semibold text-ink">Reading this</p>
          <ul className="mt-3 flex flex-col gap-2">
            <li>
              <span className="font-semibold text-ink">Current</span> — support already in place
              in the sample.
            </li>
            <li>
              <span className="font-semibold text-ink">Reference</span> — a planning rule of thumb,
              not a recommendation.
            </li>
            <li>
              <span className="font-semibold text-ink">Gap</span> — the difference. Medical cover
              does not replace income, so it is not counted here.
            </li>
          </ul>
        </aside>
      </section>

      <section aria-labelledby="mix-title">
        <SectionHeader id="mix-title" title="Monthly spending mix" description="Sample budget of RM 3,200 a month." />
        <div className="grid gap-8 md:grid-cols-[auto_1fr] md:items-center md:gap-12">
          <Donut size={184} centerLabel="RM 3.2k" centerCaption="per month" segments={spending} />
          <div className="max-w-xl">
            <p className="text-body text-ink">
              Savings take 14% — six points under the 20% in the common 50/30/20 guideline.
            </p>
            <p className="mt-2 text-body-sm text-ink-secondary">
              Guidelines are a starting point for reflection, not a target everyone should hit.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-line pt-4">
        <button
          type="button"
          aria-expanded={showAbout}
          onClick={() => setShowAbout((value) => !value)}
          className="inline-flex min-h-11 items-center gap-2 text-body-sm font-semibold text-navy-800"
        >
          About this data
          <ChevronDown
            size={18}
            className={cn("transition-transform", showAbout && "rotate-180")}
            aria-hidden
          />
        </button>
        {showAbout && (
          <p className="mt-2 max-w-2xl text-body-sm text-ink-secondary" role="status">
            Both views use illustrative sample figures. They are not based on a user account, a
            financial assessment or any insurer's product, and they are not a personal insurance
            assessment.
          </p>
        )}
      </section>
    </div>
  );
}
