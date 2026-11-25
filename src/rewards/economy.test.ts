import assert from "node:assert/strict";
import test from "node:test";
import {
  STARTING_POINTS,
  claimChallenge,
  claimVoucher,
  earn,
  confirmPassUsed,
  initialRewardsState,
  purchase,
  quote,
  voucherEligibility,
  voucherStatus,
  type RewardsState,
} from "./economy.ts";

const NOW = Date.UTC(2026, 10, 25);
const DAY = 86_400_000;

const ok = (r: ReturnType<typeof earn>): RewardsState => {
  assert.equal(r.ok, true, r.ok ? "" : r.error);
  return (r as { state: RewardsState }).state;
};

test("earning pays once per activity", () => {
  let s = initialRewardsState();
  s = ok(earn(s, "lesson-complete", "hospital-bills", NOW));
  assert.equal(s.points, STARTING_POINTS + 50);
  const again = earn(s, "lesson-complete", "hospital-bills", NOW);
  assert.equal(again.ok, false);
  assert.equal(s.transactions.length, 1);
});

test("challenge bonus requires completion and pays once", () => {
  let s = initialRewardsState();
  assert.equal(claimChallenge(s, "keep-learning", NOW).ok, false);
  s = ok(earn(s, "lesson-complete", "a", NOW));
  s = ok(earn(s, "video-finished", "b", NOW));
  s = ok(earn(s, "lesson-complete", "c", NOW));
  const before = s.points;
  s = ok(claimChallenge(s, "keep-learning", NOW));
  assert.equal(s.points, before + 150);
  assert.equal(claimChallenge(s, "keep-learning", NOW).ok, false);
});

test("claiming a voucher deducts its cost; insufficient points change nothing", () => {
  let s = initialRewardsState();
  s = ok(claimVoucher(s, "v-healthy-meal-80", "req-1", NOW));
  assert.equal(s.points, STARTING_POINTS - 50);
  assert.equal(s.vouchers.length, 1);

  const poor: RewardsState = { ...initialRewardsState(), points: 10 };
  const r = claimVoucher(poor, "v-healthy-meal-80", "req-2", NOW);
  assert.equal(r.ok, false);
  assert.equal(poor.points, 10);
  assert.equal(poor.vouchers.length, 0);
});

test("duplicate request IDs are rejected", () => {
  let s = initialRewardsState();
  s = ok(claimVoucher(s, "v-fresh-drink-50", "same", NOW));
  const dup = claimVoucher(s, "v-fresh-drink-50", "same", NOW);
  assert.equal(dup.ok, false);
  assert.equal(s.vouchers.length, 1);
});

test("purchase with an eligible voucher applies the discount and consumes the voucher", () => {
  let s = initialRewardsState();
  s = ok(claimVoucher(s, "v-healthy-meal-80", "c1", NOW));
  const voucherId = s.vouchers[0].id;
  const before = s.points;
  const q = quote(s, "grb-chicken-bowl", voucherId, NOW)!;
  assert.deepEqual([q.price, q.discount, q.total], [320, 80, 240]);
  s = ok(purchase(s, "grb-chicken-bowl", voucherId, "p1", NOW));
  assert.equal(s.points, before - 240);
  assert.equal(voucherStatus(s.vouchers[0], NOW), "redeemed");
  // the same voucher cannot be reused
  const reuse = purchase(s, "grb-veggie-bowl", voucherId, "p2", NOW);
  assert.equal(reuse.ok, false);
});

test("ineligible product, minimum spend and expiry are enforced without side effects", () => {
  let s = initialRewardsState();
  s = ok(claimVoucher(s, "v-healthy-meal-80", "c1", NOW));
  const id = s.vouchers[0].id;
  assert.equal(voucherEligibility(s, id, "frf-smoothie", NOW).ok, false); // drink, not food
  s = ok(claimVoucher(s, "v-wellness-120", "c2", NOW));
  const wellness = s.vouchers[0].id;
  assert.equal(voucherEligibility(s, wellness, "crp-basic-health-kit", NOW).ok, true); // 380 = min
  const late = NOW + 31 * DAY;
  const expired = purchase(s, "crp-wellness-pack", wellness, "p-exp", late);
  assert.equal(expired.ok, false);
  const pointsBefore = s.points;
  const notOwned = purchase(s, "grb-veggie-bowl", "vch-not-mine", "p-x", NOW);
  assert.equal(notOwned.ok, false);
  assert.equal(s.points, pointsBefore);
});

test("cannot buy what you cannot afford", () => {
  const s: RewardsState = { ...initialRewardsState(), points: 100 };
  const r = purchase(s, "shd-protection-upgrade", null, "p", NOW);
  assert.equal(r.ok, false);
  assert.equal(s.points, 100);
  assert.equal(s.transactions.length, 0);
});

test("Shieldora / Nestora purchases store a simulated game benefit", () => {
  let s = initialRewardsState();
  s = ok(purchase(s, "nst-emergency-boost", null, "p", NOW));
  assert.equal(s.benefits.length, 1);
  assert.equal(s.benefits[0].benefit.type, "emergency-fund");
  assert.equal(s.transactions[0].points, -500);
});

test("food purchase issues a ready pass; only explicit confirmation marks it used, once", () => {
  let s = initialRewardsState();
  s = ok(purchase(s, "frf-smoothie", null, "p1", NOW));
  assert.equal(s.passes.length, 1);
  const pass = s.passes[0];
  assert.equal(pass.status, "ready");
  assert.match(pass.code, /^GE-[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}$/);
  const pointsAfterBuy = s.points;
  s = ok(confirmPassUsed(s, pass.id, NOW + 1000));
  assert.equal(s.passes[0].status, "used");
  assert.equal(s.points, pointsAfterBuy, "confirming use never changes points");
  const again = confirmPassUsed(s, pass.id, NOW + 2000);
  assert.equal(again.ok, false);
  assert.equal(confirmPassUsed(s, "pass-nope", NOW).ok, false);
});

test("game-benefit purchases store a benefit and issue no pass", () => {
  let s = initialRewardsState();
  s = ok(purchase(s, "shd-medical-protection", null, "p1", NOW));
  assert.equal(s.passes.length, 0);
  assert.equal(s.benefits.length, 1);
});
