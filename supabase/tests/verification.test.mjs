// Database tests for supabase/migrations/20261127000000_rewards_learning_verification.sql (v3),
// applied on top of 20261126000000_demo_accounts.sql exactly as it would be on the live project:
// accounts and history are created with the base migration FIRST, then v3 is applied.
// Runs on PGlite (see docs/demo-accounts-setup.md → "Running the database tests"):
//   BASE=<repo>/supabase/migrations/20261126000000_demo_accounts.sql \
//   V3=<repo>/supabase/migrations/20261127000000_rewards_learning_verification.sql node --test verification.test.mjs
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const BASE = readFileSync(process.env.BASE ?? "", "utf8");
const V3 = readFileSync(process.env.V3 ?? "", "utf8");

const AUTH_SHIM = `
  create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
  grant usage on schema public to anon, authenticated;
  create schema auth;
  create table auth.users (id uuid primary key, is_anonymous boolean default true, created_at timestamptz default now());
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  create function auth.jwt() returns jsonb language sql stable as $$ select jsonb_build_object('sub', current_setting('request.jwt.claim.sub', true), 'is_anonymous', true) $$;
  grant usage on schema auth to anon, authenticated;
  grant execute on all functions in schema auth to anon, authenticated;
  alter default privileges in schema public grant all on tables to anon, authenticated;
  alter default privileges in schema public grant execute on functions to anon, authenticated;
`;

/* ------------------------------------------------------------------------------------------ */
/* Migration safety                                                                            */
/* ------------------------------------------------------------------------------------------ */

test("v3: refuses to run without the base migration and leaves nothing behind", async () => {
  const fresh = new PGlite();
  await fresh.exec(AUTH_SHIM);
  await assert.rejects(fresh.exec(V3), /base migration .* not found/);
  await fresh.exec("rollback");
  assert.equal((await fresh.query(`select to_regclass('public.video_watch_progress') is null as gone`)).rows[0].gone, true);
});

test("v3: a failure late in the file rolls everything back (atomic)", async () => {
  const fresh = new PGlite();
  await fresh.exec(AUTH_SHIM);
  await fresh.exec(BASE);
  // Pre-create a function v3 creates late, so v3 fails after its catalogue changes.
  await fresh.exec(`create function public.record_video_watch(p_video_id text, p_lang text, p_seconds numeric) returns jsonb language sql as $$ select '{}'::jsonb $$`);
  await assert.rejects(fresh.exec(V3), /already applied|already exists/);
  await fresh.exec("rollback");
  const r = (await fresh.query(`select price_points from public.reward_products where id = 'crp-wellness-pack'`)).rows[0];
  assert.equal(r.price_points, 2400, "catalogue untouched after a failed run");
  assert.equal((await fresh.query(`select count(*)::int n from public.reward_products where category = 'game' and active`)).rows[0].n, 4);
});

test("v3: no destructive statements (no drop table / delete / truncate)", () => {
  const code = V3.replace(/--[^\n]*/g, "");
  assert.doesNotMatch(code, /\bdrop\s+(table|schema|function|column)\b/i);
  assert.doesNotMatch(code, /\bdelete\s+from\b/i);
  assert.doesNotMatch(code, /\btruncate\b/i);
  // The only drops are three CHECK constraints, each immediately re-added (widened).
  const drops = [...code.matchAll(/drop\s+constraint\s+(\w+)/gi)].map((m) => m[1]);
  assert.deepEqual(drops, ["reward_products_category_check", "reward_items_item_type_check", "reward_items_check"]);
  for (const d of drops) assert.match(code, new RegExp(`add constraint ${d}\\b`));
});

/* ------------------------------------------------------------------------------------------ */
/* Fixture: base migration → existing accounts with history → v3                              */
/* ------------------------------------------------------------------------------------------ */

const db = new PGlite();
await db.exec(AUTH_SHIM);
await db.exec(BASE);

