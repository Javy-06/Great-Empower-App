import { useEffect, useState } from "react";
import { ArrowRight, Check, ChartColumn, ClipboardCheck, ExternalLink, Info, ShieldAlert, ShieldCheck, Target } from "lucide-react";
import { ChecklistSpot, DiagnosisSpot, FamilyUmbrellaSpot, HospitalSpot, IncomePauseSpot } from "@/components/illustrations/Spots";
import { EmergencyFundCalculator } from "@/components/cards/SimulateCards";
import { Container } from "@/components/layout/Editorial";
import { PageHero } from "@/components/layout/PageHero";
import { cn } from "@/lib/cn";
import { MedicalClaimSimulator } from "./MedicalClaimSimulator";
import { type GeIconName } from "@/components/illustrations/GeIcons";
import { CiRunwayScenario, FamilyProtectionScenario } from "./protection/ProtectionScenarios";
import { TermExplainer } from "./protection/TermExplainer";

const TOOL_IDS = ["tool-bill", "tool-fund", "tool-family", "tool-ci"] as const;

/**
 * Simulate = hypothetical "what if" tools only. The personal check and the "plan" moved to Protect
 * (`#app/protect/check`), so Simulate never asks for a profile and never stands in for applying.
 * Routes: `#app/simulate` (first tool) and `#app/simulate/needs/<tool-id>` (that tool, kept for old links).
 */
