# Design capability setup and baseline UI audit (2026-11-27)

**Branch:** `redesign/overnight-product-refresh`.

**Scope:** capability setup, standards and a baseline audit. No redesign: only small accessibility fixes, listed in §3.

**Companion documents:**
- `Skills_Security_Review.md`
- `docs/design/GREAT-EMPOWER-DESIGN-SYSTEM.md`
- `docs/design/UI-QA-PROCESS.md`
- `.claude/skills/great-empower-ui-qa/SKILL.md`

## 1. Skills and tools

| Capability | Provided by | Status |
|---|---|---|
| UI/UX Pro Max | `.agents/skills/ui-ux-pro-max` (reused project skill, local copy, git-excluded) | **Verified:** `search.py` ux and chart queries return results that were used in the standards |
| Brand / Design System / UI Styling / Design / Banner / Slides | `.agents/skills/*` (reused, reference only) | 4 scripts removed from the local copy after the security review |
| Frontend Design | `.claude/skills/frontend-design` (Anthropic, Apache-2.0) | **Installed**; listed as a skill in-session |
| Responsive, Accessibility, Browser QA, Visual QA workflow | `.claude/skills/great-empower-ui-qa` (new project skill; one skill rather than four overlapping ones) | **Installed**; listed as a skill in-session |
| Playwright | `@playwright/test` 1.65.1 (dev), installed Chrome via `channel: "chrome"` | **Verified**: see §6 |
| Accessibility audit | `@axe-core/playwright` 4.14.1 (dev), plus runner checks | **Verified:** it found real issues, which were fixed (§3) |
| Responsive gate + review screenshots | `scripts/qa/ui-qa.mjs` (`pnpm qa:ui`) | **Verified** |
| Visual regression | Playwright `toHaveScreenshot`; 12 baselines (6 screens × 390/1280) | **Verified:** stable, and it catches a one-word change (§6) |

**Not available:** screen-reader testing, real iOS and Android devices, and a 200% zoom pass. These are manual work and are listed as follow-ups.

## 2. Standards
- **Design system:** visual direction (premium Malaysian fintech with restraint rules), colour roles and verified contrast pairs, type roles, spacing and widths.
- **Component rules:** navigation, headers, buttons, cards, forms, tabs, modals and sheets, progress, empty, error and loading states, tooltips, interactive learning, insurance product information, comparisons.
- **Responsive and accessibility:** rules per width (375/390/768/1280/1440, composed per band rather than scaled) and WCAG 2.2 AA minimums.
- **QA process:** Audit → Plan → Design → Implement → Test → Screenshot → Inspect → Refine → Re-test → Final QA, with a 1–5 rubric and a quality gate.

## 3. Problems found by the tools, and fixed

| Found by | Problem | Evidence | Fix |
|---|---|---|---|
| Runner (focus check) | Tabbed controls hidden behind the fixed mobile bottom nav on 9 routes | `focused element covered` warnings @390 | `scroll-padding-bottom: 6.5rem` under `md` (`src/index.css`); 0 after |
| Runner (contrast) | Notifications "Learning" chip 4.36:1 | `contrast… 4.36:1 (11px)` | `bg-gold-50` → 4.9:1 |
| axe `color-contrast` | Mobile bottom-nav labels 4.06:1 (`text-navy-900/70` on frosted glass) | axe @390: home, simulate, video | Inactive labels now `text-navy-800` |
| axe `color-contrast` | "Try it" scenario card on crimson: 3.75:1 and 4.12:1 | axe: all 5 category pages @390 and 1280 | `text-white/90` |
| axe `label-content-name-mismatch` (WCAG 2.5.3) | Accessible name didn't contain the visible text. Home category buttons said "Disability" but were named "Income Protection: …"; risk rows and Learn topic cards had similar mismatches. | axe: home, protection, learn @390 and 1280 | Home: name starts with the visible label. Risk rows and topic cards: `aria-label` removed so the visible text is the name; "saved" count added as sr-only text. |

