import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateCiRunway,
  calculateLifeGap,
  formatRatio,
  formatSen,
  portionHalfUp,
  ratioPermille,
  type LifeInputs,
} from "./engine-3.ts";

const persona: LifeInputs = {
  // V2 Fresh Grad persona: RM400 × 12 × 5 + RM20,000 debt + RM25,000 final expenses; RM4,000 savings;
  // RM25,000 portable-adjusted cover.
  monthlyDependantSupportMyr: 400,
  supportYears: 5,
  dependantDebtMyr: 20_000,
  otherLiabilitiesMyr: 0,
  finalExpensesMyr: 25_000,
  liquidAssetsMyr: 4_000,
  personalLifeCoverMyr: 25_000,
  employerLifeCoverMyr: 0,
  employerPortabilityPercent: 0,
};

test("life: reproduces the V2 worked persona (RM69,000 need, RM44,000 gap, 36.2%) without silently choosing it", () => {
  const r = calculateLifeGap(persona);
  assert.equal(r.ok, true);
  if (!r.ok) return;
  assert.equal(r.status, "SOURCE_CONFLICT");
  const [printed, worked] = r.variants;
  assert.equal(worked.id, "worked-example");
  assert.equal(worked.needSen, 6_900_000n);
  assert.equal(worked.gapSen, 4_400_000n);
  assert.equal(formatRatio(worked.ratioPermille), "36.2%");
  // The printed formula subtracts the RM4,000 savings → RM65,000 need, RM40,000 gap.
  assert.equal(printed.id, "printed-formula");
  assert.equal(printed.needSen, 6_500_000n);
  assert.equal(printed.gapSen, 4_000_000n);
  assert.equal(formatRatio(printed.ratioPermille), "38.5%");
});

test("life: employer cover counts only by the selected portability factor (κ), rounded half-up to the sen", () => {
  const r = calculateLifeGap({ ...persona, personalLifeCoverMyr: 0, employerLifeCoverMyr: 50_000, employerPortabilityPercent: 50 });
  assert.equal(r.ok && r.coverSen, 2_500_000n);
  const none = calculateLifeGap({ ...persona, personalLifeCoverMyr: 0, employerLifeCoverMyr: 50_000, employerPortabilityPercent: 0 });
  assert.equal(none.ok && none.coverSen, 0n);
  // 33% of RM1 = 33 sen; 50% of RM1.01 can't occur (whole RM inputs), but half-up is exact:
  assert.equal(portionHalfUp(101n, 50), 51n); // 50.5 sen → 51
  assert.equal(portionHalfUp(3n, 50), 2n); // 1.5 → 2
  assert.equal(portionHalfUp(1n, 49), 0n); // 0.49 → 0
});

test("life: gaps never go negative, ratios are not capped above 100%, and zero need is 100%", () => {
  const over = calculateLifeGap({ ...persona, personalLifeCoverMyr: 138_000 });
  assert.ok(over.ok);
  if (!over.ok) return;
  assert.equal(over.variants[1].gapSen, 0n);
  assert.equal(formatRatio(over.variants[1].ratioPermille), "200.0%");
  const nothing = calculateLifeGap({ ...persona, monthlyDependantSupportMyr: 0, dependantDebtMyr: 0, finalExpensesMyr: 0, liquidAssetsMyr: 10_000 });
  assert.ok(nothing.ok);
  if (!nothing.ok) return;
  assert.equal(nothing.variants[0].needRawSen, -1_000_000n, "savings above the need make the raw need negative");
  assert.equal(nothing.variants[0].needSen, 0n);
  assert.equal(nothing.variants[0].gapSen, 0n);
  assert.equal(nothing.variants[0].ratioPermille, 1000);
});

test("life: every step shows its formula and working, and assumptions are disclosed", () => {
  const r = calculateLifeGap(persona);
  assert.ok(r.ok);
  if (!r.ok) return;
  for (const v of r.variants) {
    assert.equal(v.steps.length, 3);
    for (const s of v.steps) assert.ok(s.formula && s.working, s.id);
  }
  assert.match(r.variants[1].steps[0].working, /RM 400 × 12 × 5/);
  assert.ok(r.assumptions.some((a) => /does not cancel debts/.test(a)));
});

test("life: invalid input is rejected with field-level errors (no defaults substituted)", () => {
  const r = calculateLifeGap({ ...persona, monthlyDependantSupportMyr: -1, supportYears: 41, employerPortabilityPercent: 101, finalExpensesMyr: 1.5 });
  assert.equal(r.ok, false);
  if (r.ok) return;
  assert.deepEqual(r.errors.map((e) => e.field).sort(), ["employerPortabilityPercent", "finalExpensesMyr", "monthlyDependantSupportMyr", "supportYears"]);
  assert.equal(calculateLifeGap({ ...persona, personalLifeCoverMyr: Number.NaN }).ok, false);
  assert.equal(calculateLifeGap({ ...persona, dependantDebtMyr: 100_000_001 }).ok, false);
});

