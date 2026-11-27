# GREAT EMPOWER: final finishing and security report

**Date:** 27 November 2026
**Branch:** `redesign/overnight-product-refresh`
**Worktree:** `GREAT-EMPOWER-redesign`
**Last pushed commit:** `c983d7e`. This phase's work is **uncommitted** (not authorised in this phase).

## Executive summary
This phase:
- added a **build-level guard that forces device-only mode in Vercel Preview builds**, verified locally;
- finished the Rewards detail and confirmation screens;
- consolidated the Home calls to action;
- assessed the remaining simulators;
- audited Learn's visual assets;
- re-ran all QA.

The Preview that is currently deployed has **not** been rebuilt with the guard, because pushing isn't authorised in this phase. Its isolation therefore remains **UNVERIFIED**.

## Overall completion assessment: PARTIAL

| Area | Status |
|---|---|
| Deployment security: code guard | **PASS** (verified locally) |
| Deployment security: live Preview | **UNVERIFIED** |
| Rewards secondary screens | **PASS** |
| Home CTA consolidation | **PASS** |
| Simulators | **PASS** (assessed; no change needed) |
| Learn visual consistency | **PARTIAL** (audited; supplied 3D art kept by design) |
| Global UI polish | **PASS** (0 QA warnings) |
| Testing | **PASS** |
| Real-device / screen-reader testing | **UNVERIFIED** (not performed) |

## Deployment security assessment

**What was checked (read-only; no values printed):**

