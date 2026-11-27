import type { ReactElement, SVGProps } from "react";

/**
 * GREAT EMPOWER protection icon set — hand-authored for this app.
 * One system: 24 × 24 grid, 1.75 stroke, round caps and joins, `currentColor`.
 * Matches the weight of the lucide UI icons used elsewhere, so they sit together cleanly.
 */
const paths = {
  heartPulse: (
    <>
      <path d="M12 20.5S4.5 16 4.5 9.9A4.1 4.1 0 0 1 12 7.6a4.1 4.1 0 0 1 7.5 2.3c0 6.1-7.5 10.6-7.5 10.6Z" />
      <path d="M7.5 12.5h2.2l1.4-2.4 2 4.4 1.4-2h2" />
    </>
  ),
  ribbon: (
    <>
      <path d="M12 3.5c1.9 0 3.3 1.5 3.3 3.4 0 2.2-1.6 4.5-3.3 6.9-1.7-2.4-3.3-4.7-3.3-6.9 0-1.9 1.4-3.4 3.3-3.4Z" />
      <path d="M10.4 11.6 6.5 20.5l2.9-.6 1.3 2.4 2.7-6.3" />
      <path d="M13.6 11.6l3.9 8.9-2.9-.6-1.3 2.4-1.3-3" />
    </>
  ),
  family: (
    <>
      <circle cx="8.5" cy="6.5" r="2.6" />
      <path d="M3.5 20v-2.6a5 5 0 0 1 10 0V20" />
      <circle cx="17" cy="10.2" r="2" />
      <path d="M14 20v-1.6a3 3 0 0 1 6 0V20" />
    </>
  ),
  walletPause: (
    <>
      <path d="M4 7.5h14.5a1.5 1.5 0 0 1 1.5 1.5v9.5a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 18.5Z" />
      <path d="M4 7.5 15 4.2v3.3" />
      <path d="M10.5 11.5v5M13.5 11.5v5" />
    </>
  ),
  bandage: (
    <>
      <path d="M3.9 13.6 13.6 3.9a2.8 2.8 0 0 1 4 0l2.5 2.5a2.8 2.8 0 0 1 0 4L10.4 20.1a2.8 2.8 0 0 1-4 0l-2.5-2.5a2.8 2.8 0 0 1 0-4Z" />
      <path d="M9.6 12 12 9.6l2.4 2.4L12 14.4Z" />
      <path d="M7 14.5h.01M9.5 17h.01M14.5 7h.01M17 9.5h.01" />
    </>
  ),
  bed: (
    <>
      <path d="M3 19.5V6" />
      <path d="M3 15h18v4.5" />
      <path d="M21 15v-2.5A3 3 0 0 0 18 9.5h-7V15" />
      <circle cx="7" cy="11.6" r="1.9" />
    </>
  ),
  scalpel: (
    <>
      <path d="M3.5 20.5 11 13" />
      <path d="M11 13l7-7a2.2 2.2 0 0 1 3.1 3.1l-7 7c-1.2.9-2.4 1-3.1.9Z" />
    </>
  ),
  stethoscope: (
    <>
      <path d="M6 3.5V8a4 4 0 0 0 8 0V3.5" />
      <path d="M10 12v2.5a5 5 0 0 0 10 0V13" />
      <circle cx="20" cy="11" r="2" />
    </>
  ),
  letter: (
    <>
      <path d="M7 3.5h7l4 4V20.5H7Z" />
      <path d="M14 3.5v4h4" />
      <path d="M9.8 14l1.9 1.9 3.6-3.6" />
    </>
  ),
  cash: (
    <>
      <rect x="3" y="6.5" width="18" height="11" rx="2" />
      <circle cx="12" cy="12" r="2.4" />
      <path d="M6.5 9.5v.01M17.5 14.5v.01" />
    </>
  ),
  home: (
    <>
      <path d="M4 11 12 4.5l8 6.5" />
      <path d="M6 9.5v10.5h12V9.5" />
      <path d="M10 20v-4.5h4V20" />
    </>
  ),
  steps: <path d="M4 20h5v-4.5h5V11h6V5" />,
  receipt: (
    <>
      <path d="M6 3.5h12v17l-3-2-3 2-3-2-3 2Z" />
      <path d="M9 8.5h6M9 12h6M9 15.5h3" />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="5.5" width="16" height="14.5" rx="2" />
      <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20h16" />
      <path d="M6 16l4-5 3 3 5-6.5" />
      <path d="M15 7.5h3v3" />
    </>
  ),
  shieldCheck: (
    <>
      <path d="M12 3.5 19 6.3V11c0 4.6-3 8-7 9.5-4-1.5-7-4.9-7-9.5V6.3Z" />
      <path d="M9.2 12l2 2 3.6-3.7" />
    </>
  ),
  shieldPlus: (
    <>
      <path d="M12 3.5 19 6.3V11c0 4.6-3 8-7 9.5-4-1.5-7-4.9-7-9.5V6.3Z" />
      <path d="M12 9v6M9 12h6" />
    </>
  ),
  percent: (
    <>
      <path d="M18.5 5.5 5.5 18.5" />
      <circle cx="7.5" cy="7.5" r="2.4" />
      <circle cx="16.5" cy="16.5" r="2.4" />
    </>
  ),
  calendarCoin: (
    <>
      <path d="M13 19H5a2 2 0 0 1-2-2V7.5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2V10" />
      <path d="M3 10h14M7 3.5v4M13 3.5v4" />
      <circle cx="18" cy="16.5" r="3.5" />
      <path d="M18 15v3" />
    </>
  ),
} as const;

export type GeIconName = keyof typeof paths;

export function GeIcon({ name, size = 24, ...rest }: { name: GeIconName; size?: number } & Omit<SVGProps<SVGSVGElement>, "name">) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      {...rest}
    >
      {paths[name]}
    </svg>
  );
}

/** Icon component signature shared with lucide-react icons (size + className + aria). */
export type IconLike = (props: { size?: number; className?: string; "aria-hidden"?: boolean | "true" | "false" }) => ReactElement;
const make = (name: GeIconName): IconLike => (props) => <GeIcon name={name} {...props} />;

export const MedicalIcon = make("heartPulse");
export const CriticalIllnessIcon = make("ribbon");
export const FamilyIcon = make("family");
export const IncomeIcon = make("walletPause");
export const AccidentIcon = make("bandage");
