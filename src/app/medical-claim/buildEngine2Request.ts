import {
  ENGINE2_TECHNICAL_LIMITS,
  validateEngine2Request,
  type Engine2CareSetting,
  type Engine2CoverageGate,
  type Engine2Exemption,
  type Engine2Inputs,
  type Engine2PublicRequest,
  type Engine2ValidationError,
} from "../../calculation-engine/engine-2.ts";

export interface MedicalClaimChargeLineDraft {
  id: number;
  description: string;
  amount: string;
  eligibility: string;
}

export interface MedicalClaimSimulatorDraft {
  careSetting: string;
  coverageGate: string;
  grossBill: string;
  chargeLines: MedicalClaimChargeLineDraft[];
  externalEmployerPayment: string;
  employerScenarioMaximum: string;
  employerReducesDeductible: string;
  deductibleRemaining: string;
  costSharingOrder: string;
  shareType: string;
  shareRate: string;
  exemption: string;
  annualLimitMode: string;
  annualLimitAmount: string;
  lifetimeLimitMode: string;
  lifetimeLimitAmount: string;
}

export interface Engine2RequestMetadata {
  scenarioId: string;
  asOfDate: string;
}

export interface Engine2RequestIssue {
  field: string;
  step: number;
  message: string;
  controlId?: string;
}

export type Engine2RequestBuildResult =
  | { kind: "ready"; request: Engine2PublicRequest }
  | { kind: "invalid"; issues: Engine2RequestIssue[] };

const ENGINE2_VERSION = "2.0.0-prototype";
const MONEY_PATTERN = /^\d+(?:\.\d{1,2})?$/;
const RATE_PATTERN = /^\d+(?:\.\d+)?$/;

const fieldDetails: Record<string, { step: number; controlId?: string }> = {
  careSetting: { step: 1, controlId: "care-setting-INPATIENT" },
  coverageGate: { step: 1, controlId: "coverage-gate-PROCEED_WITHOUT_GATE_ASSUMPTION" },
  grossBill: { step: 2, controlId: "gross-bill" },
  billReconciliation: { step: 2, controlId: "gross-bill" },
  externalEmployerPayment: { step: 4, controlId: "external-employer-payment" },
  employerScenarioMaximum: { step: 4, controlId: "employer-scenario-maximum" },
  deductibleRemaining: { step: 4, controlId: "deductible-remaining" },
  employerReducesDeductible: { step: 4, controlId: "employer-deductible-credit-yes" },
  costSharingOrder: { step: 5, controlId: "cost-sharing-order-DEDUCTIBLE_FIRST" },
  shareType: { step: 5, controlId: "share-type-CO_PAYMENT" },
  shareRate: { step: 5, controlId: "share-rate" },
  exemption: { step: 5, controlId: "exemption-NONE" },
  annualLimitMode: { step: 5, controlId: "annual-limit-MODELED" },
  annualLimitAmount: { step: 5, controlId: "annual-limit-amount" },
  lifetimeLimitMode: { step: 5, controlId: "lifetime-limit-MODELED" },
  lifetimeLimitAmount: { step: 5, controlId: "lifetime-limit-amount" },
  requestMetadata: { step: 6 },
};

export function validateMyrInput(value: string): string | undefined {
  if (value.length === 0) return "Enter an amount. Use 0 when zero applies.";
  if (/^-\d+(?:\.\d+)?$/.test(value)) return "Negative amounts are not supported.";
  if (!MONEY_PATTERN.test(value)) {
    return "Enter a non-negative MYR amount with up to 2 decimal places. Do not include RM or commas.";
  }
  const wholeDigits = value.split(".")[0]?.length ?? 0;
  if (wholeDigits > ENGINE2_TECHNICAL_LIMITS.maxMoneyWholeDigits) {
    return `The amount can have at most ${ENGINE2_TECHNICAL_LIMITS.maxMoneyWholeDigits} digits before the decimal point.`;
  }
  return undefined;
}

