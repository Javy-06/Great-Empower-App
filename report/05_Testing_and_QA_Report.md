# 05 — Testing & QA Report

Every result below comes from a real run on 2026-11-27, Windows 11, Node v22, at commit `a6766b4`.
Nothing is reported as passing without having run.

## 1. Summary
| Suite | Command | Result |
|---|---|---|
| App unit tests (all `src/**/*.test.ts`) | `node --experimental-strip-types --test $(find src -name "*.test.ts")` | **176 / 176 pass** |
| Engine 1 (package script) | `npm run test:engine-1` | **40 / 40 pass** (also included in the 176) |
| TypeScript | `npx tsc -b` | **Pass**, 0 errors |
| Production build | `npm run build` (Vite) | **Pass**, built in about 1.8 s. Only the existing chunk-size warning. |
| DB: base migration suite (PGlite) | `MIGRATION=<repo>/supabase/migrations/20261126000000_demo_accounts.sql node --test db.test.mjs` | **36 / 36 pass** |
| DB: v3 verification suite (PGlite) | `BASE=<base.sql> V3=<repo>/supabase/migrations/20261127000000_rewards_learning_verification.sql node --test verification.test.mjs` | **28 / 28 pass** |
| DB: v4 watch-clock suite (PGlite) | `BASE=… V3=… V4=<repo>/supabase/migrations/20261128000000_account_watch_clock.sql node --test watch-clock.test.mjs` | **12 / 12 pass** |
| **Live concurrency check** (approved) | `node --env-file=.env.local supabase/tests/concurrency-check.mjs` (publishable key only) | **7 / 7 checks pass** (see §4b) |
| Browser E2E: quiz | headless Chrome, `vite preview` of the production build | **All checks passed**, 0 console errors |
| Browser E2E: full rewards flow | headless Chrome, production build | **All checks passed**, 0 console errors |
| Live database verification | read-only SQL against project `ddxepshchmmhjvomzaoc` | **Consistent** (see §4) |
| Lint | — | **Not available.** No linter is configured (see §5). |

The DB suites run in a scratch folder that has `@electric-sql/pglite` installed. The steps are in `docs/demo-accounts-setup.md`.

## 2. App unit tests by file
| File | Tests | Covers |
|---|---:|---|
| `src/rewards/verification.test.ts` | 18 | Quiz coverage and shape; SQL key matches; `gradeQuiz` perfect-only; watch requirements match SQL; `WatchMeter` (pause, hidden, forward seek, seek back plus replay = 0, coverage across visits, 2×, throttled gap, whole seconds); `addCoverage`; shuffle keeps ids and grading |
| `src/rewards/economy.test.ts` | 18 | `earn` refuses verified kinds; `submitQuiz` 2/3 → 0, 3/3 → once; `recordWatch` bounds and one-time pay; redeem: retired items refused, vouchers, `maxHeld`, insufficient points, Welcome Offer rules, ledger invariant |
| `src/account/seed.test.ts` | 7 | Demo seed still 2,450; catalogue mirrors SQL (prices, active flags, vouchers) |
| `src/calculation-engine/engine-1.test.ts` | 40 | Engine 1, unchanged |
| `src/calculation-engine/engine-2.test.ts` | 69 | **Frozen Engine 2, unchanged and passing** |
| `src/app/medical-claim/*.test.ts` (3 files) | 14 | Engine 2 adapters, unchanged |
| `src/app/guide/advisorSelection.test.ts` | 7 | Unchanged |
| `src/rewards/barcode.test.ts` | 3 | Unchanged |

## 3. Integration and E2E (headless Chrome, 390 × 844, Demo Account, device-only)

### Quiz flow (`hospital-bills` lesson)
| Check | Result |
|---|---|
| "Mark lesson complete" removed | Yes |
| "Next" / "Check answers" disabled until answered | Yes, on every step |
| Labels | "Question 1 of 3" … "Question 3 of 3"; on retry "Retry · question 1 of 1" |
| Shuffled order | Attempt 1 questions `q3,q2,q1`; after reload `q2,q1,q3`. Option orders differed (`bacd`, `dacb`, `dabc`) |
| 2/3 submitted | "Not passed yet — 2/3 correct", **0 pts**, explanation shown |
| Retry, only the missed question | "Perfect score — 3/3 · +50 pts added" |
| Reload and pass again | "Points for this were already earned"; **one** ledger entry |
| Back keeps the selected answer | Yes |
| Horizontal overflow | 0 px |

### Infographic (`life-insurance-malaysia`)
Opening it pays 0. A wrong answer pays 0. Retrying to 3/3 pays **+20**.

### Video (`how-insurance-works-in-malaysia`, 86 s required)
| Check | Result |
|---|---|
| Label | "Valid watch time 0:00 / 1:26" |
| Seek to the end and finish | +0 pts, 0 s |
| Play 6 s | 6 s |
| 4 s while hidden | still 6 s |
| Leave mid-play | 9 s, saved |
| Rewind and replay 5 s | **still 9 s** |
| Full watch | **+40 once** |

