// Runs the real migration on PGlite with a minimal Supabase-like auth shim, then exercises
// RLS and every RPC as two different anonymous users.
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const MIGRATION = process.argv.find((a) => a.endsWith(".sql")) ?? process.env.MIGRATION;
const db = new PGlite();
await db.exec(`
  create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
  grant usage on schema public to anon, authenticated;
  create schema auth;
  create table auth.users (id uuid primary key, is_anonymous boolean default true, created_at timestamptz default now());
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  create function auth.jwt() returns jsonb language sql stable as $$ select jsonb_build_object('sub', current_setting('request.jwt.claim.sub', true), 'is_anonymous', true) $$;
  grant usage on schema auth to anon, authenticated;
  grant execute on all functions in schema auth to anon, authenticated;
  -- Supabase grants everything in public to API roles by default; the migration must revoke it.
  alter default privileges in schema public grant all on tables to anon, authenticated;
  alter default privileges in schema public grant execute on functions to anon, authenticated;
`);
await db.exec(readFileSync(MIGRATION, "utf8"));

const A = "11111111-1111-4111-8111-111111111111";
const B = "22222222-2222-4222-8222-222222222222";
const C = "33333333-3333-4333-8333-333333333333";
await db.exec(`insert into auth.users (id) values ('${A}'), ('${B}'), ('${C}')`);

/** Run SQL as an API role with a given auth.uid(). */
async function as(uid, sql, params = []) {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${uid ?? ""}', false); set role ${uid ? "authenticated" : "anon"};`);
  try {
    return await db.query(sql, params);
  } finally {
    await db.exec("reset role;");
  }
}
const rpc = async (uid, fn, args = []) => {
  const ph = args.map((_, i) => `$${i + 1}`).join(", ");
  return (await as(uid, `select public.${fn}(${ph}) as r`, args)).rows[0].r;
};
const balance = async (uid) => (await as(uid, "select points_balance from public.profiles")).rows[0].points_balance;
const ledgerSum = async (uid) => (await db.query(`select coalesce(sum(points),0)::int s from public.points_ledger where user_id = $1`, [uid])).rows[0].s;

test("anon role (no session) cannot read tables or call RPCs", async () => {
  await assert.rejects(as(null, "select * from public.profiles"), /permission denied/);
  await assert.rejects(as(null, "select * from public.reward_products"), /permission denied/);
  await assert.rejects(as(null, "select public.init_account('new')"), /permission denied/);
  await assert.rejects(as(A, "select ge_private.pass_code()"), /permission denied/);
});

test("demo seed: exact breakdown, 2,450 points, welcome offer available", async () => {
  const r = await rpc(A, "init_account", ["demo", null]);
  assert.equal(r.ok, true); assert.equal(r.created, true); assert.equal(r.points_balance, 2450);
  const rows = (await as(A, "select kind, points, earn_key from public.points_ledger order by points desc")).rows;
  assert.deepEqual(rows.map((x) => x.points), [2290, 50, 50, 40, 20]);
  assert.equal(await ledgerSum(A), 2450);
  const p = (await as(A, "select * from public.profiles")).rows[0];
  assert.equal(p.welcome_offer_available, true); assert.equal(p.account_type, "demo"); assert.equal(p.display_name, "Aisyah");
  const learn = (await as(A, "select content_id, bookmarked, completed_at is not null done from public.learning_progress order by content_id")).rows;
  assert.equal(learn.filter((x) => x.done).length, 4);
  assert.deepEqual(learn.filter((x) => x.bookmarked).map((x) => x.content_id), ["medical-cards"]);
  assert.equal((await as(A, "select count(*)::int n from public.guidance_bookings")).rows[0].n, 1);
  assert.equal((await as(A, "select count(*)::int n from public.reward_items")).rows[0].n, 0);
});

test("init_account is idempotent (no duplicate seed)", async () => {
  const r = await rpc(A, "init_account", ["demo", null]);
  assert.equal(r.created, false);
  assert.equal(await balance(A), 2450);
  assert.equal((await db.query(`select count(*)::int n from public.points_ledger where user_id='${A}'`)).rows[0].n, 5);
});

test("new account: clean state, 0 points, welcome available, English", async () => {
  const r = await rpc(B, "init_account", ["new", "Javy"]);
  assert.equal(r.ok, true); assert.equal(r.points_balance, 0);
  const p = (await as(B, "select * from public.profiles")).rows[0];
  assert.equal(p.language, "en"); assert.equal(p.welcome_offer_available, true); assert.equal(p.account_type, "new");
  for (const t of ["points_ledger", "reward_items", "learning_progress", "guidance_bookings"])
    assert.equal((await as(B, `select count(*)::int n from public.${t}`)).rows[0].n, 0, t);
});

