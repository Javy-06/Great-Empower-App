import type { ProtectionProfile } from "../state/profile.ts";
import type { InsuranceApplication } from "../data/application.ts";

/**
 * The GREAT EMPOWER Demo System's sample profile. ENTIRELY FICTIONAL: Aisyah is not a real person,
 * and every figure is an illustrative example for demonstrations. Pure data, no storage.
 */

/** The demo runs in its own account namespace, never one from the device's account list. */
export const DEMO_ACCOUNT_ID = "ge-demo-showcase";
/** Bump to re-seed every browser that has an older demo state. */
export const DEMO_SEED_VERSION = 1;

export const demoPersona = {
  name: "Aisyah",
  fullName: "Aisyah Rahman",
  age: 24,
  occupation: "Junior UX designer",
  city: "Kuala Lumpur",
  monthlyIncome: 3200,
  monthlyExpenses: 2300,
  emergencySavings: 4500,
  dependants: "Helps support her parents",
  existingCover: "Medical cover through her employer's group scheme",
  priorities: ["Medical", "Critical illness"],
} as const;

/** Months of essential spending the sample emergency savings would cover (shown on the entry page). */
export const demoSavingsMonths = Math.floor((demoPersona.emergencySavings / demoPersona.monthlyExpenses) * 10) / 10;

/**
 * Protection check answers chosen so every finding type appears: medical is Covered (employer
 * scheme), critical illness is a Gap (priority, no cover), life is Review (not sure), accident is
 * Review (no cover, not a priority).
 */
export function demoProfile(now: number): ProtectionProfile {
  return {
    age: String(demoPersona.age),
    monthlyIncome: String(demoPersona.monthlyIncome),
    monthlyExpenses: String(demoPersona.monthlyExpenses),
    dependants: "parents",
    monthlyBudget: 150,
    priorities: ["medical", "critical"],
    coverage: { medical: "yes", critical: "no", life: "not-sure", accident: "no" },
    savedAt: now,
  };
}

/**
 * A half-finished critical illness application, so Get cover shows "Continue your application".
 * Contact details are placeholders (example.com, a sample number), never a real person's.
 */
export function demoApplicationDraft(now: number): InsuranceApplication {
  return {
    area: "critical",
    status: "draft",
    details: {
      fullName: demoPersona.fullName,
      dateOfBirth: "2002-05-14",
      residency: "citizen",
      occupation: demoPersona.occupation,
      mobile: "012-345 6789",
      email: "aisyah.demo@example.com",
    },
    cover: { amount: "RM100,000 – RM250,000", budget: "", frequency: "", basis: "", existing: "no" },
    health: { tobacco: "", condition: "", medication: "", hospital: "", occupationRisk: "" },
    declaration: { truthful: false, understandsNotSent: false },
    updatedAt: now,
  };
}
