import { useId, useState, type ReactNode } from "react";
import { ChevronDown, Info, Ribbon, Sparkles, Users } from "lucide-react";
import { cn } from "@/lib/cn";
import { useProfile } from "@/state/profile";
import {
  ENGINE3_REFERENCES,
  calculateCiRunway,
  calculateLifeGap,
  formatRatio,
  formatSen,
  type Engine3Step,
  type GapVariant,
} from "@/calculation-engine/engine-3";

/* Inputs are strings so an empty field means "not entered yet" — never silently zero. */
type Money = string;
const digits = (v: string) => v.replace(/\D/g, "").slice(0, 9);
const num = (v: Money) => (v.trim() === "" ? null : Number(v));

/* ==================================================================== family (life) scenario */

const yearPresets = [
  { label: "Parents", years: ENGINE3_REFERENCES.dependantYears.parents },
  { label: "Children", years: ENGINE3_REFERENCES.dependantYears.children },
  { label: "No dependants", years: ENGINE3_REFERENCES.dependantYears.none },
];

export function FamilyProtectionScenario() {
  const profile = useProfile();
  const profileYears =
    profile.dependants === "parents" ? 5 : profile.dependants === "children" ? 10 : profile.dependants === "none" ? 0 : null;
  const [support, setSupport] = useState<Money>("");
  // Pre-set only from the profile; otherwise the learner picks — never a silent default.
  const [years, setYears] = useState<number | null>(profileYears);
  const [debt, setDebt] = useState<Money>("");
  const [other, setOther] = useState<Money>("");
  const [finalExp, setFinalExp] = useState<Money>(String(ENGINE3_REFERENCES.finalExpensesExampleMyr));
  const [savings, setSavings] = useState<Money>("");
  const [personal, setPersonal] = useState<Money>("");
  const [employer, setEmployer] = useState<Money>("");
  const [kappa, setKappa] = useState(0);

  const fields = [support, debt, other, finalExp, savings, personal, employer];
  const missing = years === null || fields.some((f) => num(f) === null);
  const result = missing || years === null
    ? null
    : calculateLifeGap({
        monthlyDependantSupportMyr: num(support)!,
        supportYears: years,
        dependantDebtMyr: num(debt)!,
        otherLiabilitiesMyr: num(other)!,
        finalExpensesMyr: num(finalExp)!,
        liquidAssetsMyr: num(savings)!,
        personalLifeCoverMyr: num(personal)!,
        employerLifeCoverMyr: num(employer)!,
        employerPortabilityPercent: kappa,
      });

  const useExample = () => {
    setSupport("400");
    setYears(5);
    setDebt("20000");
    setOther("0");
    setFinalExp("25000");
    setSavings("4000");
    setPersonal("25000");
    setEmployer("0");
    setKappa(0);
  };

  return (
    <ScenarioShell
      icon={Users}
      tone="bg-navy-900 text-white"
      title="Family protection scenario"
      category="Life · Family Financial Protection"
      onExample={useExample}
      exampleLabel="Fill in the research example (a fresh graduate supporting parents)"
      inputs={
        <>
          <MoneyField label="Monthly support for dependants" hint="What you give each month to people who rely on you" value={support} onChange={setSupport} />
          <div>
            <p className="text-body-sm font-semibold text-navy-950" id="years-label">Years of support</p>
            <p className="text-caption text-ink-muted">
              Research suggestion: parents 5 years, children 10. {profileYears !== null && "Pre-set from your profile."}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5" role="group" aria-labelledby="years-label">
              {yearPresets.map((p) => (
                <button key={p.label} type="button" aria-pressed={years === p.years} onClick={() => setYears(p.years)} className={cn("h-10 rounded-full px-3.5 text-caption font-semibold", years === p.years ? "bg-navy-900 text-white" : "bg-sunken text-navy-900")}>
                  {p.label} · {p.years}y
                </button>
              ))}
              <label className="flex items-center gap-1.5 text-caption text-ink-secondary">
                Custom
                <input type="number" min={0} max={40} value={years ?? ""} placeholder="–" onChange={(e) => setYears(e.target.value === "" ? null : Math.max(0, Math.min(40, Math.trunc(Number(e.target.value) || 0))))} className="ge-input h-10 w-20" aria-label="Years of support" />
              </label>
            </div>
          </div>
          <MoneyField label="Debts your family may face" hint="e.g. a car loan or a loan someone co-signed" value={debt} onChange={setDebt} />
          <MoneyField label="Other liabilities" value={other} onChange={setOther} />
          <MoneyField label="Final expenses" hint="Research example RM25,000 — change it to your own estimate" value={finalExp} onChange={setFinalExp} />
          <MoneyField label="Savings you could use" hint="Cash or savings your family could access" value={savings} onChange={setSavings} />
          <MoneyField label="Your own life cover" hint="Sum assured on policies you own (your own answer)" value={personal} onChange={setPersonal} />
          <MoneyField label="Employer group life cover" value={employer} onChange={setEmployer} />
          {num(employer) ? <PortabilitySlider value={kappa} onChange={setKappa} /> : null}
        </>
      }
      result={
        !result ? (
          <EmptyResult />
        ) : !result.ok ? (
          <Errors errors={result.errors} />
        ) : (
          <>
            <p className="text-caption text-white/70">Our source gives two ways to treat your savings, so you see both.</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {result.variants.map((v) => (
                <VariantCard key={v.id} variant={v} coverSen={result.coverSen} />
              ))}
            </div>
            <Workings
              steps={[...result.coverSteps, ...result.variants[1].steps.slice(0, 1), result.variants[0].steps[1], result.variants[0].steps[2], result.variants[1].steps[1], result.variants[1].steps[2]]}
              assumptions={result.assumptions}
              changes={[
                "More years of support, or more people who depend on you, raises the need.",
                "Paying down debts lowers it.",
                "Counting employer cover only helps while you're in that job.",
                "Inflation isn't included, so long periods understate future costs.",
              ]}
            />
          </>
        )
      }
    />
  );
}

