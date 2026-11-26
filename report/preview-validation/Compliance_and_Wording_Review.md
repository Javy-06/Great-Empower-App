# Compliance and Wording Review

This is an educational-language review. It is **not** a legal or compliance sign-off, which needs a qualified reviewer.

## 1. Risk areas checked
| Risk | Finding | Action |
|---|---|---|
| Guaranteeing claims | Category summaries said "Pays…" without qualifiers in two places | Life: "subject to the policy's terms and exclusions". PA: "as defined in the policy". The CI example already says "if approved". |
| Implying cover despite exclusions | Each category lists "doesn't automatically cover", plus a footnote: "Every policy's wording, limits and exclusions decide what is actually paid" | Kept |
| Generic calculation read as personalised advice | The tools are generic but use the user's own numbers (a grey zone in the research) | The footnote now says: "An educational illustration from your own numbers — not a quote, a needs analysis, a recommendation to buy any amount or product, or a promise that a claim would be paid." Results never link to a product. |
| Definitive wording where policies vary | "may", "usually", "often" used throughout | Kept. Free-look changed to "usually 15 days" (sourced). |
| Insurance vs savings vs investment | Hub section explains each; investment-linked values "aren't guaranteed" | Kept |
| Life insurance vs loan protection | "Life insurance ≠ Debt cancellation"; loan-linked cover described as a separate policy type | Kept |
| CI lump sum vs income | "CI ≠ income replacement"; the runway tool says the lump sum is "not a monthly salary" | Kept |
| Medical = zero out-of-pocket | Dedicated hub section "Insurance coverage ≠ zero out-of-pocket cost" plus the bill-split diagram | Kept |
| Overstated product facts | Every product fact re-verified; labels say where each fact comes from (official page or PDS) | Several revisions (see the content verification report) |
| Regulatory overstatement | "BNM requires insurers to offer…" (direct channels) and "must offer co-payment" were stronger or looser than the sources | Rewritten to the exact source scope |
| Misleading terms | "Income Protection" as TPD's purpose | Paired with "TPD ≠ a monthly salary" and the lump-sum vs income diagram. Kept. |

## 2. Disclaimers: do users understand…
| Message | Where it appears |
|---|---|
| These are educational illustrations | Scenario header ("Generic educational scenario — not based on any product"); scenario footnote; page disclaimer |
| Results use the user's own assumptions | Empty state ("Nothing is assumed for you"); Assumptions panel; footnote "from your own numbers" |
| Results aren't quotes | Scenario footnote; product section ("Not a recommendation or quote"); the minimum premium labelled "not a quote for you" |
| No guaranteed claim outcome | CI assumption ("assumed to be approved… depends on the definition…"); footnote ("not… a promise that a claim would be paid") |
| Policy wording decides | Category footnote; page disclaimer |
| No product recommendation | Products "in no particular order", "not a recommendation"; the hub says GREAT EMPOWER doesn't recommend products |

The tone stays short and friendly. There is one disclaimer block per page, not repeated warnings.

## 3. Changes made (commits `e7d5fcd`, `3410c78`)
- Life and PA summary qualifiers.
- The scenario footnote now names "quote" and "recommendation to buy any amount or product".
- A "No gap in this illustration" message, so a zero result isn't read as "you're fully protected" without context.
- Regulatory wording aligned to sources (co-payment, direct channels, FMOS, MediAsas, guarantee letters).

## 4. Remaining concerns (need qualified review)
1. **Personalised gap tools.** Under FSA 2013, "analysing the financial planning needs of a person relating to an insurance product" is financial advisory business. Generic illustrations with no product link are designed to stay educational, but **a compliance opinion is recommended before a public launch.**
2. **Showing a real insurer's product names and facts.** This is neutral and sourced, not ranked, and carries the not-affiliated notice. The research's compliance map suggests confirming the approach for "neutral comparison" features.
3. **Facts age.** Product facts are dated (27 Nov 2026) and should be rechecked before every release.
