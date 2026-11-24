import { ArrowLeft, ArrowRight, BriefcaseBusiness, Dice5, Hospital, Plane, Route } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LifeTrackBoard } from "@/components/cards/SimulateCards";
import { LifeTrackGame } from "@/app/LifeTrackGame";
import { cn } from "@/lib/cn";

export const LIFETRACK_HASH = "app/simulate/lifetrack";

export function openLifeTrack() {
  window.location.hash = LIFETRACK_HASH;
  window.scrollTo({ top: 0 });
}

const learnings = ["Emergency savings", "Health costs", "Income shocks", "Protection limits"];

const miniTiles = [
  { label: "Start", icon: Route, cls: "border-navy-900 bg-navy-900 text-white" },
  { label: "First job", icon: BriefcaseBusiness, cls: "border-teal-200 bg-teal-50 text-teal-800" },
  { label: "Clinic visit", icon: Hospital, cls: "border-crimson-200 bg-crimson-50 text-crimson-700" },
  { label: "Raya trip", icon: Plane, cls: "border-teal-200 bg-teal-50 text-teal-800" },
];

/**
 * Game launcher. Shows the game's identity and what it teaches; the game itself is only
 * mounted after the player chooses "Enter game" (see LifeTrackScreen).
 */
export function LifeTrackLauncher({ compact = false }: { compact?: boolean }) {
  return (
    <section
      aria-labelledby="lifetrack-launcher-title"
      className="overflow-hidden rounded-3xl bg-navy-900 text-white"
    >
      <div className={cn("grid", compact ? "md:grid-cols-[1fr_0.9fr]" : "lg:grid-cols-[1fr_1fr]")}>
        <div className="flex flex-col p-6 sm:p-8">
          <p className="inline-flex items-center gap-2 text-overline uppercase text-teal-200">
            <Dice5 size={14} aria-hidden /> Game · about 10 minutes
          </p>
          <h2
            id="lifetrack-launcher-title"
            className="mt-3 font-brand text-serif-title text-white md:text-serif-hero"
          >
            LifeTrack
          </h2>
          <p className="mt-2 max-w-md text-body text-white/80">
            Play your twenties one decision at a time. Roll, land on a life event, choose — and
            watch five resources respond.
          </p>
          {!compact && (
            <ul className="mt-5 flex flex-wrap gap-2" aria-label="What you will practise">
              {learnings.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-white/20 px-3 py-1 text-caption font-medium text-white/85"
                >
                  {item}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button variant="inverse" trailingIcon={ArrowRight} onClick={openLifeTrack}>
              Enter game
            </Button>
            <span className="text-caption text-white/65">Solo demo · no sign-in · nothing saved</span>
          </div>
        </div>
        <div className="relative bg-navy-800/60 px-6 pb-6 sm:hidden" aria-hidden>
          {/* Phones: a compact four-space strip instead of the full board art. */}
          <div className="grid grid-cols-4 gap-2 rounded-2xl bg-white p-2.5 shadow-e3">
            {miniTiles.map(({ label, icon: Icon, cls }) => (
              <div
                key={label}
                className={cn(
                  "flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border text-center",
                  cls,
                )}
              >
                <Icon size={16} strokeWidth={1.75} />
                <span className="text-[11px] font-semibold leading-tight">{label}</span>
              </div>
            ))}
          </div>
        </div>
        <div
          className="relative hidden items-center justify-center bg-navy-800/60 p-6 sm:flex sm:p-8"
          aria-hidden
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-3 shadow-e3">
            <LifeTrackBoard position={2} />
          </div>
        </div>
      </div>
    </section>
  );
}

/** Dedicated game screen. The game mounts here only, and the player can always return. */
export function LifeTrackScreen() {
  const back = () => {
    window.location.hash = "app/simulate";
    window.scrollTo({ top: 0 });
  };
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div className="min-w-0">
          <p className="text-overline uppercase text-teal-700">Simulate · Game</p>
          <h1 className="mt-1 font-brand text-serif-title text-navy-900">LifeTrack</h1>
        </div>
        <Button variant="secondary" size="sm" leadingIcon={ArrowLeft} onClick={back}>
          Back to Simulate
        </Button>
      </div>
      <LifeTrackGame />
    </div>
  );
}
