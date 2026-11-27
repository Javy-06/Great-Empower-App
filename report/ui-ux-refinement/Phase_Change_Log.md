# UI/UX Refinement — Change Log

**Base:** `605a4f2` (local; the remote branch is at `e9d813e`). **Date:** 2026-11-27. **All commits are local; nothing pushed.**

| Commit | Summary |
|---|---|
| `5d72d31` | **Protection explained: visual-first redesign** of the hub and five category pages. Adds `event` and `problem` per category to `src/data/protection.ts`. |
| `0905b4b` | **Remove About & legal and the design-system viewer at source level.** Viewer-only components deleted. Footer and news disclosures relocated. Home quick actions replaced with a protection entry. |
| `145087e` | **Simulate one tool at a time** (tabs), single Analyze empty state, leaner Rewards hub (4 items, points note) |
| *(reports)* | `report/ui-ux-refinement/` (9 files) |

Each code commit typechecks on its own (checked in a temporary worktree, since removed).

## Process notes
- The first commit attempt bundled two groups. It was undone with a non-destructive `git reset` of local, unpushed commits and redone in the right order.
- A temporary verification worktree under the session scratchpad was removed. `git worktree list` shows only the original three worktrees.

## Not changed
- `src/calculation-engine/`
- `supabase/`
- `src/rewards/`
- `src/account/`
- `public/advisor/*`
- main, Production, Vercel and Supabase settings
