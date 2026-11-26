# Insurance Protection Experience — Content Accuracy Report

## 1. Research sources used
| Source | Location | Used for |
|---|---|---|
| Product Master: `product-master.json`, `product-catalogue.md`, `source-register.md`, `verification-gaps.md` (reviewed 22 Nov 2026) | Design-system worktree `docs/insurance-engine/product-master/`, read-only | Every product name, issuer, contract basis, type, status, channel and verified fact |
| Engine 3 spec `engine-3-protection-gap.md` (from the V2 blueprint pp. 14–15) | `docs/insurance-engine/calculation-rules/` | Life and CI formulas, research example values, the source conflict |
| Engine 4 spec `engine-4-income-shock.md` | Same | The reason no income-shock simulator was built (its model is unapproved) |
| *Malaysia youth insurance protection gap* (research report) | `Downloads/` | Category purposes, Malaysian context, misunderstandings, purchase channels, the compliance zones |
| Existing in-app infographics and their quiz text | `src/data/quizzes.ts`, `public/media/learn/infographics` | General category facts, for consistency with the app |
| Official links cited in the UI | BNM (co-payment, Base MHIT/MediAsas, direct channels), PIDM TIPS, InsuranceInfo glossary, FMOS, The Star (24 May 2026), Great Eastern product pages and PDSs | Shown beside the statements they support |

URLs come from the research source register. **I did not re-open them online in this phase.** The research dates (22 Nov 2026 for products) are shown in the UI.

## 2. Verified vs unverified — products
| Product | Evidence | Shown | Withheld or flagged |
|---|---|---|---|
| SMART Health Protector (GELM) | VERIFIED_OFFICIAL (product page, 11 May 2026) | RM3m annual limit; no overall lifetime limit stated; deductible from RM500; a rider on selected investment-linked plans | Variants, sub-limits, eligibility, waiting periods, exclusions, premium |
| GREAT MediValue (GELM) | VERIFIED_OFFICIAL (PDS V00/0526) | Plan 200 RM3m annual limit; no lifetime limit stated; RM200/day room and board; RM500/RM2,500 per policy-year deductible options; guaranteed renewal, cost of insurance not guaranteed | The earlier RM5m claim (a version conflict), co-insurance details, coverage term (a placeholder) |
| GREAT Medic Shield 2 (GELM) | Identity only | Type and unknown status | All terms (the PDS has placeholders and may be historical) |
| GREAT Medic Lite Secure (GELM) | Identity and status | Existing qualifying policyholders only | All terms |
| i-Great Medi Care (GETB, takaful) | Identity and channel | Standalone medical takaful; official direct online page | All terms, including the coverage age (not in the master's verified fields) |
| SmartProtect You (GELM) | VERIFIED_OFFICIAL (page, 1 Aug 2026) | Investment-linked; death and TPD cover; RM100/month minimum premium labelled "not a quote" | Charges, lapse terms, riders |
| Smart Multi Critical Care (GELM) | VERIFIED_OFFICIAL (PDS V03/1123) | Multiple-stage claims; up to 800% of rider sum assured, capped at RM5m before age 85 next birthday; early stage 50%, capped at RM300k per claim | The condition count (the page says both 178 and 188), current availability |
| GREAT Shield Active (GEGM) | VERIFIED_OFFICIAL (PDS valid at 31 May 2026) | Entry 30 days–70 years; 12-month cover renewed to age 100 subject to health; residency, occupation and limit conditions; examples of exclusions | The sample premium and benefits (an illustration for occupation classes 1–2) |
| GEGM individual medical portfolio | Issuer notice | No new applications from 1 Nov 2026; existing policies continue | Which products it covers |

**Not shown at all:** the 34 product names marked RESEARCH_REPORTED, PENDING_VERIFICATION or HISTORICAL_LEGACY. The hub states that they exist and are withheld.

## 3. Verified vs general — category content
| Statement type | Treatment |
|---|---|
| Malaysia-specific facts: co-payment option since 1 Sep 2024; MediAsas scheduled for January 2027; PIDM up to RM500,000 for eligible life benefits; BNM direct channels for simple protection; non-disclosure as a main reason claims are declined | Each has a source link next to it |
| General insurance concepts: limits, waiting periods, exclusions, lump sum vs income, term vs whole life, takaful open to non-Muslims, TPD definitions and age limits | Worded generally ("may", "usually", "often", "check your policy"). The research report flags some background definitions as needing checks against official consumer education. These are standard industry meanings, so they should get one compliance review before any public launch. |
| Free-look period | Mentioned **without a number of days**, because the length wasn't verified in this phase |
| "Basic plans from about RM40/month" (infographic quiz text) | **Not used** in the new pages |
| Example people (Aina, Wei Ming, Daniel, Priya, Hafiz) | Fictional, labelled "Example situation (illustrative)" |

## 4. Required distinctions (all present and tested)
- Life insurance ≠ debt cancellation: the payout goes to the nominee or estate; loan-linked cover is a separate type.
- Critical illness ≠ income replacement: it is a one-off lump sum on a qualifying diagnosis.
- Medical insurance ≠ all medical expenses covered: only eligible costs within limits, after deductible and co-payment.
- Also added: TPD ≠ a monthly salary; personal accident ≠ medical insurance.

## 5. Calculation accuracy
- The formulas are exactly the Engine 3 spec's pillars A and B.
- The worked persona is reproduced exactly (RM69,000 / RM44,000 / 36.2%).
- The source conflict is surfaced, not resolved.
- Example values are labelled research examples and are editable.
- Employer cover is never counted unless the user chooses a percentage.
- A CI payout is explicitly assumed to be approved, which the UI states.
- Inflation and investment returns are excluded, which the UI states.
- No product data feeds any calculation.

## 6. Items needing verification before any public release
1. Re-check every product page and PDS link and its version. Product facts expire, and the master says to revalidate on new versions.
2. A compliance review of personalised gap tools, which the research report marks as a "grey zone": a generic illustration from the user's own numbers, with no product link.
3. The length of the free-look period and the "36 standard critical illnesses" wording, if added later.
4. A product-owner decision on the life-need conflict (whether savings count). The UI shows both meanwhile.
5. Approval of an income-interruption model (Engine 4 candidate) before building that simulator.