function readTool(): ToolId | undefined {
  const parts = window.location.hash.replace(/^#/, "").split("/");
  if (parts[0] !== "app" || parts[1] !== "simulate") return undefined;
  return TOOL_IDS.find((t) => t === (parts[2] === "needs" ? parts[3] : parts[2]));
}

const go = (hash: string) => {
  window.location.hash = hash;
  window.scrollTo({ top: 0 });
};

export function SimulateHub() {
  const [initial] = useState(readTool);
  const [tool, setTool] = useState<ToolId>(initial ?? "tool-bill");
  const focusTools = () => window.setTimeout(() => document.getElementById("needs-tools")?.scrollIntoView({ block: "start" }), 60);
  useEffect(() => {
    // A deep link while Simulate is already open (e.g. back/forward): switch to that tool.
    const onHash = () => {
      const t = readTool();
      if (t) {
        setTool(t);
        focusTools();
      }
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  useEffect(() => {
    if (!initial) return;
    const t = focusTools();
    return () => window.clearTimeout(t);
  }, [initial]);

  return (
    <>
      <PageHero
        eyebrow="Cover simulation"
        title="Try a real-life scenario."
        text="See how cover could work, what you may pay, and what a plan could cover. Hypothetical numbers you choose."
        image="/images/pexels/protection-medical-hospital-rest.webp"
        imagePosition="60% 35%"
        backLabel="Simulate"
        onBack={() => go("app/home")}
        titleId="simulate-title"
      />
      <NeedsStep tool={tool} onTool={setTool} />
    </>
  );
}

type ToolId = (typeof TOOL_IDS)[number];

const tools: Array<{ id: ToolId; title: string; short: string; sub: string; hint: string; need: string; cant: string; icon: GeIconName }> = [
  { id: "tool-bill", title: "Medical bill", short: "Medical bill", sub: "Hospitalisation and treatment", hint: "How a hospital bill is shared between you, an employer and a plan.", need: "A bill amount and the plan settings you want to try: deductible, co-payment and limit.", cant: "Whether a real policy would pay. Only the insurer decides a claim.", icon: "heartPulse" },
  { id: "tool-fund", title: "Emergency fund", short: "Emergency fund", sub: "Months your savings could last", hint: "How many months your savings could cover essentials.", need: "Your savings and your essential monthly costs.", cant: "How much you personally should save.", icon: "cash" },
  { id: "tool-family", title: "Family protection", short: "Family", sub: "What your loved ones might need", hint: "What your dependants might need, compared with life cover you count. Life insurance doesn't cancel debts.", need: "Monthly support for the people who depend on you, for how long, and cover you already count.", cant: "How much life cover to buy.", icon: "family" },
  { id: "tool-ci", title: "Critical illness runway", short: "Critical illness", sub: "A lump sum vs a year of recovery", hint: "A critical illness payout is a one-off lump sum, not a salary. Compare it with a recovery period.", need: "A lump-sum amount and your monthly costs while you recover.", cant: "Whether a diagnosis would qualify for a payout.", icon: "ribbon" },
];


const toolArt: Record<ToolId, (p: { className?: string }) => React.ReactNode> = {
  "tool-bill": HospitalSpot,
  "tool-fund": IncomePauseSpot,
  "tool-family": FamilyUmbrellaSpot,
  "tool-ci": DiagnosisSpot,
};

const learnMore: Partial<Record<ToolId, { href: string; label: string }>> = {
  "tool-bill": { href: "#app/learn/protection/medical", label: "About medical cover" },
  "tool-fund": { href: "#app/guide/article/emergency-fund", label: "Read “Building an emergency fund”" },
  "tool-family": { href: "#app/learn/protection/life", label: "About life cover" },
  "tool-ci": { href: "#app/learn/protection/critical-illness", label: "About critical illness cover" },
};

/** One tool at a time: a tab switcher instead of four tools stacked on one long page. */
function NeedsStep({ tool, onTool }: { tool: ToolId; onTool: (t: ToolId) => void }) {
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
        <h2 className="flex items-center gap-3 font-brand text-[1.875rem] font-semibold text-navy-950">
          <span className="h-7 w-1.5 rounded-full bg-teal-600" aria-hidden />
          Pick a scenario
        </h2>
        <div role="tablist" aria-label="Simulation scenarios" className="mt-3 grid grid-cols-2 gap-2.5 sm:gap-3">
          {tools.map((t, i) => {
            const on = t.id === tool;
            const Art = toolArt[t.id];
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
                  "relative flex min-h-[9.5rem] flex-col items-start gap-2 rounded-[1.25rem] p-3 text-left transition-[box-shadow,background-color] sm:min-h-[8.5rem] sm:flex-row sm:items-center sm:gap-4 sm:p-4",
                  on ? "bg-navy-900 text-white shadow-e2" : "bg-surface text-navy-950 shadow-e1 ring-1 ring-ink/[0.06] hover:shadow-e2",
                )}
              >
                <span className={cn("flex size-16 shrink-0 items-center justify-center rounded-2xl sm:size-20", on ? "bg-white/10" : "bg-sunken/70")}>
                  <Art className="w-14 sm:w-[4.5rem]" />
                </span>
                <span className="min-w-0 pr-5">
                  <span className="block text-body font-bold leading-snug sm:text-[1.125rem]">{t.short}</span>
                  <span className={cn("mt-0.5 block text-caption sm:text-body-sm", on ? "text-white/85" : "text-ink-secondary")}>{t.sub}</span>
                </span>
                {on && (
                  <span className="absolute right-2.5 top-2.5 inline-flex size-6 items-center justify-center rounded-full bg-white text-navy-900" aria-hidden>
                    <Check size={15} strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <section aria-label={`About the ${active.title.toLowerCase()} scenario`} className="mt-4 grid gap-4 rounded-[1.25rem] bg-teal-50/70 p-4 ring-1 ring-teal-100 sm:grid-cols-[9rem_1fr] sm:items-center sm:p-5">
          <ChecklistSpot className="hidden w-32 sm:block" />
          <dl className="grid gap-3 sm:border-l sm:border-teal-200 sm:pl-5">
            {[
              { icon: Target, k: "What it shows", v: active.hint },
              { icon: ChartColumn, k: "You'll need", v: active.need },
              { icon: Info, k: "It can't tell you", v: active.cant },
            ].map(({ icon: Icon, k, v }) => (
              <div key={k} className="relative min-h-9 pl-12">
                <dt className="text-caption font-bold uppercase tracking-[0.12em] text-teal-800">
                  <span className="absolute left-0 top-0 inline-flex size-9 items-center justify-center rounded-full bg-white text-teal-700 ring-1 ring-teal-200"><Icon size={18} aria-hidden /></span>
                  {k}
                </dt>
                <dd className="mt-0.5 text-body-sm text-navy-950">{v}</dd>
              </div>
            ))}
          </dl>
        </section>
        {more && (
          <p className="mt-3 flex items-center gap-2 text-body-sm text-ink-secondary">
            <ExternalLink size={15} className="shrink-0 text-navy-700" aria-hidden />
            <span>New to this? <a href={more.href} className="font-semibold text-navy-800 underline underline-offset-2">{more.label}</a></span>
          </p>
        )}
        <p role="note" className="mt-4 flex gap-2.5 rounded-2xl bg-gold-50 p-3 text-body-sm text-navy-950 ring-1 ring-gold-100">
          <ShieldAlert size={18} className="mt-0.5 shrink-0 text-gold-700" aria-hidden />
          <span>
            <span className="font-semibold">An educational simulation, not a claim.</span> It can&apos;t tell you whether a real insurer would approve a claim. Actual policy terms, exclusions, limits and the insurer&apos;s decision apply.
          </span>
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
            Key terms, in pictures
            <ArrowRight size={16} className="rotate-90 transition-transform group-open:-rotate-90" aria-hidden />
          </summary>
          <div className="pb-4">
            <TermExplainer />
            <p className="mt-3 text-caption text-ink-muted">
              Sources:{" "}
              <a className="underline" href="https://www.bnm.gov.my/documents/20124/938039/pd_mhit_dec25.pdf" target="_blank" rel="noreferrer">BNM MHIT policy document</a>
              {" · "}
              <a className="underline" href="https://insuranceinfo.com.my/learn-the-basics/insurance-glossary/" target="_blank" rel="noreferrer">InsuranceInfo glossary</a>
              . Plans differ — check your own policy wording.
            </p>
          </div>
        </details>
        <section aria-labelledby="sim-next" className="mt-5 rounded-2xl bg-navy-950 p-5 text-white">
          <h2 id="sim-next" className="font-brand text-[1.5rem] font-semibold leading-tight">What next?</h2>
          <p className="mt-1 text-body-sm text-white/75">A scenario shows what could happen. To look at your own situation, or at cover, go to Protect.</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <button type="button" onClick={() => go("app/protect/check")} className="flex min-h-12 items-center justify-between gap-2 rounded-xl bg-white px-4 text-left text-body-sm font-semibold text-navy-950">
              <span className="inline-flex items-center gap-2"><ClipboardCheck size={17} aria-hidden /> Check your protection</span> <ArrowRight size={16} aria-hidden />
            </button>
            <button type="button" onClick={() => go("app/protect/get-cover")} className="flex min-h-12 items-center justify-between gap-2 rounded-xl px-4 text-left text-body-sm font-semibold text-white ring-1 ring-white/30">
              <span className="inline-flex items-center gap-2"><ShieldCheck size={17} aria-hidden /> Explore cover options</span> <ArrowRight size={16} aria-hidden />
            </button>
          </div>
        </section>
      </Container>
    </>
  );
}
