import type { ProtectionArea } from "../state/profile.ts";

/**
 * The in-app insurance application (Protect → Get cover → Apply). Pure data + validation, no UI.
 *
 * HONESTY: GREAT EMPOWER has no insurer API and no application backend (checked 28 Nov 2026: the
 * Supabase migrations hold accounts, rewards and watch-time only). An application is therefore a
 * DRAFT until the user completes it, and then "completed in GREAT EMPOWER". It is never "submitted",
 * "approved" or "covered", and it carries no reference number: nothing would recognise one.
 * Stored on this device only (account-scoped), never synced.
 */
export type ApplicationStatus = "draft" | "completed";
export type YesNo = "" | "yes" | "no";

export interface ApplicationDetails {
  fullName: string;
  /** yyyy-mm-dd, from the date input. */
  dateOfBirth: string;
  residency: "" | "citizen" | "pr" | "other";
  occupation: string;
  mobile: string;
  email: string;
}
export interface ApplicationCover {
  /** One of `coverAmountOptions[area]`: the user's preference, not a product or a quote. */
  amount: string;
  /** RM a month the user is comfortable paying. */
  budget: string;
  frequency: "" | "monthly" | "yearly";
  basis: "" | "conventional" | "takaful" | "either";
  existing: "" | "yes" | "no" | "not-sure";
}
export type HealthKey = "tobacco" | "condition" | "medication" | "hospital" | "occupationRisk";
export type ApplicationHealth = Record<HealthKey, YesNo>;

export interface InsuranceApplication {
  area: ProtectionArea;
  status: ApplicationStatus;
  details: ApplicationDetails;
  cover: ApplicationCover;
  health: ApplicationHealth;
  declaration: { truthful: boolean; understandsNotSent: boolean };
  updatedAt: number;
  completedAt?: number;
}

export const APPLICATION_STEPS = [
  { key: "details", label: "Your details" },
  { key: "cover", label: "Your cover" },
  { key: "health", label: "Health questions" },
  { key: "review", label: "Review" },
] as const;
export type ApplicationStepKey = (typeof APPLICATION_STEPS)[number]["key"];

/** Preference bands only. They are not products, limits of any plan, or prices. */
export const coverAmountOptions: Record<ProtectionArea, { label: string; options: string[] }> = {
  medical: { label: "Yearly limit you'd like", options: ["Up to RM100,000", "RM100,000 – RM500,000", "RM500,000 – RM1 million", "Over RM1 million", "Not sure yet"] },
  critical: { label: "Lump sum you'd like", options: ["Under RM100,000", "RM100,000 – RM250,000", "Over RM250,000", "Not sure yet"] },
  life: { label: "Amount of life cover you'd like", options: ["Under RM100,000", "RM100,000 – RM500,000", "Over RM500,000", "Not sure yet"] },
  accident: { label: "Amount of cover you'd like", options: ["Under RM50,000", "RM50,000 – RM200,000", "Over RM200,000", "Not sure yet"] },
};

export const healthQuestions: Array<{ key: HealthKey; q: string }> = [
  { key: "tobacco", q: "Have you smoked or vaped in the last 12 months?" },
  { key: "condition", q: "In the last 5 years, have you been diagnosed with or treated for a medical condition?" },
  { key: "medication", q: "Do you take any medication regularly?" },
  { key: "hospital", q: "Have you stayed in hospital in the last 5 years?" },
  { key: "occupationRisk", q: "Does your work involve physical risk, such as heights, heavy machinery or offshore work?" },
];

export const residencyLabels: Record<Exclude<ApplicationDetails["residency"], "">, string> = {
  citizen: "Malaysian citizen",
  pr: "Malaysian permanent resident",
  other: "Other",
};
export const frequencyLabels = { monthly: "Monthly", yearly: "Yearly" } as const;
export const basisLabels = { conventional: "Conventional insurance", takaful: "Takaful", either: "Either is fine" } as const;
export const existingLabels = { yes: "Yes", no: "No", "not-sure": "Not sure" } as const;

export function emptyApplication(area: ProtectionArea, prefill?: { fullName?: string; existing?: ApplicationCover["existing"] }): InsuranceApplication {
  return {
    area,
    status: "draft",
    details: { fullName: prefill?.fullName ?? "", dateOfBirth: "", residency: "", occupation: "", mobile: "", email: "" },
    cover: { amount: "", budget: "", frequency: "", basis: "", existing: prefill?.existing ?? "" },
    health: { tobacco: "", condition: "", medication: "", hospital: "", occupationRisk: "" },
    declaration: { truthful: false, understandsNotSent: false },
    updatedAt: 0,
  };
}

