import type { MedicalClaimSimulatorDraft } from "../app/medical-claim/buildEngine2Request.ts";
import type { AdviserRequestDraft } from "../data/adviserRequest.ts";

/**
 * Sample inputs for Demo-only shortcuts that skip slow live typing. They fill the SAME forms the
 * user would fill; every calculation and validation still runs normally. Fictional values only.
 */

/** A RM12,000 inpatient bill: employer pays up to RM2,000, RM500 deductible, 10% co-payment. */
export function demoBillDraft(): MedicalClaimSimulatorDraft {
  return {
    careSetting: "INPATIENT",
    coverageGate: "PROCEED_WITHOUT_GATE_ASSUMPTION",
    grossBill: "12000.00",
    chargeLines: [
      { id: 1, description: "Ward, surgery and medicine", amount: "11400.00", eligibility: "ELIGIBLE_ASSUMED" },
      { id: 2, description: "Personal items and phone calls", amount: "600.00", eligibility: "NON_ELIGIBLE_ASSUMED" },
    ],
    externalEmployerPayment: "",
    employerScenarioMaximum: "2000.00",
    employerReducesDeductible: "no",
    deductibleRemaining: "500.00",
    costSharingOrder: "DEDUCTIBLE_FIRST",
    shareType: "CO_PAYMENT",
    shareRate: "0.10",
    exemption: "NONE",
    annualLimitMode: "NO_LIMIT",
    annualLimitAmount: "",
    lifetimeLimitMode: "NO_LIMIT",
    lifetimeLimitAmount: "",
  };
}

/**
 * A guardian-assisted request: the child is 14 on the demo date, so the under-18 path is shown.
 * Names are fictional; contact details are placeholders.
 */
export function demoAdviserDraft(): AdviserRequestDraft {
  return {
    fullName: "Adam Rahman",
    dateOfBirth: "2012-03-02",
    phone: "",
    email: "",
    guardianName: "Aisyah Rahman",
    guardianPhone: "012-345 6789",
    guardianEmail: "aisyah.demo@example.com",
    relationship: "legal-guardian",
    guardianConsent: true,
    topics: ["medical", "accident"],
    method: "whatsapp",
    time: "evening",
    preferredDate: "",
    notes: "",
    understandsDemo: false,
  };
}
