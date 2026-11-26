# Insurance Protection Experience — Implementation Report

**Branch:** `redesign/overnight-product-refresh` (remote `app`)
**Worktree:** `C:\Users\Javy\Downloads\GREAT-EMPOWER-redesign`
**Date:** 2026-11-27
**Commits:** `118ece9`, `5c64ce2`, `fd980a6`, plus the reports commit.

## 1. Starting point (verified before work)
- **Branch and status:** on `redesign/overnight-product-refresh`, clean apart from the six protected, untracked `public/advisor` portraits. HEAD was `2474f44`.
- **Rewards phase:** closed and approved. The v3 and v4 migrations were not touched or rerun, and no live database change was made in this phase.
- **Inspected before changes:**
  - The app's navigation and architecture.
  - The Learn, Simulate, Analyze and Guide areas.
  - The Engine 2 medical bill simulator, the design tokens and existing components.
  - Research, read-only:
    - `Malaysia youth insurance protection gap.md`
    - `docs/insurance-engine/` in the design-system worktree: the product master, source register, verification gaps and the engine 3 and 4 specs.

## 2. What already existed and was reused
| Existing piece | How it was used |
|---|---|
| Learn: five category infographics, four videos, protection lessons and the "Eight financial protection purposes" | Category pages link to the matching infographic, so its quiz still pays reward points. The purpose names were reused. |
| Simulate: profile → needs → plan; Engine 2 medical bill simulator; emergency fund calculator | Kept unchanged. The new scenarios are tools 3 and 4 on the same Needs step. Category pages deep-link to tools 1 and 2. |
| Profile store (age, income, dependants) | Prefills the CI income and the family support-years preset, labelled as "from your profile". |
| `PageHero`, `Container`, colour tokens, `ge-input`, `ge-range` | Used throughout. No new tokens, components, libraries or dependencies. |

**Gaps found:**
- No category explainer used both an official name and a purpose name.
- No scenario covered life/family or critical illness.
- No product information appeared anywhere in the app.
- An audited product master existed, but only in the design-system worktree.

## 3. Scope chosen (smallest coherent version)
1. **Protection explained.** A Learn hub plus five category pages using the two names:

   | Official category | Protection purpose |
   |---|---|
   | Medical & Hospitalisation | Medical Expense Protection |
   | Critical Illness | Critical Illness Recovery |
   | Life | Family Financial Protection |
   | Total and Permanent Disability (TPD) | Income Protection |
   | Personal Accident | Accident Protection |

2. **Two generic scenario simulators** in Simulate: family protection (life) and critical illness recovery runway. They are built on a new product-agnostic engine, Engine 3 pillars A and B.
3. **Product exploration.** A neutral, sourced list on each category page, limited to officially verified facts.

**Deliberately not built:**
- An income-interruption simulator. The research spec (Engine 4) marks its only model as "candidate — not approved, not active", so it needs your approval first.
- Product-specific calculations. The verification-gaps release gate is not met for any product.
- Medical and emergency gap pillars and the four-tier classification. They have no approved formula.
- Any checkout, quote, ranking or "recommended for you" feature.

## 4. Screens and user journey
```
Learn home ─► "Protection explained" card ─► Hub
   Hub: two names · five category links · "Coverage ≠ zero out-of-pocket" bill-split diagram
        · insurance vs savings vs investing · six things to check before buying
        · how buying works (direct vs agent, eligibility, takaful) · FMOS/PIDM safety nets
        · research note (8 verified products, 34 unverified names withheld)
   Category page: purpose (H1) + official category · summary · illustrative example
        · may help with / doesn't automatically cover · "A ≠ B" distinction · myths vs reality
        · Malaysia facts with sources · visual guide (infographic → quiz) or lump-sum diagram (TPD)
        · Simulate call-to-action (deep link) · researched products · sources · previous/next
Simulate ► Needs: 1 Medical bill · 2 Emergency fund · 3 Family protection (new) · 4 CI runway (new)
   Each new tool: inputs (nothing assumed; "enter 0 if none") · "fill in an example"
        · result with cover-vs-need bar · "How this was calculated" (formula + working per step)
        · Assumptions · What could change the result · source and limitation note
```

**Routes:**
- `#app/learn/protection` and `#app/learn/protection/<medical|critical-illness|life|tpd|personal-accident>`. An unknown category falls back to the hub.
- `#app/simulate/needs/<tool-bill|tool-fund|tool-family|tool-ci>` opens the Needs step and scrolls to the tool, including when Simulate is already open.
- **Entry points:** the Learn home card, a button on the Learn protection topic page, the Simulate Needs intro and the Simulate plan step ("Protection explained").
- The primary navigation is unchanged: still five destinations.

## 5. Key decisions
1. **Placement:**
   - The categories live in Learn ("Understand") and the scenarios in Simulate.
   - There is no new top-level destination, as AGENTS.md requires.
2. **Purpose names:**
   - Medical, CI and Life reuse the existing purpose list.
   - TPD and PA use the brief's "Income Protection" and "Accident Protection".
   - TPD is explicitly "≠ a monthly salary", with a lump-sum vs regular-income diagram.
3. **Life-need conflict:**
   - The source formula subtracts savings; its worked example doesn't.
   - The tool shows **both** results side by side with plain labels, as the spec permits, rather than choosing one.
4. **No silent assumptions:**
   - Empty inputs stay empty, and the result asks for every amount.
   - Research example values (final expenses RM25,000, a 3-year recovery, 5 or 10 support years) are visible and editable, and labelled as research examples.
   - Employer cover counts at **0% by default**. A slider (0–100%) appears only when employer cover is entered, and it notes the research example of 50%.
5. **Products:**
   - Only the 8 VERIFIED_OFFICIAL records and one issuer notice are shown, each with its type, status, how to apply, verified facts, what still needs confirmation and official source links.
   - The GREAT Shield Active sample premium is hidden because it is an illustration, not a quote.
   - The SmartProtect You RM100 minimum premium is shown, labelled "not a quote for you".
6. **Compliance zone:** education and generic illustration only. Results are never linked to a product, and every page carries a not-advice disclaimer.

## 6. Files changed
| File | Change |
|---|---|
| `src/calculation-engine/engine-3.ts` (new) | Engine 3 pillars A and B |
| `src/calculation-engine/engine-3.test.ts` (new) | 8 tests |
| `src/data/protection.ts` (new) | Category content, sources, researched products |
| `src/data/protection.test.ts` (new) | 7 tests |
| `src/app/protection/ProtectionHub.tsx` (new) | Hub and category pages |
| `src/app/protection/ProtectionScenarios.tsx` (new) | Family and CI scenario tools |
| `src/app/LearnDashboard.tsx` | Protection route and a link from the protection topic page |
| `src/app/learn/LearnMedia.tsx` | "Protection explained" card on Learn home |
| `src/app/SimulateHub.tsx` | Tools 3 and 4, deep links, intro and plan-step links |
| `docs/protection-experience.md` (new) | Developer notes |
| `report/insurance-phase/*` (new) | These reports |

**Not touched:**
- Engine 2 (`engine-2.ts`) and `src/app/medical-claim/*`
- Rewards, account and Supabase code
- Migrations
- `public/advisor/*`
- Production

## 7. Ready for demonstration?
**Yes.** The feature is ready to demonstrate with a device-only or cloud account on the preview build (after the branch is deployed to Preview). The content is educational, and every product fact is sourced and dated.
