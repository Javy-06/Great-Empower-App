# Protection experience (developer notes)

## Routes
- `#app/learn/protection`: hub
- `#app/learn/protection/<medical|critical-illness|life|tpd|personal-accident>`: category page. An unknown slug shows the hub.
- `#app/simulate/needs/<tool-bill|tool-fund|tool-family|tool-ci>`: opens Simulate's Needs step and scrolls to the tool.

## Code
| File | What it holds |
|---|---|
| `src/data/protection.ts` | Category content (official name, purpose name, lists, myths, sourced facts) and `researchedProducts` |
| `src/app/protection/ProtectionHub.tsx` | Hub and category pages |
| `src/app/protection/ProtectionScenarios.tsx` | Family protection and CI runway tools |
| `src/calculation-engine/engine-3.ts` | Engine 3 pillars A and B: generic, educational, exact BigInt sen |

## Rules for changing content
- **Product facts:** only from the audited Product Master, and only for fields marked `VERIFIED_OFFICIAL`.
  - Keep the official source link and the review date (`PRODUCT_RESEARCH_DATE`).
  - Never show an illustrative premium as a price.
  - Never rank products or suggest one "for you".
- **Malaysia-specific statements** need a `source`. General statements stay general ("may", "usually", "check your policy").
- **Scenario inputs:** an empty input is "not entered", never zero.
  - Research example values must stay visible and editable.
  - Employer cover counts at 0% unless the user chooses otherwise.
- **Engine 3:**
  - Medical and emergency pillars and the classification are not implemented because no formula is approved.
  - The life-need source conflict must keep showing both variants until the product owner decides.
- **Income interruption (Engine 4)** has no approved model. Don't build it until one is approved.

## Tests
- `src/calculation-engine/engine-3.test.ts`
- `src/data/protection.test.ts`
- A product-data cross-check against `product-master.json`, run manually (see `report/insurance-phase/Insurance_Phase_Testing_Report.md`).
- **E2E must use a device-only build** so it doesn't create accounts in the live project:
  `VITE_SUPABASE_URL= VITE_SUPABASE_PUBLISHABLE_KEY= npx vite build --outDir <scratch>`
