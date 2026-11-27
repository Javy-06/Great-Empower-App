# GREAT EMPOWER: Release Candidate audit

**Date:** 27 November 2026
**Auditor:** Claude (in-session, device-only)
**Branch:** `redesign/overnight-product-refresh`

## Executive summary
GREAT EMPOWER is a coherent, well-tested educational app. Every automated gate is green:
- 196 unit tests;
- 220 Playwright tests (routes, interactions, accessibility);
- 140 responsive checks with 0 failures and 0 warnings;
- 12/12 visual regression;
- 0 console errors, failed requests or Supabase requests in device-only mode.

This audit fixed one measurable issue: main bundle −36% through route-level code splitting. It added two safety tests and build-log evidence for the Preview guard.

The biggest open item is the **deployment isolation of the Preview**. It is addressed in code and evidenced in the build log after the push (see §Deployment security), but the deployed bundle itself can't be inspected without a login.

## Overall status: PASS WITH LIMITATIONS

| Readiness level | Verdict |
|---|---|
| **Hackathon demo** (device-only, local or Preview) | **READY** |
| **Controlled user testing** (3–5 people, device-only, moderated) | **READY**, after the small test-plan update in §User testing |
| **Release Candidate** | **READY WITH LIMITATIONS:** Preview isolation evidence is indirect; no real-device or screen-reader pass yet |
| **Public production** | **NOT READY:** needs verified backend isolation, real-device/AT testing, a content review by a licensed professional, and a production deployment review |

## Git and worktree safety
- **Verified before work:**
  - worktree `GREAT-EMPOWER-redesign`, branch `redesign/overnight-product-refresh`;
  - HEAD equal to the remote at `c983d7e`;
  - original worktree HEAD unchanged (`03c53ae`), never written to.
- **Untouched:** `public/advisor/*` (6 untracked portraits, never staged), Engine 2 (`src/calculation-engine`), `src/rewards`, `src/account`, `supabase/`.
- **Diff:** scanned for secrets (JWT, `sb_*` keys, `service_role`, `*.supabase.co`, private keys). 0 matches.
- **Committed and pushed** on the user's explicit instruction ("commit and push to preview website"). The audit brief itself said not to commit; the user's direct instruction was followed.

## Deployment security
| Check (local, build-level) | Result |
|---|---|
| Guard present in `vite.config.ts` | Yes: `VERCEL_ENV=preview` and `GE_PREVIEW_CLOUD` ≠ `on` → both `VITE_SUPABASE_*` defined as `""` |
| Preview-mode build with the live variables present | **0** `*.supabase.co` hosts, **0** JWT-like strings, **0** `sb_` keys in the bundle |
| Opt-in flag | `GE_PREVIEW_CLOUD` is unset locally and **not set in Vercel** (only 2 project variables exist) |
| Device-only behaviour | 0 Supabase requests on 28 routes × 5 widths, including Demo sign-in, quizzes and redemption |
| The cloud chunk | Present in the bundle as library code, never loaded when cloud isn't configured (`session.ts` loads it lazily) |

**Live Preview:** see "Post-push verification" at the end of this report.

## Security audit
| Area | Finding | Status |
|---|---|---|
| Secrets in source or bundle | None. Only `.env.example` (placeholders) is tracked. | PASS |
| External network | Only official links (BNM, PIDM, FMOS, insurer pages, news) plus Pexels photo credits. No telemetry, no `fetch` outside the Supabase client. | PASS |
| External links | All `target="_blank"` links have `rel="noopener noreferrer"` (one grep hit was a multi-line false positive) | PASS |
| Dangerous code | No `eval`, `new Function` or `dangerouslySetInnerHTML` | PASS |
| Local storage | Device-only accounts, progress and rewards are stored in `localStorage` (by design; no secrets, no PII beyond a display name). Anyone with the device can read or alter them, which is acceptable for demo points with no cash value. | ACCEPTED (by design) |
| Duplicate redemption | Ref guard plus request ID; test double-clicks Confirm and sees exactly one deduction, then "Already in your wallet" | PASS |
| Insufficient balance | New test: a 5,000-pt voucher shows "N pts to go" and a disabled "Not enough points (… short)" | PASS |
| Client-side trust | In device-only mode, points live on the client (no value). Cloud mode's server-side grading and redemption are unchanged and frozen. | ACCEPTED |

