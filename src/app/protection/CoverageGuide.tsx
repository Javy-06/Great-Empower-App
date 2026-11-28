import type { ReactNode } from "react";
import {
  ArrowDown,
  ArrowRight,
  Ban,
  BookOpen,
  BriefcaseBusiness,
  CalendarClock,
  Calculator,
  ClipboardPlus,
  Coins,
  HandCoins,
  Hospital,
  MessagesSquare,
  Receipt,
  ShieldCheck,
  ShieldX,
  Stethoscope,
  TrendingDown,
  UserRound,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { GeIcon } from "@/components/illustrations/GeIcons";
import { ChecklistSpot } from "@/components/illustrations/Spots";
import type { ProtectionCategory, ProtectionSlug } from "@/data/protection";
import type { ProtectionArea } from "@/state/profile";
import { findInfographic } from "@/data/learn-media";
import { splitBill } from "./billSplit";
import { startAdviserRequest } from "../protect/AdviserRequest";

/**
 * "How protection works", per category (Learn → Protection → <category>), in the reference layout:
 *   1 How it works  — a diagram that fits THIS kind of cover (not one template for all)
 *   2 May help with / 3 Doesn't automatically cover — tinted panels, icon tiles, one line each
 *   4 Real-life example (in CategoryView)            5 Learn more — clear next actions
 * Every figure is illustrative and labelled; wording comes from src/data/protection.ts.
 */

const rm = (n: number) => `RM${n.toLocaleString("en-MY")}`;
const go = (hash: string) => {
  window.location.hash = hash;
  window.scrollTo({ top: 0 });
};

/** Learn's category → Protect's area (TPD has no area of its own in Protect). */
export const slugToArea: Partial<Record<ProtectionSlug, ProtectionArea>> = {
  medical: "medical",
  "critical-illness": "critical",
  life: "life",
  "personal-accident": "accident",
};

/** How each kind of cover usually pays, in a few words (used on the hub cards). */
export const paysAs: Record<ProtectionSlug, string> = {
  medical: "Pays eligible bills",
  "critical-illness": "Lump sum on diagnosis",
  life: "Lump sum to your family",
  tpd: "Lump sum if you can't work again",
  "personal-accident": "Set benefits after an accident",
};

/* ====================================================================== 1 How it works */

function SectionHead({ id, overline, title, lead }: { id: string; overline: string; title: string; lead?: string }) {
  return (
    <>
      <p className="flex items-center gap-2 text-overline uppercase tracking-[0.18em] text-teal-700">
        <span className="h-4 w-1 rounded-full bg-teal-600" aria-hidden />
        {overline}
      </p>
      <h2 id={id} className="mt-1 font-brand text-[1.75rem] font-semibold leading-tight text-navy-950 sm:text-[2.125rem]">{title}</h2>
      {lead && <p className="mt-1 max-w-2xl text-body-sm text-ink-secondary">{lead}</p>}
    </>
  );
}

type Node = { icon: typeof Hospital; label: string; value?: string; text: string; tone: string };

/** A row of steps joined by arrows (down on phones, across on wider screens). */
function Chain({ nodes, label }: { nodes: Node[]; label: string }) {
  return (
    <ol aria-label={label} className={cn("grid gap-1 sm:gap-2", nodes.length === 4 ? "sm:grid-cols-4" : "sm:grid-cols-3")}>
      {nodes.map((n, i) => (
        <li key={n.label} className="relative flex flex-col items-stretch">
          <div className="flex h-full items-center gap-3 rounded-2xl bg-surface px-3 py-2.5 ring-1 ring-ink/[0.08] sm:flex-col sm:items-start sm:p-4">
            <span className={cn("inline-flex size-11 shrink-0 items-center justify-center rounded-2xl sm:size-12", n.tone)}>
              <n.icon size={22} aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-caption font-bold uppercase tracking-[0.08em] text-ink-muted">
                {i + 1}. {n.label}
              </span>
              {n.value && <span className="block font-brand text-[1.5rem] font-semibold leading-tight tabular-nums text-navy-950 sm:text-[1.625rem]">{n.value}</span>}
              <span className="block text-body-sm text-navy-950">{n.text}</span>
            </span>
          </div>
          {i < nodes.length - 1 && (
            <>
              <ArrowDown size={16} className="mx-auto -my-0.5 text-ink-muted sm:hidden" aria-hidden />
              <ArrowRight size={18} className="absolute -right-[13px] top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-canvas text-ink-muted sm:block" aria-hidden />
            </>
          )}
        </li>
      ))}
    </ol>
  );
}

/** Medical: Hospital bill → Eligible expenses → Insurance payment → Remaining cost. Reconciles exactly. */
function MedicalFlow() {
  const s = splitBill({ bill: 12_000, notEligibleRate: 0.05, deductible: 500, copayRate: 0.1 });
  const eligible = s.bill - s.notEligible;
  const share = (n: number) => `${(n / s.bill) * 100}%`;
  return (
    <>
      <Chain
        label="How a hospital bill is shared"
        nodes={[
          { icon: Receipt, label: "Hospital bill", value: rm(s.bill), text: "The total for your stay", tone: "bg-navy-900 text-white" },
          { icon: ClipboardPlus, label: "Eligible expenses", value: rm(eligible), text: `${rm(s.notEligible)} isn't eligible (e.g. personal items)`, tone: "bg-navy-50 text-navy-800" },
          { icon: ShieldCheck, label: "Insurance pays", value: rm(s.insurer), text: "Up to the plan's limits", tone: "bg-teal-600 text-white" },
          { icon: Wallet, label: "You pay", value: rm(s.you), text: `Not eligible + ${rm(s.deductible)} deductible + ${rm(s.copay)} co-payment`, tone: "bg-crimson-600 text-white" },
        ]}
      />
      <figure className="mt-3" aria-label={`Of a ${rm(s.bill)} bill, insurance pays ${rm(s.insurer)} and you pay ${rm(s.you)}.`}>
        <div className="flex h-4 overflow-hidden rounded-full" aria-hidden>
          <span className="bg-teal-600" style={{ width: share(s.insurer) }} />
          <span className="bg-crimson-600" style={{ width: share(s.deductible + s.copay) }} />
          <span className="bg-crimson-300" style={{ width: share(s.notEligible) }} />
        </div>
        <figcaption className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-caption text-ink-secondary">
          <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-teal-600" aria-hidden />Insurance {Math.round((s.insurer / s.bill) * 100)}%</span>
          <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-crimson-600" aria-hidden />Your share</span>
          <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-crimson-300" aria-hidden />Not eligible</span>
        </figcaption>
      </figure>
    </>
  );
}

/** Critical illness: Diagnosis → Financial impact → one lump sum (not a salary). */
function CriticalFlow() {
  return (
    <>
      <Chain
        label="How critical illness cover pays"
        nodes={[
          { icon: Stethoscope, label: "Diagnosis", text: "A covered illness, as the policy defines it", tone: "bg-crimson-600 text-white" },
          { icon: TrendingDown, label: "Financial impact", text: "Treatment costs, and income may stop", tone: "bg-gold-500 text-navy-950" },
          { icon: HandCoins, label: "Lump-sum benefit", text: "Paid once. You decide how to use it", tone: "bg-teal-600 text-white" },
        ]}
      />
      <figure className="mt-3 rounded-2xl bg-surface p-4 ring-1 ring-ink/[0.08]" aria-label="A lump sum is paid once at the start, while costs continue every month.">
        <div className="flex h-16 items-end gap-1" aria-hidden>
          <span className="flex h-full w-16 shrink-0 items-start justify-center rounded-t-lg bg-teal-600 pt-1 text-[12px] font-bold leading-tight text-white">Paid once</span>
          {Array.from({ length: 12 }, (_, i) => (
            <span key={i} className="h-1/4 flex-1 rounded-t bg-crimson-300" />
          ))}
        </div>
        <figcaption className="mt-2 flex justify-between gap-3 text-caption text-ink-secondary">
          <span>Lump sum at diagnosis</span>
          <span>Costs keep coming, month after month</span>
        </figcaption>
      </figure>
    </>
  );
}

/** Life: Income → Dependants → Financial support. */
function LifeFlow() {
  return (
    <Chain
      label="How life cover supports a family"
      nodes={[
        { icon: BriefcaseBusiness, label: "Your income", text: "Pays rent, food and family costs today", tone: "bg-navy-900 text-white" },
        { icon: Users, label: "Your dependants", text: "Parents, partner or children who rely on it", tone: "bg-gold-500 text-navy-950" },
        { icon: HandCoins, label: "Financial support", text: "If you die, a lump sum goes to the people you name", tone: "bg-teal-600 text-white" },
      ]}
    />
  );
}

/** TPD: illness or injury → can't work again (definition met) → lump sum. */
function TpdFlow() {
  return (
    <>
      <Chain
        label="How total and permanent disability cover pays"
        nodes={[
          { icon: Zap, label: "Illness or injury", text: "Either cause can count", tone: "bg-crimson-600 text-white" },
          { icon: Ban, label: "Can't work again", text: "Totally and permanently, as the policy defines it", tone: "bg-gold-500 text-navy-950" },
          { icon: HandCoins, label: "Lump-sum benefit", text: "Usually paid once, sometimes in instalments", tone: "bg-teal-600 text-white" },
        ]}
      />
      <p className="mt-3 flex items-center gap-2 rounded-xl bg-sunken/70 px-3 py-2 text-body-sm text-navy-950">
        <CalendarClock size={16} className="shrink-0 text-ink-muted" aria-hidden /> A short, temporary injury usually doesn&apos;t qualify.
      </p>
    </>
  );
}

/** Personal accident: Accident → Injury → Eligible benefit (set by the policy's table). */
function AccidentFlow() {
  return (
    <>
      <Chain
        label="How personal accident cover pays"
        nodes={[
          { icon: Zap, label: "Accident", text: "Sudden and unexpected: not an illness", tone: "bg-crimson-600 text-white" },
          { icon: Hospital, label: "Injury", text: "Treatment, or a lasting disablement", tone: "bg-gold-500 text-navy-950" },
          { icon: HandCoins, label: "Eligible benefit", text: "Medical costs up to a limit, or a set % of the sum insured", tone: "bg-teal-600 text-white" },
        ]}
      />
      <figure className="mt-3 rounded-2xl bg-surface p-4 ring-1 ring-ink/[0.08]" aria-label="The more serious and permanent the injury, the bigger the share of the sum insured, as listed in the policy's table.">
        <p className="text-caption font-semibold text-ink-muted">The policy&apos;s table sets the share (illustrative)</p>
        <ul className="mt-2 grid gap-1.5" aria-hidden>
          {[
            { k: "Minor injury", w: "18%" },
            { k: "Partial disablement", w: "50%" },
            { k: "Total disablement", w: "100%" },
          ].map((r) => (
            <li key={r.k} className="grid grid-cols-[8.5rem_1fr] items-center gap-2 text-caption text-navy-950">
              {r.k}
              <span className="h-3 rounded-full bg-sunken"><span className="block h-full rounded-full bg-teal-600" style={{ width: r.w }} /></span>
            </li>
          ))}
        </ul>
      </figure>
    </>
  );
}

const flowTitle: Record<ProtectionSlug, string> = {
  medical: "From hospital bill to what you pay",
  "critical-illness": "From diagnosis to a lump sum",
  life: "From your income to your family's support",
  tpd: "From an illness or injury to a lump sum",
  "personal-accident": "From an accident to a benefit",
};

export function HowItWorks({ category: c }: { category: ProtectionCategory }) {
  return (
    <section aria-labelledby="how-it-works" className="mt-8">
      <SectionHead id="how-it-works" overline="How it works" title={flowTitle[c.slug]} lead={c.short} />
      <div className="mt-4">
        {c.slug === "medical" && <MedicalFlow />}
        {c.slug === "critical-illness" && <CriticalFlow />}
        {c.slug === "life" && <LifeFlow />}
        {c.slug === "tpd" && <TpdFlow />}
        {c.slug === "personal-accident" && <AccidentFlow />}
      </div>
      <p className="mt-2 text-caption text-ink-muted">Illustrative. Your policy wording decides what is paid.</p>
    </section>
  );
}

/* ====================================================================== 2 + 3 coverage panels */

/** An icon for each "doesn't automatically cover" item, from its short title. */
function limitIcon(title: string) {
  const t = title.toLowerCase();
  if (/pre-existing/.test(t)) return ClipboardPlus;
  if (/waiting|immediate|age/.test(t)) return CalendarClock;
  if (/income|salary/.test(t)) return BriefcaseBusiness;
  if (/cost|share|debt|investment|payout/.test(t)) return Coins;
  if (/hospital|illness/.test(t)) return Hospital;
  if (/activity|temporary/.test(t)) return Ban;
  return ShieldX;
}

export function CoverPanels({ category: c }: { category: ProtectionCategory }) {
  return (
    <div className="mt-8 grid gap-4">
      <section aria-labelledby="may-help-title" className="overflow-hidden rounded-[1.25rem] bg-teal-50/80 ring-1 ring-teal-100">
        <div className="relative flex items-start gap-3 p-4 pr-28 sm:p-5 sm:pr-36">
          <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-e1">
            <ShieldCheck size={24} aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 id="may-help-title" className="text-[1.375rem] font-bold leading-tight text-navy-950 sm:text-[1.625rem]">May help with</h2>
            <p className="mt-0.5 text-body-sm text-ink-secondary">Common things a plan may pay for, up to its limits.</p>
          </div>
          <ChecklistSpot className="absolute -bottom-2 right-3 w-24 sm:w-32" />
        </div>
        <ul className="grid gap-2 bg-white/60 p-2 sm:grid-cols-2 sm:p-3">
          {c.mayHelpTitles.map((title, i) => (
            <li key={title} className="flex gap-3 rounded-2xl bg-surface p-3.5 ring-1 ring-ink/[0.06]">
              <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                <GeIcon name={c.mayHelpIcons[i]} size={24} aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block text-body font-semibold leading-snug text-navy-950">{title}</span>
                <span className="block text-body-sm text-ink-secondary">{c.mayHelp[i]}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="not-cover-title" className="overflow-hidden rounded-[1.25rem] bg-crimson-50/70 ring-1 ring-crimson-100">
        <div className="flex items-start gap-3 p-4 sm:p-5">
          <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-crimson-600 text-white shadow-e1">
            <ShieldX size={24} aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 id="not-cover-title" className="text-[1.375rem] font-bold leading-tight text-crimson-700 sm:text-[1.625rem]">Doesn&apos;t automatically cover</h2>
            <p className="mt-0.5 text-body-sm text-ink-secondary">Common limits and exclusions to check in the policy.</p>
          </div>
        </div>
        <ul className="divide-y divide-crimson-100 bg-white/70 px-3 sm:px-4">
          {c.notAutomaticTitles.map((title, i) => {
            const Icon = limitIcon(title);
            return (
              <li key={title} className="grid grid-cols-[2.75rem_1fr] items-start gap-x-3 py-3 sm:grid-cols-[2.75rem_11rem_1fr] sm:items-center">
                <span className="inline-flex size-11 items-center justify-center rounded-xl bg-crimson-50 text-crimson-600"><Icon size={20} aria-hidden /></span>
                <span className="min-w-0 pt-0.5 sm:contents">
                  <span className="block text-body font-semibold text-navy-950 sm:border-r sm:border-crimson-200 sm:pr-3">{title}</span>
                  <span className="block text-body-sm text-ink-secondary">{c.notAutomatic[i]}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

/* ====================================================================== 4 real-life example */

export function ExampleCard({ category: c, children }: { category: ProtectionCategory; children?: ReactNode }) {
  const name = /^([A-Z][a-z]+), (\d+)/.exec(c.example.text);
  return (
    <section aria-labelledby="example-title" className="mt-10">
      <SectionHead id="example-title" overline="Real-life example" title={name ? `${name[1]}'s story` : "An example"} />
      <div className="mt-4 flex gap-3 rounded-2xl bg-gold-50 p-4 ring-1 ring-gold-100">
        <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-gold-100 font-brand text-[1.375rem] font-semibold text-navy-950" aria-hidden>
          {name ? name[1][0] : <UserRound size={20} />}
        </span>
        <p className="text-body-sm text-navy-950">
          <span className="block text-caption font-bold uppercase tracking-[0.08em] text-gold-700">Illustrative{name ? ` · age ${name[2]}` : ""}</span>
          {c.example.text}
        </p>
      </div>
      {children}
    </section>
  );
}

/* ====================================================================== 5 learn more */

export function LearnMore({ category: c }: { category: ProtectionCategory }) {
  const area = slugToArea[c.slug];
  const infographic = c.infographicId ? findInfographic(c.infographicId) : undefined;
  const actions: Array<{ icon: typeof Calculator; title: string; text: string; run: () => void; primary?: boolean }> = [];
  if (c.scenario) actions.push({ icon: Calculator, title: c.scenario.label, text: c.scenario.text, run: () => go(c.scenario!.href), primary: true });
  if (infographic) actions.push({ icon: BookOpen, title: infographic.title, text: "Visual guide. Pass its quiz to earn points.", run: () => go(`app/learn/infographic/${infographic.id}`) });
  actions.push({
    icon: ShieldCheck,
    title: area ? `Explore ${c.purpose.toLowerCase()}` : "Explore cover options",
    text: "Understand it, get ready, then apply in the app.",
    run: () => go(area ? `app/protect/get-cover/${area}` : "app/protect/get-cover"),
  });
  actions.push({ icon: MessagesSquare, title: "Talk to an adviser", text: "Prepare a request for a licensed adviser.", run: () => startAdviserRequest(area) });
  return (
    <section aria-labelledby="learn-more-title" className="mt-10">
      <SectionHead id="learn-more-title" overline="Learn more" title="Your next step" />
      <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
        {actions.map(({ icon: Icon, title, text, run, primary }) => (
          <li key={title}>
            <button
              type="button"
              onClick={run}
              className={cn(
                "group flex h-full w-full items-center gap-3 rounded-2xl p-4 text-left transition-shadow hover:shadow-e2",
                primary ? "bg-navy-950 text-white" : "bg-surface ring-1 ring-ink/[0.08]",
              )}
            >
              <span className={cn("inline-flex size-12 shrink-0 items-center justify-center rounded-2xl", primary ? "bg-white/10 text-white" : "bg-navy-50 text-navy-800")}>
                <Icon size={22} aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className={cn("block text-body font-semibold", primary ? "text-white" : "text-navy-950")}>{title}</span>
                <span className={cn("block text-caption", primary ? "text-white/80" : "text-ink-secondary")}>{text}</span>
              </span>
              <ArrowRight size={18} className={cn("shrink-0 transition-transform group-hover:translate-x-0.5", primary ? "text-white" : "text-crimson-600")} aria-hidden />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
