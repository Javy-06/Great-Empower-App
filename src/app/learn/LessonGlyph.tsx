import { cn } from "@/lib/cn";

/**
 * Lesson glyphs: small bespoke motifs per lesson on a tile tinted by category, so each lesson
 * is recognisable at a glance instead of sharing one generic document icon.
 */
const categoryTile: Record<string, { bg: string; ink: string; soft: string }> = {
  "financial-wellness": { bg: "from-gold-50 to-gold-100", ink: "#8a6516", soft: "#e2c071" },
  protection: { bg: "from-teal-50 to-teal-100", ink: "#22666c", soft: "#7dc2c6" },
  "life-planning": { bg: "from-navy-50 to-navy-100", ink: "#0f294a", soft: "#9cb2d2" },
  practical: { bg: "from-crimson-50 to-crimson-100", ink: "#b81422", soft: "#ee96a5" },
};

function Motif({ id, ink, soft }: { id: string; ink: string; soft: string }) {
  switch (id) {
    case "money-talks": // two speech bubbles + coin
      return (
        <>
          <rect x="8" y="12" width="26" height="18" rx="6" fill={soft} />
          <path d="M14 30l-2 6 7-6" fill={soft} />
          <rect x="22" y="22" width="26" height="18" rx="6" fill={ink} />
          <path d="M42 40l2 6-7-6" fill={ink} />
          <circle cx="35" cy="31" r="4.5" fill="#fff" />
        </>
      );
    case "medical-cards": // insurance card with cross
      return (
        <>
          <rect x="8" y="16" width="40" height="26" rx="5" fill={ink} />
          <rect x="8" y="22" width="40" height="5" fill={soft} />
          <path d="M34 31h3v-3h3v3h3v3h-3v3h-3v-3h-3z" fill="#fff" />
          <rect x="13" y="32" width="12" height="3" rx="1.5" fill="#fff" opacity=".7" />
        </>
      );
    case "emergency-fund": // jar with coins
      return (
        <>
          <rect x="16" y="12" width="24" height="5" rx="2" fill={ink} />
          <path d="M14 20h28v20a6 6 0 0 1-6 6H20a6 6 0 0 1-6-6z" fill={soft} />
          <circle cx="24" cy="38" r="4" fill={ink} />
          <circle cx="32" cy="33" r="4" fill={ink} />
          <circle cx="29" cy="41" r="3.5" fill={ink} opacity=".7" />
        </>
      );
    case "hospital-bills": // receipt with cross
      return (
        <>
          <path d="M14 8h28v40l-4-3-4 3-4-3-4 3-4-3-4 3-4-3z" fill="#fff" stroke={ink} strokeWidth="2.5" />
          <path d="M25 15h6v5h5v6h-5v5h-6v-5h-5v-6h5z" fill={ink} />
          <rect x="19" y="36" width="18" height="3" rx="1.5" fill={soft} />
        </>
      );
    case "income-replacement": // shield over salary line
      return (
        <>
          <path d="M8 40l10-8 8 5 10-11 12 6" fill="none" stroke={soft} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M28 10l12 5v9c0 8-5 13-12 16-7-3-12-8-12-16v-9z" fill={ink} />
          <path d="M23 24l4 4 7-8" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </>
      );
    case "first-salary": // payslip with RM
      return (
        <>
          <rect x="12" y="8" width="32" height="40" rx="4" fill="#fff" stroke={ink} strokeWidth="2.5" />
          <text x="28" y="27" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="11" fill={ink}>RM</text>
          <rect x="18" y="33" width="20" height="3" rx="1.5" fill={soft} />
          <rect x="18" y="39" width="14" height="3" rx="1.5" fill={soft} />
        </>
      );
    case "deductibles": // split bill pie
      return (
        <>
          <circle cx="28" cy="28" r="18" fill={soft} />
          <path d="M28 10a18 18 0 0 1 17 12L28 28z" fill={ink} />
          <path d="M28 28l17-6a18 18 0 0 1-6 19z" fill={ink} opacity=".55" />
        </>
      );
    default: // generic book
      return (
        <>
          <path d="M10 14c6-2 12-2 18 2v28c-6-4-12-4-18-2z" fill={soft} />
          <path d="M46 14c-6-2-12-2-18 2v28c6-4 12-4 18-2z" fill={ink} />
        </>
      );
  }
}

export function LessonGlyph({ id, category, className }: { id: string; category: string; className?: string }) {
  const tone = categoryTile[category] ?? categoryTile["life-planning"];
  return (
    <span className={cn("inline-flex items-center justify-center bg-gradient-to-br", !/\brounded-/.test(className ?? "") && "rounded-xl", tone.bg, className)} aria-hidden>
      <svg viewBox="0 0 56 56" className="h-[72%] w-[72%]">
        <Motif id={id} ink={tone.ink} soft={tone.soft} />
      </svg>
    </span>
  );
}
