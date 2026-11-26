import assert from "node:assert/strict";
import test from "node:test";
import {
  STARTING_POINTS,
  claimChallenge,
  confirmPassUsed,
  earn,
  initialRewardsState,
  quote,
  recordWatch,
  redeem,
  submitQuiz,
  welcomeAvailableFor,
  type RewardsState,
} from "./economy.ts";
import { WELCOME_PRICE, activeProducts, products } from "./catalogue.ts";

const NOW = Date.UTC(2026, 10, 25);

const ok = (r: ReturnType<typeof earn>): RewardsState => {
  assert.equal(r.ok, true, r.ok ? "" : r.error);
  return (r as { state: RewardsState }).state;
};

test("regular redemption prices are realistic (1,000 pts or more)", () => {
  for (const p of products) assert.ok(p.price >= 1000, `${p.id} costs ${p.price}`);
});

test("earning pays once per activity (profile)", () => {
  let s = initialRewardsState();
  s = ok(earn(s, "profile-complete", "profile", NOW));
  assert.equal(s.points, STARTING_POINTS + 100);
  assert.equal(earn(s, "profile-complete", "profile", NOW).ok, false);
  assert.equal(earn(s, "profile-complete", "someone-else", NOW).ok, false, "only the real subject id pays");
  assert.equal(s.transactions.length, 1);
});

test("lessons, infographics and videos cannot be earned directly, only through verification", () => {
  const s = initialRewardsState();
  for (const [kind, id] of [["lesson-complete", "hospital-bills"], ["infographic-viewed", "life-insurance-malaysia"], ["video-finished", "what-is-insurance"]] as const) {
    assert.equal(earn(s, kind, id, NOW).ok, false, kind);
  }
});

const HB = { q1: "a", q2: "c", q3: "d" }; // hospital-bills
const pass = (s: RewardsState, kind: "lesson-complete" | "infographic-viewed", id: string, answers: Record<string, string>) => {
  const r = submitQuiz(s, kind, id, answers, NOW);
  assert.ok(r.ok && r.earned, JSON.stringify(r));
  return (r as { state: RewardsState }).state;
};

test("lesson quiz: 2/3 pays 0; retry 3/3 pays 50; a repeat pays nothing", () => {
  const s0 = initialRewardsState();
  const fail = submitQuiz(s0, "lesson-complete", "hospital-bills", { ...HB, q3: "a" }, NOW);
  assert.ok(fail.ok);
  if (!fail.ok) return;
  assert.deepEqual([fail.score, fail.total, fail.perfect, fail.earned, fail.points], [2, 3, false, false, 0]);
  assert.equal(fail.state, s0, "a failed attempt returns the unchanged state");
  assert.deepEqual(fail.results.map((r) => r.correct), [true, true, false]);
  const s1 = pass(s0, "lesson-complete", "hospital-bills", HB);
  assert.equal(s1.points, STARTING_POINTS + 50);
  const again = submitQuiz(s1, "lesson-complete", "hospital-bills", HB, NOW);
  assert.ok(again.ok && again.perfect && !again.earned && again.alreadyEarned);
  assert.equal(again.ok && again.state.transactions.length, 1, "no duplicate history entry");
});

test("infographic quiz: perfect pays 20; unanswered questions count as wrong", () => {
  const s0 = initialRewardsState();
  const partial = submitQuiz(s0, "infographic-viewed", "medical-insurance-malaysia", { q1: "c" }, NOW);
  assert.ok(partial.ok && !partial.perfect && partial.score === 1 && !partial.earned);
  const s1 = pass(s0, "infographic-viewed", "medical-insurance-malaysia", { q1: "c", q2: "b", q3: "a" });
  assert.equal(s1.points, STARTING_POINTS + 20);
});

test("quiz: fake or mismatched content ids are rejected", () => {
  const s = initialRewardsState();
  assert.equal(submitQuiz(s, "lesson-complete", "not-a-lesson", HB, NOW).ok, false);
  assert.equal(submitQuiz(s, "infographic-viewed", "hospital-bills", HB, NOW).ok, false);
});

