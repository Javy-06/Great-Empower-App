// Post-setup concurrency check against YOUR Supabase project (run only after the migration).
// Uses the public URL + publishable key (never a secret key). Creates 2 anonymous demo users.
//
//   VITE_SUPABASE_URL=... VITE_SUPABASE_PUBLISHABLE_KEY=... node supabase/tests/concurrency-check.mjs
//
// Checks with truly parallel requests:
//   1. 5 parallel calls with the SAME request id (Welcome Offer, food) → exactly one 200-pt charge.
//   2. 5 parallel Welcome Offer calls with DIFFERENT request ids → exactly one succeeds.
//   3. 10 parallel 1,000-pt standard redemptions on 2,250 pts → exactly 2 succeed, balance 250.
//   4. 5 parallel perfect quizzes → +50 exactly once; 5. a wrong answer pays nothing.
//   6. 8 parallel watch reports on 4 videos → total credit ≤ real time (one clock per account, v4).
//   7. 5 parallel RM10 voucher redemptions → exactly one (max_held).
//   Balance always equals the ledger sum and never goes negative. Creates 4 anonymous users in total.
import { createClient } from "@supabase/supabase-js";
import assert from "node:assert/strict";

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) throw new Error("Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (publishable key only).");

const memory = () => {
  const m = new Map();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v), removeItem: (k) => void m.delete(k) };
};
async function demoUser() {
  const client = createClient(url, key, { auth: { storage: memory(), persistSession: true, autoRefreshToken: false } });
  const { error } = await client.auth.signInAnonymously();
  if (error) throw new Error(`Anonymous sign-in failed: ${error.message}`);
  const init = await client.rpc("init_account", { p_type: "demo" });
  assert.equal(init.data?.points_balance, 2450, "demo should start at 2,450");
  return client;
}
const redeem = (c, product, mode, req) => c.rpc("redeem_reward", { p_product_id: product, p_mode: mode, p_request_id: req }).then((r) => r.data);
const state = async (c) => {
  const [{ data: [p] }, { data: ledger }, { data: items }] = await Promise.all([
    c.from("profiles").select("points_balance, welcome_offer_available"),
    c.from("points_ledger").select("points"),
    c.from("reward_items").select("id"),
  ]);
  return { balance: p.points_balance, welcome: p.welcome_offer_available, ledgerSum: ledger.reduce((s, l) => s + l.points, 0), items: items.length };
};

const a = await demoUser();
const same = await Promise.all(Array.from({ length: 5 }, () => redeem(a, "grb-salmon-bowl", "welcome_offer", "redeem-conc-same-1")));
assert.ok(same.every((r) => r.ok), "all same-id calls return the one result");
assert.equal(same.filter((r) => !r.replayed).length, 1, "exactly one original charge");
let s = await state(a);
assert.deepEqual([s.balance, s.items, s.welcome, s.ledgerSum], [2250, 1, false, 2250]);
console.log("1. same request id ×5 → one 200-pt charge ✔", s);

const b = await demoUser();
const diff = await Promise.all(["tub-chicken-wrap", "grb-veggie-bowl", "frf-smoothie", "frf-orange-juice", "tub-chicken-salad"].map((p, i) => redeem(b, p, "welcome_offer", `redeem-conc-welcome-${i}`)));
assert.equal(diff.filter((r) => r.ok).length, 1, "Welcome Offer used exactly once");
assert.ok(diff.filter((r) => !r.ok).every((r) => r.code === "welcome_used"));
s = await state(b);
assert.deepEqual([s.balance, s.items, s.welcome, s.ledgerSum], [2250, 1, false, 2250]);
console.log("2. parallel Welcome Offers ×5 → exactly one ✔", s);

const burst = await Promise.all(Array.from({ length: 10 }, (_, i) => redeem(a, "frf-orange-juice", "standard", `redeem-conc-burst-${i}`)));
assert.equal(burst.filter((r) => r.ok).length, 2, "only what the balance allows");
assert.ok(burst.filter((r) => !r.ok).every((r) => r.code === "insufficient_points"));
s = await state(a);
assert.deepEqual([s.balance, s.items, s.ledgerSum], [250, 3, 250]);
console.log("3. 10 parallel standard redemptions → 2 succeed, balance 250 ✔", s);
/* ---- v3 / v4: verified learning rewards and vouchers under truly parallel requests ---- */
async function newUser() {
  const client = createClient(url, key, { auth: { storage: memory(), persistSession: true, autoRefreshToken: false } });
  const { error } = await client.auth.signInAnonymously();
  if (error) throw new Error(`Anonymous sign-in failed: ${error.message}`);
  const init = await client.rpc("init_account", { p_type: "new" });
  assert.equal(init.data?.ok, true, "new account set up");
  return client;
}
const quiz = (c, answers) => c.rpc("submit_quiz", { p_kind: "lesson-complete", p_content_id: "money-talks", p_answers: answers }).then((r) => r.data);
const watch = (c, id, s) => c.rpc("record_video_watch", { p_video_id: id, p_lang: "en", p_seconds: s }).then((r) => r.data);

const n = await newUser();
const before = (await state(n)).balance;
const passes = await Promise.all(Array.from({ length: 5 }, () => quiz(n, { q1: "a", q2: "c", q3: "b" })));
assert.ok(passes.every((r) => r.ok && r.passed), "every attempt graded perfect");
assert.equal(passes.filter((r) => r.earned).length, 1, "points paid exactly once");
s = await state(n);
assert.deepEqual([s.balance - before, s.ledgerSum], [50, s.balance]);
console.log("4. 5 parallel perfect quizzes → +50 exactly once ✔", s);

const wrong = await quiz(n, { q1: "b", q2: "c", q3: "b" });
assert.deepEqual([wrong.passed, wrong.earned], [false, false]);
console.log("5. wrong answer → graded 2/3, nothing paid ✔");

const vids = ["how-insurance-works-in-malaysia", "risk-pooling-powers-insurance", "life-insurance-risk-pooling", "what-is-insurance"];
await Promise.all(vids.map((v) => watch(n, v, 0))); // start each edition
const t0 = Date.now();
await new Promise((r) => setTimeout(r, 5000));
const reports = await Promise.all(vids.flatMap((v) => [watch(n, v, 60), watch(n, v, 60)]));
const elapsed = (Date.now() - t0) / 1000;
assert.ok(reports.every((r) => r.ok), JSON.stringify(reports.find((r) => !r.ok)));
const credited = reports.reduce((sum, r) => sum + Number(r.credited), 0);
assert.ok(credited <= elapsed + 1, `8 parallel reports on 4 videos credited ${credited} s in ${elapsed.toFixed(1)} s of real time`);
assert.ok(reports.every((r) => !r.earned));
console.log(`6. 8 parallel watch reports on 4 videos → ${credited.toFixed(1)} s credited in ${elapsed.toFixed(1)} s (one shared clock) ✔`);

// Voucher: 5 parallel redemptions with different request ids; the account can hold one.
const v = await demoUser();
const vr = await Promise.all(Array.from({ length: 5 }, (_, i) => redeem(v, "gev-rm10", "standard", `redeem-conc-voucher-${i}`)));
assert.equal(vr.filter((r) => r.ok).length, 1, "one voucher held at most");
s = await state(v);
assert.deepEqual([s.balance, s.items, s.ledgerSum], [1450, 1, 1450]);
console.log("7. 5 parallel RM10 voucher redemptions → exactly one, −1,000 ✔", s);

console.log("All concurrency checks passed. (4 anonymous test users were created; see the cleanup SQL in docs.)");
