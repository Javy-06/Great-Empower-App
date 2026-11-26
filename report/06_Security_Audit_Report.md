# 06 — Security Audit Report

**Scope:**
- Every reward-related path: earn, quiz, video, challenge, redeem and read.
- Base migration `20261126000000_demo_accounts.sql` plus v3 `20261127000000_rewards_learning_verification.sql`.
- The client code in `src/rewards/*` and `src/account/cloud.ts`.

**Live project:** `ddxepshchmmhjvomzaoc`. Production on Vercel was not touched.

## 1. Architecture (preserved)
- **Accounts:** Supabase **anonymous auth**. Every RPC resolves the caller with `ge_private.require_uid()` from the JWT. **No RPC takes a user id**, so account ids can't be manipulated.
- **Points are moved only by SECURITY DEFINER RPCs** with `search_path = ''`. Clients can't insert into or update `points_ledger`, `profiles.points_balance` or `reward_items`. Grants are `select` only, and on `profiles` only `language` and `display_name` can be updated.
- **Ledger:** append-only. `profiles.points_balance` is the ledger sum, updated in the same transaction. One-time earning is enforced by a unique `(user_id, earn_key)` index.
- **Allow-list:** `ge_private` and `earnable_content` have no client grants. Content ids must be allow-listed. The v3 quiz and video tables only hold allow-listed content.
- **RLS:** every public table has RLS with "own rows" policies, and the catalogue is read-only.

## 2. Changes in v3
| Object | Type | Security |
|---|---|---|
| `ge_private.quiz_answer_key` | table | Private schema. All privileges revoked from public, anon and authenticated. |
| `ge_private.video_requirement` | table | Same |
| `public.video_watch_progress` | table | RLS on; policy "own watch progress: read"; `select` only for authenticated; no insert/update/delete grants |
| `ge_private.pay_activity(uid, kind, subject)` | function | Internal and not callable by clients. Checks the allow-list, reads the amount from `earning_rules` and writes the ledger with its `earn_key`. |
| `public.earn_points` | replaced | Now refuses `lesson-complete`, `infographic-viewed` and `video-finished`. Only `profile` is accepted for `profile-complete`. |
| `public.submit_quiz` | new | DEFINER; grades on the server |
| `public.record_video_watch` | new | DEFINER; credit bounded by real time |
| `public.redeem_reward` | replaced | Same contract, plus voucher items with codes and the `max_held` limit. Retired products (`active = false`) are refused. |
| Grants | | The new functions are executable by `authenticated` only. Verified live: `anon=false`, `auth=true` for all four. |

## 3. Manipulation attempts and results
| Attempt | Defence | Verified by |
|---|---|---|
| Send an arbitrary point amount | No RPC accepts an amount; it is read from `earning_rules` or `reward_products` | DB suites (base and v3) |
| Send a quiz score or "passed" flag | Not accepted; `submit_quiz` grades the answer ids itself | v3: lesson / infographic tests |
| Claim from an incomplete or incorrect quiz | Missing or wrong answers count as wrong; pays only at score = total | v3 tests; app `economy.test.ts` |
| Claim a lesson, infographic or video through the old `earn_points` | Refused (`quiz_required` / `watch_time_required`) | v3: "earn_points no longer pays lessons…" |
| Fake content ids or kinds | Format check, then a lookup in the key or requirement tables (`unknown_content`) | v3: "quiz: fake ids", "video: invalid ids" |
| Inflate watch time | First report credits 0; credit ≤ real elapsed time (60 s cap); 0–600 s range | v3: three video tests |
| Seek forward to qualify | Client: no credit for jumps. Server: real-time limit. | Unit tests, E2E, v3 |
| Claim the same reward again | Unique `(user_id, earn_key)`; returns `already_earned` | v3 tests; live check: 0 duplicates |
| Redeem without enough points | Balance check under `for update`; nothing changes | v3: "insufficient points change nothing" |
| Redeem a retired game item | Refused, no charge | v3: "retired game items cannot be redeemed" |
| Hold several copies of a voucher | `max_held` check | v3: voucher tests |
| Replay a redemption request id | Returns the original result; no double charge | v3: "replaying the same request…" |
| Write catalogue, ledger or items directly | No grants | v3: "clients cannot write reward items…" |
| Read another user's ledger, items or watch progress | RLS own rows only | v3: "watch progress is per account"; base suite isolation tests |
| Read the answer key | `ge_private` revoked | v3: "the answer key is server-only" |
| Run v3 twice or without the base | Preflight refuses and rolls back | v3: first and "second run" tests |

## 4. Issues found during this audit
| # | Issue | Severity | Action |
|---|---|---|---|
| F1 | Replaying already-watched footage (seek back, or a new visit) counted again toward the video requirement | Medium (brief requirement) | **Fixed** in `a6766b4`: coverage-based `WatchMeter`, saved per account and edition, with unit and E2E regression tests |
| F2 | Before v3, `earn_points` paid lessons, infographics and videos on a bare client call (no verification) | High (the core issue this phase fixes) | **Fixed** by v3 (`earn_points` refuses these kinds), with a regression test |

No other defects were found. No issue required a further live database change.

## 5. Remaining risks (accepted and documented)
| # | Risk | Impact | Suggested mitigation |
|---|---|---|---|
| R1 | The quiz answer key is also in the client bundle, and the server returns per-question correctness, so answers can be found or read | ≤ 450 pts per account, once | Accepted: quizzes are for learning, not a secure exam. Rotating question pools would raise the effort. |
| R2 | Watch credit is limited per edition, so a script could accumulate several videos in parallel at real-time speed without watching | ≤ 160 pts per account, once | A future migration with a per-account clock shared across all videos (needs approval, since it is a live DB change) |
| R3 | The server can't see playback; coverage is kept on the device | Limited by R2's bound | Accepted; inherent to a browser player |
| R4 | Device-only accounts are checked in the browser only | Local points only; no server value | By design |
| R5 | `learning_progress` is client-writable for the account's own rows | Cosmetic (completion badges); **pays no points** | Accepted |
| R6 | A Vercel "Protection Bypass for Automation" secret, created during earlier preview testing, is still active | Lets the holder bypass preview protection | **You** should revoke it: Vercel → Settings → Deployment Protection |

## 6. Secrets
No service-role key was used or printed. The client uses only `VITE_SUPABASE_URL` and the publishable key, set in Vercel Preview by an earlier session. A bundle scan for secret-key patterns matched only the supabase-js `sb_secret_` prefix check, not a key.
