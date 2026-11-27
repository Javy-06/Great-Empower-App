# Design capability setup and baseline UI audit (2026-11-27)

**Branch:** `redesign/overnight-product-refresh`. The scope was capability setup plus audit. Only two small accessibility fixes were made, and no redesign.

## 1. Skills audit

| Capability | Before | Action | Now |
|---|---|---|---|
| UI/UX Pro Max | Referenced by `AGENTS.md`, but **missing from this worktree**. It exists only as staged, uncommitted files in the original worktree. | Read-only copy of `.agents/skills/` into this worktree, minus `__pycache__`. Excluded via `.git/info/exclude`, so the repo gains no 4.6 MB and the original worktree is untouched. Scripts reviewed first: no network or process calls in `ui-ux-pro-max`. | **Verified:** `search.py` queries for ux and chart domains return results, which were used for the standards. |
| Brand / Design System / UI Styling / Design / Banner / Slides | Same as above | Copied with it | Available as references (scripts not run) |
| Frontend Design | Not present | Fetched from the official `anthropics/skills` repo (SKILL.md + LICENSE.txt, Apache-2.0, markdown only, no scripts) into `.claude/skills/frontend-design/` | Installed and read. It loads as a skill from the next session; in this session its content was applied directly. |
| Browser / visual QA | Ad-hoc scripts in a temporary folder | Rebuilt as `scripts/qa/ui-qa.mjs` + `npm run qa:ui` (headless Chrome over DevTools protocol, **no new dependencies**) | **Verified:** 105 page checks, screenshots, a11y and responsive checks |
| Playwright | Not installed | **Not installed.** It would duplicate Chrome + CDP and add a dependency that needs approval. | n/a |
| Accessibility | Manual checks | Built into the runner: names, labels, alt, heading order, landmarks, contrast, target size, focus visibility and obscuring, disclosures | Working. It's a subset of axe; it doesn't replace a screen reader. |
| Responsive | Manual checks | Runner covers 375, 390, 768, 1280 and 1440 px: overflow, off-screen content, clipping | Working |

**Couldn't do:**
- No axe-core (dependency) and no screen-reader testing.
- No real-device testing (iOS Safari, Android Chrome).
- No 200% zoom pass.

## 2. Standards created
- `docs/design/GREAT-EMPOWER-DESIGN-SYSTEM.md`: brand, colour roles and contrast pairs, type roles, spacing and layout widths, component rules (mapped to `src/components/*`), visual-asset decision order, responsive bands, WCAG 2.2 AA minimums, UX principles. It documents the existing tokens and introduces no new ones.
- `docs/design/UI-QA-PROCESS.md`: the iteration loop, runner reference, screenshot rubric and quality gate.

## 3. Automated results (device-only build, 21 routes × 5 viewports)

**Gate: PASS** after the two fixes below.

| Check | Result |
|---|---|
| Overflow, off-screen, broken images, H1, console, failed requests, Supabase traffic | 0 |
| Unlabelled controls, fields, missing alt, targets < 24 px | 0 |
| Disclosures | All toggle |
| Focus visible | All 12-stop tab paths show a ring |

**Fixed this phase:**
1. **Focus hidden behind the fixed bottom nav** on mobile (9 routes). Added `scroll-padding-bottom: 6.5rem` under `md` in `src/index.css` (WCAG 2.4.11). Re-tested: 0 occurrences.
2. **"Learning" chip contrast** in Notifications: 4.36:1 → 4.9:1 (`bg-gold-100` → `bg-gold-50` plus a ring).

**Runner false positives found and corrected**, so the tool is trustworthy:
- Links inside closed `<details>` counted as unnamed.
- Checkboxes measured without their label.
- Search and slider focus rings drawn on the wrapper or thumb (slider ring confirmed in a 2× screenshot).
- Screenshots polluted by the keyboard test's leftover focus rings.

**Warnings left for design (not gate failures):**
- Text under 12 px on every page: 11 px uppercase overlines and count badges.
- Elements over photos need a manual contrast check (Home 11, Rewards 17, Marketplace 23).
- One clipped label ("LATEST UPDATE", Notifications @375).
- Build warns the main JS chunk is over 500 kB.

