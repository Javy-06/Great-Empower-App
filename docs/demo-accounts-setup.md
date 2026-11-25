# Demo accounts + Supabase — setup and behaviour

Great Empower offers a **demo account experience, not real authentication**. There is no email,
password, OAuth, phone or OTP, and no identity is verified. Every cloud account is a Supabase
**anonymous user**; accounts can only be reopened in the browser that created them.

## How it works

| Piece | Where |
|---|---|
| Account entry (Demo / Create New / reopen) | `src/app/account/AccountScreens.tsx` (`WelcomeScreen`) |
| Account menu (switch, reset demo, sign out) | `AccountButton` in the same file, shown in the top bars |
| Device account list (`ge-accounts-v1`) | `src/account/registry.ts` |
| Session controller (open, create, sign out, reset, legacy migration) | `src/account/session.ts` |
| Supabase client per account, pull/push sync, rewards RPC backend | `src/account/cloud.ts` (lazy-loaded) |
| Demo seed (device-only mirror of the SQL seed) | `src/account/seed.ts` |
| Schema, RLS, RPCs, catalogue | `supabase/migrations/20261126000000_demo_accounts.sql` |
| Database tests (PGlite) | `supabase/tests/db.test.mjs` |

* **Per-account local data.** Every app store (`ge-rewards-v2`, `ge-learn-v1`, `ge-profile-v1`,
  `ge-sessions-v1`, `ge-guide-checklist-v1`, `ge-notifications-v1`) is saved per account as
  `<key>::<accountId>`. Switching account swaps all of them at once.
* **Cloud accounts.** Each has its own Supabase client whose session is stored under
  `ge-sb-<accountId>`; before loading, the session's user id must equal the account's recorded
  uid. Points, history, passes and the Welcome Offer change **only** through RPCs
  (`redeem_reward`, `earn_points`, `claim_challenge`, `confirm_pass_used`, `init_account`,
  `reset_demo`). Learning progress, language, bookings, checklist and notification reads sync
  directly (owner-only via RLS).
* **Analyze / profile inputs never leave the device.** They are stored per account locally only.
* **Sign out** clears the active account and returns to the Welcome screen. It does **not** call
  `supabase.auth.signOut()` (that would permanently lock an anonymous user out of their data).
* **Reset demo** (account menu → confirm) re-seeds only the demo account, server-side in one
  transaction. It never runs automatically.
* **Cloud saves that fail** (connection lost) are kept in this browser, shown as an amber dot on
  the account button plus a note in the account menu (with *Retry now*), and retried automatically
  (5 s, 15 s, 30 s, then every 60 s). If you sign out before they succeed, they are recorded per
  account and sent **before** the next pull when the account is reopened, so they are never
  overwritten; reopening is blocked (with *Try again*) until the cloud is reachable.
* **No cloud configured / cloud unreachable.** Without the env vars, accounts are device-only and the
  UI says so. If the cloud can't be reached, the app shows an error with *Try again*; creating an
  account offers an explicit *Continue in this browser only* — it never pretends to be synced.
* **Earlier progress.** On first launch after this change, existing local data (if any) is copied
  (not moved) into an account called *Earlier progress on this device*. The original keys are kept
  as a rollback path. Runs once (`ge-accounts-migration-v1`).

## Demo seed (identical in SQL and device-only mode)

| Entry | Points |
|---|---|
| Demo starting balance | +2,290 |
| Lesson complete: Money talks | +50 |
| Lesson complete: Emergency fund | +50 |
| Video finished: What is insurance? | +40 |
| Infographic studied: Understanding insurance (safety net) | +20 |
| **Total** | **2,450** |

Also: those 4 items completed, *Medical cards* bookmarked, one upcoming fictional guidance session
(online, 3 days ahead, Farah Nadia), no passes, **Welcome Offer available**, name "Aisyah".
Note: with this exact breakdown the *Keep Learning* challenge (counts `lesson-complete` +
`video-finished`, target 3) is at **3 of 3 and claimable**, not 2 of 3 — reaching 2 of 3 would need a
different seed breakdown or challenge rule, which is a product decision (see the review report).

A **new account** starts with 0 points, no history, progress, bookmarks, bookings, passes or
challenges, English, and the Welcome Offer available.

## Welcome Offer (strict)

