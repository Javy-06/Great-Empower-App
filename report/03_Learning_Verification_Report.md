# 03 — Learning Verification Report (Lessons & Infographics)

## 1. Flow
```
Read lesson / view infographic → "Check your understanding" quiz → submit → server grades
   → 3/3: points paid once (+50 lesson, +20 infographic)
   → <3/3: 0 points, explanations shown, retry the missed questions
```

| Content | Count | Quiz | Reward | Earn key |
|---|---:|---|---:|---|
| Lessons: money-talks, medical-cards, emergency-fund, hospital-bills, income-replacement, first-salary, deductibles | 7 | 3 MCQs × 4 options | 50 | `lesson-complete:<id>` |
| Infographics: insurance-safety-net, medical-insurance-malaysia, life-insurance-malaysia, critical-illness-malaysia, personal-accident-malaysia | 5 | 3 MCQs × 4 options | 20 | `infographic-viewed:<id>` |

## 2. Question content
- **Source:** `src/data/quizzes.ts`, 36 questions.
  - Lesson questions are written only from the lesson's on-page "Key points".
  - Infographic questions are written only from the text printed on the infographic.
- **Each question has:** a prompt, 4 options (ids a–d), the correct id and a short explanation.
- **Tone:** beginner-friendly, for Malaysian young adults. No trick questions, no "all of the above", and no options that depend on their position (so shuffling is safe).
- **Tests** (`verification.test.ts`):
  - every lesson and infographic has exactly one 3-question quiz, and nothing else has one;
  - each question has 4 distinct options, a valid answer and an explanation;
  - correct answers are not all in the same position;
  - the SQL answer key matches exactly.

## 3. Quiz UX (`src/app/learn/RewardQuiz.tsx`)
- **Layout:** one question per screen, "Question n of N", and a progress bar showing "x/N answered".
- **Selecting an answer:** large radio rows (at least 48 px). The selection is shown with the navy ring and fill, and native keyboard radio behaviour works.
- **Navigation:**
  - "Next" stays disabled until the question is answered, and "Back" keeps earlier answers.
  - The last step shows "Check answers".
  - Focus moves to each new question or result heading.
- **Results screen:** a score banner, then every question with ✓/✗.
  - Wrong: "Your answer", "Correct answer" and the explanation.
  - Right: the answer and its explanation.
- **Transitions:** the existing `ge-reveal` fade. It honours `prefers-reduced-motion`.
- **Mobile:** checked at 390 px wide. No horizontal overflow (measured as 0).

## 4. Shuffling
- **What is shuffled:** question order and the order of each question's options are shuffled independently on every attempt, using `shuffled()` (Fisher–Yates) in `src/rewards/verification.ts`.
- **What stays fixed:** ids never change and answers are submitted as `{questionId: optionId}`, so shuffling can't change grading.
- **Unit test:** shuffling keeps every item, options really get reordered, and answering by id after shuffling still scores perfect.
- **Browser test:** orders seen included `q3,q2,q1` with options `bacd`, and `q2,q1,q3` with `dabc`.

## 5. Retry behaviour
- On a failed attempt, "Try again" asks **only the missed questions**, reshuffled. Correct answers are kept, and the whole lesson does not have to be re-read.
- Attempts are unlimited. There are no deductions and no partial points.
- The final submission always contains every question, and the server grades all of them again.

## 6. Perfect-score requirement and reward eligibility
- **Pays only when** `score === total` (3/3). Unanswered or unknown answers count as wrong.
- **Checked twice:**
  - Device-only accounts: `submitQuiz()` in `src/rewards/economy.ts`.
  - Cloud accounts: `public.submit_quiz` on the server is the authority.
- **Old path closed:**
  - `earn()` in the app and the `earn_points` RPC on the server now **refuse** `lesson-complete`, `infographic-viewed` and `video-finished`.
  - The old "mark complete" call can't pay any more, even when called directly.

## 7. Duplicate reward protection
- Payment goes through `ge_private.pay_activity`, which uses the existing ledger and its unique `(user_id, earn_key)` rule.
- A second perfect score returns `already_earned: true` with 0 points. The UI says "Points for this were already earned".
- **Live check (2026-11-27):** 0 duplicate `(user_id, earn_key)` rows.

## 8. Backend validation (`submit_quiz`)
| Check | Behaviour |
|---|---|
| Caller identity | `ge_private.require_uid()`, from the session token. There is no user-id parameter. |
| Kind | Must be `lesson-complete` or `infographic-viewed` |
| Content id | Pattern `^[a-z0-9-]{1,80}$` and must exist in `ge_private.quiz_answer_key` (which only holds allow-listed content) |
| Answers | Must be a JSON object of at most 2,000 bytes. Extra keys are ignored. |
| Grading | Done in SQL against the server-only key. Client scores are never accepted. |
| Concurrency | `select … for update` on the caller's profile row |
| Response | Per-question correctness, score and total, plus points paid and the new balance |

Database tests (PGlite, `supabase/tests/verification.test.mjs`) cover:
- 2/3 pays nothing; retry with 3/3 pays 50 exactly once;
- infographics behave the same way;
- fake ids and kinds are refused;
- one account's pass never affects another account;
- the answer key can't be read by `anon` or `authenticated`.

## 9. Known limitation
- **Answer key in the client bundle:** it is also included in the app (used to explain results and to grade device-only accounts). Someone who reads the bundle can pass every quiz.
- **The server reveals correctness:** it returns per-question correctness, so the answers can be found by retrying. That is part of the "learn from mistakes" design.

The quiz requires the learner to engage. It is not a secure exam, and the maximum gain from bypassing it is 450 pts per account, once.