**After the fixes:** axe reports **0 serious or critical issues on 21 routes × 2 widths**, and the runner gate passes on 105 page checks.

**Tooling problems found and fixed (setup issues):**
- **Leaked Chrome processes.** My earlier CDP scripts left about 350 headless Chrome processes running: on Windows, killing the launcher doesn't end Chrome's children. This starved the machine and made Playwright time out. All automation processes were closed, and the user's own Chrome was left alone. The runner now closes Chrome with `Browser.close`, and leaves 0 processes behind (verified).
- **Video streaming.** The static server didn't support HTTP Range, so each video request transferred the whole 41 MB file. Range support was added (`206` verified).
- **Runner false positives fixed.** Links inside closed `<details>`; checkbox targets measured without their label; focus rings drawn on a wrapper or slider thumb (the thumb ring was confirmed in a 2× screenshot); focus rings from the keyboard test leaking into screenshots.
- **Visual-regression tolerance.** A 1% ratio let a one-word change pass, so it's now an absolute cap of 100 pixels (§6).

## 4. Screenshot inspection (actually opened and reviewed)

| Width | Pages inspected |
|---|---|
| 375 | Accident category (earlier today) |
| 390 | Home, Learn, Lesson, Video, Protection hub, Medical category, Simulate, Simulate › Family, Analyze, Guide, Rewards, Marketplace, Wallet; visual baselines Home, Protection, Analyze (expected/actual/diff) |
| 768 | Home, Protection hub, Simulate, Notifications |
| 1280 | Home, Learn, Medical category (+ visual baseline), Simulate, Analyze, Guide, Rewards |
| 1440 | Home (§7) |
| 2× close-ups | Focused slider; risk rows, channels, bill and category heroes (earlier today) |

**Not opened:**
- The Infographic screenshot. Automated checks pass, and it exists in `.qa/shots/`.
- The Critical illness, Life and TPD category pages. They use the same template as Medical, which was inspected.

**Scores** (1–5): Hier = hierarchy, Lay = layout, Type = typography, Space = spacing, Assets = visual assets, Img = image quality, Dens = information density, Mob = mobile, Int = interaction clarity, Pol = polish.

| Page | Hier | Lay | Type | Space | Assets | Img | Dens | Mob | Int | Pol | Avg |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Home | 5 | 4 | 4 | 4 | 3 | 4 | 5 | 5 | 4 | 4 | **4.2** |
| Category (Medical) | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | **4.0** |
| Notifications | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | **4.0** |
| Analyze (empty) | 4 | 4 | 4 | 4 | 3 | 3 | 5 | 5 | 4 | 4 | **4.0** |
| Protection hub | 4 | 4 | 4 | 4 | 4 | 4 | 3 | 4 | 4 | 4 | **3.9** |
| Rewards | 4 | 4 | 4 | 4 | 4 | 4 | 3 | 4 | 4 | 4 | **3.9** |
| Simulate planner | 4 | 3 | 4 | 4 | 3 | 4 | 4 | 4 | 4 | 4 | **3.8** |
| Marketplace | 3 | 4 | 4 | 4 | 4 | 4 | 3 | 4 | 4 | 4 | **3.8** |
| Lesson | 4 | 4 | 4 | 4 | 2 | 3 | 4 | 4 | 4 | 3 | **3.6** |
| Guide | 4 | 3 | 4 | 4 | 3 | 2 | 4 | 4 | 4 | 3 | **3.5** |
| Learn | 3 | 3 | 4 | 4 | 3 | 3 | 2 | 4 | 4 | 3 | **3.3** |
| Simulate › Family tool | 3 | 4 | 4 | 3 | 3 | – | 2 | 4 | 4 | 3 | **3.3** |

## 5. Issue register

**P0 (critical): none.** No broken function, layout failure or unusable screen at any tested width. Gates: runner 105/105, Playwright smoke and interactions 117/117, axe 42/42.

