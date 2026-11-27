# UI design and QA process

This is the loop for every UI phase, the tools that support it, and the gate a phase must pass before it is called done.

## Capabilities

| Need | Tool | Status |
|---|---|---|
| Workflow + quality gate (responsive, accessibility, browser and visual QA) | **`great-empower-ui-qa`** project skill: `.claude/skills/great-empower-ui-qa/SKILL.md` | Installed and listed as a skill |
| Design research (UX rules, a11y, charts, typography) | **UI/UX Pro Max**: `.agents/skills/ui-ux-pro-max/` (local copy of the project skill, git-excluded). Run `PYTHONDONTWRITEBYTECODE=1 python scripts/search.py "<query>" --domain ux|chart|typography|color -n 5` | Working. Never use `--design-system` or `--persist`. |
| Brand, design-system and UI-styling references | `.agents/skills/{brand,design-system,ui-styling,design,banner-design,slides}` | Reference only. Four unsafe or forbidden scripts are removed from the local copy (see `report/design-qa-baseline/Skills_Security_Review.md`). |
| Composition and anti-generic critique | **Frontend Design** (Anthropic, Apache-2.0): `.claude/skills/frontend-design/` | Installed. Subordinate to the brand palette and typography. |
| Browser automation, tests | **Playwright** `@playwright/test` (dev dependency), using the installed Chrome (`channel: "chrome"`) | `pnpm qa:e2e`, `qa:smoke`, `qa:report` |
| Accessibility audit | **axe-core** via `@axe-core/playwright` (dev dependency), plus the runner checks | `pnpm qa:a11y` |
| Visual regression | Playwright `toHaveScreenshot`, with baselines in `tests/e2e/__screenshots__/` | `pnpm qa:visual` / `qa:visual:update` |
| Responsive gate + full-page screenshots for review | `scripts/qa/ui-qa.mjs` (CDP, 21 routes × 375/390/768/1280/1440) | `pnpm qa:ui` |
| Element and focus close-ups | CDP `Page.captureScreenshot` with `clip` at deviceScaleFactor 2 | Ad hoc |
| Unit and logic tests | Node test runner | `pnpm test` |

Both the runner and Playwright build and serve through `scripts/qa/device-only.mjs`. **Not covered:** real devices, screen readers and 200% zoom. These need manual passes.

## The loop

```
Audit ─► Plan ─► Design ─► Implement ─► Test ─► Screenshot ─► Inspect ─► Refine ─► Re-test ─► Final QA
                                                    ▲                       │
                                                    └── repeat until the gate passes (≥ 1 real iteration)
```

1. **Audit.**
   - Read the page, its components and tokens.
   - Run `pnpm qa:ui -- --only=<keys>`, then read `.qa/report.md` and open `.qa/shots/390/*` and `.qa/shots/1280/*`.
2. **Plan.**
   - List problems P0–P3, each with evidence (screenshot path, metric or axe rule).
   - Significant design changes need approval first.
3. **Design.**
   - Consult UI/UX Pro Max for the relevant domain, and Frontend Design for composition and copy critique.
   - Map everything to `GREAT-EMPOWER-DESIGN-SYSTEM.md`.
4. **Implement.**
   - Use existing tokens and components only.
   - No new palette, font or component library.
5. **Test.**
   - Run `npx tsc -b`, `pnpm test`, `pnpm build`, `pnpm qa:smoke`, `pnpm qa:a11y` and `pnpm qa:ui`.
6. **Screenshot.**
   - `pnpm qa:ui` writes full pages at five widths, and Playwright attaches screenshots in `pnpm qa:report`.
   - Use 2× close-ups for icons, illustrations and focus states.
7. **Inspect.**
   - Open the images and score each changed page (rubric below).
   - **A passing gate is not a visual review.**
8. **Refine.** Fix what the inspection found.
9. **Re-test.** Rerun step 5, re-shoot and inspect again.
10. **Final QA.**
    - Run `pnpm qa:visual`. After an intended change, review the diff, then `pnpm qa:visual:update`.
    - All gates must be green and no page may score below 3.
    - Record the scores before and after, and claim only what was actually run and looked at.

Safety:
- QA always runs **device-only**. The runner blanks `VITE_SUPABASE_*` and aborts if the bundle still references Supabase.
- Never point QA at a deployment connected to the live database.

## Runner reference

```
pnpm qa:ui                                      # full run
pnpm qa:ui -- --no-build                     # reuse .qa/dist
pnpm qa:ui -- --only=home,learn --widths=390,1280
pnpm qa:ui -- --no-shots                     # checks only
```

The route list lives in `scripts/qa/routes.mjs`. Update it when the architecture changes.

**Automated checks (per route × viewport):**

| Kind | Checks |
|---|---|
| **Gate** (fails the run) | Route lands where expected; no horizontal overflow; no content outside the viewport; no broken images; exactly one H1; every control has a name; every field has a label; no `img` without `alt`; no target under 24 px; no console errors; no failed requests; no Supabase traffic |
| **Mobile 390 extras** (also gate) | Every `<details>` and `aria-expanded` toggle works; the first 12 Tab stops each show a visible focus indicator |
| **Warnings** (review) | Text contrast below AA (solid backgrounds only); clipped text; heading-level skips; text under 12 px; focused element covered by fixed UI |
| **Metrics** (`report.md`) | Words, screens of scroll, long paragraphs, rounded blocks, targets under 44 px, text over imagery needing a manual contrast check |

## Screenshot rubric (score 1–5)

| Criterion | 5 means |
|---|---|
| Visual hierarchy | One obvious first read, then a clear second; one primary action |
| Layout | Aligned grid, purposeful width at every breakpoint, no lonely items |
| Typography | Token sizes only; serif for editorial moments, Inter for UI; comfortable line length |
| Spacing | Consistent rhythm; related things close, sections clearly separated |
| Visual assets | Each image, illustration or icon explains something; one style per view |
| Image quality | Sharp, well cropped, relevant, not repeated across pages |
| Information density | Readable at a glance; detail is behind disclosure |
| Mobile usability | Thumb-reachable actions, ≥ 44 px targets, no sideways scroll |
| Interaction clarity | Selected, pressed, focus and disabled states are obvious; feedback is immediate |
| Overall polish | Nothing feels templated, broken or unfinished |

A page scoring **≤ 2** on any criterion blocks release. **3** needs a logged follow-up.

## Quality gate: a UI phase is done only when

- **Functionality:** no broken critical flows, route failures or interaction failures (gate and feature checks pass).
- **Responsive:** no overflow or clipping at 375, 390, 768, 1280 and 1440 px. Mobile, tablet and desktop are each inspected.
- **Visual:** clear hierarchy, token typography and spacing, appropriate assets, no excess text, no unnecessary cards, one icon style per role.
- **Technical:** `tsc`, `pnpm test`, `pnpm build`, `pnpm qa:smoke` and `pnpm qa:a11y` pass (no serious or critical axe issues). No console errors or broken images. Visual diffs are reviewed.
- **Screenshot QA:** screenshots are captured *and* inspected, issues are documented, and significant ones are fixed and re-shot.
- **Accessibility:** keyboard reachable, visible focus, semantic structure, labels, targets ≥ 24 px (44 for primary), contrast failures fixed or logged.
- **Honesty:** the report says what was tested, at which widths, and what was not (e.g. real devices, screen readers).
