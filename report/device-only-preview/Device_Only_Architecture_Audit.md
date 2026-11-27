# Device-only Architecture Audit

Legend: **Verified** = inspected in code or build output · **Tested** = exercised in a browser or tests · **Assumed** = reasoned, not exercised.

## 1. How device-only mode works (Verified, code)
| Piece | Behaviour |
|---|---|
| `src/account/config.ts` | `cloudConfigured = Boolean(VITE_SUPABASE_URL && VITE_SUPABASE_PUBLISHABLE_KEY)`, both trimmed. Empty means device-only. |
| `src/account/session.ts` | `startDemo()` / `createNewAccount()` default to `mode: "local"` when `cloudConfigured` is false. Local accounts are seeded with `writeLocalSeed()` into localStorage. `resetDemo()` re-seeds locally. |
| Cloud code | Only `src/account/cloud.ts` imports `@supabase/supabase-js`. It is loaded with a dynamic `import("./cloud")` **only** for accounts whose `mode === "cloud"`. A device-only build never creates such an account, so the chunk is shipped but never requested. |
| Rewards | With no backend set, `src/rewards/store.ts` runs the pure economy functions (`economy.ts`) in the browser: quizzes graded locally, watch time bounded locally, redemptions written to localStorage. No server is involved. |
| Labelling | Welcome screen: "This is a demo account experience, not a real sign-in…" and "Cloud saving isn't set up for this build, so accounts are saved in this browser only." Account sheet: "Saved in this browser only". Wallet: "Saved on this device only", plus the note that marketplace items are fictional with no cash value. |

No new account architecture was created, and no code was changed for this phase.

## 2. Build output checks (Verified)
**Build command:**
```
VITE_SUPABASE_URL= VITE_SUPABASE_PUBLISHABLE_KEY= npx vite build --outDir <scratch>/dist-preview
```
Values already in the process environment take priority over `.env.local` in Vite.

| Check | Result |
|---|---|
| Project reference `ddxepshchmmhjvomzaoc` anywhere in the output | **0 occurrences** |
| A `https://<ref>.supabase.co` URL | **None** |
| A publishable or secret key value | **None.** The only `sb_publishable_` / `sb_secret_` text is supabase-js's prefix-check code in the unused `cloud-*.js` chunk: `e.startsWith('sb_publishable_')`. |
| Generic `*.supabase.co` string | Only inside the same library chunk (a hostname list). Not a project. |
| Untracked portrait originals | `public/advisor/*.jpg` (six protected files) are copied by Vite into the build. They are **excluded from the deployed output**: unreferenced by the app, and not in git-based deploys either. |

## 3. Runtime behaviour (Tested in headless Chrome against the exact deploy folder)
| Check | Result |
|---|---|
| Demo Account sign-in | Works. Account sheet shows "Demo account · Saved in this browser only". |
| Supabase session keys (`ge-sb-*`, `sb-*`) | **None** |
| Network hosts contacted during the full run (sign-in, quizzes, video, rewards, redeem, reload, reset) | `localhost` (the app) and `fonts.googleapis.com` / `fonts.gstatic.com` (web fonts). **0 Supabase requests.** |
| Real account creation | None possible: no request ever leaves for a backend |
| Points, vouchers, ledger | Written only to localStorage (see `Rewards_Demo_Validation_Report.md`) |
| Reset demo | Restores 2,450 points, the seed progress and 0 vouchers |
| Reload | State persists (localStorage) |

## 4. Edge cases (Assumed, not exercised)
- **A cloud account already saved in the same browser and origin** would try to load the cloud chunk with an empty configuration and fail. This can't happen on the device-only Preview, because it is a **new origin** with empty storage. It is relevant only if someone reuses a browser profile on the branch Preview URL, which is a different origin.
- **Google Fonts** is a third-party request (the IP is visible to Google). This is pre-existing and not account data.
