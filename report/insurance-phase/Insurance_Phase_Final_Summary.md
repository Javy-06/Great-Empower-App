# Insurance Protection Experience — Final Summary

## Rewards security review
**PASS — CLOSED.**
- No new evidence of a defect.
- No rewards, database or migration code changed in this phase.
- v3 and v4 were not rerun.
- A read-only live check during this phase showed 0 balance/ledger mismatches.

## Status
**Complete and ready for demonstration.**

| Check | Result |
|---|---|
| App tests | 191/191 pass (Engine 2: 69/69, unchanged) |
| Typecheck | Pass |
| Build | Pass |
| Browser E2E | All checks pass, 0 console errors |

## What users can now do
1. **Learn → Protection explained.** Understand five kinds of cover through two names (official category and protection purpose):
   - what each may help with and what it doesn't automatically cover;
   - common myths, the key "≠" distinctions and sourced Malaysian facts;
   - what to check before buying, how buying works (direct or agent) and where to go if something goes wrong.
2. **See Great Eastern products from our research,** limited to facts verified in official documents:
   - type, status and how to apply;
   - what still needs confirmation;
   - official source links.

   There's no ranking, quote or purchase.
3. **Simulate → Family protection:**
   - estimate what dependants might need against the life cover you count;
   - both of the source's methods are shown, with every step of the working.
4. **Simulate → Critical illness runway:** compare a critical illness lump sum with a recovery period of 1–5 years.
5. **Jump between learning and simulating** with deep links: category page → matching tool → back to the category explainer.

## Main UI/UX improvements
- **Readable hierarchy:** the purpose is the H1 and the official category is a labelled chip.
- **Purposeful visuals:** a bill-split diagram ("coverage ≠ zero out-of-pocket"), a lump-sum vs income diagram for TPD, the existing infographics and cover-vs-need bars.
- **Transparent results:** formula and working for each step, assumptions, what could change the result. Empty inputs are never treated as zero.
- **Mobile-first:** no horizontal overflow at 390 px or 1280 px. Native buttons and labelled inputs, with link and step semantics that work with screen readers. Existing design tokens only; no new dependencies.

## Important decisions
- **Placement:** categories in Learn and scenarios in Simulate. The primary navigation is unchanged.
- **Product facts:** only VERIFIED_OFFICIAL fields from the audited Product Master. The 34 unverified names are withheld, and illustrative premiums are hidden.
- **Income interruption:** not built, because its research model is unapproved (Engine 4). The TPD page links to the emergency fund tool instead.
- **Life-need source conflict:** shown as two labelled results rather than resolved silently.

## Issues needing your attention
1. **One anonymous demo account** was created in the live Supabase project by an early local E2E run (2026-11-26 19:20 UTC), because the local build used `.env.local`. It was left in place, since deleting it is destructive. The cleanup SQL is in `docs/demo-accounts-setup.md` if you want it removed. Later runs were device-only.
2. **Product facts are dated** (22 Nov 2026) and need rechecking before any public launch. The source links were not re-opened online in this phase.
3. **A compliance review** of the personalised gap tools is recommended. The research marks them as a grey zone: they are generic and not linked to products here.
4. **Product-owner decisions:**
   - whether savings reduce the life need;
   - approving an income-interruption model.
5. **Not deployed:** this branch hasn't been deployed to Preview in this phase.

## Recommended next phase
1. Deploy the branch to **Preview** and run a short usability test with 3–5 users aged 18–30. Can they tell CI from medical cover? Do they understand the gap result?
2. **MediAsas explainer and simulator:** BNM's standardised base plan is public and can be verified, so it is the safest first product-anchored simulation once BNM's final figures are confirmed.
3. **Income-interruption scenario,** after you approve a model (the Engine 4 candidate or a revised one).
4. **Refresh the product master** against current PDSs. Add product-specific mode only for products that pass the release gate.
5. Optionally, add Bahasa Malaysia and Chinese editions of the category pages, consistent with the multilingual videos.