function VariantCard({ variant: v, coverSen }: { variant: GapVariant; coverSen: bigint }) {
  const coverPct = Math.min(100, v.ratioPermille / 10);
  return (
    <div className="rounded-xl bg-white/[0.06] p-3 ring-1 ring-white/10">
      <p className="text-caption font-semibold text-white/80">{v.label}</p>
      <p className="mt-0.5 text-[11px] leading-snug text-white/55">{v.explanation}</p>
      <p className="mt-2 text-caption text-white/70">Estimated gap</p>
      <p className="font-brand text-[2rem] font-bold leading-none tabular-nums text-white break-all">{formatSen(v.gapSen)}</p>
      {v.gapSen === 0n && <p className="mt-1 text-caption font-semibold text-teal-200">No gap in this illustration — the cover you counted meets the need.</p>}
      <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-white/15" aria-hidden>
        <div className="h-full rounded-full bg-teal-300" style={{ width: `${coverPct}%` }} />
      </div>
      <p className="mt-1.5 text-caption tabular-nums text-white/70">
        Cover {formatSen(coverSen)} of need {formatSen(v.needSen)} · {formatRatio(v.ratioPermille)}
      </p>
    </div>
  );
}

/* ==================================================================== critical illness runway */

export function CiRunwayScenario() {
  const profile = useProfile();
  const [income, setIncome] = useState<Money>(digits(profile.monthlyIncome));
  const [years, setYears] = useState<number>(ENGINE3_REFERENCES.ciRunwayYears.example);
  const [personal, setPersonal] = useState<Money>("");
  const [employer, setEmployer] = useState<Money>("");
  const [kappa, setKappa] = useState(0);
  const missing = [income, personal, employer].some((f) => num(f) === null);
  const result = missing
    ? null
    : calculateCiRunway({
        monthlyNetIncomeMyr: num(income)!,
        recoveryYears: years,
        personalCiCoverMyr: num(personal)!,
        employerCiCoverMyr: num(employer)!,
        employerPortabilityPercent: kappa,
      });
  const { min, max, example } = ENGINE3_REFERENCES.ciRunwayYears;

  return (
    <ScenarioShell
      icon={Ribbon}
      tone="bg-gold-500 text-navy-950"
      title="Critical illness recovery runway"
      category="Critical Illness · Critical Illness Recovery"
      onExample={() => {
        setIncome("3000");
        setYears(example);
        setPersonal("50000");
        setEmployer("0");
        setKappa(0);
      }}
      exampleLabel="Fill in an example (RM3,000 take-home, RM50,000 cover)"
      inputs={
        <>
          <MoneyField label="Monthly take-home income" hint={profile.monthlyIncome ? "Pre-filled from your profile — use your take-home (net) pay" : "Your net pay after deductions"} value={income} onChange={setIncome} />
          <div>
            <label htmlFor="ci-years" className="flex items-baseline justify-between text-body-sm font-semibold text-navy-950">
              Recovery period
              <span className="font-brand text-[1.5rem] text-crimson-600 tabular-nums">{years} {years === 1 ? "year" : "years"}</span>
            </label>
            <input id="ci-years" type="range" min={min} max={max} step={1} value={years} onChange={(e) => setYears(Number(e.target.value))} className="ge-range mt-1" style={{ ["--fill" as string]: `${((years - min) / (max - min)) * 100}%` }} />
            <p className="text-caption text-ink-muted">You choose 1–5 years. The research example uses {example}.</p>
          </div>
          <MoneyField label="Your own critical illness cover" hint="Lump sum on policies you own (your own answer)" value={personal} onChange={setPersonal} />
          <MoneyField label="Employer group critical illness cover" value={employer} onChange={setEmployer} />
          {num(employer) ? <PortabilitySlider value={kappa} onChange={setKappa} /> : null}
        </>
      }
      result={
        !result ? (
          <EmptyResult />
        ) : !result.ok ? (
          <Errors errors={result.errors} />
        ) : (
          <>
            <p className="text-caption text-white/70">Estimated gap over {years} {years === 1 ? "year" : "years"}</p>
            <p className="font-brand text-[2.5rem] font-bold leading-none tabular-nums text-white break-all">{formatSen(result.gapSen)}</p>
            {result.gapSen === 0n && <p className="mt-1 text-caption font-semibold text-gold-300">No gap in this illustration — the cover you counted meets the runway.</p>}
            <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-white/15" aria-hidden>
              <div className="h-full rounded-full bg-gold-300" style={{ width: `${Math.min(100, result.ratioPermille / 10)}%` }} />
            </div>
            <p className="mt-1.5 text-caption tabular-nums text-white/70">
              Cover {formatSen(result.coverSen)} of runway {formatSen(result.needSen)} · {formatRatio(result.ratioPermille)}
            </p>
            <Workings
              steps={result.steps}
              assumptions={result.assumptions}
              changes={[
                "A longer recovery period raises the runway you'd need.",
                "Lower monthly costs during recovery would stretch the lump sum further.",
                "A medical card may pay eligible hospital bills, but not living costs.",
                "A claim depends on the illness meeting the policy's definition.",
              ]}
            />
          </>
        )
      }
    />
  );
}