const A = "11111111-1111-4111-8111-111111111111"; // demo (has pre-v3 history)
const B = "22222222-2222-4222-8222-222222222222"; // new
const C = "33333333-3333-4333-8333-333333333333"; // new
await db.exec(`insert into auth.users (id) values ('${A}'), ('${B}'), ('${C}')`);

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
const ledgerCount = async (uid) => (await db.query(`select count(*)::int n from public.points_ledger where user_id = $1`, [uid])).rows[0].n;
const ledgerSum = async (uid) => (await db.query(`select coalesce(sum(points),0)::int s from public.points_ledger where user_id = $1`, [uid])).rows[0].s;
const quiz = (uid, kind, id, answers) => rpc(uid, "submit_quiz", [kind, id, JSON.stringify(answers)]);
const watch = (uid, id, lang, s) => rpc(uid, "record_video_watch", [id, lang, s]);
/** Simulate real time passing for a watch row (the server measures elapsed time itself). */
const age = (uid, id, lang, secs) =>
  db.query(`update public.video_watch_progress set last_report_at = last_report_at - make_interval(secs => $4) where user_id = $1 and content_id = $2 and lang = $3`, [uid, id, lang, secs]);

// Pre-v3 activity on A: a game item (Savings Bonus, 2000) and a CarePlus item at the OLD price.
await rpc(A, "init_account", ["demo", null]);
await rpc(A, "earn_points", ["profile-complete", "profile"]); // 2450 + 100 = 2550
const preGame = await rpc(A, "redeem_reward", ["nst-savings-bonus", "standard", "redeem-pre-game"]);
assert.equal(preGame.ok, true);
const preBalance = await balance(A); // 550
const preLedger = (await db.query(`select id, points, title from public.points_ledger where user_id = $1 order by created_at, id`, [A])).rows;
const preItems = (await db.query(`select id, product_id, item_type, status from public.reward_items where user_id = $1`, [A])).rows;

await db.exec(V3);
await rpc(B, "init_account", ["new", "Bee"]);
await rpc(C, "init_account", ["new", "Cee"]);

const LESSON_OK = { q1: "a", q2: "c", q3: "b" }; // money-talks
const LESSON_HB_OK = { q1: "a", q2: "c", q3: "d" }; // hospital-bills
const IG_OK = { q1: "c", q2: "b", q3: "a" }; // medical-insurance-malaysia

test("v3: a second run is refused and changes nothing", async () => {
  await assert.rejects(db.exec(V3), /already applied/);
  await db.exec("rollback");
});

test("v3 preserves existing balances, ledger rows and stored game benefits", async () => {
  assert.equal(await balance(A), preBalance);
  const after = (await db.query(`select id, points, title from public.points_ledger where user_id = $1 order by created_at, id`, [A])).rows;
  assert.deepEqual(after, preLedger);
  const items = (await db.query(`select id, product_id, item_type, status from public.reward_items where user_id = $1`, [A])).rows;
  assert.deepEqual(items, preItems);
  assert.equal(items[0].item_type, "benefit");
});

/* ------------------------------------------------------------------------------------------ */
/* Catalogue                                                                                   */
/* ------------------------------------------------------------------------------------------ */

test("catalogue: CarePlus repriced, game items retired, four vouchers added", async () => {
  const rows = Object.fromEntries((await db.query(`select id, category, price_points, active, welcome_eligible, max_held from public.reward_products`)).rows.map((r) => [r.id, r]));
  assert.deepEqual([rows["crp-basic-health-kit"].price_points, rows["crp-wellness-pack"].price_points, rows["crp-health-check-kit"].price_points], [3000, 3500, 4500]);
  for (const id of ["shd-medical-protection", "shd-protection-upgrade", "nst-emergency-boost", "nst-savings-bonus"]) assert.equal(rows[id].active, false, id);
  assert.deepEqual(
    ["gev-rm10", "gev-rm25", "gev-5pct", "gev-rm50"].map((id) => [rows[id].category, rows[id].price_points, rows[id].active, rows[id].welcome_eligible, rows[id].max_held]),
    [["voucher", 1000, true, false, 1], ["voucher", 2500, true, false, 1], ["voucher", 3000, true, false, 1], ["voucher", 5000, true, false, 1]],
  );
  // Clients only see active items: no game rewards are offered any more.
  const visible = (await as(B, `select id from public.reward_products where category = 'game'`)).rows;
  assert.equal(visible.length, 0);
});

