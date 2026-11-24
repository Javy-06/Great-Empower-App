import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Band, Chapter, Container } from "@/components/layout/Editorial";
import { cn } from "@/lib/cn";

const rm = (value: number) => `RM ${value.toLocaleString("en-MY")}`;

// Illustrative sample figures — unchanged from the original Analyze screen. No new calculations:
// the only derived values are the gap (reference − current) and its share, as before.
const incomeProtection = { current: 36000, reference: 90000 };
const spending = [
  { label: "Needs", value: 52, cls: "bg-navy-900", text: "text-white" },
  { label: "Wants", value: 26, cls: "bg-navy-300", text: "text-navy-950" },
  { label: "Savings", value: 14, cls: "bg-teal-600", text: "text-white" },
  { label: "Protection", value: 8, cls: "bg-crimson-600", text: "text-white" },
];
const SAVINGS_GUIDELINE = 20; // the common 50/30/20 guideline, as stated on the original screen

export function AnalyzeView() {
  const [showAbout, setShowAbout] = useState(false);
  const pct = Math.round((incomeProtection.current / incomeProtection.reference) * 100);
  const gap = incomeProtection.reference - incomeProtection.current;

  return (
    <>
      <Band tone="night" labelledBy="analyze-title" className="!pb-12 sm:!pb-14">
        <Container className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Chapter
            as="h1"
            label="Analyze"
            id="analyze-title"
            onDark
            title="Where you stand, in two numbers."
          />
          <p className="shrink-0 border-l-2 border-teal-300 pl-4 text-body-sm text-white/75">
            Sample young-adult profile
            <br />
            Not your account
          </p>
        </Container>
      </Band>

      {/* Story 1 — the protection gap */}
      <Band tone="paper" labelledBy="gap-heading">
        <Container>
          <p className="text-overline uppercase text-teal-700">01 · Income protection</p>
          <h2 id="gap-heading" className="sr-only">
            Income protection gap
          </h2>
          <div className="mt-6 grid gap-10 lg:grid-cols-[7fr_5fr] lg:items-end">
            <div>
              <p className="text-caption font-semibold uppercase tracking-[0.12em] text-ink-muted">
                Estimated gap
              </p>
              <p className="mt-2 font-brand text-figure tabular-nums text-crimson-600">
                <span className="align-top text-chapter">RM</span>
                {(gap / 1000).toLocaleString("en-MY")}k
              </p>
            </div>
            <p className="max-w-md text-lede text-ink">
              If income stopped, existing support would cover only{" "}
              <strong className="font-semibold">{pct}%</strong> of a common reference amount.
            </p>
          </div>

          <figure
            className="mt-12"
            aria-label={`Current ${rm(incomeProtection.current)} of reference ${rm(incomeProtection.reference)}`}
          >
            <div className="flex h-14 w-full overflow-hidden">
              <div
                className="flex h-full items-center bg-navy-900 px-4 text-body-sm font-semibold text-white"
                style={{ width: `${pct}%` }}
              >
                {pct}%
              </div>
              <div className="flex h-full flex-1 items-center justify-end bg-[repeating-linear-gradient(135deg,var(--color-crimson-100)_0_8px,var(--color-crimson-50)_8px_16px)] px-4 text-body-sm font-semibold text-crimson-700">
                Gap {100 - pct}%
              </div>
            </div>
            <figcaption className="mt-3 flex flex-wrap justify-between gap-2 text-body-sm tabular-nums text-ink-secondary">
              <span>Current support {rm(incomeProtection.current)}</span>
              <span>Reference {rm(incomeProtection.reference)}</span>
            </figcaption>
          </figure>

          <dl className="mt-12 grid gap-8 border-t border-ink/15 pt-8 sm:grid-cols-2">
            <div>
              <dt className="text-caption font-semibold uppercase tracking-[0.12em] text-ink-muted">
                In the sample
              </dt>
              <dd className="mt-2 text-body text-ink-secondary">
                {rm(incomeProtection.current)} of support already in place against a{" "}
                {rm(incomeProtection.reference)} reference.
              </dd>
            </div>
            <div>
              <dt className="text-caption font-semibold uppercase tracking-[0.12em] text-ink-muted">
                Assumptions
              </dt>
              <dd className="mt-2 text-body text-ink-secondary">
                The reference is a planning rule of thumb, not a recommendation. Medical cover pays
                bills, not salary, so it is not counted.
              </dd>
            </div>
          </dl>
        </Container>
      </Band>

      {/* Story 2 — where the money goes */}
      <Band tone="canvas" labelledBy="mix-heading">
        <Container>
          <p className="text-overline uppercase text-teal-700">02 · Monthly spending</p>
          <h2 id="mix-heading" className="mt-4 max-w-2xl font-brand text-chapter text-navy-950">
            Savings sit six points below the 50/30/20 guideline.
          </h2>
          <figure
            className="mt-12"
            aria-label="Sample spending mix: needs 52%, wants 26%, savings 14%, protection 8%"
          >
            <div className="relative">
              <div className="flex h-16 w-full overflow-hidden">
                {spending.map(({ label, value, cls, text }) => (
                  <div
                    key={label}
                    className={cn(
                      "flex h-full items-end px-2 pb-2 text-caption font-semibold sm:px-3",
                      cls,
                      text,
                    )}
                    style={{ width: `${value}%` }}
                  >
                    <span className="truncate">{value}%</span>
                  </div>
                ))}
              </div>
              {/* Guideline marker: savings would start at 78% (52 + 26) and run to 98% at 20%. */}
              <div
                className="pointer-events-none absolute -bottom-3 top-[-12px] left-[78%] w-[20%] border-x-2 border-dashed border-teal-700"
                aria-hidden
              />
            </div>
            <figcaption className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-body-sm sm:grid-cols-4">
              {spending.map(({ label, value, cls }) => (
                <span key={label} className="inline-flex items-center gap-2 text-ink-secondary">
                  <span className={cn("size-3", cls)} aria-hidden />
                  {label} <span className="font-semibold tabular-nums text-ink">{value}%</span>
                </span>
              ))}
            </figcaption>
          </figure>
          <p className="mt-8 max-w-xl text-body text-ink-secondary">
            Dashed frame: where savings would sit at the {SAVINGS_GUIDELINE}% guideline. A sample
            budget of RM 3,200 a month — guidelines are a starting point for reflection, not a
            target.
          </p>

          <div className="mt-12 border-t border-ink/15 pt-4">
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
          </div>
        </Container>
      </Band>
    </>
  );
}
