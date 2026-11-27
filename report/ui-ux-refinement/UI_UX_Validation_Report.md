# UI/UX Validation Report

All results below were **run on 2026-11-27**:
- A device-only build (empty Supabase variables) was served locally with `vite preview`.
- Headless Chrome was driven over CDP.

## 1. Automated checks
| Check | Command / method | Result |
|---|---|---|
| Unit tests | `node --experimental-strip-types --test $(find src -name "*.test.ts")` | **192/192** |
| Engine 2 (frozen) | `engine-2.test.ts` | **69/69**; no diff to `src/calculation-engine/` |
| Engine 3 | `engine-3.test.ts` | **9/9** |
| Protection content | `protection.test.ts` (no checkout wording, verified products, required ≠ distinctions) | **7/7** |
| Typecheck | `npx tsc -b` | Pass, at HEAD **and at each of the 3 commits** individually |
| Production build | `npm run build` | Pass |
| Device-only build | `VITE_SUPABASE_URL= VITE_SUPABASE_PUBLISHABLE_KEY= vite build` | Pass |

## 2. Responsive and route checks (`verify-ui.mjs`)
**Coverage:** 21 routes × 5 viewports (375, 390, 768, 1280, 1440) = **105 combinations.** Routes:
- Home, Learn, Protection hub and 5 categories
- Simulate; Needs plus two tool deep links
- Analyze, Guide, Rewards, wallet, marketplace
- A video, an infographic, a lesson, Notifications

| Check | Result |
|---|---|
| Horizontal overflow | **0** in all 105 |
| Broken images (390, 1280) | **0** |
| Exactly one H1 per page (390) | **Yes** for all 21 |
| Tap targets under 24 px outside running text (390) | **0** |
| Console errors or warnings | **0** |
| Failed requests / HTTP ≥ 400 | **0 / 0** |
| Supabase requests | **0** |

## 3. Feature checks (Tested)
| Area | Result |
|---|---|
| Removed About | `#app/about` falls back to Home. No `#app/about` or `#foundation` links anywhere. `#foundation` shows the app. |
| Home | "Start here" shows Hospital, Illness, Family, Disability, Accident. The button opens `#app/learn/protection`. |
| Hub risk rows | 5 rows (event: problem). Tapping row 2 opens Critical Illness. |
| Comparison grid | Use any time: Yes/No/Partly · Big sum for covered event: No/Yes/No · Can grow: Partly/No/Yes · Can lose value: No/No/Yes. **Marks align with headers** (centre x measured: 390 px 78/195/312 = 78/195/312; 768 px 342/494/645 = 342/494/645; 1280 px 577/820/1063 = 577/820/1063). |
| Bill breakdown | You pay **RM2,190**, insurer **RM9,810** (RM12,000 − 600 − 500 = 10,900; 10% = 1,090) |
| Checklist | Tapping "Deductible?" shows its answer; `aria-expanded` is true on that chip only |
| Channels | Online, direct · Agent or adviser · Your employer |
| Category pages (×5) | Correct H1. "A is not the same as B" readable by screen readers. **All details collapsed on load.** 3 myths each. Products present (Medical 6, CI 1, Life 1, TPD 1, PA 1). Expanding GREAT MediValue shows "V00/0526". External links `noreferrer`. |
| Simulate tabs | Medical bill selected by default; **1 visible panel**; ArrowRight moves selection and focus; Family example RM40,000 / RM44,000; CI example RM58,000; **Family result kept after switching tabs**; bill simulator and emergency fund render when selected; the CI deep link from the category page selects the CI tab |
| Analyze (empty) | One "Answer your profile…" panel; **0** repeated "Complete your profile" links |
| Rewards hub | 4 food items; "All 10 items"; the points-no-cash-value note shown; footer notice present |
| Rewards regression (`verify-device-only.mjs`) | Wrong quiz +0; perfect +50 once; infographic +20; video skip 0 s; voucher −1,000; persists on reload; reset → 2,450 — **identical to before** |

## 4. Text density (Verified, measured at 390 px in `<main>`)
| Page | Words before → after | Long paragraphs | Screens before → after |
|---|---|---|---|
| Protection hub | 770 → **517** | 7 → **2** | 5.8 → **4.6** |
| Medical | 1,497 → **358** | 8 → 4 | 9.2 → **2.9** |
| Critical illness | 680 → **351** | 5 → 4 | 4.4 → **2.7** |
| Simulate → Needs | 624 → **163** | 2 → **0** | 5.9 → **2.0** |
| Analyze | 169 → **105** | 0 → 0 | 1.9 → **1.3** |
| Rewards hub | 348 → **315** | 2 → 2 | 4.2 → **3.3** |
| Home | 82 → 99 | 0 → 0 | 1.7 → 1.8 (gained the protection entry) |

The remaining "long paragraphs" on category pages are the hero summary and the example story; both are intentional.

## 5. Screenshots (session scratchpad, not committed)
- **Before:** `C:\Users\Javy\AppData\Local\Temp\claude\07f93e74205d3b74\37eca0d9-b8b4-4063-a60d-7d202ab19df0\scratchpad\before\*.jpg`
- **After:** `C:\Users\Javy\AppData\Local\Temp\claude\07f93e74205d3b74\37eca0d9-b8b4-4063-a60d-7d202ab19df0\scratchpad\after2\*.jpg`
- **Extra after views (768/1440/1280):** `C:\Users\Javy\AppData\Local\Temp\claude\07f93e74205d3b74\37eca0d9-b8b4-4063-a60d-7d202ab19df0\scratchpad\ui2\shots\*.jpg`

## 6. Not tested
- Real phones and real screen readers (VoiceOver / TalkBack).
- The protected Vercel Preview: nothing new was deployed this phase.
- Colour contrast with an automated tool. Only existing token pairs were used; no new colours.
