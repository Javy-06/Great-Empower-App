# Device-only Functional Test Report

**What was tested:**
- The **exact folder that was deployed**: the deployed files match it 98/98 by SHA-1.
- Served locally with `vite preview`.
- Driven by headless Chrome over the DevTools protocol.
- Date: 2026-11-27.

**Not tested:** the live Preview URL in a browser (it needs a Vercel login).

## A. Core application (Tested)
At each of 375, 390, 1280 and 1440 px, each route loaded with no horizontal overflow and no broken images; at 390 px each had exactly one H1. Routes covered:
- Home
- Learn and Protection explained (hub plus all five categories: Medical, Critical Illness, Life, TPD, Personal Accident)
- Simulate and Simulate → Needs (Medical bill simulator, Emergency fund, Family protection, Critical illness runway)
- Analyze, Guide, Rewards, Rewards wallet
- A video lesson, an infographic, About

## B. Device-only behaviour (Tested)
| Check | Result |
|---|---|
| Demo Account login | Works; welcome screen shows the "Cloud saving isn't set up for this build" note |
| Supabase authentication | None: no `ge-sb-*` / `sb-*` keys; account sheet says "Saved in this browser only" |
| Supabase network requests | **0.** Hosts seen: the app, `fonts.googleapis.com`, `fonts.gstatic.com`. |
| Real account creation | Impossible: no backend requests |
| Reset demo | Confirm dialog shown; back to 2,450 pts, 0 vouchers, seed progress, watch progress cleared |
| Reload | Points and sign-in persist (localStorage) |

## C. Rewards demo
Tested; see `Rewards_Demo_Validation_Report.md`.

## D. Insurance experience (Tested)
| Check | Result |
|---|---|
| Research note | "8 products, checked 27 November 2026." |
| Products shown | Medical 6 (incl. notice), CI 1, Life 1, TPD 1, PA 1 |
| Source links | 19 unique. All open in a new tab with `rel=noreferrer`. 17 returned 200 to a scripted check last phase; the 2 BNM pages block scripts but open in browsers. |
| Family protection | Empty until **all amounts and the years** are chosen (no default). Example gives RM40,000 / RM44,000. Zero-gap message works. Very large values wrap. Oversized values show an error. |
| CI runway | Example RM58,000; zero income gives RM0 plus the zero-gap message; "not a quote" footnote present |
| Deep links | `#app/simulate/needs/tool-family` and `tool-ci` |
| Medical bill simulator, Emergency fund | Present and unchanged |
| Disclaimers | Present on each protection page and scenario |
| Formulas | Unchanged |

## E. Errors
| Check | Result |
|---|---|
| Console errors or warnings | **0** in both runs (device-only behaviour run and viewport run) |
| Failed network requests | **0** |
| HTTP ≥ 400 | **0** |
| Video (Git LFS media) | Loads (duration 88 s) |
