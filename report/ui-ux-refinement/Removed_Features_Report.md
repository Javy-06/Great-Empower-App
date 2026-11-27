# Removed Features Report

## About & legal — Removed (source level)
| Item | Action |
|---|---|
| `src/app/AboutView.tsx` | Deleted |
| `"about"` destination (`ApplicationApp.destinations`, `DashboardDestination` type) | Removed. `#app/about` now falls back to Home (tested). |
| Footer "About & legal" link | Removed. No `#app/about` link remains anywhere (tested). |

**Disclosures preserved in context (Verified):**

| About section | New home |
|---|---|
| Independent education, not Great Eastern, no partnership | Global footer: "not an official product of, or endorsed by, any insurer". Protection hub research line and each products section: "not affiliated with Great Eastern". |
| Not financial advice; illustrative | Global footer, scenario footnotes, category disclaimers |
| Rewards and Marketplace: fictional, no cash value, vouchers not usable yet | Rewards note (now includes **points**), shown on hub, marketplace, product and wallet screens |
| News content restates sources; MediAsas may change | News article source line |

## Design-system viewer — Removed (source level)
| Item | Action |
|---|---|
| `#foundation` route and `FoundationApp` in `src/App.tsx` | Removed. `App` now renders only the application, and `#foundation` shows the app (tested). |
| "View the design system" link (About page) | Removed with the About page |
| `src/showcase/` (BrandPrologue, kit, 12 section files) | Deleted |
| Components used **only** by the viewer (import-graph and `git grep` audit) | Deleted: `components/cards/AnalyzeCards.tsx`, `GuideCards.tsx`, `HomeCards.tsx`, `RewardsCards.tsx`, `components/nav/Sidebar.tsx`, `Tabs.tsx`, `RewardsShortcut.tsx`, `components/ui/Feedback.tsx`, `design-system/tokens.ts`, `lib/contrast.ts` |
| Viewer-only exports in shared files | Removed: `MobileHomeHeader`, `MobileAppHeader` (AppHeader); `ScenarioCard`, `lifeTrackResources`, `ResourceMeter`, `LifeTrackBoard`, `LifeTrackPreview`, `LifeTrackEntryCard` (SimulateCards); `LessonCard`, `LessonRow` (LearnCards); plus their unused imports |
| Dependencies | **None removed.** Every package is still used by the app (lucide-react, react and others). |
| Tests | No tests targeted the viewer, so none were removed |
| Assets | None were exclusive to the viewer |

**Total:** about 4,300 lines deleted. Typecheck and build pass.

## Kept on purpose
- `src/PhonePreview.tsx` (`?preview=phone`): a desktop phone-frame preview of the app itself, not the design system. Not requested for removal.
- **Pre-existing unused files** (already unreferenced **before** this phase, not related to the viewer): `src/data/demo-activities.ts`, `demo-learning.ts`, `demo-rewards.ts`, `demo-user.ts`, `demo-wellness.ts`. Listed in Known Issues for a later cleanup.
- `src/calculation-engine/engine-1.ts`: tested research engine, not UI.

## Verification
- **Import graph from `src/main.tsx`:** only the files listed under "Kept on purpose" plus `vite-env.d.ts` are unreachable.
- `grep` for `#foundation`, `app/about`, `About & legal`, `showcase`: no matches except one explanatory comment in `App.tsx`.
