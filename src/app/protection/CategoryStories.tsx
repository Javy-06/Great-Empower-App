import { useState, type ReactNode } from "react";
import { Bandage, Car, Hospital, HeartPulse, Home, Receipt, Stethoscope, UserRound, Users, Wallet } from "lucide-react";
import { cn } from "@/lib/cn";
import { splitBill } from "./billSplit";

/**
 * One visual story per protection category. Every figure is illustrative, labelled as such,
 * and reconciles (tested in protection.test.ts for the bill split).
 */
const rm = (n: number) => `RM${n.toLocaleString("en-MY")}`;

function Story({ id, overline, title, children, note }: { id: string; overline: string; title: string; children: ReactNode; note: string }) {
  return (
    <section aria-labelledby={id} className="mt-8">
      <p className="text-overline uppercase text-teal-700">{overline}</p>
      <h2 id={id} className="font-brand text-[1.875rem] font-semibold leading-tight text-navy-950">{title}</h2>
      <div className="mt-3 rounded-2xl bg-surface p-4 ring-1 ring-ink/[0.08] sm:p-5">
        {children}
        <p className="mt-4 text-caption text-ink-muted">{note}</p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Medical: interactive bill */
const DEDUCTIBLES = [0, 500, 1000];
const COPAYS = [0, 0.1, 0.2];

export function BillSplitter() {
  const [bill, setBill] = useState(20_000);
  const [deductible, setDeductible] = useState(500);
  const [copay, setCopay] = useState(0.1);
  const s = splitBill({ bill, notEligibleRate: 0.05, deductible, copayRate: copay });
  const parts = [
    { key: "Not eligible", amount: s.notEligible, tone: "bg-crimson-300", text: "text-crimson-800" },
    { key: "Deductible", amount: s.deductible, tone: "bg-crimson-500", text: "text-crimson-700" },
    { key: "Co-payment", amount: s.copay, tone: "bg-crimson-700", text: "text-crimson-700" },
    { key: "Insurer pays", amount: s.insurer, tone: "bg-navy-900", text: "text-navy-950" },
  ];
  return (
    <Story id="bill-title" overline="Try it" title="Who pays a hospital bill?" note="Illustrative plan, not a real product: 5% of the bill is non-eligible items, and there's no annual-limit cap at these amounts. Your policy sets the real rules.">
      <label htmlFor="bill-amount" className="flex items-baseline justify-between gap-3">
        <span className="text-body-sm font-semibold text-navy-950">Hospital bill</span>
        <span className="font-brand text-[1.75rem] font-semibold tabular-nums text-navy-950">{rm(s.bill)}</span>
      </label>
      <input
        id="bill-amount"
        type="range"
        min={2000}
        max={60000}
        step={1000}
        value={bill}
        onChange={(e) => setBill(Number(e.target.value))}
        className="ge-range mt-2"
        style={{ ["--fill" as string]: `${((bill - 2000) / 58000) * 100}%` }}
      />
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Choice label="Deductible" options={DEDUCTIBLES.map((d) => ({ v: d, t: d ? rm(d) : "None" }))} value={deductible} onChange={setDeductible} />
        <Choice label="Co-payment" options={COPAYS.map((c) => ({ v: c, t: c ? `${c * 100}%` : "None" }))} value={copay} onChange={setCopay} />
      </div>
      <div className="mt-5 flex h-5 overflow-hidden rounded-full bg-sunken" aria-hidden>
        {parts.map((p) => p.amount > 0 && <span key={p.key} className={cn("h-full transition-[width] duration-300", p.tone)} style={{ width: `${(p.amount / s.bill) * 100}%` }} />)}
      </div>
      <ul className="mt-3 grid gap-1.5 text-body-sm" aria-live="polite">
        {parts.map((p) => (
          <li key={p.key} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-navy-950"><span className={cn("size-2.5 rounded-full", p.tone)} aria-hidden />{p.key}</span>
            <b className={cn("tabular-nums", p.text)}>{rm(p.amount)}</b>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-end justify-between gap-3 rounded-xl bg-crimson-50 p-3">
        <span className="text-body-sm font-semibold text-navy-950">You pay</span>
        <span className="text-right">
          <span className="block font-brand text-[2rem] font-semibold leading-none tabular-nums text-crimson-700">{rm(s.you)}</span>
          <span className="text-caption text-ink-secondary">{Math.round((s.you / s.bill) * 100)}% of the bill</span>
        </span>
      </div>
    </Story>
  );
}

function Choice<T extends number>({ label, options, value, onChange }: { label: string; options: { v: T; t: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <fieldset>
      <legend className="text-caption font-semibold text-ink-muted">{label}</legend>
      <div className="mt-1 grid grid-cols-3 gap-1 rounded-full bg-sunken p-1">
        {options.map((o) => (
          <button
            key={o.v}
            type="button"
            aria-pressed={value === o.v}
            onClick={() => onChange(o.v)}
            className={cn("h-11 rounded-full text-body-sm font-semibold", value === o.v ? "bg-navy-900 text-white shadow-e1" : "text-navy-900")}
          >
            {o.t}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/* ------------------------------------------------------------------ Critical illness: recovery timeline */
const CI_LUMP = 60_000;
const CI_MONTHLY = 3_000;
const CI_MONTHS = 12;

export function CiTimeline() {
  const used = CI_MONTHLY * CI_MONTHS; // 36,000
  const left = CI_LUMP - used; // 24,000
  const phases = [
    { icon: Stethoscope, label: "Diagnosis", sub: "Lump sum paid once the definition is met", months: 1, tone: "bg-crimson-600" },
    { icon: Hospital, label: "Treatment", sub: "Salary may stop; extra costs start", months: 4, tone: "bg-crimson-400" },
    { icon: Home, label: "Recovery at home", sub: "Bills and rent keep coming", months: 7, tone: "bg-gold-500" },
  ];
  return (
    <Story id="ci-story" overline="A year in recovery" title="Why a lump sum matters" note={`Illustrative: a ${rm(CI_LUMP)} payout, ${rm(CI_MONTHLY)} a month in living and recovery costs, 12 months off work. A lump sum is paid once — it isn't a salary.`}>
      <ol className="grid gap-3 sm:grid-cols-3">
        {phases.map((p) => (
          <li key={p.label} className="flex gap-3 sm:flex-col">
            <span className={cn("inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-white", p.tone)}><p.icon size={20} aria-hidden /></span>
            <span>
              <span className="block text-body-sm font-semibold text-navy-950">{p.label} <span className="font-normal text-ink-muted">· {p.months} mo</span></span>
              <span className="block text-caption text-ink-secondary">{p.sub}</span>
            </span>
          </li>
        ))}
      </ol>
      <figure className="mt-5">
        <figcaption className="flex justify-between text-caption text-ink-muted"><span>Lump sum over 12 months</span><span className="font-semibold text-navy-950">{rm(CI_LUMP)}</span></figcaption>
        <div className="mt-2 grid grid-cols-12 gap-1" aria-hidden>
          {Array.from({ length: 12 }, (_, m) => (
            <span key={m} className="h-8 rounded-md bg-navy-900" style={{ opacity: 1 - (m * CI_MONTHLY) / CI_LUMP }} />
          ))}
        </div>
        <ul className="mt-3 grid gap-1.5 text-body-sm">
          <li className="flex justify-between"><span>Used on 12 months of costs</span><b className="tabular-nums">{rm(used)}</b></li>
          <li className="flex justify-between text-teal-800"><span>Left for what comes next</span><b className="tabular-nums">{rm(left)}</b></li>
        </ul>
      </figure>
    </Story>
  );
}

/* ------------------------------------------------------------------ Life: family responsibility map */
const INCOME = 4_000;
const OUTGOINGS = [
  { icon: Users, label: "Parents", amount: 500, sub: "Monthly support" },
  { icon: Car, label: "Car loan", amount: 800, sub: "Still owed — the payout isn't sent to lenders" },
  { icon: Home, label: "Rent share", amount: 700, sub: "Household costs" },
  { icon: Receipt, label: "Final expenses", amount: 0, sub: "A one-off cost, e.g. a funeral" },
];

export function FamilyMap() {
  const monthly = OUTGOINGS.reduce((t, o) => t + o.amount, 0); // 2,000
  return (
    <Story id="family-story" overline="Who relies on you?" title="Your income, and who it supports" note={`Illustrative: ${rm(INCOME)} monthly income; ${rm(monthly)} of it goes to others each month. Life insurance pays your nominee or estate — it doesn't cancel debts directly.`}>
      <div className="grid items-center gap-4 sm:grid-cols-[11rem_1fr]">
        <div className="flex flex-col items-center gap-2 rounded-2xl bg-navy-950 p-4 text-center text-white">
          <span className="inline-flex size-12 items-center justify-center rounded-full bg-white/10"><UserRound size={24} aria-hidden /></span>
          <span className="text-body-sm font-semibold">You</span>
          <span className="font-brand text-[1.5rem] font-semibold leading-none tabular-nums">{rm(INCOME)}</span>
          <span className="text-caption text-white/80">income a month</span>
        </div>
        <ul className="grid gap-2 border-l-2 border-dashed border-navy-200 pl-4 sm:grid-cols-2">
          {OUTGOINGS.map((o) => (
            <li key={o.label} className="flex gap-3 rounded-xl bg-sunken p-3">
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-navy-800"><o.icon size={18} aria-hidden /></span>
              <span className="min-w-0">
                <span className="block text-body-sm font-semibold text-navy-950">{o.label}{o.amount ? <span className="tabular-nums"> · {rm(o.amount)}/mo</span> : null}</span>
                <span className="block text-caption text-ink-secondary">{o.sub}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-4 rounded-xl bg-teal-50 p-3 text-body-sm text-navy-950">
        If your income stopped for good, <b>{rm(monthly)} a month</b> of support would stop with it. Family protection is about replacing that for the years people would need it.
      </p>
    </Story>
  );
}

/* ------------------------------------------------------------------ Accident: scenario strip */
const PA_SUM = 50_000;
export function AccidentStory() {
  const steps = [
    { icon: Car, label: "The accident", text: "Hafiz falls off his motorcycle on the way to work." },
    { icon: Bandage, label: "Treatment", text: `Accident medical bills are paid up to the plan's limit — e.g. ${rm(2_000)} for this claim.` },
    { icon: HeartPulse, label: "Lasting injury", text: `If an injury is permanent, the plan pays a set % of the sum insured — e.g. 10% of ${rm(PA_SUM)} = ${rm(PA_SUM * 0.1)}.` },
    { icon: Wallet, label: "Back to work", text: "Days off may not be paid. Some plans add a daily hospital income." },
  ];
  return (
    <Story id="pa-story" overline="One accident, four costs" title="What an accident can cost" note={`Illustrative plan with a ${rm(PA_SUM)} sum insured. Each policy has its own schedule of percentages, limits and exclusions.`}>
      <ol className="relative grid gap-4 sm:grid-cols-4">
        <span className="absolute left-[1.35rem] top-2 bottom-2 w-px bg-navy-200 sm:hidden" aria-hidden />
        {steps.map((s, i) => (
          <li key={s.label} className="relative flex gap-3 sm:flex-col">
            <span className="relative inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-crimson-50 text-crimson-600 ring-4 ring-surface">
              <s.icon size={20} aria-hidden />
              <span className="absolute -right-1 -top-1 inline-flex size-5 items-center justify-center rounded-full bg-navy-900 text-[11px] font-bold text-white">{i + 1}</span>
            </span>
            <span>
              <span className="block text-body-sm font-semibold text-navy-950">{s.label}</span>
              <span className="block text-caption text-ink-secondary">{s.text}</span>
            </span>
          </li>
        ))}
      </ol>
    </Story>
  );
}