## 4. Screenshot QA (actually inspected)

**Inspected in this phase:**

| Width | Pages |
|---|---|
| 390 px | Home, Learn, Lesson, Simulate, Simulate › Family, Analyze, Guide, Rewards, Marketplace |
| 1280 px | Home, Learn, Simulate, Analyze, Guide, Rewards |
| 768 px | Home, Protection hub, Simulate, Notifications |
| Close-up | Focused slider (2×) |

**Inspected earlier the same day** (prior phase, same code):
- Protection hub at 390 px.
- Medical category at 390 and 1280 px.
- Accident category at 375 px.
- Close-ups of the risk rows, channels, bill and category heroes.

**Not inspected:**
- Video and infographic pages.
- Wallet.
- Simulate › Needs and › CI as full pages.
- The Critical illness, Life and TPD category pages: same template as Medical, which was inspected.
- 1440 px: only automated checks ran.

**Scores** (1–5): Hier = hierarchy, Lay = layout, Type = typography, Space = spacing, Assets = visual assets, Img = image quality, Dens = information density, Mob = mobile, Int = interaction clarity, Pol = polish.

| Page | Hier | Lay | Type | Space | Assets | Img | Dens | Mob | Int | Pol | Avg |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Home | 5 | 4 | 4 | 4 | 3 | 4 | 5 | 5 | 4 | 4 | **4.2** |
| Protection hub | 4 | 4 | 4 | 4 | 4 | 4 | 3 | 4 | 4 | 4 | **3.9** |
| Category (Medical) | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | **4.0** |
| Notifications | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | **4.0** |
| Analyze (empty) | 4 | 4 | 4 | 4 | 3 | 3 | 5 | 5 | 4 | 4 | **4.0** |
| Rewards | 4 | 4 | 4 | 4 | 4 | 4 | 3 | 4 | 4 | 4 | **3.9** |
| Simulate planner | 4 | 3 | 4 | 4 | 3 | 4 | 4 | 4 | 4 | 4 | **3.8** |
| Marketplace | 3 | 4 | 4 | 4 | 4 | 4 | 3 | 4 | 4 | 4 | **3.8** |
| Lesson | 4 | 4 | 4 | 4 | 2 | 3 | 4 | 4 | 4 | 3 | **3.6** |
| Guide | 4 | 3 | 4 | 4 | 3 | 2 | 4 | 4 | 4 | 3 | **3.5** |
| Learn | 3 | 3 | 4 | 4 | 3 | 3 | 2 | 4 | 4 | 3 | **3.3** |
| Simulate › Family tool | 3 | 4 | 4 | 3 | 3 | – | 2 | 4 | 4 | 3 | **3.3** |

**Weakest:** Learn, the Simulate tools and Guide. **Strongest:** Home and the Protection pages, which were redesigned in recent phases.

## 5. Issue register

**P0 (critical):** none open. Nothing blocks use, keyboard access or core function in the automated or visual checks.

