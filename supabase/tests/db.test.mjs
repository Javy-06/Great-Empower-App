// Database tests for supabase/migrations/20261126000000_demo_accounts.sql.
// Runs the real migration on PGlite (in-process Postgres) with a minimal Supabase-like auth shim,
// then exercises RLS, grants and every RPC as different anonymous users.
// See docs/demo-accounts-setup.md → "Running the database tests".
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const MIGRATION = process.env.MIGRATION;
if (!MIGRATION) throw new Error("Set MIGRATION=<path to the .sql migration>");
const SQL = readFileSync(MIGRATION, "utf8");

const AUTH_SHIM = `
  create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
  grant usage on schema public to anon, authenticated;
  create schema auth;
  create table auth.users (id uuid primary key, is_anonymous boolean default true, created_at timestamptz default now());
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  create function auth.jwt() returns jsonb language sql stable as $$ select jsonb_build_object('sub', current_setting('request.jwt.claim.sub', true), 'is_anonymous', true) $$;
  grant usage on schema auth to anon, authenticated;
  grant execute on all functions in schema auth to anon, authenticated;
  -- Supabase grants everything in public to the API roles by default; the migration must revoke it.
  alter default privileges in schema public grant all on tables to anon, authenticated;
  alter default privileges in schema public grant execute on functions to anon, authenticated;
`;

const tableCount = async (db) =>
  (await db.query(`select count(*)::int n from pg_tables where schemaname = 'public'`)).rows[0].n;

/* ------------------------------------------------------------------------------------------ */
/* Migration execution safety                                                                  */
/* ------------------------------------------------------------------------------------------ */

test("migration: order is begin → pre-flight → the only `create schema ge_private` → … → commit", () => {
  // Strip comments, then find statement positions in the executable SQL.
  const code = SQL.replace(/--[^\n]*/g, "");
  const begin = code.search(/^\s*begin;\s*$/m);
  const preflight = code.indexOf("do $preflight$");
  const schemaCreates = [...code.matchAll(/create\s+schema/gi)];
  const firstDdl = code.search(/^\s*create\s/im);
  const commit = code.search(/^\s*commit;\s*$/m);
  assert.ok(begin >= 0 && preflight > begin, "the transaction starts before the pre-flight");
  assert.equal(schemaCreates.length, 1, "exactly one create schema");
  assert.match(schemaCreates[0][0] + code.slice(schemaCreates[0].index + schemaCreates[0][0].length, schemaCreates[0].index + 40), /create\s+schema\s+ge_private;/i);
  assert.ok(schemaCreates[0].index > preflight, "ge_private is created only after the pre-flight");
  assert.ok(firstDdl > preflight, "no DDL before the pre-flight");
  assert.equal(code.slice(0, begin).trim(), "", "nothing executable before begin");
  assert.ok(commit > schemaCreates[0].index && code.slice(commit).trim() === "commit;", "commit is the final statement");
  // DDL re-run paths only; PL/pgSQL `if not exists (select …)` conditions are fine.
  assert.doesNotMatch(code, /create\s+(?:\w+\s+){0,2}if\s+not\s+exists/i, "no silent re-run paths (create … if not exists)");
});

test("migration: succeeds on a clean Supabase-like database (pre-flight passes first time)", async () => {
  const fresh = new PGlite();
  await fresh.exec(AUTH_SHIM);
  await fresh.exec(SQL);
  assert.equal(await tableCount(fresh), 9);
  assert.equal((await fresh.query(`select to_regnamespace('ge_private') is not null as present`)).rows[0].present, true);
  assert.equal((await fresh.query(`select count(*)::int n from public.reward_products`)).rows[0].n, 17);
});

test("migration: refuses to run without Supabase Auth and leaves nothing behind", async () => {
  const db = new PGlite();
  await assert.rejects(db.exec(SQL), /Supabase Auth/);
  await db.exec("rollback");
  assert.equal(await tableCount(db), 0);
  assert.equal((await db.query(`select to_regnamespace('ge_private') is null as gone`)).rows[0].gone, true);
});

test("migration: a failure late in the file rolls back everything (atomic)", async () => {
  const db = new PGlite();
  await db.exec(AUTH_SHIM);
  // Pre-create an object the migration creates near the end, so it fails after the tables.
  await db.exec(`create function public.confirm_pass_used(p_item_id uuid) returns jsonb language sql as $$ select '{}'::jsonb $$`);
  await assert.rejects(db.exec(SQL), /already exists/);
  await db.exec("rollback");
  assert.equal(await tableCount(db), 0);
  assert.equal((await db.query(`select to_regnamespace('ge_private') is null as gone`)).rows[0].gone, true);
});

