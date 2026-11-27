import { cn } from "@/lib/cn";

export type Art = "shield" | "growth" | "umbrella";

/** Geometric illustration header — the default visual for lessons without photography. */
export function LessonArt({ art, tone }: { art: Art; tone: "teal" | "navy" | "crimson" }) {
  const bg = { teal: "bg-teal-50", navy: "bg-navy-50", crimson: "bg-crimson-50" }[tone];
  const main = { teal: "#297E85", navy: "#0F294A", crimson: "#C8102E" }[tone];
  const soft = { teal: "#B0DCDE", navy: "#C6D3E6", crimson: "#F6C4CD" }[tone];
  return (
    <div className={cn("relative h-full w-full overflow-hidden", bg)} aria-hidden>
      <svg
        viewBox="0 0 320 160"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
      >
        <circle cx="270" cy="20" r="70" fill={soft} opacity="0.6" />
        <circle cx="40" cy="150" r="44" fill={soft} opacity="0.5" />
        {art === "shield" && (
          <g transform="translate(130 28)">
            <path d="M30 0 60 12v26c0 22-13 38-30 46C13 76 0 60 0 38V12L30 0Z" fill={main} />
            <path
              d="m17 42 9 9 18-20"
              fill="none"
              stroke="#fff"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        )}
        {art === "growth" && (
          <g transform="translate(100 40)">
            {[18, 34, 52, 76].map((h, i) => (
              <rect
                key={i}
                x={i * 30}
                y={90 - h}
                width="20"
                height={h}
                rx="5"
                fill={i === 3 ? main : soft}
              />
            ))}
            <path
              d="M6 58 40 40l30 8 44-34"
              fill="none"
              stroke={main}
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="114" cy="14" r="6" fill={main} />
          </g>
        )}
        {art === "umbrella" && (
          <g transform="translate(110 26)">
            <path d="M50 4C22 4 2 26 0 52h100C98 26 78 4 50 4Z" fill={main} />
            <path
              d="M50 52v40c0 8-12 8-12 0"
              fill="none"
              stroke={main}
              strokeWidth="5"
              strokeLinecap="round"
            />
            <path
              d="M25 52c0-20 10-40 25-48 15 8 25 28 25 48"
              fill="none"
              stroke="#fff"
              strokeOpacity="0.35"
              strokeWidth="3"
            />
          </g>
        )}
      </svg>
    </div>
  );
}