| Item | Finding |
|---|---|
| Vercel project env vars | **2 in total:** `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. Both are present, target **Preview** only, and are scoped to branch `redesign/overnight-product-refresh`. **No Production-scoped variables.** |
| Service-role or secret keys | None by name; the stored values weren't readable to check by content (see below) |
| Value check | The API returned the values **encrypted** (`decrypted: false`), so they couldn't be compared with the live `.env.local`. My records say they were set to the live project, so they are treated as live. |
| Built Preview bundle | The deployment file-tree API returns **404** for Git deployments. The SSO-protected Preview can't be fetched without a bypass token, which is not allowed. |
| Local `.env.local` | Live project, gitignored, never committed |
| `.env.example` | Placeholders only (tracked) |
| `vercel.json` | None |
| Supabase initialisation | Only `src/account/config.ts` reads the two `VITE_` variables; cloud mode turns on only if both are non-empty |

**Fix implemented (code only, no Vercel changes):** in `vite.config.ts`, when `VERCEL_ENV === "preview"` and `GE_PREVIEW_CLOUD` is not `on`, both `import.meta.env.VITE_SUPABASE_*` values are defined as empty strings. The app then runs device-only.

**Local verification** (the bundle was checked for the live Supabase host; only true/false was printed):

| Build | Live host in bundle |
|---|---|
| `VERCEL_ENV=preview`, with the live variables present | **No** ✓ |
| `VERCEL_ENV=preview` + `GE_PREVIEW_CLOUD=on` | Yes (opt-in, as intended) |
| Local build (control) | Yes |
| `VERCEL_ENV=production` (control; Vercel has no production variables) | Yes, locally |

**Still unverified:**
- The deployed Preview was built before this guard.
- Isolation becomes provable only after this change is pushed and a Preview is built. Even then, the bundle can only be checked through a login or bypass, so the check needs the user.

**PREVIEW SAFETY: UNVERIFIED.**

**Manual steps to resolve (any one):**
1. **Recommended:** in Vercel → Project `great-empower-app` → Settings → Environment Variables, delete both variables, or blank them for Preview on this branch.
2. Or point them at a **separate non-production** Supabase project, and set `GE_PREVIEW_CLOUD=on` for Preview.
3. Then authorise a push and, signed in to Vercel, open the Preview. In DevTools → Network, confirm there are no `*.supabase.co` requests after signing in with the Demo Account.

## Rewards
- **Reward detail** (`ProductDetail`):
  - New "Can I redeem it now?" panel: "You can redeem this now" or "N pts to go", the balance compared with the price, and a progress bar.
  - A three-step "what happens after" strip:
    - **Food:** redeem → pass in Wallet → show the pass when you collect.
    - **Vouchers:** redeem → saved in Wallet → for a future insurance purchase.
  - Existing terms, price options and balance-after are unchanged.
- **Confirmation:** the "Redeemed" screen now shows **Points used (−N)** and **Balance now** side by side, plus the existing next actions (View wallet / Keep browsing). Food items still go straight to their pass.
- **Duplicate prevention:** the existing ref guard and request ID are kept. A new Playwright test **double-clicks Confirm**:
  - the balance drops by exactly 1,000;
  - revisiting the voucher then shows "Already in your wallet" (disabled).

  It passed at 390 and 1280 px.
- **Wallet / voucher details:** unchanged from the earlier phase (illustrated empty states, code, "Saved for later"). The pass view already shows a barcode, code and download.
- **Untouched:** the rewards engine, security, catalogue and codes. No invented items, codes or expiry dates.

## Learn (visual audit)

| Asset group | Finding | Decision |
|---|---|---|
| Hero photo (library) | Relevant | Keep |
| Video posters | Supplied explainers; one shows "$7,899.50" (not RM) | Keep (supplied media); logged |
| Infographic thumbnails | CI/PA are landscape inside portrait frames | Logged (P2); needs title-card artwork |
| Topic cards (3D renders) | Style differs from the flat icon and illustration system | **Supplied illustrations** (marked so in the code): replacing them is an owner decision, not autonomous. Logged. |
| Lesson glyphs | Consistent | Keep |

**Discovery:** already addressed (Continue learning, the next-lesson card, format tabs, Home's next-step path). No change this phase.

## Home: CTA consolidation
- **Problem:** the hero's "Continue learning" repeated step 1 of "Your next step".
- **Change:** hero slide 1 now explains the product ("Understand protection, check your cover and compare real options — at your own pace.") with a distinct CTA, **"Explore protection"**, which opens Protect.
- "Your next step" remains the **single progress-based primary action**, highlighting the first unfinished step.
- The first label, "See how protection works", wrapped onto two lines at 390 px and was shortened (screenshots inspected at 375 and 390 px).

## Simulators

| Tool | Inputs | Decision |
|---|---|---|
| Family | 9 money fields + years | Guided 3 steps (previous phase) |
| Medical bill | 2 controls | No steps: low load already |
| Critical-illness runway | 3 amounts + a years slider | No steps: short form with a live result |

No calculation code changed. The Family example still gives RM 40,000 / RM 44,000 (test), and the bill splitter reconciles in every combination (unit test).

## Global UI polish
- **Text size:** QA warnings stayed at **0** on all 28 routes × 5 widths (no text under 12 px, no clipping, no heading skips, no covered focus).
- **Hero button:** no longer wraps at 375 px.

## Screenshots (opened and inspected this phase)
- `.qa/shots/390/reward-food.jpg`
- `.qa/shots/390/reward-voucher.jpg`
- `.qa/shots/390/home.jpg`
- `.qa/shots/375/home.jpg` (after the fix)

These are local and gitignored; regenerate with `pnpm qa:ui`. Earlier phases' inspections are listed in their own reports.

## Visual QA and iteration history
1. **Reward detail (food, voucher) at 390 px:** answers what, how much, can I, and what next. No issues.
2. **Home at 390 px:** CTA wrapped → shortened → re-shot at 375 px: fits on one line.
3. **Visual regression:** 12/12 without a refresh. The changed hero is inside the masked carousel, and reward details have no baseline.

## Automated testing (actual results)

| Check | Result |
|---|---|
| `npx tsc -b` | Pass |
| `pnpm test` | **196/196** |
| `pnpm build` | Pass (chunk-size warning) |
| `pnpm qa:ui`: 28 routes × 375/390/768/1280/1440 = **140 checks** | **0 failures, 0 warnings** |
| Playwright smoke + interactions + axe | **218 passed, 0 failed** (117 skipped by design) |
| `pnpm qa:visual` | **12/12** |
| Console errors / failed requests / Supabase requests / broken images | **0 / 0 / 0 / 0** |

**Failures during the phase (fixed):** two bugs in the new redemption test itself. It navigated to the same hash, and it read a header label that only exists on mobile.

## Accessibility
- axe WCAG 2.2 AA at 390 and 1280 px on every route: 0 serious or critical issues.
- Keyboard focus is visible and never covered.
- New UI uses semantic `dl`/`ol`, `aria-pressed` and live regions as before.

## Responsive testing
5 widths × 28 routes, with no overflow, clipping or off-screen content.

## Files changed this phase (uncommitted)
- `vite.config.ts` (Preview device-only guard)
- `src/app/RewardsView.tsx` (detail status panel, next steps, confirmation summary)
- `src/app/home/FeaturedHero.tsx`, `src/app/HomeDashboard.tsx` (CTA consolidation, unused code removed)
- `scripts/qa/routes.mjs` (+2 reward detail routes)
- `tests/e2e/interactions.spec.ts` (+ redemption/duplicate test)
- `tests/e2e/__screenshots__/**` (4 PNGs re-written by `--update-snapshots=all`; the comparison passed without changes)
- `docs/reports/GREAT-EMPOWER-FINAL-FINISHING-AND-SECURITY-REPORT.md` (this file)
- `docs/reports/GREAT-EMPOWER-UI-REDESIGN-AND-IMPLEMENTATION-REPORT.md` (addendum)

## Git status and security
- **Branch:** `redesign/overnight-product-refresh`. HEAD and the remote are both at `c983d7e`.
- **This phase:** 10 modified files, **not committed, not pushed**.
- **Untracked:** the 6 protected `public/advisor/*` portraits (untouched).
- **Protected paths:** 0 changes in `public/advisor`, `src/calculation-engine`, `src/rewards`, `src/account`, `supabase` and `.env*`.
- **Secret scan of the diff:** 0 matches for JWT, `sb_secret`, `service_role`, `supabase.co` hosts or private keys.
- **Tracked env and build files:** only `.env.example`. No `dist/` or `.qa/` tracked.
- **Clean-up:** scratch files holding the (encrypted) Vercel variable responses were deleted.
- **No:** Vercel changes, bypass tokens, deployments, migrations or live-data actions. The original worktree is untouched.

## Remaining issues
1. **Preview safety: UNVERIFIED.** Push the guard (authorisation needed), or apply the manual steps above, then confirm in the Preview.
2. **Learn assets:** infographic title cards; a decision on replacing the supplied 3D topic art; the "$" in one supplied video poster.
3. **Not tested:** real devices, screen readers, 200% zoom.
4. **Performance:** main JS chunk over 500 kB (route-level code splitting).

## Final recommendation
**PARTIAL.** The app is in a consistent, tested state. Before sharing the Preview more widely, either authorise pushing this guard and verify it, or remove the Preview Supabase variables in Vercel.
