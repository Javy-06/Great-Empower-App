import { cn } from "@/lib/cn";
import type { LearningCategoryKey } from "@/types/learning";

/**
 * Category illustrations for the lesson-topic cards: flat, light-on-colour compositions that sit
 * on the card's gradient. Decorative only — the card's text carries the meaning.
 */
export function CategoryArt({ category, className }: { category: Exclude<LearningCategoryKey, "all">; className?: string }) {
  return (
    <svg viewBox="0 0 96 96" className={cn("drop-shadow-[0_8px_14px_rgb(10_28_51/0.28)]", className)} aria-hidden>
      {category === "financial-wellness" && (
        <>
          {/* Coin stack + calculator: everyday money decisions */}
          <ellipse cx="30" cy="74" rx="18" ry="6" fill="#e2c071" />
          <rect x="12" y="52" width="36" height="22" fill="#e2c071" />
          <ellipse cx="30" cy="52" rx="18" ry="6" fill="#f5e8c7" />
          <path d="M12 59c6 4 30 4 36 0M12 66c6 4 30 4 36 0" stroke="#c9a03f" strokeWidth="2" fill="none" />
          <ellipse cx="30" cy="52" rx="10" ry="3" fill="#e2c071" />
          <rect x="44" y="24" width="38" height="54" rx="8" fill="#fff" />
          <rect x="50" y="30" width="26" height="12" rx="3" fill="#0f294a" />
          <rect x="66" y="34" width="7" height="4" rx="1" fill="#7dc2c6" />
          {[0, 1, 2].map((r) =>
            [0, 1, 2].map((c) => (
              <rect key={`${r}${c}`} x={50 + c * 9.5} y={47 + r * 9.5} width="7" height="7" rx="2" fill={r === 2 && c === 2 ? "#c8102e" : "#c6d3e6"} />
            )),
          )}
        </>
      )}
      {category === "protection" && (
        <>
          {/* Shield with a medical cross: protection basics */}
          <path d="M48 10l30 11v22c0 20-13 34-30 42-17-8-30-22-30-42V21z" fill="#fff" />
          <path d="M48 18l23 8.5v17c0 15.5-10 26.5-23 33-13-6.5-23-17.5-23-33v-17z" fill="#d7eeef" />
          <path d="M42 34h12v10h10v12H54v10H42V56H32V44h10z" fill="#c8102e" />
          <path d="M48 10l30 11v22c0 20-13 34-30 42z" fill="#0a1c33" opacity=".06" />
        </>
      )}
      {category === "life-planning" && (
        <>
          {/* Umbrella over a small family: planning for life's stages */}
          <path d="M10 44a38 30 0 0 1 76 0c-4-4-9-4-12.7 0-3.8-4-8.9-4-12.6 0-3.8-4-8.9-4-12.7 0-3.7-4-8.8-4-12.6 0-3.8-4-8.9-4-12.7 0C19 40 14 40 10 44z" fill="#fff" />
          <path d="M48 14v2" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
          <path d="M48 44v30a5 5 0 0 1-10 0" stroke="#e3eaf3" strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="30" cy="62" r="6" fill="#f6c4cd" />
          <path d="M20 86a10 12 0 0 1 20 0z" fill="#f6c4cd" />
          <circle cx="66" cy="60" r="6.5" fill="#b0dcde" />
          <path d="M55 86a11 13 0 0 1 22 0z" fill="#b0dcde" />
          <circle cx="56" cy="72" r="4.5" fill="#f5e8c7" />
          <path d="M49 86a7 8 0 0 1 14 0z" fill="#f5e8c7" />
        </>
      )}
      {category === "practical" && (
        <>
          {/* Clipboard checklist: plain-language practical guides */}
          <rect x="20" y="16" width="52" height="68" rx="8" fill="#fff" />
          <rect x="34" y="10" width="24" height="12" rx="4" fill="#c6d3e6" />
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect x="28" y={32 + i * 15} width="9" height="9" rx="2.5" fill={i < 2 ? "#297e85" : "#e3eaf3"} />
              {i < 2 && <path d={`M30 ${36.5 + i * 15}l2 2 3.5-4`} stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
              <rect x="41" y={34 + i * 15} width={i === 1 ? 18 : 24} height="4" rx="2" fill="#c6d3e6" />
            </g>
          ))}
          <circle cx="70" cy="70" r="15" fill="#fbe3e7" />
          <path d="M66 64h8v4h4v8h-4v4h-8v-4h-4v-8h4z" fill="#c8102e" />
        </>
      )}
    </svg>
  );
}
