# 01 — Implementation Report

**Phase:** Rewards Economy & Learning Verification Redesign
**Branch:** `redesign/overnight-product-refresh` (remote `app`)
**Worktree:** `C:\Users\Javy\Downloads\GREAT-EMPOWER-redesign`
**Commits in this phase:** `dd6a927`, `9f0385b`, `a6766b4`, plus the commit that adds this `report/` folder.
**Status:** Complete. All requirements in the brief are implemented, except the items listed under "Deviations" and in `05_Testing_and_QA_Report.md` → Outstanding.

---

## 1. Summary

- The rewards catalogue now covers practical rewards: Lifestyle food and drink, CarePlus wellness, and the new **Great Empower Vouchers**.
- The four **Shieldora / Nestora** in-game items were **retired**. They gave simulated game benefits only.
- **CarePlus** was repriced onto the catalogue's existing value anchor of about 100 pts per RM1.
- Learning rewards are now **verified**:
  - **Lessons and infographics** pay only after a **perfect score** on a 3-question quiz. The server grades cloud accounts.
  - **Videos** pay only after enough **valid watch time**: the video length minus 2 s, counted only from footage actually played in real time.
- The server **bounds** reported watch time by real elapsed time and owns every point award.
- Every point amount, the Demo Account seed (2,450), the Welcome Offer, the ledger, the redemption system and the earnable-content allow-list are unchanged.

## 2. Features

### Added
| Feature | Where |
|---|---|
| Great Empower Vouchers: RM10, RM25, 5% (capped at RM30), RM50 | `src/rewards/catalogue.ts`, SQL `reward_products` |
| Voucher wallet section, voucher codes, a holding limit of one of each | `src/app/RewardsView.tsx`, `src/rewards/economy.ts`, SQL `redeem_reward` |
| 12 reward quizzes: 7 lessons and 5 infographics, 3 questions each, 36 in total | `src/data/quizzes.ts`, SQL `ge_private.quiz_answer_key` |
| Quiz UI: one question per screen, progress bar, shuffled order, retry, explanations | `src/app/learn/RewardQuiz.tsx` |
| Server quiz grading | SQL `public.submit_quiz` |
| Valid watch-time tracking: event-driven, counts only new footage, saved per account | `src/app/learn/useWatchTime.ts`, `src/rewards/verification.ts` (`WatchMeter`, `addCoverage`) |
| Server watch-time limit tied to real elapsed time | SQL `public.record_video_watch`, `public.video_watch_progress` |
| "Valid watch time m:ss / m:ss" progress display | `src/app/learn/LearnMedia.tsx` |

### Changed
| Feature | Before | After |
|---|---|---|
| Lesson reward | "Mark lesson complete" button paid 50 | Perfect quiz score pays 50 |
| Infographic reward | Opening the infographic paid 20 | Perfect quiz score pays 20 |
| Video reward | The `ended` event paid 40 | Valid watch time ≥ length − 2 s pays 40 |
| `earn_points` RPC | Paid any allow-listed activity | Refuses lesson, infographic and video kinds (they must go through verification). Profile only. |
| CarePlus prices | 2,000 / 2,400 / 2,800 | 3,000 / 3,500 / 4,500 |
| Rewards hub copy and the About page | "Read/view/watch to earn" | Explains the quiz and watch-time requirements |

### Removed / retired
| Item | How |
|---|---|
| Shieldora Medical Protection, Protection Upgrade; Nestora Emergency Fund Boost, Savings Bonus | `retired: true` in the app and `active = false` on the server. Hidden from the catalogue. Their routes fall back to the hub. Redemption is refused. **Nothing is deleted.** Existing holders still see them under "Retired game benefits". |
| Shieldora / Nestora brand chips | Hidden through `activeBrands` |

## 3. UI/UX changes
- **Lesson page:** removed the Start / "Mark lesson complete" buttons and added the "Check your understanding" quiz card below the key points.
- **Infographic page:** the same quiz card below the image. Opening the page marks the item started, with no points.
- **Video page:** a "Valid watch time" progress card and plain-language rules: only new footage counts, and skipping, replays, pauses and other tabs don't. Once the points are earned, it shows "Watched · points earned".
- **Quiz card:**
  - "Question n of N" with a progress bar.
  - Back / Next, and "Check answers" on the last step.
  - A results screen with ✓/✗ for each question, your answer, the correct answer and an explanation.
  - "Try again" asks only the missed questions.
  - A short `ge-reveal` fade between steps, using the existing token and respecting reduced motion.
