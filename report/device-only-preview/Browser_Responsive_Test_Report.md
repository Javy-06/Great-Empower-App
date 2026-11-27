# Browser and Responsive Test Report

**Setup:** headless Chrome over CDP against the exact deploy folder.

**Viewports:** 375 × 900, 390 × 900, 1280 × 900, 1440 × 900 (mobile emulation below 768 px).

**Routes:** 17 at each viewport.

| Check | Result |
|---|---|
| Horizontal overflow | **0 px** on all 68 route × viewport combinations |
| Broken images | **None** (at 390 and 1280) |
| One H1 per page | Yes (all routes at 390) |
| Navigation | Hash routes, Learn → Protection explained card, category previous/next, scenario deep links (also while Simulate is open) |
| Deep links | `#app/learn/protection/<slug>`; an unknown slug shows the hub; `#app/simulate/needs/<tool>` |
| Loading | Pages render within the 0.9–1 s waits used; video metadata loads |
| Empty states | Family and CI scenarios show "Your result appears here" until all inputs (and years) are entered |
| Touch usability | Controls use 44–48 px targets (`min-h-11` / `h-12` / `h-14`). Range sliders and radio rows were tested by script. |
| Accessibility basics | Native buttons and labels; `aria-live` results; `role=alert` errors; `aria-pressed` presets; "≠" read as "is not the same as"; external links state "(opens in a new tab)" |
| Demo labelling | Welcome note, account sheet and wallet note (see functional report) |
| Console errors or warnings | 0 |
| Network failures / HTTP ≥ 400 | 0 / 0 |
| Broken links | None internal. External sources: see `Device_Only_Functional_Test_Report.md`. |

**Screenshots (session scratchpad, not committed):**
- `rel2/shots/hub-1440.png`
- `rel2/shots/medical-375.png`
- `rel2/shots/life-1280.png`
- `rel2/shots/simulate-needs-375.png`
- `dev/shots/wallet.png`

**Not tested:** real touch devices and real screen readers. These are recommended before or during the usability sessions.
