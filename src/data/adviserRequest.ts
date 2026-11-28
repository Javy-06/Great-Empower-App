import type { ProtectionArea } from "../state/profile.ts";
import { ageOn, isEmail, isMalaysianMobile, type FieldErrors } from "./application.ts";

/**
 * "Talk to an adviser" request (Protect → Get cover → Adviser request). Pure data + validation.
 *
 * HONESTY: GREAT EMPOWER has no adviser backend. Checked 28 Nov 2026: the Supabase migrations hold
 * accounts, rewards, watch-time and FICTIONAL guidance-session bookings only; nothing receives an
 * adviser request. A request is therefore saved ON THIS DEVICE as a demo request. It is never
 * described as sent, received, booked or contacted, and it carries no reference number.
 *
 * AGE: worked out from the date of birth, never asked as "are you an adult?". Under 18 switches to a
 * parent/guardian-assisted request. The app does not decide eligibility: see `ageGuidance` and
 * MINOR_SOURCES for what the law says and why the adviser/insurer has the final word.
 */

export type AgeBand = "adult" | "16-17" | "10-15" | "under-10";
export type ContactMethod = "phone" | "whatsapp" | "email";
export type ContactTime = "" | "morning" | "afternoon" | "evening";
export type GuardianRelationship = "" | "mother" | "father" | "legal-guardian" | "other-guardian";

export interface AdviserRequestDraft {
  /** The person the cover would be for (the user, or the minor). */
  fullName: string;
  /** yyyy-mm-dd */
  dateOfBirth: string;
  /** Adult path only: the person's own contact details. */
  phone: string;
  email: string;
  /** Under-18 path only: the parent or legal guardian, who is the contact for the request. */
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  relationship: GuardianRelationship;
  guardianConsent: boolean;
  /** Kinds of cover to talk about (optional). */
  topics: ProtectionArea[];
  method: ContactMethod | "";
  time: ContactTime;
  /** Review: the user understands this stays on the device. */
  understandsDemo: boolean;
}

export interface SavedAdviserRequest extends AdviserRequestDraft {
  savedAt: number;
  /** Age band when saved: decides who the contact is. */
  band: AgeBand;
}

export const ADVISER_REQUEST_STEPS = [
  { key: "details", label: "Personal details", short: "You" },
  { key: "guidance", label: "Age guidance", short: "Age" },
  { key: "contact", label: "Contact preferences", short: "Contact" },
  { key: "review", label: "Review", short: "Review" },
] as const;
export type AdviserRequestStep = (typeof ADVISER_REQUEST_STEPS)[number]["key"];

export const contactMethodLabels: Record<ContactMethod, string> = { phone: "Phone call", whatsapp: "WhatsApp", email: "Email" };
export const contactTimeLabels: Record<Exclude<ContactTime, "">, string> = {
  morning: "Morning (9am–12pm)",
  afternoon: "Afternoon (12pm–5pm)",
  evening: "Evening (5pm–8pm)",
};
export const relationshipLabels: Record<Exclude<GuardianRelationship, "">, string> = {
  mother: "Mother",
  father: "Father",
  "legal-guardian": "Legal guardian",
  "other-guardian": "Other guardian",
};

export function emptyAdviserRequest(prefill?: { fullName?: string; topics?: ProtectionArea[] }): AdviserRequestDraft {
  return {
    fullName: prefill?.fullName ?? "",
    dateOfBirth: "",
    phone: "",
    email: "",
    guardianName: "",
    guardianPhone: "",
    guardianEmail: "",
    relationship: "",
    guardianConsent: false,
    topics: prefill?.topics ?? [],
    method: "",
    time: "",
    understandsDemo: false,
  };
}

/** The age band for a valid age in whole years. 18 is the age of majority (Age of Majority Act 1971, s 2). */
export function ageBand(age: number): AgeBand {
  if (age >= 18) return "adult";
  if (age >= 16) return "16-17";
  if (age >= 10) return "10-15";
  return "under-10";
}

