import { useEffect, useState, type ReactNode } from "react";
import {
  Accessibility,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  HeartPulse,
  Info,
  Ribbon,
  ShieldPlus,
  Users,
  Wallet,
} from "lucide-react";
import { EmergencyFundCalculator } from "@/components/cards/SimulateCards";
import { Container } from "@/components/layout/Editorial";
import { PageHero } from "@/components/layout/PageHero";
import { cn } from "@/lib/cn";
import {
  areaLabels,
  profileCompleteness,
  profileStore,
  useProfile,
  type CoverageAnswer,
  type ProtectionArea,
  type ProtectionProfile,
} from "@/state/profile";
import { rewardsActions } from "@/rewards/store";
import { MedicalClaimSimulator } from "./MedicalClaimSimulator";
import { GeIcon, type GeIconName } from "@/components/illustrations/GeIcons";
import { CiRunwayScenario, FamilyProtectionScenario } from "./protection/ProtectionScenarios";

const TOOL_IDS = ["tool-bill", "tool-fund", "tool-family", "tool-ci"] as const;

/** `#app/simulate/needs` opens the Needs step; `#app/simulate/needs/<tool-id>` also scrolls to that tool. */
function readSimulateRoute(): { step: number; tool?: string } {
  const parts = window.location.hash.replace(/^#/, "").split("/");
  if (parts[0] === "app" && parts[1] === "simulate" && parts[2] === "needs") {
    const tool = TOOL_IDS.find((t) => t === parts[3]);
    return { step: 1, tool };
  }
  return { step: 0 };
}

const go = (hash: string) => {
  window.location.hash = hash;
  window.scrollTo({ top: 0 });
};

const areas: Array<{ key: ProtectionArea; icon: typeof HeartPulse; hint: string; tone: string }> = [
  { key: "medical", icon: HeartPulse, hint: "Help with hospital and treatment costs.", tone: "bg-crimson-500/20 text-crimson-200" },
  { key: "critical", icon: ShieldPlus, hint: "A lump sum if you're diagnosed with a major illness.", tone: "bg-navy-400/25 text-navy-100" },
  { key: "life", icon: Users, hint: "Support for people who depend on your income.", tone: "bg-gold-500/20 text-gold-100" },
  { key: "accident", icon: Accessibility, hint: "Protection for injuries and accidental disability.", tone: "bg-teal-400/20 text-teal-100" },
];

const steps = ["Profile", "Needs", "Plan"] as const;

/** Simulate: a three-step personal protection planner around the existing calculators. */
export function SimulateHub() {
  const [initial] = useState(readSimulateRoute);
  const [step, setStep] = useState(initial.step);
  const [tool, setTool] = useState<ToolId>((initial.tool as ToolId | undefined) ?? "tool-bill");
  const focusTools = () => window.setTimeout(() => document.getElementById("needs-tools")?.scrollIntoView({ block: "start" }), 60);
  useEffect(() => {
    // A deep link while Simulate is already open (e.g. back/forward): open Needs and go to the tool.
    const onHash = () => {
      const r = readSimulateRoute();
      if (r.step !== 1) return;
      setStep(1);
      if (r.tool) {
        setTool(r.tool as ToolId);
        focusTools();
      }
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  useEffect(() => {
    if (!initial.tool) return;
    // Wait for the Needs step to render, then bring the tool switcher into view.
    const t = focusTools();
    return () => window.clearTimeout(t);
  }, [initial.tool]);
  const toStep = (n: number) => {
    setStep(n);
    window.scrollTo({ top: 0 });
  };

  return (
    <>
      <PageHero
        eyebrow="Personal protection planner"
        title="Plan protection around your life."
        text="Understand what you may need, explore real scenarios and see what fits your budget."
        image="/images/pexels/young-asian-students-learning-together.webp"
        imagePosition="65% 25%"
        backLabel="Simulate"
        onBack={() => go("app/home")}
        titleId="simulate-title"
      />

      <Container className="relative -mt-5 max-w-[44rem]">
        <ol className="flex items-center justify-between gap-1 rounded-full bg-surface p-1.5 shadow-e2 ring-1 ring-ink/[0.06]">
          {steps.map((label, i) => {
            const active = i === step;
            const done = i < step;
            return (
              <li key={label} className="min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => toStep(i)}
                  aria-current={active ? "step" : undefined}
                  className={cn(
                    "flex h-11 w-full items-center justify-center gap-1.5 rounded-full px-1 text-[12px] font-bold uppercase tracking-[0.03em] transition-colors sm:text-caption",
                    active ? "bg-crimson-50 text-crimson-600" : "text-navy-900",
                  )}
                >
                  <span className={cn("inline-flex size-6 shrink-0 items-center justify-center rounded-full text-[12px]", active ? "bg-crimson-600 text-white" : done ? "bg-navy-900 text-white" : "bg-sunken text-navy-900")}>
                    {done ? <Check size={13} aria-hidden /> : i + 1}
                  </span>
                  <span className="truncate">{label}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </Container>

      {step === 0 && <ProfileStep onNext={() => toStep(1)} />}
      {step === 1 && <NeedsStep tool={tool} onTool={setTool} onNext={() => toStep(2)} />}
      {step === 2 && <PlanStep onBack={() => toStep(0)} />}
    </>
  );
}

function ProfileStep({ onNext }: { onNext: () => void }) {
  const saved = useProfile();
  const [p, setP] = useState<ProtectionProfile>(saved);
  const set = (patch: Partial<ProtectionProfile>) => setP((cur) => ({ ...cur, ...patch }));
  const completeness = profileCompleteness(p);

  const save = () => {
    profileStore.set({ ...p, savedAt: Date.now() });
    if (completeness.done === completeness.total) void rewardsActions.earn("profile-complete", "profile");
    onNext();
  };

  return (
    <Container className="max-w-[44rem] pt-5">
      <section className="rounded-2xl bg-surface p-4 shadow-e1 ring-1 ring-ink/[0.06] sm:p-5" aria-labelledby="budget-label">
        <div className="flex items-start gap-3">
          <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-crimson-50 text-crimson-600">
            <Wallet size={22} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p id="budget-label" className="text-body font-semibold text-navy-950">Your monthly protection budget</p>
            <p className="font-brand text-[2.5rem] font-bold leading-none text-crimson-600">
              <span className="text-body font-semibold text-navy-950">RM </span>
              {p.monthlyBudget}
              {p.monthlyBudget >= 500 && "+"}
              <span className="text-body font-medium text-ink-muted"> / month</span>
            </p>
          </div>
        </div>
        <input
          type="range"
          min={50}
          max={500}
          step={10}
          value={p.monthlyBudget}
          onChange={(e) => set({ monthlyBudget: Number(e.target.value) })}
          aria-labelledby="budget-label"
          className="ge-range mt-2"
          style={{ ["--fill" as string]: `${((p.monthlyBudget - 50) / 450) * 100}%` }}
        />
        <div className="flex justify-between text-caption text-ink-muted"><span>RM 50</span><span>RM 500+</span></div>
      </section>

      <section className="mt-4 rounded-2xl bg-navy-950 p-4 text-white sm:p-5" aria-labelledby="priorities-title">
        <h2 id="priorities-title" className="font-brand text-[1.625rem] font-semibold">Protection priorities</h2>
        <ul className="mt-2 divide-y divide-white/10">
          {areas.map(({ key, icon: Icon, hint, tone }) => {
            const on = p.priorities.includes(key);
            return (
              <li key={key}>
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={on}
                  onClick={() =>
                    setP((cur) => ({
                      ...cur,
                      priorities: cur.priorities.includes(key) ? cur.priorities.filter((x) => x !== key) : [...cur.priorities, key],
                    }))
                  }
                  className="flex min-h-16 w-full items-center gap-3 py-2.5 text-left"
                >
                  <span className={cn("inline-flex size-11 shrink-0 items-center justify-center rounded-xl", tone)}><Icon size={20} aria-hidden /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-body font-semibold">{areaLabels[key]}</span>
                    <span className="block text-caption text-white/70">{hint}</span>
                  </span>
                  <span className={cn("inline-flex size-6 shrink-0 items-center justify-center rounded-md ring-2", on ? "bg-teal-500 ring-teal-500" : "ring-white/40")}>
                    {on && <Check size={15} aria-hidden />}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-4 rounded-2xl bg-surface p-4 shadow-e1 ring-1 ring-ink/[0.06] sm:p-5" aria-labelledby="profile-title">
        <div className="flex items-baseline justify-between">
          <h2 id="profile-title" className="font-brand text-[1.625rem] font-semibold text-navy-950">Your profile</h2>
          <span className="text-caption text-ink-muted">{completeness.done}/{completeness.total} complete</span>
        </div>
        <div className="mt-3 grid gap-3">
          <Field icon={Calendar} label="Age" suffix="years">
            <input inputMode="numeric" value={p.age} onChange={(e) => set({ age: e.target.value.replace(/\D/g, "").slice(0, 3) })} className="ge-input" placeholder="e.g. 24" />
          </Field>
          <Field icon={Wallet} label="Monthly income" prefix="RM">
            <input inputMode="numeric" value={p.monthlyIncome} onChange={(e) => set({ monthlyIncome: e.target.value.replace(/\D/g, "").slice(0, 7) })} className="ge-input" placeholder="e.g. 3000" />
          </Field>
          <Field icon={Wallet} label="Monthly expenses" prefix="RM">
            <input inputMode="numeric" value={p.monthlyExpenses} onChange={(e) => set({ monthlyExpenses: e.target.value.replace(/\D/g, "").slice(0, 7) })} className="ge-input" placeholder="e.g. 1800" />
          </Field>
          <Field icon={Users} label="Dependants">
            <select value={p.dependants} onChange={(e) => set({ dependants: e.target.value as ProtectionProfile["dependants"] })} className="ge-input">
              <option value="">Select</option>
              <option value="none">None</option>
              <option value="parents">Parents</option>
              <option value="partner">Partner</option>
              <option value="children">Children</option>
            </select>
          </Field>
        </div>
        <h3 className="mt-5 text-body font-semibold text-navy-950">Do you already have this cover?</h3>
        <p className="text-caption text-ink-muted">Your own answer — GREAT EMPOWER does not check it.</p>
        <ul className="mt-2 grid gap-2.5">
          {areas.map(({ key }) => (
            <li key={key} className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-body-sm text-navy-950">{areaLabels[key]}</span>
              <span className="flex gap-1" role="radiogroup" aria-label={`${areaLabels[key]} cover`}>
                {(["yes", "no", "not-sure"] as CoverageAnswer[]).map((a) => (
                  <button
                    key={a}
                    type="button"
                    role="radio"
                    aria-checked={p.coverage[key] === a}
                    onClick={() => setP((cur) => ({ ...cur, coverage: { ...cur.coverage, [key]: a } }))}
                    className={cn("h-11 rounded-full px-3.5 text-caption font-semibold", p.coverage[key] === a ? "bg-navy-900 text-white" : "bg-sunken text-navy-900")}
                  >
                    {a === "yes" ? "Yes" : a === "no" ? "No" : "Not sure"}
                  </button>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <button type="button" onClick={save} className="mt-5 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-crimson-600 text-body font-bold text-white hover:bg-crimson-700">
        Save and explore my needs <ArrowRight size={18} aria-hidden />
      </button>
      <p className="mt-2 flex items-center justify-center gap-1.5 text-caption text-ink-muted">
        <Info size={13} aria-hidden /> Educational estimate · Not a quote or approval · Saved on this device
      </p>
    </Container>
  );
}

function Field({ icon: Icon, label, prefix, suffix, children }: { icon: typeof Wallet; label: string; prefix?: string; suffix?: string; children: ReactNode }) {
  return (
    <label className="flex min-h-12 items-center gap-3 border-b border-ink/10 pb-2">
      <Icon size={20} className="shrink-0 text-navy-700" aria-hidden />
      <span className="w-32 shrink-0 text-body-sm text-navy-950 sm:w-36">{label}</span>
      <span className="flex min-w-0 flex-1 items-center gap-1.5">
        {prefix && <span className="text-body-sm font-semibold text-ink-muted">{prefix}</span>}
        {children}
        {suffix && <span className="text-caption text-ink-muted">{suffix}</span>}
      </span>
    </label>
  );
}

type ToolId = (typeof TOOL_IDS)[number];

const tools: Array<{ id: ToolId; title: string; short: string; hint: string; icon: GeIconName }> = [
  { id: "tool-bill", title: "Medical bill", short: "Medical bill", hint: "How a hospital bill is shared between you, an employer and a plan.", icon: "heartPulse" },
  { id: "tool-fund", title: "Emergency fund", short: "Emergency fund", hint: "How many months your savings could cover essentials.", icon: "cash" },
  { id: "tool-family", title: "Family protection", short: "Family", hint: "What your dependants might need, compared with life cover you count. Life insurance doesn't cancel debts.", icon: "family" },
  { id: "tool-ci", title: "Critical illness runway", short: "Critical illness", hint: "A critical illness payout is a one-off lump sum, not a salary. Compare it with a recovery period.", icon: "ribbon" },
];

const keyTerms = [
  { term: "Deductible", text: "A fixed amount you pay first before the plan pays." },
  { term: "Co-insurance", text: "A percentage of the eligible bill you share, e.g. 20%." },
  { term: "Co-payment", text: "The umbrella term BNM uses for any amount or share you pay yourself, including deductibles and co-insurance." },
  { term: "Annual limit", text: "The most a plan pays in one policy year." },
];

const learnMore: Partial<Record<ToolId, { href: string; label: string }>> = {
  "tool-bill": { href: "#app/learn/protection/medical", label: "About medical cover" },
  "tool-fund": { href: "#app/guide/article/emergency-fund", label: "Read “Building an emergency fund”" },
  "tool-family": { href: "#app/learn/protection/life", label: "About life cover" },
  "tool-ci": { href: "#app/learn/protection/critical-illness", label: "About critical illness cover" },
};

/** One tool at a time: a tab switcher instead of four tools stacked on one long page. */
function NeedsStep({ tool, onTool, onNext }: { tool: ToolId; onTool: (t: ToolId) => void; onNext: () => void }) {
  const active = tools.find((t) => t.id === tool)!;
  const more = learnMore[tool];
  const onKey = (e: React.KeyboardEvent, i: number) => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const next = tools[(i + d + tools.length) % tools.length];
    onTool(next.id);
    document.getElementById(`tab-${next.id}`)?.focus();
  };
  return (
    <>
      <Container className="max-w-[60rem] scroll-mt-20 pt-6" id="needs-tools">
        <h2 className="font-brand text-[1.875rem] font-semibold text-navy-950">Pick a tool</h2>
        <div role="tablist" aria-label="Simulation tools" className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {tools.map((t, i) => {
            const on = t.id === tool;
            return (
              <button
                key={t.id}
                id={`tab-${t.id}`}
                role="tab"
                type="button"
                aria-selected={on}
                aria-controls={t.id}
                tabIndex={on ? 0 : -1}
                onClick={() => onTool(t.id)}
                onKeyDown={(e) => onKey(e, i)}
                className={cn(
                  "flex min-h-14 items-center gap-2.5 rounded-2xl px-3 py-2 text-left text-body-sm font-semibold transition-colors",
                  on ? "bg-navy-900 text-white shadow-e2" : "bg-surface text-navy-950 ring-1 ring-ink/[0.08] hover:ring-ink/20",
                )}
              >
                <span className={cn("inline-flex size-9 shrink-0 items-center justify-center rounded-xl", on ? "bg-white/15 text-white" : "bg-navy-50 text-navy-800")}>
                  <GeIcon name={t.icon} size={18} aria-hidden />
                </span>
                {t.short}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-body-sm text-ink-secondary">
          {active.hint}{" "}
          {more && <a href={more.href} className="font-semibold text-navy-800 underline underline-offset-2">{more.label}</a>}
        </p>
      </Container>

      {tools.map((t) => (
        <Container key={t.id} className="max-w-[1040px] scroll-mt-20 pt-4" id={t.id}>
          <div role="tabpanel" aria-labelledby={`tab-${t.id}`} hidden={t.id !== tool}>
            <h2 className="sr-only">{t.title}</h2>
            {t.id === "tool-bill" && <MedicalClaimSimulator />}
            {t.id === "tool-fund" && <div className="max-w-[40rem]"><EmergencyFundCalculator /></div>}
            {t.id === "tool-family" && <FamilyProtectionScenario />}
            {t.id === "tool-ci" && <CiRunwayScenario />}
          </div>
        </Container>
      ))}

      <Container className="max-w-[60rem] pt-6">
        <details className="group rounded-2xl bg-navy-50 px-4">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between text-body-sm font-semibold text-navy-900">
            Key terms used in the simulators
            <ArrowRight size={16} className="rotate-90 transition-transform group-open:-rotate-90" aria-hidden />
          </summary>
          <dl className="grid gap-2 pb-4">
            {keyTerms.map((k) => (
              <div key={k.term}>
                <dt className="text-body-sm font-semibold text-navy-950">{k.term}</dt>
                <dd className="text-body-sm text-ink-secondary">{k.text}</dd>
              </div>
            ))}
            <p className="text-caption text-ink-muted">
              Sources:{" "}
              <a className="underline" href="https://www.bnm.gov.my/documents/20124/938039/pd_mhit_dec25.pdf" target="_blank" rel="noreferrer">BNM MHIT policy document</a>
              {" · "}
              <a className="underline" href="https://insuranceinfo.com.my/learn-the-basics/insurance-glossary/" target="_blank" rel="noreferrer">InsuranceInfo glossary</a>
              . Plans differ — check your own policy wording.
            </p>
          </dl>
        </details>
        <button type="button" onClick={onNext} className="mt-4 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-crimson-600 text-body font-bold text-white hover:bg-crimson-700">
          See my protection plan <ArrowRight size={18} aria-hidden />
        </button>
      </Container>
    </>
  );
}

function PlanStep({ onBack }: { onBack: () => void }) {
  const p = useProfile();
  const completeness = profileCompleteness(p);
  const chosen = areas.filter((a) => p.priorities.includes(a.key));
  return (
    <Container className="max-w-[44rem] pt-6">
      <h2 className="font-brand text-[1.875rem] font-semibold text-navy-950">Your protection plan</h2>
      <p className="mt-1 text-body-sm text-ink-secondary">
        Based on what you told us: a budget of RM {p.monthlyBudget}
        {p.monthlyBudget >= 500 ? "+" : ""} a month and {chosen.length} {chosen.length === 1 ? "priority" : "priorities"}.
      </p>

      {completeness.done < completeness.total && (
        <button type="button" onClick={onBack} className="mt-4 flex w-full items-center gap-3 rounded-2xl bg-gold-50 p-4 text-left text-body-sm text-gold-700 ring-1 ring-gold-100">
          <Info size={18} className="shrink-0" aria-hidden />
          <span className="flex-1">Your profile is {completeness.percent}% complete. Finish it for a clearer picture.</span>
          <ArrowLeft size={16} aria-hidden />
        </button>
      )}

      <ul className="mt-4 grid gap-2.5">
        {chosen.map(({ key, icon: Icon }) => {
          const answer = p.coverage[key];
          const status = answer === "yes" ? "You said you have this cover" : answer === "no" ? "You said you don't have this cover" : answer === "not-sure" ? "You're not sure yet" : "Not answered yet";
          return (
            <li key={key} className="flex items-center gap-3 rounded-2xl bg-surface p-4 ring-1 ring-ink/[0.07]">
              <Icon size={22} className="shrink-0 text-navy-800" aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block text-body font-semibold text-navy-950">{areaLabels[key]}</span>
                <span className="block text-caption text-ink-muted">{status}</span>
              </span>
              {answer === "yes" && <CheckCircle2 size={20} className="text-success-600" aria-label="Has cover (self-reported)" />}
            </li>
          );
        })}
      </ul>

      <div className="mt-5 grid gap-2.5 sm:grid-cols-3">
        {[
          { label: "See your protection check", href: "app/protect" },
          { label: "How protection works", href: "app/learn/protection" },
          { label: "Practical guides", href: "app/guide" },
        ].map((l) => (
          <button key={l.href} type="button" onClick={() => go(l.href)} className="flex min-h-12 items-center justify-between gap-2 rounded-xl bg-navy-900 px-4 text-body-sm font-semibold text-white">
            {l.label} <ArrowRight size={16} aria-hidden />
          </button>
        ))}
      </div>

      <section className="mt-6 rounded-2xl bg-navy-50 p-4 text-body-sm text-navy-900">
        <p className="font-semibold">Talking to an adviser</p>
        <p className="mt-1 text-ink-secondary">
          GREAT EMPOWER does not connect you to agents or provide quotes. For personal advice, speak
          to a licensed insurance or takaful adviser and bring this summary with you.
        </p>
        <button type="button" onClick={() => go("app/guide/sessions")} className="mt-3 inline-flex min-h-11 items-center gap-1.5 font-semibold text-crimson-600">
          Try a guidance session (prototype) <ArrowRight size={15} aria-hidden />
        </button>
      </section>
      <p className="mt-4 text-caption text-ink-muted">
        This plan is educational. It is not an insurance quotation, recommendation or approval, and
        actual policy terms differ.
      </p>
    </Container>
  );
}
