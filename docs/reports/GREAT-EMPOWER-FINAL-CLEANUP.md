# GREAT EMPOWER: final cleanup (owner decisions and safety)

**Date:** 27 November 2026
**Branch:** `redesign/overnight-product-refresh`
**Starting HEAD:** `997148b`. The brief expected `72d5a01`; `997148b` is the report-only commit pushed after it.

## Executive summary
**Status: PASS WITH LIMITATIONS.**

**Fixed:**
- **A5:** the "$7,899.50" video poster was replaced with a currency-free frame from the same video.
- **A4:** "Protection explained" is renamed "How protection works".
- The user-test plan is updated.
- The visual-regression flake was stabilised (test configuration only).

**Accepted for this release candidate** (owner decisions): A3, A6, A7.

**Unresolved (owner action in Vercel):** older Preview deployments built before the guard.

The product is now in **UI freeze**.

## Deployment safety
| Check | Result |
|---|---|
| Guard in `vite.config.ts` | Present: `VERCEL_ENV=preview` and `GE_PREVIEW_CLOUD` ≠ `on` → `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` defined as `""` → `cloudConfigured` is false (device-only) |
| Preview build with **dummy** values in the environment | Build log line `device-only build (Supabase disabled)`. Bundle: dummy URL 0, dummy key 0, live host 0, any `*.supabase.co` 0, JWT-like 0, `sb_` keys 0. |
| Preview build with the **live** `.env.local` values | Same: all 0 |
| Control build (no `VERCEL_ENV`) with dummy values | Dummy URL 1, dummy key 1. This proves the scan detects leaks and the guard is what removes them. |
| `GE_PREVIEW_CLOUD` | Not set locally; not among the project's Vercel variables |
| Device-only network | 0 Supabase requests across 28 routes × 5 widths and all Playwright journeys (Demo sign-in, quizzes, redemption) |
| Latest deployed Preview (`72d5a01`) | Vercel build log shows `VERCEL_ENV=preview → device-only build (Supabase disabled)` (previous audit) |

**Older Preview deployments: owner action required (not done by me; not authorised).**
- **Delete** the Preview deployments of this branch built **before `72d5a01`**. They were built without the guard and embed the live Supabase settings. Known examples:
  - `great-empower-erfxqsedw-javy8.vercel.app` (`c983d7e`);
  - `great-empower-e87qlkcql-javy8.vercel.app` (`6a8c9c3`);
  - `great-empower-il0y2cwm6-javy8.vercel.app` (`6b0f744`);
  - `great-empower-nhucqb40n-javy8.vercel.app` (`0d9d1e1`);
  - every earlier Preview of this branch.
- **Why:** anyone signed in to the Vercel team could open them, and signing in there writes to the live database.
- **How:**
  1. Vercel → `great-empower-app` → **Deployments**.
  2. Filter Branch = `redesign/overnight-product-refresh`.
  3. For each deployment older than `72d5a01`: **⋯ → Delete**.
- **Also recommended:** Settings → Environment Variables → delete `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` (Preview, this branch). The guard then becomes a second layer of protection rather than the only one.

## Changes made
**A5: currency poster**
- **Asset:** `public/media/learn/videos/how-insurance-works-in-malaysia-poster.webp`. A supplied poster that is a frame (about 3 s) of the quick-explainer video; used once (`src/data/learn-media.ts:112`).
- **The problem:** besides the large "$7,899.50" stamp, smaller "$" amounts appear on the invoice, so editing the image would have meant several retouches.
- **Fix:** replaced with the frame at **14 s** of the same video: an "INSURANCE POLICY" document captioned "shield in Malaysia.", 720×1280 WebP, 72 KB. It was chosen from 13 sampled frames, and the 41 s frame was avoided because it shows US-style banknotes.
- **No code change:** same path.
- **Not changed:** the video itself. Its opening seconds still show the "$" scene. That's supplied media; logged for the owner.