test("CI: recovery runway = income × 12 × years; cover = personal + κ × employer; gap floored at zero", () => {
  const r = calculateCiRunway({ monthlyNetIncomeMyr: 3_000, recoveryYears: 3, personalCiCoverMyr: 50_000, employerCiCoverMyr: 20_000, employerPortabilityPercent: 50 });
  assert.ok(r.ok);
  if (!r.ok) return;
  assert.equal(r.needSen, 10_800_000n); // RM108,000
  assert.equal(r.coverSen, 6_000_000n); // RM50,000 + 50% × RM20,000
  assert.equal(r.gapSen, 4_800_000n);
  assert.equal(formatRatio(r.ratioPermille), "55.6%");
  assert.deepEqual(r.steps.map((s) => s.id), ["B.need", "B.cover", "B.gap"]);
  const covered = calculateCiRunway({ monthlyNetIncomeMyr: 1_000, recoveryYears: 1, personalCiCoverMyr: 50_000, employerCiCoverMyr: 0, employerPortabilityPercent: 0 });
  assert.ok(covered.ok && covered.gapSen === 0n && covered.ratioPermille > 1000);
  const zero = calculateCiRunway({ monthlyNetIncomeMyr: 0, recoveryYears: 2, personalCiCoverMyr: 0, employerCiCoverMyr: 0, employerPortabilityPercent: 0 });
  assert.ok(zero.ok && zero.ratioPermille === 1000 && zero.gapSen === 0n);
});

test("CI: recovery years are limited to the source range 1–5; the payout is disclosed as assumed, not guaranteed", () => {
  for (const y of [0, 6, 2.5]) assert.equal(calculateCiRunway({ monthlyNetIncomeMyr: 3_000, recoveryYears: y, personalCiCoverMyr: 0, employerCiCoverMyr: 0, employerPortabilityPercent: 0 }).ok, false, String(y));
  const r = calculateCiRunway({ monthlyNetIncomeMyr: 3_000, recoveryYears: 5, personalCiCoverMyr: 0, employerCiCoverMyr: 0, employerPortabilityPercent: 0 });
  assert.ok(r.ok && r.assumptions.some((a) => /assumed to be approved/.test(a)) && r.assumptions.some((a) => /not a monthly salary/.test(a)));
});

test("formatting helpers", () => {
  assert.equal(formatSen(6_900_000n), "RM 69,000");
  assert.equal(formatSen(123_456_789n), "RM 1,234,567.89");
  assert.equal(formatSen(-1_000_000n), "−RM 10,000");
  assert.equal(ratioPermille(1n, 3n), 333);
  assert.equal(ratioPermille(2n, 3n), 667);
});

test("edge cases: maximum allowed amounts stay exact; zero cover gives 0%; κ 0% and 100% bound employer cover", () => {
  const max = calculateLifeGap({ ...persona, monthlyDependantSupportMyr: 100_000_000, supportYears: 40, dependantDebtMyr: 100_000_000, finalExpensesMyr: 100_000_000, liquidAssetsMyr: 0, personalLifeCoverMyr: 0 });
  assert.ok(max.ok);
  if (!max.ok) return;
  // 100,000,000 × 12 × 40 + 100,000,000 + 100,000,000 = RM48,200,000,000 → exact in sen.
  assert.equal(max.variants[1].needSen, 4_820_000_000_000n);
  assert.equal(formatSen(max.variants[1].gapSen), "RM 48,200,000,000");
  assert.equal(max.variants[1].ratioPermille, 0);
  const all = calculateCiRunway({ monthlyNetIncomeMyr: 3_000, recoveryYears: 1, personalCiCoverMyr: 0, employerCiCoverMyr: 36_000, employerPortabilityPercent: 100 });
  assert.ok(all.ok && all.coverSen === 3_600_000n && all.gapSen === 0n && all.ratioPermille === 1000);
  const none = calculateCiRunway({ monthlyNetIncomeMyr: 3_000, recoveryYears: 1, personalCiCoverMyr: 0, employerCiCoverMyr: 36_000, employerPortabilityPercent: 0 });
  assert.ok(none.ok && none.coverSen === 0n && none.gapSen === 3_600_000n && none.ratioPermille === 0);
  assert.equal(calculateCiRunway({ monthlyNetIncomeMyr: 100_000_001, recoveryYears: 1, personalCiCoverMyr: 0, employerCiCoverMyr: 0, employerPortabilityPercent: 0 }).ok, false);
});
