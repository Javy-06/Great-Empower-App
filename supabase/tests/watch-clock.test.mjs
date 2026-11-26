// Database tests for supabase/migrations/20261128000000_account_watch_clock.sql (v4), applied on top
// of the base and v3 migrations exactly as on the live project (accounts and watch progress exist
// BEFORE v4 is applied). Runs on PGlite (see docs/demo-accounts-setup.md):
//   BASE=<repo>/supabase/migrations/20261126000000_demo_accounts.sql \
//   V3=<repo>/supabase/migrations/20261127000000_rewards_learning_verification.sql \
//   V4=<repo>/supabase/migrations/20261128000000_account_watch_clock.sql node --test watch-clock.test.mjs
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const BASE = readFileSync(process.env.BASE ?? "", "utf8");
const V3 = readFileSync(process.env.V3 ?? "", "utf8");
const V4 = readFileSync(process.env.V4 ?? "", "utf8");

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

/* ------------------------------------------------------------------------------ safety */

test("v4: refuses to run without v3 and leaves nothing behind", async () => {
  const fresh = new PGlite();
  await fresh.exec(AUTH_SHIM);
  await fresh.exec(BASE);
  await assert.rejects(fresh.exec(V4), /v3 migration .* not found/);
  await fresh.exec("rollback");
  assert.equal((await fresh.query(`select to_regclass('ge_private.video_watch_clock') t`)).rows[0].t, null);
});

test("v4: no destructive statements", () => {
  const body = V4.replace(/--.*$/gm, "").toLowerCase();
  assert.ok(!/\bdrop\s+(table|column|schema|function)\b/.test(body), "no drop");
  assert.ok(!/\bdelete\s+from\b/.test(body), "no delete");
  assert.ok(!/\btruncate\b/.test(body), "no truncate");
});

/* ------------------------------------------------------------------------------ setup */

const db = new PGlite();
await db.exec(AUTH_SHIM);
await db.exec(BASE);
await db.exec(V3);

const A = "11111111-1111-4111-8111-111111111111"; // mid-video BEFORE v4
const B = "22222222-2222-4222-8222-222222222222";
const C = "33333333-3333-4333-8333-333333333333";
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
const ledgerSum = async (uid) => (await db.query(`select coalesce(sum(points),0)::int s from public.points_ledger where user_id = $1`, [uid])).rows[0].s;
const watch = (uid, id, lang, s) => rpc(uid, "record_video_watch", [id, lang, s]);
const watched = async (uid, id, lang = "en") =>
  Number((await db.query(`select watched_seconds from public.video_watch_progress where user_id = $1 and content_id = $2 and lang = $3`, [uid, id, lang])).rows[0]?.watched_seconds ?? 0);
/** Simulate real time passing for an account (the server measures elapsed time from its clock). */
const age = (uid, secs) =>
  db.query(`update ge_private.video_watch_clock set last_report_at = last_report_at - make_interval(secs => $2) where user_id = $1`, [uid, secs]);

const SHORT = "how-insurance-works-in-malaysia"; // 86 s required
const OTHER = "risk-pooling-powers-insurance"; // 84 s required
const LONG = "what-is-insurance"; // 479 s required (en)

for (const u of [A, B, C]) await rpc(u, "init_account", ["new", null]);
// A is mid-video under v3: 20 s credited, last report 10 s ago.
await watch(A, SHORT, "en", 0);
await db.query(`update public.video_watch_progress set last_report_at = last_report_at - interval '20 seconds' where user_id = $1`, [A]);
await watch(A, SHORT, "en", 20);
await db.query(`update public.video_watch_progress set last_report_at = last_report_at - interval '10 seconds' where user_id = $1`, [A]);
const preProgress = (await db.query(`select user_id, content_id, lang, watched_seconds from public.video_watch_progress order by 1, 2, 3`)).rows;
const preBalances = await Promise.all([A, B, C].map(balance));

await db.exec(V4);

/* ------------------------------------------------------------------------------ tests */

test("v4: a second run is refused and changes nothing", async () => {
  await assert.rejects(db.exec(V4), /already applied/);
  await db.exec("rollback");
});

