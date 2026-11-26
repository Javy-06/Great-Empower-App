# Preview Testing Report

**Deployment URL tested:** none. A Vercel Preview with sign-in isn't isolated (see `Preview_Safety_Audit.md`). The same validation ran on a **device-only production build** (`vite build` with empty Supabase variables) served by `vite preview`, in headless Chrome, on 2026-11-27.

**Existing auto-built Preview (not tested):** `great-empower-45s1freb8-javy8.vercel.app` (commit `6fd6f5b`) is READY and requires Vercel login. Pushing this phase builds a new one automatically.

## 1. Device sizes and pages
- **Sizes:** 375 × 900, 390 × 900, 1280 × 900, 1440 × 900.
- **17 routes each (68 combinations):**
  - Home, Learn, Protection hub and all 5 categories
  - Simulate and Simulate Needs
  - Analyze, Guide, Rewards, Rewards wallet
  - a video lesson, an infographic, About

| Check | Result |
|---|---|
| Horizontal overflow | **0 px on all 68** |
| Broken images (complete with naturalWidth 0) | **None** (checked at 390 and 1280) |
| Exactly one H1 per page | **Yes** (all 17 routes at 390) |
| Console errors or warnings | **None** |
| Failed network requests | **None** |
| HTTP responses ≥ 400 | **None** |
| Git LFS media | The video lesson loads its MP4 (duration 88 s). All images load. |

## 2. Flows
| Flow | Result |
|---|---|
| Authentication | Welcome screen shown. The Demo Account signs in **device-only** (no `ge-sb-*` session keys), so nothing is written to Supabase. |
| Learn → Protection explained | Five categories in order: Medical Expense, Critical Illness Recovery, Family Financial, Income, Accident |
| Research note | "8 products, checked 27 November 2026." |
| Products per category | Medical 6 (incl. notice), CI 1, Life 1, TPD 1, PA 1 |
| External links | 19 unique source links, all `target=_blank rel=noreferrer` |
| Link check (scripted GET) | **17 × 200; 2 × 403** (`bnm.gov.my/mhit`, `bnm.gov.my/-/direct-distribution…`). Both loaded normally through the fetch tool the same day, so the 403s are BNM's bot protection against scripts, not broken links. |
| Internal links | `#app/about` on protection pages; scenario deep links tested below |
| Simulator deep links | `#app/simulate/needs/tool-family` and `tool-ci` open Needs with the tool in view |
| Family Protection | Empty until every amount **and** the years are chosen. Result RM40,000 / RM44,000. Zero-gap message. Huge values wrap. Too-large error. |
| CI Recovery | Example RM58,000. Zero income gives RM0 with the zero-gap message. "Not a quote" footnote present. |
| Medical bill simulator, Emergency fund | Present and unchanged |
| Rewards, Analyze, Guide | Render; no overflow or errors |

## 3. UI defects
- **Found and fixed this phase:** a preselected support-years preset, no message for a zero gap, and long figures that could get too wide.
- **Open:** none found in this run.

## 4. Regression
| Check | Result |
|---|---|
| Unit tests | 192/192 |
| Engine 2 | 69/69, no diff |
| Typecheck | Pass |
| Production build | Pass |

Rewards live tests and migrations were not rerun, as instructed.

## 5. Screenshots (scratch, not committed)
`hub-1440`, `medical-375`, `life-1280`, `simulate-needs-375`, in the session scratchpad under `rel/shots/`.
