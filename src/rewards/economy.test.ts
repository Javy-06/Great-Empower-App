import assert from "node:assert/strict";
import test from "node:test";
import {
  STARTING_POINTS,
  claimChallenge,
  confirmPassUsed,
  earn,
  initialRewardsState,
  quote,
  redeem,
  welcomeAvailableFor,
  type RewardsState,
} from "./economy.ts";
import { WELCOME_PRICE, products } from "./catalogue.ts";

const NOW = Date.UTC(2026, 10, 25);

const ok = (r: ReturnType<typeof earn>): RewardsState => {
  assert.equal(r.ok, true, r.ok ? "" : r.error);
  return (r as { state: RewardsState }).state;
};

test("regular redemption prices are realistic (1,000 pts or more)", () => {
  for (const p of products) assert.ok(p.price >= 1000, `${p.id} costs ${p.price}`);
});

test("earning pays once per activity", () => {
  let s = initialRewardsState();
  s = ok(earn(s, "lesson-complete", "hospital-bills", NOW));
  assert.equal(s.points, STARTING_POINTS + 50);
  assert.equal(earn(s, "lesson-complete", "hospital-bills", NOW).ok, false);
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

test("direct redemption deducts the regular price and issues a ready pass", () => {
  let s = initialRewardsState();
  s = ok(redeem(s, "tub-chicken-wrap", { welcome: false }, "r1", NOW));
  assert.equal(s.points, STARTING_POINTS - 1300);
  assert.equal(s.passes.length, 1);
  assert.equal(s.passes[0].status, "ready");
  assert.equal(s.transactions[0].points, -1300);
  assert.equal(s.welcomeRedeemed, false);
});

test("welcome redemption: 200 pts once, food/drink only", () => {
  let s = initialRewardsState();
  assert.equal(welcomeAvailableFor(s, "grb-salmon-bowl"), true);
  assert.equal(welcomeAvailableFor(s, "crp-wellness-pack"), false, "wellness is not food/drink");
  assert.equal(redeem(s, "crp-wellness-pack", { welcome: true }, "w0", NOW).ok, false);
  s = ok(redeem(s, "grb-salmon-bowl", { welcome: true }, "w1", NOW));
  assert.equal(s.points, STARTING_POINTS - WELCOME_PRICE);
  assert.equal(s.welcomeRedeemed, true);
  assert.match(s.transactions[0].detail ?? "", /Welcome offer/);
  const again = redeem(s, "frf-smoothie", { welcome: true }, "w2", NOW);
  assert.equal(again.ok, false);
  assert.equal(welcomeAvailableFor(s, "frf-smoothie"), false);
  assert.equal(quote(s, "frf-smoothie", true)!.total, 1100, "after use, quotes fall back to the regular price");
});

test("duplicate request IDs are rejected without double-charging", () => {
  let s = initialRewardsState();
  s = ok(redeem(s, "frf-orange-juice", { welcome: false }, "same", NOW));
  const pts = s.points;
  const dup = redeem(s, "frf-orange-juice", { welcome: false }, "same", NOW);
  assert.equal(dup.ok, false);
  assert.equal(s.points, pts);
  assert.equal(s.passes.length, 1);
});

test("insufficient points change nothing", () => {
  const s: RewardsState = { ...initialRewardsState(), points: 150 };
  const r = redeem(s, "frf-orange-juice", { welcome: true }, "p", NOW);
  assert.equal(r.ok, false);
  assert.equal(s.points, 150);
  assert.equal(s.welcomeRedeemed, false, "a failed welcome attempt must not consume the offer");
  assert.equal(s.transactions.length, 0);
});

test("pass: only explicit confirmation marks it used, once, without changing points", () => {
  let s = initialRewardsState();
  s = ok(redeem(s, "frf-smoothie", { welcome: false }, "p1", NOW));
  const pass = s.passes[0];
  assert.match(pass.code, /^GE-[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}$/);
  const pts = s.points;
  s = ok(confirmPassUsed(s, pass.id, NOW + 1000));
  assert.equal(s.passes[0].status, "used");
  assert.equal(s.points, pts);
  assert.equal(confirmPassUsed(s, pass.id, NOW + 2000).ok, false);
  assert.equal(confirmPassUsed(s, "pass-nope", NOW).ok, false);
});

test("game-benefit redemptions store a benefit and issue no pass", () => {
  let s = initialRewardsState();
  s = ok(redeem(s, "nst-savings-bonus", { welcome: false }, "p1", NOW));
  assert.equal(s.passes.length, 0);
  assert.equal(s.benefits.length, 1);
  assert.equal(s.points, STARTING_POINTS - 2000);
});
