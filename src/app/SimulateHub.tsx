import { useEffect, useState } from "react";
import { ArrowRight, ClipboardCheck, ShieldCheck } from "lucide-react";
import { EmergencyFundCalculator } from "@/components/cards/SimulateCards";
import { Container } from "@/components/layout/Editorial";
import { PageHero } from "@/components/layout/PageHero";
import { cn } from "@/lib/cn";
import { MedicalClaimSimulator } from "./MedicalClaimSimulator";
import { GeIcon, type GeIconName } from "@/components/illustrations/GeIcons";
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
        eyebrow="Simulate"
        title="Try a what-if before it happens."
        text="Hypothetical scenarios with numbers you choose. Nothing here checks your cover, gives a quote or applies for anything."
        image="/images/pexels/young-asian-students-learning-together.webp"
        imagePosition="65% 25%"
        backLabel="Simulate"
        onBack={() => go("app/home")}
        titleId="simulate-title"
      />
      <NeedsStep tool={tool} onTool={setTool} />
    </>
  );
}

type ToolId = (typeof TOOL_IDS)[number];

const tools: Array<{ id: ToolId; title: string; short: string; hint: string; need: string; cant: string; icon: GeIconName }> = [
  { id: "tool-bill", title: "Medical bill", short: "Medical bill", hint: "How a hospital bill is shared between you, an employer and a plan.", need: "A bill amount and the plan settings you want to try: deductible, co-payment and limit.", cant: "Whether a real policy would pay. Only the insurer decides a claim.", icon: "heartPulse" },
  { id: "tool-fund", title: "Emergency fund", short: "Emergency fund", hint: "How many months your savings could cover essentials.", need: "Your savings and your essential monthly costs.", cant: "How much you personally should save.", icon: "cash" },
  { id: "tool-family", title: "Family protection", short: "Family", hint: "What your dependants might need, compared with life cover you count. Life insurance doesn't cancel debts.", need: "Monthly support for the people who depend on you, for how long, and cover you already count.", cant: "How much life cover to buy.", icon: "family" },
  { id: "tool-ci", title: "Critical illness runway", short: "Critical illness", hint: "A critical illness payout is a one-off lump sum, not a salary. Compare it with a recovery period.", need: "A lump-sum amount and your monthly costs while you recover.", cant: "Whether a diagnosis would qualify for a payout.", icon: "ribbon" },
];


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
        <h2 className="font-brand text-[1.875rem] font-semibold text-navy-950">Pick a scenario</h2>
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
        <dl className="mt-3 grid gap-x-6 gap-y-2 rounded-2xl bg-surface p-4 text-body-sm ring-1 ring-ink/[0.07] sm:grid-cols-3">
          <div>
            <dt className="text-caption font-semibold uppercase tracking-[0.1em] text-ink-muted">What it shows</dt>
            <dd className="mt-0.5 text-navy-950">{active.hint}</dd>
          </div>
          <div>
            <dt className="text-caption font-semibold uppercase tracking-[0.1em] text-ink-muted">You&apos;ll need</dt>
            <dd className="mt-0.5 text-navy-950">{active.need}</dd>
          </div>
          <div>
            <dt className="text-caption font-semibold uppercase tracking-[0.1em] text-ink-muted">It can&apos;t tell you</dt>
            <dd className="mt-0.5 text-navy-950">{active.cant}</dd>
          </div>
        </dl>
        {more && (
          <p className="mt-2 text-body-sm text-ink-secondary">
            New to this? <a href={more.href} className="font-semibold text-navy-800 underline underline-offset-2">{more.label}</a>
          </p>
        )}
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
