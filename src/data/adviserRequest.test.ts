import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ageBand,
  ageGuidance,
  canSaveAdviserRequest,
  emptyAdviserRequest,
  firstIncompleteAdviserStep,
  readAge,
  requestSummary,
  toSavedRequest,
  validateAdviserContact,
  validateAdviserDetails,
  validateAdviserReview,
  ELIGIBILITY_NOTE,
} from "./adviserRequest.ts";

const today = new Date(2026, 10, 28);
const adult = () => ({ ...emptyAdviserRequest(), fullName: "Aisyah Rahman", dateOfBirth: "2002-05-14", phone: "012-345 6789", email: "aisyah@example.com", method: "phone" as const });
const minor = () => ({
  ...emptyAdviserRequest(),
  fullName: "Daniel Tan",
  dateOfBirth: "2012-03-02",
  guardianName: "Mei Ling Tan",
  guardianPhone: "013-222 3344",
  guardianEmail: "meiling@example.com",
  relationship: "mother" as const,
  guardianConsent: true,
  method: "whatsapp" as const,
});

test("age band comes from the date of birth, birthday-aware, 18 is adult", () => {
  assert.equal(readAge("2008-11-28", today)?.band, "adult");
  assert.equal(readAge("2008-11-29", today)?.band, "16-17");
  assert.equal(readAge("2010-11-28", today)?.band, "16-17");
  assert.equal(readAge("2010-11-29", today)?.band, "10-15");
  assert.equal(readAge("2016-11-28", today)?.band, "10-15");
  assert.equal(readAge("2016-11-29", today)?.band, "under-10");
  assert.equal(readAge("2030-01-01", today), null);
  assert.equal(readAge("2002-02-30", today), null);
  assert.equal(ageBand(9), "under-10");
});

test("guidance never says a minor can buy any plan on their own", () => {
  for (const band of ["16-17", "10-15", "under-10"] as const) {
    const text = [ageGuidance[band].headline, ...ageGuidance[band].points].join(" ");
    assert.match(text, /parent or (legal )?guardian/i);
    assert.doesNotMatch(text, /can buy any|any insurance|guaranteed|approved/i);
  }
  assert.match(ageGuidance.adult.headline, /your own adviser request/);
  assert.match(ELIGIBILITY_NOTE, /depend on the insurer and selected plan/);
});

test("adult path: own contact details, no guardian needed", () => {
  assert.deepEqual(Object.keys(validateAdviserDetails(emptyAdviserRequest(), today)).sort(), ["dateOfBirth", "fullName"]);
  assert.deepEqual(validateAdviserContact(adult(), today), {});
  assert.ok(validateAdviserContact({ ...adult(), phone: "123" }, today).phone);
  assert.ok(validateAdviserContact({ ...adult(), method: "" }, today).method);
  assert.equal(firstIncompleteAdviserStep(adult(), today), "review");
});

test("under-18 path: guardian details and consent are required", () => {
  const e = validateAdviserContact({ ...minor(), guardianName: "", guardianPhone: "", guardianEmail: "", relationship: "", guardianConsent: false }, today);
  assert.deepEqual(Object.keys(e).sort(), ["guardianConsent", "guardianEmail", "guardianName", "guardianPhone", "relationship"]);
  assert.deepEqual(validateAdviserContact(minor(), today), {});
  // A minor's own phone/email are not asked for.
  assert.equal(validateAdviserContact(minor(), today).phone, undefined);
});

test("saving keeps only the fields for the band, and needs the demo acknowledgement", () => {
  assert.equal(canSaveAdviserRequest(adult(), today), false);
  assert.ok(validateAdviserReview(adult()).understandsDemo);
  assert.equal(canSaveAdviserRequest({ ...adult(), understandsDemo: true }, today), true);
  const m = toSavedRequest({ ...minor(), phone: "012-000 0000", email: "kid@example.com" }, today);
  assert.equal(m.band, "10-15");
  assert.equal(m.phone, "");
  assert.equal(m.email, "");
  assert.equal(m.guardianName, "Mei Ling Tan");
  const a = toSavedRequest({ ...adult(), guardianName: "Someone" }, today);
  assert.equal(a.guardianName, "");
  assert.equal(a.band, "adult");
});

test("summary says the app did not send it", () => {
  const s = requestSummary(toSavedRequest(minor(), today), (t) => t);
  assert.match(s, /not sent by the app/);
  assert.match(s, /confirm eligibility, policy ownership and consent/);
});

test("optional preferred day and note: blank is fine, past or far-future days and long notes are refused", () => {
  const base = { ...adult() };
  assert.deepEqual(validateAdviserContact({ ...base, preferredDate: "", notes: "" }, today), {});
  assert.deepEqual(validateAdviserContact({ ...base, preferredDate: "2026-12-01", notes: "Medical options, please." }, today), {});
  assert.ok(validateAdviserContact({ ...base, preferredDate: "2026-11-01" }, today).preferredDate);
  assert.ok(validateAdviserContact({ ...base, preferredDate: "2028-01-01" }, today).preferredDate);
  assert.ok(validateAdviserContact({ ...base, notes: "x".repeat(301) }, today).notes);
  const saved = toSavedRequest({ ...base, preferredDate: "2026-12-01", notes: "  hello  " }, today);
  assert.equal(saved.notes, "hello");
  assert.match(requestSummary(saved, (t) => t), /from 2026-12-01[\s\S]*Note: hello/);
});
