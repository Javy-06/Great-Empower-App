# GREAT EMPOWER: finalization report

**Date:** 28 November 2026
**Branch:** `redesign/overnight-product-refresh`, based on `549d06a`

**Two passes:**
1. **Finalization:** fixed the structure (Protect owns the check, Simulate is tools only, misleading content corrected).
2. **Product correction:** the owner clarified that **applying happens inside GREAT EMPOWER**, and that **LifeTrack is a separate website**. The first pass had sent "Apply online" to insurer websites. That route is gone.

## Executive summary

People can now go from learning to an application without leaving the app:
- Protect → **Get cover** → understand a kind of cover (optional simulator, skippable) → get ready → **Apply in GREAT EMPOWER**.
- The application has four steps: details, cover, health questions, review. Every answer is saved as you go, validated, and reviewable before you finish.

**Talk to an adviser** remains a separate *assistance* path. It is guidance, not an application.

**Submission is honest.** There is no insurer API and no application backend in this project. A finished application is shown as:
- **completed in GREAT EMPOWER**;
- **not sent to an insurer**;
- **no cover**.

It is never "submitted" or "approved", and it gets no reference number.

**LifeTrack** opens its own website, https://lifetrack-plum.vercel.app/, in a new tab. The in-app game shell was removed.

## Backend capability (checked before building)

| What | Found |
|---|---|
| Insurer API or SDK | None |
| Application table, endpoint or Edge Function | None. `supabase/migrations` holds demo accounts, rewards, learning verification and watch time only. |
| Payments | None |

**Therefore:** the whole application journey runs in the app. Answers are saved on the device, scoped to the account (`ge-applications-v1`), like the protection check, and are never synced.

## Initial problems found (first pass)

1. Every Protect action ("Improve my protection plan", gap cards, Start your profile, Check) opened the Simulate form, creating a Protect ↔ Simulate loop.
2. "Apply" was a dead end.
3. Four priorities were pre-ticked, so every "No" looked like a gap.
4. Simulate asked for a budget nothing used, and its "plan" only repeated your answers.
5. Learn and Guide simulator links opened the form.
6. Comparison opened from Protect jumped the tab to Learn.
7. Vouchers promised "future GREAT EMPOWER insurance purchases".
8. The fictional advisor booking was on Home.
9. Co-payment had two definitions.
10. One BNM link returned 404.

## Implemented changes

### In-app application (new)
- `src/data/application.ts`: the application model, preference options, the health questions and all validation.
  - Rules: adults (18+), a Malaysian mobile number, a valid email; every choice is required; the declaration is required.
  - Pure functions, covered by `src/data/application.test.ts` (5 tests).
- `src/state/application.ts`: the device-only store (save and delete).
- `src/app/protect/ApplyFlow.tsx`: the flow, at `#app/protect/apply/<area>/<step>`.
  - Steps: `details → cover → health → review → done`.
  - "Step n of 4" with a progress bar, and links to earlier steps (✓ when valid, ⚠ when unfinished).
  - Every edit is saved, so Back and leaving never lose answers.
  - **Prefilled:** your name from the account and existing cover from your check.
  - **Errors:** an error summary (focusable, `role="alert"`) whose links focus the field, plus inline messages with `aria-invalid`.
  - **Review:** every answer, with Edit links and the declaration.
  - **Done:** the honest status card, what this means, next steps (adviser guidance, view or edit, back to Protect) and a two-step **Delete this application**.
  - Editing a completed application turns it back into a draft.
- `src/account/session.ts`: the application key was added to the account keys cleared on (re)seeding, so a demo reset also wipes drafts. This is the only line changed in account code.

### Get cover (reworked)
- **Step 3, "Apply":** the in-app application is the main card, with a crimson CTA that reads "Start", "Continue" or "View your application" depending on progress. "Want help first? Talk to an adviser" is a secondary card.
- **The external "Apply online" handoff and its insurer plan cards were removed.** Old `…/online` links forward to the in-app application.
- **Adviser page:** labelled "Guidance, not an application".
  - Still covers: when an adviser helps, questions to ask, what to bring (including your check answers), how to check who you're talking to.
  - Links to an insurer's official call-back page (the one external link, on the assistance path).
  - "Apply in GREAT EMPOWER" links back to the in-app application.
- **Chooser:** chips show "Application draft saved" or "Application completed in the app".
- **Independence wording updated everywhere:** applications completed here stay on the device, aren't sent to an insurer yet, and don't give cover.

### LifeTrack
- The Home card is a link to https://lifetrack-plum.vercel.app/ (`target="_blank"`, `rel="noopener noreferrer"`).
  - Its text says it "has its own website. It opens in a new tab, and GREAT EMPOWER stays open here."
  - The button reads "Play LifeTrack ↗" for screen readers and sighted users alike.
- The notification "Play LifeTrack" opens the same URL in a new tab.
- **Removed:** `src/app/game/GameShell.tsx`, `src/app/game/gameRoute.ts`, the in-app game layer in `ApplicationApp.tsx` and the `.ge-game-*` CSS.
- Old links `#app/play/lifetrack` and `#app/simulate/lifetrack` land on Home.
- The URL lives in one place: `src/app/game/lifetrack.ts`.