test("video: partial watch time pays nothing; the requirement pays 40 once", () => {
  let s = initialRewardsState();
  let r = recordWatch(s, "how-insurance-works-in-malaysia", "en", 85, NOW);
  assert.ok(r.ok && !r.earned && r.watched === 85 && r.required === 86);
  s = (r as { state: RewardsState }).state;
  assert.equal(s.points, STARTING_POINTS);
  r = recordWatch(s, "how-insurance-works-in-malaysia", "en", 1, NOW);
  assert.ok(r.ok && r.earned && r.points === 40);
  s = (r as { state: RewardsState }).state;
  r = recordWatch(s, "how-insurance-works-in-malaysia", "en", 90, NOW);
  assert.ok(r.ok && !r.earned && r.alreadyEarned);
  assert.equal((r as { state: RewardsState }).state.points, STARTING_POINTS + 40);
});

test("video: invalid ids, editions and seconds are rejected", () => {
  const s = initialRewardsState();
  assert.equal(recordWatch(s, "not-a-video", "en", 10, NOW).ok, false);
  assert.equal(recordWatch(s, "how-insurance-works-in-malaysia", "zh", 10, NOW).ok, false);
  assert.equal(recordWatch(s, "what-is-insurance", "en", -1, NOW).ok, false);
  assert.equal(recordWatch(s, "what-is-insurance", "en", 601, NOW).ok, false);
});

test("challenge bonus requires completion and pays once", () => {
  let s = initialRewardsState();
  assert.equal(claimChallenge(s, "keep-learning", NOW).ok, false);
  s = pass(s, "lesson-complete", "hospital-bills", HB);
  s = (recordWatch(s, "risk-pooling-powers-insurance", "en", 84, NOW) as { state: RewardsState }).state;
  s = pass(s, "lesson-complete", "deductibles", { q1: "a", q2: "b", q3: "c" });
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

test("retired game items are no longer offered or redeemable", () => {
  const s = initialRewardsState();
  for (const id of ["shd-medical-protection", "shd-protection-upgrade", "nst-emergency-boost", "nst-savings-bonus"]) {
    assert.equal(redeem(s, id, { welcome: false }, `r-${id}`, NOW).ok, false, id);
    assert.ok(!activeProducts.some((p) => p.id === id), id);
  }
  assert.ok(!activeProducts.some((p) => p.benefit), "no game benefits in the active catalogue");
});

test("CarePlus v3 prices: low < medium < high, all above food and drink", () => {
  const price = (id: string) => products.find((p) => p.id === id)!.price;
  assert.deepEqual([price("crp-basic-health-kit"), price("crp-wellness-pack"), price("crp-health-check-kit")], [3000, 3500, 4500]);
  const maxFood = Math.max(...products.filter((p) => p.tags.includes("healthy-food") || p.tags.includes("healthy-drink")).map((p) => p.price));
  assert.ok(price("crp-basic-health-kit") > maxFood);
});

test("vouchers: priced at 100 pts per RM1 of (maximum) discount; higher value costs more", () => {
  const v = activeProducts.filter((p) => p.voucher);
  assert.deepEqual(v.map((p) => p.id).sort(), ["gev-5pct", "gev-rm10", "gev-rm25", "gev-rm50"]);
  for (const p of v) {
    const d = p.voucher!.discount;
    const maxRm = d.type === "fixed" ? d.amountRm : d.capRm;
    assert.equal(p.price, maxRm * 100, p.id);
    assert.equal(p.voucher!.maxHeld, 1, p.id);
    assert.match(p.description, /future eligible Great Empower insurance purchase/, p.id);
  }
});

test("vouchers: redeem stores one voucher (no pass); a second copy is refused; no welcome price", () => {
  let s = initialRewardsState();
  assert.equal(redeem(s, "gev-rm10", { welcome: true }, "vw", NOW).ok, false);
  s = ok(redeem(s, "gev-rm10", { welcome: false }, "v1", NOW));
  assert.equal(s.points, STARTING_POINTS - 1000);
  assert.equal(s.passes.length, 0);
  assert.equal(s.vouchers?.length, 1);
  assert.match(s.vouchers![0].code, /^GE-[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}$/);
  const dup = redeem(s, "gev-rm10", { welcome: false }, "v2", NOW);
  assert.equal(dup.ok, false);
  assert.equal(s.points, STARTING_POINTS - 1000);
  assert.equal(redeem(s, "gev-rm50", { welcome: false }, "v3", NOW).ok, false, "insufficient points");
});
