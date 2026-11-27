import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * GREAT EMPOWER spot illustrations — hand-authored SVG, one visual language:
 * flat shapes on a soft tinted disc, a quiet ground shadow, brand tokens only
 * (navy / crimson / teal / gold + their light tints), white highlights, no outlines heavier than 1.5.
 * Decorative: every illustration is aria-hidden; the surrounding text carries the meaning.
 */
type Tone = "navy" | "crimson" | "teal" | "gold";
const disc: Record<Tone, string> = {
  navy: "fill-navy-50",
  crimson: "fill-crimson-50",
  teal: "fill-teal-50",
  gold: "fill-gold-50",
};

function Frame({ tone = "navy", className, children, onDark }: { tone?: Tone; className?: string; children: ReactNode; onDark?: boolean }) {
  return (
    <svg viewBox="0 0 120 96" className={cn("h-auto", className ?? "w-full")} aria-hidden focusable="false">
      {!onDark && <circle cx="60" cy="50" r="40" className={disc[tone]} />}
      <ellipse cx="60" cy="86" rx="38" ry="3.5" className={onDark ? "fill-white/10" : "fill-navy-900/[0.07]"} />
      {children}
    </svg>
  );
}

/** Hospital with a cross sign — hospital stays, medical bills. */
export function HospitalSpot({ className, onDark }: { className?: string; onDark?: boolean }) {
  return (
    <Frame tone="crimson" className={className} onDark={onDark}>
      <rect x="22" y="48" width="16" height="37" rx="2" className="fill-navy-100" />
      <rect x="82" y="48" width="16" height="37" rx="2" className="fill-navy-100" />
      <rect x="34" y="30" width="52" height="55" rx="3" className="fill-white" />
      <rect x="34" y="30" width="52" height="7" rx="3" className="fill-navy-800" />
      {[0, 1, 2].map((r) =>
        [0, 1, 2, 3].map((c) => <rect key={`${r}${c}`} x={40 + c * 11} y={42 + r * 9} width="7" height="5" rx="1" className="fill-navy-200" />),
      )}
      {[0, 1, 2].map((r) => (
        <g key={r}>
          <rect x="26" y={54 + r * 9} width="8" height="4" rx="1" className="fill-white/80" />
          <rect x="86" y={54 + r * 9} width="8" height="4" rx="1" className="fill-white/80" />
        </g>
      ))}
      <rect x="53" y="70" width="14" height="15" rx="1.5" className="fill-navy-700" />
      <rect x="51" y="13" width="18" height="18" rx="4" className="fill-crimson-600" />
      <path d="M60 17v10M55 22h10" className="stroke-white" strokeWidth="3.2" strokeLinecap="round" />
      <rect x="15.5" y="74" width="3" height="11" rx="1" className="fill-navy-700" />
      <circle cx="17" cy="70" r="7.5" className="fill-teal-500" />
      <rect x="101.5" y="74" width="3" height="11" rx="1" className="fill-navy-700" />
      <circle cx="103" cy="70" r="7.5" className="fill-teal-500" />
    </Frame>
  );
}

/** Clipboard with a heartbeat and an awareness ribbon — a serious diagnosis. */
export function DiagnosisSpot({ className }: { className?: string }) {
  return (
    <Frame tone="gold" className={className}>
      <rect x="34" y="20" width="46" height="62" rx="5" className="fill-white" />
      <rect x="46" y="15" width="22" height="10" rx="3" className="fill-navy-700" />
      <path d="M40 46h8l4-8 6 16 4-8h12" className="stroke-crimson-600" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="40" y="62" width="30" height="3" rx="1.5" className="fill-navy-100" />
      <rect x="40" y="69" width="22" height="3" rx="1.5" className="fill-navy-100" />
      <path d="M86 50c4 0 7 3 7 7 0 4.6-3.4 9.3-7 14-3.6-4.7-7-9.4-7-14 0-4 3-7 7-7Z" className="fill-gold-500" />
      <path d="M82.5 66 76 82l5-1 2.4 4 4.4-10M89.5 66 96 82l-5-1-2.4 4-2.2-5" className="fill-gold-500" />
    </Frame>
  );
}

/** Two figures under an umbrella — a family's financial safety net. */
export function FamilyUmbrellaSpot({ className }: { className?: string }) {
  return (
    <Frame tone="navy" className={className}>
      <path d="M22 44a38 26 0 0 1 76 0Z" className="fill-navy-800" />
      <path d="M22 44c4.2-4 8.4-4 12.6 0 4.2-4 8.4-4 12.7 0 4.2-4 8.4-4 12.7 0 4.2-4 8.4-4 12.7 0 4.2-4 8.4-4 12.6 0 4.2-4 8.4-4 12.7 0" className="fill-navy-50" />
      <path d="M60 18v-4" className="stroke-navy-800" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M60 44v30a4 4 0 0 0 8 0" className="stroke-navy-800" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <circle cx="44" cy="54" r="6" className="fill-gold-300" />
      <path d="M34 85v-11a10 10 0 0 1 20 0v11Z" className="fill-teal-600" />
      <circle cx="78" cy="61" r="4.6" className="fill-gold-300" />
      <path d="M70.5 85v-7.5a7.5 7.5 0 0 1 15 0V85Z" className="fill-crimson-600" />
    </Frame>
  );
}

