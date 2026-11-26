# 08 — Change Log

Branch `redesign/overnight-product-refresh`. Base for this phase: `49985a4`.

## 2026-11-26

### `dd6a927` — Rewards v3: vouchers, CarePlus repricing, verified learning rewards

**Catalogue**
- Retired Shieldora (Medical Protection, Protection Upgrade) and Nestora (Emergency Fund Boost, Savings Bonus): `retired: true` in the app and `active = false` on the server.
- CarePlus repriced:
  - Basic Health Kit 2,000 → 3,000
  - Wellness Pack 2,400 → 3,500
  - Health Check Kit 2,800 → 4,500
- Added the `great-empower` brand and the vouchers `gev-rm10` (1,000), `gev-rm25` (2,500), `gev-5pct` (3,000, capped at RM30) and `gev-rm50` (5,000), each with `maxHeld: 1`.
- Added `VOUCHER_TERMS`, `activeProducts`, `activeBrands`, `isVerifiedKind` and `verification` on each earning rule.

**Learning**
- Added `src/data/quizzes.ts`: 12 quizzes, 36 questions.
- Added `src/rewards/verification.ts` (`gradeQuiz`, `watchRequirements`, `WatchMeter`).
- `economy.ts`:
  - `earn()` refuses verified kinds.
  - New `submitQuiz` and `recordWatch`.
  - `redeem()` handles vouchers and `maxHeld` and rejects retired items.
- `store.ts` and `cloud.ts`: `submitQuiz` / `recordWatch` actions, and cloud calls to `submit_quiz` / `record_video_watch`.
- UI:
  - `RewardQuiz` component.
  - `useWatchTime` hook.
  - Removed "Mark lesson complete".
  - Watch-progress card on video pages.
  - Infographic quiz.

**Rewards UI**
- `VoucherVisual`, a vouchers section in the hub, voucher terms on the detail page, the "Already in your wallet" state and a wallet voucher section.
- Retired-item routes fall back to the hub.

**Database**
- Migration `20261127000000_rewards_learning_verification.sql`:
  - New tables `quiz_answer_key`, `video_requirement` and `video_watch_progress`.
  - New functions `pay_activity`, `submit_quiz` and `record_video_watch`.
  - Replaced `earn_points` and `redeem_reward`.
  - Widened check constraints and added the `max_held` column.

**Tests and docs**
- Added `supabase/tests/verification.test.mjs` (28) and `src/rewards/verification.test.ts`.
- Updated `economy.test.ts` and `seed.test.ts`.
- Added `docs/rewards-economy.md` and updated `docs/demo-accounts-setup.md`.

### Migration applied
- 2026-11-26 15:10:54 UTC: v3 applied once to Supabase `ddxepshchmmhjvomzaoc`, with the user's approval.
- Checked read-only before and after: 21 profiles, 90 ledger rows, balance sum 24,100 and 0 mismatches, unchanged.

### `9f0385b` — Quiz: one question per screen with shuffled order; valid watch time label
- `RewardQuiz` rewritten as a stepper:
  - "Question n of N", a progress bar, Back / Next / Check answers.
  - A results screen; retry asks only the missed questions.
- Added `shuffled()` (Fisher–Yates) for question and option order, which ids keep stable.
- Video progress label renamed "Valid watch time".
- Added a test: shuffling keeps ids and grading.

## 2026-11-27

### `a6766b4` — Watch time counts each part of a video once; quiz explanations for every answer
- `WatchMeter` now keeps a **coverage** list (`addCoverage`, `coveredSeconds`). Replaying already-credited footage adds no time.
- `watchCoverageStore` (`ge-watch-coverage-v1`, per account): restored on each visit and cleared with the local and cloud demo reset. It restarts if it runs ahead of the confirmed time.
- Video rules copy now says replays don't count.
- The quiz results screen shows explanations for correct answers too, and a `ge-reveal` fade between steps.
- Added 3 unit tests (coverage across visits, `addCoverage`, 2× second pass) and rewrote the rewind test.

### Reports
- Added the `report/` folder: 01–08 (this file).
- Read-only live checks:
  - 25 profiles, 112 ledger rows, 0 mismatches, 0 duplicate earns.
  - Verified earns since the migration: 17.

### v4 — per-account watch clock (approved)
- Added `supabase/migrations/20261128000000_account_watch_clock.sql`:
  - New table `ge_private.video_watch_clock`, seeded from existing progress.
  - `record_video_watch` uses one real-time allowance per account across all videos.
- Added `supabase/tests/watch-clock.test.mjs` (12 tests: safety, preservation, parallel videos, first report, idle cap, pays once, validation, security, demo reset, invariant).
- **Applied live once** on 2026-11-26 at 18:54:15 UTC. Data unchanged before and after.
- `supabase/tests/concurrency-check.mjs` gained 4 checks: parallel quiz, wrong quiz, parallel watch reports and parallel voucher redemptions. **Live run: 7/7 pass.** It created 4 anonymous test accounts.
- Updated reports 01, 04, 05, 06, 07 and 08, and `docs/demo-accounts-setup.md`.
