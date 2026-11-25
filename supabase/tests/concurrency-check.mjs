// Post-setup concurrency check against YOUR Supabase project (run only after the migration).
// Uses the public URL + publishable key (never a secret key). Creates 2 anonymous demo users.
//
//   VITE_SUPABASE_URL=... VITE_SUPABASE_PUBLISHABLE_KEY=... node supabase/tests/concurrency-check.mjs
//
// Checks with truly parallel requests:
//   1. 5 parallel calls with the SAME request id (Welcome Offer, food) → exactly one 200-pt charge.
//   2. 5 parallel Welcome Offer calls with DIFFERENT request ids → exactly one succeeds.
//   3. 10 parallel 1,000-pt standard redemptions on 2,250 pts → exactly 2 succeed, balance 250.
//   Balance always equals the ledger sum and never goes negative.
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
console.log("All concurrency checks passed. (2 anonymous test users were created; see the cleanup SQL in docs.)");
