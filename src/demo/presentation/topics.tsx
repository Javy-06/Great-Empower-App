import type { ReactNode } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  BriefcaseBusiness,
  Calculator,
  Check,
  CircleHelp,
  ClipboardCheck,
  Coins,
  ExternalLink,
  FileText,
  Gamepad2,
  Gift,
  GraduationCap,
  HandCoins,
  HeartPulse,
  MessagesSquare,
  PlayCircle,
  Receipt,
  Scale,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TriangleAlert,
  Users,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { earningRules } from "@/rewards/catalogue";
import { LIFETRACK_URL } from "@/app/game/lifetrack";
import { demoPersona } from "../demoData";

/**
 * The 12 presentation topics. Each has its own composition (not one card template), a phone
 * route the left-hand device opens, and the four questions a judge asks: what is it, what problem
 * does it solve, how does it work, why does it matter.
 *
 * HONESTY: no statistics are used (none we could verify for this deck). Prototype limits are said
 * plainly: applications and adviser requests stay on the device, rewards are simulated, and
 * LifeTrack is a separate website.
 */
export interface Topic {
  id: string;
  n: string;
  title: string;
  /** Short label for the navigator. */
  short: string;
  subtitle: string;
  /** The app route the phone opens. */
  hash: string;
  /** Optional element in the app to scroll into view after opening `hash`. */
  focus?: string;
  /** What the phone is showing, for the caption under it. */
  phoneCaption: string;
  takeaway: string;
  body: () => ReactNode;
}

/* ============================================================================ primitives */

function Lede({ children }: { children: ReactNode }) {
  return <p className="max-w-[40rem] text-[1.125rem] leading-relaxed text-ink-secondary lg:text-[1.25rem]">{children}</p>;
}

function Label({ children, tone = "teal" }: { children: ReactNode; tone?: "teal" | "crimson" | "gold" | "navy" }) {
  const c = { teal: "text-teal-700", crimson: "text-crimson-700", gold: "text-gold-700", navy: "text-navy-700" }[tone];
  return <p className={cn("text-caption font-bold uppercase tracking-[0.14em]", c)}>{children}</p>;
}

