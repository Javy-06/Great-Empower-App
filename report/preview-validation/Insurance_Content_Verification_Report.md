# Insurance Content Verification Report

**Re-verified:** 27 November 2026. Every official link shown in the Protection Experience was reopened.

**How it was read:**
- HTML pages were fetched.
- PDS files were downloaded and read page by page.
- All quoted facts below come from those reads. Nothing was carried over unchecked from the 22 Nov 2026 Product Master.

**Code changed:** `src/data/protection.ts`, `src/app/protection/ProtectionHub.tsx` (commit `e7d5fcd`).

## 1. Regulatory and consumer sources
| Source | Date / version | Verified | App change |
|---|---|---|---|
| BNM press release: co-payment requirements (`bnm.gov.my/-/mhit-req-en`) | 6 Jul 2024 | From 1 Sep 2024, insurers and takaful operators "must offer consumers an option to purchase MHIT products with a co-payment feature". **No 5%/RM500 figures on this page.** Exemptions: emergency treatment (including accidents), outpatient follow-up for critical illnesses such as cancer or dialysis, government healthcare facilities. | Wording now says an *option* must be offered and plans without co-payment can still be sold. Added the BNM exemptions. |
| BNM MHIT hub (`bnm.gov.my/mhit`) | Live page | "The Base MHIT Plan, now known as MediAsas". Pilot from end July to October 2026. "Final product features and pricing will be published during its nationwide launch in January 2027." | The MediAsas sentence was rewritten (piloting; national launch scheduled January 2027). The source link moved from the base-plan page (which doesn't use the name MediAsas and says "early 2027") to the hub. |
| BNM MediAsas FAQs, Version 1: Pilot Programme | 29 Jul 2026 | See `MediAsas_Readiness_Report.md` | Added as a source on the Medical page |
| BNM notice: direct distribution channels for pure protection | Issued 23 Jun 2017 | Commission-free standalone pure protection through direct channels: term from 1 Jul 2017; CI and medical from 1 Jul 2018 | Rewritten to these exact dates. The old wording ("BNM requires insurers to offer…") was stronger than the source. |
| PIDM TIPS page | Live (© 2026) | RM500,000 for eligible life policy / family takaful benefits, including death and disability. Membership compulsory for licensed insurers and takaful operators. | No change (the app says "eligible life insurance benefits… up to RM500,000") |
| FMOS (`fmos.org.my`) | Bot-verification page; content not readable by the checker | Not verifiable directly. The Star (24 May 2026) and a BNM-linked FAQ confirm escalation to FMOS after the insurer's internal process. | Removed the unverified "for free". Now: complain to the insurer first; if still unhappy with the final decision, take an eligible dispute to FMOS. |
| InsuranceInfo glossary | Page dated 27 Nov 2026 | Free-look "usually 15 days" for individual life or health policies, refund less medical-exam costs; waiting period example 30 days | The free-look item now says "usually 15 days" and links the glossary |
| The Star, "When coverage runs thin" | 24 May 2026 | Industry statistics via the LIAM CEO: 94% initial and 97% final guarantee letters approved. "The biggest reasons for decline were non-disclosure of pre-existing conditions or general exclusions." | Reworded precisely: "one of the biggest reasons hospital guarantee letters are declined" (it was "claims are declined") |

## 2. Products (still 8 verified products + 1 notice; no product added or removed)
| Product | Source checked (date / version) | Verified now | Removed or revised | Still unknown |
|---|---|---|---|---|
| GEGM individual medical notice | GE announcement (undated page) | New applications stop from 1 Nov 2026 (applications accepted to 31 Oct 2026). Existing coverage unchanged. GELM and GETB not affected. No products named. | Added "GELM/GETB not affected" | Which products |
| SMART Health Protector (GELM) | Product page, **1 Oct 2026** (was 11 May) | Investment-linked medical rider; RM3,000,000 annual limit; no overall lifetime limit; deductible options from RM500 per policy year; **entry age 14 days–70 ANB** (59 for one option); call-back from a Life Planning Advisor | Date updated; entry age added; how-to-apply made concrete | PDS terms, waiting periods, exclusions |
| GREAT MediValue (GELM) | PDS **V00/0526** (3 pp.) + page **11 May 2026** | Plan 200: RM3,000,000 annual limit; no lifetime limit; RM200/day room and board; RM500/RM2,500 deductible per policy year; **H&S 20% co-insurance up to RM20,000 per policy year, if applicable**; **waiting periods 30 days (illness) and 120 days (specified illnesses)**; renewal guaranteed but COI not guaranteed | **Type corrected:** a rider on selected regular-premium investment-linked plans, not "optional under an eligible life policy". **Removed the old RM5m conflict note:** the page and PDS now agree on RM3m. | Coverage term (placeholder 80/100) |
| GREAT Medic Shield 2 (GELM) | Product page **1 Jun 2026** | Yearly renewable standalone plan; annual limit up to RM150,000, no overall lifetime limit; RM300 deductible per disability; R&B up to RM200/day; renewable to age 100 next birthday | **Facts added** (previously "identity only") | Open to new applicants? Entry age? Current PDS? |
| GREAT Medic Lite Secure (GELM) | Product page **1 Jun 2026** | Only existing policyholders of selected plans; switch without waiting period or underwriting; the existing plan is terminated; R&B up to RM150/day; deductible from RM2,500 per policy year (resets yearly) | **Facts added**; type clarified | Exact eligibility, limits per option |
| i-Great Medi Care (GETB, takaful) | Product page (no "correct as at" date) | Standalone step-up contribution medical takaful without savings or investment; direct online channel with no intermediaries; cover to age 80 next birthday; no co-takaful; no medical exam | **Removed the PDS link:** that file's metadata dates it to 2019, and the page now links a different PDS (not reviewed). Facts added from the page. | Entry age, limits, deductible, contributions, current PDS |
| SmartProtect You (GELM) | Product page **1 Aug 2026** | Investment-linked; death and TPD (TPD before age 75 next birthday); **entry 16–70 ANB**; from RM100/month (RM1,200/year minimum); "Talk to us" call-back from an advisor | Entry age and the TPD age limit added | Charges, rider terms |
| Smart Multi Critical Care (GELM) | PDS **V03/1123** (3 pp.) + page **"correct as at 1 June 2024"** | Unit-deduction CI rider; multiple claims by stage; up to 800% of rider sum assured, capped at RM5m per life before 85 next birthday (aggregated across the company's CI cover); early stage 50%, capped at RM300k per claim; **waiting 30 or 60 days; survival 7 or 14 days** | Waiting and survival periods added. Status now says the page is dated 2024, so availability needs confirmation. The page's "860%" is the 800% plus 60% special benefits, which isn't a conflict. | Condition count (page shows 178 **and** 188); current availability |
| GREAT Shield Active (GEGM) | PDS **valid as at 31 May 2026** (4 pp., EN + BM) | Issuer GEGM; entry 30 days–70 years, **renewable up to age 100**; 12-month cover renewed yearly; citizens, permanent residents or legally residing foreigners; sum-insured limits by age and occupation class; exclusions include pre-existing conditions, self-inflicted injury, war risks, illegal or dangerous activities or sports; sample premium labelled "as an illustration" | **Corrected:** the PDS does not say renewal is "subject to the insurer being satisfied about your health". That condition (from the earlier master) was removed. How-to-apply now reflects the PDS ("through your agent/intermediary"). | Full wording; occupation-class benefits |

Not shown, as before: the 34 product names that are only research-reported, legacy or pending.

## 3. Facts removed or revised (summary)
1. GREAT Shield Active: the renewal health condition was removed (not in the current PDS).
2. GREAT MediValue: the product type was corrected, and the outdated "different annual limit in an older version" note was removed.
3. i-Great Medi Care: an outdated (2019) PDS link was removed.
4. Medical co-payment: the claim now matches BNM exactly (an option must be offered, with exemptions).
5. MediAsas: the timing claim is now sourced to the BNM hub and pilot FAQ, and states the pilot status.
6. Direct channels: softened to the dated 2017 notice.
7. FMOS: "for free" removed (not verified at the source).
8. Non-disclosure: reworded to the article's actual claim (GL declines).

## 4. Unresolved
- **SMCC:** condition count (178 vs 188) and current availability (page dated 2024).
- **GMS2:** whether it's open to new applicants.
- **i-Great Medi Care:** current PDS contents.
- **FMOS:** its own page couldn't be read (bot check).
- **Two bnm.gov.my pages** return 403 to scripted link checkers but load normally in a browser and fetch tool.
