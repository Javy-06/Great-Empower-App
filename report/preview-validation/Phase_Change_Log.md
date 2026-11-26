# Preview Validation & Release Readiness — Change Log

Base: `6fd6f5b` on `redesign/overnight-product-refresh` (already on `app`). Date: 2026-11-27.

## Read-only work (no changes)
- **Git state verified:** branch, remotes, status and HEAD equal to the remote.
- **Vercel project inspected** through the CLI/API (names and settings only, no secret values):
  - Git integration; SSO protection; no bypass tokens; Git LFS on.
  - Preview-only, branch-scoped Supabase variables.
  - The latest Preview is READY for `6fd6f5b`, and its build log is clean.
- **Official sources reopened:** 19 links. GE PDSs (GREAT MediValue V00/0526, Smart Multi Critical Care V03/1123, GREAT Shield Active 31 May 2026) and the BNM MediAsas pilot FAQ (29 Jul 2026) were read in full.

## `e7d5fcd` — Protection content: re-verified (27 Nov 2026)
**`src/data/protection.ts`**
- Products rewritten from the current sources:
  - newer page dates;
  - added verified facts (entry ages, waiting and survival periods, co-insurance, GMS2 and GMLS terms, i-Great Medi Care page facts);
  - GREAT Shield Active renewal condition removed;
  - GREAT MediValue type corrected;
  - the 2019 i-Great Medi Care PDS link removed;
  - SMCC 2024 page date flagged.
- Medical Malaysia facts:
  - co-payment wording now matches BNM, plus BNM's exemptions;
  - MediAsas now described as piloting, with a January 2027 national launch (BNM hub + pilot FAQ).
- New source `mediasasFaq`; the base-plan source moved to the BNM MHIT hub.
- Life and PA summaries qualified ("subject to the policy's terms and exclusions", "as defined in the policy").
- `PRODUCT_RESEARCH_DATE` set to 27 November 2026; header comment updated.

**`src/app/protection/ProtectionHub.tsx`**
- GL-decline wording.
- Free-look "usually 15 days", with the glossary source.
- Direct-channel dates (2017/2018).
- FMOS wording without "for free".

## `3410c78` — Scenario UX
**`src/app/protection/ProtectionScenarios.tsx`**
- Support years are no longer preselected unless the profile sets them, and the result needs a choice.
- "No gap in this illustration" message (Family and CI).
- Footnote: "not a quote… or a recommendation to buy any amount or product".
- `break-all` on large result figures.

**`src/calculation-engine/engine-3.test.ts`**
- One edge-case test: maximum amounts, a 0% / 100% employer share, an oversized income.

## Reports commit
- `report/preview-validation/` (9 files).

## Not changed
- Engine 2 and the medical-claim adapters
- `supabase/` (migrations and tests)
- `src/rewards/` and `src/account/`
- `public/advisor/*`
- Vercel and Supabase settings
- main and Production
