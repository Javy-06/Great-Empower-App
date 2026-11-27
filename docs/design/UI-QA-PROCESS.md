# UI design and QA process

This is the loop for every UI phase, the tools that support it, and the gate a phase must pass before it is called done.

## Capabilities

| Need | Tool | Status |
|---|---|---|
| Design research (UX rules, a11y, charts, typography) | **UI/UX Pro Max**: `.agents/skills/ui-ux-pro-max/` (local copy of the project skill, git-excluded). Run `python scripts/search.py "<query>" --domain ux\|chart\|typography\|color -n 5` | Working. Don't use `--design-system` or `--persist` (per `AGENTS.md`). |
| Brand, design-system and UI-styling references | `.agents/skills/{brand,design-system,ui-styling,design,banner-design,slides}` | Available as references |
| Composition and anti-generic critique | **Frontend Design** (Anthropic, Apache-2.0): `.claude/skills/frontend-design/SKILL.md` | Installed. Its "distinctive palette and typeface" advice is subordinate to the brand. Use it for layout, restraint, copy and self-critique. |
| Browser automation, screenshots, responsive and a11y checks | `scripts/qa/ui-qa.mjs`: uses installed Chrome over DevTools protocol, with no npm dependencies | Working (`npm run qa:ui`) |
| Element and focus close-ups | the same CDP approach (`Page.captureScreenshot` with `clip`, deviceScaleFactor 2) | Ad hoc |
| Unit and logic tests | `npm test` (Node test runner) | Working |

**Not used:** Playwright, Puppeteer and axe-core. None are installed, and Chrome plus CDP already covers the need. Adding them would mean a new dependency, which needs approval. The built-in checks are a subset of axe: they don't replace a screen-reader pass.

## The loop

```
Audit ─► Design ─► Implement ─► Test ─► Screenshot ─► Inspect ─► Fix ─► Re-test ─► Re-shoot ─► Final QA
  ▲                                                       │
  └──────────────── at least one real iteration ──────────┘
```

1. **Audit.**
   - Run `npm run qa:ui` on the current state.
   - Read `.qa/report.md` and look at `.qa/shots/390/*` and `.qa/shots/1280/*`.
   - Write down the specific problem to solve, per page.
2. **Design.**
   - Consult UI/UX Pro Max for the relevant domain only.
   - Check the brand rules in `GREAT-EMPOWER-DESIGN-SYSTEM.md`.
   - For significant changes, sketch (ASCII or a quick HTML render) and get approval.
3. **Implement.**
   - Use existing tokens and components.
   - No new palette, font or component library.
4. **Test.**
   - Run `npx tsc -b`, `npm test` and `npm run build`.
5. **Screenshot.**
   - Run `npm run qa:ui`. It does a device-only build, then checks 21 routes × 375, 390, 768, 1280 and 1440 px.
6. **Inspect.**
   - Open the screenshots and score each changed page (rubric below).
   - Use 2× element close-ups for icons, illustrations and focus states.
   - **A passing gate is not a visual review.**
7. **Fix → re-test → re-shoot** until the gate passes and no page scores below 3.
8. **Final QA.**
   - Re-run everything.
   - Record the scores, before and after, in the phase report.
   - Only claim what was actually run and looked at.

Safety:
- QA always runs **device-only**. The runner blanks `VITE_SUPABASE_*` and aborts if the bundle still references Supabase.
- Never point QA at a deployment connected to the live database.

## Runner reference

```
npm run qa:ui                                   # full run
npm run qa:ui -- --no-build                     # reuse .qa/dist
npm run qa:ui -- --only=home,learn --widths=390,1280
npm run qa:ui -- --no-shots                     # checks only
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
- **Technical:** `tsc`, `npm test` and `npm run build` pass. No console errors or broken images.
- **Screenshot QA:** screenshots are captured *and* inspected, issues are documented, and significant ones are fixed and re-shot.
- **Accessibility:** keyboard reachable, visible focus, semantic structure, labels, targets ≥ 24 px (44 for primary), contrast failures fixed or logged.
- **Honesty:** the report says what was tested, at which widths, and what was not (e.g. real devices, screen readers).