test("RLS: users only see their own rows and cannot write sensitive tables", async () => {
  assert.equal((await as(B, "select count(*)::int n from public.profiles")).rows[0].n, 1);
  assert.equal((await as(B, `select count(*)::int n from public.points_ledger where user_id='${A}'`)).rows[0].n, 0);
  assert.equal((await as(B, `select count(*)::int n from public.learning_progress where user_id='${A}'`)).rows[0].n, 0);
  await assert.rejects(as(B, "update public.profiles set points_balance = 99999"), /permission denied/);
  await assert.rejects(as(B, "update public.profiles set welcome_offer_available = true"), /permission denied/);
  await assert.rejects(as(B, `insert into public.points_ledger (user_id, request_id, kind, points, title) values ('${B}','x','seed',5000,'hack')`), /permission denied/);
  await assert.rejects(as(B, `insert into public.reward_items (user_id, ledger_id, product_id, item_type, code, status) values ('${B}', gen_random_uuid(), 'frf-smoothie', 'pass', 'X', 'ready')`), /permission denied/);
  await assert.rejects(as(B, "insert into public.reward_products (id, brand, name, category, price_points) values ('x','x','x','food',1)"), /permission denied/);
  // Can't write another user's progress, even by naming their id
  await assert.rejects(as(B, `insert into public.learning_progress (user_id, content_id) values ('${A}', 'money-talks')`), /row-level security/);
  const upd = await as(B, `update public.learning_progress set bookmarked = false where user_id = '${A}'`);
  assert.equal(upd.affectedRows ?? 0, 0);
  // Own name/language may change
  await as(B, "update public.profiles set language = 'ms' where user_id = auth.uid()");
  assert.equal((await as(B, "select language from public.profiles")).rows[0].language, "ms");
});

test("welcome eligibility matrix is enforced by category", async () => {
  const m = (await as(A, "select category, bool_and(welcome_eligible) e, bool_or(welcome_eligible) o from public.reward_products group by category order by category")).rows;
  assert.deepEqual(Object.fromEntries(m.map((x) => [x.category, [x.e, x.o]])), {
    drink: [true, true], food: [true, true], game: [false, false], wellness: [false, false],
  });
});

test("wellness + game items reject the welcome offer, no charge, offer kept", async () => {
  for (const id of ["crp-wellness-pack", "shd-medical-protection", "nst-savings-bonus"]) {
    const r = await rpc(A, "redeem_reward", [id, "welcome_offer", `req-${id}-w`]);
    assert.equal(r.ok, false); assert.equal(r.code, "welcome_not_eligible");
  }
  assert.equal(await balance(A), 2450);
  assert.equal((await as(A, "select welcome_offer_available w from public.profiles")).rows[0].w, true);
});

test("food welcome redemption: 200 once, pass issued, then normal price", async () => {
  const r = await rpc(A, "redeem_reward", ["grb-salmon-bowl", "welcome_offer", "req-salmon-0001"]);
  assert.equal(r.ok, true); assert.equal(r.charged, 200); assert.equal(r.list_price, 1900); assert.equal(r.item_type, "pass");
  assert.match(r.code, /^GE-[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}$/);
  assert.equal(await balance(A), 2250);
  // Double tap / retry with the same request id: replayed, not charged again
  const again = await rpc(A, "redeem_reward", ["grb-salmon-bowl", "welcome_offer", "req-salmon-0001"]);
  assert.equal(again.ok, true); assert.equal(again.replayed, true); assert.equal(again.item_id, r.item_id);
  assert.equal(await balance(A), 2250);
  assert.equal((await as(A, "select count(*)::int n from public.reward_items")).rows[0].n, 1);
  // Second welcome attempt on a drink
  const second = await rpc(A, "redeem_reward", ["frf-smoothie", "welcome_offer", "req-smoothie-w2"]);
  assert.equal(second.code, "welcome_used");
  // Standard price after
  const std = await rpc(A, "redeem_reward", ["frf-orange-juice", "standard", "req-oj-standard"]);
  assert.equal(std.ok, true); assert.equal(std.charged, 1000);
  assert.equal(await balance(A), 1250);
  const led = (await as(A, "select redemption_mode, list_price, charged_price, points from public.points_ledger where kind='redeem' order by created_at")).rows;
  assert.deepEqual(led.map((x) => [x.redemption_mode, x.list_price, x.charged_price, x.points]), [["welcome_offer", 1900, 200, -200], ["standard", 1000, 1000, -1000]]);
});

test("drink welcome redemption works for another account", async () => {
  await rpc(C, "init_account", ["demo", null]);
  const r = await rpc(C, "redeem_reward", ["frf-infused-water", "welcome_offer", "req-water-0001"]);
  assert.equal(r.ok, true); assert.equal(r.charged, 200);
  assert.equal(await balance(C), 2250);
});

