# Visual Asset Plan

**Decision:** no new images were generated. Every new visual is either an existing asset or a purpose-built CSS/SVG diagram that uses lucide icons and the design tokens. This avoids "AI presentation" imagery and keeps the bundle small.

| Page | Section | Purpose | Asset type | Subject | Source |
|---|---|---|---|---|---|
| Protection hub | Hero | Emotional context: real people, a family conversation | Photo | Family protection conversation | **Reuse** `/images/pexels/family-protection-conversation.webp` |
| Protection hub | Big picture | Explain why protection exists in 4 seconds | CSS flow + icons | You → event → cost → cushion | **New CSS/SVG** |
| Protection hub | What can happen | Event → problem → cover, at a glance | Icon rows + arrows | Hospital, illness, can't work, breadwinner, accident | **New CSS** + existing category icons |
| Protection hub | Savings vs insurance vs investing | Comparison | ✓/✗ grid + 3 icons | PiggyBank, ShieldCheck, TrendingUp | **New CSS** |
| Protection hub | Medical bill | Show coverage ≠ zero cost | Stepped breakdown + stacked bar | Illustrative RM12,000 bill | **New CSS**, static illustrative numbers |
| Protection hub | Before you buy | Scannable checklist | Icon chips | 8 lucide icons | **New CSS** |
| Protection hub | Channels | Where to get cover | Icon tiles | Globe/Phone, UserRound, Building | **New CSS** |
| Category pages | Learn and try | Visual guide | Infographic thumbnail | 4 category infographics | **Reuse** |
| Category: TPD | Learn and try | Lump sum vs income | CSS bar diagram | — | **Reuse** (existing component) |
| Home | Protection entry | Discovery | Icon row | 5 category icons | **New CSS** |
| Analyze | Empty state | What will be assessed | Icon row | Existing area icons | **Reuse** |

**Considered and rejected:**
- New illustrations for the five categories. Icons and colour tiles already give each category an identity, and adding illustrations risks generic AI art.
- Stock photos for each scenario row. They would make a long scrolling gallery, which is the problem being solved.

**Unused assets after this phase:** none of the shared images became unused.

**Deleted:** design-system viewer code only (no image assets were exclusive to it; checked).
