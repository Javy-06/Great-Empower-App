# Youth User Test Plan: Protection Experience

**Status: prepared, not conducted.** Recruiting or contacting participants needs your approval.

## 1. Setup
| Item | Plan |
|---|---|
| Build | A **device-only** build, run locally or as a device-only Preview (see `Preview_Safety_Audit.md`), so testers never create live accounts or points |
| Account | Each participant uses the Demo Account (device-only). Reset between sessions with "Reset demo". |
| Format | 30–40 minutes, one-to-one, in person or a video call with screen share. Think-aloud. |
| Device | Each participant's own phone if possible (mobile-first), otherwise a laptop |
| Recording | Notes only by default. Screen or audio recording only with written consent. |

## 2. Participants
- 3–5 Malaysian young adults aged 18–30.
- **Mix:**
  - at least one student and one working adult;
  - at least one person with no insurance and one with an employer or own medical card;
  - a spread of languages (BM, Chinese or Tamil speakers welcome; the app is English).
- **Excluded:** anyone working in insurance sales, and team members.
- **Don't collect:** names on the observation sheets (use P1–P5), NRIC, income, health conditions, policy details or any real financial figures. Participants use the **example** buttons or made-up numbers in the simulators.

## 3. Tasks
| # | Task (read aloud) | Success criterion |
|---|---|---|
| 1 | "Find out what medical insurance covers." | Reaches the Medical page and names 2+ items from "What it may help with" |
| 2 | "Explain the difference between medical insurance and critical illness cover." | Says medical pays bills; CI pays a lump sum on a covered diagnosis |
| 3 | "Explain the difference between life insurance and critical illness cover." | Life pays on death (to nominee or estate); CI pays while alive on diagnosis |
| 4 | "Does medical insurance mean you pay nothing at the hospital?" | Says no, mentioning a deductible, co-payment, limits or exclusions |
| 5 | "Use the Family Protection tool with the research example." | Gets a result and can say which of the two numbers counts savings |
| 6 | "Use the Critical Illness Recovery tool with the example." | Gets a result and changes the recovery period |
| 7 | "What does this result mean? Is it a price you would pay?" | Explains it as an illustrated gap. **Does not** call it a quote or a recommendation. |
| 8 | "Find an official source for one product." | Opens an official Great Eastern link from a product card |
| 9 | "What would you still need to check before buying?" | Points to "Needs official confirmation" and/or the before-you-buy checklist |

## 4. Moderator script (short)
1. **Welcome:** "Thanks for helping. We're testing the app, not you. There are no wrong answers. Please think aloud."
2. **Consent:** "We won't collect your name or any personal financial or health information. Please use made-up numbers or the example buttons. You can stop at any time. May I take notes? (Recording only with your written OK.)"
3. **Context:** "Imagine you've just started working and want to understand insurance before talking to anyone."
4. **Tasks:** read each task exactly. Don't hint. If they're stuck for 2 minutes, note it and move on.
5. **After each task:** "How confident are you in that answer, 1–5?"
6. **Debrief:** the post-test questionnaire, then "Anything confusing or surprising?"
7. **Close:** thank them. Clear the app data (Reset demo / clear site data).

## 5. Observation sheet (one per participant)
```
Participant: P_   Date: ____   Device: phone / laptop   Insurance today: none / employer / own / unsure
Task | Completed (Y / partial / N) | Time (mm:ss) | Confidence 1–5 | Path taken | Confusion points | Misunderstandings (quote)
1 …
…
9 …
Thought the simulator result was a quote?        Y / N   (quote)
Thought products were recommendations?           Y / N   (quote)
Noticed "Needs official confirmation"?           Y / N
Noticed the two savings variants (Family)?       Y / N   Understood why?  Y / N
```

## 6. Post-test questionnaire (1 = strongly disagree … 5 = strongly agree)
1. I understand the difference between medical, critical illness and life insurance.
2. I understand that having medical insurance doesn't mean paying nothing at the hospital.
3. The simulator results were easy to understand.
4. I understand the results are illustrations, not quotes.
5. I felt the app was recommending a specific product to me. (reverse-scored)
6. The information felt trustworthy.
7. I'd use this before talking to an insurance agent.

**Open questions:**
- What was most useful?
- What was most confusing?
- What's missing?

## 7. Feedback template (summary across participants)
| Theme | Evidence (P#, quote) | Severity (blocker / major / minor) | Suggested change | Owner |
|---|---|---|---|---|

**Measures to report:**
- task success rate;
- median time per task;
- the number of participants who read a result as a quote (target 0/5);
- the number who saw products as recommendations (target 0/5);
- questionnaire medians.
