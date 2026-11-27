import {
  Compass,
  GraduationCap,
  House,
  ShieldCheck,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";

export type NavKey = "home" | "learn" | "simulate" | "analyze" | "guide";

/** The five primary destinations. Rewards is a hub, not a tab; the game opens in its own shell. */
export const primaryNav: Array<{
  key: NavKey;
  label: string;
  icon: LucideIcon;
  description: string;
}> = [
  { key: "home", label: "Home", icon: House, description: "Wellness overview" },
  { key: "learn", label: "Learn", icon: GraduationCap, description: "Lessons & quizzes" },
  {
    key: "simulate",
    label: "Simulate",
    icon: SlidersHorizontal,
    description: "Calculators & scenarios",
  },
  // Key stays "analyze" internally; the destination is presented (and routed) as Protect.
  { key: "analyze", label: "Protect", icon: ShieldCheck, description: "Check, explore, compare" },
  { key: "guide", label: "Guide", icon: Compass, description: "Knowledge centre" },
];
