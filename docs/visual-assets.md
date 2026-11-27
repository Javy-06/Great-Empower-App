# Visual assets (Protection experience)

## Photography (Pexels)
- **Storage:** downloaded once, stored locally (never hotlinked), and converted to WebP, then resized to 1400 px wide (landscape) or 900 px wide (portrait).
- **Pexels licence:** free to use and modify, and attribution isn't required. Credit is still shown on each category page and listed here.
- **Restrictions:** don't show identifiable people in a bad light, don't imply endorsement, and don't resell unaltered copies.

| File (`public/images/pexels/`) | Used on | Subject | Photographer | Source |
|---|---|---|---|---|
| `protection-medical-hospital-rest.webp` | Medical Expense Protection hero; guides on claims, hospital costs and deductibles | Patient resting in a bright hospital room | Andrea Piacquadio | https://www.pexels.com/photo/photo-of-woman-lying-in-hospital-bed-3769151/ |
| `protection-critical-illness-recovery.webp` | Critical Illness Recovery hero | Woman in recovery opening the curtains | Michelle Leman | https://www.pexels.com/photo/happy-asian-woman-suffering-from-cancer-near-window-6798572/ |
| `protection-family-living-room.webp` | Family Financial Protection hero | Family at home in the living room | Annushka Ahuja | https://www.pexels.com/photo/family-on-a-living-room-8055807/ |
| `protection-income-planning.webp` | Income Protection (TPD) hero; Analyze hero | Man reviewing finances at home | ANTONI SHKRABA production | https://www.pexels.com/photo/a-businessman-with-documents-on-the-table-8374283/ |
| `protection-accident-rider.webp` | Accident Protection hero | Helmeted rider in the city | Erik Mclean | https://www.pexels.com/photo/man-on-motorcycle-in-city-10125985/ |

The credits are also stored in `src/data/protection.ts` (`photo.credit`). A test checks that each file exists and is credited, and that no photo is reused across categories.

## Custom SVG (hand-authored, in code)
All of this is written by hand as SVG/React. No generated raster images are used.

| Component | File | Style |
|---|---|---|
| Icon set `GeIcon` (19 icons): heartPulse, ribbon, family, walletPause, bandage, bed, scalpel, stethoscope, letter, cash, home, steps, receipt, calendar, chart, shieldCheck, shieldPlus, percent, calendarCoin | `src/components/illustrations/GeIcons.tsx` | 24 grid, 1.75 stroke, round caps and joins, `currentColor`. Matches the weight of the lucide UI icons. |
| Category icons (Medical, Critical illness, Family, Income, Accident) | same file | Used on Home, Learn, the Protection hub and category heroes |
| Spot illustrations: Hospital, Diagnosis, Family umbrella, Income pause, Accident, Checklist, Laptop, Adviser, Office, Profile, Pass, Voucher (Wallet empty states) | `src/components/illustrations/Spots.tsx` | Flat shapes on a tinted disc with a soft ground shadow. Brand tokens only. Decorative (`aria-hidden`). |

## Code-built visuals
- **Protection hub:** bill breakdown (stacked bar), savings/insurance/investing comparison grid, four-step flow.
- **Category pages:** lump-sum vs income bars on the TPD page; on the Medical page, six term diagrams (deductible and co-payment split bars, annual-limit overflow bar, waiting-period and pre-existing timelines, exclusion checklist).
- **Product explorer:** a comparison table built from verified facts, with the source shown under each fact.
- **Simulators:** existing result bars.

None of these are images, so the numbers stay accurate and responsive.
