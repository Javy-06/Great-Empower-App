# Simulator Validation Report

**Engine 3 calculation rules: unchanged.** The formulas still follow the V2 blueprint spec. Only the UI was improved, and one test was added.

## 1. Family Protection (Engine 3, pillar A)
| Check | Result |
|---|---|
| Formula | need = support × 12 × years + debts + other liabilities + final expenses (− savings in the printed-formula variant); cover = personal + κ × employer; gap = max(0, need − cover); ratio uncapped, 100% when need ≤ 0 |
| Savings conflict | Still explicit: both variants are shown side by side with plain labels. No decision has been approved. |
| Worked example | RM69,000 need, RM44,000 gap, 36.2%. Printed variant: RM65,000, RM40,000, 38.5%. Unit test **and** browser E2E. |
| Inputs | Amounts are digits only (no negatives), whole RM, up to RM100,000,000. Years 0–40. κ 0–100% in steps of 10. |
| Empty state | An empty field is "not entered", never zero. |
| **Fixed:** support years | The years were preselected (5, "Parents") when the profile said nothing about dependants. That was a silent default. Now nothing is preselected unless the profile sets it, and the result waits until a choice is made (E2E-verified). |
| Example preset | "Fill in the research example" fills the V2 persona visibly |
| Existing and employer cover | Employer cover counts only by the chosen κ. The slider appears only when employer cover is above 0. |
| Rounding | κ portion half-up to the sen (tested: 50.5 → 51, 1.5 → 2, 0.49 → 0) |
| Large values | RM100m × 12 × 40 stays exact (BigInt; tested). The displayed figure wraps (no overflow at 375 px; E2E). Amounts over RM100m give "That amount is too large for this illustration" (E2E). |
| Zero need / over-coverage | Gap RM0 and ratio ≥ 100%. **New:** "No gap in this illustration — the cover you counted meets the need" (E2E). |
| Negative raw need (savings above need) | The step shows a negative raw need; displayed need and gap are RM0 (tested) |

## 2. Critical Illness Recovery Runway (Engine 3, pillar B)
| Check | Result |
|---|---|
| Formula | runway = take-home × 12 × years; cover = personal CI + κ × employer CI; gap = max(0, runway − cover) |
| Recovery period | 1–5 years (source range). The slider starts at the research example of 3 years and is labelled as such. 0, 6 and 2.5 are rejected in the engine (tested). |
| Example | RM3,000, 3 years, RM50,000 gives a **RM58,000** gap. With RM20,000 employer cover at 50%: **RM48,000**, all three steps shown (E2E). |
| Zero income | Runway 0, gap RM0, ratio 100%, with the zero-gap message (E2E) |
| κ 0% / 100% | 0% ignores employer cover; 100% counts all of it (tested) |
| Invalid input | Income over RM100m is rejected (tested) |
| Interpretation | The result says "Estimated gap over N years". Assumptions state that the payout is assumed approved and is a lump sum, not a salary. The footnote says it isn't a quote or recommendation. |

## 3. Tests
- `src/calculation-engine/engine-3.test.ts`: **9/9 pass** (8 existing + 1 new edge-case test).
- Full app suite: **192/192 pass**.
- Browser E2E: every scenario check above passes (see `Preview_Testing_Report.md`).
