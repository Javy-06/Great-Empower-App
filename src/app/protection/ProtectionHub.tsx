import { useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  Check,
  ChevronDown,
  CircleAlert,
  ExternalLink,
  FileSearch,
  FileText,
  Info,
  Landmark,
  Minus,
  PiggyBank,
  Receipt,
  Scale,
  ShieldCheck,
  ShieldX,
  TrendingUp,
  UserRound,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import { Container } from "@/components/layout/Editorial";
import { PageHero } from "@/components/layout/PageHero";
import { cn } from "@/lib/cn";
import { findInfographic } from "@/data/learn-media";
import { TermExplainer } from "./TermExplainer";
import { AccidentStory, BillSplitter, CiTimeline, FamilyMap } from "./CategoryStories";
import { AccidentIcon, CriticalIllnessIcon, FamilyIcon, GeIcon, IncomeIcon, MedicalIcon, type GeIconName, type IconLike } from "@/components/illustrations/GeIcons";
import {
  AccidentSpot,
  AdviserSpot,
  ChecklistSpot,
  DiagnosisSpot,
  FamilyUmbrellaSpot,
  HospitalSpot,
  IncomePauseSpot,
  LaptopSpot,
  OfficeSpot,
} from "@/components/illustrations/Spots";
import {
  PRODUCT_RESEARCH_DATE,
  findProtectionCategory,
  productsFor,
  protectionCategories,
  protectionSources,
  researchedProducts,
  type ProtectionCategory,
  type ProtectionSlug,
  type ResearchedProduct,
  type Source,
} from "@/data/protection";

const go = (hash: string) => {
  window.location.hash = hash;
  window.scrollTo({ top: 0 });
};

export const PROTECTION_HASH = "app/learn/protection";

export const categoryIcons: Record<ProtectionSlug, IconLike> = {
  medical: MedicalIcon,
  "critical-illness": CriticalIllnessIcon,
  life: FamilyIcon,
  tpd: IncomeIcon,
  "personal-accident": AccidentIcon,
};
const categorySpots: Record<ProtectionSlug, (p: { className?: string }) => ReactNode> = {
  medical: HospitalSpot,
  "critical-illness": DiagnosisSpot,
  life: FamilyUmbrellaSpot,
  tpd: IncomePauseSpot,
  "personal-accident": AccidentSpot,
};
export const categoryTones: Record<ProtectionSlug, string> = {
  medical: "bg-crimson-50 text-crimson-600",
  "critical-illness": "bg-gold-50 text-gold-700",
  life: "bg-navy-50 text-navy-700",
  tpd: "bg-teal-50 text-teal-700",
  "personal-accident": "bg-sunken text-navy-800",
};

/** `#app/learn/protection` (hub) and `#app/learn/protection/<slug>` (category). */
export function ProtectionExplained({ slug }: { slug?: ProtectionSlug }) {
  const category = slug ? findProtectionCategory(slug) : undefined;
  return category ? <CategoryView category={category} /> : <HubView />;
}

/* =========================================================================== hub */

function HubView() {
  return (
    <>
      <PageHero
        eyebrow="Protection explained"
        title="A bad day shouldn't wreck your finances."
        text="Five kinds of cover, explained in pictures."
        image="/images/pexels/family-protection-conversation.webp"
        imagePosition="55% 30%"
        backLabel="Learn"
        onBack={() => go("app/learn")}
        titleId="protection-title"
      />

      {/* 1 — The big picture */}
      <Container className="relative -mt-6 max-w-[60rem]">
        <section aria-labelledby="big-picture" className="rounded-2xl bg-surface p-4 shadow-e2 ring-1 ring-ink/[0.06] sm:p-6">
          <h2 id="big-picture" className="sr-only">Why protection matters</h2>
          <ol className="grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-4">
            {[
              { icon: UserRound, label: "You", text: "Studying, working, saving", tone: "bg-navy-900 text-white" },
              { icon: Zap, label: "Something happens", text: "Illness, accident, losing income", tone: "bg-gold-500 text-navy-950" },
              { icon: Wallet, label: "Costs hit", text: "Bills grow, savings drain", tone: "bg-crimson-600 text-white" },
              { icon: ShieldCheck, label: "Protection helps", text: "Pays part of the cost, as agreed", tone: "bg-teal-600 text-white" },
            ].map(({ icon: Icon, label, text, tone }, i) => (
              <li key={label} className="relative flex flex-col items-start">
                <span className={cn("inline-flex size-12 items-center justify-center rounded-2xl", tone)}>
                  <Icon size={22} aria-hidden />
                </span>
                {i < 3 && <ArrowRight size={16} className="absolute left-14 top-4 hidden text-ink-muted sm:block" aria-hidden />}
                <span className="mt-2 text-body-sm font-semibold text-navy-950">{label}</span>
                <span className="text-caption text-ink-muted">{text}</span>
              </li>
            ))}
          </ol>
        </section>
      </Container>

      {/* 2 + 3 — What can happen → which cover helps */}
      <Section id="what-happens" overline="What can happen" title="Five risks, five kinds of cover">
        <ul className="grid gap-2">
          {protectionCategories.map((c) => (
            <li key={c.slug}>
              <RiskRow category={c} />
            </li>
          ))}
        </ul>
        <p className="mt-3 flex items-start gap-2 text-caption text-ink-muted">
          <Info size={14} className="mt-0.5 shrink-0" aria-hidden />
          <span>
            Each cover has two names: the <strong className="font-semibold text-navy-900">purpose</strong> (what it helps with) and the{" "}
            <strong className="font-semibold text-navy-900">official category</strong> you'll see on a policy.
          </span>
        </p>
      </Section>

      {/* 4 — Savings ≠ insurance ≠ investing */}
      <Section id="money-tools" overline="Different tools" title="Savings, insurance and investing do different jobs">
        <MoneyToolsCompare />
      </Section>

      {/* 5 — How a medical bill is shared */}
      <Section id="bill" overline="Medical insurance, step by step" title="Having cover doesn't mean a zero bill">
        <BillBreakdown />
      </Section>

      {/* 6 — Before you buy */}
      <Section id="before-buy" overline="Before you buy" title="Eight questions to ask">
        <BuyChecklist />
      </Section>

      {/* 7 — Where to get protection */}
      <Section id="channels" overline="Where to get it" title="Three ways people get cover">
        <Channels />
      </Section>

      {/* If something goes wrong + research note */}
      <Container className="mt-10 max-w-[60rem]">
        <div className="grid gap-2 sm:grid-cols-2">
          <button type="button" onClick={() => go(`${PROTECTION_HASH}/products`)} className="group flex w-full items-center gap-4 rounded-2xl bg-navy-950 p-4 text-left text-white shadow-e2 sm:col-span-2">
            <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/10"><Scale size={22} aria-hidden /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-body font-semibold">Explore and compare products</span>
              <span className="block text-caption text-white/80">Verified facts side by side — no rankings or prices.</span>
            </span>
            <ArrowRight size={18} className="shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </button>
          <LinkRow icon={Scale} title="A dispute with your insurer?" text="After its final decision, you can go to FMOS." source={protectionSources.fmos} />
          <LinkRow icon={Landmark} title="If an insurer fails" text="PIDM protects eligible benefits, up to set limits." source={protectionSources.pidm} />
        </div>
        <p className="mt-4 text-caption text-ink-muted">
          Each category lists Great Eastern products we could verify in official documents ({researchedProducts.filter((p) => p.evidence === "VERIFIED_OFFICIAL").length}, checked {PRODUCT_RESEARCH_DATE}). Independent education — not affiliated with Great Eastern, and not a recommendation or quote.
        </p>
      </Container>
      <div className="pb-6" />
    </>
  );
}

function Section({ id, overline, title, children }: { id: string; overline: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="mt-12">
      <Container className="max-w-[60rem]">
        <p className="text-overline uppercase tracking-[0.18em] text-teal-700">{overline}</p>
        <h2 id={id} className="mt-1 font-brand text-[1.75rem] font-semibold leading-tight text-navy-950 sm:text-[2.125rem]">{title}</h2>
        <div className="mt-4">{children}</div>
      </Container>
    </section>
  );
}

function RiskRow({ category: c }: { category: ProtectionCategory }) {
  const Spot = categorySpots[c.slug];
  return (
    <button
      type="button"
      onClick={() => go(`${PROTECTION_HASH}/${c.slug}`)}
      className="group grid w-full grid-cols-[4.5rem_1fr_auto] items-center gap-3 rounded-2xl bg-surface p-2.5 pr-3 text-left ring-1 ring-ink/[0.08] transition-shadow hover:shadow-e2 sm:grid-cols-[5rem_1fr_1.1fr_auto] sm:gap-4"
    >
      <Spot className="w-[4.5rem] sm:w-20" />
      <span className="min-w-0">
        <span className="block text-body-sm font-semibold text-navy-950">{c.event}</span>
        <span className="flex items-center gap-1 text-caption text-crimson-700">
          <ArrowRight size={12} aria-hidden /> {c.problem}
        </span>
        {/* Mobile: the cover sits under the risk */}
        <span className="mt-1.5 inline-flex flex-wrap items-center gap-1.5 sm:hidden">
          <ShieldCheck size={13} className="text-teal-700" aria-hidden />
          <span className="text-caption font-semibold text-teal-800">{c.purpose}</span>
        </span>
      </span>
      <span className="hidden min-w-0 sm:block">
        <span className="flex items-center gap-1.5 text-body-sm font-semibold text-teal-800">
          <ShieldCheck size={15} aria-hidden /> {c.purpose}
        </span>
        <span className="block text-caption text-ink-muted">{c.official}</span>
      </span>
      <ArrowRight size={18} className="shrink-0 text-navy-700 transition-transform group-hover:translate-x-0.5" aria-hidden />
    </button>
  );
}

type Mark = "yes" | "no" | "some";
function MoneyToolsCompare() {
  const tools = [
    { icon: PiggyBank, name: "Savings", line: "Money you already have", tone: "bg-teal-600 text-white" },
    { icon: ShieldCheck, name: "Insurance", line: "Protection against specific risks", tone: "bg-navy-900 text-white" },
    { icon: TrendingUp, name: "Investing", line: "May grow — or fall", tone: "bg-gold-500 text-navy-950" },
  ];
  const rows: Array<{ q: string; v: [Mark, Mark, Mark] }> = [
    { q: "Use it any time", v: ["yes", "no", "some"] },
    { q: "Pays a big sum for a covered event", v: ["no", "yes", "no"] },
    { q: "Can grow over time", v: ["some", "no", "yes"] },
    { q: "Can lose value", v: ["no", "no", "yes"] },
  ];
  const markLabel: Record<Mark, string> = { yes: "Yes", no: "No", some: "Partly" };
  // One grid template for the header and every row, so marks always sit under their tool.
  // Mobile: the question spans the full width above three equal mark columns.
  const grid = "grid grid-cols-3 sm:grid-cols-[34%_1fr_1fr_1fr]";
  return (
    <div role="table" aria-label="How savings, insurance and investing compare" className="overflow-hidden rounded-2xl bg-surface ring-1 ring-ink/[0.08]">
      <div role="row" className={cn(grid, "border-b border-ink/10")}>
        <span role="columnheader" className="hidden sm:block"><span className="sr-only">Question</span></span>
        {tools.map(({ icon: Icon, name, line, tone }) => (
          <div key={name} role="columnheader" className="flex flex-col items-center px-2 py-4 text-center">
            <span className={cn("inline-flex size-11 items-center justify-center rounded-2xl", tone)}><Icon size={20} aria-hidden /></span>
            <span className="mt-2 text-body-sm font-bold text-navy-950">{name}</span>
            <span className="text-[11px] leading-snug text-ink-muted sm:text-caption">{line}</span>
          </div>
        ))}
      </div>
      {rows.map((r) => (
        <div key={r.q} role="row" className={cn(grid, "items-center border-b border-ink/[0.06] last:border-0")}>
          <span role="rowheader" className="col-span-3 px-3 pt-2.5 text-caption font-semibold text-navy-950 sm:col-span-1 sm:py-2.5">{r.q}</span>
          {r.v.map((m, i) => (
            <span key={i} role="cell" className="flex justify-center py-2">
              <span className="sr-only">{markLabel[m]}</span>
              {m === "yes" ? <Check size={18} className="text-teal-700" aria-hidden /> : m === "no" ? <X size={18} className="text-ink-muted" aria-hidden /> : <Minus size={18} className="text-gold-700" aria-hidden />}
            </span>
          ))}
        </div>
      ))}
      <p className="border-t border-ink/10 bg-sunken/60 px-3 py-2.5 text-caption text-ink-secondary">
        Investment-linked insurance mixes protection and investing, so its values aren't guaranteed.
      </p>
    </div>
  );
}

/** Illustrative example bill (not a real plan) showing why cover ≠ a zero bill. */
const BILL = { total: 12_000, notCovered: 600, deductible: 500, copayPct: 10 };
function BillBreakdown() {
  const eligible = BILL.total - BILL.notCovered - BILL.deductible;
  const copay = (eligible * BILL.copayPct) / 100;
  const insurer = eligible - copay;
  const you = BILL.notCovered + BILL.deductible + copay;
  const rm = (n: number) => `RM${n.toLocaleString("en-MY")}`;
  const lines: Array<{ label: string; hint: string; amount: number; who: "you" | "insurer" }> = [
    { label: "Not covered", hint: "Items the policy excludes", amount: BILL.notCovered, who: "you" },
    { label: "Deductible", hint: "You pay this first", amount: BILL.deductible, who: "you" },
    { label: `Co-payment (${BILL.copayPct}%)`, hint: "Your share of the rest", amount: copay, who: "you" },
    { label: "Insurer pays", hint: "Within the plan's limits", amount: insurer, who: "insurer" },
  ];
  return (
    <figure className="overflow-hidden rounded-2xl bg-surface ring-1 ring-ink/[0.08]">
      <div className="flex items-center justify-between gap-3 bg-navy-950 px-4 py-3 text-white">
        <span className="flex items-center gap-2 whitespace-nowrap text-body-sm font-semibold"><HospitalSpot onDark className="-my-2 w-12 shrink-0" /> Hospital bill</span>
        <span className="font-brand text-[1.75rem] font-bold tabular-nums">{rm(BILL.total)}</span>
      </div>
      <ol className="divide-y divide-ink/[0.06]">
        {lines.map((l) => (
          <li key={l.label} className="flex items-center gap-3 px-4 py-2.5">
            <span className={cn("size-3 shrink-0 rounded-sm", l.who === "you" ? "bg-crimson-600" : "bg-navy-900")} aria-hidden />
            <span className="min-w-0 flex-1">
              <span className="block text-body-sm font-semibold text-navy-950">{l.label}</span>
              <span className="block text-caption text-ink-muted">{l.hint}</span>
            </span>
            <span className={cn("text-body-sm font-bold tabular-nums", l.who === "you" ? "text-crimson-700" : "text-navy-900")}>{rm(l.amount)}</span>
          </li>
        ))}
      </ol>
      <div className="px-4 pb-4 pt-2">
        <div className="flex h-4 w-full overflow-hidden rounded-full" aria-hidden>
          <div className="bg-crimson-600" style={{ width: `${(you / BILL.total) * 100}%` }} />
          <div className="flex-1 bg-navy-900" />
        </div>
        <p className="mt-3 flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-body-sm font-semibold text-navy-950">You pay</span>
          <span className="font-brand text-[2rem] font-bold leading-none tabular-nums text-crimson-600">{rm(you)}</span>
        </p>
        <figcaption className="mt-2 text-caption text-ink-muted">
          Illustrative example, not a real plan. Plans differ: some have no co-payment, and limits can leave more for you to pay.
        </figcaption>
        <button type="button" onClick={() => go("app/simulate/needs/tool-bill")} className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-body-sm font-semibold text-crimson-600">
          Try it with your own bill <ArrowRight size={16} aria-hidden />
        </button>
      </div>
    </figure>
  );
}

const CHECKS: Array<{ icon: typeof Receipt; q: string; a: string }> = [
  { icon: FileText, q: "What's covered?", a: "Check the benefits in the Product Disclosure Sheet (PDS). The policy wording decides." },
  { icon: ShieldX, q: "What's excluded?", a: "Pre-existing conditions and listed exclusions aren't paid." },
  { icon: Receipt, q: "Annual limit?", a: "The most the plan pays in one year." },
  { icon: Wallet, q: "Deductible?", a: "An amount you pay first, before the plan pays." },
  { icon: Scale, q: "Co-payment?", a: "A share of each bill you pay yourself, e.g. 10%." },
  { icon: CalendarClock, q: "Waiting period?", a: "Illness soon after cover starts may not be covered." },
  { icon: TrendingUp, q: "Can premiums rise?", a: "Yes — medical premiums can be revised at renewal." },
  { icon: FileSearch, q: "How do I claim?", a: "Panel hospitals can bill the insurer with a guarantee letter; otherwise pay first and claim." },
];
function BuyChecklist() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <>
      <div className="grid items-center gap-4 lg:grid-cols-[1fr_11rem]">
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {CHECKS.map(({ icon: Icon, q }, i) => (
          <li key={q}>
            <button
              type="button"
              aria-expanded={open === i}
              aria-controls="check-answer"
              onClick={() => setOpen(open === i ? null : i)}
              className={cn(
                "flex min-h-14 w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-body-sm font-semibold transition-colors",
                open === i ? "bg-navy-900 text-white" : "bg-surface text-navy-950 ring-1 ring-ink/[0.08] hover:ring-ink/20",
              )}
            >
              <Icon size={18} className={cn("shrink-0", open === i ? "text-teal-200" : "text-teal-700")} aria-hidden />
              {q}
            </button>
          </li>
        ))}
      </ul>
      <ChecklistSpot className="hidden lg:block" />
      </div>
      <div id="check-answer" aria-live="polite" className="min-h-[3.25rem]">
        {open !== null && (
          <p className="ge-reveal mt-2 rounded-xl bg-teal-50 px-4 py-3 text-body-sm text-navy-950">
            <span className="font-semibold">{CHECKS[open].q}</span> {CHECKS[open].a}
          </p>
        )}
        {open === null && <p className="mt-2 px-1 text-caption text-ink-muted">Tap a question for a one-line answer.</p>}
      </div>
      <div className="mt-2 flex gap-3 rounded-xl bg-gold-50 px-4 py-3 ring-1 ring-gold-100">
        <CircleAlert size={18} className="mt-0.5 shrink-0 text-gold-700" aria-hidden />
        <div className="text-body-sm text-navy-950">
          <p><span className="font-semibold">Answer health questions honestly.</span> Not disclosing a condition is one of the biggest reasons hospital guarantee letters are declined.</p>
          <SourceLink source={protectionSources.star} className="mt-1" />
        </div>
      </div>
      <p className="mt-2 text-caption text-ink-muted">
        Changed your mind? Most new life and medical policies have a free-look period (usually 15 days).{" "}
        <SourceLink source={protectionSources.glossary} />
      </p>
    </>
  );
}