| # | Sev | Page / component | Problem | Evidence | Recommended fix | When |
|---|---|---|---|---|---|---|
| 1 | P1 | Simulate planner + tools ≥ 1024 | Inputs and Yes/No rows stretch to about 1100 px; labels sit far from their answers | `.qa/shots/1280/simulate.jpg`: age field spans the full container, answers right-aligned about 900 px from labels | Form column ≤ 720 px, or form + live summary in 2 columns | With 2.0 (cheap fix sooner if Simulate stays) |
| 2 | P1 | Simulate › Family (and the other tools) | 9 money fields shown at once; the result appears only after all are filled | `.qa/shots/390/sim-family.jpg`: 2.7 screens, 22 controls | Three steps (Support · Debts · What you have) with a live partial result | With 2.0 |
| 3 | P1 | Learn | 7 stacked sections. Desktop video poster about 620 px tall; 3 quick explainers left-aligned; infographic thumbnails illegible, and the CI/PA ones letterboxed | Runner: 4.6 screens and 244 words @390; `.qa/shots/1280/learn.jpg` | One "next for you" focus, then filters for Videos, Infographics and Lessons; title-card thumbnails; cap the poster height | After 2.0 (IA changes); cap the poster now if wanted |
| 4 | P1 | Guide, Analyze, Learn, Notifications | Only 6 base photos are reused. Guide and Analyze share one "stressed at laptop" hero, and "How to make a medical claim" shows children eating. | Both pages use `young-professional-savings-planning.webp` (`AnalyzeView.tsx:264`, `GuideCentre.tsx:102`); `guides.ts:33` maps health → `everyday-health-wellbeing.webp` | One relevant, credited photo per destination (`docs/visual-assets.md` process) | With 2.0 heroes |
| 5 | P1 | All pages | 11 px uppercase overlines above almost every section and card; meta text at 11 px | Runner "text under 12px" warning on 105/105 page checks | One overline per section, only when informative; meta ≥ 12 px | With the 2.0 restyle |
| 6 | P2 | Home, Learn, Notifications | 3D rendered art (LifeTrack, Learn topic cards) next to the flat icon and illustration system | `.qa/shots/390/learn.jpg` topic cards; Home LifeTrack card | Keep 3D inside LifeTrack; give topic cards flat Spots or photos | After 2.0 |
| 7 | P2 | Home @768 | LifeTrack banner about 440 px tall in a single column dominates the page | `.qa/shots/768/home.jpg` | 2 columns at `md`, or cap the height | Before or with 2.0 |
| 8 | P2 | Guide ≥ 1280 | Featured card leaves half its width empty; the Popular row is cut at the container edge with no scroll cue | `.qa/shots/1280/guide.jpg` | 50/50 featured card with summary + CTA; edge fade or arrows on the scroller | With 2.0 |
| 9 | P2 | Rewards, Marketplace | "WELCOME 200" badge on every card; long scroll | Marketplace 3.9 and Rewards 3.5 screens @390; `.qa/shots/390/marketplace.jpg` | Offer shown once; badge only the first row or eligible items; filter by default | After 2.0 |
| 10 | P2 | Lesson | Placeholder umbrella art; "Lesson progress · Upcoming 0%" card repeats the quiz's own progress | `.qa/shots/390/lesson.jpg` | Topic Spot illustration; merge progress into the quiz header | Before or with 2.0 |
| 11 | P2 | Photo heroes (all destinations) | Text-over-photo contrast relies on the fade; automated tools can't measure it | Runner "text over imagery": Home 11, Rewards 17, Marketplace 23 elements | Check on a real device; strengthen the scrim where needed | Before release |
| 12 | P2 | Copy | "Great Empower Vouchers" vs the brand "GREAT EMPOWER"; Title Case "Not Sure" among sentence case | `.qa/shots/1280/rewards.jpg`, `.qa/shots/1280/simulate.jpg` | Copy pass | Any time |
| 13 | P2 | Performance | Main JS chunk over 500 kB | Vite build warning on every build | Route-level `lazy()` | With 2.0 navigation |
| 14 | P3 | Guide @390 | Search placeholder truncated ("deduct…") | `.qa/shots/390/guide.jpg` | Placeholder "Search guides" | Any time |
| 15 | P3 | Home, Wallet, Guide | Some secondary controls under 44 px (carousel arrows, small pills); all ≥ 24 px (AA) | Runner "targets < 44": home 3/14, wallet 2/3, guide 3/19 | Grow the hit areas with padding | Any time |
| 16 | P3 | Notifications @375 | "LATEST UPDATE" label clipped | Runner "clipped text" warning | Allow wrapping | Any time |
| 17 | P2 | Wallet | Passes empty state is a bare box with no illustration or action; the vouchers section has no state at all; the voucher explanation repeats itself in two paragraphs | `.qa/shots/390/wallet.jpg` | Empty-state pattern (Spot + one line + "Browse rewards"); one voucher sentence | Before or with 2.0 (Rewards stays separate) |
| 18 | P2 | Bottom nav on Rewards and Wallet | "Home" shows as the active tab while on Rewards and Wallet, which misstates the location | `.qa/shots/390/wallet.jpg`, `.qa/shots/390/rewards.jpg` | No active tab (or a Rewards indicator) outside the five destinations | With the 2.0 navigation |
| 19 | P2 | Learn › quick-explainer video (supplied media) | The video poster shows US-style "$7,899.50" and "PAST DUE", not RM and Malaysian context | `.qa/shots/390/video.jpg` | Replace the poster frame, or re-export with RM | When media is next refreshed |

