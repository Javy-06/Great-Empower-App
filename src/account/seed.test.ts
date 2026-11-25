import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { brands, earningRules, isWelcomeEligible, products } from "../rewards/catalogue.ts";
import { demoLessons } from "../data/demo-courses.ts";
import { infographics, videos } from "../data/learn-media.ts";
import { challengeProgress, emptyRewardsState, redeem } from "../rewards/economy.ts";
import { DEMO_EARNED, DEMO_SEED_BALANCE, demoRewardsState } from "./seed.ts";

const sql = readFileSync(new URL("../../supabase/migrations/20261126000000_demo_accounts.sql", import.meta.url), "utf8");

test("demo seed totals 2,450 with the approved breakdown and the Welcome Offer available", () => {
  const s = demoRewardsState(Date.now());
  assert.equal(s.points, 2450);
  assert.deepEqual(
    s.transactions.map((t) => t.points).sort((a, b) => b - a),
    [2290, 50, 50, 40, 20],
  );
  assert.equal(s.welcomeRedeemed, false);
  assert.equal(s.passes.length, 0);
  assert.equal(s.benefits.length, 0);
});

test("a new account starts at 0 with no history and the Welcome Offer available", () => {
  const s = emptyRewardsState();
  assert.deepEqual(
    [s.points, s.transactions.length, s.passes.length, s.earned.length, s.welcomeRedeemed],
    [0, 0, 0, 0, false],
  );
});

test("device seed matches the SQL seed (balance + each earn key)", () => {
  assert.match(sql, new RegExp(`'seed:demo-balance', 'seed', ${DEMO_SEED_BALANCE},`));
  for (const [kind, subject] of DEMO_EARNED) {
    assert.match(sql, new RegExp(`'earn:${kind}:${subject}', 'earn', ${earningRules[kind].points}, '${kind}:${subject}'`));
  }
});

test("SQL catalogue prices and categories match the app catalogue", () => {
  for (const p of products) {
    const kind = brands.find((b) => b.id === p.brand)!.kind;
    const category = kind === "game-benefit" ? "game" : kind;
    assert.match(sql, new RegExp(`\\('${p.id}',\\s+'${p.brand}',\\s+'[^']+',\\s+'${category}',\\s+${p.price}\\)`), p.id);
  }
});

test("Welcome Offer matrix: food + drink eligible; wellness + game never", () => {
  for (const p of products) {
    const kind = brands.find((b) => b.id === p.brand)!.kind;
    assert.equal(isWelcomeEligible(p), kind === "food" || kind === "drink", p.id);
  }
  const s = demoRewardsState(Date.now());
  for (const id of ["crp-wellness-pack", "shd-medical-protection", "nst-savings-bonus"]) {
    const r = redeem(s, id, { welcome: true }, `req-${id}`, Date.now());
    assert.equal(r.ok, false);
  }
});

test("seeded Keep Learning progress (2 lessons + 1 video = 3 of 3, unclaimed)", () => {
  const p = challengeProgress(demoRewardsState(Date.now()), "keep-learning");
  assert.deepEqual([p.done, p.target, p.complete, p.claimed], [3, 3, true, false]);
});

test("SQL earnable_content allow-list matches the app's lessons, videos and infographics exactly", () => {
  const block = sql.slice(sql.indexOf("insert into public.earnable_content"));
  const rows = [...block.matchAll(/\('([a-z-]+)', '([a-z0-9-]+)'\)/g)].map((m) => `${m[1]}:${m[2]}`).sort();
  const expected = [
    ...demoLessons.map((l) => `lesson-complete:${l.id}`),
    ...videos.map((v) => `video-finished:${v.id}`),
    ...infographics.map((i) => `infographic-viewed:${i.id}`),
    "profile-complete:profile",
  ].sort();
  assert.deepEqual(rows, expected);
});
