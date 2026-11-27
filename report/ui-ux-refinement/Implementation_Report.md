# Implementation Report

Legend: **Implemented** = in code · **Tested** = exercised in browser or unit tests · **Not done** = deliberately deferred.

## 1. Protection explained (P0) — Implemented, Tested
**`src/app/protection/ProtectionHub.tsx`** (rewritten), **`src/data/protection.ts`** (+`event`, `problem` per category).

| Section | Before | After |
|---|---|---|
| Hero | Long intro sentence | "A bad day shouldn't wreck your finances." plus a six-word subline |
| Big picture | — | Four-step icon flow: You → Something happens → Costs hit → Protection helps |
| Categories | Text list plus a "two names" explainer card | **Risk-to-cover rows:** event icon, event, the financial problem (red arrow), cover purpose (teal shield) and official name on wider screens. Tap to explore. The two-names idea becomes a one-line legend. |
| Savings vs insurance vs investing | Three paragraph cards | **Comparison grid:** three tool headers plus four ✓/✗/– rows. Uses ARIA table roles; columns aligned at all widths. |
| Medical insurance | Abstract four-colour bar | **Stepped bill:** RM12,000, minus not covered RM600, deductible RM500 and co-payment 10% RM1,090. Insurer RM9,810, you RM2,190. Stacked bar, "illustrative" caption, link to the simulator. |
| Before you buy | Six text items | **Eight icon questions.** Tap for a one-line answer (`aria-expanded`, live region). Honesty callout with source; free-look line with source. |
| Channels | Two cards plus a three-item note list | **Three tiles:** online direct, agent or adviser, employer. Regulatory detail sits in "Good to know". |
| Safety nets | Two cards | Two compact link rows (FMOS, PIDM) |
| Research note and disclaimers | Navy card plus a repeated disclaimer | One caption line. The global footer carries the general notice. |

**Category pages (all five, same structure):**
- **Hero:** includes the "A ≠ B" key idea.
- **At a glance:** bulleted ✓ / ✗ panels on teal and crimson tints.
- **Example:** a compact story strip.
- **Myth or fact?:** tap-to-reveal (`details`).
- **Learn and try:** the visual guide and simulator CTA side by side.
- **Collapsed by default:** In Malaysia, Products (one line each, expanding to verified facts) and Sources.
- **Footer:** one disclaimer line.

**Content:** no facts were removed. They were reordered and collapsed. Category texts, product facts and sources are unchanged from the verified data.

## 2. Simulate (P1) — Implemented, Tested
`src/app/SimulateHub.tsx`:
- **Needs step:** "Pick a tool" tab switcher (ARIA `tablist`, `tab`, `tabpanel`; arrow keys; roving tab index).
- **One tool visible.** The others stay mounted, so inputs survive switching (tested).
- **Deep links** `#app/simulate/needs/<tool>` select the tab and scroll to the switcher.
- The scroll-only tool index was removed. A one-line hint plus a "learn about" link sits per tool.
- **Calculators, Engine 2 and Engine 3: unchanged.**

## 3. Analyze (P1) — Implemented, Tested
`src/app/AnalyzeView.tsx`:
- Assessed areas keep their cards.
- Not-assessed areas collapse into **one** panel with four icon chips.
- The single CTA is the profile card's "Start/Complete your profile". Before, it was repeated four times.
- The assessment rules are unchanged.

## 4. Home (P2) — Implemented, Tested
`src/app/HomeDashboard.tsx`:
- **Quick Actions removed** (they duplicated the bottom and top navigation).
- **"Start here — Five risks, five kinds of cover":** five tappable category icons with one-word labels, plus a "Protection explained" button.
- The unused `onNavigate` prop was removed.

## 5. Rewards (P2) — Implemented (UI text and layout only), Tested
`src/app/RewardsView.tsx`:
- The hub shows **4** food items with "All 10 items" (the existing marketplace route).
- The fictional-items note now covers **points** ("no cash value").
- **No Rewards logic, economy, store or server code changed.** The device-only Rewards regression passes unchanged.

## 6. Global
- **Footer:** "Independent financial protection education for young Malaysians. Not financial advice, and not an official product of, or endorsed by, any insurer. Examples are illustrative." The About link was removed.
- **News articles:** the source caveat from About moved here.

## 7. Not done (deferred, documented)
- **Learn home** (4.9 screens) still lists lessons as topic cards and as a full list. The topic cards were a recent owner-approved design, so they were left in place (P2).
- **Guide, lessons, wallet:** already short, so no change.
- **No new imagery** (by plan).

## Files changed (code)
| Area | Files |
|---|---|
| Protection | `src/app/protection/ProtectionHub.tsx`, `src/data/protection.ts` |
| Simulate | `src/app/SimulateHub.tsx` |
| Analyze | `src/app/AnalyzeView.tsx` |
| Home | `src/app/HomeDashboard.tsx` |
| Rewards | `src/app/RewardsView.tsx` |
| News | `src/app/news/NewsArticle.tsx` |
| App shell | `src/App.tsx`, `src/app/ApplicationApp.tsx` |
| Pruned of viewer-only exports | `src/components/nav/AppHeader.tsx`, `src/components/cards/SimulateCards.tsx`, `src/components/cards/LearnCards.tsx` |
| Deleted | See `Removed_Features_Report.md` |
