import assert from "node:assert/strict";
import test from "node:test";
import { type Engine2Failure, type Engine2StageName } from "../../calculation-engine/engine-2.ts";
import { calculateEngine2Scenario, presentEngine2Failure } from "./calculateEngine2Scenario.ts";
import type { Engine2RequestMetadata, MedicalClaimSimulatorDraft } from "./buildEngine2Request.ts";

const metadata: Engine2RequestMetadata = {
  scenarioId: "medical-claim-integration-test",
  asOfDate: "2026-11-22",
};

function draft(): MedicalClaimSimulatorDraft {
  return {
    careSetting: "INPATIENT",
    coverageGate: "PROCEED_WITHOUT_GATE_ASSUMPTION",
    grossBill: "1000.00",
    chargeLines: [
      {
        id: 1,
        description: "hospital",
        amount: "1000.00",
        eligibility: "ELIGIBLE_ASSUMED",
      },
    ],
    externalEmployerPayment: "",
    employerScenarioMaximum: "0.00",
    employerReducesDeductible: "no",
    deductibleRemaining: "100.00",
    costSharingOrder: "DEDUCTIBLE_FIRST",
    shareType: "CO_PAYMENT",
    shareRate: "0.10",
    exemption: "EXEMPT_SELECTED_COPAY_ONLY",
    annualLimitMode: "NO_LIMIT",
    annualLimitAmount: "",
    lifetimeLimitMode: "NO_LIMIT",
    lifetimeLimitAmount: "",
  };
}

const expectedStages: Engine2StageName[] = [
  "waiting_period_exclusion_gate",
  "non_eligible_charges",
  "room_and_board_sub_limits",
  "room_upgrade_proration",
  "employer_coordination",
  "patient_cost_sharing",
  "current_claim_limits",
];

test("calculates a non-gated scenario through the public API and preserves exact results", () => {
  const result = calculateEngine2Scenario(draft(), metadata);
  assert.equal(result.kind, "success");
  if (result.kind !== "success") return;

  const { outputs } = result.result;
  assert.equal(result.result.result_status, "CALCULATED_EDUCATIONAL");
  assert.equal(outputs.gross_bill.sen, "100000");
  assert.equal(outputs.gross_bill.display_myr, "RM1000.00");
  assert.equal(outputs.employer_payment.kind, "EMPLOYER_COORDINATION");
  assert.equal(outputs.employer_payment.amount.display_myr, "RM0.00");
  assert.equal(outputs.personal_insurer_payment.sen, "81000");
  assert.equal(outputs.personal_insurer_payment.display_myr, "RM810.00");
  assert.equal(outputs.user_out_of_pocket.display_myr, "RM190.00");
  assert.equal(outputs.patient_payable.display_myr, "RM100.00");
  assert.equal(outputs.WAIVED_COPAYMENT.sen, "9000");
  assert.equal(outputs.WAIVED_COPAYMENT.display_myr, "RM90.00");
  assert.equal(outputs.WAIVED_DEDUCTIBLE.sen, "0");
  assert.equal(outputs.unallocated_amount.sen, "0");
  assert.equal(outputs.unallocated_amount.display_myr, "RM0.00");
  assert.deepEqual(
    outputs.stage_results.map((stage) => stage.stage),
    expectedStages,
  );
  assert.ok(outputs.stage_results.every((stage) => stage.status !== "SKIPPED_GATE"));
});

test("calculates a gated scenario with the returned personal stages skipped", () => {
  const gated = draft();
  gated.coverageGate = "APPLY_WAITING_PERIOD";
  gated.externalEmployerPayment = "300.00";

  const result = calculateEngine2Scenario(gated, metadata);
  assert.equal(result.kind, "success");
  if (result.kind !== "success") return;

  const { outputs } = result.result;
  assert.equal(outputs.employer_payment.kind, "EXTERNAL_EMPLOYER_PAYMENT");
  assert.equal(outputs.employer_payment.amount.display_myr, "RM300.00");
  assert.equal(outputs.personal_insurer_payment.display_myr, "RM0.00");
  assert.equal(outputs.patient_payable.display_myr, "RM700.00");
  assert.equal(outputs.unallocated_amount.sen, "0");
  assert.deepEqual(
    outputs.stage_results.map((stage) => stage.stage),
    expectedStages,
  );
  assert.equal(outputs.stage_results[0]?.status, "APPLIED");
  assert.ok(outputs.stage_results.slice(1).every((stage) => stage.status === "SKIPPED_GATE"));
});

test("prepares no calculation result when the request is unsupported", () => {
  const unsupported = draft();
  unsupported.chargeLines[0]!.eligibility = "UNKNOWN";

  const result = calculateEngine2Scenario(unsupported, metadata);
  assert.equal(result.kind, "invalid");
  assert.equal("result" in result, false);
  assert.equal("outputs" in result, false);
});

test("maps Engine 2 failures to safe issues without exposing outputs or exception text", () => {
  const failure: Engine2Failure = {
    kind: "failure",
    result_status: "INTERNAL_ERROR",
    outputs: null,
    validation_errors: [
      {
        code: "SETTLEMENT_INVARIANT_VIOLATION",
        field: "/outputs",
        message: "private exception detail must not be shown",
      },
    ],
  };
  const result = presentEngine2Failure(failure, draft());

  assert.equal(failure.outputs, null);
  assert.equal(result.kind, "failure");
  assert.equal("outputs" in result, false);
  assert.equal(result.issues.length, 1);
  assert.match(result.issues[0]!.message, /No financial result is available/);
  assert.doesNotMatch(result.issues[0]!.message, /private exception detail/);
});
