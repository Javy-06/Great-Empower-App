# 04 — Video Valid Watch-Time & Security Report

## 1. Requirement per edition
Required valid watch time = **edition length − 2 s**. The 2 s allows for whole-second rounding and players that stop slightly early. Nothing else is forgiven.

| Video | Edition | Length | Required |
|---|---|---:|---:|
| what-is-insurance | en / ms / zh / ta | 8:01 / 7:53 / 9:36 / 5:42 | 479 / 471 / 574 / 340 s |
| how-insurance-works-in-malaysia | en | 1:28 | 86 s |
| risk-pooling-powers-insurance | en | 1:26 | 84 s |
| life-insurance-risk-pooling | en | 1:31 | 89 s |

- **Where the requirements live:** `watchRequirements` in `src/rewards/verification.ts` and `ge_private.video_requirement` on the server. A test checks they match.
- **Reward:** 40 pts, once per account per video, across all language editions. Each edition counts its own time.

## 2. Client tracking (`src/app/learn/useWatchTime.ts`, `WatchMeter`)
It is event-driven, with no polling timers:

| Event | Effect |
|---|---|
| `playing`, `seeked` (while playing and the tab is visible) | Opens a counting segment |
| `timeupdate` | Reading: credits new footage, limited by real time |
| `pause`, `seeking`, `waiting` (buffering), `ended`, `emptied` | Closes the segment and saves progress |
| `visibilitychange` → hidden (tab switched, app backgrounded, screen locked) | Closes the segment |
| `pagehide`, route change or unmount (leaving the page) | Closes the segment and saves progress |

For each reading while a segment is open, the meter credits only footage that is new and was played in real time:
```
dr = real seconds since the last reading, dm = media seconds advanced
ignore if dr ≤ 0, dm ≤ 0 (rewind / stall) or dr > 5 (throttled tab, nobody watching)
credit = new footage in [m0, m0 + min(dr, dm)] not already in the coverage list
```

### Behaviour
- **Seeking forward:** `seeking` closes the segment, so the jump is never credited. Even without a `seeking` event, one reading can credit only the real time since the last reading (≈0.25 s).
- **Seeking backward / replaying:** the jump adds nothing, and footage already credited (the coverage list) is **never credited again**.
- **Pausing:** no time is credited while paused.
- **Background / hidden tab:** the segment closes, so playback in a hidden tab adds nothing.
- **Leaving the page:** progress is saved. Coming back resumes, and only new footage counts.
- **Fast playback:** never counts faster than real time. At 2× the gaps left in coverage can still be filled by watching later, so the learner is never permanently stuck.
- **Across sessions:**
  - Credited seconds are reported every 15 s and whenever playback stops, in order, and a failed report is retried.
  - The confirmed total is stored per account (server for cloud accounts, local ledger for device-only).
  - The coverage list is stored per account and per edition under `ge-watch-coverage-v1`. It is cleared with the demo reset.
  - If coverage is more than 17 s ahead of the confirmed time (a reset on another device, or lost reports), it starts over, so footage can never become permanently uncountable.

### UI
"**Valid watch time** m:ss / m:ss", with a progress bar and the rules in plain words. After earning, it shows "+40 pts for watching this video", then "Watched · points earned".

## 3. Server validation (`public.record_video_watch`, v3 and v4)
| Check | Behaviour |
|---|---|
| Identity | `ge_private.require_uid()`. No user-id parameter. |
| Video and edition | Must exist in `ge_private.video_requirement`. Otherwise `unknown_content`. |
| Reported seconds | Must be between 0 and 600 (`invalid_seconds` otherwise) |
| First report for an edition | Only starts the clock. Credits 0. |
| Credit | **One clock per account, shared by all videos** (v4, `ge_private.video_watch_clock`): `allowance += real seconds since the account's previous report of any video` (capped at **60 s**, so idle time cannot be saved up), then `credit = min(reported, allowance)` |
| Pay | When credited time ≥ the requirement, pays 40 once through `ge_private.pay_activity` (ledger plus the unique `earn_key`) |
| Storage | `public.video_watch_progress`. RLS is on, **select own rows only**, and clients have no write grants. |

**Result:** the total credited time **across all of an account's videos** can never exceed the real time that passed, whatever the client claims. v3 limited each edition separately; v4 closes the parallel-videos gap.

## 4. Manipulation tests (actually run)

### Database (PGlite, `supabase/tests/verification.test.mjs`): all passed
| Attack | Result |
|---|---|
| Claim the whole video in the first report | Credits 0 (only starts the clock) |
| Report 600 s after a few real seconds | Credits only the elapsed real seconds |
| Stay idle for an hour, then claim | Credits at most 60 s |
| 85 of 86 s | 0 pts. Reaching 86 → +40 once. More watching → never pays again |
| Other edition / language | Tracked separately; needs its own full time; pays at most once per video |
| Fake video id, unknown language, negative or >600 s | Refused |
| Read another account's progress / write progress directly | Not possible (RLS, no grants) |
| **v4:** 3 videos reported in parallel after 30 s of real time | 30 s credited **in total** (the other videos get 0) |
| **v4:** read or write the account clock | `permission denied` |
| Old path: `earn_points('video-finished', …)` | Refused |

### App unit tests (`src/rewards/verification.test.ts`): all passed
Normal playback, pause, hidden tab, forward seek without events, seek back plus replay (no time added), coverage across visits, 2× playback, throttled-tab gap, whole-second hand-off and `addCoverage` merging.

### Headless Chrome, production build, device-only Demo Account
| Step | Recorded result |
|---|---|
| Seek to the end and let it finish | +0 pts, watch time 0 s |
| Play 6 s | 6 s |
| Play 4 s with the page hidden | Still 6 s |
| Leave the page mid-play | 9 s, saved |
| Return, rewind to 0:00, replay 5 s | **Still 9 s** (replay not counted) |
| Watch the rest | +40 pts once, at 87 s of unique footage |

## 5. Remaining limitations
1. **The server cannot see playback.** It limits credit to real elapsed time, but a script that calls `record_video_watch` on a timer without watching can earn 40 pts per video at real-time speed, **one video at a time**: about 12 minutes 10 seconds of real time for all 160 pts, once per account.
2. ~~Videos at the same time.~~ **Fixed by v4.** The account clock is shared by all videos. Proven live: 8 parallel reports on 4 videos credited 5.2 s in 5.2 s of real time.
3. **Coverage is kept on the device.** Clearing site data or switching devices restarts coverage, but the server's real-time limit and the one-time payment still apply.
4. **Device-only accounts** are checked in the browser only, by design. They have no server.
