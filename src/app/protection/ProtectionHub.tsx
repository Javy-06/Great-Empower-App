import type { ReactNode } from "react";
import {
  Accessibility,
  ArrowLeft,
  ArrowRight,
  Bandage,
  BadgeCheck,
  Check,
  CircleAlert,
  ExternalLink,
  FileText,
  HeartPulse,
  Info,
  Landmark,
  PiggyBank,
  Ribbon,
  Scale,
  ShieldCheck,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { Container } from "@/components/layout/Editorial";
import { PageHero } from "@/components/layout/PageHero";
import { cn } from "@/lib/cn";
import { findInfographic } from "@/data/learn-media";
import {
  PRODUCT_RESEARCH_DATE,
  UNVERIFIED_PRODUCT_NAME_COUNT,
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

const icons: Record<ProtectionSlug, typeof HeartPulse> = {
  medical: HeartPulse,
  "critical-illness": Ribbon,
  life: Users,
  tpd: Accessibility,
  "personal-accident": Bandage,
};
const tones: Record<ProtectionSlug, string> = {
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
        title="Know what each cover does — and doesn't."
        text="Five kinds of insurance in plain language, with Malaysian context and what to check before you buy."
        image="/images/pexels/family-protection-conversation.webp"
        imagePosition="55% 30%"
        backLabel="Learn"
        onBack={() => go("app/learn")}
        titleId="protection-title"
      />

      <Container className="relative -mt-6 max-w-[56rem]">
        <section aria-labelledby="two-names-title" className="rounded-2xl bg-surface p-4 shadow-e2 ring-1 ring-ink/[0.06] sm:p-6">
          <h2 id="two-names-title" className="font-brand text-[1.75rem] font-semibold leading-tight text-navy-950">Two names for every cover</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <NameKey label="Official category" text="What insurers and the policy call it, e.g. “Critical Illness”." tone="bg-navy-900 text-white" />
            <NameKey label="Protection purpose" text="The money problem it helps with, e.g. “Critical Illness Recovery”." tone="bg-crimson-50 text-crimson-700" />
          </div>
          <ul className="mt-4 grid gap-2.5">
            {protectionCategories.map((c) => (
              <li key={c.slug}>
                <CategoryLink category={c} />
              </li>
            ))}
          </ul>
        </section>
      </Container>

      <Container className="mt-10 max-w-[56rem]">
        <SectionTitle id="zero-title" overline="The key idea" title="Insurance coverage ≠ zero out-of-pocket cost" />
        <p className="mt-2 text-body-sm text-ink-secondary">
          Even with cover, part of a bill can stay with you. Here is how one hospital bill can split. The diagram is illustrative, not to scale.
        </p>
        <BillSplit />
        <button type="button" onClick={() => go("app/simulate/needs/tool-bill")} className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-body-sm font-semibold text-crimson-600">
          Try it with your own numbers <ArrowRight size={16} aria-hidden />
        </button>
      </Container>

      <Container className="mt-10 max-w-[56rem]">
        <SectionTitle id="compare-title" overline="Different tools" title="Insurance, savings and investing do different jobs" />
        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            { icon: ShieldCheck, title: "Insurance", text: "You pay a premium so a specific risk is shared. Pure protection pays only if a covered event happens; if it doesn't, you usually get nothing back.", tone: "bg-navy-900 text-white" },
            { icon: PiggyBank, title: "Savings", text: "Your own money, available when you need it, with little risk. It is what pays a deductible, co-payment or the first months without income.", tone: "bg-teal-600 text-white" },
            { icon: TrendingUp, title: "Investing", text: "Aims to grow over time but can lose value. Investment-linked insurance mixes protection with investing, so its values aren't guaranteed.", tone: "bg-gold-500 text-navy-950" },
          ].map(({ icon: Icon, title, text, tone }) => (
            <li key={title} className="rounded-2xl bg-surface p-4 ring-1 ring-ink/[0.07]">
              <span className={cn("inline-flex size-10 items-center justify-center rounded-xl", tone)}><Icon size={20} aria-hidden /></span>
              <h3 className="mt-3 text-body font-semibold text-navy-950">{title}</h3>
              <p className="mt-1 text-body-sm text-ink-secondary">{text}</p>
            </li>
          ))}
        </ul>
      </Container>

      <Container className="mt-10 max-w-[56rem]">
        <SectionTitle id="before-title" overline="Before you buy" title="Six things to check" />
        <ol className="mt-4 grid gap-2.5 sm:grid-cols-2">
          {[
            { t: "Read the Product Disclosure Sheet (PDS)", d: "It summarises the benefits, limits, exclusions and costs. The policy wording is what counts." },
            { t: "Find the limits and what you pay", d: "Annual and lifetime limits, room-and-board limits, deductible and co-payment." },
            { t: "Check waiting periods and exclusions", d: "Some conditions aren't covered at all, and illness right after cover starts may not be." },
            { t: "Answer health questions honestly", d: "Not disclosing a pre-existing condition is one of the biggest reasons hospital guarantee letters are declined.", source: protectionSources.star },
            { t: "Ask whether the premium can change", d: "Medical premiums can be revised at renewal. Plan for it, not just today's price." },
            { t: "Know your free-look period", d: "You can usually cancel a new life or medical policy within a free-look period (usually 15 days) for a refund, less some costs. Check your policy.", source: protectionSources.glossary },
          ].map((item, i) => (
            <li key={item.t} className="flex gap-3 rounded-2xl bg-surface p-4 ring-1 ring-ink/[0.07]">
              <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-crimson-600 text-caption font-bold text-white tabular-nums">{i + 1}</span>
              <span>
                <span className="block text-body-sm font-semibold text-navy-950">{item.t}</span>
                <span className="mt-0.5 block text-body-sm text-ink-secondary">{item.d}</span>
                {item.source && <SourceLink source={item.source} className="mt-1" />}
              </span>
            </li>
          ))}
        </ol>
      </Container>

      <Container className="mt-10 max-w-[56rem]">
        <SectionTitle id="buying-title" overline="How buying works in Malaysia" title="Online or through an agent" />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-surface p-4 ring-1 ring-ink/[0.07]">
            <h3 className="text-body font-semibold text-navy-950">Buying directly (online)</h3>
            <p className="mt-1 text-body-sm text-ink-secondary">
              BNM introduced commission-free standalone pure protection products sold through direct channels — term life from July 2017, then critical illness and medical plans from July 2018.
            </p>
            <SourceLink source={protectionSources.bnmDirect} className="mt-1.5" />
          </div>
          <div className="rounded-2xl bg-surface p-4 ring-1 ring-ink/[0.07]">
            <h3 className="text-body font-semibold text-navy-950">Through an agent or adviser</h3>
            <p className="mt-1 text-body-sm text-ink-secondary">
              Some products — riders, investment-linked plans and some medical plans — are sold through agents. Your health history, the amount of cover and other details can also mean full underwriting.
            </p>
          </div>
        </div>
        <ul className="mt-3 grid gap-2 rounded-2xl bg-navy-50 p-4 text-body-sm text-navy-900">
          <li className="flex gap-2"><Info size={16} className="mt-0.5 shrink-0" aria-hidden />Whether a product can be bought online depends on the product. Eligibility rules — age, citizenship or residency, health and occupation — apply either way.</li>
          <li className="flex gap-2"><Scale size={16} className="mt-0.5 shrink-0" aria-hidden />Conventional insurance and takaful work differently. Takaful is based on shared contributions and is open to non-Muslims.</li>
          <li className="flex gap-2"><Landmark size={16} className="mt-0.5 shrink-0" aria-hidden />GREAT EMPOWER doesn't sell insurance, give quotes or recommend products, and isn't affiliated with any insurer.</li>
        </ul>
      </Container>

      <Container className="mt-10 max-w-[56rem]">
        <SectionTitle id="rights-title" overline="If something goes wrong" title="Your safety nets" />
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          <li className="rounded-2xl bg-surface p-4 ring-1 ring-ink/[0.07]">
            <h3 className="text-body font-semibold text-navy-950">A dispute with your insurer</h3>
            <p className="mt-1 text-body-sm text-ink-secondary">Complain to the insurer first. If you're still unhappy with its final decision, you can take an eligible dispute to the Financial Markets Ombudsman Service (FMOS).</p>
            <SourceLink source={protectionSources.fmos} className="mt-1.5" />
          </li>
          <li className="rounded-2xl bg-surface p-4 ring-1 ring-ink/[0.07]">
            <h3 className="text-body font-semibold text-navy-950">If an insurer fails</h3>
            <p className="mt-1 text-body-sm text-ink-secondary">PIDM protects eligible insurance and takaful benefits of its member companies, up to set limits.</p>
            <SourceLink source={protectionSources.pidm} className="mt-1.5" />
          </li>
        </ul>
      </Container>

      <Container className="mt-10 max-w-[56rem] pb-4">
        <section aria-labelledby="research-title" className="rounded-2xl bg-navy-950 p-5 text-white">
          <p className="text-overline uppercase tracking-[0.18em] text-teal-200">Products in our research</p>
          <h2 id="research-title" className="mt-1 font-brand text-[1.625rem] font-semibold leading-tight">Facts we could check, and nothing more</h2>
          <p className="mt-2 text-body-sm text-white/75">
            Each category page lists Great Eastern products only where official documents confirm what we show:{" "}
            {researchedProducts.filter((p) => p.evidence === "VERIFIED_OFFICIAL").length} products, checked {PRODUCT_RESEARCH_DATE}. Another {UNVERIFIED_PRODUCT_NAME_COUNT} product names appear in research but couldn't be verified, so they aren't shown.
          </p>
          <p className="mt-2 text-caption text-white/60">Independent education. Not affiliated with, or endorsed by, Great Eastern. Not a recommendation or a quote.</p>
        </section>
      </Container>
      <Disclaimer />
    </>
  );
}