- **Rewards:**
  - A vouchers section in the hub and a navy-to-crimson voucher ticket visual.
  - The voucher detail page shows the terms ("not usable today").
  - The redeem button turns into "Already in your wallet" while a voucher is held.
  - A "Great Empower Vouchers" section in the wallet.
- All new UI uses existing tokens and components (`ProgressBar`, the colour scales, `ge-reveal`). No new dependencies.

## 4. Files modified (`49985a4..HEAD`)
```
docs/demo-accounts-setup.md
docs/rewards-economy.md
src/account/cloud.ts
src/account/seed.test.ts
src/account/session.ts
src/app/AboutView.tsx
src/app/LearnDashboard.tsx
src/app/RewardsView.tsx
src/app/learn/LearnMedia.tsx
src/app/learn/RewardQuiz.tsx            (new)
src/app/learn/useWatchTime.ts           (new)
src/data/quizzes.ts                     (new)
src/rewards/catalogue.ts
src/rewards/economy.test.ts
src/rewards/economy.ts
src/rewards/store.ts
src/rewards/verification.test.ts        (new)
src/rewards/verification.ts             (new)
supabase/migrations/20261127000000_rewards_learning_verification.sql  (new)
supabase/tests/verification.test.mjs    (new)
report/*                                (new, this folder)
```
Not touched: Engine 2 (`src/calculation-engine/*`), `public/advisor/*`, Production configuration.

## 5. Database changes and migration status
- **Migration:** `supabase/migrations/20261127000000_rewards_learning_verification.sql`
  - It runs as one transaction with a preflight. The preflight requires the base migration and refuses to run a second time.
  - It only adds or switches things off. There is no `drop table`, `delete` or `truncate`, and a test checks this.
- **Applied once** to Supabase project `ddxepshchmmhjvomzaoc` on **2026-11-26 at 15:10:54 UTC**, with the user's approval. Never re-run.
- **Details:** see `06_Security_Audit_Report.md` §2 and `05_Testing_and_QA_Report.md` §4. That includes the live verification on 2026-11-27, which was read-only.

## 6. Implementation decisions
1. **Retire rather than delete or rename** the game items. Renaming would keep game behaviour under a new name, and deleting would break existing ledger rows and items.
2. **Keep earning amounts.** Only the requirement changed. The Demo seed and Welcome Offer stay valid.
3. **Grade quizzes on the server.** The client sends answer ids and the server returns per-question correctness. Point amounts and scores are never sent by the client.
4. **Answer key in two places.** The key is in the client bundle (to explain results and for device-only accounts) and in `ge_private` (authoritative). Tests check they match.
5. **Watch time is bounded twice.**
   - Client: counts real time × footage advanced × footage not seen before.
   - Server: credited time ≤ real elapsed time between reports, capped at 60 s of saved allowance. The first report only starts the clock.
6. **Rewinding does not count twice.** A per-account, per-edition coverage list (`ge-watch-coverage-v1`) records the footage already credited.
7. **Vouchers use the existing redemption system** (ledger and `reward_items` with a code) and a new `max_held` column. They have no checkout or purchase logic.
8. **5% voucher capped at RM30** and priced at 3,000, so it can never be worth more than its points at the anchor.

## 7. Deviations from the brief
| Brief item | What was done | Why |
|---|---|---|
| "Feedback after answering" (9.5) | Feedback and explanations appear on the results screen right after the attempt is graded, not after each question | The server grades the whole attempt. Per-question reveal before submitting would show the answer before it is graded. Answers are fixed once submitted. |
| "Question pool for repeated attempts" (9.6) | One fixed set of 3 questions per item. Order and options are shuffled on each attempt | A larger pool needs new, verified educational content. Not done, to avoid weaker or inaccurate questions. |
| Lint (16) | No lint tool is configured in the repo. Formatting (`oxfmt`) is not enforced repo-wide: 86 files were already non-conforming before this phase | No linter was added and nothing was reformatted, to avoid unrelated churn. See report 05. |
| Watch coverage across devices | Coverage is stored on the device | The server can't see playback. Its real-time limit still applies on every device. |
