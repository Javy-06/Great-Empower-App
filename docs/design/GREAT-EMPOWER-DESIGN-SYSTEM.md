# GREAT EMPOWER design system

This document is the working standard for GREAT EMPOWER's interface. It records the existing system rather than replacing it. The source of truth for values is `src/index.css` (`@theme`), and the components live in `src/components/`. When this document and the code disagree, fix one of them. Never add a parallel token.

Authority order: from `AGENTS.md`:
1. User and product decisions.
2. This system.
3. Project architecture.
4. UI/UX Pro Max.
5. Other skills, including Frontend Design.

Skill suggestions are references, not permission.

---

## 1. Brand identity

| | |
|---|---|
| Brand | **GREAT EMPOWER**: "Empowering You to Protect Your Tomorrow." |
| Positioning | Independent financial-protection education. It must never imply an official partnership with any insurer. |
| Audience | Malaysians aged 18–30: students, first jobbers, young families. Mostly on mobile, often reading in a second language (BM, 中文, தமிழ் users). |
| Job | Make protection understandable at a glance, then help people act: learn → plan → compare → eventually buy. |
| Personality | A calm, sharp older sibling who works in finance. Premium but warm, never preachy or salesy, never childish. |
| Direction | "Premium + Youth Hybrid": an editorial serif voice, a clean fintech UI, and real Malaysian life in photography. |

### Visual direction: premium Malaysian fintech

| Quality | What it looks like here | What to avoid |
|---|---|---|
| Premium | Deep navy grounds, generous space, Cormorant headlines, few colours used precisely | Gold everywhere, heavy shadows, glossy 3D in core screens |
| Malaysian | Real Southeast Asian people and settings, RM amounts, local institutions (BNM, PIDM, FMOS), BM/中文/தமிழ் content | Western stock clichés, US terms ("deductible plans", "401k") |
| Trustworthy | Plain-language facts, cited sources, illustrative labels, consistent numbers | Hype, urgency, unexplained badges, fake precision |
| Youthful | Warm photography, friendly microcopy, quick wins (points, progress), mobile-first gestures | Cartoon mascots, emoji as UI, childish palettes |
| Not corporate | Editorial layouts with one strong image or figure per section | Dense tables up front, stock "handshake" imagery, wall-to-wall cards |
| Visual-first | A picture, diagram or figure leads; text explains it | Paragraph-led sections; decoration with no meaning |

**Restraint rules:**
- Use at most one gradient treatment per view (hero fade).
- Shadows are `e1`/`e2` on interactive surfaces only.
- No decorative blobs.
- Don't box content that reads fine as a list.

**Feels like:** a well-edited magazine explaining money, with a reliable app underneath.
**Must not feel like:** a bank brochure, a gamified kids' app, or a generic AI fintech landing page (gradient blobs, identical cards, all-caps eyebrows everywhere).

## 2. Colour

Scales are 50–950 tokens in `@theme`. Use only these tokens and never use raw hex in components.

| Role | Token(s) | Use |
|---|---|---|
| Primary | `navy-900` `#0F294A`, `navy-950` | Hero backgrounds, primary buttons, headings, selected states |
| Action / brand accent | `crimson-600` `#C8102E` | The **one** most important CTA per view, prices and points, risk cues ("not covered"). Never use it for decoration. |
| Secondary | `teal-600` `#297E85`, `teal-700/800` for text | Positive meaning (covered, completed, "may help"), focus ring, progress |
| Reward accent | `gold-50…700` | Points, rewards and learning badges only |
| Background | `canvas` `#F8FAFC` | Page |
| Surface | `surface` `#FFF`, `sunken` `#F1F5F9`, `paper` | Cards, inputs, quiet panels |
| Text | `ink` `#0F172A`, `ink-secondary` `#475569`, `ink-muted` `#5A6A7E` | Body, supporting and meta text. `ink-disabled` is only for disabled states. |
| Lines | `line`, `line-strong` | Dividers, input borders |
| Semantic | `success-*`, `warning-*`, `error-*` (= crimson), `info-*` (= navy) | Status messages |