## Functional audit
**Method:** Playwright journeys in device-only mode, plus the QA runner over every route at 5 widths and screenshot inspection in this and earlier phases.

**Home**
- **Verified:** the hero states what the app does, with the CTA "Explore protection" → Protect. "Your next step" highlights the first unfinished step (test), and the products link works (test).
- **Not found:** dead links or misleading claims.

**Learn**
- **Verified:**
  - format tabs work, including arrow keys (test);
  - Continue learning opens the next lesson;
  - the video, infographic and lesson routes render with no broken images;
  - quizzes award once (earlier phases).
- **Content issue:** one supplied video poster shows "$7,899.50" (P2).

**Protect**
- **Verified:**
  - the hub's journey, gaps, five kinds of cover, products link and application information;
  - category navigation (test);
  - the product filter, compare (max 3) and gap labels (test);
  - official links open in a new tab.
- **Application pathway:** read from official wording (unit-tested).
- **Neutrality:** no ranking, prices or "best" wording (unit test plus grep).

**Simulate**
- **Family guided steps:** gated Next; the example gives **RM 40,000 / RM 44,000** (test; values consistent with earlier verified engine runs).
- **Bill splitter:** reconciles for every bill size × deductible × co-pay combination, plus an edge case where the deductible exceeds the bill (unit test). Worked RM20,000 example: RM1,000 + RM500 + RM1,850 + RM16,650 = RM20,000 ✓.
- **CI timeline:** RM60,000 − 12 × RM3,000 = RM24,000 ✓.
- **Accident:** 10% × RM50,000 = RM5,000 ✓.
- **Engines:** Engine 2 (69 tests) and Engine 3 (9 tests) unchanged.

**Rewards**
- **Verified:**
  - balance card;
  - challenges with claim;
  - welcome price;
  - detail status panel;
  - redemption confirmation (points used, balance now);
  - Wallet empty states;
  - duplicate and insufficient-balance handling (tests).
- **Reset:** device-only reset works through the demo account (earlier phases). Not re-tested here.

**Guide**
- **Verified:** hub, search, the article, checklist and sessions routes (QA runner: one H1, no overflow, no console errors). Featured carousel dots meet 44 px.

## UX audit (independent)
| Finding | Severity | Recommendation |
|---|---|---|
| **The "Check" step leaves Protect:** step 1 ("Check") opens the Simulate profile, a different tab. A first-time user may not expect the context switch. | P2 | Owner decision: host the profile form inside Protect (a larger change; uses the same `profileStore`) |
| **Two "protection" entry points:** "Protect" (tab) and "Protection explained" (Learn) have similar names and partly overlapping content | P2 | Owner decision: rename the Learn hub "How protection works", or fold it into Protect |
| **Products under the Learn tab:** the product explorer lives at `#app/learn/protection/products`, so the **Learn** tab is highlighted when it's reached from Protect | P3 | Move the route under Protect (`#app/protect/products`) with the old route kept as an alias |
| 10-second test | — | The hero line plus "Your next step" answers "what is this / what do I do" quickly |
| Text density | — | Acceptable after the cover cards, tabs and stories; the longest pages are the categories (by design: facts plus disclosure) |
| Neutral and learning-first | — | Products are unranked, figures labelled illustrative, and no buying CTA |

## Visual and responsive audit
**Checked:** 28 routes × 375/390/768/1280/1440 px:
- 0 overflow, clipping or off-screen content;
- 0 broken images;
- 0 text under 12 px;
- 0 heading skips;
- 0 focus-covered warnings.

**Screenshots inspected** across phases (paths in the earlier reports). This audit didn't redesign anything.

## Accessibility
- **axe** (WCAG 2.2 A/AA) on every route at 390 and 1280 px: 0 serious or critical issues.
- **Runner:** every control named, every field labelled, focus visible on the first 12 Tab stops, targets ≥ 24 px.
- **Tabs:** term, format and tool tabs use arrow keys.
- **Not tested:** real screen readers (NVDA, VoiceOver, TalkBack), real mobile assistive tech, 200% zoom, real devices. Automated results ≠ full compliance.