/** Problem → Solution, side by side (the "before/after" composition). */
function ProblemSolution({ problem, solution }: { problem: string[]; solution: string[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-3xl bg-crimson-50/70 p-5 ring-1 ring-crimson-100">
        <Label tone="crimson">The problem</Label>
        <ul className="mt-3 grid gap-2.5">
          {problem.map((t) => (
            <li key={t} className="flex gap-2.5 text-body text-navy-950">
              <X size={18} className="mt-1 shrink-0 text-crimson-600" aria-hidden /> {t}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-3xl bg-teal-50/80 p-5 ring-1 ring-teal-100">
        <Label>Our solution</Label>
        <ul className="mt-3 grid gap-2.5">
          {solution.map((t) => (
            <li key={t} className="flex gap-2.5 text-body text-navy-950">
              <Check size={18} className="mt-1 shrink-0 text-teal-700" aria-hidden /> {t}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** A horizontal process with arrows (wraps to a column on small screens). */
function Flow({ steps, tone = "navy" }: { steps: Array<{ icon: typeof Check; label: string; text?: string }>; tone?: "navy" | "teal" }) {
  return (
    <ol className="grid gap-2 sm:auto-cols-fr sm:grid-flow-col">
      {steps.map((s, i) => (
        <li key={s.label} className="relative flex items-center gap-3 rounded-2xl bg-surface p-3.5 ring-1 ring-ink/[0.07] sm:flex-col sm:items-start">
          <span className={cn("inline-flex size-11 shrink-0 items-center justify-center rounded-2xl text-white", tone === "teal" ? "bg-teal-600" : "bg-navy-900")}>
            <s.icon size={20} aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block text-body font-semibold text-navy-950">{s.label}</span>
            {s.text && <span className="block text-body-sm text-ink-secondary">{s.text}</span>}
          </span>
          {i < steps.length - 1 && <ArrowRight size={16} className="absolute -right-[13px] top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-canvas text-ink-muted sm:block" aria-hidden />}
        </li>
      ))}
    </ol>
  );
}

function Features({ items, cols = 2 }: { items: Array<{ icon: typeof Check; title: string; text: string }>; cols?: 2 | 3 }) {
  return (
    <ul className={cn("grid gap-x-6 gap-y-4", cols === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
      {items.map(({ icon: Icon, title, text }) => (
        <li key={title} className="flex gap-3">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-800"><Icon size={19} aria-hidden /></span>
          <span className="min-w-0">
            <span className="block text-body font-semibold text-navy-950">{title}</span>
            <span className="block text-body-sm text-ink-secondary">{text}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function Honest({ children }: { children: ReactNode }) {
  return (
    <p className="flex gap-2.5 rounded-2xl bg-gold-50 p-3.5 text-body-sm text-navy-950 ring-1 ring-gold-100">
      <TriangleAlert size={18} className="mt-0.5 shrink-0 text-gold-700" aria-hidden />
      <span>{children}</span>
    </p>
  );
}

/* ============================================================================ topics */

export const topics: Topic[] = [
  {
    id: "overview",
    n: "01",
    title: "GREAT EMPOWER",
    short: "Overview",
    subtitle: "Financial protection education for young Malaysians",
    hash: "app/home",
    phoneCaption: "Home: the next step, learning and protection in one place",
    takeaway: "One app that takes a young adult from “I don't get insurance” to “I know what I have, what I'm missing and what to do next.”",
    body: () => (
      <div className="grid gap-6">
        <p className="max-w-[38rem] font-brand text-[2rem] font-semibold leading-[1.1] text-navy-950 lg:text-[2.5rem]">
          Empowering You to Protect Your Tomorrow.
        </p>
        <dl className="grid gap-3 sm:grid-cols-3">
          {[
            { k: "Who it's for", v: "Students and young working adults making their first money and protection decisions.", icon: Users },
            { k: "The problem", v: "Protection is confusing, so many put it off or buy without understanding it.", icon: CircleHelp },
            { k: "Our answer", v: "Learn it simply, check your own situation, then compare and act with confidence.", icon: ShieldCheck },
          ].map(({ k, v, icon: Icon }) => (
            <div key={k} className="rounded-3xl bg-surface p-5 ring-1 ring-ink/[0.07]">
              <Icon size={22} className="text-crimson-600" aria-hidden />
              <dt className="mt-3 text-caption font-bold uppercase tracking-[0.12em] text-ink-muted">{k}</dt>
              <dd className="mt-1 text-body text-navy-950">{v}</dd>
            </div>
          ))}
        </dl>
        <div>
          <Label>The journey</Label>
          <ol className="mt-2 flex flex-wrap items-center gap-2 text-body-sm font-semibold text-navy-950">
            {["Learn", "Check", "See gaps", "Understand", "Compare", "Get cover"].map((s, i, a) => (
              <li key={s} className="inline-flex items-center gap-2">
                <span className="rounded-full bg-navy-900 px-3.5 py-1.5 text-white">{s}</span>
                {i < a.length - 1 && <ArrowRight size={15} className="text-ink-muted" aria-hidden />}
              </li>
            ))}
          </ol>
        </div>
        <p className="text-body-sm text-ink-muted">Independent education. Not an insurer, not an agent, and not affiliated with any insurer.</p>
      </div>
    ),
  },
  {
    id: "youth-gap",
    n: "02",
    title: "The youth protection gap",
    short: "The problem",
    subtitle: "Why protection is hard for young adults",
    hash: "app/learn/protection",
    phoneCaption: "How protection works: risks first, then the cover that helps",
    takeaway: "The gap isn't only missing cover. It's missing understanding: people can't protect what they can't explain.",
    body: () => (
      <div className="grid gap-6">
        <Lede>Young adults face real financial risks just as they start out, with the least experience to judge them.</Lede>
        <ol className="grid gap-3 sm:grid-cols-2">
          {[
            { icon: Wallet, t: "Thin safety nets", d: "Little savings yet, so one hospital stay or a few months without income can hurt." },
            { icon: FileText, t: "Hard language", d: "Deductible, co-payment, exclusions, waiting periods: the terms decide what's paid." },
            { icon: BriefcaseBusiness, t: "Borrowed cover", d: "Cover through an employer or parents usually ends when the job or the dependency does." },
            { icon: MessagesSquare, t: "Decisions under pressure", d: "Many first meet insurance in a sales conversation, not a neutral explanation." },
          ].map(({ icon: Icon, t, d }, i) => (
            <li key={t} className="flex gap-4 rounded-3xl bg-surface p-5 ring-1 ring-ink/[0.07]">
              <span className="font-brand text-[2rem] font-semibold leading-none text-crimson-600">{i + 1}</span>
              <span>
                <span className="flex items-center gap-2 text-body font-semibold text-navy-950"><Icon size={18} className="text-navy-700" aria-hidden /> {t}</span>
                <span className="mt-1 block text-body-sm text-ink-secondary">{d}</span>
              </span>
            </li>
          ))}
        </ol>
        <div className="rounded-3xl bg-navy-950 p-5 text-white">
          <Label tone="gold">Why it matters</Label>
          <p className="mt-2 text-[1.125rem] leading-relaxed">
            When cover is misunderstood, people find out what isn't paid at the worst moment: after the bill arrives.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "learn",
    n: "03",
    title: "Learn",
    short: "Learn",
    subtitle: "Insurance, explained for beginners",
    hash: "app/learn",
    phoneCaption: "Learn: lessons, short videos and infographics",
    takeaway: "Short, visual formats turn the hardest part of insurance, the language, into something people can actually use.",
    body: () => (
      <div className="grid gap-6">
        <Lede>Bite-sized learning in three formats, each ending with a quick check, so understanding is earned, not assumed.</Lede>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: BookOpen, t: "Lessons", d: "Step-by-step basics with a quiz at the end." },
            { icon: PlayCircle, t: "Short videos", d: "Watch time is checked before points are given." },
            { icon: Sparkles, t: "Infographics", d: "One picture per idea, with a short quiz." },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="rounded-3xl bg-navy-950 p-5 text-white">
              <Icon size={26} className="text-gold-300" aria-hidden />
              <p className="mt-6 font-brand text-[1.5rem] font-semibold">{t}</p>
              <p className="mt-1 text-body-sm text-white/80">{d}</p>
            </div>
          ))}
        </div>
        <div>
          <Label>Complex → simple</Label>
          <div className="mt-2 grid items-stretch gap-2 sm:grid-cols-[1fr_auto_1fr]">
            <p className="rounded-2xl bg-sunken/70 p-4 text-body-sm italic text-ink-secondary">
              “Co-insurance: the percentage of eligible expenses borne by the insured after the deductible.”
            </p>
            <ArrowRight size={20} className="mx-auto rotate-90 self-center text-crimson-600 sm:rotate-0" aria-hidden />
            <p className="rounded-2xl bg-teal-50 p-4 text-body text-navy-950 ring-1 ring-teal-100">
              <strong className="font-semibold">Co-payment:</strong> after the deductible, you pay a small share of the bill, like 10%.
            </p>
          </div>
        </div>
        <Features
          cols={3}
          items={[
            { icon: GraduationCap, title: "Beginner first", text: "No jargon until it's explained." },
            { icon: FileText, title: "Key terms, in pictures", text: "A visual glossary of the words that decide a claim." },
            { icon: BadgeCheck, title: "Sourced", text: "Malaysia-specific facts link to BNM and official pages." },
          ]}
        />
      </div>
    ),
  },
  {
    id: "check",
    n: "04",
    title: "Protection Check",
    short: "Check",
    subtitle: "Eight quick answers, one clear picture",
    hash: "app/protect/check",
    phoneCaption: "Protect → Check, filled in with the sample profile",
    takeaway: "Before anyone talks about products, the user sees their own situation, in their own words.",
    body: () => (
      <div className="grid gap-6">
        <Lede>A short, private self-check. It asks about you and the cover you already have, never about products.</Lede>
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div>
            <Label>What it asks</Label>
            <ol className="mt-2 grid gap-2">
              {["Age, income and monthly costs", "Who depends on you", "Medical, critical illness, life and accident cover: yes, no or not sure", "Which areas matter most to you"].map((t, i) => (
                <li key={t} className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3 ring-1 ring-ink/[0.07]">
                  <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-navy-900 text-caption font-bold text-white">{i + 1}</span>
                  <span className="text-body-sm text-navy-950">{t}</span>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <Label>What the user gets</Label>
            <div className="mt-2 grid gap-2">
              <p className="rounded-2xl bg-teal-50 p-4 text-body text-navy-950 ring-1 ring-teal-100">A finding for each kind of cover, with the reason in one line.</p>
              <p className="rounded-2xl bg-teal-50 p-4 text-body text-navy-950 ring-1 ring-teal-100">A next step for each: learn, review or explore cover.</p>
              <p className="rounded-2xl bg-surface p-4 text-body-sm text-ink-secondary ring-1 ring-ink/[0.07]">
                <strong className="font-semibold text-navy-950">Private by design:</strong> answers stay on the device. No score, no product push.
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "gap",
    n: "05",
    title: "Your protection gap",
    short: "Your gap",
    subtitle: "What's covered, what needs a look, what's missing",
    hash: "app/protect/gap/critical",
    phoneCaption: "The sample profile's critical illness gap",
    takeaway: "A gap is shown only where the user said it matters and has no cover: transparent rules, no fear tactics.",
    body: () => (
      <div className="grid gap-6">
        <Lede>Four simple, explained rules turn the check into a finding for each area, each with a next step.</Lede>
        <ul className="grid gap-2 sm:grid-cols-2">
          {[
            { s: "Covered", r: "You said you have it. We remind you to check its limits.", cls: "bg-success-600 text-white", icon: Check },
            { s: "Gap", r: "It matters to you, and you have no cover yet.", cls: "bg-crimson-600 text-white", icon: X },
            { s: "Review", r: "No cover but not a priority, or you're not sure.", cls: "bg-gold-500 text-navy-950", icon: TriangleAlert },
            { s: "Not assessed", r: "Not answered yet. One tap to answer it.", cls: "bg-sunken text-ink-muted", icon: CircleHelp },
          ].map(({ s, r, cls, icon: Icon }) => (
            <li key={s} className="flex items-center gap-3 rounded-2xl bg-surface p-3.5 ring-1 ring-ink/[0.07]">
              <span className={cn("inline-flex size-11 shrink-0 items-center justify-center rounded-xl", cls)}><Icon size={20} strokeWidth={2.5} aria-hidden /></span>
              <span>
                <span className="block text-body font-semibold text-navy-950">{s}</span>
                <span className="block text-body-sm text-ink-secondary">{r}</span>
              </span>
            </li>
          ))}
        </ul>
        <div className="rounded-3xl bg-navy-950 p-5 text-white">
          <Label tone="gold">In the demo: {demoPersona.name}, {demoPersona.age} (fictional)</Label>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              ["Medical", "Covered", "bg-success-600"],
              ["Critical illness", "Gap", "bg-crimson-600"],
              ["Life & income", "Review", "bg-gold-500 text-navy-950"],
              ["Accident", "Review", "bg-gold-500 text-navy-950"],
            ].map(([a, s, c]) => (
              <div key={a} className={cn("rounded-xl p-3 text-center", c)}>
                <p className="text-caption font-semibold opacity-90">{a}</p>
                <p className="font-bold">{s}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-body-sm text-white/80">Her medical cover comes through her employer, which usually ends if she changes jobs: worth knowing early.</p>
        </div>
      </div>
    ),
  },
  {
    id: "how-protection-works",
    n: "06",
    title: "How protection works",
    short: "How it works",
    subtitle: "Each kind of cover, as a picture",
    hash: "app/learn/protection/medical",
    phoneCaption: "Medical Expense Protection: from hospital bill to what you pay",
    takeaway: "Each kind of cover pays differently. Showing how the money flows makes the difference obvious in seconds.",
    body: () => (
      <div className="grid gap-5">
        <Lede>Every category gets its own diagram, what it may cover, what it doesn&apos;t automatically cover, and a real-life example.</Lede>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { t: "Medical Expense", icon: HeartPulse, steps: ["Hospital bill", "Eligible costs", "Plan pays", "You pay the rest"], tone: "bg-crimson-600" },
            { t: "Critical Illness", icon: Stethoscope, steps: ["Diagnosis", "Costs + lost income", "One lump sum"], tone: "bg-gold-500 text-navy-950" },
            { t: "Life / Income", icon: Users, steps: ["Your income", "Your dependants", "Financial support"], tone: "bg-navy-900" },
            { t: "Personal Accident", icon: Zap, steps: ["Accident", "Injury", "Set benefit"], tone: "bg-teal-600" },
          ].map(({ t, icon: Icon, steps, tone }) => (
            <div key={t} className="rounded-3xl bg-surface p-4 ring-1 ring-ink/[0.07]">
              <p className="flex items-center gap-2.5 text-body font-semibold text-navy-950">
                <span className={cn("inline-flex size-9 items-center justify-center rounded-xl text-white", tone)}><Icon size={18} aria-hidden /></span>
                {t}
              </p>
              <ol className="mt-3 flex flex-wrap items-center gap-1.5 text-body-sm text-navy-950">
                {steps.map((s, i) => (
                  <li key={s} className="inline-flex items-center gap-1.5">
                    <span className="rounded-lg bg-sunken px-2.5 py-1">{s}</span>
                    {i < steps.length - 1 && <ArrowRight size={14} className="text-ink-muted" aria-hidden />}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
        <p className="text-body-sm text-ink-muted">Plus Total &amp; Permanent Disability. Examples are illustrative; the policy wording decides what is paid.</p>
      </div>
    ),
  },
  {
    id: "compare",
    n: "07",
    title: "Compare",
    short: "Compare",
    subtitle: "Real products, verified facts, side by side",
    hash: "app/protect/products",
    phoneCaption: "Protect → Compare: the product explorer",
    takeaway: "Comparison without a sales agenda: verified facts, clear unknowns, and the decision left to the user.",
    body: () => (
      <div className="grid gap-6">
        <Lede>A product explorer built from official documents. Pick two and see the facts next to each other.</Lede>
        <figure className="overflow-hidden rounded-3xl bg-surface ring-1 ring-ink/[0.08]" aria-label="Illustration of a side-by-side comparison">
          <div className="grid grid-cols-[1.1fr_1fr_1fr] bg-navy-950 text-body-sm font-semibold text-white">
            <span className="p-3">Fact</span>
            <span className="p-3">Product A</span>
            <span className="p-3">Product B</span>
          </div>
          {[
            ["Kind of cover", "Medical", "Medical"],
            ["Annual limit", "From the PDS", "From the PDS"],
            ["Co-payment", "From the PDS", "Needs confirming"],
            ["How to apply", "Online", "Through an agent"],
          ].map(([f, a, b]) => (
            <div key={f} className="grid grid-cols-[1.1fr_1fr_1fr] border-t border-ink/[0.07] text-body-sm">
              <span className="p-3 font-semibold text-navy-950">{f}</span>
              {[a, b].map((v, i) => (
                <span key={i} className={cn("flex items-center gap-1.5 p-3", v === "Needs confirming" ? "text-gold-700" : "text-navy-950")}>
                  {v === "From the PDS" && <BadgeCheck size={15} className="text-teal-700" aria-hidden />}
                  {v}
                </span>
              ))}
            </div>
          ))}
          <figcaption className="border-t border-ink/[0.07] p-3 text-caption text-ink-muted">Illustration of the layout. The app shows each product&apos;s real verified facts and sources.</figcaption>
        </figure>
        <ul className="grid gap-2 sm:grid-cols-3">
          {["No rankings", "No prices or quotes", "No “best for you”"].map((t) => (
            <li key={t} className="flex items-center gap-2 rounded-2xl bg-navy-50 px-4 py-3 text-body font-semibold text-navy-950">
              <X size={17} className="text-crimson-600" aria-hidden /> {t}
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    id: "get-cover",
    n: "08",
    title: "Get cover",
    short: "Get cover",
    subtitle: "From understanding to applying, without pressure",
    hash: "app/protect/get-cover/critical/how",
    phoneCaption: "Get cover → Apply: in the app, or with an adviser",
    takeaway: "The user arrives at “apply” already understanding the cover, and always with a human option.",
    body: () => (
      <div className="grid gap-6">
        <Flow
          steps={[
            { icon: BookOpen, label: "Understand", text: "What it does and doesn't do" },
            { icon: ClipboardCheck, label: "Get ready", text: "A checklist before applying" },
            { icon: ShieldCheck, label: "Apply", text: "Your way" },
          ]}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-3xl bg-navy-950 p-5 text-white">
            <ShieldCheck size={24} className="text-gold-300" aria-hidden />
            <p className="mt-3 font-brand text-[1.5rem] font-semibold">Apply in the app</p>
            <p className="mt-1 text-body-sm text-white/80">Four steps (details, cover, health, review), saved as you go. Every answer is reviewed before finishing.</p>
          </div>
          <div className="rounded-3xl bg-surface p-5 ring-1 ring-ink/[0.08]">
            <MessagesSquare size={24} className="text-crimson-600" aria-hidden />
            <p className="mt-3 font-brand text-[1.5rem] font-semibold text-navy-950">Talk to an adviser</p>
            <p className="mt-1 text-body-sm text-ink-secondary">A short request, with age worked out from the date of birth. Under 18? A parent or guardian joins in.</p>
          </div>
        </div>
        <Honest>
          <strong className="font-semibold">Prototype UX.</strong> GREAT EMPOWER has no insurer or adviser integration yet. Applications and adviser requests stay on the device and are never sent, so no policy is issued and no cover is created.
        </Honest>
      </div>
    ),
  },
  {
    id: "simulate",
    n: "09",
    title: "Simulate",
    short: "Simulate",
    subtitle: "Try a real-life scenario before it happens",
    hash: "app/simulate",
    phoneCaption: "Simulate: four scenarios with numbers you choose",
    takeaway: "Seeing a bill split, or a lump sum run out, teaches what a definition never can, without pretending to be a claim.",
    body: () => (
      <div className="grid gap-5">
        <Lede>Four hypothetical scenarios. Change the numbers and watch the outcome move.</Lede>
        <div className="overflow-x-auto rounded-3xl bg-surface ring-1 ring-ink/[0.08]">
          <table className="w-full min-w-[34rem] text-left text-body-sm">
            <thead className="bg-navy-950 text-white">
              <tr>
                <th scope="col" className="p-3 font-semibold">Scenario</th>
                <th scope="col" className="p-3 font-semibold">You change</th>
                <th scope="col" className="p-3 font-semibold">It shows</th>
                <th scope="col" className="p-3 font-semibold">It can&apos;t tell you</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/[0.07] text-navy-950">
              {[
                [Receipt, "Medical bill", "Bill lines, eligibility, employer help, deductible, co-payment, limits", "Who pays what, stage by stage", "Whether an insurer would pay a claim"],
                [Wallet, "Emergency fund", "Monthly costs, months to cover, savings", "Your target and how far along you are", "How much you personally should save"],
                [Users, "Family", "Support for dependants, years, debts, savings, existing cover", "What your family might need vs what's counted", "How much life cover to buy"],
                [HandCoins, "Critical illness", "Lump sum, income and recovery costs", "How long a lump sum could last", "Whether a diagnosis would qualify"],
              ].map(([Icon, s, c, w, n]) => {
                const I = Icon as typeof Receipt;
                return (
                  <tr key={s as string}>
                    <th scope="row" className="p-3 font-semibold">
                      <span className="inline-flex items-center gap-2"><I size={16} className="text-crimson-600" aria-hidden /> {s as string}</span>
                    </th>
                    <td className="p-3 text-ink-secondary">{c as string}</td>
                    <td className="p-3">{w as string}</td>
                    <td className="p-3 text-ink-secondary">{n as string}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Honest>Educational simulation, not a claim or a quote. Real policy terms, exclusions, limits and the insurer&apos;s decision apply.</Honest>
      </div>
    ),
  },
  {
    id: "rewards",
    n: "10",
    title: "Rewards",
    short: "Rewards",
    subtitle: "Learning that pays off, and keeps people coming back",
    hash: "app/rewards",
    phoneCaption: "Rewards Hub: points, marketplace and wallet",
    takeaway: "Points reward understanding, not clicks: they're given only after a quiz is passed or a video is really watched.",
    body: () => (
      <div className="grid gap-6">
        <div className="grid items-center gap-5 sm:grid-cols-[auto_1fr]">
          <ol className="relative mx-auto my-8 grid size-48 shrink-0 place-items-center rounded-full bg-navy-950 text-white sm:my-6 sm:size-56" aria-label="The rewards loop: learn, earn, redeem, then learn more">
            <span className="text-center font-brand text-[1.375rem] font-semibold leading-tight">Learn<br />loop</span>
            {[
              { t: "Learn", icon: GraduationCap, cls: "left-1/2 top-0 -translate-x-1/2 -translate-y-1/3" },
              { t: "Earn", icon: Coins, cls: "right-0 top-1/2 -translate-y-1/2 translate-x-1/3" },
              { t: "Redeem", icon: Gift, cls: "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/3" },
              { t: "Repeat", icon: ArrowRight, cls: "left-0 top-1/2 -translate-x-1/3 -translate-y-1/2" },
            ].map(({ t, icon: Icon, cls }) => (
              <li key={t} className={cn("absolute flex flex-col items-center gap-1", cls)}>
                <span className="inline-flex size-12 items-center justify-center rounded-full bg-gold-500 text-navy-950 ring-4 ring-canvas"><Icon size={20} aria-hidden /></span>
                <span className="rounded-full bg-canvas px-2 text-caption font-bold text-navy-950">{t}</span>
              </li>
            ))}
          </ol>
          <div>
            <Label>How points are earned</Label>
            <ul className="mt-2 grid gap-2">
              {(["lesson-complete", "video-finished", "infographic-viewed", "profile-complete"] as const).map((k) => (
                <li key={k} className="flex items-center justify-between gap-3 rounded-2xl bg-surface px-4 py-3 ring-1 ring-ink/[0.07]">
                  <span className="text-body-sm text-navy-950">{earningRules[k].label}</span>
                  <span className="shrink-0 font-bold tabular-nums text-crimson-600">+{earningRules[k].points}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <Honest>Points, marketplace brands and items are fictional and have no cash value. Nothing is paid for or delivered in the demo.</Honest>
      </div>
    ),
  },
  {
    id: "lifetrack",
    n: "11",
    title: "LifeTrack",
    short: "LifeTrack",
    subtitle: "Make Smart Choices. Protect Your Tomorrow.",
    hash: "app/home",
    focus: "#game-entry-title",
    phoneCaption: "Home: the LifeTrack card opens the game in a new tab",
    takeaway: "Gameplay brings people back; the app turns that interest into real understanding.",
    body: () => (
      <div className="grid gap-6">
        <div className="grid items-stretch gap-3 sm:grid-cols-[1.2fr_1fr]">
          <div className="relative overflow-hidden rounded-3xl bg-navy-950 p-6 text-white">
            <Gamepad2 size={30} className="text-gold-300" aria-hidden />
            <p className="mt-6 font-brand text-[2rem] font-semibold leading-tight">Insurance gameplay, on its own website.</p>
            <p className="mt-2 text-body-sm text-white/80">LifeTrack is a separate game. GREAT EMPOWER links to it from Home and opens it in a new tab.</p>
            <a href={LIFETRACK_URL} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex h-12 items-center gap-2 rounded-full bg-crimson-600 px-5 text-body-sm font-bold text-white hover:bg-crimson-700">
              Open LifeTrack <ExternalLink size={16} aria-hidden />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
          <Features
            items={[
              { icon: Gamepad2, title: "Gamification", text: "Play makes protection a topic people choose to come back to." },
              { icon: Sparkles, title: "Interactive learning", text: "Ideas from Learn, met again as choices." },
              { icon: Users, title: "Engagement", text: "A reason to return between lessons." },
            ]}
          />
        </div>
        <p className="text-body-sm text-ink-muted">LifeTrack is not built into GREAT EMPOWER and isn&apos;t changed by this demo.</p>
      </div>
    ),
  },
  {
    id: "impact",
    n: "12",
    title: "Impact",
    short: "Impact",
    subtitle: "What changes for a young Malaysian",
    hash: "app/protect",
    phoneCaption: "Protect: the whole journey in one place",
    takeaway: "GREAT EMPOWER doesn't sell protection. It makes people ready to choose it well.",
    body: () => (
      <div className="grid gap-6">
        <ProblemSolution
          problem={["“Insurance is confusing, I'll deal with it later.”", "Doesn't know what their work cover includes", "First contact is a sales pitch"]}
          solution={["Understands the basics in minutes", "Knows what's covered, what's a gap, and why", "Compares facts and applies when ready, with help if wanted"]}
        />
        <div>
          <Label>The journey, end to end</Label>
          <Flow
            tone="teal"
            steps={[
              { icon: GraduationCap, label: "Learn" },
              { icon: ClipboardCheck, label: "Check" },
              { icon: Scale, label: "Compare" },
              { icon: ShieldCheck, label: "Act" },
            ]}
          />
        </div>
        <p className="font-brand text-[1.75rem] font-semibold leading-tight text-navy-950 lg:text-[2.125rem]">
          Empowering You to Protect Your Tomorrow.
        </p>
      </div>
    ),
  },
];

export const findTopic = (id: string | null) => topics.find((t) => t.id === id);