export function validateShareRateInput(value: string): string | undefined {
  if (value.length === 0) return "Enter a share rate from 0 to 1.";
  if (value.length > ENGINE2_TECHNICAL_LIMITS.maxConfigurationUtf8Bytes) {
    return "The share-rate value is too long.";
  }
  if (!RATE_PATTERN.test(value))
    return "Enter a decimal share rate from 0 to 1 without a percent sign.";
  const [whole = "0", fraction = ""] = value.split(".");
  const denominator = 10n ** BigInt(fraction.length);
  const numerator = BigInt(whole) * denominator + BigInt(fraction || "0");
  if (numerator > denominator) return "The share rate must be between 0 and 1.";
  return undefined;
}

function isCareSetting(value: string): value is Engine2CareSetting {
  return ["INPATIENT", "DAY_SURGERY", "OUTPATIENT", "EMERGENCY"].includes(value);
}

function isCoverageGate(value: string): value is Engine2CoverageGate {
  return ["APPLY_WAITING_PERIOD", "APPLY_EXCLUSION", "PROCEED_WITHOUT_GATE_ASSUMPTION"].includes(
    value,
  );
}

function isGatedGate(
  value: Engine2CoverageGate,
): value is Exclude<Engine2CoverageGate, "PROCEED_WITHOUT_GATE_ASSUMPTION"> {
  return value !== "PROCEED_WITHOUT_GATE_ASSUMPTION";
}

function issue(
  field: string,
  message: string,
  details: { step: number; controlId?: string } = fieldDetails[field] ?? { step: 6 },
): Engine2RequestIssue {
  return { field, message, ...details };
}

function validateMoney(value: string, field: string, label: string, issues: Engine2RequestIssue[]) {
  const message = validateMyrInput(value);
  if (message)
    issues.push(issue(field, value.length === 0 ? `${label} is required. ${message}` : message));
}

function validateRequired(
  value: string,
  field: string,
  label: string,
  issues: Engine2RequestIssue[],
) {
  if (value.length === 0) issues.push(issue(field, `${label} is required.`));
}

function mapEngineField(
  error: Engine2ValidationError,
  draft: MedicalClaimSimulatorDraft,
): Engine2RequestIssue {
  if (error.code === "INTERNAL_ERROR" || error.code === "SETTLEMENT_INVARIANT_VIOLATION") {
    return issue(
      "calculation",
      "Engine 2 could not produce a safe result. No financial result is available. Review or edit this scenario.",
      { step: 6 },
    );
  }

  const lineMatch = error.field.match(
    /^\/inputs\/charge_lines\/(\d+)\/(amount_myr|category|eligibility|line_id)$/,
  );
  if (lineMatch) {
    const line = draft.chargeLines[Number(lineMatch[1])];
    if (line) {
      const property = lineMatch[2];
      const field =
        property === "amount_myr"
          ? `chargeLines.${line.id}.amount`
          : property === "eligibility"
            ? `chargeLines.${line.id}.eligibility`
            : `chargeLines.${line.id}.description`;
      return issue(field, messageForEngineError(error), {
        step: property === "eligibility" ? 3 : 2,
        controlId:
          property === "eligibility"
            ? `eligibility-${line.id}-ELIGIBLE_ASSUMED`
            : property === "amount_myr"
              ? `line-amount-${line.id}`
              : `line-description-${line.id}`,
      });
    }
  }

  const mappings: Array<[string, string]> = [
    ["/inputs/total_bill_myr", "grossBill"],
    ["/inputs/coverage_gate", "coverageGate"],
    ["/inputs/care_setting", "careSetting"],
    [
      "/inputs/employer_coordination/external_employer_confirmed_payment_myr",
      "externalEmployerPayment",
    ],
    ["/inputs/employer_coordination/employer_scenario_max_myr", "employerScenarioMaximum"],
    ["/inputs/employer_coordination/deductible_remaining_myr", "deductibleRemaining"],
    ["/inputs/employer_coordination/employer_reduces_deductible", "employerReducesDeductible"],
    ["/inputs/cost_sharing_order", "costSharingOrder"],
    ["/inputs/share_components", "shareType"],
    ["/inputs/share_components/co_payment/rate", "shareRate"],
    ["/inputs/share_components/co_insurance/rate", "shareRate"],
    ["/inputs/exemption", "exemption"],
    ["/inputs/limits/annual/status", "annualLimitMode"],
    ["/inputs/limits/annual/remaining_amount_myr", "annualLimitAmount"],
    ["/inputs/limits/lifetime/status", "lifetimeLimitMode"],
    ["/inputs/limits/lifetime/remaining_amount_myr", "lifetimeLimitAmount"],
  ];
  const mapped = mappings.find(([path]) => error.field === path);
  if (mapped) return issue(mapped[1], messageForEngineError(error));
  if (error.field === "/inputs/charge_lines") {
    return issue("billReconciliation", messageForEngineError(error));
  }
  if (
    error.field.startsWith("/inputs/r_and_b") ||
    error.field.startsWith("/inputs/sub_limits") ||
    error.field.startsWith("/inputs/room_upgrade")
  ) {
    return issue(
      "requestMetadata",
      "This Room & Board or sub-limit configuration is outside the supported prototype scope.",
    );
  }
  if (
    error.field === "/engine_version" ||
    error.field === "/scenario_id" ||
    error.field === "/as_of_date"
  ) {
    return issue(
      "requestMetadata",
      "The scenario metadata could not be validated. Close and reopen the simulator to try again.",
    );
  }
  return issue("requestMetadata", messageForEngineError(error));
}