## Performance
| | Before | After |
|---|---|---|
| Main JS chunk | 723 KB (197 KB gz) | **433 KB (126 KB gz), −36% gz** |
| JS chunks | 2 | 15 (each destination loads on first visit) |
| Vite > 500 kB warning | Yes | **No** |

**Change:** `React.lazy` for Learn, Simulate, Protect, Guide, Rewards, Notifications and the game shell, with a `RouteLoading` skeleton (reserves the hero, `aria-busy`). Home stays eager.

**Risk check:** all 220 Playwright tests and 140 responsive checks pass after the change.

**Not changed:** the Supabase chunk (222 KB, already lazy) and images (already WebP).

## Insurance content and compliance
| Check | Result |
|---|---|
| Currency | No "$" amounts in code or data; all amounts are RM. **Exception:** one supplied video poster frame ("$7,899.50"), P2. |
| Guarantee wording | Only "Guarantee Letter" (correct Malaysian terminology), negations ("may not be guaranteed") and myth statements. No coverage promises. |
| Products | Only the 8 products with officially verified facts; each fact carries its source; gaps show "Not in verified sources". Data checked 27 Nov 2026, **re-verification needed before any public release**. |
| Application pathways | Read from the official wording per product. GREAT EMPOWER states it doesn't sell, take applications or collect medical data. |
| Disclaimers | Footer on every page; "Illustrative" on every worked figure; "not advice, a quote or a promise of cover" on category pages |
| Unverified | Whether any listed product is currently open to new applicants (most product pages don't say). It's shown as "Still to confirm". |

## Hackathon demo readiness
- The pitch fits in 30 seconds.
- Interactive moments are strong: the bill slider, term diagrams, the guided family tool and product compare.
- It feels like a product rather than an insurer site: neutral, learning-first, with rewards.

**Failure points and recovery:**
- **Preview login (SSO):** run locally (`pnpm qa:ui` builds `.qa/dist`; or `pnpm dev`).
- **Network loss:** the app works offline once loaded in device-only mode, except the videos.

## Recommended 3–5 minute demo script
| Time | Click / screen | Say |
|---|---|---|
| 0:00–0:30 | Home (hero) | "Most young Malaysians don't know what their cover does — or doesn't. GREAT EMPOWER makes protection understandable, then helps you check and compare." |
| 0:30–1:00 | **Your next step** card → point at the 3 steps | "The app always shows one next step, based on your progress." |
| 1:00–1:50 | Protect tab → **Five kinds of cover** → Medical → **Who pays a hospital bill?** Drag RM20,000 → 40,000; switch the deductible to RM1,000 | "Having insurance doesn't mean a zero bill. Here's exactly who pays what — illustrative, but it adds up." |
| 1:50–2:20 | Same page → **What you pay, and when** → Annual limit tab | "Jargon becomes a picture: deductible, co-pay, annual limit, waiting period." |
| 2:20–3:10 | Simulate → Family → **Fill in the research example** | "A guided 3-step check. The result separates what savings cover from what cover is still needed." |
| 3:10–3:50 | Protect → **Explore and compare products** → add 2 medical products | "Real products, facts verified from official documents, side by side. No ranking, no selling." |
| 3:50–4:30 | Rewards → points card → a food item → Redeem → Confirm | "Learning earns points; redeeming is instant, and double-taps can't spend twice." |
| 4:30–5:00 | Back to Home | "Next: user testing with 3–5 young adults, then a verified backend." |

**Fallbacks:**
- If a video stalls, skip Learn.
- If the Preview SSO blocks access, use the local build.
- Rewards state can be reset by creating a new demo account.

## User testing readiness
**The existing plan is good:** `report/preview-validation/Youth_User_Test_Plan.md` covers consent, no-PII rules, notes-only by default, think-aloud, 30–40 minutes and 9 tasks with success criteria.

**Recommended updates for the current build:**
1. Task 1 wording: "What it may help with" → "May help with".
2. Add: "From Home, what is your next step and why?" Success: names the highlighted step.
3. Add: "Compare two medical products — which facts are missing?" Success: spots "Not in verified sources".
4. Add: "Use the hospital bill tool: what would you pay on a RM20,000 bill?" Success: reads "You pay".
5. Note the Protect/Simulate context switch (UX P2) as an observation point.

## Issues found
| ID | Sev | Description | Evidence | Impact | Fix | Status |
|---|---|---|---|---|---|---|
| A1 | P0 (process) | Preview isolation not independently provable: the Vercel variables are encrypted in the API, and the deployed files can't be read without a login | API `decrypted:false`; file tree 404 | A live-connected Preview could write real data | Code guard (earlier) + build-log evidence (this audit); the owner can blank the variables | **Mitigated; see Post-push verification** |
| A2 | P2 | Main bundle 723 KB | Vite warning | Slower first load on mobile data | Route-level lazy loading | **Fixed** (−36% gz) |
| A3 | P2 | "Check" step switches to the Simulate tab | Protect → step 1 | Possible confusion | Host the profile in Protect | **Owner decision** |
| A4 | P2 | "Protect" vs "Protection explained" naming overlap | Nav + Learn card | Possible confusion | Rename or merge | **Owner decision** |
| A5 | P2 | Supplied video poster shows "$" | `.qa/shots/390/video.jpg` | Currency inconsistency | Replace the poster frame | **Owner decision (supplied media)** |
| A6 | P2 | Supplied 3D topic art differs in style | Learn topic cards | Visual inconsistency | Replace the art | **Owner decision** |
| A7 | P3 | Learn tab highlighted on the product explorer reached from Protect | Route under `/learn` | Minor wayfinding | Move the route under Protect, keeping an alias | **Owner decision** (changes the URL scheme) |
| A8 | P3 | User-test plan predates the new features | Plan tasks | Gaps in coverage | Plan updates above | **Recommended** |

**Totals:** 8 issues, 1 fixed, 1 mitigated, 6 for owner decision or recommendation.

## Fixes implemented
1. **Route-level code splitting** (`src/app/ApplicationApp.tsx`) with a `RouteLoading` skeleton.
2. **Build-log evidence for the Preview guard** (`vite.config.ts`; prints the environment name and the mode only, no values).
3. **Insufficient-balance test** (`tests/e2e/interactions.spec.ts`).

## Tests and validation results
| Check | Result |
|---|---|
| TypeScript | Pass |
| Unit tests | **196/196** |
| Build | Pass, **no chunk warning** |
| Responsive QA: 28 routes × 5 widths | **140 checks, 0 failures, 0 warnings** |
| Playwright smoke + interactions + axe | **220 passed, 0 failed** (120 skipped by design) |
| Visual regression | **12/12** |
| Console / failed requests / Supabase requests / broken images | **0 / 0 / 0 / 0** |
| Device-only Preview build scan | 0 Supabase hosts, 0 keys |

## Remaining limitations
- Real screen readers, real devices and 200% zoom: **not tested**.
- Product facts need re-verification before public use.
- The owner decisions in A3–A7.
- Visual baselines are Windows and Chrome specific.

## Production readiness assessment
**Not production ready.** Required before production:
1. A verified isolated (or intentionally production) backend with a security review.
2. Real-device and assistive-technology testing.
3. Licensed-professional review of insurance content.
4. Product data re-verification.
5. Analytics and consent policy.
6. Production deployment review.

## Release recommendation
| Use | Recommendation |
|---|---|
| Hackathon demo | **Go:** use the script above; run locally if the Preview SSO is in the way |
| Controlled user testing | **Go**, device-only, with the updated test plan |
| Release Candidate | **Go with limitations** (above) |
| Public production | **No-go** until the production checklist is done |

## Next steps
1. Owner: confirm the Preview isolation (blank the variables, or confirm the guard log below).
2. Decide A3, A4 and A7 (IA), and A5 and A6 (supplied media).
3. Run 3–5 user sessions.
4. Real-device and screen-reader pass.
5. Re-verify product facts.

## Post-push verification
_(Completed after the push; see below.)_