| # | Sev | Page | Issue | Why it matters | Recommended fix | When |
|---|---|---|---|---|---|---|
| 1 | P1 | Simulate (planner + tools) ≥ 1024 px | Inputs and Yes/No rows stretch to about 1100 px; labels sit far from their answers | Hard to scan, so error-prone data entry | Constrain the form column to ~720 px, or use a 2-column layout (form plus live summary) | **With 2.0**, if Simulate survives; otherwise a cheap fix before |
| 2 | P1 | Simulate › Family (and other tools) | 9 money fields at once; result hidden until all are filled | High drop-off, and feels like a tax form | Step through 3 groups (Support · Debts · What you have), with a live partial result | With 2.0 |
| 3 | P1 | Learn | 7 stacked sections, 4.6 screens on mobile. Desktop: video poster about 620 px tall, 3 quick explainers left-aligned, infographic thumbnails illegible (CI/PA letterboxed) | The main learning hub reads as a catalogue, so nothing stands out | One "next for you" focus, then tabs or filters for Videos, Infographics and Lessons; legible title cards for infographics; cap the poster height | **After 2.0** (Learn IA likely changes); cap the poster height now if desired |
| 4 | P1 | Guide, Analyze, Learn, Notifications | Only 6 base photos reused across pages: Guide and Analyze share the same "stressed at laptop" hero, and "How to make a medical claim" shows children eating | Repetition looks templated; mismatches weaken trust | Commission one relevant, credited Pexels photo per destination (process in `docs/visual-assets.md`) | With 2.0 page heroes |
| 5 | P1 | All | Overlines (11 px uppercase) above almost every section and card; 11 px used for meta | Generic-AI tell; small caps are hard for ESL readers | Apply the rule: one overline per section header only when informative; meta at least 12 px | With the 2.0 restyle |
| 6 | P2 | Home, Learn, Notifications | 3D rendered art (LifeTrack, Learn topic cards) next to the flat icon and illustration system | Two visual languages in one view | Keep 3D inside LifeTrack; give Learn topic cards flat Spots, or photos | After 2.0 |
| 7 | P2 | Home @768 | LifeTrack banner about 440 px tall in a single column dominates the page | Steals focus from learning | 2-column at `md`, or cap the height | Before or with 2.0 |
| 8 | P2 | Guide ≥ 1280 px | Featured card leaves half its width empty; the Popular row is cut at the container edge with no scroll cue | Looks unfinished | Featured as a 50/50 with a summary and CTA; fade or arrows on the scroller | With 2.0 |
| 9 | P2 | Guide @390 | Search placeholder truncated ("deduct…") | Polish | Shorter placeholder: "Search guides" | Any time |
| 10 | P2 | Rewards, Marketplace | "WELCOME 200" badge on every card; Marketplace 3.9 screens, Rewards 3.5 | Badge loses meaning; long scroll | Show the offer once (banner), and badge only eligible items or the first row; filter by default | After 2.0 (Rewards stays separate) |
| 11 | P2 | Lesson | Placeholder umbrella art; "Lesson progress · Upcoming 0%" card repeats the quiz's own progress | Weak visual, redundant block | Topic Spot illustration; merge progress into the quiz header | Before or with 2.0 |
| 12 | P2 | Pages with photo heroes | Text-over-photo contrast relies on the fade (flagged for manual review) | Readability on real screens and brightness | Device check; strengthen the scrim where needed | Before release |
| 13 | P2 | Copy | "Great Empower Vouchers" in Rewards vs the brand "GREAT EMPOWER"; Title Case "Not Sure" among sentence case | Brand and voice consistency | Copy pass | Any time |
| 14 | P2 | Performance | Main chunk over 500 kB | Slower first load on mobile data | Route-level `lazy()` | With 2.0 navigation |
| 15 | P3 | Home, Wallet, Guide | A few secondary controls under 44 px (carousel arrows, small pills); all are at least 24 px (AA) | Touch comfort | Grow the hit areas with padding | Any time |
| 16 | P3 | Notifications @375 | "LATEST UPDATE" label clipped | Polish | Allow wrapping | Any time |
| — | Fixed | Mobile | Focus covered by the bottom nav | WCAG 2.4.11 | Done | — |
| — | Fixed | Notifications | Chip contrast 4.36:1 | WCAG 1.4.3 | Done | — |

## 6. How the UI should evolve for GREAT EMPOWER 2.0 (not implemented)
- **Navigation.** The bottom nav and top nav are isolated in `components/nav/*` with `navItems.ts`, so a new IA can replace them without touching pages. Route-level code-splitting should come with it (#14).
- **Analyze.** It's simple today: an empty state and a sample disclosure. Don't invest further until 2.0 decides its fate; the Spots and empty-state pattern carries over.
- **Product discovery.** The category pages already separate purpose from official category and use verified product rows. A future product view should reuse `ProductRow` facts, still with no prices, rankings or checkout until approved.
- **Forms.** Any 2.0 flow that collects data should use the stepped, progressive pattern (#2) and the 720 px column (#1).
- **QA.** Update `scripts/qa/routes.mjs` with the new routes, and keep the quality gate in `docs/design/UI-QA-PROCESS.md` as the definition of done.