Rules:
- **Contrast:** at least 4.5:1 for text under 24 px (under 18.66 px if bold) and 3:1 for larger text and UI boundaries. The QA runner checks solid backgrounds automatically. Text over photos needs a scrim (`ge-pagehero-fade`) plus a manual check.
- **Text pairings on tint:** use `*-700` or darker. Known pass: `gold-700` on `gold-50` (4.9:1). Known fail: `gold-700` on `gold-100` (4.36:1).
- **Meaning:** never rely on colour alone. Covered/not-covered always carries an icon or word as well (✓/✕, "Fact:").
- **Ratio on any screen:** mostly neutral, then navy, a little teal, and crimson for at most one or two elements.

## 3. Typography

| Role | Family | Token / size | Notes |
|---|---|---|---|
| Wordmark | Cormorant Garamond Bold | logo asset | Never re-typeset |
| Editorial headings (H1, section titles, key figures) | Cormorant Garamond 600 (`font-brand`) | H1 2.25rem mobile, 2.75rem desktop (`serif-hero`); section 1.875rem; figures `RM 150` | Short (1–6 words). Sentence case. |
| UI headings (card titles, form groups) | Inter 600 | `subheading` 1.125rem, `body` 1rem semibold | Use these where a serif would feel decorative |
| Body | Inter 400 | `body` 1rem/1.5; `body-sm` 0.875rem/1.25rem for secondary | Line length 45–75 characters (`max-w-[34rem]` to `max-w-2xl`) |
| Caption / meta | Inter 500 | `caption` 0.75rem | Minimum size for readable meta text |
| Overline (eyebrow) | Inter 700, tracking 0.08em, uppercase | `overline` 0.6875rem | **At most one per section header**, and only when it adds information. Not on every card. |

Rules:
- Readable text is never smaller than 12 px. 11 px is reserved for overlines and count badges.
- Use one H1 per view, and don't skip heading levels.
- Avoid accenting a single word in a different colour, and avoid all-caps labels beyond the overline.
- **Mobile:** body stays 16 px, and form inputs stay 16 px (this prevents iOS zoom).

## 4. Spacing and layout

- **Base unit:** 4 px (Tailwind scale). Common steps are 8, 12, 16, 20, 24, 32 and 48.
- **Inside cards:** padding of 16 px on mobile and 20–24 px from `md`.
- **Between related items:** gaps of 8–12 px.
- **Between sections:** 32–48 px.
- **Page gutter:** `Container` (`max-w-[1200px]`) with 20 px gutters on mobile, 32 px from `sm` and 48 px from `lg`.
- **Content width:** 1104 px of content at most (1200 px minus gutters). Running text max ~640 px. **Forms and single-column tools max ~720 px on desktop**, never full-width inputs at 1280+.
- **Grid:** one column under 640 px, two from `sm`/`md` where items are peers, and 3–4 for galleries from `lg`.

## 5. Components (existing, so reuse them)