function messageForEngineError(error: Engine2ValidationError): string {
  switch (error.code) {
    case "MISSING_REQUIRED_FIELD":
      return "Complete this required field.";
    case "INVALID_MONEY_FORMAT":
      return "Enter a non-negative MYR amount with up to 2 decimal places. Do not include RM or commas.";
    case "NEGATIVE_NOT_ALLOWED":
      return "Negative amounts are not supported.";
    case "BILL_TOTAL_MISMATCH":
      return error.field.endsWith("/line_id")
        ? "Each bill line must have a unique identifier."
        : "Bill line amounts must add up exactly to the gross medical bill.";
    case "RULE_CONFIGURATION_REQUIRED":
      return "Choose an explicit supported assumption. This prototype cannot calculate an unknown or unmodeled selection.";
    case "MUTUALLY_EXCLUSIVE_SHARE_TYPES":
      return "Choose exactly one supported share type.";
    case "BRANCH_MISMATCH":
      return "The employer inputs do not match the selected scenario gate. Review the Scenario and Employer steps.";
    case "INPUT_TOO_LONG":
      return "This value exceeds the supported prototype limit.";
    case "INVALID_CONFIGURATION":
    case "UNSUPPORTED_ENUM":
      return "This selection or combination is not supported. Review the selected options.";
    case "MODE_DISABLED":
      return "Product-specific calculations are disabled. This simulator supports generic educational scenarios only.";
    case "SETTLEMENT_INVARIANT_VIOLATION":
    case "INTERNAL_ERROR":
      return "Engine 2 could not produce a safe result. No financial result is available. Review or edit this scenario.";
    default:
      return "Review this input and choose a supported value.";
  }
}

export function mapEngine2FailureErrors(
  errors: Engine2ValidationError[],
  draft: MedicalClaimSimulatorDraft,
): Engine2RequestIssue[] {
  return errors.map((error) => mapEngineField(error, draft));
}