/* ------------------------------------------------------------------------------------------ */
/* Main fixture: a migrated database with three anonymous users                               */
/* ------------------------------------------------------------------------------------------ */

const db = new PGlite();
await db.exec(AUTH_SHIM);
await db.exec(SQL);

const A = "11111111-1111-4111-8111-111111111111"; // demo
const B = "22222222-2222-4222-8222-222222222222"; // new
const C = "33333333-3333-4333-8333-333333333333"; // demo (second device)
await db.exec(`insert into auth.users (id) values ('${A}'), ('${B}'), ('${C}')`);

/** Run SQL as an API role with a given auth.uid() (null → the anon role). */
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
const welcomeAvailable = async (uid) => (await as(uid, "select welcome_offer_available w from public.profiles")).rows[0].w;
const ledgerSum = async (uid) =>
  (await db.query(`select coalesce(sum(points),0)::int s from public.points_ledger where user_id = $1`, [uid])).rows[0].s;
const count = async (uid, table) => (await as(uid, `select count(*)::int n from public.${table}`)).rows[0].n;
const seedRows = async (uid) =>
  (await as(uid, "select kind, points, earn_key from public.points_ledger order by created_at")).rows.map((r) => `${r.kind}:${r.points}:${r.earn_key ?? ""}`);
const APPROVED_SEED = [
  "seed:2290:",
  "earn:50:lesson-complete:money-talks",
  "earn:50:lesson-complete:emergency-fund",
  "earn:40:video-finished:what-is-insurance",
  "earn:20:infographic-viewed:insurance-safety-net",
];

test("migration: a second run is refused and changes nothing", async () => {
  const before = await tableCount(db);
  await assert.rejects(db.exec(SQL), /already applied/);
  await db.exec("rollback");
  assert.equal(await tableCount(db), before);
  assert.equal((await db.query("select count(*)::int n from public.reward_products")).rows[0].n, 17);
});

test("security: anon (no session) cannot read tables or call RPCs; ge_private is closed", async () => {
  await assert.rejects(as(null, "select * from public.profiles"), /permission denied/);
  await assert.rejects(as(null, "select * from public.reward_products"), /permission denied/);
  for (const fn of ["init_account('new')", "reset_demo()", "earn_points('lesson-complete','x')", "claim_challenge('x')", "redeem_reward('x','standard','redeem-abcdefgh')", "confirm_pass_used(gen_random_uuid())"])
    await assert.rejects(as(null, `select public.${fn}`), /permission denied/, fn);
  await assert.rejects(as(A, "select ge_private.pass_code()"), /permission denied/);
  await assert.rejects(as(A, "select ge_private.seed_account(auth.uid(), 'demo', 'x')"), /permission denied/);
});

test("security: every RPC is SECURITY DEFINER with an empty search_path; no anon/public execute", async () => {
  const fns = (await db.query(`
    select p.proname, p.prosecdef, p.proconfig,
           has_function_privilege('anon', p.oid, 'execute') anon_exec,
           has_function_privilege('authenticated', p.oid, 'execute') auth_exec
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname in ('init_account','reset_demo','earn_points','claim_challenge','redeem_reward','confirm_pass_used')`)).rows;
  assert.equal(fns.length, 6);
  for (const f of fns) {
    assert.equal(f.prosecdef, true, f.proname);
    assert.deepEqual(f.proconfig, ["search_path=\"\""], f.proname);
    assert.equal(f.anon_exec, false, f.proname);
    assert.equal(f.auth_exec, true, f.proname);
  }
  const rls = (await db.query(`select relname, relrowsecurity from pg_class where relnamespace = 'public'::regnamespace and relkind = 'r'`)).rows;
  assert.equal(rls.length, 9);
  for (const t of rls) assert.equal(t.relrowsecurity, true, t.relname);
});

test("schema: no Analyze / financial-profile columns exist", async () => {
  const cols = (await db.query(`select column_name from information_schema.columns where table_schema = 'public'`)).rows.map((r) => r.column_name);
  for (const banned of ["age", "monthly_income", "income", "monthly_expenses", "expenses", "dependants", "monthly_budget", "coverage", "priorities"])
    assert.equal(cols.includes(banned), false, banned);
});

