# Preview Deployment Safety Report

## Result
**A device-only Preview was deployed safely.**

| Item | Value |
|---|---|
| URL | **https://great-empower-isn2mceoh-javy8.vercel.app** |
| Deployment ID | `dpl_66Vdk8VtnbrWdJoAR15kpCviBGQ8` |
| Environment | `preview` (target `null`, `productionUrl: null`) |
| Source | `cli` (no git source, no branch, no aliases) |
| Protection | `vercel_authentication`: opens only for signed-in members of the `javy8` Vercel team. An unauthenticated request gets a **302 to Vercel SSO** (verified). |
| Public | `false` |

## Pre-deployment checks (all done before deploying)
| # | Check | Evidence |
|---|---|---|
| 1 | Vercel CLI authenticated | `vercel whoami`: the team member account (CLI 67.0.0) |
| 2 | Deployment method and linkage | `vercel deploy --prebuilt` from a scratch folder that is **not a git repo**. `.vercel/project.json` was written by hand with the project and org IDs from the read-only project API. `vercel link` was not used, because it can pull env values to disk. |
| 3 | Built with empty Supabase variables | `VITE_SUPABASE_URL= VITE_SUPABASE_PUBLISHABLE_KEY= vite build` |
| 4 | No live project reference in the output | 0 occurrences of the project ref; no key; no project URL |
| 5 | Local tests | 192/192 unit tests, Engine 2 69/69, Engine 3 9/9, typecheck and build all pass |
| 6 | Preview only | No `--prod`. Result: `environment: "preview"`. |
| 7 | No settings change | Prebuilt deploys don't touch project settings (confirmed afterwards, below) |
| 8 | No env change | None made (confirmed afterwards) |
| 9 | No Production | Production target unchanged (confirmed afterwards) |
| 10 | No push | **Nothing was pushed in this phase.** A push would auto-build a branch Preview connected to live Supabase. |

## How the output was assembled
- `.vercel/output/config.json`: `{ "version": 3, "routes": [ { "handle": "filesystem" } ] }`. The app uses hash routes, so no rewrites are needed.
- `.vercel/output/static/`: the device-only build, **minus the six untracked portrait originals** (`advisor/advisor-*.jpg`).
- 97 static files (262 MB, including the LFS videos). No build ran on Vercel, so **project environment variables can't enter the bundle.**

## Post-deployment verification (read-only)
| Check | Result |
|---|---|
| Deployed files vs the tested local folder | **98/98 files match by SHA-1** (Vercel file IDs are content hashes) |
| Portrait originals deployed | **0** |
| Supabase variable names on the deployment (runtime + build lists) | **0 of 169** (system `VERCEL_*` variables only) |
| Project settings (build command, output, framework, Git LFS, git link, SSO, password protection, bypass count, env list with timestamps) | **Unchanged** (compared with the pre-deploy snapshot) |
| Production target | **Unchanged** |
| Protection-bypass tokens | Still **0**. None created, none revoked. `vercel curl` was **not** used, because it creates one. |
| Supabase | Not contacted at all in this phase |

## Not done (by design)
- **No browser test of the live URL itself.** It needs a Vercel login, and creating a bypass token is out of bounds. Instead, the **exact bytes** were tested locally (see the functional and responsive reports). **Open it in your logged-in browser to confirm visually.**
- **No push.** The three-commit history stays local until the branch Preview's Supabase variables are changed (see Known Issues).

## Safe for usability testing?
**Yes, for data safety.** No backend exists in this build, so nothing a participant does can reach the live points ledger.

**Access limitation:** participants can't open the URL without a Vercel team login. Run sessions on the moderator's signed-in device (in person), or by screen-share with remote control. Creating a share link would bypass protection and needs your decision.