test("retired game items cannot be redeemed (no charge)", async () => {
  const before = await balance(A);
  const r = await rpc(A, "redeem_reward", ["shd-medical-protection", "standard", "redeem-game-after"]);
  assert.equal(r.code, "unavailable");
  assert.equal(await balance(A), before);
});

test("CarePlus charges the new price", async () => {
  await db.query(`update public.profiles set points_balance = points_balance + 10000 where user_id = $1`, [C]);
  await db.query(`insert into public.points_ledger (user_id, request_id, kind, points, title) values ($1, 'seed:test-topup', 'seed', 10000, 'test top-up')`, [C]);
  const r = await rpc(C, "redeem_reward", ["crp-wellness-pack", "standard", "redeem-cp-1"]);
  assert.equal(r.ok, true);
  assert.equal(r.charged, 3500);
  assert.equal(r.item_type, "pass");
});

/* ------------------------------------------------------------------------------------------ */
/* Vouchers                                                                                    */
/* ------------------------------------------------------------------------------------------ */

test("voucher: redeem stores a voucher with a code; a second copy is refused while held", async () => {
  const before = await balance(C);
  const r = await rpc(C, "redeem_reward", ["gev-rm25", "standard", "redeem-v-1"]);
  assert.equal(r.ok, true);
  assert.equal(r.item_type, "voucher");
  assert.match(r.code, /^GE-[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}$/);
  assert.equal(await balance(C), before - 2500);
  const item = (await as(C, `select item_type, status from public.reward_items where id = $1`, [r.item_id])).rows[0];
  assert.deepEqual(item, { item_type: "voucher", status: "stored" });

  const again = await rpc(C, "redeem_reward", ["gev-rm25", "standard", "redeem-v-2"]);
  assert.equal(again.code, "limit_reached");
  assert.equal(await balance(C), before - 2500, "no charge for a refused second copy");
  // A different voucher type is fine.
  assert.equal((await rpc(C, "redeem_reward", ["gev-rm10", "standard", "redeem-v-3"])).ok, true);
});

test("voucher: replaying the same request returns the original, never charges twice", async () => {
  const before = await balance(C);
  const r = await rpc(C, "redeem_reward", ["gev-rm25", "standard", "redeem-v-1"]);
  assert.equal(r.replayed, true);
  assert.equal(await balance(C), before);
});

test("voucher: Welcome Offer is not allowed; insufficient points change nothing", async () => {
  const w = await rpc(B, "redeem_reward", ["gev-rm10", "welcome_offer", "redeem-v-w"]);
  assert.equal(w.code, "welcome_not_eligible");
  assert.equal((await as(B, "select welcome_offer_available w from public.profiles")).rows[0].w, true);
  const poor = await rpc(B, "redeem_reward", ["gev-rm50", "standard", "redeem-v-poor"]);
  assert.equal(poor.code, "insufficient_points");
  assert.equal(await balance(B), 0);
  assert.equal(await ledgerCount(B), 0);
});

test("voucher: clients cannot write reward items or products directly", async () => {
  await assert.rejects(as(C, `update public.reward_items set status = 'used'`), /permission denied/);
  await assert.rejects(as(C, `insert into public.reward_products (id, brand, name, category, price_points) values ('x','x','x','voucher',1)`), /permission denied/);
});

/* ------------------------------------------------------------------------------------------ */
/* Quizzes                                                                                     */
/* ------------------------------------------------------------------------------------------ */