/* ==================================================================== shared pieces */

function ScenarioShell({
  icon: Icon,
  tone,
  title,
  category,
  inputs,
  result,
  onExample,
  exampleLabel,
}: {
  icon: typeof Users;
  tone: string;
  title: string;
  category: string;
  inputs: ReactNode;
  result: ReactNode;
  onExample: () => void;
  exampleLabel: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-surface shadow-e1 ring-1 ring-ink/[0.06]">
      <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
        <span className={cn("inline-flex size-11 shrink-0 items-center justify-center rounded-xl", tone)}><Icon size={20} aria-hidden /></span>
        <div className="min-w-0 flex-1">
          <h3 className="text-subheading text-navy-950">{title}</h3>
          <p className="text-caption text-ink-muted">{category} · Generic educational scenario — not based on any product</p>
        </div>
      </div>
      <div className="grid lg:grid-cols-[1fr_1fr]">
        <div className="grid content-start gap-3 p-4">
          <button type="button" onClick={onExample} className="inline-flex min-h-11 items-center gap-1.5 self-start rounded-full bg-navy-50 px-3.5 text-caption font-semibold text-navy-900">
            <Sparkles size={14} aria-hidden /> {exampleLabel}
          </button>
          {inputs}
        </div>
        <div className="bg-navy-950 p-4 text-white" aria-live="polite">
          {result}
        </div>
      </div>
    </div>
  );
}

