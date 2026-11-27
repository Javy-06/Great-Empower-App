# Rewards Demo Validation Report (device-only)

All actions ran on the device-only build: Demo Account, localStorage only, **0 Supabase requests**.

**Not done:** the live Rewards security and concurrency tests were not rerun, as instructed. **No Rewards code was changed.**

| Flow | Result (Tested) |
|---|---|
| Starting balance | 2,450 pts (demo seed) |
| Lesson quiz, wrong answer (2/3) | State "failed"; **+0 pts** |
| Retry with the missed question correct | State "passed"; **+50 pts** |
| Reload and pass again | No duplicate; total still +50 |
| Infographic: opening it | **+0 pts** |
| Infographic quiz, perfect | **+20 pts** |
| Video: "Valid watch time" label | "0:00 / 1:26" |
| Video: skip to the end and let it finish | **+0 pts, 0 s credited** |
| Video: play 6 s | 6 s credited; label "0:06 / 1:26" |
| Rewards hub balance | "2,520 pts" (2,450 + 50 + 20) |
| RM10 voucher terms | "Insurance purchasing is not available in the app yet" shown |
| Voucher redemption demo | **−1,000 pts**; voucher `gev-rm10` stored |
| Wallet | Shows "Great Empower RM10 Voucher" and "Saved on this device only", plus the note that items are fictional with no cash value |
| Reload | Balance unchanged; still signed in |
| Reset demo | Confirmation shown; **2,450 pts, 0 vouchers**, seed progress, watch progress cleared |

## Can this affect the live ledger?
**No.**
- **Verified:** the build contains no project URL or key.
- **Verified:** the cloud module is never requested.
- **Tested:** no Supabase host was contacted during the whole run.

## Clarity of "demo"
- **Labels in the app:**
  - welcome text ("demo account experience, not a real sign-in");
  - account sheet ("Saved in this browser only");
  - wallet ("Saved on this device only");
  - fictional-items note.
- **Points have no real-world value.** The app doesn't say this in one explicit sentence (the marketplace note covers items and vouchers). Worth watching in testing; see Known Issues.
