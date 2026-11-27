import { ArrowRight, ClipboardCheck, Globe, Scale, ShieldCheck, UserRound, Search } from "lucide-react";
import { Container } from "@/components/layout/Editorial";
import { protectionCategories } from "@/data/protection";
import { categoryIcons, categoryTones } from "@/app/protection/ProtectionHub";
import { cn } from "@/lib/cn";

const go = (hash: string, top = false) => {
  window.location.hash = hash;
  if (top) window.scrollTo({ top: 0 });
};

/**
 * GREAT EMPOWER 2.0 journey, shown at the top of Protect:
 * Check → See gaps → Understand cover → Compare products → Get cover. Every step stays in Protect;
 * "Get cover" is a handoff to the insurer or a licensed adviser, never an application in the app.
 */
const steps = [
  { n: 1, label: "Check", hint: "8 quick answers", icon: ClipboardCheck, to: "app/protect/check" },
  { n: 2, label: "See gaps", hint: "From your answers", icon: Search, to: "#protect-gaps" },
  { n: 3, label: "Understand", hint: "Five kinds of cover", icon: ShieldCheck, to: "#protect-cover" },
  { n: 4, label: "Compare", hint: "Verified products", icon: Scale, to: "app/protect/products" },
  { n: 5, label: "Apply", hint: "In the app", icon: UserRound, to: "app/protect/get-cover" },
];

export function ProtectJourney() {
  return (
    <Container className="mt-6">
      <nav aria-label="Your protection journey">
        <ol className="-mx-5 flex snap-x scroll-px-5 gap-2 overflow-x-auto px-5 pb-1 scrollbar-none sm:mx-0 sm:grid sm:grid-cols-5 sm:overflow-visible sm:px-0">
          {steps.map((s, i) => (
            <li key={s.n} className="relative w-[8.5rem] shrink-0 snap-start sm:w-auto">
              {i < steps.length - 1 && <span className="absolute left-[2.6rem] right-[-0.5rem] top-[1.6rem] hidden h-px bg-navy-200 sm:block" aria-hidden />}
              <button
                type="button"
                onClick={() => (s.to.startsWith("#") ? document.getElementById(s.to.slice(1))?.scrollIntoView({ behavior: "smooth" }) : go(s.to, true))}
                className="group relative flex w-full flex-col items-start gap-2 rounded-2xl p-2 text-left hover:bg-navy-50/60"
              >
                <span className="relative inline-flex size-10 items-center justify-center rounded-full bg-navy-900 text-white ring-4 ring-canvas">
                  <s.icon size={18} aria-hidden />
                  <span className="absolute -right-1 -top-1 inline-flex size-5 items-center justify-center rounded-full bg-crimson-600 text-[12px] font-bold">{s.n}</span>
                </span>
                <span>
                  <span className="block text-body-sm font-semibold text-navy-950">{s.label}</span>
                  <span className="block text-caption text-ink-muted">{s.hint}</span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </nav>
    </Container>
  );
}

const channels = [
  { icon: Globe, title: "Apply in GREAT EMPOWER", text: "Fill in your application here, step by step, and review it before you finish." },
  { icon: UserRound, title: "Talk to an adviser", text: "Want help first? A licensed agent or adviser can explain your options." },
];

/** Understand → Compare → Apply: the five kinds of cover, the product explorer and how people get cover. */
export function ExploreCover() {
  return (
    <>
      <Container className="mt-9 scroll-mt-24" id="protect-cover">
        <h2 className="font-brand text-[1.875rem] font-semibold leading-tight text-navy-950">Five kinds of cover</h2>
        <p className="mt-0.5 text-body-sm text-ink-secondary">What each one does — and doesn&apos;t.</p>
        <ul className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-5">
          {protectionCategories.map((c) => {
            const Icon = categoryIcons[c.slug];
            return (
              <li key={c.slug} className="last:col-span-2 sm:last:col-span-1">
                <button
                  type="button"
                  onClick={() => go(`app/learn/protection/${c.slug}`)}
                  className="group flex h-full w-full flex-col gap-3 rounded-2xl bg-surface p-3.5 text-left ring-1 ring-ink/[0.08] transition-shadow hover:shadow-e2"
                >
                  <span className={cn("inline-flex size-11 items-center justify-center rounded-xl", categoryTones[c.slug])}>
                    <Icon size={22} aria-hidden />
                  </span>
                  <span>
                    <span className="block text-body-sm font-semibold leading-snug text-navy-950">{c.purpose}</span>
                    <span className="mt-0.5 block text-caption text-ink-muted">{c.event}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </Container>

      <Container className="mt-9">
        <button
          type="button"
          onClick={() => go("app/protect/products", true)}
          className="group relative flex w-full items-center gap-4 overflow-hidden rounded-[1.25rem] bg-navy-950 p-5 text-left text-white shadow-e2 sm:p-6"
        >
          <span className="pointer-events-none absolute -right-10 -top-16 size-48 rounded-full bg-teal-600/25" aria-hidden />
          <span className="relative inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/10"><Scale size={24} aria-hidden /></span>
          <span className="relative min-w-0 flex-1">
            <span className="block font-brand text-[1.5rem] font-semibold leading-tight">Explore and compare products</span>
            <span className="mt-0.5 block text-body-sm text-white/80">8 products with facts verified in official documents. Side by side — no rankings or prices.</span>
          </span>
          <ArrowRight size={20} className="relative shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </button>
      </Container>

      <Container className="mt-9 scroll-mt-24" id="protect-apply">
        <h2 className="font-brand text-[1.875rem] font-semibold leading-tight text-navy-950">Get cover</h2>
        <p className="mt-0.5 text-body-sm text-ink-secondary">When you&apos;re ready: understand a kind of cover, get ready, then apply in the app.</p>
        <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
          {channels.map((c) => (
            <li key={c.title} className="flex gap-3 rounded-2xl bg-surface p-4 ring-1 ring-ink/[0.08]">
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-800"><c.icon size={19} aria-hidden /></span>
              <span>
                <span className="block text-body-sm font-semibold text-navy-950">{c.title}</span>
                <span className="block text-caption text-ink-secondary">{c.text}</span>
              </span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => go("app/protect/get-cover", true)}
          className="mt-3 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-crimson-600 text-body-sm font-bold text-white hover:bg-crimson-700 sm:w-auto sm:px-6"
        >
          Explore cover options <ArrowRight size={16} aria-hidden />
        </button>
        <p className="mt-2 text-caption text-ink-muted">
          GREAT EMPOWER is independent and doesn&apos;t sell insurance. Applications completed here stay on your device and aren&apos;t sent to an insurer yet, so they don&apos;t give you cover.
        </p>
      </Container>
    </>
  );
}
