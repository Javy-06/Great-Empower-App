# Device-only Preview Phase — Change Log

**Base:** `e9d813e` (= `app/redesign/overnight-product-refresh`). **Date:** 2026-11-27.

## Repository
- No application code changed.
- No changes to Engine 2, `supabase/`, `src/rewards/`, account code, `public/advisor/*` or main.
- **Added:** `report/device-only-preview/` (9 reports) in local commits `ce0a0c2` and `60fc108` (a wording correction).
- **Not pushed** (would trigger a live-connected branch Preview).

## Vercel (one action)
- **Deployed:** `dpl_66Vdk8VtnbrWdJoAR15kpCviBGQ8` → `https://great-empower-isn2mceoh-javy8.vercel.app`.
  - Preview, CLI source, prebuilt static output, protected by Vercel Authentication.
- **Not changed:** project settings, environment variables, domains, protection and Production.
  - Verified by a before/after comparison of the project configuration.
- **Tokens:** none created or revoked.

## Local scratch artefacts (not committed)
- Device-only build: `<scratch>/dist-preview`.
- Deploy folder: `<scratch>/vcdeploy/.vercel/output` (+ a hand-written `.vercel/project.json` with project and org IDs).
- Test scripts:
  - `verify-device-only.mjs` (device-only behaviour and Rewards demo);
  - `verify-release.mjs` (viewports, insurance flows, links).
- Results: `rel2.json` and the device-only run output, with screenshots.

## Supabase
- No access of any kind in this phase.
