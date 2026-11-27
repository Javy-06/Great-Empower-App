# Advanced visual redesign — phase summary (2026-11-27)

**Status:** implemented and tested locally. **Not pushed:** deployment safety was not verified (see "Deployment").

## References studied
All 11 boards in `ui reference/advance ui reference/` (gitignored, kept local).

**Ideas adopted:**
- Category heroes with a real photo on the right.
- Illustrated risk rows and "where to get cover" tiles.
- An icon list for "may help with".
- A visible "Fact:" reveal.
- An illustration in the hospital-bill header.
- An illustration beside the checklist on wide screens.

**Not copied:** 3D clip-art icons, glossy gradients, and layouts identical to any single board.

## What changed
| Area | Change |
|---|---|
| Visual system | `GeIcon` set (19 custom SVG icons) and 10 spot illustrations, hand-authored in brand tokens (`src/components/illustrations/`) |
| Photography | 5 Pexels photos, credited, local WebP (30–122 KB), one per category hero. See `docs/visual-assets.md`. |
| Protection hub | Illustrated risk rows; illustrated channel tiles; checklist illustration (≥1024 px); hospital illustration in the bill header; custom category icons |
| Category pages (5) | Photo hero with the existing navy blend; icon list for "may help with"; "Fact:" reveal panel; photo credit |
| Learn | Removed the duplicate topic tab row (cards filter the list); 3 lessons + "Show all 7 lessons"; protection card chips gain icons. Length 4.9 → 4.3 screens at 375 px. |
| Simulate | Tool tabs use the custom icon set |
| Analyze | Profile illustration in the empty state |

**Unchanged:** formulas, Engine 2 and 3, Rewards logic, account and Supabase code, and the `public/advisor/*` portraits.

## Validation (run)
| Check | Result |
|---|---|
| Unit tests | **193/193** (Engine 2 69/69, Engine 3 9/9; +1 test for photos and icons) |
| Typecheck | Pass |
| Build | Pass |
| Device-only build | Pass |
| Browser E2E | 21 routes × 375/390/768/1280/1440 = 105 checks: 0 overflow, 0 broken images, 1 H1 each, 0 small targets, 0 console or network errors, 0 Supabase requests |
| Feature checks | All pass |
| Rewards demo regression | Unchanged |

Screenshots were reviewed at 375, 390, 768 and 1280 px. Fixes made after review:
- Illustration widths: the `cn` helper doesn't merge Tailwind classes.
- Bill header wrapping.
- Tree shapes in the hospital illustration.
- The bandage icon read as a chain link.

## Deployment
**Not verified safe, so not pushed.**
- Vercel project read-only check (2026-11-27): `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are still set for **Preview on `redesign/overnight-product-refresh`**, last updated 2026-11-26.
- Pushing would auto-build a Preview connected to the live Supabase project.
- No Vercel settings, tokens or variables were changed, and no deployment was made.

**To unblock:** blank or remove those two branch-scoped Preview variables (or point them at a staging project). Then push the local commits.