| Component | Where | Rules |
|---|---|---|
| Button | `ui/Button.tsx`: `primary`, `accent` (crimson), `support`, `secondary`, `ghost`, `danger`, `inverse` | Height ≥ 44 px (48 for primary). One `accent` per view. The label says the result ("Save and explore my needs"). |
| Card | `ui/Card.tsx` | Use a card only when the content is a separate object you can act on. Don't nest cards. Prefer rows, lists or dividers for text groups. Radius: `rounded-2xl` for cards, `rounded-xl` for tiles, `rounded-full` for pills. |
| Page hero | `layout/PageHero.tsx` + `ge-pagehero*` | Navy, an optional photo on the right with a fade, a back link, one H1 and one sentence. No CTA clutter. |
| Navigation | `nav/TopNav` (≥ md), `nav/BottomNav` (mobile, fixed) | Five destinations plus Rewards separately. The fixed bottom nav requires `scroll-padding-bottom` (done in `index.css`). *Under review for GREAT EMPOWER 2.0. Don't build on its current shape.* |
| Tabs / segmented | Simulate tools (`role=tablist`, arrow keys) | Use when a choice swaps one panel. Selected = navy fill. On mobile they wrap 2×2 rather than scroll when there are ≤ 4 tabs. |
| Chips / filters | Learn topics, Guide categories | Height ≥ 44 px. Selected state uses a fill, not just a border. A horizontal scroller must show a partial next chip. |
| Badge | `ui/Badge.tsx` | Status or category only. Keep badges sparse: don't put the same badge on every card in a grid. |
| Inputs | `ui/Field.tsx`, `.ge-input`, `.ge-range` | Visible label (never placeholder-only), a unit prefix (RM) outside the field, `inputMode="numeric"` for money, errors under the field. |
| Disclosure | native `<details>` or a button with `aria-expanded` | Use for sources, product lists, long explanations. The collapsed label states the count ("Sources (5)"). |
| Bottom sheet / modal | `.ge-sheet`, `InfographicDialog` | Trap focus, close on Esc, return focus, use a sticky close button. |
| Progress | `ui/Progress.tsx` | Show the numbers too ("1/3"). Don't rely on bar length alone. |
| Empty state | Analyze coverage | Illustration (`Spots.tsx`), one sentence, one action. Never a blank card. |
| Icon tile | `ui/IconTile.tsx` | Lucide for UI actions; `GeIcon` for protection concepts. |
| Header (app) | `nav/AppHeader`, `TopNav` | Mobile: fixed navy bar with logo, points, notifications and avatar (≤ 64 px tall). Desktop: sticky light bar with nav centred. Never add page-specific actions to the global header. |
| Header (page) | `PageHero` | Back link (≥ 44 px) → overline (optional) → H1 → one sentence. The page's own primary action goes *below* the hero, not inside it, except Home. |
| Error state | `Field` error, inline banners | Inline, next to the cause, `role="alert"` for form errors. Say what happened and the fix ("Enter an amount — 0 if none"). Use the error colour plus an icon, never colour alone. Keep entered values. |
| Loading state | `.ge-skeleton`, button pending | Skeletons that match the final layout (no shift). Buttons show a spinner, keep their width, and set `aria-busy`. Show a message if a load takes more than about 1 s. Never use a blank screen. |
| Tooltip / definition | Inline glossary terms, `?` buttons | Use for one-line definitions only. Opens on tap and focus (not hover-only), closes on Esc and on tapping outside. If it needs more than one sentence, use a disclosure or bottom sheet. |
| Interactive learning | Lesson quiz, myth/fact `<details>`, checklist chips, infographic dialog | One question or idea at a time. The answer appears in place with a visible verdict word ("Fact:", "Correct") plus an icon. The points reward is shown next to the action that earns it. Progress always shows "n of N". |
| Insurance product information | `ProductRow` in category pages | Show only verified official facts, each with a source link. Use the official name, issuer, and conventional vs takaful. List gaps as "needs confirmation". **No prices, rankings, "best", quotes or buy buttons** until a purchase flow is approved. |
| Comparison | Savings / insurance / investing grid, bill breakdown, lump sum vs income | At most 3–4 columns on mobile. The row label is a `rowheader`. Marks are ✓/✕/– with sr-only words. Numbers come from code (never images). Add a one-line takeaway under the comparison. Label example figures "Illustrative". |

## 6. Visual assets

The decision order is: **UI component → icon → code chart → illustration → photo**. Use the first that communicates the point.