**A4: terminology**
- "Protection explained" → **"How protection works"** in 8 user-facing places: the Learn card heading, the Home five-risks button, the hub eyebrow, the category back link, the product explorer eyebrow and back label, and the Simulate key-terms link (plus one code comment).
- Routes are unchanged (`#app/learn/protection…`).
- 0 occurrences of the old title remain in `src/`.

**User-test plan** (`report/preview-validation/Youth_User_Test_Plan.md`, structure kept):
- Task 1 wording now says "May help with".
- **New task 10:** Home next step.
- **New task 11:** product comparison gaps.
- **New task 12:** RM20,000 hospital bill, "You pay".
- **New observation point:** the Protect → Simulate context switch (A3); don't guide unless the participant is stuck for 2 minutes.
- **Safety rules preserved:** 3–5 Malaysians aged 18–30, moderated, think-aloud, 30–40 minutes, notes by default, recording only with written consent, no NRIC, health, financial or policy data, example values only.

**Visual-regression stability** (test configuration only):
- **The flake:** occasional 110–200 px diffs on photo-heavy pages.
- **Changes:**
  - the visual spec now waits for every image to decode;
  - supplied infographic thumbnails are masked (their loading is still checked by the smoke tests);
  - the budget went from 100 → **300 px**.
- **Result:** 12/12 on **5 consecutive runs**, and the one-word negative check still fails at **725 px**.

## Accepted limitations (owner decisions)
| ID | Limitation | Decision |
|---|---|---|
| A3 | Protect's "Check" step opens the Simulate profile (a tab switch) | **Kept.** Validated in user testing (observation point added). The transition is labelled "Answer 8 questions"; no UI change proposed. |
| A6 | Supplied 3D topic art differs from the flat illustration system | **Accepted for this release candidate.** No replacement. |
| A7 | Product explorer lives under `/learn`, so the Learn tab is highlighted when it's reached from Protect | **Kept.** Minor wayfinding limitation. |

## Testing results
| Check | Result |
|---|---|
| TypeScript | Pass |
| Unit tests | **196/196** |
| Production build | Pass, no chunk warning; main chunk 433 KB (126 KB gz), unchanged |
| Playwright smoke + interactions + axe | **220 passed, 0 failed** (120 skipped by design) |
| Responsive QA (28 routes × 5 widths) | **140 checks, 0 failures, 0 warnings** |
| Accessibility (axe, every route at 390 and 1280 px) | 0 serious or critical issues |
| Visual regression | Intended diffs (renamed label) → refreshed → **12/12 × 5 runs** |
| Console / failed requests / Supabase requests / broken images | **0 / 0 / 0 / 0** |
| Protected paths (`public/advisor`, `src/calculation-engine`, `src/rewards`, `src/account`, `supabase`, `.env*`) | **0 changes** |

## Git safety
- **Branch:** `redesign/overnight-product-refresh`, worktree `GREAT-EMPOWER-redesign`.
- **Changed files:**
  - the poster WebP;
  - 5 UI files (label text only);
  - the user-test plan;
  - `playwright.config.ts` and `tests/e2e/visual.spec.ts`;
  - 12 visual baselines;
  - this report.
- **Committed and pushed** on the user's explicit instruction ("fix the owner-decision issues, then commit and push"). The brief said not to commit; the user's direct message was followed. The commit was gated on a clean secret scan.

## Release status
| Level | Status |
|---|---|
| Hackathon demo | **Ready** |
| Controlled user testing | **Ready** (updated plan) |
| Release Candidate | **Ready with limitations:** A3, A6, A7, the old Previews, no real-device or screen-reader pass |
| Public production | **Not ready** |

## UI freeze and backlog
No further redesign. Backlog for after user testing:
- Profile check hosted inside Protect (A3).
- Flat topic artwork (A6).
- Product route under Protect (A7).
- Replace the video's "$" opening scene (supplied media).
- Infographic title-card thumbnails.
- Real-device and screen-reader pass.
- Re-verification of product facts.
