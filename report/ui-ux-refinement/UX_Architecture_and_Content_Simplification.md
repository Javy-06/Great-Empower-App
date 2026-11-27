# UX Architecture and Content Simplification

## Principles applied
1. One section, one message.
2. Visual first: flows, comparisons and worked examples instead of paragraphs.
3. Progressive disclosure: detail moves into `<details>`, show-more or secondary views. Nothing required for accuracy is deleted.
4. Fewer cards: full-width bands, rows, diagrams and grids instead of a card for every paragraph.
5. One disclaimer per page; the other copies are removed.

## Protection explained — new structure (hub)
| # | Section | Visual form | Replaces |
|---|---|---|---|
| 1 | **The big picture** | Photo hero plus a 4-step flow: *You → Something happens → Costs hit → Protection cushions it* | Intro paragraph and the "two names" card |
| 2 | **What can happen → which cover helps** | Five tappable rows: event icon → financial problem → protection (purpose + official name). This is the category navigation. | The category list and the separate "two names" explainer (now a 1-line legend) |
| 3 | **Savings ≠ insurance ≠ investing** | Three columns with a one-line definition plus a ✓/✗ comparison grid (use any time? · pays big for a covered event? · can grow? · can lose value?) | Three paragraph cards |
| 4 | **How a medical bill is shared** | An illustrative RM12,000 bill as a stepped breakdown: not covered → deductible → co-payment → insurer pays. Stacked bar plus a "you pay RM2,190" result. CTA to the simulator. | Abstract four-colour bar |
| 5 | **Before you buy** | Eight icon chips with 3–6 word questions; tap one to show its one-line answer | Six text items |
| 6 | **Where to get protection** | Three channel tiles (online direct · agent/adviser · employer). Details (BNM direct-channel dates, takaful, eligibility) sit in an expandable "Good to know". | Two text cards plus a three-item note list |
| 7 | **If something goes wrong** | Two compact link rows (FMOS, PIDM) | Two cards |
| — | Research note and disclaimer | One line each | A navy research card, a disclaimer and a repeated not-affiliated line |

## Category pages — new structure (same for all five)
1. Hero band: icon, purpose (H1), official-category chip, one-sentence summary.
2. **Key idea:** the "A ≠ B" statement directly under the hero.
3. **At a glance:** a ✓/✗ split list (unchanged content, tighter layout).
4. **Example:** short story strip.
5. **Myth or fact?** Each myth shows first; tap to reveal the fact (`<details>`).
6. **Learn and try:** visual guide (infographic) plus a simulator CTA, side by side.
7. **In Malaysia** (if any) and **Products in our research**: both collapsed by default. Each product shows as a one-line row (name, issuer, basis, status); tap to expand the full verified card.
8. Sources (collapsed) and previous/next.

**Content reduction:** nothing factual is removed. It is reordered and collapsed. Repeated disclaimers are cut to one line per page.

## Other pages
| Page | Change |
|---|---|
| Simulate → Needs | A segmented tool switcher shows **one tool at a time** (Medical bill · Emergency fund · Family · Critical illness). Deep links select the tool. The scroll-only index is removed. |
| Analyze | If nothing is assessed, one empty state: the four areas as icons plus one CTA, instead of four repeated cards |
| Home | One visual "Understand protection in 2 minutes" entry (the five category icons) |
| Rewards hub | The note now also says points have no cash value. Earning and vouchers are unchanged. The food grid is shortened to 4 items with a "See all" link to the full list (existing route). |
| Global footer | One line stating the independence and not-advice disclosure. The About link is removed. |
| News article | Source caveat (moved from About) |

## Removed features
- **About & legal:** route, view, footer link and destination type.
- **Design system viewer:** the `#foundation` app, `src/showcase/*`, the `App.tsx` switcher, and components used only by the showcase (determined by an import-graph audit).

See `Removed_Features_Report.md`.

## Consistency
- **Shared primitives** for the protection pages: section heading (overline + serif title), flow step, comparison grid, disclosure row.
- **Tokens:** existing ones only (navy, crimson, teal, gold, surface, sunken). No new colours or gradients, and no glass effects.
