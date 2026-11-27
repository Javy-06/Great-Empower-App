# UI/UX Audit (before)

**Method:**
- Device-only build of `605a4f2` with the Demo Account, 390 px wide.
- Full-page screenshots of 13 key routes.
- Text-density metrics measured in the browser: words in `<main>`, paragraphs of 25+ words, page height in 900 px "screens".

**Status:** all numbers below are **Verified** (measured).

## 1. Measurements (before)
| Route | Words | Long paragraphs | Screens | Visuals (img / svg) | Verdict |
|---|---:|---:|---:|---|---|
| Home | 82 | 0 | 1.7 | 4 / 18 | Clear. Quick actions duplicate the bottom nav. No route to Protection explained. |
| Learn | 288 | 0 | 4.9 | 15 / 46 | Visual. Long: lessons are listed twice (topic cards **and** a full list). |
| **Protection explained (hub)** | **770** | **7** | **5.8** | 1 / 24 | **Wall of text.** 7 text sections; one photo; only one diagram. |
| **Protection · Medical** | **1,497** | **8** | **9.2** | 1 / 41 | **Worst page.** Six dense product cards fill about 60% of the page. |
| Protection · Critical illness | 680 | 5 | 4.4 | 1 / 24 | Text lists, myths and products all expanded |
| Simulate (profile) | 172 | 0 | 2.2 | 1 / 16 | OK |
| **Simulate → Needs** | 624 | 2 | **5.9** | 1 / 16 | Four tools stacked on one page, plus a duplicate tool index at the top |
| Analyze | 169 | 0 | 1.9 | 1 / 12 | The empty state repeats "Not assessed / Complete your profile" **four times** |
| Guide | 145 | 0 | 1.8 | 12 / 24 | Good: visual, short |
| Rewards hub | 348 | 2 | 4.2 | 15 / 15 | A 10-item food grid dominates; vouchers and earning sit below it |
| Rewards wallet | 174 | 2 | 1.5 | 0 / 2 | OK |
| About & legal | 184 | 4 | 1.6 | 0 / 1 | To be removed (owner decision) |
| Lesson page | 173 | 0 | 2.2 | 0 / 6 | OK |

## 2. Page-by-page issues and priorities
| P | Page | Issue | Type |
|---|---|---|---|
| **P0** | Protection hub | The core purpose isn't visible in seconds. Seven long paragraphs. Categories shown as a text list. Savings/insurance/investing as three text cards. No visual explanation of how a medical bill is shared (only an abstract four-colour bar). Checklist of six text items. | Cognitive load, visual communication |
| **P0** | Category pages (5) | Products expanded inline: on Medical, 6 cards with about 15 fields each. Myths fully expanded. Sources, Malaysia facts and products are always visible. The key concept is buried below an example paragraph. | Hierarchy, density |
| **P1** | Simulate → Needs | Four tools stacked (about 6 screens). A tool index that only scrolls. Users scroll past three tools to reach one. | Progressive disclosure |
| **P1** | Analyze (empty) | Four identical empty cards, each with the same CTA. The real message ("answer 8 questions to see your gaps") is diluted. | Redundancy |
| **P1** | Global | Footer link to About & legal; the hidden design-system viewer (`#foundation`). Both are to be removed. | Navigation, scope |
| **P2** | Rewards hub | Food grid (10 large tiles) before earning and vouchers. Balance is visible (good). Points' lack of cash value isn't stated. | Hierarchy |
| **P2** | Home | Quick actions repeat the bottom nav. The most important learning destination (Protection explained) isn't on Home. | Discovery |
| **P2** | Learn | Lessons appear as topic cards **and** a full list; infographic thumbnails are large | Length |
| P3 | Guide, lessons, wallet | Minor | — |

## 3. Cross-cutting findings
- **Cards everywhere:** most sections are rounded white cards with a ring. Hierarchy comes from headings alone.
- **Disclaimers repeated:** the hub repeats "not affiliated / not a recommendation" three times, and each category page twice more.
- **Visual language:** good photos and infographics exist, but Protection explained uses almost none of them. Icons (lucide) are consistent.
- **Mobile:** layouts don't overflow (verified in the previous phase), but page length is the main mobile problem.
- **Accessibility:** basics are good (native controls, labels, `aria-live`, focus). Long pages hurt screen-reader navigation, and collapsing content helps.
- **Assets:** five category infographics, four videos and six Pexels photos exist. `family-protection-conversation.webp` is used once. Category pages have no hero visual.