test("earn_points no longer pays lessons, infographics or videos; profile still works", async () => {
  assert.equal((await rpc(B, "earn_points", ["lesson-complete", "hospital-bills"])).code, "quiz_required");
  assert.equal((await rpc(B, "earn_points", ["infographic-viewed", "life-insurance-malaysia"])).code, "quiz_required");
  assert.equal((await rpc(B, "earn_points", ["video-finished", "how-insurance-works-in-malaysia"])).code, "watch_time_required");
  assert.equal(await ledgerCount(B), 0);
  const p = await rpc(B, "earn_points", ["profile-complete", "profile"]);
  assert.equal(p.ok, true);
  assert.equal(p.points, 100);
  assert.equal((await rpc(B, "earn_points", ["profile-complete", "profile"])).code, "already_earned");
});

test("lesson quiz: 2/3 pays nothing and shows which answers were wrong; retry 3/3 pays 50 once", async () => {
  const before = await balance(B);
  const rows = await ledgerCount(B);
  const fail = await quiz(B, "lesson-complete", "hospital-bills", { ...LESSON_HB_OK, q3: "a" });
  assert.equal(fail.ok, true);
  assert.equal(fail.passed, false);
  assert.deepEqual([fail.score, fail.total, fail.earned, fail.points], [2, 3, false, 0]);
  assert.deepEqual(fail.results, [{ id: "q1", correct: true }, { id: "q2", correct: true }, { id: "q3", correct: false }]);
  assert.equal(await balance(B), before);
  assert.equal(await ledgerCount(B), rows);

  const incomplete = await quiz(B, "lesson-complete", "hospital-bills", { q1: "a" });
  assert.deepEqual([incomplete.passed, incomplete.score, incomplete.earned], [false, 1, false]);

  const pass = await quiz(B, "lesson-complete", "hospital-bills", LESSON_HB_OK);
  assert.deepEqual([pass.passed, pass.score, pass.earned, pass.points], [true, 3, true, 50]);
  assert.equal(await balance(B), before + 50);

  const repeat = await quiz(B, "lesson-complete", "hospital-bills", LESSON_HB_OK);
  assert.deepEqual([repeat.passed, repeat.earned, repeat.already_earned], [true, false, true]);
  assert.equal(await balance(B), before + 50, "no duplicate points");
  assert.equal(await ledgerCount(B), rows + 1, "exactly one ledger row");
});

test("infographic quiz: wrong pays nothing; perfect pays 20 once", async () => {
  const before = await balance(B);
  const fail = await quiz(B, "infographic-viewed", "medical-insurance-malaysia", { q1: "a", q2: "b", q3: "a" });
  assert.deepEqual([fail.passed, fail.score, fail.earned], [false, 2, false]);
  assert.equal(await balance(B), before);
  const pass = await quiz(B, "infographic-viewed", "medical-insurance-malaysia", IG_OK);
  assert.deepEqual([pass.earned, pass.points], [true, 20]);
  assert.equal((await quiz(B, "infographic-viewed", "medical-insurance-malaysia", IG_OK)).already_earned, true);
  assert.equal(await balance(B), before + 20);
});

test("quiz: demo content already earned in the seed reports already_earned, pays nothing", async () => {
  const before = await balance(A);
  const r = await quiz(A, "lesson-complete", "money-talks", LESSON_OK);
  assert.deepEqual([r.passed, r.earned, r.already_earned], [true, false, true]);
  assert.equal(await balance(A), before);
});

