import type { ProtectionArea } from "../state/profile.ts";
import type { ProtectionSlug } from "./protection.ts";

/**
 * Protect → Get cover helpers. The adviser call-back below was read on the insurer's own official
 * page on 28 Nov 2026. It is ONE example of an official way to reach a licensed adviser (the
 * assistance path), not a recommendation. GREAT EMPOWER is not affiliated with Great Eastern.
 * Applying itself happens in the app (src/app/protect/ApplyFlow.tsx), never on an insurer's site.
 */
export const CHANNELS_CHECKED_ON = "28 Nov 2026";

/** Protect's four assessed areas → the matching protection category in Learn. */
export const areaToSlug: Record<ProtectionArea, ProtectionSlug> = {
  medical: "medical",
  critical: "critical-illness",
  life: "life",
  accident: "personal-accident",
};

/** The insurer's own call-back form: an official way to reach a licensed adviser. */
export const adviserCallBack = {
  label: "Great Eastern Life — Request a call back",
  url: "https://www.greateasternlife.com/my/en/personal-insurance/request-a-call-back.html",
  pageSays: [
    "A Life Planning Advisor gets back to you within 48 hours",
    "Calls Monday to Friday, 8.30am to 5.15pm, except public holidays",
    "Asks for your name, date of birth, contact details, state and preferred language",
  ],
};