### Rewards
| Check | Result |
|---|---|
| Brand chips | All, TUBWAY, GREENBOWL, FRUITFUEL, CAREPLUS, GREAT EMPOWER (no Shieldora or Nestora) |
| Game items shown | None |
| CarePlus prices | 3,000 / 3,500 / 4,500 |
| Retired product URL | Falls back to the hub |
| RM10 voucher | Terms say "not available in the app yet". Redeeming took −1,000 and created code `GE-XXXX-XXXX`. |
| Second copy | Button disabled: "Already in your wallet" |
| Wallet | Shows the voucher as "Saved for later" and no "Retired game benefits" section |

The cloud account path, which calls the same RPCs, was covered by the PGlite DB suites and by the live data below. No new test accounts were created in the live project.

## 4. Live database verification (read-only, 2026-11-27)
| Check | Result |
|---|---|
| Migration objects | 36 quiz keys, 7 video requirements, `video_watch_progress` with RLS on |
| Functions | `submit_quiz`, `record_video_watch`, `earn_points`, `redeem_reward`: SECURITY DEFINER; `anon` cannot execute; `authenticated` can |
| Prices | `crp-basic-health-kit=3000`, `crp-wellness-pack=3500`, `crp-health-check-kit=4500`; `gev-rm10=1000`, `gev-rm25=2500`, `gev-5pct=3000`, `gev-rm50=5000`; the 4 game items retired |
| Ledger integrity | 25 profiles, 112 ledger rows, balance sum 29,660, **0 balance/ledger mismatches** |
| Duplicate earns | **0** duplicate `(user_id, earn_key)` |
| Real usage since the migration | Preview users made 9 lesson, 4 infographic and 4 video earns and 2 redemptions, all through the new verified RPCs. 2 vouchers held. 3 watch-progress rows. |

These counts grew from the pre-migration 21 / 90 / 24,100 because of real preview use after the migration. The invariant still holds.

## 4b. v4 migration and live concurrency check (2026-11-27, approved)
- **v4 applied once** on 2026-11-26 at 18:54:15 UTC, exit 0.
  - Before and after (read-only): 27 profiles, 128 ledger rows, balance sum 33,740, 0 mismatches, 5 watch rows (217 s), all unchanged.
  - 4 clock rows seeded. `record_video_watch` is DEFINER with `search_path=""` and uses the clock. anon can't execute it; authenticated can and can't read the clock.
- **Live concurrency check** with truly parallel HTTP requests against project `ddxepshchmmhjvomzaoc`. It created 4 anonymous test accounts.

| # | Check | Result |
|---|---|---|
| 1 | Same request id ×5 (Welcome Offer) | One 200-pt charge; balance 2,250 = ledger |
| 2 | 5 parallel Welcome Offers, different ids | Exactly one |
| 3 | 10 parallel 1,000-pt redemptions on 2,250 | 2 succeed; balance 250 = ledger |
| 4 | 5 parallel perfect quizzes (money-talks) | +50 **exactly once** |
| 5 | Wrong answer | 2/3, nothing paid |
| 6 | 8 parallel watch reports on 4 videos after 5 s | **5.2 s credited in 5.2 s** (v3 would have allowed about 21 s) |
| 7 | 5 parallel RM10 voucher redemptions | Exactly one; −1,000; balance = ledger |

- **Live invariants afterwards:** 31 profiles, 0 balance mismatches, 0 negative balances, 0 duplicate earns.

## 5. Lint and formatting
- **Lint:** there is no linter (ESLint or oxlint) and no `lint` script in `package.json`. Lint was **not run** because there is nothing to run. Adding one is a separate decision because it adds a dependency.
- **Formatting:** `oxfmt` is installed without a config. `npx oxfmt --check src` reports 92 files, but **86 were already non-conforming before this phase**, so the repo does not enforce formatting. Nothing was reformatted, to avoid unrelated diffs.

## 6. Failed tests during the phase (all fixed)
| When | Failure | Fix |
|---|---|---|
| v3 DB suite, first run | 2 video tests failed: the test's own arithmetic (30 s + 60 s exceeded the 86 s requirement) | Moved the cap test to the 8-minute video and added an 85/86 s boundary test |
| Old E2E script after the stepper UI | Selectors for the all-questions-at-once layout | Rewrote the quiz helpers for one question per screen |

There are no failing tests now.

## 7. Outstanding
- No linter (above).
- ~~Live concurrency check~~: **done** (§4b). It left 4 anonymous test accounts in the live project. The cleanup SQL is in `docs/demo-accounts-setup.md` if you want them removed. They were not deleted, because that is a destructive step.