/* ------------------------------------------------------------------------------------------ */
/* Account initialisation                                                                      */
/* ------------------------------------------------------------------------------------------ */

test("demo: exactly 2,450 points with the approved ledger breakdown; Welcome Offer available", async () => {
  const r = await rpc(A, "init_account", ["demo", null]);
  assert.deepEqual([r.ok, r.created, r.points_balance], [true, true, 2450]);
  assert.deepEqual(await seedRows(A), APPROVED_SEED);
  assert.equal(await ledgerSum(A), 2450);
  const p = (await as(A, "select * from public.profiles")).rows[0];
  assert.deepEqual([p.account_type, p.display_name, p.language, p.welcome_offer_available], ["demo", "Aisyah", "en", true]);
  const learn = (await as(A, "select content_id, bookmarked, completed_at is not null done from public.learning_progress order by content_id")).rows;
  assert.deepEqual(learn.filter((x) => x.done).map((x) => x.content_id), ["emergency-fund", "insurance-safety-net", "money-talks", "what-is-insurance"]);
  assert.deepEqual(learn.filter((x) => x.bookmarked).map((x) => x.content_id), ["medical-cards"]);
  assert.equal(await count(A, "guidance_bookings"), 1);
  assert.equal(await count(A, "reward_items"), 0);
});

test("demo: Keep Learning progress from the seed is 3 of 3 (2 lessons + 1 video), unclaimed", async () => {
  const done = (await as(A, `select count(*)::int n from public.points_ledger
    where kind = 'earn' and split_part(earn_key, ':', 1) = any (array['lesson-complete','video-finished'])`)).rows[0].n;
  assert.equal(done, 3);
  assert.equal((await as(A, "select count(*)::int n from public.points_ledger where earn_key = 'challenge:keep-learning'")).rows[0].n, 0);
});

test("init_account is idempotent (no duplicate seed)", async () => {
  assert.equal((await rpc(A, "init_account", ["demo", null])).created, false);
  assert.equal(await balance(A), 2450);
  assert.equal((await db.query(`select count(*)::int n from public.points_ledger where user_id='${A}'`)).rows[0].n, 5);
});

test("new account: 0 points, clean state, English, Welcome Offer available, separate from demo", async () => {
  const r = await rpc(B, "init_account", ["new", "Javy"]);
  assert.deepEqual([r.ok, r.created, r.points_balance], [true, true, 0]);
  const p = (await as(B, "select * from public.profiles")).rows[0];
  assert.deepEqual([p.user_id, p.account_type, p.language, p.welcome_offer_available], [B, "new", "en", true]);
  for (const t of ["points_ledger", "reward_items", "learning_progress", "guidance_bookings"]) assert.equal(await count(B, t), 0, t);
  assert.equal(await welcomeAvailable(A), true);
  assert.notEqual(A, B);
});

/* ------------------------------------------------------------------------------------------ */
/* RLS / grants                                                                                */
/* ------------------------------------------------------------------------------------------ */

test("RLS: each user sees only their own rows in every table", async () => {
  for (const t of ["profiles", "points_ledger", "reward_items", "learning_progress", "guidance_bookings", "user_app_state"]) {
    const other = (await as(B, `select count(*)::int n from public.${t} where user_id = '${A}'`)).rows[0].n;
    assert.equal(other, 0, t);
  }
  assert.equal(await count(B, "profiles"), 1);
});

test("grants: clients cannot write balance, Welcome Offer, ledger, items or catalogue", async () => {
  await assert.rejects(as(B, "update public.profiles set points_balance = 99999"), /permission denied/);
  await assert.rejects(as(B, "update public.profiles set welcome_offer_available = true"), /permission denied/);
  await assert.rejects(as(B, "update public.profiles set account_type = 'demo'"), /permission denied/);
  await assert.rejects(as(B, `insert into public.points_ledger (user_id, request_id, kind, points, title) values ('${B}','x','seed',5000,'hack')`), /permission denied/);
  await assert.rejects(as(B, "delete from public.points_ledger"), /permission denied/);
  await assert.rejects(as(B, `insert into public.reward_items (user_id, ledger_id, product_id, item_type, code, status) values ('${B}', gen_random_uuid(), 'frf-smoothie', 'pass', 'X', 'ready')`), /permission denied/);
  await assert.rejects(as(B, "update public.reward_items set status = 'ready'"), /permission denied/);
  await assert.rejects(as(B, "update public.reward_products set price_points = 1"), /permission denied/);
  await assert.rejects(as(B, "insert into public.reward_products (id, brand, name, category, price_points) values ('x','x','x','food',1)"), /permission denied/);
});

