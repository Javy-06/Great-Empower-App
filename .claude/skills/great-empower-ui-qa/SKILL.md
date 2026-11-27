---
name: great-empower-ui-qa
description: GREAT EMPOWER's UI workflow and quality gate — responsive, accessibility, browser and visual QA. Use for any change to how a GREAT EMPOWER page looks or behaves (new page, redesign, component change, layout fix), and before calling UI work done.
---

# GREAT EMPOWER UI workflow

Covers responsive design, accessibility, browser QA, Playwright and visual QA for this repo. Standards live in `docs/design/GREAT-EMPOWER-DESIGN-SYSTEM.md`; the definition of done in `docs/design/UI-QA-PROCESS.md`. Authority order is in `AGENTS.md` (product decisions > design system > architecture > UI/UX Pro Max > other skills, including `frontend-design`).

## Safety (always)
- QA runs **device-only**. `scripts/qa/device-only.mjs` blanks `VITE_SUPABASE_*` and refuses a bundle that references Supabase. Never point tests at a Preview or production URL — they are connected to live Supabase.
- Don't touch `public/advisor/*`, Engine 2, rewards/account/Supabase code, Vercel settings. Don't push unless deployment safety is verified and the user authorised it.

## Loop: Audit → Plan → Design → Implement → Test → Screenshot → Inspect → Refine → Re-test → Final QA

1. **Audit** — read the page and the components/tokens it uses; run `pnpm qa:ui -- --only=<route keys>` and open `.qa/shots/390/*.jpg` and `.qa/shots/1280/*.jpg`. Write down the concrete problem.
2. **Plan** — list issues P0–P3 with evidence (screenshot path, metric, axe rule). Routine redesign (layout, IA within the app, visuals, text reduction, frontend features, safe prototypes) is autonomous; ask first only for production, live data/migrations, real accounts, sensitive data, real applications/payments/insurer APIs, secrets, deploy/push, or major irreversible architecture changes.
3. **Design** — consult UI/UX Pro Max for the specific domain only:
   `cd .agents/skills/ui-ux-pro-max && PYTHONDONTWRITEBYTECODE=1 python scripts/search.py "<query>" --domain ux|chart|typography|color -n 5`
   (never `--design-system`/`--persist`). Use `frontend-design` for composition, restraint and copy critique. Map everything back to existing tokens/components.
4. **Implement** — existing tokens and components only; no new palette, font or UI library.
5. **Test** — `npx tsc -b` · `pnpm test` · `pnpm build` · `pnpm qa:smoke` (routes + interactions) · `pnpm qa:a11y` (axe) · `pnpm qa:ui` (responsive gate, 5 widths).
6. **Screenshot** — `pnpm qa:ui` writes full pages to `.qa/shots/<width>/`; Playwright attaches them in `pnpm qa:report`. Close-ups: element clip at deviceScaleFactor 2 (see `scripts/qa/ui-qa.mjs` for the CDP pattern).
7. **Inspect** — actually open the images (Read tool). Score changed pages 1–5 on the rubric in `UI-QA-PROCESS.md`: hierarchy, layout, typography, spacing, assets, image quality, density, mobile usability, interaction clarity, polish. Look for overflow, clipping, crops, inconsistent components, excess text, weak states.
8. **Refine** — fix what the inspection found.
9. **Re-test** — rerun step 5 and re-shoot; inspect again. At least one real iteration for any major change.
10. **Final QA** — `pnpm qa:visual` (diff vs baselines; after an intended change, review the diff then `pnpm qa:visual:update`), all gates green, no page below 3. Report only what was actually run and looked at, with widths; say what wasn't (real devices, screen readers).

## Responsive checklist (375 · 390 · 768 · 1280 · 1440)
No horizontal scroll or off-screen content; H1 ≤ 3 lines at 375; bottom nav never covers content or focus; tablets get 2-col peers and capped media; desktop forms ≤ 720 px; galleries never leave lonely items; lines ≤ 75 characters. Don't scale desktop down — compose each band.

## Accessibility checklist (WCAG 2.2 AA)
axe has no serious/critical issues; one H1, no skipped levels; every control named, every field labelled; visible focus on every Tab stop; targets ≥ 24 px (44 px for primary touch); text contrast ≥ 4.5:1 (3:1 large) — check text over photos by eye; meaning never by colour alone; live regions for changing results; reduced motion respected.

## Tools
| Command | What it does |
|---|---|
| `pnpm qa:ui [-- --only=a,b --widths=390,1280 --no-build --no-shots]` | CDP runner: 21 routes × 5 widths, gate + warnings, `.qa/report.md`, screenshots |
| `pnpm qa:smoke` | Playwright: every route at every width (H1, overflow, images, console, network) + core interactions |
| `pnpm qa:a11y` | Playwright + axe-core at 390 and 1280 |
| `pnpm qa:visual` / `pnpm qa:visual:update` | Visual regression vs `tests/e2e/__screenshots__` |
| `pnpm qa:e2e` / `pnpm qa:report` | Everything / open the HTML report |
Routes live in `scripts/qa/routes.mjs` — update it when the architecture changes.