test("v4 preserves existing watch progress and balances; accounts mid-video keep accruing", async () => {
  assert.deepEqual(
    (await db.query(`select user_id, content_id, lang, watched_seconds from public.video_watch_progress order by 1, 2, 3`)).rows,
    preProgress,
  );
  assert.deepEqual(await Promise.all([A, B, C].map(balance)), preBalances);
  assert.ok(Math.abs((await watched(A, SHORT)) - 20) < 0.5);
  // The clock was seeded from A's last report (~10 s ago), so the next report is credited.
  const r = await watch(A, SHORT, "en", 15);
  assert.ok(Number(r.credited) >= 9.5 && Number(r.credited) <= 11, `credited ${r.credited}`);
});

test("parallel videos share ONE real-time allowance (the v4 fix)", async () => {
  await watch(B, SHORT, "en", 0);
  await watch(B, OTHER, "en", 0);
  await watch(B, LONG, "en", 0);
  await age(B, 30); // 30 s of real time pass
  const a = await watch(B, SHORT, "en", 30);
  const b = await watch(B, OTHER, "en", 30);
  const c = await watch(B, LONG, "en", 30);
  const total = Number(a.credited) + Number(b.credited) + Number(c.credited);
  assert.ok(total >= 29.9 && total <= 30.5, `three videos together credited ${total} s in 30 s`);
  assert.ok(Number(b.credited) < 0.5 && Number(c.credited) < 0.5, "nothing left for the parallel videos");
});

test("first report of an edition still credits 0, even with a full allowance", async () => {
  await watch(C, SHORT, "en", 0);
  await age(C, 120);
  const first = await watch(C, LONG, "en", 60);
  assert.equal(Number(first.credited), 0);
  assert.equal(first.earned, false);
});

test("idle time cannot be banked beyond 60 s; a pause (0 s reports) credits nothing", async () => {
  await age(C, 3600);
  const r = await watch(C, SHORT, "en", 600);
  assert.ok(Number(r.credited) <= 60.01, `credited ${r.credited}`);
  await age(C, 600);
  assert.equal(Number((await watch(C, SHORT, "en", 0)).credited), 0);
});

test("a normal watch still pays 40 exactly once at the requirement", async () => {
  // C has ~60 s on SHORT (86 s required).
  const before = await balance(C);
  await age(C, 25);
  const almost = await watch(C, SHORT, "en", 25);
  assert.equal(almost.earned, false, `watched ${almost.watched_seconds}`);
  await age(C, 5);
  const r = await watch(C, SHORT, "en", 5);
  assert.equal(r.earned, true, `watched ${r.watched_seconds}`);
  assert.equal(r.points, 40);
  assert.equal(await balance(C), before + 40);
  await age(C, 30);
  const again = await watch(C, SHORT, "en", 30);
  assert.deepEqual([again.earned, again.already_earned], [false, true]);
  assert.equal(await balance(C), before + 40);
});

test("validation unchanged: fake ids, unknown editions and out-of-range seconds", async () => {
  const before = await balance(B);
  assert.equal((await watch(B, "not-a-video", "en", 10)).code, "unknown_content");
  assert.equal((await watch(B, SHORT, "xx", 10)).code, "unknown_content");
  assert.equal((await watch(B, SHORT, "en", -1)).code, "invalid_seconds");
  assert.equal((await watch(B, SHORT, "en", 601)).code, "invalid_seconds");
  assert.equal(await balance(B), before);
});

test("security: clock is server-only; record_video_watch stays DEFINER, authenticated only", async () => {
  await assert.rejects(as(B, `select * from ge_private.video_watch_clock`), /permission denied/);
  await assert.rejects(as(B, `update ge_private.video_watch_clock set allowance_seconds = 60`), /permission denied/);
  await assert.rejects(as(null, `select public.record_video_watch('${SHORT}', 'en', 1)`), /permission denied/);
  const fn = (await db.query(`select prosecdef, proconfig from pg_proc where oid = 'public.record_video_watch(text, text, numeric)'::regprocedure`)).rows[0];
  assert.equal(fn.prosecdef, true);
  assert.ok(String(fn.proconfig).includes("search_path="), String(fn.proconfig));
});

test("reset_demo still works with the clock in place", async () => {
  const D = "44444444-4444-4444-8444-444444444444";
  await db.exec(`insert into auth.users (id) values ('${D}')`);
  await rpc(D, "init_account", ["demo", null]);
  await watch(D, SHORT, "en", 0);
  const r = await rpc(D, "reset_demo", []);
  assert.equal(r.ok, true);
  assert.equal(r.points_balance, 2450);
});

test("invariant: every balance equals its ledger sum", async () => {
  for (const uid of [A, B, C]) assert.equal(await balance(uid), await ledgerSum(uid), uid);
});
