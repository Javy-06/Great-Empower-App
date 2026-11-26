# Insurance Protection Experience — Change Log

Branch `redesign/overnight-product-refresh`. Base for this phase: `2474f44`. No migration, database, Production or Engine 2 change.

## 2026-11-27

### `118ece9` — Engine 3 (pillars A and B)
- Added `src/calculation-engine/engine-3.ts`:
  - `calculateLifeGap` returns two labelled variants because of the source conflict.
  - `calculateCiRunway`.
  - Exact BigInt sen arithmetic, half-up κ portion, floored gaps, uncapped ratios.
  - Step-by-step working and assumptions; validation with field-level errors.
- Added `src/calculation-engine/engine-3.test.ts` (8 tests).

### `5c64ce2` — Protection content and researched products
- Added `src/data/protection.ts`:
  - Five categories, each with an official name and a purpose name.
  - Summaries, illustrative examples, what each may help with and doesn't automatically cover, misunderstandings, "≠" distinctions and sourced Malaysian facts.
  - 8 verified products plus 1 issuer notice from the audited Product Master.
- Added `src/data/protection.test.ts` (7 tests).

### `fd980a6` — UI and routes
- Added `src/app/protection/ProtectionHub.tsx`:
  - Hub with the two-names key, category links, bill-split diagram, insurance vs savings vs investing, before-you-buy checklist, buying channels, safety nets and research note.
  - Category pages with an example, may/may-not lists, the ≠ callout, myths, Malaysia facts, a visual guide or lump-sum diagram, a scenario link, product cards, sources, previous/next and a disclaimer.
- Added `src/app/protection/ProtectionScenarios.tsx`: family protection and CI recovery runway tools.
- `LearnDashboard.tsx`:
  - Added the routes `#app/learn/protection[/<slug>]`.
  - Added a button from the protection topic's purposes band.
- `LearnMedia.tsx`: "Protection explained" card on Learn home.
- `SimulateHub.tsx`:
  - Tools 3 and 4, and the `#app/simulate/needs/<tool>` deep links, including a hash change while Simulate is open.
  - Updated the intro copy.
  - The plan step links to Protection explained.

### Reports commit
- Added `report/insurance-phase/` (these five reports) and `docs/protection-experience.md`.

## Testing and live-project note
- **E2E:** one early run used a build with the live Supabase settings, which created 1 anonymous demo account (2026-11-26 19:20 UTC). Later runs were device-only.
- **The account was not deleted.** Live invariants were checked read-only: 0 mismatches.