One time per account: any **food or drink** item for **200 points**, chosen on the item's own page.
Wellness and in-game items are never eligible. Eligibility is a generated database column
(`category in ('food','drink')`) and the app uses the same rule. After use, all items are full price.

## Supabase setup checklist (manual, Free plan) — not done yet

The code works without Supabase (accounts are then saved in this browser only, and the app says
so). To turn on cloud saving, do these steps **in order**.

### About the migration

* File: `supabase/migrations/20261126000000_demo_accounts.sql`.
* **One-time, for a fresh project.** It is **not re-runnable**: a pre-flight check stops it with
  "already applied … Nothing was changed" if its objects exist. It never drops anything.
* **Atomic.** The file is wrapped in `begin; … commit;`, so any error rolls back the whole file —
  no partial schema. (PostgreSQL also runs a multi-statement script sent as one query as a single
  transaction; the explicit block makes that guaranteed.)
* **Prerequisites:** Supabase Auth (`auth.users`, `auth.uid()`) — present in every Supabase
  project — and PostgreSQL 13+ for core `gen_random_uuid()`. **No extensions are needed.**
* Creates: schema `ge_private` (internal, closed to API roles), 9 tables, RLS policies, 6 RPCs,
  17 catalogue items, 7 earning rules and a 17-row `earnable_content` allow-list (the only lesson,
  video, infographic and profile ids that can earn points). Touches no existing table.

### Steps

1. **Review the migration** (the file above) before running it.
2. **Create a Supabase project** on the Free plan (2 active free projects max per account).
3. **Enable anonymous sign-ins** in the Auth providers settings (Authentication → Sign In /
   Providers; menu labels may differ slightly). No email/SMS provider is needed.
4. **Run the migration once**: SQL Editor → New query → paste the **entire** file → Run.
   * Expected: success with no rows returned.
   * If it errors, nothing was applied (the transaction rolled back). Read the message, fix the
     cause, and run the whole file again. Never run parts of the file on their own.
5. **Verify** with the queries below (SQL Editor). All results should match.
6. **Copy two public values** from Project Settings → API Keys: the **Project URL** and the
   **publishable** key (`sb_publishable_…`). Never use a secret (`sb_secret_…`) or legacy
   `service_role` key in the app.
7. **Local**: copy `.env.example` to `.env.local` (gitignored) and set
   `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. Restart `pnpm dev`. The Welcome screen
   stops showing the "Cloud saving isn't set up" note, and accounts show "Saved to the cloud".
8. **Optional concurrency check** (truly parallel requests; creates 2 anonymous test users):
   `VITE_SUPABASE_URL=… VITE_SUPABASE_PUBLISHABLE_KEY=… node supabase/tests/concurrency-check.mjs`
9. **Vercel Preview**: add the same two variables to the **Preview** environment only, then
   redeploy the preview. Do not add them to Production unless you decide to.

### Post-migration verification SQL (expected results in comments)

```sql
-- 1. All 9 tables exist with RLS enabled → 9 rows, all rls = true
select c.relname as table_name, c.relrowsecurity as rls
from pg_class c
where c.relnamespace = 'public'::regnamespace and c.relkind = 'r'
  and c.relname in ('reward_products','earning_rules','earnable_content','profiles','points_ledger',
                    'reward_items','learning_progress','guidance_bookings','user_app_state')
order by 1;

-- 2. Policies → earning_rules 1, guidance_bookings 3, learning_progress 1, points_ledger 1,
--    profiles 2, reward_items 1, reward_products 1, user_app_state 3
select tablename, count(*) from pg_policies where schemaname = 'public'
group by 1 order by 1;

-- 3. Catalogue + Welcome Offer matrix →
--    drink    3  1000  1100  true
--    food     7  1200  1900  true
--    game     4  2000  4500  false
--    wellness 3  2000  2800  false
select category, count(*), min(price_points), max(price_points), bool_and(welcome_eligible)
from public.reward_products group by category order by category;

-- 4. Earning rules → 7 rows (4 activities + 3 challenges)
select key, kind, points, target from public.earning_rules order by kind, key;

-- 4b. Earnable content allow-list → infographic-viewed 5, lesson-complete 7,
--     profile-complete 1, video-finished 4
select kind, count(*) from public.earnable_content group by 1 order by 1;