test("grants: own progress is writable; other users' is not; name/language editable", async () => {
  await assert.rejects(as(B, `insert into public.learning_progress (user_id, content_id) values ('${A}', 'money-talks')`), /row-level security/);
  const upd = await as(B, `update public.learning_progress set bookmarked = false where user_id = '${A}'`);
  assert.equal(upd.affectedRows ?? 0, 0);
  await as(B, `insert into public.learning_progress (user_id, content_id, bookmarked) values ('${B}', 'deductibles', true)`);
  await as(B, "update public.profiles set language = 'ms' where user_id = auth.uid()");
  assert.equal((await as(B, "select language from public.profiles")).rows[0].language, "ms");
  await assert.rejects(as(B, `update public.profiles set language = 'ms' where user_id = '${A}' returning 1`).then((r) => { if (!r.rows.length) throw new Error("no rows"); }), /no rows/);
});

test("grants: user_app_state accepts the app's upsert shape; game_state is not client-writable", async () => {
  // Same statement shape PostgREST sends for supabase-js upsert({...}, { onConflict: 'user_id' }).
  await as(B, `insert into public.user_app_state (user_id, guide_checklist, notifications_read) values ('${B}', '{a}', '{n1}')
    on conflict (user_id) do update set user_id = excluded.user_id, guide_checklist = excluded.guide_checklist, notifications_read = excluded.notifications_read`);
  assert.deepEqual((await as(B, "select guide_checklist from public.user_app_state")).rows[0].guide_checklist, ["a"]);
  await assert.rejects(as(B, `update public.user_app_state set game_state = '{"x":1}'`), /permission denied/);
  await assert.rejects(as(B, `update public.user_app_state set user_id = '${A}'`), /row-level security/);
});

/* ------------------------------------------------------------------------------------------ */
/* Welcome Offer + redemption                                                                   */
/* ------------------------------------------------------------------------------------------ */

test("Welcome Offer matrix: only food and drink are eligible (generated column)", async () => {
  const m = (await as(A, "select category, bool_and(welcome_eligible) e, bool_or(welcome_eligible) o from public.reward_products group by category order by category")).rows;
  assert.deepEqual(Object.fromEntries(m.map((x) => [x.category, [x.e, x.o]])), {
    drink: [true, true], food: [true, true], game: [false, false], wellness: [false, false],
  });
});

test("Welcome Offer on wellness / game items: rejected, no charge, offer kept", async () => {
  for (const id of ["crp-wellness-pack", "crp-basic-health-kit", "shd-medical-protection", "nst-savings-bonus"]) {
    const r = await rpc(A, "redeem_reward", [id, "welcome_offer", `redeem-${id}-w`]);
    assert.deepEqual([r.ok, r.code], [false, "welcome_not_eligible"], id);
  }
  assert.equal(await balance(A), 2450);
  assert.equal(await welcomeAvailable(A), true);
  assert.equal(await count(A, "reward_items"), 0);
});

test("food Welcome Offer: charges 200 once, issues a pass; then standard price applies", async () => {
  const r = await rpc(A, "redeem_reward", ["grb-salmon-bowl", "welcome_offer", "redeem-salmon-0001"]);
  assert.deepEqual([r.ok, r.charged, r.list_price, r.item_type, r.replayed], [true, 200, 1900, "pass", false]);
  assert.match(r.code, /^GE-[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}$/);
  assert.equal(await balance(A), 2250);
  assert.equal(await welcomeAvailable(A), false);
  assert.equal((await rpc(A, "redeem_reward", ["frf-smoothie", "welcome_offer", "redeem-smoothie-w2"])).code, "welcome_used");
  const std = await rpc(A, "redeem_reward", ["frf-orange-juice", "standard", "redeem-oj-standard"]);
  assert.deepEqual([std.ok, std.charged], [true, 1000]);
  assert.equal(await balance(A), 1250);
  const led = (await as(A, "select redemption_mode, list_price, charged_price, points from public.points_ledger where kind='redeem' order by created_at")).rows;
  assert.deepEqual(led.map((x) => [x.redemption_mode, x.list_price, x.charged_price, x.points]), [["welcome_offer", 1900, 200, -200], ["standard", 1000, 1000, -1000]]);
});