/** Age and band from a date of birth, or null while the date is missing or invalid. */
export function readAge(dateOfBirth: string, today = new Date()): { age: number; band: AgeBand } | null {
  const age = ageOn(dateOfBirth, today);
  if (age === null || age < 0 || age > 100) return null;
  return { age, band: ageBand(age) };
}

export const isMinor = (band: AgeBand | undefined) => band !== undefined && band !== "adult";

/**
 * Plain-language guidance per band. Only what the sources support; everything product-specific is
 * left to the adviser and insurer.
 */
export const ELIGIBILITY_NOTE =
  "Insurance eligibility and policy ownership depend on the insurer and selected plan. A parent or legal guardian may need to participate.";

export const ageGuidance: Record<AgeBand, { headline: string; points: string[] }> = {
  adult: {
    headline: "You can continue with your own adviser request.",
    points: [
      "You're 18 or older, so you can ask for help in your own name.",
      "The adviser and insurer still confirm which plans you're eligible for.",
    ],
  },
  "16-17": {
    headline: "Because you're under 18, a parent or legal guardian may need to help with the insurance process.",
    points: [
      "For life insurance, Malaysian law lets someone aged 16 or 17 take out a policy on their own life.",
      "Many other plans, such as medical or accident cover, have their own age rules and may need a parent or guardian.",
      "We'll ask for a parent's or guardian's details so they can be part of the conversation.",
    ],
  },
  "10-15": {
    headline: "Because you're under 18, a parent or legal guardian may need to help with the insurance process.",
    points: [
      "For life insurance, Malaysian law lets someone aged 10 to 15 take out a policy only with a parent's or guardian's written consent.",
      "Other plans, such as medical or accident cover, have their own rules, and a parent or guardian is often the policy owner.",
      "We'll ask for a parent's or guardian's details: they're the contact for this request.",
    ],
  },
  "under-10": {
    headline: "Because this is for a child, a parent or legal guardian needs to lead the insurance process.",
    points: [
      "A parent or legal guardian usually arranges cover for a young child.",
      "Plans for children have their own entry ages and rules, set by each insurer.",
      "We'll ask for a parent's or guardian's details: they're the contact for this request.",
    ],
  },
};

/** Sources behind `ageGuidance`, read 28 Nov 2026. Shown in the app so the guidance can be checked. */
export const MINOR_SOURCES = [
  {
    label: "Financial Services Act 2013 (Act 758), Schedule 8, para 4: capacity of minor to insure (life policies)",
    url: "https://www.bnm.gov.my/documents/20124/820862/act758_fsa2013_en.pdf",
  },
  {
    label: "Islamic Financial Services Act 2013 (Act 759): the matching rule for family takaful",
    url: "https://www.bnm.gov.my/legislation",
  },
  {
    label: "Great Eastern General — GREAT Shield Active PDS (personal accident): a child below 18 ANB needs a parent/guardian as policyholder",
    url: "https://www.greateasternlife.com/content/dam/corp-site/my/malaysia/gelm-brand-comm/gegm/gegm-product/gegm-pdt-pd-great-shield-active-pds.pdf",
  },
] as const;

/* --------------------------------------------------------------------------- validation */

export function validateAdviserDetails(d: AdviserRequestDraft, today = new Date()): FieldErrors {
  const e: FieldErrors = {};
  if (d.fullName.trim().length < 2) e.fullName = "Enter the full name of the person the cover would be for.";
  if (!d.dateOfBirth) e.dateOfBirth = "Enter the date of birth.";
  else if (!readAge(d.dateOfBirth, today)) e.dateOfBirth = "Enter a valid date of birth.";
  return e;
}

