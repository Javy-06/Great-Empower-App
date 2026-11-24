import { useEffect, useState } from "react";
import { EmergencyFundCalculator } from "@/components/cards/SimulateCards";
import { Band, Chapter, Container } from "@/components/layout/Editorial";
import { MedicalClaimSimulator } from "./MedicalClaimSimulator";
import { LIFETRACK_HASH, LifeTrackPoster, LifeTrackScreen } from "./lifetrack/LifeTrackLauncher";

const isGameRoute = () => window.location.hash.replace(/^#/, "") === LIFETRACK_HASH;

const moments = [
  { title: "Sudden hospital stay", status: "Try it above" },
  { title: "Your first car loan", status: "Coming soon" },
  { title: "Cracked phone screen", status: "Coming soon" },
  { title: "What-if comparisons", status: "Coming soon" },
];

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
    <>
      <Band tone="night" labelledBy="simulate-title" className="!pb-12 sm:!pb-14 lg:!pb-16">
        <Container>
          <Chapter
            as="h1"
            label="Simulate"
            id="simulate-title"
            onDark
            title="Rehearse the hard moments."
            lede="Hypothetical scenarios, real arithmetic. Every figure here is illustrative."
          />
        </Container>
      </Band>

      {/* The functional centre of the product: the claim simulator on its own stage. */}
      <Band tone="paper" labelledBy="claim-stage-title" className="!pt-12 sm:!pt-14 lg:!pt-16">
        <Container className="max-w-[1040px]">
          <p className="mb-6 flex items-center gap-3 text-overline uppercase text-teal-700">
            <span className="tabular-nums">01</span>
            <span className="h-px w-8 bg-ink/20" aria-hidden />
            Medical claim
          </p>
          <h2 id="claim-stage-title" className="sr-only">
            Medical claim simulator
          </h2>
          <MedicalClaimSimulator />
        </Container>
      </Band>

      <Band tone="canvas" id="simulate-calculators" labelledBy="fund-title">
        <Container className="grid gap-12 lg:grid-cols-[5fr_7fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <Chapter
              number="02"
              label="Emergency fund"
              id="fund-title"
              title="How long would your savings last?"
              lede="Months of essentials your savings could cover. A rule of thumb, not a target."
            />
            <a
              href="#app/guide/article/emergency-fund"
              className="mt-6 inline-flex min-h-11 items-center text-body-sm font-semibold text-navy-800 underline underline-offset-4 hover:text-navy-950"
            >
              Read “Building an emergency fund”
            </a>
          </div>
          <EmergencyFundCalculator />
        </Container>
      </Band>

      <div id="simulate-game" className="scroll-mt-16">
        <LifeTrackPoster number="03" />
      </div>

      <Band tone="paper" id="simulate-scenarios" labelledBy="moments-title">
        <Container>
          <Chapter
            number="04"
            label="Life moments"
            id="moments-title"
            title="More walkthroughs are on the way."
          />
          <ul className="mt-10 border-t border-ink/15">
            {moments.map(({ title, status }) => (
              <li
                key={title}
                className="flex items-baseline justify-between gap-6 border-b border-ink/15 py-5"
              >
                <span className="font-brand text-serif-title text-navy-950">{title}</span>
                <span className="shrink-0 text-caption font-semibold uppercase tracking-[0.12em] text-ink-muted">
                  {status}
                </span>
              </li>
            ))}
          </ul>
        </Container>
      </Band>
    </>
  );
}
