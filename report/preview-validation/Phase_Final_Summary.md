# Preview Validation & Release Readiness — Final Summary

## Status: **PARTIAL**
All local validation, content verification, compliance wording, simulator validation, user-test preparation and the MediAsas research are **done**.

Validating on a Vercel Preview is **blocked by design**:
- The branch's Preview connects to the only Supabase project, which holds live data.
- Previews require a Vercel login.

So no new Preview validation was done. This needs your decision (see the approval gates below).

## Work completed
| Area | Outcome |
|---|---|
| Safety audit | Branch, worktree and remotes verified, and the previous phase confirmed pushed. Vercel and Supabase configuration inspected read-only. Decision recorded with a safe deployment plan. |
| Content verification | All 19 displayed sources reopened. 9 product records re-verified from current official pages or PDSs. 8 facts revised or removed, and several verified facts added. |
| Compliance wording | Qualifiers added. Regulatory statements aligned to their sources. The "not a quote / not a recommendation" note strengthened. |
| Simulators | Formulas unchanged and validated. Silent default removed (support years). Zero-gap message and large-number wrapping added. One extra edge-case test. |
| Local E2E | 68 page/size combinations (375, 390, 1280, 1440 px). 0 overflow, 0 broken images, 0 console or network errors. Every flow passes. |
| User test plan | Ready: criteria, 9 tasks, moderator script, observation sheet, questionnaire, feedback template. **Not conducted** (needs approval). |
| MediAsas | **NOT READY.** The official pilot terms (29 Jul 2026) are detailed but provisional, with the final version due January 2027. Implementation plan prepared. |

## Changes (commits)
| Commit | What |
|---|---|
| `e7d5fcd` | Re-verified protection content and product facts (27 Nov 2026) |
| `3410c78` | Scenario UX: no preselected years, zero-gap message, not-a-quote footnote, wrapping, plus one test |
| Reports commit | `report/preview-validation/` (9 files) |

**Not touched:**
- Engine 2 (no diff; 69/69 pass)
- migrations, Supabase, Rewards and account code
- `public/advisor/*`
- main and Production

## Tests
| Check | Result |
|---|---|
| Unit tests | **192/192** |
| Engine 2 | **69/69** |
| Engine 3 | **9/9** |
| Typecheck | Pass |
| Production build | Pass |
| Device-only build | Pass |
| Browser E2E | Pass, with 0 console and 0 network errors |
| Link check | 17 × 200; 2 BNM pages return 403 to scripts only |

## Deployment status
- No deployment made by hand. The existing auto-built Preview for `6fd6f5b` is READY and requires login.
- **Pushing this phase will auto-build a new Preview** (the existing Git integration). It connects to the live Supabase project, so don't sign in on it for testing until a safe option is chosen.

## Remaining approval gates (yours)
1. **Choose a safe preview backend:** a separate staging Supabase project (recommended) or device-only Preview variables.
2. **Approve user testing** (recruitment and sessions) once a safe build is available.
3. **Compliance review** of the personalised gap tools and the neutral product listing before any public launch.
4. Decide whether to **delete the one anonymous test account** created in the live project in the previous phase (2026-11-26 19:20 UTC).
5. **Product decisions:** whether savings reduce the life need, and approving an income-interruption model.

## Risks
- Branch Previews write to the live Supabase project if anyone signs in.
- Product facts age quickly. One product page (Smart Multi Critical Care) is dated 2024.
- Personalised gap tools sit in a regulatory grey zone until reviewed.

## Recommended next phase
**Set up an isolated staging backend for Previews (a separate Supabase project with the three migrations, Preview variables repointed), then run the prepared 3–5 person youth usability test on that Preview.** Revisit MediAsas once BNM publishes the final January 2027 terms.