test("quiz: fake ids, wrong kind pairs, bad answers and unknown kinds are rejected with no change", async () => {
  const before = await balance(C);
  const rows = await ledgerCount(C);
  assert.equal((await quiz(C, "lesson-complete", "not-a-lesson", LESSON_OK)).code, "unknown_content");
  assert.equal((await quiz(C, "infographic-viewed", "money-talks", LESSON_OK)).code, "unknown_content", "lesson id under the infographic kind");
  assert.equal((await quiz(C, "video-finished", "what-is-insurance", LESSON_OK)).code, "unknown_activity");
  assert.equal((await quiz(C, "profile-complete", "profile", {})).code, "unknown_activity");
  assert.equal((await quiz(C, "lesson-complete", "Money Talks!", LESSON_OK)).code, "invalid_subject");
  assert.equal((await rpc(C, "submit_quiz", ["lesson-complete", "money-talks", JSON.stringify(["a", "c", "b"])])).code, "invalid_answers");
  assert.equal(await balance(C), before);
  assert.equal(await ledgerCount(C), rows);
});

test("quiz: account isolation — one account's pass never pays or marks another", async () => {
  const before = await balance(C);
  assert.equal((await quiz(C, "lesson-complete", "hospital-bills", LESSON_HB_OK)).earned, true, "C earns independently of B");
  assert.equal(await balance(C), before + 50);
  const keys = (await as(B, `select earn_key from public.points_ledger where earn_key like 'lesson-complete:%'`)).rows.map((r) => r.earn_key);
  assert.deepEqual(keys, ["lesson-complete:hospital-bills"], "B sees only its own ledger");
});

test("quiz: the answer key is server-only", async () => {
  await assert.rejects(as(B, "select * from ge_private.quiz_answer_key"), /permission denied/);
  await assert.rejects(as(B, "select * from ge_private.video_requirement"), /permission denied/);
});

/* ------------------------------------------------------------------------------------------ */
/* Video watch time                                                                            */
/* ------------------------------------------------------------------------------------------ */

const SHORT = "how-insurance-works-in-malaysia"; // required 86 s (88 s video)

test("video: the first report only starts the clock; claiming the whole video at once credits ~0", async () => {
  const start = await watch(B, SHORT, "en", 0);
  assert.deepEqual([start.ok, Number(start.watched_seconds), start.required_seconds, start.earned], [true, 0, 86, false]);
  // "Seek to the end": claim 88 s immediately — almost no real time has passed.
  const jump = await watch(B, SHORT, "en", 88);
  assert.ok(Number(jump.credited) < 1, `credited ${jump.credited}`);
  assert.equal(jump.earned, false);
});

const LONG = "what-is-insurance"; // required 479 s (481 s video)

test("video: credit is bounded by real elapsed time and idle time cannot be banked beyond 60 s", async () => {
  await watch(B, LONG, "en", 0);
  await age(B, LONG, "en", 30);
  const r = await watch(B, LONG, "en", 600);
  assert.ok(Number(r.credited) >= 29.9 && Number(r.credited) <= 31, `credited ${r.credited}`);
  await age(B, LONG, "en", 3600); // an hour away from the page
  const idle = await watch(B, LONG, "en", 600);
  assert.ok(Number(idle.credited) <= 60.01, `credited ${idle.credited}`);
  assert.equal(idle.earned, false);
  assert.ok(Number(idle.watched_seconds) <= 91, "partial watch time pays nothing");
  // A paused video: reporting 0 s credits nothing, however long the pause.
  await age(B, LONG, "en", 600);
  assert.equal(Number((await watch(B, LONG, "en", 0)).credited), 0);
});

test("video: 85 of 86 s pays nothing; reaching 86 s pays 40 once; more watching never pays again", async () => {
  const before = await balance(B);
  await age(B, SHORT, "en", 45);
  assert.equal((await watch(B, SHORT, "en", 45)).earned, false);
  await age(B, SHORT, "en", 40);
  const almost = await watch(B, SHORT, "en", 40);
  assert.equal(Number(almost.watched_seconds), 85);
  assert.equal(almost.earned, false, "one second short pays nothing");
  assert.equal(await balance(B), before);
  await age(B, SHORT, "en", 5);
  const r = await watch(B, SHORT, "en", 5);
  assert.equal(r.earned, true);
  assert.equal(r.points, 40);
  assert.equal(await balance(B), before + 40);
  await age(B, SHORT, "en", 30);
  const again = await watch(B, SHORT, "en", 30);
  assert.deepEqual([again.earned, again.already_earned], [false, true]);
  assert.equal(await balance(B), before + 40);
  assert.equal((await db.query(`select count(*)::int n from public.points_ledger where user_id = $1 and earn_key = $2`, [B, `video-finished:${SHORT}`])).rows[0].n, 1);
});