function Channels() {
  const channels = [
    { spot: LaptopSpot, title: "Online, direct", text: "Some simple plans — term life, critical illness or medical — are sold on insurers' own websites." },
    { spot: AdviserSpot, title: "Agent or adviser", text: "Guidance for complex plans. Some products are only sold this way." },
    { spot: OfficeSpot, title: "Your employer", text: "Group cover from your job — it usually ends when you leave." },
  ];
  return (
    <>
      <ul className="grid gap-2 sm:grid-cols-3">
        {channels.map(({ spot: Spot, title, text }) => (
          <li key={title} className="flex items-center gap-3 rounded-2xl bg-surface p-3 ring-1 ring-ink/[0.08] sm:flex-col sm:items-start sm:p-4">
            <Spot className="w-24 shrink-0 sm:w-28" />
            <span>
              <span className="block text-body-sm font-semibold text-navy-950">{title}</span>
              <span className="block text-caption text-ink-secondary">{text}</span>
            </span>
          </li>
        ))}
      </ul>
      <Disclosure title="Good to know">
        <ul className="grid gap-2 text-body-sm text-ink-secondary">
          <li>BNM introduced commission-free standalone protection sold directly — term life from July 2017, critical illness and medical from July 2018. <SourceLink source={protectionSources.bnmDirect} /></li>
          <li>Online or not, eligibility rules apply: age, residency, health and occupation. Some applicants need full underwriting.</li>
          <li>Takaful works on shared contributions and is open to non-Muslims.</li>
          <li>GREAT EMPOWER doesn't sell insurance, give quotes or recommend products.</li>
        </ul>
      </Disclosure>
    </>
  );
}

