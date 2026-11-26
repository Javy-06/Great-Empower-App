# Preview Safety Audit

**Date:** 2026-11-27
**Decision: NO new Preview validation against the existing Preview.** All validation was done locally with a device-only build. No Vercel or Supabase setting was changed.

## 1. Repository state (verified first)
| Check | Result |
|---|---|
| Working directory | `C:\Users\Javy\Downloads\GREAT-EMPOWER-redesign` (git worktree) |
| Branch | `redesign/overnight-product-refresh` |
| Remotes | `app` → `Javy-06/Great-Empower-App` (deployment repo) · `origin` → `Javy-06/Great-Empower` |
| Previous phase pushed | Yes: local `HEAD` = `app/redesign/overnight-product-refresh` = `6fd6f5b` |
| Unexpected changes | None. Only the six protected, untracked `public/advisor/*.jpg` portraits (not touched). |
| Other worktrees | `Codex - GREAT EMPOWER Design System` (read-only research source, not modified) and `GREAT-EMPOWER-deploy-vercel-demo` (not touched) |

## 2. Deployment configuration (read-only inspection)
| Item | Finding |
|---|---|
| `vercel.json` | None in the repo. The project uses Vercel defaults: framework `vite`, `pnpm run build`, output `dist`. |
| Git integration | Vercel project `great-empower-app` (team `javy8`) is linked to GitHub `Great-Empower-App`. The production branch is `main`. **Every push to the redesign branch auto-builds a Preview.** |
| Latest Preview | `great-empower-45s1freb8-javy8.vercel.app`: commit `6fd6f5b`, state READY, built in 1.3 s, cloned from the redesign branch |
| Deployment protection | `ssoProtection: all_except_custom_domains`. Previews need a Vercel login (verified: unauthenticated requests get a 302 to Vercel SSO). **0 protection-bypass tokens** (the earlier one was revoked). |
| Git LFS | `gitLFS: true` on the project. 90 LFS files (all `.png/.jpg/.webp/.mp4`). The asset bytes on the deployed Preview couldn't be inspected without access; locally the LFS video and images load. |
| Env variables | `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` (encrypted) are set for **target Preview, git branch `redesign/overnight-product-refresh` only**. **Production has none**, so main/Production builds run device-only. |
| `.env` / `.env.local` | `.env.example` has empty values (device-only by default). `.env.local` holds the same live URL and publishable key; it is gitignored (`git check-ignore` confirmed) and was never printed or committed. |
| Secrets in the bundle | Only the public URL and publishable key reach the browser. No service-role or secret key exists anywhere in the repo or diff (scan done before push). |

## 3. Supabase risk
- The Preview's variables point to Supabase project `ddxepshchmmhjvomzaoc`. The Supabase CLI labels it **"production"**, and it is the **only** backend.
- It holds real state:
  - 32 profiles
  - the points ledger, vouchers and redemption records
  - rewards created by preview testers
- **Visiting** a Preview doesn't write data. **Signing in** (Demo or New Account) creates an anonymous account, and the rewards flows (quiz, video, redeem) write real ledger rows.
- **The isolation requirement is not met.** A validation run on the Preview would create persistent test accounts and points in the live project, which the phase rules prohibit. One such account was already created by mistake in the previous phase (2026-11-26 19:20 UTC, documented and left in place).

## 4. Vercel risk
- **Protected previews.** Testing them headlessly would require a new bypass token. One was revoked before, so creating another needs your approval.
- **Pushes rebuild automatically.** Pushing this phase's commits will auto-build a new Preview, the established workflow for this branch. A build alone doesn't create data, but anyone who signs in on it writes to the live project.
- **No changes made.** No Production deployment, no environment variable change and no domain change was made.

## 5. Decision
**Not safe to validate on the Preview with sign-in.** The safe option used instead:
- A **device-only local build**: `VITE_SUPABASE_URL= VITE_SUPABASE_PUBLISHABLE_KEY= vite build`. The project reference is absent from the bundle (verified).
- Served with `vite preview` and tested at 375, 390, 1280 and 1440 px (see `Preview_Testing_Report.md`).

## 6. Safe deployment plan (needs your approval; nothing done)
| Option | What | Effect |
|---|---|---|
| **A. Recommended: separate test backend** | Create a second Supabase project (e.g. "great-empower-staging"), apply the base + v3 + v4 migrations there, and point the branch's **Preview** variables at it | Previews and user tests never touch the live data. Production is unaffected. |
| B. Device-only Preview | Remove or blank the two Preview variables (or use a separate branch with none) | Previews run with device-only accounts. No cloud saving. Simplest for demos and user tests. |
| C. One-off device-only deployment | `vercel deploy --prebuilt` of a locally built device-only output, then use a temporary bypass token or your logged-in browser to view it | No settings changed. Needs a bypass token or your login for testing. |

Until one is chosen, the safest path for user testing is a **device-only build run locally** or option B.
