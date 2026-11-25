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
Note: with this exact breakdown the *Keep Learning* challenge (lessons + videos, target 3) is at
**3 of 3 and claimable**, not 2 of 3 — see the implementation report.

A **new account** starts with 0 points, no history, progress, bookmarks, bookings, passes or
challenges, English, and the Welcome Offer available.

## Welcome Offer (strict)

One time per account: any **food or drink** item for **200 points**, chosen on the item's own page.
Wellness and in-game items are never eligible. Eligibility is a generated database column
(`category in ('food','drink')`) and the app uses the same rule. After use, all items are full price.

## Supabase setup (manual, Free plan)

1. Create a project at supabase.com (Free plan is enough; 2 active free projects max).
2. **Enable anonymous sign-ins** in the Auth providers settings (Authentication → Sign In / Providers; menu labels may differ slightly).
3. Run the migration: SQL Editor → paste `supabase/migrations/20261126000000_demo_accounts.sql` →
   Run (or `supabase db push` with the Supabase CLI if you use it).
4. Project Settings → API Keys: copy the **Project URL** and the **publishable** key
   (`sb_publishable_…`). Never use a secret / `service_role` key in the app.
5. Local: copy `.env.example` to `.env.local` and fill both values. Restart `pnpm dev`.
6. Vercel: add the same two variables to the **Preview** environment only, then redeploy the
   preview. Do not add them to Production unless you decide to.

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
* Earning points is client-initiated (the server can't prove a video was watched); each activity
  still pays only once.
* Device-only accounts are a fallback sandbox; they are never merged into cloud data.

## Running the database tests

The SQL tests run the real migration on [PGlite](https://pglite.dev) with a minimal auth shim
(no Supabase project needed). PGlite is not a project dependency; run from a scratch folder:

```sh
mkdir -p /tmp/ge-sqltest && cd /tmp/ge-sqltest && npm init -y >/dev/null && npm i @electric-sql/pglite
cp <repo>/supabase/tests/db.test.mjs . && MIGRATION=<repo>/supabase/migrations/20261126000000_demo_accounts.sql node --test db.test.mjs
```

PGlite has a single connection, so true concurrency isn't exercised there; double-charging is
prevented by the per-user `select … for update` lock plus the unique `(user_id, request_id)`
constraint (a retry returns the original result).

## Rollback

* App: revert the commit — the original pre-account localStorage keys are untouched, so the
  previous build reads them as before.
* Database: drop the tables/functions created by the migration (or delete the Supabase project).
