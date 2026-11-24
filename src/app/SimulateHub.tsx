import { useEffect, useState } from "react";
import { Car, Hospital, Scale, Smartphone } from "lucide-react";
import { EmergencyFundCalculator } from "@/components/cards/SimulateCards";
import { ListRow, PageHeader, SectionHeader } from "@/components/layout/Page";
import { MedicalClaimSimulator } from "./MedicalClaimSimulator";
import { LIFETRACK_HASH, LifeTrackLauncher, LifeTrackScreen } from "./lifetrack/LifeTrackLauncher";

const jumpLinks = [
  { id: "medical-claim-simulator", label: "Medical claim" },
  { id: "simulate-calculators", label: "Emergency fund" },
  { id: "simulate-game", label: "LifeTrack" },
  { id: "simulate-scenarios", label: "Life moments" },
];

const isGameRoute = () => window.location.hash.replace(/^#/, "") === LIFETRACK_HASH;

/** Simulate destination. The LifeTrack game is a separate screen, mounted only on its own route. */
export function SimulateHub() {
  const [inGame, setInGame] = useState(isGameRoute);
  useEffect(() => {
    const onHash = () => setInGame(isGameRoute());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  if (inGame) return <LifeTrackScreen />;

  return (
    <div className="flex flex-col gap-12 md:gap-16">
      <PageHeader
        eyebrow="Simulate"
        tone="teal"
        title="Try it before it happens."
        lede="Walk through a hospital bill, size an emergency fund, or play a year of decisions. Every figure here is illustrative."
      />

      <nav aria-label="On this page" className="-mt-6 flex flex-wrap gap-2 md:-mt-10">
        {jumpLinks.map(({ id, label }) => (
          <a
            key={id}
            href={`#${id}`}
            onClick={(event) => {
              event.preventDefault();
              document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="inline-flex min-h-11 items-center rounded-full border border-line bg-surface px-4 text-body-sm font-semibold text-navy-900 transition-colors hover:border-navy-300 hover:bg-navy-50"
          >
            {label}
          </a>
        ))}
      </nav>

      <MedicalClaimSimulator />

      <section id="simulate-calculators" aria-labelledby="calculators-title" className="scroll-mt-24">
        <SectionHeader id="calculators-title" title="Emergency fund" />
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <EmergencyFundCalculator />
          <div className="flex flex-col gap-4 text-body-sm text-ink-secondary">
            <p className="text-body text-ink">
              A cash buffer is what keeps a surprise bill from becoming debt.
            </p>
            <p>
              Move the sliders to see how many months of essential costs you could cover. The
              target is a planning rule of thumb, not a personal recommendation.
            </p>
            <p className="border-l-2 border-teal-600 pl-3 text-ink-muted">
              Want the background first?{" "}
              <a
                href="#app/guide/article/emergency-fund"
                className="font-semibold text-navy-800 underline underline-offset-4 hover:text-navy-900"
              >
                Read “Building an emergency fund”
              </a>
            </p>
          </div>
        </div>
      </section>

      <div id="simulate-game" className="scroll-mt-24">
        <LifeTrackLauncher />
      </div>

      <section id="simulate-scenarios" aria-labelledby="scenarios-title" className="scroll-mt-24">
        <SectionHeader
          id="scenarios-title"
          title="Life moments"
          description="Situations we are building walkthroughs for."
        />
        <div className="divide-y divide-line">
          <ListRow
            icon={Hospital}
            tone="crimson"
            title="Sudden hospital stay"
            description="How an admission can affect savings and plans — try it now in the medical claim simulator above."
            meta="Health · Cash"
          />
          <ListRow
            icon={Car}
            title="Your first car"
            description="Loan length versus monthly cash flow."
            meta="Coming soon"
          />
          <ListRow
            icon={Smartphone}
            tone="teal"
            title="Phone screen cracked"
            description="Emergency savings versus an unexpected repair."
            meta="Coming soon"
          />
          <ListRow
            icon={Scale}
            tone="neutral"
            title="What-if comparisons"
            description="Compare savings, timing and unexpected expenses side by side."
            meta="Coming soon"
          />
        </div>
      </section>
    </div>
  );
}