/** A payslip with a pause badge — income that stops. */
export function IncomePauseSpot({ className }: { className?: string }) {
  return (
    <Frame tone="teal" className={className}>
      <rect x="30" y="22" width="44" height="58" rx="4" className="fill-white" />
      <rect x="37" y="30" width="20" height="4" rx="2" className="fill-navy-800" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x="37" y={42 + i * 8} width="18" height="3" rx="1.5" className="fill-navy-100" />
          <rect x="60" y={42 + i * 8} width="8" height="3" rx="1.5" className="fill-navy-200" />
        </g>
      ))}
      <ellipse cx="84" cy="78" rx="12" ry="4" className="fill-gold-500" />
      <rect x="72" y="68" width="24" height="10" className="fill-gold-500" />
      <ellipse cx="84" cy="68" rx="12" ry="4" className="fill-gold-300" />
      <circle cx="80" cy="42" r="13" className="fill-teal-600" />
      <path d="M76.5 36.5v11M83.5 36.5v11" className="stroke-white" strokeWidth="3.2" strokeLinecap="round" />
    </Frame>
  );
}

/** A riding helmet and a plaster — accidents on the road. */
export function AccidentSpot({ className }: { className?: string }) {
  return (
    <Frame tone="navy" className={className}>
      <rect x="64" y="20" width="16" height="44" rx="8" transform="rotate(45 72 42)" className="fill-gold-300" />
      <rect x="66.5" y="34" width="11" height="16" rx="2" transform="rotate(45 72 42)" className="fill-gold-100" />
      <path d="M26 66a30 30 0 0 1 60 0v6H26Z" className="fill-crimson-600" />
      <path d="M50 52h34v14H58a8 8 0 0 1-8-8Z" className="fill-navy-800" />
      <path d="M54 56h26" className="stroke-white/40" strokeWidth="2" strokeLinecap="round" />
      <rect x="22" y="70" width="68" height="8" rx="4" className="fill-navy-900" />
      <path d="M38 44a18 18 0 0 1 10-8" className="stroke-white/50" strokeWidth="3" fill="none" strokeLinecap="round" />
    </Frame>
  );
}

/** Clipboard with ticks and a shield — the before-you-buy checklist. */
export function ChecklistSpot({ className }: { className?: string }) {
  return (
    <Frame tone="crimson" className={className}>
      <rect x="28" y="18" width="48" height="64" rx="5" className="fill-white" />
      <rect x="41" y="13" width="22" height="10" rx="3" className="fill-navy-700" />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <circle cx="38" cy={36 + i * 14} r="4.5" className="fill-teal-600" />
          <path d={`M35.8 ${36 + i * 14}l1.6 1.6 3-3.2`} className="stroke-white" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="47" y={34.5 + i * 14} width="22" height="3" rx="1.5" className="fill-navy-100" />
        </g>
      ))}
      <path d="M86 46l14 5.5v9.5c0 9-6 15.5-14 18.5-8-3-14-9.5-14-18.5v-9.5Z" className="fill-crimson-600" />
      <path d="M86 56v12M80 62h12" className="stroke-white" strokeWidth="3" strokeLinecap="round" />
    </Frame>
  );
}

/** A laptop with a protected checkout-free page — buying directly online. */
export function LaptopSpot({ className }: { className?: string }) {
  return (
    <Frame tone="teal" className={className}>
      <rect x="28" y="26" width="64" height="42" rx="4" className="fill-navy-800" />
      <rect x="32" y="30" width="56" height="34" rx="2" className="fill-teal-50" />
      <path d="M60 36l9 3.5v6c0 6-4 10-9 12-5-2-9-6-9-12v-6Z" className="fill-teal-600" />
      <path d="M56 46.5l2.6 2.6 5-5.2" className="stroke-white" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 70h80l-6 8H26Z" className="fill-navy-200" />
      <rect x="52" y="70" width="16" height="3" rx="1.5" className="fill-navy-300" />
    </Frame>
  );
}