**Most important visual issues:** #1 and #2 (Simulate on desktop and its long forms), #3 (Learn density), #4 (photo reuse and relevance) and #5 (the overline habit).

## 6. Testing record

| Command | Result |
|---|---|
| `npx tsc -b` | Pass |
| `pnpm test` (unit) | 193/193 |
| `pnpm build` | Pass (chunk-size warning, #13) |
| `pnpm qa:ui` (21 routes × 375/390/768/1280/1440) | Gate PASS: 0 failures. Warnings are the design items above. Full-page screenshots in `.qa/shots/`. |
| `pnpm qa:smoke` (Playwright: every route at every width + 6 interaction flows at 390 and 1280) | 117 passed |
| `pnpm qa:a11y` (axe, 21 routes × 390/1280) | First run: 18 failed (real issues in §3). After fixes: 42 passed. |
| `pnpm qa:visual` (12 baselines) | 12/12 on two consecutive runs. **Negative check:** changing "See what each one does" to "…every one…" on Home failed with 692 differing pixels; after reverting, 12/12 passed. An earlier 1% ratio tolerance missed that change, and `--update-snapshots` (changed-only) had left 3 stale baselines. Both are fixed: the tolerance is now 100 pixels, and `qa:visual:update` uses `--update-snapshots=all`. |

**Console and network:** 0 console errors, 0 failed requests, 0 HTTP errors and 0 Supabase requests on every route at every width, in both the runner and Playwright.

**Verified capabilities:**
- The browser launches.
- The app loads.
- Screenshots are captured at 5 widths.
- Console errors and network failures are captured.
- Interactions are tested: navigation, tabs with arrow keys, deep links, disclosures, live region, "Show all".
- Tests pass and fail correctly (axe failures; the visual negative check).

## 7. How the UI should evolve for GREAT EMPOWER 2.0 (not implemented)
- **Navigation.** The navigation lives in `components/nav/*` and `navItems.ts`, so a new IA can replace it without touching pages. Add route-level code-splitting at the same time (#13).
- **Analyze.** Don't invest further until 2.0 decides its role. The empty-state pattern carries over.
- **Product discovery.** Reuse the verified `ProductRow` facts. No prices, rankings or checkout until approved.
- **Forms.** New data-collecting flows use stepped forms (#2) in a ≤ 720 px column (#1).
- **QA.** Update `scripts/qa/routes.mjs` and the visual baselines for the new routes. Keep `UI-QA-PROCESS.md` as the definition of done.