test("drink Welcome Offer: charges 200 once for another account", async () => {
  await rpc(C, "init_account", ["demo", null]);
  const r = await rpc(C, "redeem_reward", ["frf-infused-water", "welcome_offer", "redeem-water-0001"]);
  assert.deepEqual([r.ok, r.charged, r.list_price], [true, 200, 1000]);
  assert.equal(await balance(C), 2250);
  assert.equal((await rpc(C, "redeem_reward", ["frf-smoothie", "welcome_offer", "redeem-water-0002"])).code, "welcome_used");
});

test("standard redemption uses the catalogue price from the database", async () => {
  const before = await balance(C);
  const r = await rpc(C, "redeem_reward", ["tub-chicken-wrap", "standard", "redeem-c-wrap-01"]);
  const price = (await as(C, "select price_points from public.reward_products where id = 'tub-chicken-wrap'")).rows[0].price_points;
  assert.deepEqual([r.ok, r.charged, price], [true, 1300, 1300]);
  assert.equal(await balance(C), before - 1300);
});

test("idempotency: same request id + same product + same mode replays; never charges twice", async () => {
  const again = await rpc(A, "redeem_reward", ["grb-salmon-bowl", "welcome_offer", "redeem-salmon-0001"]);
  assert.deepEqual([again.ok, again.replayed, again.charged], [true, true, 200]);
  assert.equal(await balance(A), 1250);
  assert.equal(await count(A, "reward_items"), 2);
});

test("idempotency: a reused request id with a different product OR mode is rejected, no change", async () => {
  const before = await balance(A);
  assert.equal((await rpc(A, "redeem_reward", ["frf-smoothie", "standard", "redeem-oj-standard"])).code, "request_reused"); // other product
  assert.equal((await rpc(A, "redeem_reward", ["grb-salmon-bowl", "standard", "redeem-salmon-0001"])).code, "request_reused"); // other mode
  assert.equal((await rpc(A, "redeem_reward", ["frf-orange-juice", "welcome_offer", "redeem-oj-standard"])).code, "request_reused"); // other mode
  assert.equal((await rpc(A, "redeem_reward", ["frf-orange-juice", "standard", "seed:demo-balance"])).code, "invalid_request"); // internal namespace
  assert.equal(await balance(A), before);
  assert.equal(await count(A, "reward_items"), 2);
});

test("rejections without mutation: insufficient balance, unknown, inactive, bad mode/request", async () => {
  const before = await balance(A);
  assert.equal((await rpc(A, "redeem_reward", ["shd-protection-upgrade", "standard", "redeem-upgrade-01"])).code, "insufficient_points");
  assert.equal((await rpc(A, "redeem_reward", ["no-such-item", "standard", "redeem-unknown-01"])).code, "unavailable");
  await db.exec("update public.reward_products set active = false where id = 'tub-tuna-wholemeal'");
  assert.equal((await rpc(A, "redeem_reward", ["tub-tuna-wholemeal", "standard", "redeem-inactive-1"])).code, "unavailable");
  assert.equal((await as(A, "select count(*)::int n from public.reward_products where id = 'tub-tuna-wholemeal'")).rows[0].n, 0); // hidden by RLS
  await db.exec("update public.reward_products set active = true where id = 'tub-tuna-wholemeal'");
  assert.equal((await rpc(A, "redeem_reward", ["frf-smoothie", "bogus", "redeem-bogus-mode"])).code, "invalid_mode");
  assert.equal((await rpc(A, "redeem_reward", ["frf-smoothie", "standard", "short"])).code, "invalid_request");
  for (const bad of ["challenge:visual-learner", "earn:lesson-complete:money-talks", "pass-used:x", "redeem-", "redeem-has space", "redeem-" + "x".repeat(120)])
    assert.equal((await rpc(A, "redeem_reward", ["frf-smoothie", "standard", bad])).code, "invalid_request", bad);
  assert.equal(await balance(A), before);
  // A new account (0 pts) can't afford the welcome price, and keeps the offer.
  assert.equal((await rpc(B, "redeem_reward", ["frf-smoothie", "welcome_offer", "redeem-b-welcome1"])).code, "insufficient_points");
  assert.equal(await welcomeAvailable(B), true);
});

