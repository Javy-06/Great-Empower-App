import { createStore, useStore } from "./store";

/**
 * The learner's self-reported protection profile (Protect → Check). Stored on this device only.
 * `monthlyBudget` is kept for saved profiles but no longer asked: nothing in the app used it.
 * Nothing here is verified — Analyze always labels findings as based on what the user entered.
 */
export type CoverageAnswer = "yes" | "no" | "not-sure";
export type ProtectionArea = "medical" | "critical" | "life" | "accident";

export interface ProtectionProfile {
  age: string;
  monthlyIncome: string;
  monthlyExpenses: string;
  dependants: "none" | "parents" | "partner" | "children" | "";
  monthlyBudget: number;
  priorities: ProtectionArea[];
  coverage: Record<ProtectionArea, CoverageAnswer | "">;
  savedAt?: number;
}

export const emptyProfile = (): ProtectionProfile => ({
  age: "",
  monthlyIncome: "",
  monthlyExpenses: "",
  dependants: "",
  monthlyBudget: 150,
  // Nothing pre-selected: an area only becomes a "Gap" when the user marks it as a priority.
  priorities: [],
  coverage: { medical: "", critical: "", life: "", accident: "" },
});

/**
 * Per account, and ALWAYS device-only: these self-reported financial inputs are never sent to
 * Supabase, even for cloud accounts.
 */
export const PROFILE_KEY = "ge-profile-v1";
export const profileStore = createStore<ProtectionProfile>(PROFILE_KEY, emptyProfile);
export const useProfile = () => useStore(profileStore);

/** Fields that make up a complete profile, used for the data-completeness indicator. */
export function profileCompleteness(p: ProtectionProfile) {
  const checks = [
    { label: "Age", done: p.age.trim() !== "" },
    { label: "Monthly income", done: p.monthlyIncome.trim() !== "" },
    { label: "Monthly expenses", done: p.monthlyExpenses.trim() !== "" },
    { label: "Dependants", done: p.dependants !== "" },
    ...(["medical", "critical", "life", "accident"] as const).map((area) => ({
      label: `Existing ${areaLabels[area].toLowerCase()} cover`,
      done: p.coverage[area] !== "",
    })),
  ];
  const done = checks.filter((c) => c.done).length;
  return { checks, done, total: checks.length, percent: Math.round((done / checks.length) * 100) };
}

export const areaLabels: Record<ProtectionArea, string> = {
  medical: "Medical",
  critical: "Critical illness",
  life: "Life & income",
  accident: "Personal accident",
};