test("request id reused for a different item is rejected", async () => {
  const r = await rpc(A, "redeem_reward", ["frf-smoothie", "standard", "req-oj-standard"]);
  assert.equal(r.code, "request_reused");
  assert.equal(await balance(A), 1250);
});

test("insufficient balance, unknown and inactive items are rejected without changes", async () => {
  const insuff = await rpc(A, "redeem_reward", ["shd-protection-upgrade", "standard", "req-upgrade-01"]);
  assert.equal(insuff.code, "insufficient_points");
  assert.equal((await rpc(A, "redeem_reward", ["no-such-item", "standard", "req-unknown-01"])).code, "unavailable");
  await db.exec("update public.reward_products set active = false where id = 'tub-tuna-wholemeal'");
  assert.equal((await rpc(A, "redeem_reward", ["tub-tuna-wholemeal", "standard", "req-inactive-1"])).code, "unavailable");
  await db.exec("update public.reward_products set active = true where id = 'tub-tuna-wholemeal'");
  assert.equal((await rpc(A, "redeem_reward", ["frf-smoothie", "bogus", "req-bogus-mode"])).code, "invalid_mode");
  assert.equal(await balance(A), 1250);
  // New account (0 pts) cannot use the welcome offer yet, and keeps it
  assert.equal((await rpc(B, "redeem_reward", ["frf-smoothie", "welcome_offer", "req-b-welcome1"])).code, "insufficient_points");
  assert.equal((await as(B, "select welcome_offer_available w from public.profiles")).rows[0].w, true);
});

test("game items issue a stored benefit, not a pass", async () => {
  const r = await rpc(C, "redeem_reward", ["nst-savings-bonus", "standard", "req-c-savings1"]);
  assert.equal(r.ok, true); assert.equal(r.item_type, "benefit"); assert.equal(r.code, null);
});

test("earning pays once; challenge claim requires progress and pays once", async () => {
  const e1 = await rpc(B, "earn_points", ["lesson-complete", "deductibles"]);
  assert.equal(e1.ok, true); assert.equal(e1.points_balance, 50);
  assert.equal((await rpc(B, "earn_points", ["lesson-complete", "deductibles"])).code, "already_earned");
  assert.equal((await rpc(B, "earn_points", ["free-money", "x"])).code, "unknown_activity");
  assert.equal((await rpc(B, "earn_points", ["lesson-complete", "Bad Id!"])).code, "invalid_subject");
  assert.equal((await rpc(B, "claim_challenge", ["keep-learning"])).code, "not_complete");
  await rpc(B, "earn_points", ["video-finished", "what-is-insurance"]);
  await rpc(B, "earn_points", ["lesson-complete", "money-talks"]);
  const c = await rpc(B, "claim_challenge", ["keep-learning"]);
  assert.equal(c.ok, true); assert.equal(c.points_balance, 50 + 40 + 50 + 150);
  assert.equal((await rpc(B, "claim_challenge", ["keep-learning"])).code, "already_claimed");
  assert.equal(await balance(B), await ledgerSum(B));
});

test("confirm pass used: once, owner only, no points change", async () => {
  const item = (await as(A, "select id from public.reward_items where item_type='pass' order by issued_at limit 1")).rows[0].id;
  assert.equal((await rpc(B, "confirm_pass_used", [item])).code, "not_found"); // another user's pass
  const before = await balance(A);
  assert.equal((await rpc(A, "confirm_pass_used", [item])).ok, true);
  assert.equal((await rpc(A, "confirm_pass_used", [item])).code, "already_used");
  assert.equal(await balance(A), before);
  assert.equal((await as(A, `select status from public.reward_items where id='${item}'`)).rows[0].status, "used");
});

test("reset_demo: only demo accounts; restores the seed incl. welcome offer", async () => {
  assert.equal((await rpc(B, "reset_demo")).code, "not_demo");
  const bBefore = await balance(B);
  const r = await rpc(A, "reset_demo");
  assert.equal(r.ok, true); assert.equal(r.points_balance, 2450);
  const p = (await as(A, "select * from public.profiles")).rows[0];
  assert.equal(p.welcome_offer_available, true);
  assert.equal((await as(A, "select count(*)::int n from public.reward_items")).rows[0].n, 0);
  assert.equal((await as(A, "select count(*)::int n from public.points_ledger")).rows[0].n, 5);
  assert.equal(await balance(B), bBefore); // other accounts untouched
  assert.equal(await balance(C), 250);
});

test("balance always equals the ledger sum", async () => {
  for (const u of [A, B, C]) assert.equal(await balance(u), await ledgerSum(u));
});
