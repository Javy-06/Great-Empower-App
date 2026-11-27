import { useEffect, useState } from "react";
import { Accessibility, ArrowRight, Check, ChevronDown, CircleHelp, HeartPulse, ShieldPlus, TriangleAlert, Users, X } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import {
  areaLabels,
  profileCompleteness,
  useProfile,
  type ProtectionArea,
  type ProtectionProfile,
} from "@/state/profile";
import { Band, Chapter, Container } from "@/components/layout/Editorial";
import { cn } from "@/lib/cn";
import { ProfileSpot } from "@/components/illustrations/Spots";
import { ExploreCover, GetCoverSection, ProtectJourney } from "./protect/ProtectSections";
import { ProtectCheck } from "./protect/ProtectCheck";
import { GetCover, GET_COVER } from "./protect/GetCover";
import { ApplyFlow, readApply } from "./protect/ApplyFlow";
import { ProductExplorer } from "./protection/ProductExplorer";

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

/** The original illustrative sample analysis — unchanged figures, shown on request. */
function SampleAnalysis() {
  const [showAbout, setShowAbout] = useState(false);
  const pct = Math.round((incomeProtection.current / incomeProtection.reference) * 100);
  const gap = incomeProtection.reference - incomeProtection.current;

  return (
    <>

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
              <p className="ge-reveal mt-2 max-w-2xl text-body-sm text-ink-secondary" role="status">
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

/* ========================================================================================== */
/* Personal protection dashboard                                                               */
/* ========================================================================================== */

type AreaStatus = "covered" | "review" | "gap" | "not-assessed";

/** Each status has a colour AND a shape, so it never depends on colour alone. */
const statusStyle: Record<AreaStatus, { label: string; cls: string; bar: string; icon: typeof Check }> = {
  covered: { label: "Covered", cls: "bg-success-50 text-success-700", bar: "bg-success-600 text-white", icon: Check },
  review: { label: "Review", cls: "bg-gold-50 text-gold-700", bar: "bg-gold-500 text-navy-950", icon: TriangleAlert },
  gap: { label: "Gap", cls: "bg-crimson-50 text-crimson-700", bar: "bg-crimson-600 text-white", icon: X },
  "not-assessed": { label: "Not assessed", cls: "bg-sunken text-ink-muted", bar: "bg-sunken text-ink-muted", icon: CircleHelp },
};

const areaMeta: Record<ProtectionArea, { icon: typeof HeartPulse; tone: string; what: string }> = {
  medical: { icon: HeartPulse, tone: "bg-crimson-50 text-crimson-600", what: "Hospitalisation, surgery & medical costs" },
  critical: { icon: ShieldPlus, tone: "bg-navy-50 text-navy-700", what: "Financial support for major illnesses" },
  life: { icon: Users, tone: "bg-gold-50 text-gold-700", what: "Income support for people who depend on you" },
  accident: { icon: Accessibility, tone: "bg-teal-50 text-teal-700", what: "Protection for injuries and disability" },
};

/**
 * Transparent, rule-based status per area — no score. Inputs are only the user's own answers:
 *  - said "yes" to having cover            -> Covered (self-reported, not verified)
 *  - said "no" and marked it a priority   -> Gap
 *  - said "no" (not a priority) or unsure -> Review
 *  - no answer                            -> Not assessed
 */
function assess(
  area: ProtectionArea,
  p: ProtectionProfile,
): { status: AreaStatus; why: string; next: { label: string; href: string } } {
  const answer = p.coverage[area];
  const priority = p.priorities.includes(area);
  if (answer === "yes")
    return {
      status: "covered",
      why: "Your answer, not verified. Check its limits and exclusions.",
      next: { label: "Deductibles & limits explained", href: "app/guide/article/cost-sharing-explained" },
    };
  if (answer === "no" && priority)
    return {
      status: "gap",
      why: "A priority for you, with no cover yet.",
      next: { label: "Explore cover options", href: `${GET_COVER}/${area}` },
    };
  if (answer === "no")
    return {
      status: "review",
      why: "No cover, not a priority. Revisit as your life changes.",
      next: { label: "How much cover do I need?", href: "app/guide/article/how-much-cover" },
    };
  if (answer === "not-sure")
    return {
      status: "review",
      why: "Not sure? Check your policies and work benefits.",
      next: { label: "Learn the basics", href: "app/learn" },
    };
  return {
    status: "not-assessed",
    why: "Answer this in your check to see a finding.",
    next: { label: "Answer in your check", href: "app/protect/check" },
  };
}

const goHash = (hash: string) => {
  window.location.hash = hash;
  window.scrollTo({ top: 0 });
};

/** Protect's own sub-routes: `#app/protect/check`, `/products`, `/get-cover/…`, `/apply/…` (the tab stays Protect). */
function readProtectRoute() {
  const parts = window.location.hash.replace(/^#/, "").split(/[?]/)[0].split("/");
  return parts[0] === "app" && (parts[1] === "protect" || parts[1] === "analyze") ? parts.slice(2) : [];
}

export function AnalyzeView() {
  const [route, setRoute] = useState(readProtectRoute);
  useEffect(() => {
    const onHash = () => setRoute(readProtectRoute());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  if (route[0] === "check") return <ProtectCheck />;
  if (route[0] === "products") return <ProductExplorer context="protect" />;
  if (route[0] === "get-cover") return <GetCover segments={route.slice(1)} />;
  if (route[0] === "apply") {
    const { area, step } = readApply(route.slice(1));
    // Keyed by area so each kind of cover has its own form state.
    if (area) return <ApplyFlow key={area} area={area} step={step} />;
    return <GetCover segments={[]} />;
  }
  return <ProtectOverview />;
}

function ProtectOverview() {
  const p = useProfile();
  const completeness = profileCompleteness(p);
  const results = (Object.keys(areaMeta) as ProtectionArea[]).map((area) => ({ area, ...assess(area, p) }));
  const gaps = results.filter((r) => r.status === "gap");
  const assessed = results.filter((r) => r.status !== "not-assessed");
  const notAssessed = results.filter((r) => r.status === "not-assessed");
  const hasData = completeness.done > 0;

  return (
    <>
      <PageHero
        eyebrow="Protect"
        title="Your protection, in one place."
        text="Check what you have, see the gaps, then explore and compare real cover."
        image="/images/pexels/protection-income-planning.webp"
        imagePosition="60% 25%"
        backLabel="Protect"
        onBack={() => goHash("app/home")}
        titleId="analyze-title"
      />

      {/* Get cover is the first section on Protect. */}
      <Container className="relative -mt-5">
        <GetCoverSection />
      </Container>

      <Container className="mt-4">
        <section className="rounded-2xl bg-surface p-4 shadow-e1 ring-1 ring-ink/[0.06] sm:p-5" aria-labelledby="completeness-title">
          <div className="flex items-center gap-4">
            <div
              className="relative size-20 shrink-0 rounded-full"
              style={{ background: `conic-gradient(var(--color-teal-600) ${completeness.percent * 3.6}deg, var(--color-sunken) 0deg)` }}
              role="img"
              aria-label={`Check ${completeness.percent}% complete`}
            >
              <span className="absolute inset-2 flex items-center justify-center rounded-full bg-surface text-heading font-bold tabular-nums text-navy-950">
                {completeness.percent}%
              </span>
            </div>
            <div className="min-w-0">
              <h2 id="completeness-title" className="text-subheading text-navy-950">Your check</h2>
              <p className="text-body-sm text-ink-secondary">
                {completeness.done} of {completeness.total} answers. Findings use only what you entered and aren't verified.
              </p>
            </div>
          </div>
          {completeness.done < completeness.total && (
            <button type="button" onClick={() => goHash("app/protect/check")} className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-navy-900 text-body-sm font-semibold text-white">
              {hasData ? "Finish your check" : "Start your check"} <ArrowRight size={16} aria-hidden />
            </button>
          )}
        </section>
      </Container>

      <ProtectJourney />

      <Container className="mt-7" id="protect-gaps">
        <h2 className="text-heading text-navy-950">Your gaps</h2>
        {assessed.length > 0 && <GapSummary results={results} />}
        {assessed.length > 0 && (
          <ul className="mt-3 grid gap-2.5">
            {assessed.map(({ area, status, why, next }) => {
              const meta = areaMeta[area];
              const Icon = meta.icon;
              return (
                <li key={area} className="rounded-2xl bg-surface p-4 ring-1 ring-ink/[0.07]">
                  <div className="flex items-center gap-3">
                    <span className={cn("inline-flex size-11 shrink-0 items-center justify-center rounded-xl", meta.tone)}>
                      <Icon size={20} aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-body font-semibold text-navy-950">{areaLabels[area]}</span>
                      <span className="block text-caption text-ink-muted">{meta.what}</span>
                    </span>
                    <span className={cn("inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-caption font-bold", statusStyle[status].cls)}>
                      {(() => { const I = statusStyle[status].icon; return <I size={13} strokeWidth={2.5} aria-hidden />; })()}
                      {statusStyle[status].label}
                    </span>
                  </div>
                  <p className="mt-2.5 text-body-sm text-ink-secondary">{why}</p>
                  <button type="button" onClick={() => goHash(next.href)} className="mt-1 inline-flex min-h-11 items-center gap-1 text-body-sm font-semibold text-crimson-600">
                    {next.label} <ArrowRight size={15} aria-hidden />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {notAssessed.length > 0 && (
          <div className="mt-3 rounded-2xl bg-surface p-4 ring-1 ring-ink/[0.07]">
            <div className="flex items-center gap-3">
              {!assessed.length && <ProfileSpot className="w-24 shrink-0" />}
              <p className="text-body-sm font-semibold text-navy-950">
                {assessed.length ? "Not assessed yet" : "Answer your check to see a finding for each area"}
              </p>
            </div>
            <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {notAssessed.map(({ area }) => {
                const meta = areaMeta[area];
                const Icon = meta.icon;
                return (
                  <li key={area} className="flex items-center gap-2.5 rounded-xl bg-sunken/70 p-2.5">
                    <span className={cn("inline-flex size-9 shrink-0 items-center justify-center rounded-lg", meta.tone)}>
                      <Icon size={17} aria-hidden />
                    </span>
                    <span className="min-w-0 text-caption font-semibold leading-tight text-navy-950">{areaLabels[area]}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </Container>

      {hasData && (
        <Container className="mt-7">
          <h2 className="text-heading text-navy-950">What to do next</h2>
          <div className="mt-3 rounded-2xl bg-navy-950 p-5 text-white">
            <p className="font-brand text-[1.5rem] font-semibold leading-tight">
              {gaps.length
                ? `${gaps.length} priority ${gaps.length === 1 ? "area has" : "areas have"} no cover yet.`
                : "No priority gaps from your answers."}
            </p>
            <p className="mt-1 text-body-sm text-white/75">
              {gaps.length
                ? `Start with ${areaLabels[gaps[0].area].toLowerCase()}: understand it, get ready, then choose to apply online or with an adviser. There's no rush.`
                : "Keep reviewing as your income, commitments and life stage change. You can still explore cover and how to apply."}
            </p>
            <button type="button" onClick={() => goHash(gaps.length ? `${GET_COVER}/${gaps[0].area}` : GET_COVER)} className="mt-4 inline-flex h-12 items-center gap-2 rounded-full bg-crimson-600 px-5 text-body-sm font-bold text-white">
              {gaps.length ? `Explore ${areaLabels[gaps[0].area].toLowerCase()} cover` : "Explore cover options"} <ArrowRight size={16} aria-hidden />
            </button>
          </div>
        </Container>
      )}

      <ExploreCover />

      <Container className="mt-7">
        <details className="group rounded-2xl bg-surface ring-1 ring-ink/[0.07]">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between px-4 text-body-sm font-semibold text-navy-900">
            See a sample analysis (illustrative profile)
            <ChevronDown size={18} className="transition-transform group-open:rotate-180" aria-hidden />
          </summary>
          <SampleAnalysis />
        </details>
        <p className="mt-3 text-caption text-ink-muted">
          Educational assessment only. It does not verify any policy and is not financial advice.
        </p>
      </Container>
    </>
  );
}

/** At a glance: one segment per area (colour + icon + name), then a count per status. */
function GapSummary({ results }: { results: Array<{ area: ProtectionArea; status: AreaStatus }> }) {
  const order: AreaStatus[] = ["covered", "review", "gap", "not-assessed"];
  const counts = order.map((st) => ({ st, n: results.filter((r) => r.status === st).length })).filter((c) => c.n);
  return (
    <figure className="mt-3 rounded-2xl bg-surface p-4 ring-1 ring-ink/[0.07]">
      <ul className="grid grid-cols-4 gap-1.5" aria-label="Your four areas at a glance">
        {results.map(({ area, status }) => {
          const st = statusStyle[status];
          const Icon = st.icon;
          return (
            <li key={area} className={cn("flex min-h-[4.25rem] flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-center", st.bar)}>
              <Icon size={18} strokeWidth={2.5} aria-hidden />
              <span className="text-[12px] font-semibold leading-tight">{areaLabels[area]}</span>
              <span className="sr-only">: {st.label}</span>
            </li>
          );
        })}
      </ul>
      <figcaption className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-caption text-ink-secondary">
        {counts.map(({ st, n }) => {
          const Icon = statusStyle[st].icon;
          return (
            <span key={st} className="inline-flex items-center gap-1.5">
              <span className={cn("inline-flex size-5 items-center justify-center rounded-full", statusStyle[st].bar)}><Icon size={12} strokeWidth={2.5} aria-hidden /></span>
              {n} {statusStyle[st].label.toLowerCase()}
            </span>
          );
        })}
      </figcaption>
    </figure>
  );
}
