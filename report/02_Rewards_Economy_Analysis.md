# 02 — Rewards Economy Analysis

The figures below come from `src/rewards/catalogue.ts` (app) and
`supabase/migrations/20261127000000_rewards_learning_verification.sql` (server). Tests check that
the two match: `seed.test.ts`, `verification.test.ts` and `supabase/tests/verification.test.mjs`.
The live database was checked on 2026-11-27 (see report 05).

## 1. Existing economy (before this phase, commit `49985a4`)

### Earning (one time per account per activity)
| Activity | Count | Points | Max total |
|---|---:|---:|---:|
| Lesson completed | 7 | 50 | 350 |
| Infographic viewed | 5 | 20 | 100 |
| Video finished | 4 | 40 | 160 |
| Protection profile completed | 1 | 100 | 100 |
| Keep Learning challenge (3 lessons or videos) | 1 | 150 | 150 |
| Visual Learner challenge (3 infographics) | 1 | 80 | 80 |
| Know Your Coverage challenge (profile) | 1 | 200 | 200 |
| **Total supply, new account** | | | **1,140** |

- **Demo Account:** starts at 2,450 pts with some content already completed. It can reach about 3,430 pts.
- **Welcome Offer:** one food or drink item for 200 pts, once per account. Unchanged.
- **Problem found:** before this phase, all 1,140 pts could be collected in a few minutes:
  - click "Mark lesson complete" seven times,
  - open five infographics,
  - seek four videos to the end.

  That made points cheap and disconnected from learning.

### Catalogue (before)
| Brand | Item | Price (pts) |
|---|---|---:|
| TUBWAY | Chicken Wholemeal Sandwich / Tuna Wholemeal Sandwich | 1,200 / 1,200 |
| TUBWAY | Grilled Chicken Wrap / Healthy Chicken Salad | 1,300 / 1,400 |
| GREENBOWL | Veggie / Grilled Chicken / Salmon Bowl | 1,500 / 1,600 / 1,900 |
| FRUITFUEL | Orange Juice / Infused Water / Smoothie | 1,000 / 1,000 / 1,100 |
| CAREPLUS | Basic Health Kit / Wellness Pack / Health Check Kit | 2,000 / 2,400 / 2,800 |
| SHIELDORA | Medical Protection / Protection Upgrade (simulated game benefits) | 3,000 / 4,500 |
| NESTORA | Savings Bonus / Emergency Fund Boost (simulated game benefits) | 2,000 / 2,500 |

## 2. Points-to-value anchor
Food and drink already followed about **100 pts per RM1** of everyday value: a ~RM12 sandwich at 1,200 pts and a ~RM10 juice at 1,000 pts. This phase uses that existing anchor for the rest of the catalogue rather than inventing a new one. The CarePlus values are estimates of comparable everyday products, because the items are fictional and unbranded.

## 3. Shieldora and Nestora evaluation
| Original item | Original purpose | Practical value | Decision | Reasoning |
|---|---|---|---|---|
| Shieldora Medical Protection (3,000) | Reduces one simulated medical expense in a game | None. Simulated only, and it suggests "protection" can be bought with points | **Retired** | Conflicts with the "insurance is not a game item" principle and could mislead about cover |
| Shieldora Protection Upgrade (4,500) | Raises a simulated protection level in LifeTrack | None. LifeTrack is a future separate project | **Retired** | Depends on a game that isn't part of this platform scope |
| Nestora Emergency Fund Boost (2,500) | Simulated in-game emergency buffer | None | **Retired** | Game currency, not a real benefit |
| Nestora Savings Bonus (2,000) | Simulated in-game savings bonus | None | **Retired** | Game currency, not a real benefit |

- **Replacement:** the practical replacement is the **Great Empower Voucher** category (§5). It ties rewards to the platform's purpose of supporting future protection decisions without selling anything today.
- **Why not renamed:** renaming would keep game behaviour under a new label, which the brief prohibits.
- **Why not deleted:** existing ledger rows and items reference them, so they are retired (`active = false`), not deleted.

## 4. CarePlus evaluation
| Product | Specification (catalogue) | Est. value | Previous | New | Reason |
|---|---|---:|---:|---:|---|
| Basic Health Kit | Basic first-aid style kit | ~RM30 | 2,000 | **3,000** | Was priced at ~RM20, below its value and cheaper per RM than food. Moved onto the anchor. |
| Wellness Pack | Everyday self-care set | ~RM35 | 2,400 | **3,500** | Same reasoning. Sits between the other two. |
| Health Check Kit | Home check essentials | ~RM45 | 2,800 | **4,500** | Highest-value CarePlus item, so it is the long-term tier. |

- **Hierarchy:**
  - Low: food and drink, RM10 voucher (1,000–1,900).
  - Medium: RM25 voucher, Basic Kit, Wellness Pack, 5% voucher (2,500–3,500).
  - High: Health Check Kit and RM50 voucher (4,500–5,000).
- **Not done:** prices were not raised across the board. Food and drink stay where they were because they were already on the anchor.

## 5. Great Empower Voucher pricing
| Voucher | Future monetary value | Point cost | Rationale |
|---|---:|---:|---|
| RM10 | RM10 off a future eligible purchase | 1,000 | Anchor: 100 pts per RM1. Reachable by a new account. |
| RM25 | RM25 | 2,500 | Anchor. Needs sustained learning (Demo Account, or more content). |
| 5% (max RM30 off) | 5% of the premium, at most RM30 | 3,000 | Priced at its **cap**, so it is never worth more than its points. It only beats the RM25 voucher on premiums above RM500, and the terms say so. |
| RM50 | RM50 | 5,000 | Anchor. Long-term tier. |

**Restrictions (in the app and on the server):**
- Each account can hold one of each voucher at a time (`max_held = 1`).
- Not combinable: one per purchase.
- No cash value and not transferable.
- Not usable today. The terms say insurance purchasing isn't available yet.
- The Welcome Offer does not apply to vouchers.

## 6. New catalogue (active)
| Category | Items | Price range |
|---|---|---|
| Lifestyle: TUBWAY, GREENBOWL, FRUITFUEL | 10 food and drink items | 1,000–1,900 (unchanged) |
| CarePlus | 3 wellness items | 3,000–4,500 |
| Great Empower Vouchers | RM10, RM25, 5%, RM50 | 1,000–5,000 |

## 7. Economic sustainability
- **Finite supply:** every activity pays once per account, so no activity can be repeated for points. The total supply is fixed at 1,140 for a new account.
- **Earning now takes effort:** a perfect quiz for each lesson and infographic, plus real-time video watching. A full pass takes about 80 minutes, roughly 14 pts per minute of learning.
- **Affordability today:**
  - New account (1,140 max): one low-tier item, such as a drink, a sandwich or the RM10 voucher.
  - Demo Account (about 3,430 max): the medium tier.
  - High tier: **no account can reach it with today's content** (4,500 / 5,000 against at most about 3,430).

## 8. Recommendations
1. **Product decision needed:** make the high tier reachable by **adding learning content** rather than raising earning amounts. Raising amounts would change the approved Demo seed and make points cheaper. For example, 5 more lessons with quizzes add 250 pts and could unlock a challenge.
2. If recurring earning is added later, such as monthly challenges, cap it per period so supply stays bounded.
3. Revisit voucher prices once real eligible products and premiums are known. Keep percentage vouchers priced at their cap.
4. Record each sponsor's actual cost per item when partners are confirmed, and recheck the 100 pts per RM1 anchor then.