export function buildEngine2Request(
  draft: MedicalClaimSimulatorDraft,
  metadata: Engine2RequestMetadata,
): Engine2RequestBuildResult {
  const issues: Engine2RequestIssue[] = [];

  if (!isCareSetting(draft.careSetting)) {
    issues.push(issue("careSetting", "Choose a supported care setting."));
  }
  if (!isCoverageGate(draft.coverageGate)) {
    issues.push(issue("coverageGate", "Choose a supported scenario gate."));
  }
  validateMoney(draft.grossBill, "grossBill", "Gross medical bill", issues);
  if (draft.chargeLines.length === 0) {
    issues.push(issue("billReconciliation", "Add at least one bill line."));
  }
  if (draft.chargeLines.length > ENGINE2_TECHNICAL_LIMITS.maxChargeLines) {
    issues.push(
      issue(
        "billReconciliation",
        `Use no more than ${ENGINE2_TECHNICAL_LIMITS.maxChargeLines} bill lines.`,
      ),
    );
  }

  for (const line of draft.chargeLines) {
    const descriptionField = `chargeLines.${line.id}.description`;
    const amountField = `chargeLines.${line.id}.amount`;
    const eligibilityField = `chargeLines.${line.id}.eligibility`;
    if (line.description.trim().length === 0) {
      issues.push(
        issue(descriptionField, "Enter a bill-line category or short description.", {
          step: 2,
          controlId: `line-description-${line.id}`,
        }),
      );
    }
    validateMoney(line.amount, amountField, "Line amount", issues);
    if (line.eligibility === "UNKNOWN") {
      issues.push(
        issue(
          eligibilityField,
          "“Not sure” is not supported. Choose an explicit eligible or non-eligible scenario assumption.",
          {
            step: 3,
            controlId: `eligibility-${line.id}-ELIGIBLE_ASSUMED`,
          },
        ),
      );
    } else if (
      line.eligibility !== "ELIGIBLE_ASSUMED" &&
      line.eligibility !== "NON_ELIGIBLE_ASSUMED"
    ) {
      issues.push(
        issue(eligibilityField, "Choose an explicit eligibility assumption.", {
          step: 3,
          controlId: `eligibility-${line.id}-ELIGIBLE_ASSUMED`,
        }),
      );
    }
  }

  if (!isCoverageGate(draft.coverageGate)) return { kind: "invalid", issues };
  const gate = draft.coverageGate;

  if (isGatedGate(gate)) {
    validateMoney(
      draft.externalEmployerPayment,
      "externalEmployerPayment",
      "External employer payment",
      issues,
    );
  } else {
    validateMoney(
      draft.employerScenarioMaximum,
      "employerScenarioMaximum",
      "Employer scenario maximum",
      issues,
    );
    validateMoney(draft.deductibleRemaining, "deductibleRemaining", "Remaining deductible", issues);
    if (draft.employerReducesDeductible !== "yes" && draft.employerReducesDeductible !== "no") {
      issues.push(
        issue(
          "employerReducesDeductible",
          "Choose yes or no for the deductible-credit assumption.",
        ),
      );
    }
    if (draft.costSharingOrder !== "DEDUCTIBLE_FIRST" && draft.costSharingOrder !== "COPAY_FIRST") {
      issues.push(issue("costSharingOrder", "Choose a supported cost-sharing order."));
    }
    if (draft.shareType !== "CO_PAYMENT" && draft.shareType !== "CO_INSURANCE") {
      issues.push(issue("shareType", "Choose exactly one supported share type."));
    }
    const rateError = validateShareRateInput(draft.shareRate);
    if (rateError) issues.push(issue("shareRate", rateError));
    if (
      draft.exemption !== "NONE" &&
      draft.exemption !== "EXEMPT_SELECTED_COPAY_ONLY" &&
      draft.exemption !== "EXEMPT_COPAY_AND_DEDUCTIBLE_AS_ASSUMPTION"
    ) {
      issues.push(issue("exemption", "Choose an explicit supported waiver assumption."));
    } else if (draft.shareType === "CO_INSURANCE" && draft.exemption !== "NONE") {
      issues.push(
        issue("exemption", "Copayment waiver assumptions cannot be paired with co-insurance."),
      );
    }
    validateLimit(
      draft.annualLimitMode,
      draft.annualLimitAmount,
      "annualLimitMode",
      "annualLimitAmount",
      "Annual",
      issues,
    );
    validateLimit(
      draft.lifetimeLimitMode,
      draft.lifetimeLimitAmount,
      "lifetimeLimitMode",
      "lifetimeLimitAmount",
      "Lifetime",
      issues,
    );
  }

  if (issues.length > 0) return { kind: "invalid", issues };

  const careSetting = draft.careSetting as Engine2CareSetting;
  const chargeLines = draft.chargeLines.map((line) => ({
    line_id: `line-${line.id}`,
    amount_myr: line.amount,
    category: line.description,
    eligibility: line.eligibility as "ELIGIBLE_ASSUMED" | "NON_ELIGIBLE_ASSUMED",
  }));
  const commonInputs = {
    total_bill_myr: draft.grossBill,
    charge_lines: chargeLines,
    care_setting: careSetting,
  };

  let inputs: Engine2Inputs;
  if (isGatedGate(gate)) {
    inputs = {
      ...commonInputs,
      coverage_gate: gate,
      employer_coordination: {
        path: "GATED",
        external_employer_confirmed_payment_myr: draft.externalEmployerPayment,
      },
    };
  } else {
    const shareComponent = { rate: draft.shareRate, cap: "NO_CAP" as const };
    inputs = {
      ...commonInputs,
      coverage_gate: "PROCEED_WITHOUT_GATE_ASSUMPTION",
      employer_coordination: {
        path: "NON_GATED",
        employer_scenario_max_myr: draft.employerScenarioMaximum,
        employer_reduces_deductible: draft.employerReducesDeductible === "yes",
        deductible_remaining_myr: draft.deductibleRemaining,
      },
      r_and_b: { mode: "NOT_MODELED" },
      sub_limits: [],
      room_upgrade: { mode: "EXCESS_ONLY" },
      cost_sharing_order: draft.costSharingOrder as "DEDUCTIBLE_FIRST" | "COPAY_FIRST",
      share_components: {
        co_payment: draft.shareType === "CO_PAYMENT" ? shareComponent : null,
        co_insurance: draft.shareType === "CO_INSURANCE" ? shareComponent : null,
      },
      exemption: draft.exemption as Engine2Exemption,
      limits: {
        annual: limitState(draft.annualLimitMode, draft.annualLimitAmount),
        lifetime: limitState(draft.lifetimeLimitMode, draft.lifetimeLimitAmount),
      },
    };
  }

  const request: Engine2PublicRequest = {
    calculation_mode: "GENERIC_EDUCATIONAL",
    engine_id: "E2",
    engine_version: ENGINE2_VERSION,
    scenario_id: metadata.scenarioId,
    as_of_date: metadata.asOfDate,
    currency: "MYR",
    inputs,
    assumptions: [],
  };

  const validation = validateEngine2Request(request);
  if (validation.kind === "failure") {
    return {
      kind: "invalid",
      issues: mapEngine2FailureErrors(validation.validation_errors, draft),
    };
  }
  return { kind: "ready", request };
}

function validateLimit(
  mode: string,
  amount: string,
  modeField: string,
  amountField: string,
  label: string,
  issues: Engine2RequestIssue[],
) {
  if (mode === "MODELED") {
    validateMoney(amount, amountField, `${label} remaining amount`, issues);
  } else if (mode !== "NO_LIMIT") {
    issues.push(
      issue(
        modeField,
        `Choose an explicit ${label.toLowerCase()} limit amount or “Assume no limit”.`,
      ),
    );
  }
}

function limitState(mode: string, amount: string) {
  return mode === "MODELED"
    ? { status: "MODELED" as const, remaining_amount_myr: amount }
    : { status: "NO_LIMIT" as const };
}
