# GREAT EMPOWER: final UI polish report (Rewards, Simulate, consistency)

**Date:** 27 November 2026
**Branch:** `redesign/overnight-product-refresh`
**Builds on:** `docs/reports/GREAT-EMPOWER-UI-REDESIGN-AND-IMPLEMENTATION-REPORT.md`

## Assessment: PARTIAL

The work done in this phase passed every automated check and was inspected by screenshot. Some brief items remain open (see "Remaining issues").

## 1. Rewards redesign (UI only; rewards engine, security logic and catalogue untouched)

| Element | Before | After |
|---|---|---|
| Points balance | Plain white box | **Membership-style card:** the balance plus two new lines, "N items you can redeem now" and "X pts to the next voucher" with a progress bar. These are computed for display only from the existing state and catalogue. |
| Browsing | Scroll to find categories | **Food & drinks / Wellness / Vouchers** shortcuts into the existing Marketplace filters |
| Welcome offer | Red "WELCOME 200" badge over every product photo | Shown once in the banner. Cards show **200 pts ~~1,200 pts~~ "Welcome price"** in the price line, and the photos are uncovered. Applies in the Marketplace too (P2 #9 resolved). |
| Challenges | Fixed order; long explainer | Ready-to-claim challenges sort first; the explainer is two short sentences |
| Wallet | (Earlier phase) illustrated empty states | Unchanged |
| Copy | — | "View all" no longer wraps beside the long vouchers heading |

**Not changed:** `src/rewards/*` (economy, store, catalogue, security), the redemption and checkout flow, and pass logic.

## 2. Simulate: guided Family scenario
- The nine money fields that were shown at once become **three steps:**
  1. Who relies on you (support, years).
  2. What would need paying (debts, liabilities, final expenses).
  3. What you already have (savings, own cover, employer cover, portability).
- **Progress:** "Step n of 3" with a progress bar.
- **Navigation:** Back and Next. Next is disabled until the step is complete, with the hint "Fill in every amount — enter 0 if none."
- **"So far" summary:** a running recap of the user's own inputs, e.g. "Support: RM400/month for 5 years". This is arithmetic on the inputs, not a new calculation.
- **Research example:** fills every step and jumps to step 3.
- **Engine 3 unchanged:** same inputs, same `calculateLifeGap` call. The Playwright test confirms the example still gives **RM 40,000 / RM 44,000**, the same values verified in earlier phases.

## 3. App-wide consistency
- **Readable text everywhere:**
  - the `--text-overline` token is now 12 px (was 11 px);
  - all 47 hard-coded `text-[10px]` and `text-[11px]` usages are now 12 px.
  - The QA runner's "text under 12px" warning went from **130 to 0** across 26 routes × 5 widths.
- **Layout widths** (earlier fix): `Container` widths apply everywhere.

## 4. Learn
Format tabs, the "next for you" focus and the desktop video layout were done in the previous phase (4.6 → 2.3 screens on mobile). This phase only applied the readable-text change to Learn. Thumbnail and discovery polish beyond that wasn't done (see "Remaining issues").

## 5. Visual QA (actually inspected)
**Iteration 1:**
- Rewards at 390 px: points card, shortcuts, inline welcome price, challenges. Found "View all" wrapping → fixed.
- Family scenario at 390 px: step 1 view, disabled Next and hint. No issues.

**Iteration 2:** fix applied, then the full gate re-run.

**Visual-regression diffs reviewed** (all intended): home, simulate, protection, medical, protect and rewards at 390 and 1280 px. They change because of the text-size increase and the redesigns.

**Screenshots:**
- `.qa/shots/<width>/<route>.jpg`, local and gitignored; regenerate with `pnpm qa:ui`.
- Baselines in `tests/e2e/__screenshots__/`.

## 6. Tests

| Command | Result |
|---|---|
| `npx tsc -b` | Pass |
| `pnpm test` | 196/196 |
| `pnpm build` | Pass (chunk-size warning, known) |
| `pnpm qa:ui` (26 routes × 375/390/768/1280/1440) | **Gate PASS: 0 failures, 0 warnings** |
| Playwright smoke + interactions + a11y | **202 passed**, 0 failed (new: Family guided-steps test) |
| `pnpm qa:visual` | 12 intended diffs → refreshed → 12/12 |
| Console / network / Supabase | 0 / 0 / 0 on every route and width |

## 7. Remaining issues
- **Simulate:** only the Family tool is stepped. The CI runway and medical tools are short already, but could get the same pattern.
- **Learn:**
  - infographic thumbnails are still small images rather than title cards;
  - topic cards still use 3D art (mixed illustration style, P2 #6).
- **Home:** the hero's "Continue learning" repeats step 1 of the next-step path.
- **Rewards:** the product detail and redemption confirmation screens were not redesigned (only the hub, Marketplace cards and Wallet).
- **Not tested:** real devices, screen readers, 200% zoom.
- **Deployment safety (unchanged):** the branch Preview's Supabase variables still point at the live project. Re-checked read-only before pushing; see Git.

## 8. Files changed this phase
- `src/index.css` (overline token)
- `src/app/RewardsView.tsx`
- `src/app/protection/ProtectionScenarios.tsx`
- 11 files with text size changes only: `HomeDashboard`, `LearnDashboard`, `LearnMedia`, `ProductExplorer`, `ProtectSections`, `ProtectionHub`, `TermExplainer`, `CategoryStories`, `NotificationsView`, `Badge`, and others
- `tests/e2e/interactions.spec.ts`
- `tests/e2e/__screenshots__/**`
- `docs/reports/*`

## 9. Git and safety
- **Untouched:** Engine 2, the rewards engine and security code, Supabase and account code, the advisor portraits, the original worktree, production and main.
- **No** migrations or live-data actions. Every QA run is device-only, with 0 Supabase requests.
- **Pushed on the user's explicit instruction** ("commit and push") in this phase.
- **Deployment safety is not resolved:** the Preview is still wired to live Supabase. Changing Vercel environment variables is outside what I'm allowed to do; the user needs to blank them.