function LinkRow({ icon: Icon, title, text, source }: { icon: typeof Scale; title: string; text: string; source: Source }) {
  return (
    <a href={source.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl bg-surface p-3 ring-1 ring-ink/[0.08] hover:ring-ink/20">
      <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-sunken text-navy-800"><Icon size={18} aria-hidden /></span>
      <span className="min-w-0 flex-1">
        <span className="block text-body-sm font-semibold text-navy-950">{title}</span>
        <span className="block text-caption text-ink-secondary">{text}</span>
      </span>
      <ExternalLink size={15} className="shrink-0 text-ink-muted" aria-hidden />
      <span className="sr-only">(opens {source.label} in a new tab)</span>
    </a>
  );
}

/* =========================================================================== category */

function CategoryView({ category: c }: { category: ProtectionCategory }) {
  const Icon = categoryIcons[c.slug];
  const index = protectionCategories.findIndex((x) => x.slug === c.slug);
  const prev = protectionCategories[index - 1];
  const next = protectionCategories[index + 1];
  const infographic = c.infographicId ? findInfographic(c.infographicId) : undefined;
  const products = productsFor(c.slug);

  return (
    <>
      <section aria-labelledby="category-title" className="ge-pagehero relative isolate overflow-hidden text-white">
        <div className="ge-pagehero-art pointer-events-none absolute right-0 top-0 -z-10 h-[24rem] w-[78%] sm:h-full sm:w-[52%]" aria-hidden>
          <img src={c.photo.src} alt="" decoding="async" className="h-full w-full object-cover brightness-[0.78] saturate-[0.9]" style={{ objectPosition: c.photo.position }} />
        </div>
        <Container className="max-w-[56rem] pb-7 pt-3 md:pt-10">
          <button type="button" onClick={() => go(PROTECTION_HASH)} className="-ml-2 inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-body-sm font-semibold text-white/85 hover:text-white">
            <ArrowLeft size={18} aria-hidden /> Protection explained
          </button>
          <div className="mt-3 flex items-start gap-4">
            <span className={cn("inline-flex size-14 shrink-0 items-center justify-center rounded-2xl", categoryTones[c.slug])}>
              <Icon size={26} aria-hidden />
            </span>
            <div className="min-w-0 max-w-[15rem] sm:max-w-none">
              <h1 id="category-title" className="font-brand text-[2.25rem] font-semibold leading-[1.05] [text-shadow:0_1px_12px_rgb(10_28_51/0.45)] sm:text-[2.75rem]">{c.purpose}</h1>
              <p className="mt-2 inline-flex flex-wrap items-center gap-2 text-body-sm">
                <span className="rounded-md bg-white/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.06em] text-white/80">Official category</span>
                <span className="font-semibold">{c.official}</span>
              </p>
            </div>
          </div>
          <p className="mt-4 max-w-[34rem] text-body text-white/85 [text-shadow:0_1px_10px_rgb(10_28_51/0.5)]">{c.summary}</p>
          {/* Key idea, right under the hero */}
          {c.notEqual.map((n) => (
            <p key={n.a} className="mt-5 max-w-[36rem] rounded-2xl bg-navy-950/70 p-4 ring-1 ring-white/10 backdrop-blur-sm">
              <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-brand text-[1.375rem] font-semibold leading-tight">
                <span>{n.a}</span>
                <span className="text-crimson-300" aria-hidden>≠</span>
                <span className="sr-only">{" is not the same as "}</span>
                <span>{n.b}</span>
              </span>
              <span className="mt-1 block text-body-sm text-white/70">{n.why}</span>
            </p>
          ))}
        </Container>
      </section>

      <Container className="mt-6 max-w-[56rem]">
        <div className="grid gap-3 md:grid-cols-2">
          <ListCard title="May help with" items={c.mayHelp} titles={c.mayHelpTitles} icons={c.mayHelpIcons} tone="good" />
          <ListCard title="Doesn't automatically cover" items={c.notAutomatic} titles={c.notAutomaticTitles} tone="bad" />
        </div>

        {/* Categories with a visual story below tell their example there; the text example stays for the others. */}
        {!["medical", "critical-illness", "life", "personal-accident"].includes(c.slug) && (
          <div className="mt-4 flex gap-3 rounded-2xl bg-gold-50 p-4 ring-1 ring-gold-100">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-gold-100 text-gold-700"><UserRound size={18} aria-hidden /></span>
            <p className="text-body-sm text-navy-950">
              <span className="block text-caption font-bold uppercase tracking-[0.08em] text-gold-700">Example (illustrative)</span>
              {c.example.text}
            </p>
          </div>
          )}
      </Container>

      <Container className="max-w-[56rem]">
        {c.slug === "medical" && (
          <>
            <BillSplitter />
            <TermExplainer />
          </>
        )}
        {c.slug === "critical-illness" && <CiTimeline />}
        {c.slug === "life" && <FamilyMap />}
        {c.slug === "personal-accident" && <AccidentStory />}
      </Container>

      <Container className="mt-10 max-w-[56rem]">
        <p className="text-overline uppercase tracking-[0.18em] text-teal-700">Myth or fact?</p>
        <h2 className="mt-1 font-brand text-[1.75rem] font-semibold leading-tight text-navy-950">Tap a myth to see the facts</h2>
        <ul className="mt-3 grid gap-2">
          {c.misunderstandings.map((m) => (
            <li key={m.myth}>
              <details className="group rounded-2xl bg-surface ring-1 ring-ink/[0.08] open:ring-teal-600/40">
                <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-4 py-3 text-body-sm font-semibold text-navy-950">
                  <CircleAlert size={18} className="shrink-0 text-crimson-600" aria-hidden />
                  <span className="flex-1"><span className="sr-only">Myth: </span>{m.myth}</span>
                  <ChevronDown size={18} className="shrink-0 text-ink-muted transition-transform group-open:rotate-180" aria-hidden />
                </summary>
                <p className="mx-3 mb-3 flex gap-2 rounded-xl bg-teal-50 px-3 py-2.5 text-body-sm text-navy-950">
                  <BadgeCheck size={18} className="mt-0.5 shrink-0 text-teal-700" aria-hidden />
                  <span><span className="font-semibold text-teal-800">Fact: </span>{m.reality}</span>
                </p>
              </details>
            </li>
          ))}
        </ul>
      </Container>

      <Container className="mt-10 grid max-w-[56rem] gap-3 md:grid-cols-2">
        {infographic ? (
          <button type="button" onClick={() => go(`app/learn/infographic/${infographic.id}`)} className="group flex items-center gap-3 rounded-2xl bg-surface p-3 text-left ring-1 ring-ink/[0.07] hover:shadow-e2">
            <img src={infographic.thumb} alt="" loading="lazy" className={cn("ge-skeleton shrink-0 rounded-xl object-cover ring-1 ring-ink/[0.06]", infographic.orientation === "landscape" ? "h-20 w-28" : "h-24 w-20")} />
            <span className="min-w-0 flex-1">
              <span className="block text-caption font-bold uppercase tracking-[0.08em] text-ink-muted">Visual guide</span>
              <span className="block text-body font-semibold text-navy-950">{infographic.title}</span>
              <span className="block text-caption text-ink-secondary">Pass its quiz to earn points.</span>
            </span>
            <ArrowRight size={18} className="shrink-0 text-navy-700" aria-hidden />
          </button>
        ) : (
          <LumpSumVsIncome />
        )}
        {c.scenario && (
          <button type="button" onClick={() => go(c.scenario!.href)} className="group flex items-center gap-3 rounded-2xl bg-crimson-600 p-4 text-left text-white hover:bg-crimson-700">
            <span className="min-w-0 flex-1">
              <span className="block text-caption font-bold uppercase tracking-[0.08em] text-white/90">Try it</span>
              <span className="block text-body font-semibold">{c.scenario.label}</span>
              <span className="block text-caption text-white/90">{c.scenario.text}</span>
            </span>
            <ArrowRight size={18} className="shrink-0" aria-hidden />
          </button>
        )}
      </Container>

      <Container className="mt-10 grid max-w-[56rem] gap-2">
        {c.malaysia && (
          <Disclosure title={`In Malaysia (${c.malaysia.length})`} icon={Landmark}>
            <ul className="grid gap-3">
              {c.malaysia.map((m) => (
                <li key={m.text} className="text-body-sm text-navy-950">
                  {m.text} <SourceLink source={m.source} className="mt-0.5" />
                </li>
              ))}
            </ul>
          </Disclosure>
        )}
        <Disclosure title={`Products in our research (${products.length})`} icon={FileText}>
          <p className="text-caption text-ink-muted">
            Great Eastern products, in no particular order. Facts checked in official pages and PDSs on {PRODUCT_RESEARCH_DATE}. Not a recommendation or quote; not affiliated with Great Eastern.
          </p>
          {products.length ? (
            <>
            <ul className="mt-3 grid gap-2">
              {products.map((p) => (
                <li key={p.id}><ProductRow product={p} /></li>
              ))}
            </ul>
            <button type="button" onClick={() => go(`${PROTECTION_HASH}/products`)} className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-body-sm font-semibold text-crimson-600">
              <Scale size={16} aria-hidden /> Compare products side by side
            </button>
            </>
          ) : (
            <p className="mt-3 text-body-sm text-ink-secondary">No product in this category has officially verified facts in our research yet.</p>
          )}
        </Disclosure>
        <Disclosure title={`Sources (${c.sources.length})`} icon={ExternalLink}>
          <ul className="grid gap-1.5">
            {c.sources.map((s) => (
              <li key={s.url}><SourceLink source={s} /></li>
            ))}
          </ul>
        </Disclosure>
      </Container>

      <Container className="mt-8 max-w-[56rem]">
        <nav aria-label="Other categories" className="grid grid-cols-2 gap-3">
          {prev ? (
            <button type="button" onClick={() => go(`${PROTECTION_HASH}/${prev.slug}`)} className="flex min-h-16 flex-col items-start justify-center rounded-2xl bg-surface px-4 text-left ring-1 ring-ink/[0.07]">
              <span className="inline-flex items-center gap-1 text-caption text-ink-muted"><ArrowLeft size={14} aria-hidden /> Previous</span>
              <span className="text-body-sm font-semibold text-navy-950">{prev.purpose}</span>
            </button>
          ) : <span />}
          {next ? (
            <button type="button" onClick={() => go(`${PROTECTION_HASH}/${next.slug}`)} className="flex min-h-16 flex-col items-end justify-center rounded-2xl bg-surface px-4 text-right ring-1 ring-ink/[0.07]">
              <span className="inline-flex items-center gap-1 text-caption text-ink-muted">Next <ArrowRight size={14} aria-hidden /></span>
              <span className="text-body-sm font-semibold text-navy-950">{next.purpose}</span>
            </button>
          ) : <span />}
        </nav>
        <p className="mt-6 pb-6 text-caption text-ink-muted">
          General education — not advice, a quote or a promise of cover. The policy wording decides what is paid. For personal advice, speak to a licensed adviser.{" "}
          Photo: <a href={c.photo.credit.url} target="_blank" rel="noreferrer" className="underline underline-offset-2">{c.photo.credit.photographer} / Pexels<span className="sr-only"> (opens in a new tab)</span></a>.
        </p>
      </Container>
    </>
  );
}

/** Covered / not-covered list: icon tile + short title + one supporting line per item. */
function ListCard({ title, items, titles, icons, tone }: { title: string; items: string[]; titles: string[]; icons?: GeIconName[]; tone: "good" | "bad" }) {
  const good = tone === "good";
  return (
    <section className={cn("rounded-2xl p-4", good ? "bg-surface ring-1 ring-ink/[0.08]" : "bg-crimson-50/70 ring-1 ring-crimson-100")} aria-label={title}>
      <h2 className={cn("flex items-center gap-2 text-body font-semibold", good ? "text-teal-800" : "text-crimson-700")}>
        {good ? <Check size={18} aria-hidden /> : <X size={18} aria-hidden />} {title}
      </h2>
      <ul className="mt-3 grid gap-3">
        {items.map((it, i) => (
          <li key={it} className="flex gap-3">
            <span className={cn("inline-flex size-10 shrink-0 items-center justify-center rounded-xl", good ? "bg-teal-50 text-teal-700" : "bg-white text-crimson-600")}>
              {good && icons ? <GeIcon name={icons[i]} size={20} aria-hidden /> : <X size={18} strokeWidth={2.25} aria-hidden />}
            </span>
            <span className="min-w-0 pt-0.5">
              <span className="block text-body-sm font-semibold text-navy-950">{titles[i]}</span>
              <span className="block text-caption text-ink-secondary">{it}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** For TPD (no infographic): how a lump sum differs from a monthly income. */
function LumpSumVsIncome() {
  return (
    <figure className="rounded-2xl bg-surface p-4 ring-1 ring-ink/[0.07]" aria-label="Illustration: a lump sum is paid once and then drawn down, while an income benefit pays a regular amount each month.">
      <p className="text-caption font-bold uppercase tracking-[0.08em] text-ink-muted">Lump sum vs regular income</p>
      <div className="mt-3 grid gap-3" aria-hidden>
        <div>
          <p className="text-caption font-semibold text-navy-950">TPD — usually a lump sum, paid once</p>
          <div className="mt-1 flex h-8 items-end gap-1">
            {[100, 84, 68, 52, 36, 20, 6].map((h, i) => (
              <span key={i} className="flex-1 rounded-t bg-teal-600" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
        <div>
          <p className="text-caption font-semibold text-navy-950">Income protection — a regular amount</p>
          <div className="mt-1 flex h-8 items-end gap-1">
            {Array.from({ length: 7 }, (_, i) => (
              <span key={i} className="h-1/2 flex-1 rounded-t bg-navy-700" />
            ))}
          </div>
        </div>
      </div>
      <figcaption className="mt-2 text-caption text-ink-muted">Illustrative only. The lump sum shrinks as you spend it.</figcaption>
    </figure>
  );
}

/** One-line product summary; tap to see verified facts and what still needs confirming. */
function ProductRow({ product: p }: { product: ResearchedProduct }) {
  const notice = p.evidence === "ISSUER_NOTICE";
  return (
    <details data-product={p.id} className={cn("group rounded-xl ring-1", notice ? "bg-gold-50 ring-gold-100" : "bg-surface ring-ink/[0.08]")}>
      <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-3 py-2.5">
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-1.5">
            <span className="text-body-sm font-semibold text-navy-950">{p.name}</span>
            <Chip>{p.basis === "Takaful" ? "Takaful" : "Insurance"}</Chip>
            {notice && <Chip tone="gold">Notice</Chip>}
          </span>
          <span className="block text-caption text-ink-muted">{p.type}</span>
        </span>
        <ChevronDown size={18} className="shrink-0 text-ink-muted transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <div className="border-t border-ink/[0.06] px-3 pb-3 pt-2">
        <p className="text-caption text-ink-muted">{p.issuer}</p>
        <dl className="mt-2 grid gap-2 text-body-sm">
          <Row term="Status">{p.status}</Row>
          <Row term="How to apply">{p.howToApply}</Row>
        </dl>
        {p.verifiedFacts.length > 0 && (
          <div className="mt-3 rounded-lg bg-teal-50 p-3">
            <p className="flex items-center gap-1.5 text-caption font-bold uppercase tracking-[0.06em] text-teal-800"><FileText size={12} aria-hidden /> Verified facts</p>
            <dl className="mt-1.5 grid gap-1.5 text-body-sm">
              {p.verifiedFacts.map((f) => (
                <Row key={f.label} term={f.label}>{f.value}</Row>
              ))}
            </dl>
          </div>
        )}
        <p className="mt-3 text-caption font-bold uppercase tracking-[0.06em] text-gold-700">Needs official confirmation</p>
        <p className="mt-0.5 text-body-sm text-ink-secondary">{p.needsConfirmation.join(" · ")}</p>
        {p.note && <p className="mt-2 flex gap-1.5 text-caption text-ink-secondary"><Info size={14} className="mt-0.5 shrink-0" aria-hidden />{p.note}</p>}
        <ul className="mt-2 grid gap-1">
          {p.sources.map((s) => (
            <li key={s.url}><SourceLink source={s} /></li>
          ))}
        </ul>
      </div>
    </details>
  );
}

/* =========================================================================== shared */

function Disclosure({ title, icon: Icon = Info, children }: { title: string; icon?: typeof Info; children: ReactNode }) {
  return (
    <details className="group mt-3 rounded-2xl bg-surface ring-1 ring-ink/[0.08] first:mt-0">
      <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-4 py-3 text-body-sm font-semibold text-navy-950">
        <Icon size={18} className="shrink-0 text-navy-700" aria-hidden />
        <span className="flex-1">{title}</span>
        <ChevronDown size={18} className="shrink-0 text-ink-muted transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <div className="px-4 pb-4">{children}</div>
    </details>
  );
}

function Row({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="grid gap-0.5 sm:grid-cols-[11rem_1fr] sm:gap-3">
      <dt className="text-caption font-semibold text-ink-muted">{term}</dt>
      <dd className="text-navy-950">{children}</dd>
    </div>
  );
}

function Chip({ children, tone }: { children: ReactNode; tone?: "gold" }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold", tone === "gold" ? "bg-gold-100 text-gold-700" : "bg-sunken text-navy-900")}>
      {children}
    </span>
  );
}

function SourceLink({ source, className }: { source: Source; className?: string }) {
  return (
    <a href={source.url} target="_blank" rel="noreferrer" className={cn("inline-flex min-h-6 items-start gap-1 text-caption font-semibold text-navy-800 underline underline-offset-2", className)}>
      <ExternalLink size={12} className="mt-0.5 shrink-0" aria-hidden />
      <span>{source.label}<span className="sr-only"> (opens in a new tab)</span></span>
    </a>
  );
}
