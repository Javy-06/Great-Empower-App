import { ArrowLeft, ArrowRight } from "lucide-react";
import { LifeTrackGame } from "@/app/LifeTrackGame";
import { Container } from "@/components/layout/Editorial";

export const LIFETRACK_HASH = "app/simulate/lifetrack";

export function openLifeTrack() {
  window.location.hash = LIFETRACK_HASH;
  window.scrollTo({ top: 0 });
}

const experience = [
  { label: "Roll", text: "Move through 20 spaces of your twenties." },
  { label: "Decide", text: "Each life event asks for one choice." },
  { label: "Reflect", text: "Watch five resources respond — no pass or fail." },
];

/**
 * Key art for the game poster: a winding life path with milestones. Decorative; it is not the
 * game board and does not reveal game content.
 */
function LifePathArt() {
  const stops = [
    { x: 60, y: 300, label: "First job", tone: "#7dc2c6" },
    { x: 200, y: 210, label: "Clinic visit", tone: "#e25a72" },
    { x: 330, y: 260, label: "Raya trip", tone: "#7dc2c6" },
    { x: 440, y: 140, label: "Car loan", tone: "#c6d3e6" },
    { x: 560, y: 70, label: "Your thirties", tone: "#ffffff", end: true },
  ];
  return (
    <svg viewBox="0 0 620 380" className="h-full w-full" role="presentation" aria-hidden>
      <defs>
        <linearGradient id="lt-path" x1="0" x2="1" y1="1" y2="0">
          <stop offset="0" stopColor="#297e85" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <path
        d="M20 340 C 90 300, 120 230, 200 210 S 300 300, 330 260 S 400 150, 440 140 S 520 90, 600 40"
        fill="none"
        stroke="url(#lt-path)"
        strokeWidth="3"
        strokeDasharray="2 10"
        strokeLinecap="round"
      />
      {stops.map(({ x, y, label, tone, end }, index) => (
        <g key={label}>
          <circle cx={x} cy={y} r={index === stops.length - 1 ? 14 : 9} fill={tone} />
          <circle
            cx={x}
            cy={y}
            r={index === stops.length - 1 ? 26 : 18}
            fill="none"
            stroke={tone}
            strokeOpacity="0.35"
          />
          <text
            x={end ? x - 34 : x + 22}
            y={end ? y + 44 : y + 5}
            textAnchor={end ? "end" : "start"}
            fill="#ffffff"
            fillOpacity="0.8"
            fontFamily="Inter, sans-serif"
            fontSize="15"
            fontWeight="600"
          >
            {label}
          </text>
        </g>
      ))}
      <g transform="translate(104 236)">
        <rect x="0" y="0" width="36" height="36" rx="8" fill="#c8102e" />
        <circle cx="11" cy="11" r="3" fill="#fff" />
        <circle cx="25" cy="25" r="3" fill="#fff" />
        <circle cx="18" cy="18" r="3" fill="#fff" />
      </g>
    </svg>
  );
}

/** Game poster: a destination of its own. The game itself only mounts on its route. */
export function LifeTrackPoster({ number }: { number?: string }) {
  return (
    <section
      aria-labelledby="lifetrack-title"
      className="relative overflow-hidden bg-navy-950 text-white"
    >
      <div
        className="pointer-events-none absolute -right-40 -top-40 size-[520px] rounded-full bg-teal-600/20 blur-3xl"
        aria-hidden
      />
      <Container className="relative grid gap-12 py-16 sm:py-20 lg:grid-cols-[5fr_7fr] lg:items-center lg:py-28">
        <div>
          <p className="flex items-center gap-3 text-overline uppercase text-teal-200">
            {number && <span className="tabular-nums">{number}</span>}
            {number && <span className="h-px w-8 bg-white/30" aria-hidden />}
            The game · about 10 minutes
          </p>
          <h2 id="lifetrack-title" className="mt-4 font-brand text-mega text-white">
            LifeTrack
          </h2>
          <p className="mt-5 max-w-md text-lede text-white/75">
            Play your twenties, one decision at a time.
          </p>
          <ol className="mt-8 grid gap-4 border-t border-white/15 pt-6">
            {experience.map(({ label, text }, index) => (
              <li key={label} className="grid grid-cols-[2.5rem_1fr] items-baseline">
                <span className="font-brand text-serif-title text-teal-200 tabular-nums">
                  {index + 1}
                </span>
                <span className="text-body-sm text-white/80">
                  <span className="font-semibold text-white">{label}.</span> {text}
                </span>
              </li>
            ))}
          </ol>
          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
            <button
              type="button"
              onClick={openLifeTrack}
              className="group inline-flex h-14 items-center gap-3 rounded-full bg-white px-7 text-body font-semibold text-navy-950 transition-colors hover:bg-teal-50"
            >
              Enter game
              <ArrowRight
                size={20}
                className="transition-transform group-hover:translate-x-1"
                aria-hidden
              />
            </button>
            <span className="text-caption text-white/55">
              Solo demo · no sign-in · nothing saved
            </span>
          </div>
        </div>
        <div className="relative aspect-[620/380] w-full">
          <LifePathArt />
        </div>
      </Container>
    </section>
  );
}

/** Dedicated game screen. The game mounts here only, and the player can always leave. */
export function LifeTrackScreen() {
  const back = () => {
    window.location.hash = "app/simulate";
    window.scrollTo({ top: 0 });
  };
  return (
    <>
      <div className="border-b border-white/10 bg-navy-950 text-white">
        <Container className="flex flex-wrap items-center justify-between gap-4 py-6">
          <div>
            <p className="text-overline uppercase text-teal-200">Simulate · Game</p>
            <h1 className="mt-1 font-brand text-chapter text-white">LifeTrack</h1>
          </div>
          <button
            type="button"
            onClick={back}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-white/30 px-5 text-body-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            <ArrowLeft size={16} aria-hidden /> Exit game
          </button>
        </Container>
      </div>
      <div className="bg-sand-50">
        <Container className="py-10 sm:py-12">
          <LifeTrackGame />
        </Container>
      </div>
    </>
  );
}
