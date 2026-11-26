# Rewards economy (v3)

Source of truth: `src/rewards/catalogue.ts` (app) and
`supabase/migrations/20261127000000_rewards_learning_verification.sql` (server). Tests check that
the two match.

## Pricing anchor

Food and drink prices already followed roughly **100 pts per RM1** of everyday value (a ~RM12
sandwich costs 1,200 pts, a ~RM10 juice costs 1,000 pts). v3 applies the same anchor to the rest
of the catalogue. Values for fictional items are estimates of comparable everyday products.

| Item | Estimated value | Old price | New price |
|---|---|---|---|
| CarePlus Basic Health Kit | ~RM30 | 2,000 | **3,000** |
| CarePlus Wellness Pack | ~RM35 | 2,400 | **3,500** |
| CarePlus Health Check Kit | ~RM45 | 2,800 | **4,500** |
| Great Empower RM10 Voucher | RM10 | — | **1,000** |
| Great Empower RM25 Voucher | RM25 | — | **2,500** |
| Great Empower 5% Voucher (max RM30 off) | ≤ RM30 | — | **3,000** |
| Great Empower RM50 Voucher | RM50 | — | **5,000** |
| Shieldora / Nestora game items | none (simulated) | 2,000–4,500 | **retired** |

The 5% voucher is priced at its RM30 cap, so it can never be worth more than its points at the
anchor. For a premium under RM600 a fixed voucher can be the better choice, and the terms say so.
Vouchers can't be stacked (one per purchase), and an account can hold one of each voucher at a time.

## Earning (point values unchanged; how they are earned changed)

| Activity | Points | Requirement |
|---|---|---|
| Lesson (×7) | 50 | Perfect score on its 3-question quiz |
| Infographic (×5) | 20 | Perfect score on its 3-question quiz |
| Video lesson (×4) | 40 | Valid watch time ≥ edition length − 2 s |
| Protection profile | 100 | Complete the profile |
| Keep Learning challenge | 150 | 3 lessons or videos |
| Visual Learner challenge | 80 | 3 infographics |
| Know Your Coverage challenge | 200 | Profile complete |

Each activity pays **once per account**.

**Total supply:**
- A **new account** can earn at most **1,140 pts**, plus the one-time **Welcome Offer** (any food or drink item for 200 pts).
- That takes about 80 minutes of learning: roughly 50 minutes of lessons, 12½ minutes of video and 15 minutes of infographics, including quizzes. That works out to about 14 pts a minute.
- The **Demo Account** starts at 2,450 pts and can reach about 3,430 pts.

## Affordability

- **Low tier** (food, drink and the RM10 voucher, 1,000–1,900 pts): one item is within reach of a new account that completes all the content.
- **Medium tier** (RM25 voucher, Basic Health Kit, Wellness Pack, 5% voucher, 2,500–3,500 pts): the Demo Account can reach these with sustained learning. A new account can't yet.
- **High tier** (Health Check Kit 4,500, RM50 voucher 5,000): no account can reach these with today's content.

They are aspirational until more learning content (or recurring earning) is added. This is a
known content-supply limit, not a pricing error. Raising earning values would also change the
approved Demo seed (2,450), so that decision is left to the product owner.