export function validateAdviserContact(d: AdviserRequestDraft, today = new Date()): FieldErrors {
  const e: FieldErrors = {};
  const a = readAge(d.dateOfBirth, today);
  const minor = isMinor(a?.band);
  if (minor) {
    if (d.guardianName.trim().length < 2) e.guardianName = "Enter the parent's or guardian's full name.";
    if (!d.relationship) e.relationship = "Choose their relationship to the child.";
    if (!d.guardianPhone.trim()) e.guardianPhone = "Enter the parent's or guardian's mobile number.";
    else if (!isMalaysianMobile(d.guardianPhone)) e.guardianPhone = "Enter a Malaysian mobile number, for example 012-345 6789.";
    if (!d.guardianEmail.trim()) e.guardianEmail = "Enter the parent's or guardian's email.";
    else if (!isEmail(d.guardianEmail)) e.guardianEmail = "Enter a valid email address, for example name@example.com.";
    if (!d.guardianConsent) e.guardianConsent = "Confirm that the parent or guardian knows about this request.";
  } else {
    if (!d.phone.trim()) e.phone = "Enter your mobile number.";
    else if (!isMalaysianMobile(d.phone)) e.phone = "Enter a Malaysian mobile number, for example 012-345 6789.";
    if (!d.email.trim()) e.email = "Enter your email address.";
    else if (!isEmail(d.email)) e.email = "Enter a valid email address, for example name@example.com.";
  }
  if (!d.method) e.method = "Choose how you'd like to be contacted.";
  return e;
}

export function validateAdviserReview(d: AdviserRequestDraft): FieldErrors {
  return d.understandsDemo ? {} : { understandsDemo: "Confirm that you understand this request stays on this device." };
}

/** The first step with errors, or "review" when details and contact are complete. */
export function firstIncompleteAdviserStep(d: AdviserRequestDraft, today = new Date()): AdviserRequestStep {
  if (Object.keys(validateAdviserDetails(d, today)).length) return "details";
  if (Object.keys(validateAdviserContact(d, today)).length) return "contact";
  return "review";
}

export function canSaveAdviserRequest(d: AdviserRequestDraft, today = new Date()) {
  return firstIncompleteAdviserStep(d, today) === "review" && !Object.keys(validateAdviserReview(d)).length;
}

/** Only the fields that apply to the band are kept: an adult request never stores guardian data, and vice versa. */
export function toSavedRequest(d: AdviserRequestDraft, today = new Date()): SavedAdviserRequest {
  const band = readAge(d.dateOfBirth, today)?.band ?? "adult";
  const minor = isMinor(band);
  return {
    ...d,
    phone: minor ? "" : d.phone.trim(),
    email: minor ? "" : d.email.trim(),
    guardianName: minor ? d.guardianName.trim() : "",
    guardianPhone: minor ? d.guardianPhone.trim() : "",
    guardianEmail: minor ? d.guardianEmail.trim() : "",
    relationship: minor ? d.relationship : "",
    guardianConsent: minor ? d.guardianConsent : false,
    fullName: d.fullName.trim(),
    band,
    savedAt: Date.now(),
  };
}

/** A plain-text summary the user can copy into an official adviser channel themselves. */
export function requestSummary(r: SavedAdviserRequest, topicLabel: (a: ProtectionArea) => string): string {
  const minor = isMinor(r.band);
  const lines = [
    "Adviser request (prepared in GREAT EMPOWER, not sent by the app)",
    `Cover is for: ${r.fullName}, born ${r.dateOfBirth}`,
    minor
      ? `Parent/guardian: ${r.guardianName} (${r.relationship ? relationshipLabels[r.relationship] : ""}), ${r.guardianPhone}, ${r.guardianEmail}`
      : `Contact: ${r.phone}, ${r.email}`,
    `Topics: ${r.topics.length ? r.topics.map(topicLabel).join(", ") : "Not sure yet"}`,
    `Preferred contact: ${r.method ? contactMethodLabels[r.method] : ""}${r.time ? `, ${contactTimeLabels[r.time]}` : ""}`,
  ];
  if (minor) lines.push("Under 18: please confirm eligibility, policy ownership and consent for the plan discussed.");
  return lines.join("\n");
}
