# Known Issues and Risks

| # | Issue / risk | Severity | Status | Recommended action |
|---|---|---|---|---|
| 1 | **Pushing the branch auto-builds a Preview connected to the live Supabase project** (branch-scoped Preview variables) | High | **Blocker for pushing.** The 3 local commits from this and the previous phase stay unpushed. | Change the branch's Preview variables (blank them, or point to a staging Supabase project). Pushing after that is safe. Needs your approval (env change). |
| 2 | **Participants can't open the protected Preview** without a Vercel team login | Medium | Open | Run sessions on the moderator's device, or decide on a share link (bypasses protection) |
| 3 | The live Preview URL wasn't browser-tested by me (protected) | Low | Mitigated: identical bytes (98/98 SHA-1) were tested locally | Open the URL in your logged-in browser for a visual check |
| 4 | The Supabase library chunk (`cloud-*.js`) is still shipped in device-only builds (never requested) | Low | Accepted: contains no project data | Optional: tree-shake cloud code when `cloudConfigured` is false (touches account architecture, so it needs approval) |
| 5 | A cloud account already saved in the same browser and origin would fail to load in a device-only build | Low | Not reachable on the new Preview origin | None now |
| 6 | Third-party Google Fonts requests | Low | Pre-existing | Optional: self-host fonts |
| 7 | No single explicit "points have no cash value" sentence on the Rewards hub (items and vouchers are covered) | Low | Documented, not changed (Rewards UI is frozen) | Watch in testing; add a sentence later if users are confused |
| 8 | The anonymous test account created in the live project (2026-11-26 19:20 UTC) | Low | Left in place (per instruction) | Your decision |
| 9 | Product facts age; SMCC page dated 2024; GMS2 availability unclear | Medium | Documented | Re-verify before any public release |
| 10 | Personalised gap tools are in a regulatory grey zone | Medium | Documented | Compliance review before public launch |
| 11 | MediAsas | — | **Not ready.** Waiting for final January 2027 terms. | Nothing implemented |
| 12 | Real-device and screen-reader testing not done | Low | Not tested | Include one phone and VoiceOver/TalkBack in the dry run |