test("sequential redemptions can never take the balance below zero", async () => {
  // Real parallel sessions need a multi-connection server: see supabase/tests/concurrency-check.mjs.
  const results = [];
  for (let i = 0; i < 5; i++) results.push(await rpc(C, "redeem_reward", ["frf-orange-juice", "standard", `redeem-c-burst-${i}`]));
  assert.ok(results.some((r) => r.code === "insufficient_points"));
  assert.ok((await balance(C)) >= 0);
  assert.equal(await balance(C), await ledgerSum(C));
});

test("game items issue a stored benefit, not a pass", async () => {
  await rpc(B, "init_account", ["new", null]);
  const D = "44444444-4444-4444-8444-444444444444";
  await db.exec(`insert into auth.users (id) values ('${D}')`);
  await rpc(D, "init_account", ["demo", null]);
  const r = await rpc(D, "redeem_reward", ["nst-savings-bonus", "standard", "redeem-d-savings1"]);
  assert.deepEqual([r.ok, r.item_type, r.code], [true, "benefit", null]);
});

test("pass codes: GE-XXXX-XXXX from the safe alphabet, from gen_random_uuid (not random())", async () => {
  const src = (await db.query(`select prosrc from pg_proc where proname = 'pass_code'`)).rows[0].prosrc;
  assert.match(src, /gen_random_uuid\(\)/);
  assert.doesNotMatch(src, /\brandom\(\)/);
  const codes = (await db.query(`select ge_private.pass_code() c from generate_series(1, 2000)`)).rows.map((r) => r.c);
  for (const c of codes) assert.match(c, /^GE-[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}$/);
  assert.ok(new Set(codes).size >= 1999); // 40 bits: collisions in 2,000 draws are vanishingly rare
  const symbols = new Set(codes.join("").replace(/GE|-/g, ""));
  assert.equal(symbols.size, 32); // every alphabet symbol appears → no stuck bits
});

/* ------------------------------------------------------------------------------------------ */
/* Earning, challenges, passes, reset                                                          */
/* ------------------------------------------------------------------------------------------ */

test("earn_points: fabricated or mismatched content ids are rejected with no ledger, balance or challenge change", async () => {
  const E = "66666666-6666-4666-8666-666666666666";
  await db.exec(`insert into auth.users (id) values ('${E}')`);
  await rpc(E, "init_account", ["new", null]);
  const snapshot = async () => [await balance(E), await count(E, "points_ledger")];
  const before = await snapshot();
  const attempts = [
    ["lesson-complete", "not-a-real-lesson"],
    ["lesson-complete", "what-is-insurance"], // a video id under the lesson activity
    ["video-finished", "money-talks"], // a lesson id under the video activity
    ["video-finished", "fake-video-1"],
    ["infographic-viewed", "fake-infographic"],
    ["infographic-viewed", "money-talks"],
    ["profile-complete", "someone-else"],
  ];
  for (const [kind, subject] of attempts) assert.equal((await rpc(E, "earn_points", [kind, subject])).code, "unknown_content", `${kind}:${subject}`);
  for (let i = 0; i < 30; i++) await rpc(E, "earn_points", ["lesson-complete", `not-a-real-lesson-${i}`]);
  assert.deepEqual(await snapshot(), before);
  assert.equal((await rpc(E, "claim_challenge", ["keep-learning"])).code, "not_complete");
  assert.equal((await rpc(E, "claim_challenge", ["visual-learner"])).code, "not_complete");
});

test("earn_points: every real content id pays exactly its rule's points, once", async () => {
  const F = "77777777-7777-4777-8777-777777777777";
  await db.exec(`insert into auth.users (id) values ('${F}')`);
  await rpc(F, "init_account", ["new", null]);
  const allowed = (await db.query("select e.kind, e.content_id, r.points from public.earnable_content e join public.earning_rules r on r.key = e.kind order by 1, 2")).rows;
  assert.equal(allowed.length, 17);
  let expected = 0;
  for (const { kind, content_id, points } of allowed) {
    const r = await rpc(F, "earn_points", [kind, content_id]);
    assert.deepEqual([r.ok, r.points], [true, points], `${kind}:${content_id}`);
    expected += points;
    assert.equal((await rpc(F, "earn_points", [kind, content_id])).code, "already_earned");
  }
  assert.equal(expected, 7 * 50 + 4 * 40 + 5 * 20 + 100);
  assert.equal(await balance(F), expected);
});

