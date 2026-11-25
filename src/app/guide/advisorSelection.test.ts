import assert from "node:assert/strict";
import test from "node:test";
import { advisors } from "../../data/advisors.ts";
import {
  InvalidTrioError,
  assertValidTrio,
  pickAdvisorTrio,
  seededRandom,
  trioForSession,
} from "./advisorSelection.ts";

const counts = (trio: readonly { ethnicity: string }[]) => ({
  malay: trio.filter((a) => a.ethnicity === "malay").length,
  chinese: trio.filter((a) => a.ethnicity === "chinese").length,
  indian: trio.filter((a) => a.ethnicity === "indian").length,
});

test("roster: two advisors per ethnicity, each with a distinct portrait", () => {
  assert.deepEqual(counts(advisors), { malay: 2, chinese: 2, indian: 2 });
  assert.equal(new Set(advisors.map((a) => a.portrait)).size, 6);
  assert.equal(new Set(advisors.map((a) => a.face)).size, 6);
});

test("10,000 random trios are always exactly 1 Malay + 1 Chinese + 1 Indian, no duplicates", () => {
  for (let i = 0; i < 10_000; i++) {
    const trio = pickAdvisorTrio();
    assert.equal(trio.length, 3);
    assert.deepEqual(counts(trio), { malay: 1, chinese: 1, indian: 1 });
    assert.equal(new Set(trio.map((a) => a.id)).size, 3);
  }
});

test("extreme random values (0 and just below 1) still produce valid trios", () => {
  for (const v of [0, 0.4999, 0.5, 0.999999999]) {
    assert.deepEqual(counts(pickAdvisorTrio(() => v)), { malay: 1, chinese: 1, indian: 1 });
  }
  // even a broken RNG returning 1 cannot index out of range or skip an ethnicity
  assert.deepEqual(counts(pickAdvisorTrio(() => 1)), { malay: 1, chinese: 1, indian: 1 });
});

test("every one of the 8 possible combinations is reachable and valid", () => {
  const seen = new Set<string>();
  for (let i = 0; i < 2000; i++) seen.add(pickAdvisorTrio(seededRandom(`s${i}`)).map((a) => a.id).join("+"));
  assert.equal(seen.size, 8); // 2 × 2 × 2
});

test("same session key → same trio (stable across refreshes and re-renders)", () => {
  const a = trioForSession("2026-11-26|10:00|Penang").map((x) => x.id);
  for (let i = 0; i < 50; i++) assert.deepEqual(trioForSession("2026-11-26|10:00|Penang").map((x) => x.id), a);
});

test("validator rejects same-ethnicity groups, duplicates and wrong sizes", () => {
  const [farah, hafiz, meiling, , priya] = advisors;
  assert.throws(() => assertValidTrio([farah, hafiz, meiling]), InvalidTrioError); // Malay + Malay + Chinese
  assert.throws(() => assertValidTrio([farah, farah, priya]), InvalidTrioError); // duplicate
  assert.throws(() => assertValidTrio([farah, meiling]), InvalidTrioError); // size 2
  assert.doesNotThrow(() => assertValidTrio([farah, meiling, priya]));
});

test("a pool missing an ethnicity fails loudly instead of returning a non-diverse trio", () => {
  const noIndian = advisors.filter((a) => a.ethnicity !== "indian");
  assert.throws(() => pickAdvisorTrio(Math.random, noIndian), InvalidTrioError);
});
