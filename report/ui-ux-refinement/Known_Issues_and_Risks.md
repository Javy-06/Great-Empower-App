# Known Issues and Risks

| # | Issue | Severity | Status | Next step |
|---|---|---|---|---|
| 1 | **Pushing still auto-builds a branch Preview connected to live Supabase** (branch-scoped Preview variables) | High | **Not pushed.** 6 local commits are waiting (3 report commits from the last phase + 3 code commits, plus this phase's report commit). | Blank the branch's `VITE_SUPABASE_*` Preview variables, or point them at staging (your approval). Then push. |
| 2 | Learn home is still long (4.9 screens): topic cards **and** a full lesson list | Medium (P2) | Deferred: the topic cards were recently approved by you | Decide: keep cards and collapse the list behind a filter, or the reverse |
| 3 | The device-only Preview (`great-empower-isn2mceoh…`) shows the **previous** UI | Low | Not redeployed (not requested) | Deploy a new device-only Preview the same safe way, on approval |
| 4 | The hub's illustrative bill uses fixed example numbers (static content, not a calculator) | Low | Labelled "Illustrative example, not a real plan" | Review wording in the compliance review |
| 5 | Pre-existing unused data files (`src/data/demo-*.ts`, 5 files) | Low | Kept (not viewer-related) | Delete in a cleanup pass |
| 6 | Real-device, screen-reader and automated contrast tests not run | Medium | Not tested | Include in the usability dry run |
| 7 | Category hero summaries are still 2–3 sentences | Low | Intentional (accuracy) | Revisit after user testing |
| 8 | Earlier open items (live test account, product-fact ageing, compliance review of gap tools, MediAsas not ready) | — | Unchanged | See earlier phase reports |