function NameKey({ label, text, tone }: { label: string; text: string; tone: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl bg-sunken/60 p-3">
      <span className={cn("shrink-0 rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.06em]", tone)}>{label}</span>
      <span className="text-caption text-ink-secondary">{text}</span>
    </div>
  );
}

function CategoryLink({ category: c }: { category: ProtectionCategory }) {
  const Icon = icons[c.slug];
  return (
    <button
      type="button"
      onClick={() => go(`${PROTECTION_HASH}/${c.slug}`)}
      className="group flex min-h-[4.75rem] w-full items-center gap-3 rounded-2xl bg-surface p-3 text-left ring-1 ring-ink/[0.08] transition-shadow hover:shadow-e2"
    >
      <span className={cn("inline-flex size-12 shrink-0 items-center justify-center rounded-xl", tones[c.slug])}>
        <Icon size={22} aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-bold uppercase tracking-[0.08em] text-ink-muted">{c.official}</span>
        <span className="block text-body font-semibold text-navy-950">{c.purpose}</span>
        <span className="block text-caption text-ink-secondary">{c.short}</span>
      </span>
      <ArrowRight size={18} className="shrink-0 text-navy-700 transition-transform group-hover:translate-x-0.5" aria-hidden />
    </button>
  );
}

/** Illustrative split of one hospital bill (proportions are for explanation only). */
function BillSplit() {
  const parts = [
    { label: "Deductible", who: "You", w: 12, cls: "bg-crimson-600 text-white" },
    { label: "Co-payment share", who: "You", w: 14, cls: "bg-crimson-200 text-crimson-900" },
    { label: "Plan pays", who: "Insurer", w: 58, cls: "bg-navy-900 text-white" },
    { label: "Above limits or excluded", who: "You", w: 16, cls: "bg-[repeating-linear-gradient(135deg,var(--color-crimson-100)_0_6px,var(--color-crimson-50)_6px_12px)] text-crimson-800" },
  ];
  return (
    <figure className="mt-4 rounded-2xl bg-surface p-4 ring-1 ring-ink/[0.07]" aria-label="Illustration: a hospital bill split into a deductible, a co-payment share and costs above limits paid by you, and the rest paid by the plan.">
      <div className="flex h-12 w-full overflow-hidden rounded-xl" aria-hidden>
        {parts.map((p) => (
          <div key={p.label} className={cn("h-full", p.cls)} style={{ width: `${p.w}%` }} />
        ))}
      </div>
      <figcaption className="mt-3 grid gap-2 sm:grid-cols-4">
        {parts.map((p) => (
          <span key={p.label} className="flex items-center gap-2 text-caption">
            <span className={cn("size-3 shrink-0 rounded-sm", p.cls)} aria-hidden />
            <span><span className="font-semibold text-navy-950">{p.label}</span> <span className="text-ink-muted">· {p.who}</span></span>
          </span>
        ))}
      </figcaption>
    </figure>
  );
}

