import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ageOn,
  canComplete,
  emptyApplication,
  firstIncompleteStep,
  isMalaysianMobile,
  validateCover,
  validateDeclaration,
  validateDetails,
  validateHealth,
} from "./application.ts";

const today = new Date(2026, 10, 28);
const filled = () => {
  const a = emptyApplication("medical", { fullName: "Aisyah Rahman" });
  a.details = { fullName: "Aisyah Rahman", dateOfBirth: "2002-05-14", residency: "citizen", occupation: "Student", mobile: "012-345 6789", email: "aisyah@example.com" };
  a.cover = { amount: "Not sure yet", budget: "120", frequency: "monthly", basis: "either", existing: "no" };
  a.health = { tobacco: "no", condition: "no", medication: "no", hospital: "no", occupationRisk: "no" };
  return a;
};

test("age is whole years, birthday-aware, and rejects impossible dates", () => {
  assert.equal(ageOn("2008-11-28", today), 18);
  assert.equal(ageOn("2008-11-29", today), 17);
  assert.equal(ageOn("2002-02-30", today), null);
  assert.equal(ageOn("not a date", today), null);
});

test("details: required fields, adults only, Malaysian mobile, email", () => {
  const e = validateDetails(emptyApplication("life").details, today);
  assert.deepEqual(Object.keys(e).sort(), ["dateOfBirth", "email", "fullName", "mobile", "occupation", "residency"]);
  assert.match(validateDetails({ ...filled().details, dateOfBirth: "2010-01-01" }, today).dateOfBirth, /18 or older/);
  assert.equal(Object.keys(validateDetails(filled().details, today)).length, 0);
  for (const ok of ["0123456789", "012-345 6789", "+60123456789", "011-2345 6789"]) assert.ok(isMalaysianMobile(ok), ok);
  for (const bad of ["12345", "0312345678", "+6512345678"]) assert.ok(!isMalaysianMobile(bad), bad);
  assert.ok(validateDetails({ ...filled().details, email: "aisyah@" }, today).email);
});

test("cover, health and declaration are all required", () => {
  assert.equal(Object.keys(validateCover(emptyApplication("critical").cover)).length, 5);
  assert.ok(validateCover({ ...filled().cover, budget: "5" }).budget);
  assert.equal(Object.keys(validateHealth(emptyApplication("critical").health)).length, 5);
  assert.equal(Object.keys(validateDeclaration({ truthful: true, understandsNotSent: false })).length, 1);
});

test("an application can only be completed when every step is valid and the declaration is ticked", () => {
  const a = filled();
  assert.equal(firstIncompleteStep(emptyApplication("medical"), today), "details");
  assert.equal(firstIncompleteStep(a, today), "review");
  assert.equal(canComplete(a, today), false);
  a.declaration = { truthful: true, understandsNotSent: true };
  assert.equal(canComplete(a, today), true);
  a.health.tobacco = "";
  assert.equal(firstIncompleteStep(a, today), "health");
  assert.equal(canComplete(a, today), false);
});

test("a new application is a draft with no reference number or insurer status", () => {
  const a = emptyApplication("accident");
  assert.equal(a.status, "draft");
  assert.deepEqual(Object.keys(a).sort(), ["area", "cover", "declaration", "details", "health", "status", "updatedAt"]);
});