| Asset | Use for | Rules |
|---|---|---|
| Photography | Real-life situations: hospital, family, work, recovery, commuting | Southeast Asian or Malaysian context where possible. Download, convert to WebP (≤ 1400 px, ≤ 150 KB), and credit in `docs/visual-assets.md`. One photo per page (the hero). Don't repeat the same photo across pages. Never show people suffering for drama, and never imply endorsement. |
| Illustrations | Concepts, scenarios, categories, empty states | `components/illustrations/Spots.tsx`: flat, brand tokens, tinted disc, `aria-hidden`. Don't mix in 3D or clip-art inside the same view (LifeTrack's 3D art stays within LifeTrack). |
| Icons | Actions and concepts | Lucide for UI (1.75–2 stroke). `GeIcon` for protection concepts (24 grid, 1.75 stroke). No emoji as icons. |
| Charts and diagrams | Money, comparisons, splits | Code-built (CSS/SVG), labelled values, and an sr-only text equivalent. Never put AI-generated images of numbers. |
| Infographics (supplied) | Learn content | Open full-size in a dialog. A thumbnail must be legible or replaced by a title card. |

## 7. Responsive rules

Design mobile-first and compose each band deliberately. **Don't simply scale the desktop layout down** (or stretch mobile up).

| Test width | Band | Expectations |
|---|---|---|
| **375** | Small mobile | No horizontal scroll. Two-column tiles only if each is ≥ 150 px. H1 ≤ 3 lines. Hero text over a photo stays legible. Tab rows wrap (2×2) rather than scroll. |
| **390** | Mobile (primary) | The primary design target. Fixed bottom nav (content and focus clear it). One primary action visible without hunting. Single column. Long sections collapse behind disclosure. |
| **768** | Tablet | Top nav. 2-column grids for peer items. Hero photo on the right with text ≤ 60% width. Large media (game banners, posters) capped at about 360 px tall, not full-bleed. |
| **1280** | Desktop | 1104 px content. Forms and tools ≤ 720 px, or a 2-column form plus live summary. Galleries fill the row or centre (no lonely items left-aligned). Lines ≤ 75 characters. |
| **1440** | Wide | Same container, centred. Only hero photography may bleed. No new content columns appear just because there is space. |

Each width is checked automatically (`qa:ui`, Playwright projects), and the screenshots are reviewed by eye.

## 8. Accessibility minimums (WCAG 2.2 AA)

- **Text contrast:** AA, as in §2.
- **Focus:** visible on every control (global `:focus-visible` teal ring; `.ge-range` rings the thumb; a search field rings its wrapper). Fixed UI never covers focus.
- **Target size:** ≥ 24×24 px is a hard requirement; **44×44 px** is the GREAT EMPOWER standard for primary controls on touch.
- **Structure:** one H1, no skipped levels, `main`/`nav` landmarks, `lang="en"`.
- **Labels:** every control has an accessible name, decorative SVG and images are `aria-hidden` or `alt=""`, and photos that carry content get real alt text.
- **Forms:** visible labels, errors tied to fields, numeric keyboards for amounts.
- **Live regions:** for results that change without navigation (simulator results, checklist answers).
- **Motion:** respect `prefers-reduced-motion`. No auto-advancing carousels without pause.

## 9. UX principles

1. **One idea per screen section.** Lead with the answer (a figure, a verdict, a picture), and put details behind it.
2. **Progressive disclosure.** Sources, product lists, legal notes and long explanations are collapsed by default and state what's inside.
3. **Less text, same truth.** Cut words, not facts. Compliance lines stay visible, but are short and placed once (the page foot), not repeated.
4. **Show, then tell.** Comparisons, bills and lump-sum-vs-income use visuals, not paragraphs.
5. **Clear navigation.** Every sub-page has a back link and a "where am I" H1. Deep links restore state (e.g. `#app/simulate/needs/tool-ci`).
6. **Feedback.** Every action responds within 100 ms: pressed state, toast, live-region text or a points delta.
7. **Loading.** Skeletons (`.ge-skeleton`) that reserve layout, with no layout shift.
8. **Errors.** Say what happened and how to fix it, next to the cause. Never blame or apologise.
9. **Empty states.** An invitation to act: illustration, one line, one button.
10. **Consistency.** Same action, same name, same style everywhere ("Save", "Explore", "See my protection plan").
11. **Honesty.** Examples are labelled illustrative. No guarantees, rankings, quotes or implied partnerships.