test("video: editions are tracked separately and need their own duration", async () => {
  const r = await watch(C, "what-is-insurance", "ta", 0);
  assert.equal(r.required_seconds, 340);
  const en = await watch(C, "what-is-insurance", "en", 0);
  assert.equal(en.required_seconds, 479);
  assert.equal((await watch(C, "how-insurance-works-in-malaysia", "zh", 0)).code, "unknown_content", "no zh edition exists");
});

test("video: invalid ids, fake completion requests and out-of-range seconds are rejected", async () => {
  const before = await balance(C);
  assert.equal((await watch(C, "not-a-video", "en", 10)).code, "unknown_content");
  assert.equal((await watch(C, "money-talks", "en", 10)).code, "unknown_content", "a lesson id is not a video");
  assert.equal((await watch(C, SHORT, "en", -5)).code, "invalid_seconds");
  assert.equal((await watch(C, SHORT, "en", 601)).code, "invalid_seconds");
  assert.equal((await watch(C, SHORT, "xx", 10)).code, "unknown_content");
  assert.equal(await balance(C), before);
});

test("video: watch progress is per account and not client-writable", async () => {
  const mine = (await as(C, `select content_id from public.video_watch_progress`)).rows.map((r) => r.content_id);
  assert.ok(!mine.includes(SHORT), "C cannot see B's progress");
  await assert.rejects(as(C, `insert into public.video_watch_progress (user_id, content_id, lang, watched_seconds) values ('${C}', '${SHORT}', 'en', 999)`), /permission denied/);
  await assert.rejects(as(B, `update public.video_watch_progress set watched_seconds = 999`), /permission denied/);
});

test("security: new RPCs are SECURITY DEFINER, empty search_path, signed-in users only", async () => {
  const fns = (await db.query(`
    select p.proname, p.prosecdef, p.proconfig,
           has_function_privilege('anon', p.oid, 'execute') anon_exec,
           has_function_privilege('authenticated', p.oid, 'execute') auth_exec
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname in ('submit_quiz','record_video_watch','earn_points','redeem_reward')`)).rows;
  assert.equal(fns.length, 4);
  for (const f of fns) {
    assert.equal(f.prosecdef, true, f.proname);
    assert.deepEqual(f.proconfig, ['search_path=""'], f.proname);
    assert.equal(f.anon_exec, false, f.proname);
    assert.equal(f.auth_exec, true, f.proname);
  }
  await assert.rejects(as(null, `select public.submit_quiz('lesson-complete','money-talks','{}')`), /permission denied/);
  await assert.rejects(as(B, `select ge_private.pay_activity(auth.uid(), 'lesson-complete', 'deductibles')`), /permission denied/);
  const rls = (await db.query(`select relname, relrowsecurity from pg_class where relnamespace = 'public'::regnamespace and relkind = 'r'`)).rows;
  for (const t of rls) assert.equal(t.relrowsecurity, true, t.relname);
});

test("reset_demo still works and clears the demo's watch progress with the rest of its state", async () => {
  await watch(A, SHORT, "en", 0);
  const r = await rpc(A, "reset_demo", []);
  assert.equal(r.ok, true);
  assert.equal(r.points_balance, 2450);
  assert.equal((await as(A, `select count(*)::int n from public.video_watch_progress`)).rows[0].n, 0);
});

test("invariant: every balance equals its ledger sum", async () => {
  for (const uid of [A, B, C]) assert.equal(await balance(uid), await ledgerSum(uid), uid);
});