### First-pass changes kept
- **Protect** owns the check (`#app/protect/check`), the gaps (no pre-ticked priorities), product comparison (`#app/protect/products`) and Get cover.
- **Simulate** is tools only, each saying what it shows, what you'll need and what it can't tell you.
- **Learn and Guide** simulator links open the named tool.
- **BNM link** replaced.
- **Co-payment** has one definition.
- **Booking demo** labelled "Demo · nothing is booked" and moved off Home.
- **Vouchers** are described in the UI as collectible rewards.

## Product flow

```
Home ─ Your next step: Learn → Check (Protect) → Compare
Protect ─ Check → Gaps → Understand → Compare → Apply
   Get cover: pick cover → 1 Basics (optional simulator · Skip) → 2 Ready (checklist) → 3 Apply
      ├─ Apply in GREAT EMPOWER → details → cover → health → review → done (completed in app · not sent)
      └─ Adviser guidance (assistance only) → official call-back example · or back to the in-app application
Simulate ─ what-if tools only → "What next?" → Protect
Learn ─ concepts · Guide ─ how-tos, checklist, booking demo · Rewards ─ points for learning
Home ─ LifeTrack card → https://lifetrack-plum.vercel.app/ (new tab)
```

## Accessibility and responsive behaviour

- Choices are radio groups: labelled, arrow keys move between options, roving tab index. The declaration uses real checkboxes.
- The error summary receives focus, and every field error is linked with `aria-describedby`.
- Steps use `aria-current`, and the progress bar has `role="progressbar"`.
- **Focus rings:** `TextField` draws its ring with `:focus-within`. In the application I turned off its 200 ms transition so the ring appears immediately, which is also what the QA focus probe needs.
- **LifeTrack label:** the button's accessible name contains its visible text, fixing an axe `label-content-name-mismatch` from the first pass.
- **Responsive:** checked at 375, 390, 768, 1280 and 1440 px on 39 routes. On small phones, form choices wrap, the CTA rows stack, and the review lists become one column.

## Tests

| Command | Result |
|---|---|
| `npx tsc -b` | Pass |
| `pnpm test` | 201/201 (5 new application tests) |
| Device-only `vite build` | Pass; 0 Supabase URLs in the bundle |
| `pnpm qa:ui` | PASS: 39 routes × 5 widths, 0 failures, 0 warnings |
| `pnpm qa:smoke` | 229 passed, 0 failed (includes the new journeys) |
| `pnpm qa:a11y` | **Incomplete:** the run was stopped for low system memory after 12 tests (all passed). The earlier full run before the apply flow passed 74/74. |
| `pnpm qa:visual` | **Not run after the correction.** Home, Protect and the Learn hub changed on purpose (LifeTrack card, "Apply" wording), so their baselines are expected to differ. Review the diffs, then run `pnpm qa:visual:update`. |

Committed at the owner's request before the accessibility and visual runs finished.

**New or updated interaction tests:**
1. **Get cover:** every category opens; Skip, Ready and Apply work; adviser guidance works; adviser → in-app application works; the old `/online` link forwards in-app.
2. **Apply in app:**
   - errors on an empty submit and an invalid mobile number;
   - Back keeps answers;
   - review shows the answers;
   - the declaration is required;
   - completion shows "Sent to an insurer: No";
   - no "submitted / approved / reference number / policy number" claims;
   - never leaves the app.
3. **LifeTrack:** the Home card links to the exact URL in a new tab, and the old game hash lands on Home.
4. First pass: the check lives in Protect, nothing is pre-selected, and Simulate opens on its tools.

## Remaining issues and decisions for the owner

1. **Real submission.** Sending applications to an insurer needs one of two things, plus legal and compliance review of data handling:
   - a commercial partnership with an insurer API; or
   - a GREAT EMPOWER backend with licensing and consent.

   Until then, completion stays "in the app only". GREAT EMPOWER must still not imply a partnership with Great Eastern.
2. **Sensitive data on the device.** Yes/no health answers and contact details are kept in this browser's storage for the account until deleted. The app says so and offers Delete. Decide whether that's acceptable, or whether health answers should be session-only.
3. **Vouchers.** The UI calls them collectibles. The catalogue text and `VOUCHER_TERMS` in the protected `src/rewards` still mention a future insurance purchase, and `economy.test.ts` asserts that wording. Retire them, or reword at the source and in the server migration.
4. **Product set.** The verified product explorer is still mostly agent-sold riders.
5. **Direct-channel date.** The Learn hub says "July 2018"; a BNM document summary says 1 March 2019. Not verified, not changed.
6. **Not done:** a beginner order for Learn, and a quick mode for the medical bill simulator.
7. **Pre-existing build notice:** `GuideCentre.tsx` is statically imported by `src/account/*`, so its lazy chunk is ineffective.
8. **Not tested:** real devices and screen readers.

## Source used (opened 28 Nov 2026)

- [Great Eastern Life — Request a call back](https://www.greateasternlife.com/my/en/personal-insurance/request-a-call-back.html): the adviser-path example.