/** An adviser with a speech bubble — getting guidance from a person. */
export function AdviserSpot({ className }: { className?: string }) {
  return (
    <Frame tone="gold" className={className}>
      <path d="M34 85v-14a26 20 0 0 1 52 0v14Z" className="fill-navy-800" />
      <path d="M54 51h12l-6 22Z" className="fill-white" />
      <path d="M58 55h4l1.5 14L60 74l-3.5-5Z" className="fill-crimson-600" />
      <rect x="54" y="44" width="12" height="9" rx="3" className="fill-gold-300" />
      <circle cx="60" cy="34" r="13" className="fill-gold-300" />
      <path d="M47 33c0-9 5.5-13.5 13-13.5S73 24 73 31c-3-3.5-8-5-13-5-4 0-8 2.6-13 7Z" className="fill-navy-950" />
      <rect x="78" y="14" width="30" height="20" rx="8" className="fill-teal-600" />
      <path d="M84 34l-2 6 7-6Z" className="fill-teal-600" />
      <circle cx="86" cy="24" r="2" className="fill-white" />
      <circle cx="93" cy="24" r="2" className="fill-white" />
      <circle cx="100" cy="24" r="2" className="fill-white" />
    </Frame>
  );
}

/** An office building with a briefcase badge — cover through your employer. */
export function OfficeSpot({ className }: { className?: string }) {
  return (
    <Frame tone="navy" className={className}>
      <rect x="38" y="20" width="40" height="65" rx="3" className="fill-white" />
      <rect x="38" y="20" width="40" height="6" rx="3" className="fill-navy-700" />
      {[0, 1, 2, 3, 4].map((r) =>
        [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={44 + c * 11} y={32 + r * 9} width="7" height="5" rx="1" className="fill-navy-200" />),
      )}
      <rect x="53" y="74" width="10" height="11" rx="1.5" className="fill-navy-700" />
      <rect x="22" y="46" width="16" height="39" rx="2" className="fill-navy-100" />
      <circle cx="88" cy="34" r="13" className="fill-gold-500" />
      <rect x="81" y="31" width="14" height="10" rx="2" className="fill-navy-900" />
      <path d="M85 31v-2.5h6V31" className="stroke-navy-900" strokeWidth="1.8" fill="none" />
      <circle cx="98" cy="79" r="6" className="fill-teal-500" />
    </Frame>
  );
}

/** A profile card with a pencil — answering your protection profile (Analyze empty state). */
export function ProfileSpot({ className }: { className?: string }) {
  return (
    <Frame tone="teal" className={className}>
      <rect x="26" y="22" width="60" height="56" rx="6" className="fill-white" />
      <circle cx="42" cy="40" r="8" className="fill-teal-600" />
      <path d="M32 58a10 7 0 0 1 20 0Z" className="fill-teal-600" />
      <rect x="56" y="34" width="22" height="4" rx="2" className="fill-navy-800" />
      <rect x="56" y="43" width="16" height="3" rx="1.5" className="fill-navy-100" />
      <rect x="34" y="64" width="44" height="3" rx="1.5" className="fill-navy-100" />
      <path d="M84 70 98 56l5 5-14 14-6.5 1.5Z" className="fill-gold-500" />
      <path d="M98 56l3-3 5 5-3 3Z" className="fill-crimson-600" />
    </Frame>
  );
}

/** A ticket-style pass with a perforated stub and a reward tag — redemption passes (empty state). */
export function PassSpot({ className }: { className?: string }) {
  return (
    <Frame tone="gold" className={className}>
      <g transform="rotate(-8 60 52)">
        <path d="M24 32h72v12a6 6 0 0 0 0 12v12H24V56a6 6 0 0 0 0-12Z" className="fill-white" />
        <path d="M74 34v32" className="stroke-navy-100" strokeWidth="2" strokeDasharray="3 3" fill="none" />
        <rect x="32" y="42" width="30" height="4" rx="2" className="fill-navy-800" />
        <rect x="32" y="51" width="20" height="3" rx="1.5" className="fill-navy-100" />
        <circle cx="85" cy="50" r="6" className="fill-gold-500" />
        <path d="m82.5 50 1.8 1.8 3.4-3.6" className="stroke-white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
      <circle cx="96" cy="24" r="3" className="fill-crimson-600" />
      <circle cx="22" cy="72" r="2.5" className="fill-teal-500" />
    </Frame>
  );
}

/** A navy voucher card with a shield — GREAT EMPOWER Vouchers kept for later (empty state). */
export function VoucherSpot({ className }: { className?: string }) {
  return (
    <Frame tone="navy" className={className}>
      <rect x="22" y="30" width="76" height="46" rx="7" className="fill-navy-900" />
      <path d="M22 62h76v7a7 7 0 0 1-7 7H29a7 7 0 0 1-7-7Z" className="fill-crimson-600" />
      <rect x="31" y="39" width="26" height="4" rx="2" className="fill-white/80" />
      <rect x="31" y="48" width="16" height="3" rx="1.5" className="fill-white/40" />
      <path d="M79 37l9 3.5v6.5c0 5.5-4 9-9 10.5-5-1.5-9-5-9-10.5v-6.5Z" className="fill-white" />
      <path d="m75.5 46.5 2.5 2.5 5-5" className="stroke-navy-900" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="102" cy="24" r="3" className="fill-gold-500" />
    </Frame>
  );
}