-- 5. RPCs: SECURITY DEFINER, empty search_path, not executable by anon →
--    6 rows: prosecdef = true, proconfig = {search_path=""}, anon_can = false, auth_can = true
select p.proname, p.prosecdef, p.proconfig,
       has_function_privilege('anon', p.oid, 'execute') as anon_can,
       has_function_privilege('authenticated', p.oid, 'execute') as auth_can
from pg_proc p
where p.pronamespace = 'public'::regnamespace
  and p.proname in ('init_account','reset_demo','earn_points','claim_challenge','redeem_reward','confirm_pass_used')
order by 1;

-- 6. Internal schema closed to API roles → false, false
select has_schema_privilege('anon', 'ge_private', 'usage') as anon,
       has_schema_privilege('authenticated', 'ge_private', 'usage') as authenticated;

-- 7. anon has no table privileges on these tables, and no API role can touch
--    earnable_content → 0 rows
select grantee, table_name, privilege_type from information_schema.role_table_grants
where table_schema = 'public'
  and ((grantee = 'anon' and table_name in ('reward_products','earning_rules','earnable_content','profiles',
         'points_ledger','reward_items','learning_progress','guidance_bookings','user_app_state'))
    or (grantee = 'authenticated' and table_name = 'earnable_content'));

-- 8. Clients may UPDATE only profiles.display_name and profiles.language → exactly those 2 rows
select column_name from information_schema.column_privileges
where grantee = 'authenticated' and table_schema = 'public' and table_name = 'profiles'
  and privilege_type = 'UPDATE' order by 1;

-- 9. No accounts yet → 0
select count(*) from public.profiles;
```

After the app is connected: open **Demo Account** → 2,450 points and the Welcome Offer banner;
**Create New Account** → 0 points. Then `select account_type, points_balance,
welcome_offer_available from public.profiles;` shows one `demo` (2450, true) and one `new` (0, true).

### Before a live demo

* Anonymous sign-ins are rate-limited per IP (default 30/hour). Event Wi-Fi shares one IP —
  raise the anonymous sign-in rate limit in the Auth settings (it is adjustable in the dashboard).
* Free projects pause after 1 week of inactivity — open the app (or the dashboard) shortly before.
* Supabase recommends CAPTCHA / Cloudflare Turnstile for anonymous sign-ins on public sites; not
  configured here (demo scope).
* Old anonymous users are not cleaned up automatically. Optional cleanup (SQL Editor):
  `delete from auth.users where is_anonymous is true and created_at < now() - interval '30 days';`

## Limitations

* No cross-device access or recovery. Clearing browser data loses access to its accounts.
* Earning points is client-initiated (the server can't prove a video was watched), but only for the
  17 real content ids in `earnable_content`, and each pays only once per account.
* Redemption request ids must look like `redeem-…` (the app generates them); anything else is
  refused with `invalid_request`, so they can never collide with internal ledger ids.
* Device-only accounts are a fallback sandbox; they are never merged into cloud data.

## Running the database tests

`supabase/tests/db.test.mjs` runs the real migration on [PGlite](https://pglite.dev) (in-process
PostgreSQL) with a minimal Supabase auth shim — no Supabase project needed. It covers migration
safety (atomic failure, no rerun), RLS/grants, the seed, the Welcome Offer matrix, idempotency
(including reused request ids with a different product or mode), insufficient balance,
unknown/inactive items, earning, challenges, passes and reset. PGlite is not a project dependency;
run it from a scratch folder:

```sh
mkdir -p /tmp/ge-sqltest && cd /tmp/ge-sqltest && npm init -y >/dev/null && npm i @electric-sql/pglite
cp <repo>/supabase/tests/db.test.mjs . && MIGRATION=<repo>/supabase/migrations/20261126000000_demo_accounts.sql node --test db.test.mjs
```

PGlite has a single connection, so **truly parallel** requests are checked separately, after setup,
by `supabase/tests/concurrency-check.mjs` against your project (see step 8 above). Double charges
are prevented by the per-user `select … for update` lock, the unique `(user_id, request_id)`
constraint (a retry returns the original result) and `points_balance >= 0`.

## Rollback

* App: revert the commit — the original pre-account localStorage keys are untouched, so the
  previous build reads them as before.
* Database: drop the tables/functions created by the migration (or delete the Supabase project).
