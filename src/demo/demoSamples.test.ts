import assert from "node:assert/strict";
import { test } from "node:test";
import { demoAdviserDraft, demoBillDraft } from "./demoSamples.ts";
import { calculateEngine2Scenario } from "../app/medical-claim/calculateEngine2Scenario.ts";
import { firstIncompleteAdviserStep, readAge, validateAdviserReview } from "../data/adviserRequest.ts";

test("the sample bill calculates successfully and reconciles", () => {
  const r = calculateEngine2Scenario(demoBillDraft(), { scenarioId: "demo-sample", asOfDate: "2026-11-28" });
  assert.equal(r.kind, "success");
  if (r.kind !== "success") return;
  const o = r.result.outputs;
  assert.equal(o.gross_bill.sen, "1200000");
  assert.equal(o.non_eligible_amount.sen, "60000");
});

test("the sample adviser request is a complete under-18, guardian-assisted request", () => {
  const d = demoAdviserDraft();
  const today = new Date(2026, 10, 28);
  assert.equal(readAge(d.dateOfBirth, today)?.band, "10-15");
  assert.equal(firstIncompleteAdviserStep(d, today), "review");
  // The presenter still has to tick the demo acknowledgement on Review.
  assert.ok(validateAdviserReview(d).understandsDemo);
  assert.match(d.guardianEmail, /@example\.com$/);
});
