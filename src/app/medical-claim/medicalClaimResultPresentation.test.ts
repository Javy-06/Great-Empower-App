import assert from "node:assert/strict";
import test from "node:test";
import type { Engine2StageName } from "../../calculation-engine/engine-2.ts";
import { calculateEngine2Scenario } from "./calculateEngine2Scenario.ts";
import type { Engine2RequestMetadata, MedicalClaimSimulatorDraft } from "./buildEngine2Request.ts";
import { buildMedicalClaimResultPresentation } from "./medicalClaimResultPresentation.ts";

const metadata: Engine2RequestMetadata = {
  scenarioId: "medical-claim-result-presentation-test",
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

test("presents non-gated amounts, zero values, waivers, reconciliation, and returned stages", () => {
  const calculation = calculateEngine2Scenario(draft(), metadata);
  assert.equal(calculation.kind, "success");
  if (calculation.kind !== "success") return;

  const { outputs } = calculation.result;
  const presentation = buildMedicalClaimResultPresentation(calculation.result, calculation.request);
  const employerRows = presentation.paymentRows.filter((row) => row.id === "employer-payment");
  const waivedCopayment = presentation.paymentRows.find((row) => row.id === "waived-copayment");
  const waivedDeductible = presentation.paymentRows.find((row) => row.id === "waived-deductible");
  const unallocated = presentation.paymentRows.find((row) => row.id === "unallocated-amount");

  assert.equal(presentation.resultStatus, calculation.result.result_status);
  assert.deepEqual(presentation.grossBill, outputs.gross_bill);
  assert.deepEqual(presentation.patientPayable, outputs.patient_payable);
  assert.equal(employerRows.length, 1);
  assert.equal(employerRows[0]?.note, "Employer coordination");
  assert.equal(employerRows[0]?.amount.display_myr, outputs.employer_payment.amount.display_myr);
  assert.equal(outputs.employer_payment.amount.display_myr, "RM0.00");
  assert.equal(waivedCopayment?.amount.display_myr, outputs.WAIVED_COPAYMENT.display_myr);
  assert.equal(waivedDeductible?.amount.display_myr, outputs.WAIVED_DEDUCTIBLE.display_myr);
  assert.equal(waivedDeductible?.amount.display_myr, "RM0.00");
  assert.equal(unallocated?.amount.display_myr, outputs.unallocated_amount.display_myr);
  assert.equal(presentation.isReconciled, outputs.unallocated_amount.sen === "0");
  assert.deepEqual(
    presentation.stages.map((stage) => stage.stage),
    expectedStages,
  );
  assert.deepEqual(
    presentation.stages.map((stage) => stage.status),
    outputs.stage_results.map((stage) => stage.status),
  );
  assert.ok(presentation.stages.every((stage) => !stage.skippedBecauseGated));
  assert.match(
    presentation.insights.find((insight) => insight.title === "Cost-sharing selections")
      ?.explanation ?? "",
    /deductible first and a co-payment rate of 0\.10/,
  );
});

test("presents a gated external employer payment once and preserves skipped stage statuses", () => {
  const gatedDraft = draft();
  gatedDraft.coverageGate = "APPLY_WAITING_PERIOD";
  gatedDraft.externalEmployerPayment = "300.00";

  const calculation = calculateEngine2Scenario(gatedDraft, metadata);
  assert.equal(calculation.kind, "success");
  if (calculation.kind !== "success") return;

  const { outputs } = calculation.result;
  const presentation = buildMedicalClaimResultPresentation(calculation.result, calculation.request);
  const employerRows = presentation.paymentRows.filter((row) => row.id === "employer-payment");
  const waiverRows = presentation.paymentRows.filter((row) => row.type === "adjustment");

  assert.equal(employerRows.length, 1);
  assert.equal(employerRows[0]?.label, "Employer payment");
  assert.equal(employerRows[0]?.note, "External employer payment");
  assert.equal(employerRows[0]?.amount.display_myr, outputs.employer_payment.amount.display_myr);
  assert.equal(outputs.employer_payment.kind, "EXTERNAL_EMPLOYER_PAYMENT");
  assert.equal(outputs.personal_insurer_payment.display_myr, "RM0.00");
  assert.equal(
    presentation.paymentRows.find((row) => row.id === "patient-payable")?.amount.display_myr,
    outputs.patient_payable.display_myr,
  );
  assert.equal(waiverRows.length, 0);
  assert.deepEqual(
    presentation.stages.map((stage) => stage.status),
    outputs.stage_results.map((stage) => stage.status),
  );
  assert.equal(presentation.stages[0]?.status, "APPLIED");
  assert.ok(presentation.stages.slice(1).every((stage) => stage.skippedBecauseGated));
  assert.match(
    presentation.insights.find((insight) => insight.title === "Selected gate scenario")
      ?.explanation ?? "",
    /does not confirm a real policy gate/,
  );
  assert.match(
    presentation.insights.find((insight) => insight.title === "Payer and patient amounts")
      ?.explanation ?? "",
    /external employer amount appears once/,
  );
});

test("preserves large monetary strings exactly from the Engine 2 result", () => {
  const largeDraft = draft();
  const largeBill = "12345678901234567890123456789012345678901234567890.12";
  largeDraft.grossBill = largeBill;
  largeDraft.chargeLines[0]!.amount = largeBill;

  const calculation = calculateEngine2Scenario(largeDraft, metadata);
  assert.equal(calculation.kind, "success");
  if (calculation.kind !== "success") return;

  const presentation = buildMedicalClaimResultPresentation(calculation.result, calculation.request);
  assert.equal(
    presentation.grossBill.display_myr,
    calculation.result.outputs.gross_bill.display_myr,
  );
  assert.equal(presentation.grossBill.sen, calculation.result.outputs.gross_bill.sen);
  assert.equal(
    presentation.patientPayable.display_myr,
    calculation.result.outputs.patient_payable.display_myr,
  );
});

test("does not produce a dashboard model for a rejected request", () => {
  const unsupported = draft();
  unsupported.chargeLines[0]!.eligibility = "UNKNOWN";

  const calculation = calculateEngine2Scenario(unsupported, metadata);
  assert.equal(calculation.kind, "invalid");
  assert.equal("result" in calculation, false);
  assert.equal("outputs" in calculation, false);
});
