# 07 — Final Summary: Rewards Economy & Learning Verification

**Status: complete.** The work is implemented, tested, live on the Supabase project and pushed to `redesign/overnight-product-refresh`. Production was not touched.

## Major changes
1. **Rewards should mean learning.**
   - Lessons and infographics pay only after a **perfect quiz score**.
   - Videos pay only after enough **valid watch time**: new footage played in real time, with the tab visible.
   - The server grades quizzes and limits watch time, and the old "mark complete" path is closed.
2. **Practical catalogue.**
   - The four Shieldora/Nestora game items are retired: hidden and not redeemable, with history kept.
   - CarePlus is repriced to its value: 3,000 / 3,500 / 4,500.
   - New **Great Empower Vouchers**: RM10 (1,000), RM25 (2,500), 5% capped at RM30 (3,000) and RM50 (5,000). They can be redeemed into the wallet and are clearly marked "for future eligible insurance purchases, not usable today".
3. **Quiz UX:**
   - One question per screen, with a progress bar.
   - Shuffled questions and options on each attempt.
   - Explanations for every answer, and a retry of only the missed questions.
4. **Video UX:**
   - "Valid watch time m:ss / m:ss" with a progress bar.
   - Progress builds across visits.
   - Skipping, replaying, pausing and hidden tabs don't count.

## Important decisions
- **Earning amounts unchanged** (50 / 20 / 40 / 100 plus challenges), so the Demo seed (2,450) and the Welcome Offer are unchanged.
- **Pricing anchor:** the existing 100 pts per RM1. The 5% voucher is priced at its cap.
- **Retire, don't delete or rename** the game items.
- **No insurance checkout or purchase logic.** Voucher terms are only stored as configuration for the future.

## Rewards economy conclusions
- A new account can earn at most **1,140 pts** (plus the Welcome Offer). That takes about 80 minutes of real learning.
- The Demo Account can reach about **3,430**.
- The **high tier** (Health Check Kit 4,500, RM50 voucher 5,000) **can't be reached with today's content**.

**Recommendation:** add learning content rather than raise earning amounts. This needs your product decision.

## Security conclusions
- The backend decides every point award: no client amounts, scores, eligibility flags or account ids are trusted.
- A rewind/replay gap found during this audit is fixed.
- **Remaining, documented risks:**
  - The quiz key is readable in the bundle (≤ 450 pts per account, once).
  - A script can earn video points in real time without watching (≤ 160 pts per account, once).

## Testing results
| Check | Result |
|---|---|
| App unit tests | **176/176** pass (includes 69/69 frozen Engine 2 and 40/40 Engine 1) |
| Typecheck and build | **Pass** |
| Database suites | **36/36** base and **28/28** v3 pass |
| Headless Chrome E2E | All quiz, video and voucher checks pass, 0 console errors |
| Lint | **None configured** (not run) |

## Migration status
- `20261127000000_rewards_learning_verification.sql` was **applied once** on 2026-11-26 at 15:10:54 UTC to `ddxepshchmmhjvomzaoc`. It must not be re-run, and its preflight blocks a second run.
- **Live check on 2026-11-27, read-only:**
  - 0 balance mismatches and 0 duplicate earns.
  - Preview users have already earned 17 verified rewards and redeemed 2 vouchers through the new RPCs.

## Safety confirmation
- Original worktree (`Codex - GREAT EMPOWER Design System`): **untouched**.
- Production (deployments, environment variables, domains): **untouched**.
- Six `public/advisor` portraits: **untouched**, never staged or committed.
- Frozen Engine 2 contracts and calculations: **untouched**. There is no diff under `src/calculation-engine` or `src/app/medical-claim`, and the 69 Engine 2 tests pass.
- Supabase anonymous-auth account architecture, RLS and DEFINER protections: **preserved**.
- Insurance purchase or checkout: **not implemented**.
- Secrets: **none exposed**.
- Destructive database operations: **none**. Additive only, and existing balances, history and progress are preserved.

## Outstanding / next steps
1. **Your decision:** content expansion (or rate changes) to make the 4,500–5,000 tier reachable.
2. **Revoke** the Vercel "Protection Bypass for Automation" secret (Settings → Deployment Protection).
3. Optional: a migration that adds a per-account watch clock across all videos (closes R2), after your approval.
4. Optional: add a linter (a new dependency, so it needs approval) and decide on repo-wide formatting.
5. Optional: re-run `supabase/tests/concurrency-check.mjs` against the live project. It creates test accounts.
6. When insurance purchasing is designed, use `VOUCHER_TERMS` and the `voucher` config on each product (discount, cap, `maxHeld`) for eligibility, expiry and how vouchers are applied.
