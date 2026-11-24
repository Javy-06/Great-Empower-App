import assert from "node:assert/strict";
import test from "node:test";
import {
  buildEngine2Request,
  type Engine2RequestBuildResult,
  type Engine2RequestMetadata,
  type MedicalClaimSimulatorDraft,
} from "./buildEngine2Request.ts";

const metadata: Engine2RequestMetadata = {
  scenarioId: "medical-claim-test-1",
  asOfDate: "2026-11-22",
};

function nonGatedDraft(): MedicalClaimSimulatorDraft {
  return {
    careSetting: "INPATIENT",
    coverageGate: "PROCEED_WITHOUT_GATE_ASSUMPTION",
    grossBill: "00100.10",
    chargeLines: [
      {
        id: 1,
        description: "hospital",
        amount: "00100.10",
        eligibility: "ELIGIBLE_ASSUMED",
      },
    ],
    externalEmployerPayment: "77.77",
    employerScenarioMaximum: "000.50",
    employerReducesDeductible: "yes",
    deductibleRemaining: "000.40",
    costSharingOrder: "COPAY_FIRST",
    shareType: "CO_INSURANCE",
    shareRate: "0.20",
    exemption: "NONE",
    annualLimitMode: "MODELED",
    annualLimitAmount: "000.00",
    lifetimeLimitMode: "NO_LIMIT",
    lifetimeLimitAmount: "99.99",
  };
}

function invalidResult(
  draft: MedicalClaimSimulatorDraft,
): Extract<Engine2RequestBuildResult, { kind: "invalid" }> {
  const result = buildEngine2Request(draft, metadata);
  assert.equal(result.kind, "invalid");
  if (result.kind !== "invalid") throw new Error("Expected invalid request result.");
  return result;
}

test("builds the supported non-gated request with exact money strings", () => {
  const result = buildEngine2Request(nonGatedDraft(), metadata);
  assert.equal(result.kind, "ready");
  if (result.kind !== "ready") return;

  assert.deepEqual(result.request, {
    calculation_mode: "GENERIC_EDUCATIONAL",
    engine_id: "E2",
    engine_version: "2.0.0-prototype",
    scenario_id: "medical-claim-test-1",
    as_of_date: "2026-11-22",
    currency: "MYR",
    inputs: {
      total_bill_myr: "00100.10",
      charge_lines: [
        {
          line_id: "line-1",
          amount_myr: "00100.10",
          category: "hospital",
          eligibility: "ELIGIBLE_ASSUMED",
        },
      ],
      care_setting: "INPATIENT",
      coverage_gate: "PROCEED_WITHOUT_GATE_ASSUMPTION",
      employer_coordination: {
        path: "NON_GATED",
        employer_scenario_max_myr: "000.50",
        employer_reduces_deductible: true,
        deductible_remaining_myr: "000.40",
      },
      r_and_b: { mode: "NOT_MODELED" },
      sub_limits: [],
      room_upgrade: { mode: "EXCESS_ONLY" },
      cost_sharing_order: "COPAY_FIRST",
      share_components: {
        co_payment: null,
        co_insurance: { rate: "0.20", cap: "NO_CAP" },
      },
      exemption: "NONE",
      limits: {
        annual: { status: "MODELED", remaining_amount_myr: "000.00" },
        lifetime: { status: "NO_LIMIT" },
      },
    },
    assumptions: [],
  });
});

test("builds a gated request without mixing in non-gated fields", () => {
  const draft = nonGatedDraft();
  draft.coverageGate = "APPLY_WAITING_PERIOD";
  draft.externalEmployerPayment = "0.00";

  const result = buildEngine2Request(draft, metadata);
  assert.equal(result.kind, "ready");
  if (result.kind !== "ready") return;

  assert.deepEqual(result.request.inputs, {
    total_bill_myr: "00100.10",
    charge_lines: [
      {
        line_id: "line-1",
        amount_myr: "00100.10",
        category: "hospital",
        eligibility: "ELIGIBLE_ASSUMED",
      },
    ],
    care_setting: "INPATIENT",
    coverage_gate: "APPLY_WAITING_PERIOD",
    employer_coordination: {
      path: "GATED",
      external_employer_confirmed_payment_myr: "0.00",
    },
  });
  assert.equal(result.request.assumptions.length, 0);
});

test("rejects missing required fields with field-specific guidance", () => {
  const draft = nonGatedDraft();
  draft.grossBill = "";
  draft.chargeLines[0]!.description = "";
  draft.employerReducesDeductible = "";
  draft.lifetimeLimitMode = "";

  const result = invalidResult(draft);
  assert.ok(
    result.issues.some((item) => item.field === "grossBill" && item.message.includes("required")),
  );
  assert.ok(result.issues.some((item) => item.field === "chargeLines.1.description"));
  assert.ok(result.issues.some((item) => item.field === "employerReducesDeductible"));
  assert.ok(result.issues.some((item) => item.field === "lifetimeLimitMode"));
});

test("rejects malformed, negative, and over-precision MYR strings", () => {
  for (const value of ["-1.00", "1.001", "1,000", "RM1.00", "1."]) {
    const draft = nonGatedDraft();
    draft.grossBill = value;
    const result = invalidResult(draft);
    assert.ok(
      result.issues.some((item) => item.field === "grossBill"),
      value,
    );
  }
});

test("rejects unknown eligibility and unsupported cost-sharing configurations", () => {
  const outOfRangeRate = nonGatedDraft();
  outOfRangeRate.shareRate = "1.01";
  assert.ok(invalidResult(outOfRangeRate).issues.some((item) => item.field === "shareRate"));

  const unknownEligibility = nonGatedDraft();
  unknownEligibility.chargeLines[0]!.eligibility = "UNKNOWN";
  assert.ok(
    invalidResult(unknownEligibility).issues.some(
      (item) => item.field === "chargeLines.1.eligibility",
    ),
  );

  const unavailableLimit = nonGatedDraft();
  unavailableLimit.annualLimitMode = "NOT_MODELED";
  assert.ok(
    invalidResult(unavailableLimit).issues.some((item) => item.field === "annualLimitMode"),
  );

  const incompatibleWaiver = nonGatedDraft();
  incompatibleWaiver.exemption = "EXEMPT_SELECTED_COPAY_ONLY";
  assert.ok(invalidResult(incompatibleWaiver).issues.some((item) => item.field === "exemption"));
});

test("uses Engine 2 validation for exact bill reconciliation", () => {
  const draft = nonGatedDraft();
  draft.chargeLines[0]!.amount = "99.99";

  const result = invalidResult(draft);
  assert.ok(
    result.issues.some(
      (item) => item.field === "billReconciliation" && item.message.includes("add up exactly"),
    ),
  );
});