test("security: earnable_content is server-only (no client read or write)", async () => {
  await assert.rejects(as(B, "select * from public.earnable_content"), /permission denied/);
  await assert.rejects(as(B, "insert into public.earnable_content values ('lesson-complete', 'x')"), /permission denied/);
});

test("init_account: null or unknown type returns a clean error and creates nothing", async () => {
  const G = "88888888-8888-4888-8888-888888888888";
  await db.exec(`insert into auth.users (id) values ('${G}')`);
  for (const t of [null, "admin", "", "DEMO"]) assert.equal((await rpc(G, "init_account", [t, null])).code, "invalid_type", String(t));
  assert.equal((await db.query(`select count(*)::int n from public.profiles where user_id = '${G}'`)).rows[0].n, 0);
});

test("earn_points pays once; unknown or malformed activities are rejected", async () => {
  const e1 = await rpc(B, "earn_points", ["lesson-complete", "deductibles"]);
  assert.deepEqual([e1.ok, e1.points_balance], [true, 50]);
  assert.equal((await rpc(B, "earn_points", ["lesson-complete", "deductibles"])).code, "already_earned");
  assert.equal((await rpc(B, "earn_points", ["free-money", "x"])).code, "unknown_activity");
  assert.equal((await rpc(B, "earn_points", ["challenge:keep-learning", "x"])).code, "unknown_activity");
  assert.equal((await rpc(B, "earn_points", ["lesson-complete", "Bad Id!"])).code, "invalid_subject");
  assert.equal(await balance(B), 50);
});

test("challenge: not claimable before the target; pays once after", async () => {
  assert.equal((await rpc(B, "claim_challenge", ["keep-learning"])).code, "not_complete");
  await rpc(B, "earn_points", ["video-finished", "what-is-insurance"]);
  assert.equal((await rpc(B, "claim_challenge", ["keep-learning"])).code, "not_complete"); // 2 of 3
  await rpc(B, "earn_points", ["lesson-complete", "money-talks"]);
  const c = await rpc(B, "claim_challenge", ["keep-learning"]);
  assert.deepEqual([c.ok, c.points_balance], [true, 50 + 40 + 50 + 150]);
  assert.equal((await rpc(B, "claim_challenge", ["keep-learning"])).code, "already_claimed");
  assert.equal((await rpc(B, "claim_challenge", ["no-such"])).code, "unknown_challenge");
  assert.equal(await balance(B), await ledgerSum(B));
});

test("confirm_pass_used: owner only, exactly once, never changes points", async () => {
  const item = (await as(A, "select id from public.reward_items where item_type='pass' order by issued_at limit 1")).rows[0].id;
  assert.equal((await rpc(B, "confirm_pass_used", [item])).code, "not_found");
  assert.equal((await as(A, `select status from public.reward_items where id='${item}'`)).rows[0].status, "ready");
  const before = await balance(A);
  assert.equal((await rpc(A, "confirm_pass_used", [item])).ok, true);
  assert.equal((await rpc(A, "confirm_pass_used", [item])).code, "already_used");
  assert.equal(await balance(A), before);
  assert.equal((await as(A, `select status from public.reward_items where id='${item}'`)).rows[0].status, "used");
});

test("reset_demo: refuses non-demo accounts; re-seeds only the caller's demo", async () => {
  const bBefore = await balance(B);
  const cBefore = await balance(C);
  assert.equal((await rpc(B, "reset_demo")).code, "not_demo");
  assert.equal(await balance(B), bBefore);
  const r = await rpc(A, "reset_demo");
  assert.deepEqual([r.ok, r.points_balance], [true, 2450]);
  assert.deepEqual(await seedRows(A), APPROVED_SEED);
  assert.equal(await welcomeAvailable(A), true);
  assert.equal(await count(A, "reward_items"), 0);
  assert.equal(await count(A, "guidance_bookings"), 1);
  assert.equal(await balance(B), bBefore); // other accounts untouched, including another demo
  assert.equal(await balance(C), cBefore);
  assert.ok((await count(C, "reward_items")) > 0);
});

test("invariant: every balance equals its ledger sum", async () => {
  const rows = (await db.query(`select user_id, points_balance from public.profiles`)).rows;
  for (const r of rows) assert.equal(r.points_balance, await ledgerSum(r.user_id), r.user_id);
});
