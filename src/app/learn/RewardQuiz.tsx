import { useRef, useState } from "react";
import { CheckCircle2, Loader2, RotateCcw, Sparkles, XCircle } from "lucide-react";
import { earningRules, type QuizKind } from "@/rewards/catalogue";
import { findQuiz } from "@/rewards/verification";
import { rewardsActions, useRewards } from "@/rewards/store";
import { cn } from "@/lib/cn";

type Phase =
  | { name: "answering" }
  | { name: "checking" }
  | { name: "result"; score: number; total: number; perfect: boolean; wrong: Set<string>; earned: boolean; points: number }
  | { name: "error"; message: string };

/**
 * "Check your understanding" quiz. Points are paid only for a perfect score (graded by the server
 * for cloud accounts). A failed attempt shows the right answers with short explanations, keeps the
 * correct answers, and lets the learner retry just the questions they missed.
 */
export function RewardQuiz({ kind, contentId, onPassed, onStart }: { kind: QuizKind; contentId: string; onPassed: () => void; onStart?: () => void }) {
  const quiz = findQuiz(kind, contentId);
  const rewards = useRewards();
  const alreadyEarned = rewards.earned.includes(`${kind}:${contentId}`);
  const points = earningRules[kind].points;
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<Phase>({ name: "answering" });
  const [attempt, setAttempt] = useState(1);
  const busy = useRef(false);
  if (!quiz) return null;

  const total = quiz.questions.length;
  const answered = quiz.questions.filter((q) => answers[q.id]).length;
  const locked = phase.name === "checking" || (phase.name === "result" && phase.perfect);
  const showResult = phase.name === "result";
  const wrong = phase.name === "result" ? phase.wrong : null;

  const choose = (qid: string, oid: string) => {
    if (locked || (wrong && !wrong.has(qid))) return;
    if (answered === 0 && attempt === 1) onStart?.();
    setAnswers((a) => ({ ...a, [qid]: oid }));
  };

  const submit = async () => {
    if (busy.current || answered < total) return;
    busy.current = true;
    setPhase({ name: "checking" });
    const r = await rewardsActions.submitQuiz(kind, contentId, answers);
    busy.current = false;
    if (!r.ok) {
      setPhase({ name: "error", message: r.error });
      return;
    }
    const wrong = new Set(r.results.filter((x) => !x.correct).map((x) => x.id));
    setPhase({ name: "result", score: r.score, total: r.total, perfect: r.perfect, wrong, earned: r.earned, points: r.points });
    if (r.perfect) onPassed();
  };

  const retry = () => {
    if (phase.name !== "result") return;
    // Keep the answers that were right; clear only the ones to try again.
    setAnswers((a) => Object.fromEntries(Object.entries(a).filter(([qid]) => !phase.wrong.has(qid))));
    setAttempt((n) => n + 1);
    setPhase({ name: "answering" });
  };

  return (
    <section aria-labelledby={`quiz-${contentId}`} className="rounded-2xl bg-surface p-4 ring-1 ring-ink/[0.07] sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 id={`quiz-${contentId}`} className="text-subheading text-navy-950">Check your understanding</h2>
          <p className="mt-0.5 text-caption text-ink-muted">
            {alreadyEarned && !(phase.name === "result" && phase.earned)
              ? "You've already earned the points for this. Retake the quiz any time."
              : `Answer all ${total} questions correctly to earn ${points} pts. You can retry as often as you like.`}
          </p>
        </div>
        <span className={cn("inline-flex h-7 items-center gap-1 rounded-full px-2.5 text-caption font-bold", alreadyEarned ? "bg-success-50 text-success-700" : "bg-gold-50 text-gold-700")}>
          {alreadyEarned ? <><CheckCircle2 size={14} aria-hidden /> Earned</> : `+${points} pts`}
        </span>
      </div>

      <ol className="mt-4 grid gap-4">
        {quiz.questions.map((q, i) => {
          const isWrong = !!wrong?.has(q.id);
          const isRight = !!wrong && !wrong.has(q.id);
          const correctText = q.options.find((o) => o.id === q.answer)?.text;
          return (
            <li key={q.id}>
              <fieldset disabled={locked || isRight}>
                <legend className="text-body font-semibold text-navy-950">
                  <span className="mr-1.5 text-ink-muted">{i + 1}.</span>
                  {q.prompt}
                </legend>
                <div className="mt-2 grid gap-2">
                  {q.options.map((o) => {
                    const selected = answers[q.id] === o.id;
                    return (
                      <label
                        key={o.id}
                        className={cn(
                          "flex min-h-12 cursor-pointer items-center gap-3 rounded-xl px-3.5 py-2.5 text-body-sm ring-1 transition-colors duration-200",
                          selected ? "bg-navy-50 text-navy-950 ring-navy-900" : "bg-surface text-ink ring-ink/12 hover:ring-ink/30",
                          isRight && selected && "bg-success-50 ring-success-600",
                          isWrong && selected && "bg-error-50 ring-error-600",
                          (locked || isRight) && "cursor-default",
                        )}
                      >
                        <input
                          type="radio"
                          name={`${contentId}-${q.id}`}
                          value={o.id}
                          checked={selected}
                          onChange={() => choose(q.id, o.id)}
                          className="size-4 shrink-0 accent-navy-900"
                        />
                        <span className="min-w-0 flex-1">{o.text}</span>
                        {isRight && selected && <CheckCircle2 size={18} className="shrink-0 text-success-700" aria-label="Correct" />}
                        {isWrong && selected && <XCircle size={18} className="shrink-0 text-error-700" aria-label="Incorrect" />}
                      </label>
                    );
                  })}
                </div>
                {isWrong && (
                  <p className="mt-2 rounded-xl bg-gold-50 px-3.5 py-2.5 text-body-sm text-navy-950">
                    <span className="font-semibold">Correct answer: {correctText}.</span> {q.explanation}
                  </p>
                )}
                {isRight && phase.name === "result" && !phase.perfect && (
                  <p className="mt-1.5 text-caption font-semibold text-success-700">Correct — kept for your next try.</p>
                )}
              </fieldset>
            </li>
          );
        })}
      </ol>

      <div className="mt-5" aria-live="polite">
        {phase.name === "result" && phase.perfect && (
          <p role="status" className="flex items-center gap-2 rounded-xl bg-success-50 px-4 py-3 text-body-sm font-semibold text-success-700">
            <Sparkles size={18} aria-hidden />
            {phase.earned ? `Perfect score — ${phase.score}/${phase.total}. +${phase.points} pts added.` : `Perfect score — ${phase.score}/${phase.total}. Points for this were already earned.`}
          </p>
        )}
        {phase.name === "result" && !phase.perfect && (
          <div role="status" className="rounded-xl bg-error-50 px-4 py-3 text-body-sm text-error-700">
            <p className="font-semibold">Not passed yet — {phase.score}/{phase.total} correct. No points this time.</p>
            <p className="mt-0.5 text-ink-secondary">Check the explanations above, then try the {phase.wrong.size === 1 ? "question you missed" : `${phase.wrong.size} questions you missed`} again.</p>
          </div>
        )}
        {phase.name === "error" && (
          <p role="alert" className="flex items-center gap-2 rounded-xl bg-error-50 px-4 py-3 text-body-sm font-semibold text-error-700">
            <XCircle size={18} aria-hidden /> {phase.message}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-3">
          {phase.name === "result" && !phase.perfect ? (
            <button type="button" onClick={retry} className="inline-flex h-12 items-center gap-2 rounded-full bg-navy-900 px-6 text-body-sm font-semibold text-white hover:bg-navy-800">
              <RotateCcw size={16} aria-hidden /> Try again
            </button>
          ) : phase.name === "result" && phase.perfect ? null : (
            <button
              type="button"
              onClick={submit}
              disabled={answered < total || phase.name === "checking"}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-crimson-600 px-6 text-body-sm font-semibold text-white hover:bg-crimson-700 disabled:bg-ink/15 disabled:text-ink-muted"
            >
              {phase.name === "checking" && <Loader2 size={16} className="animate-spin" aria-hidden />}
              Check answers
            </button>
          )}
          {phase.name !== "result" && <span className="text-caption text-ink-muted tabular-nums">{answered}/{total} answered</span>}
        </div>
      </div>
    </section>
  );
}