/* =========================================================================== category */

function CategoryView({ category: c }: { category: ProtectionCategory }) {
  const Icon = icons[c.slug];
  const index = protectionCategories.findIndex((x) => x.slug === c.slug);
  const prev = protectionCategories[index - 1];
  const next = protectionCategories[index + 1];
  const infographic = c.infographicId ? findInfographic(c.infographicId) : undefined;
  const products = productsFor(c.slug);

  return (
    <>
      <section aria-labelledby="category-title" className="bg-navy-950 text-white">
        <Container className="max-w-[56rem] pb-8 pt-3 md:pt-10">
          <button type="button" onClick={() => go(PROTECTION_HASH)} className="-ml-2 inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-body-sm font-semibold text-white/85 hover:text-white">
            <ArrowLeft size={18} aria-hidden /> Protection explained
          </button>
          <div className="mt-3 flex items-start gap-4">
            <span className={cn("inline-flex size-14 shrink-0 items-center justify-center rounded-2xl", tones[c.slug])}>
              <Icon size={26} aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-overline uppercase tracking-[0.18em] text-teal-200">Protection purpose</p>
              <h1 id="category-title" className="mt-1 font-brand text-[2.25rem] font-semibold leading-[1.05] sm:text-[2.75rem]">{c.purpose}</h1>
              <p className="mt-2 inline-flex flex-wrap items-center gap-2 text-body-sm">
                <span className="rounded-md bg-white/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.06em] text-white/80">Official category</span>
                <span className="font-semibold">{c.official}</span>
              </p>
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-body text-white/80">{c.summary}</p>
        </Container>
      </section>

      <Container className="mt-6 max-w-[56rem]">
        <div className="rounded-2xl bg-gold-50 p-4 ring-1 ring-gold-100">
          <p className="text-caption font-bold uppercase tracking-[0.08em] text-gold-700">{c.example.title}</p>
          <p className="mt-1 text-body-sm text-navy-950">{c.example.text}</p>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <ListCard title="What it may help with" items={c.mayHelp} tone="good" />
          <ListCard title="What it doesn't automatically cover" items={c.notAutomatic} tone="bad" />
        </div>
        <p className="mt-2 text-caption text-ink-muted">General descriptions. Every policy's wording, limits and exclusions decide what is actually paid.</p>

        {c.notEqual.map((n) => (
          <div key={n.a} className="mt-6 rounded-2xl bg-surface p-4 ring-1 ring-ink/[0.07]">
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-brand text-[1.5rem] font-semibold leading-tight text-navy-950">
              <span>{n.a}</span>
              <span className="text-crimson-600" aria-hidden>≠</span>
              <span className="sr-only">{" is not the same as "}</span>
              <span>{n.b}</span>
            </p>
            <p className="mt-1 text-body-sm text-ink-secondary">{n.why}</p>
          </div>
        ))}
      </Container>

      <Container className="mt-10 max-w-[56rem]">
        <SectionTitle id="myths-title" overline="Common misunderstandings" title="What people often get wrong" />
        <ul className="mt-4 grid gap-3">
          {c.misunderstandings.map((m) => (
            <li key={m.myth} className="grid gap-2 rounded-2xl bg-surface p-4 ring-1 ring-ink/[0.07] sm:grid-cols-[1fr_1.3fr] sm:gap-5">
              <p className="flex gap-2 text-body-sm font-semibold text-navy-950">
                <CircleAlert size={18} className="mt-0.5 shrink-0 text-crimson-600" aria-hidden />
                <span><span className="sr-only">Myth: </span>{m.myth}</span>
              </p>
              <p className="flex gap-2 text-body-sm text-ink-secondary">
                <BadgeCheck size={18} className="mt-0.5 shrink-0 text-teal-700" aria-hidden />
                <span><span className="sr-only">Reality: </span>{m.reality}</span>
              </p>
            </li>
          ))}
        </ul>
      </Container>

      {c.malaysia && (
        <Container className="mt-10 max-w-[56rem]">
          <SectionTitle id="my-title" overline="In Malaysia" title="Worth knowing" />
          <ul className="mt-4 grid gap-3">
            {c.malaysia.map((m) => (
              <li key={m.text} className="rounded-2xl bg-navy-50 p-4">
                <p className="text-body-sm text-navy-950">{m.text}</p>
                <SourceLink source={m.source} className="mt-1.5" />
              </li>
            ))}
          </ul>
        </Container>
      )}

      <Container className="mt-10 grid max-w-[56rem] gap-3 md:grid-cols-2">
        {infographic ? (
          <button type="button" onClick={() => go(`app/learn/infographic/${infographic.id}`)} className="group flex items-center gap-3 rounded-2xl bg-surface p-3 text-left ring-1 ring-ink/[0.07] hover:shadow-e2">
            <img src={infographic.thumb} alt="" loading="lazy" className={cn("ge-skeleton shrink-0 rounded-xl object-cover ring-1 ring-ink/[0.06]", infographic.orientation === "landscape" ? "h-20 w-28" : "h-24 w-20")} />
            <span className="min-w-0 flex-1">
              <span className="block text-caption font-bold uppercase tracking-[0.08em] text-ink-muted">Visual guide</span>
              <span className="block text-body font-semibold text-navy-950">{infographic.title}</span>
              <span className="block text-caption text-ink-secondary">Study it, then pass its quiz to earn points.</span>
            </span>
            <ArrowRight size={18} className="shrink-0 text-navy-700" aria-hidden />
          </button>
        ) : (
          <LumpSumVsIncome />
        )}
        {c.scenario && (
          <button type="button" onClick={() => go(c.scenario!.href)} className="group flex items-center gap-3 rounded-2xl bg-crimson-600 p-4 text-left text-white hover:bg-crimson-700">
            <span className="min-w-0 flex-1">
              <span className="block text-caption font-bold uppercase tracking-[0.08em] text-white/75">Simulate</span>
              <span className="block text-body font-semibold">{c.scenario.label}</span>
              <span className="block text-caption text-white/80">{c.scenario.text}</span>
            </span>
            <ArrowRight size={18} className="shrink-0" aria-hidden />
          </button>
        )}
      </Container>

      <Container className="mt-10 max-w-[56rem]">
        <SectionTitle id="products-title" overline="Products in our research" title="Great Eastern products — checked facts only" />
        <p className="mt-2 text-body-sm text-ink-secondary">
          Listed for education, in no particular order. Facts come from official Great Eastern pages and PDSs checked on {PRODUCT_RESEARCH_DATE}. Anything we couldn't verify is marked as needing confirmation. Not a recommendation or quote, and not affiliated with Great Eastern.
        </p>
        {products.length ? (
          <ul className="mt-4 grid gap-3">
            {products.map((p) => (
              <li key={p.id}><ProductCard product={p} /></li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-2xl bg-sunken p-4 text-body-sm text-ink-secondary">No product in this category has officially verified facts in our research yet.</p>
        )}
      </Container>

      <Container className="mt-10 max-w-[56rem]">
        <h2 className="text-subheading text-navy-950">Sources</h2>
        <ul className="mt-2 grid gap-1.5">
          {c.sources.map((s) => (
            <li key={s.url}><SourceLink source={s} /></li>
          ))}
        </ul>
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
      </Container>
      <Disclaimer />
    </>
  );
}

function ListCard({ title, items, tone }: { title: string; items: string[]; tone: "good" | "bad" }) {
  return (
    <section className="rounded-2xl bg-surface p-4 ring-1 ring-ink/[0.07]" aria-label={title}>
      <h2 className="text-body font-semibold text-navy-950">{title}</h2>
      <ul className="mt-2 grid gap-2">
        {items.map((it) => (
          <li key={it} className="flex gap-2 text-body-sm text-ink-secondary">
            {tone === "good" ? (
              <Check size={17} className="mt-0.5 shrink-0 text-teal-700" aria-hidden />
            ) : (
              <X size={17} className="mt-0.5 shrink-0 text-crimson-600" aria-hidden />
            )}
            <span>{it}</span>
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

function ProductCard({ product: p }: { product: ResearchedProduct }) {
  const notice = p.evidence === "ISSUER_NOTICE";
  return (
    <article className={cn("rounded-2xl p-4 ring-1", notice ? "bg-gold-50 ring-gold-100" : "bg-surface ring-ink/[0.08]")} aria-labelledby={`p-${p.id}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 id={`p-${p.id}`} className="text-body font-semibold text-navy-950">{p.name}</h3>
          <p className="text-caption text-ink-muted">{p.issuer}</p>
        </div>
        <span className="flex flex-wrap gap-1.5">
          <Chip>{p.basis}</Chip>
          {notice ? <Chip tone="gold">Issuer notice</Chip> : <Chip tone="teal"><FileText size={12} aria-hidden /> Checked against official documents</Chip>}
        </span>
      </div>
      <dl className="mt-3 grid gap-2 text-body-sm">
        <Row term="Type">{p.type}</Row>
        <Row term="Status">{p.status}</Row>
        <Row term="How to apply">{p.howToApply}</Row>
      </dl>
      {p.verifiedFacts.length > 0 && (
        <div className="mt-3 rounded-xl bg-teal-50 p-3">
          <p className="text-caption font-bold uppercase tracking-[0.06em] text-teal-800">Verified facts</p>
          <dl className="mt-1.5 grid gap-1.5 text-body-sm">
            {p.verifiedFacts.map((f) => (
              <Row key={f.label} term={f.label}>{f.value}</Row>
            ))}
          </dl>
        </div>
      )}
      <div className="mt-3">
        <p className="text-caption font-bold uppercase tracking-[0.06em] text-gold-700">Needs official confirmation</p>
        <p className="mt-1 text-body-sm text-ink-secondary">{p.needsConfirmation.join(" · ")}</p>
      </div>
      {p.note && <p className="mt-2 flex gap-1.5 text-caption text-ink-secondary"><Info size={14} className="mt-0.5 shrink-0" aria-hidden />{p.note}</p>}
      <ul className="mt-3 grid gap-1">
        {p.sources.map((s) => (
          <li key={s.url}><SourceLink source={s} /></li>
        ))}
      </ul>
    </article>
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

function Chip({ children, tone }: { children: ReactNode; tone?: "teal" | "gold" }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold", tone === "teal" ? "bg-teal-50 text-teal-800" : tone === "gold" ? "bg-gold-100 text-gold-700" : "bg-sunken text-navy-900")}>
      {children}
    </span>
  );
}

function SectionTitle({ id, overline, title }: { id: string; overline: string; title: string }) {
  return (
    <div>
      <p className="text-overline uppercase tracking-[0.18em] text-teal-700">{overline}</p>
      <h2 id={id} className="mt-1 font-brand text-[1.75rem] font-semibold leading-tight text-navy-950 sm:text-[2rem]">{title}</h2>
    </div>
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

function Disclaimer() {
  return (
    <Container className="mt-8 max-w-[56rem] pb-6">
      <p className="flex gap-2 rounded-xl bg-sunken p-3 text-caption text-ink-secondary">
        <Info size={14} className="mt-0.5 shrink-0" aria-hidden />
        Educational information only — not financial advice, a recommendation, a quote or a promise of cover. Policy terms decide what is paid. For personal advice, speak to a licensed insurance or takaful adviser.
      </p>
    </Container>
  );
}
