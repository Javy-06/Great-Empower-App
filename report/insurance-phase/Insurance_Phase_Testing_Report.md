# Insurance Protection Experience — Testing Report

Everything here was actually run on 2026-11-27 (Windows 11, Node v22.23.5). The rewards-phase suites and live checks were **not** rerun, as instructed, because no rewards, database or migration code changed. The app suite still includes the rewards unit tests.

## 1. Summary
| Check | Command | Result |
|---|---|---|
| All app unit tests | `node --experimental-strip-types --test $(find src -name "*.test.ts")` | **191 / 191 pass** (was 176; +8 Engine 3, +7 protection data) |
| Engine 2 (frozen) | included above | **69 / 69 pass**, with **no diff** to `engine-2.ts` or `src/app/medical-claim/*` |
| Typecheck | `npx tsc -b` | **Pass** |
| Production build | `npm run build` | **Pass**, about 1.8 s (only the existing chunk-size warning) |
| Device-only build for E2E | `VITE_SUPABASE_URL= VITE_SUPABASE_PUBLISHABLE_KEY= npx vite build --outDir <scratch>/dist-local` | **Pass**. The bundle contains no project reference. |
| Browser E2E | headless Chrome against `vite preview` of the device-only build | **All checks pass, 0 console errors and 0 warnings** |
| Product data cross-check | script comparing `src/data/protection.ts` with `product-master.json` (read-only) | **All match** (names, issuers, contract basis, VERIFIED_OFFICIAL status) |
| Lint | — | No linter is configured in the repo (unchanged, known) |

## 2. New unit tests
**`src/calculation-engine/engine-3.test.ts` (8):**
- The V2 worked persona reproduces RM69,000 need, RM44,000 gap and 36.2%. The printed-formula variant gives RM65,000, RM40,000 and 38.5%.
- κ (the share of employer cover counted) applies as a portion, rounded half-up to the sen (50.5 sen → 51, 1.5 → 2, 0.49 → 0).
- Gaps are floored at zero. Ratios are uncapped (200.0%). Zero or negative need gives 100%.
- Every step has its formula and working, and the "doesn't cancel debts" assumption is present.
- Invalid input returns errors field by field: negatives, years over 40, κ over 100, fractions, NaN and oversize amounts.
- CI runway: RM3,000 × 12 × 3 = RM108,000; cover RM50,000 + 50% × RM20,000 = RM60,000; gap RM48,000; ratio 55.6%. Over-covered and zero-income cases are checked.
- CI years are limited to 1–5 (0, 6 and 2.5 are rejected). Payout and lump-sum assumptions are disclosed.
- Formatting helpers.

**`src/data/protection.test.ts` (7):**
- Five categories, each with official and purpose names.
- The required distinctions exist: Life ≠ debt cancellation, CI ≠ income replacement, Medical ≠ all expenses covered.
- Infographics, scenario links and sources resolve, and every Malaysia fact has a source.
- The products are exactly the 8 verified ones plus 1 notice (8 + 34 = 42).
- Product sources come only from official Great Eastern domains. GETB records are takaful.
- No price, ranking or purchase wording. The 236.19 illustration is absent.
- No checkout or quote wording anywhere in the feature's source files.

## 3. Browser E2E (390 × 844 mobile, plus 1280 × 900 desktop)
**Navigation**
- The Learn home card opens `#app/learn/protection`.
- The hub has one H1, five categories in order, the "coverage ≠ zero out-of-pocket" section, the research note (8 verified, 34 withheld) and the not-affiliated notice.

**Each of the five category pages**
- The correct purpose H1 and official category.
- Exactly one H1.
- The "is not the same as" statement reads correctly to screen readers (for example "Life insurance is not the same as Debt cancellation").
- The expected products.
- Every external link has `rel=noreferrer`.
- No horizontal overflow at 390 px or 1280 px.

**Routing**
- An unknown category falls back to the hub.

**Simulate deep links**
- From the CI page, "Try the recovery runway scenario" opens Needs with the CI tool at the top of the screen (154 px).
- Changing the hash while Simulate is already open also works (160 px).

**CI tool**
- Empty state shown first.
- The example gives **RM58,000**.
- The κ slider is hidden until employer cover is entered.
- With RM20,000 employer cover at 50%, the gap is **RM48,000**, with all three steps shown.

**Family tool**
- The example gives **RM40,000 / RM44,000** with **38.5% / 36.2%**.
- The "Parents · 5y" preset is pressed.
- Clearing one field returns to the empty state, so a blank is never treated as zero.

**Accessibility and regression**
- Category links are native buttons and take focus.
- The medical bill simulator and emergency fund are unchanged.
- The protection topic page links to the hub.
- The infographic quiz page still works.
- Rewards, Analyze and Guide render.

**Console:** no errors or warnings.

**Screens reviewed visually:** hub, Critical Illness and TPD category pages (mobile), Medical category (desktop) and the CI tool. Two fixes followed:
- Landscape infographic thumbnails were cropping badly.
- An unclear heading was reworded.

## 4. Issues found during testing (all fixed)
| Issue | Fix |
|---|---|
| The "≠" sign was announced without words by screen readers | Hid the sign from screen readers and added hidden text " is not the same as " |
| A deep link didn't open the tool when Simulate was already mounted | Added a `hashchange` handler in `SimulateHub` |
| Landscape infographic thumbnails were cropped badly | The thumbnail shape now follows the image's orientation |
| The first E2E run used a build that had the Supabase settings from `.env.local`, so signing into the Demo Account created **one anonymous demo account in the live project** (2026-11-26 19:20 UTC) | All later runs used a device-only build. The account was **not deleted**, because deleting is destructive and needs your approval. Live balances were checked read-only afterwards: 32 profiles, 0 mismatches. |
| A "Multiple GoTrueClient instances" warning appeared during cloud sign-in in that run | It comes from the existing account layer, not this feature, and doesn't occur in the device-only build. Noted for later. |

## 5. Not run
- Rewards database and live suites: unchanged scope, rerun not required.
- Live Preview deployment check: no deployment was made.