function MoneyField({ label, hint, value, onChange }: { label: string; hint?: string; value: Money; onChange: (v: Money) => void }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="text-body-sm font-semibold text-navy-950">{label}</label>
      {hint && <p className="text-caption text-ink-muted" id={`${id}-hint`}>{hint}</p>}
      <div className="mt-1 flex items-center gap-2">
        <span className="text-body-sm font-semibold text-ink-muted">RM</span>
        <input id={id} inputMode="numeric" autoComplete="off" placeholder="Enter 0 if none" value={value} onChange={(e) => onChange(digits(e.target.value))} aria-describedby={hint ? `${id}-hint` : undefined} className="ge-input" />
      </div>
    </div>
  );
}

function PortabilitySlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="rounded-xl bg-sunken/70 p-3">
      <label htmlFor="kappa" className="flex items-baseline justify-between text-body-sm font-semibold text-navy-950">
        How much employer cover to count
        <span className="tabular-nums text-crimson-600">{value}%</span>
      </label>
      <input id="kappa" type="range" min={0} max={100} step={10} value={value} onChange={(e) => onChange(Number(e.target.value))} className="ge-range mt-1" style={{ ["--fill" as string]: `${value}%` }} />
      <p className="text-caption text-ink-muted">
        Employer cover usually ends when you leave the job. 0% doesn't count it; 100% counts all of it. The research blueprint's example uses {ENGINE3_REFERENCES.portabilityExamplePercent}%.
      </p>
    </div>
  );
}

function EmptyResult() {
  return (
    <div className="flex h-full min-h-40 flex-col justify-center">
      <p className="font-brand text-[1.5rem] font-semibold">Your result appears here</p>
      <p className="mt-1 text-body-sm text-white/70">Fill in every amount — enter 0 where something doesn't apply. Nothing is assumed for you.</p>
    </div>
  );
}

function Errors({ errors }: { errors: Array<{ field: string; message: string }> }) {
  return (
    <ul role="alert" className="grid gap-1 text-body-sm text-gold-300">
      {errors.map((e) => (
        <li key={e.field}>{e.message}</li>
      ))}
    </ul>
  );
}

function Workings({ steps, assumptions, changes }: { steps: Engine3Step[]; assumptions: string[]; changes: string[] }) {
  return (
    <div className="mt-4 grid gap-2">
      <Disclosure title="How this was calculated">
        <ol className="grid gap-2">
          {steps.map((s, i) => (
            <li key={`${s.id}-${i}`} className="rounded-lg bg-white/[0.05] p-2.5">
              <p className="text-caption font-semibold text-white">{s.label}</p>
              <p className="text-[11px] text-white/60">{s.formula}</p>
              <p className="mt-0.5 text-caption tabular-nums text-white/85">
                {s.working} = <strong className="font-semibold text-white">{formatSen(s.resultSen)}</strong>
              </p>
            </li>
          ))}
        </ol>
      </Disclosure>
      <Disclosure title="Assumptions">
        <ul className="grid gap-1.5">{assumptions.map((a) => <li key={a} className="text-caption text-white/80">{a}</li>)}</ul>
      </Disclosure>
      <Disclosure title="What could change the result">
        <ul className="grid gap-1.5">{changes.map((a) => <li key={a} className="text-caption text-white/80">{a}</li>)}</ul>
      </Disclosure>
      <p className="flex gap-1.5 text-[11px] leading-snug text-white/55">
        <Info size={12} className="mt-0.5 shrink-0" aria-hidden />
        Formula from the GREAT EMPOWER V2 research blueprint (Engine 3). An educational illustration from your own numbers — not a quote, a needs analysis, a recommendation to buy any amount or product, or a promise that a claim would be paid.
      </p>
    </div>
  );
}

function Disclosure({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="group rounded-xl bg-white/[0.04] ring-1 ring-white/10">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between px-3 text-caption font-semibold text-white">
        {title}
        <ChevronDown size={16} className="transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <div className="px-3 pb-3">{children}</div>
    </details>
  );
}
