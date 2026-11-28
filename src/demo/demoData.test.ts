import assert from "node:assert/strict";
import { test } from "node:test";
import { DEMO_ACCOUNT_ID, demoApplicationDraft, demoPersona, demoProfile, demoSavingsMonths } from "./demoData.ts";
import { firstIncompleteStep, validateDetails } from "../data/application.ts";

const now = new Date(2026, 10, 28).getTime();

test("the demo namespace can't collide with a real account id", () => {
  // Real ids are UUIDs or `acc-<time>-<rand>`.
  assert.doesNotMatch(DEMO_ACCOUNT_ID, /^[0-9a-f]{8}-|^acc-/);
});

test("sample profile is complete and shows every finding type", () => {
  const p = demoProfile(now);
  // Every field the check's completeness counts is filled in.
  for (const v of [p.age, p.monthlyIncome, p.monthlyExpenses, p.dependants, ...Object.values(p.coverage)]) assert.notEqual(v, "");
  assert.deepEqual(p.priorities, ["medical", "critical"]);
  assert.equal(p.coverage.medical, "yes"); // Covered
  assert.equal(p.coverage.critical, "no"); // priority + no cover → Gap
  assert.equal(p.coverage.life, "not-sure"); // Review
  assert.equal(p.coverage.accident, "no"); // not a priority → Review
  assert.equal(p.age, String(demoPersona.age));
});

test("sample application is a half-finished draft with placeholder contact details", () => {
  const a = demoApplicationDraft(now);
  assert.equal(a.status, "draft");
  assert.deepEqual(validateDetails(a.details, new Date(now)), {});
  assert.equal(firstIncompleteStep(a, new Date(now)), "cover");
  assert.match(a.details.email, /@example\.com$/);
});

test("persona figures are internally consistent", () => {
  assert.ok(demoSavingsMonths > 1 && demoSavingsMonths < 3);
  assert.ok(demoPersona.monthlyExpenses < demoPersona.monthlyIncome);
});
