# Device-only Preview and User Testing Preparation — Final Summary

## Status: **PASS** (with one access limitation and one push blocker, both documented)

## Safety
| Question | Answer |
|---|---|
| Device-only build verified? | **Yes.** Built with empty Supabase variables; output inspected. |
| Supabase absent from the build? | **Yes.** 0 project references, no URL, no keys. Only the unused supabase-js library chunk remains. |
| Live backend accessed? | **No.** Nothing in this phase contacted Supabase. Browser runs saw 0 Supabase requests. |
| Live account created? | **No** |
| Vercel settings changed? | **No.** Project settings, env list and production target were compared before and after: unchanged. |
| Bypass token created? | **No** (still 0; `vercel curl` not used) |
| Production touched? | **No** (no `--prod`, no main, no push) |

## Preview
| Item | Value |
|---|---|
| Deployed | **Yes**, once |
| URL | **https://great-empower-isn2mceoh-javy8.vercel.app** |
| Protection | Vercel Authentication: open it while signed in to Vercel (team `javy8`) |
| Method | `vercel deploy --prebuilt` of a locally built, device-only Build Output (static only; no Vercel build; no git link). The six portrait originals were excluded. |
| Integrity | All 98 deployed files match the tested local folder by SHA-1. 0 Supabase variables on the deployment. |
| Safe for usability testing | **Yes for data.** Participants need the moderator's signed-in device. |

## Testing
| Check | Result |
|---|---|
| Unit tests | 192/192 (Engine 2 69/69; Engine 3 9/9) |
| Typecheck | Pass |
| Production build | Pass |
| Device-only build | Pass |
| Browser E2E (exact deploy bytes) | 68 route × viewport checks (375/390/1280/1440): 0 overflow, 0 broken images, 1 H1 each |
| Rewards demo | Wrong quiz +0 · perfect +50 once · infographic +20 · video skip 0 s · voucher −1,000 · persists on reload · reset → 2,450 |
| Insurance flows | 5 categories, 9 product entries, deep links, no default years, zero-gap message, footnotes |
| Console / network errors | 0 / 0 |
| Not tested | The live URL itself in a browser (login required); real devices; screen readers |

## User testing
- **Ready** for 3–5 participants. The 9 tasks are unchanged and all work.
- **Before testing, decide:**
  1. the access method (moderator's device recommended);
  2. a consent form if recording;
  3. a dry run.
- **No blockers for data safety.**
- **Watch for:** reading results as quotes or recommendations; CI read as a salary; "two numbers" confusion; points read as real value (see the readiness report).

## Changes
| Item | Detail |
|---|---|
| App code | **None** |
| Files added | `report/device-only-preview/` (9 reports) |
| Commits | 2 local commits (`ce0a0c2` reports, `60fc108` a wording correction) |
| Pushed | **No.** Pushing would auto-build a live-connected branch Preview (see Known Issues #1). |
| Deployment | 1 device-only Preview (above) |

## Risks
1. **Pushing is blocked** until the branch's Preview variables stop pointing at the live project.
2. **Access:** the Preview needs a Vercel login.
3. **Product facts** need re-verification before any public release.
4. **Compliance review** of the gap tools is pending.
5. **The leftover anonymous live test account** is still there, awaiting your decision.

## Recommendation (next phase)
**Approve one env change:** remove or blank the branch-scoped `VITE_SUPABASE_*` Preview variables, or point them at a new staging Supabase project. That makes branch Previews safe, so the local commits can be pushed.

Then **run the 3–5 participant usability test** on the device-only Preview, using the moderator's signed-in device, following the prepared plan.