export type FieldErrors = Record<string, string>;

/** Whole years between a yyyy-mm-dd date of birth and `today`, or null if the date isn't valid. */
export function ageOn(dateOfBirth: string, today: Date): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateOfBirth);
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const dob = new Date(Date.UTC(y, mo - 1, d));
  if (dob.getUTCFullYear() !== y || dob.getUTCMonth() !== mo - 1 || dob.getUTCDate() !== d) return null;
  let age = today.getFullYear() - y;
  if (today.getMonth() + 1 < mo || (today.getMonth() + 1 === mo && today.getDate() < d)) age -= 1;
  return age;
}

/** Malaysian mobile numbers: 01x-xxx xxxx(x), optionally with +60 / 60 in front. */
export const normaliseMobile = (v: string) => v.replace(/[\s-]/g, "");
export const isMalaysianMobile = (v: string) => /^(\+?60|0)1\d{8,9}$/.test(normaliseMobile(v));
export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

export function validateDetails(d: ApplicationDetails, today = new Date()): FieldErrors {
  const e: FieldErrors = {};
  if (d.fullName.trim().length < 2) e.fullName = "Enter your full name as it appears on your MyKad.";
  const age = ageOn(d.dateOfBirth, today);
  if (!d.dateOfBirth) e.dateOfBirth = "Enter your date of birth.";
  else if (age === null || age < 0 || age > 100) e.dateOfBirth = "Enter a valid date of birth.";
  else if (age < 18) e.dateOfBirth = "This in-app application is for people 18 or older applying on their own. Under 18? Use a parent- or guardian-assisted adviser request instead.";
  if (!d.residency) e.residency = "Choose your residency status.";
  if (d.occupation.trim().length < 2) e.occupation = "Enter your occupation, for example “Student” or “Software engineer”.";
  if (!d.mobile.trim()) e.mobile = "Enter your mobile number.";
  else if (!isMalaysianMobile(d.mobile)) e.mobile = "Enter a Malaysian mobile number, for example 012-345 6789.";
  if (!d.email.trim()) e.email = "Enter your email address.";
  else if (!isEmail(d.email)) e.email = "Enter a valid email address, for example name@example.com.";
  return e;
}

export function validateCover(c: ApplicationCover): FieldErrors {
  const e: FieldErrors = {};
  if (!c.amount) e.amount = "Choose the amount of cover you'd like, or “Not sure yet”.";
  const budget = Number(c.budget);
  if (!c.budget.trim()) e.budget = "Enter how much you could spend a month.";
  else if (!Number.isFinite(budget) || budget < 10 || budget > 10000) e.budget = "Enter an amount between RM10 and RM10,000.";
  if (!c.frequency) e.frequency = "Choose how often you'd like to pay.";
  if (!c.basis) e.basis = "Choose conventional, takaful or either.";
  if (!c.existing) e.existing = "Tell us whether you already have this kind of cover.";
  return e;
}

export function validateHealth(h: ApplicationHealth): FieldErrors {
  const e: FieldErrors = {};
  for (const { key } of healthQuestions) if (!h[key]) e[key] = "Answer Yes or No.";
  return e;
}

export function validateDeclaration(d: InsuranceApplication["declaration"]): FieldErrors {
  const e: FieldErrors = {};
  if (!d.truthful) e.truthful = "Confirm that your answers are true and complete.";
  if (!d.understandsNotSent) e.understandsNotSent = "Confirm that you understand this isn't sent to an insurer.";
  return e;
}

/** The first step that still has errors, or "review" when steps 1–3 are complete. */
export function firstIncompleteStep(a: InsuranceApplication, today = new Date()): ApplicationStepKey {
  if (Object.keys(validateDetails(a.details, today)).length) return "details";
  if (Object.keys(validateCover(a.cover)).length) return "cover";
  if (Object.keys(validateHealth(a.health)).length) return "health";
  return "review";
}

/** Steps 1–3 valid and the declaration ticked: the only state that may be marked completed. */
export function canComplete(a: InsuranceApplication, today = new Date()) {
  return firstIncompleteStep(a, today) === "review" && !Object.keys(validateDeclaration(a.declaration)).length;
}
