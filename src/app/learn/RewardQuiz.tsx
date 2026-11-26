import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, RotateCcw, Sparkles, XCircle } from "lucide-react";
import { earningRules, type QuizKind } from "@/rewards/catalogue";
import { findQuiz, shuffled } from "@/rewards/verification";
import { rewardsActions, useRewards } from "@/rewards/store";
import { ProgressBar } from "@/components/ui/Progress";
import { cn } from "@/lib/cn";
import type { Quiz } from "@/data/quizzes";

type Result = { score: number; total: number; perfect: boolean; wrong: Set<string>; earned: boolean; points: number };
type Phase = { name: "answering" } | { name: "checking" } | ({ name: "result" } & Result);

/** Display order only: question and option ids never change, so grading by id is unaffected. */
const layoutFor = (quiz: Quiz) => ({
  order: shuffled(quiz.questions.map((q) => q.id)),
  options: Object.fromEntries(quiz.questions.map((q) => [q.id, shuffled(q.options.map((o) => o.id))])) as Record<string, string[]>,
});

/**
 * "Check your understanding" quiz, one question per screen. Points are paid only for a perfect
 * score (graded by the server for cloud accounts). A failed attempt shows the score, the right
 * answers and short explanations, keeps the correct answers, and lets the learner retry only the
 * questions they missed. Question and option order are shuffled on each attempt.
 */
export function RewardQuiz({ kind, contentId, onPassed, onStart }: { kind: QuizKind; contentId: string; onPassed: () => void; onStart?: () => void }) {
  const quiz = findQuiz(kind, contentId);
  const rewards = useRewards();
  const alreadyEarned = rewards.earned.includes(`${kind}:${contentId}`);
  const points = earningRules[kind].points;
  const [layout, setLayout] = useState(() => (quiz ? layoutFor(quiz) : { order: [], options: {} }));
  const [queue, setQueue] = useState<string[]>(layout.order);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<Phase>({ name: "answering" });
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(1);
  const busy = useRef(false);
  const started = useRef(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);

  // Move focus to the new question / result after the learner navigates (not on first render).
  useEffect(() => {
    if (moved.current) headingRef.current?.focus({ preventScroll: false });
  }, [step, phase.name, attempt]);

  if (!quiz) return null;
  const byId = new Map(quiz.questions.map((q) => [q.id, q]));
  const total = quiz.questions.length;

  const go = (fn: () => void) => {
    moved.current = true;
    fn();
  };

  const choose = (qid: string, oid: string) => {
    if (phase.name !== "answering") return;
    if (!started.current) {
      started.current = true;
      onStart?.();
    }
    setError(null);
    setAnswers((a) => ({ ...a, [qid]: oid }));
  };

  const submit = async () => {
    if (busy.current || quiz.questions.some((q) => !answers[q.id])) return;
    busy.current = true;
    setError(null);
    setPhase({ name: "checking" });
    const r = await rewardsActions.submitQuiz(kind, contentId, answers);
    busy.current = false;
    if (!r.ok) {
      setPhase({ name: "answering" });
      setError(r.error);
      return;
    }
    const wrong = new Set(r.results.filter((x) => !x.correct).map((x) => x.id));
    go(() => setPhase({ name: "result", score: r.score, total: r.total, perfect: r.perfect, wrong, earned: r.earned, points: r.points }));
    if (r.perfect) onPassed();
  };

  const retry = () => {
    if (phase.name !== "result") return;
    const missed = phase.wrong;
    // Keep the answers that were right; reshuffle and ask again only the ones that were missed.
    const next = layoutFor(quiz);
    setLayout((l) => ({ order: l.order, options: { ...l.options, ...Object.fromEntries([...missed].map((id) => [id, next.options[id]])) } }));
    setAnswers((a) => Object.fromEntries(Object.entries(a).filter(([qid]) => !missed.has(qid))));
    go(() => {
      setQueue(next.order.filter((id) => missed.has(id)));
      setStep(0);
      setAttempt((n) => n + 1);
      setPhase({ name: "answering" });
    });
  };

  const header = (
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
  );

  /* ------------------------------------------------------------------ result screen */
  if (phase.name === "result") {
    const ordered = layout.order.map((id) => byId.get(id)!);
    return (
      <section aria-labelledby={`quiz-${contentId}`} data-quiz-state={phase.perfect ? "passed" : "failed"} className="rounded-2xl bg-surface p-4 ring-1 ring-ink/[0.07] sm:p-5">
        {header}
        <div className="mt-4" aria-live="polite">
          {phase.perfect ? (
            <div role="status" className="rounded-xl bg-success-50 px-4 py-3 text-success-700">
              <h3 ref={headingRef} tabIndex={-1} className="flex items-center gap-2 text-body font-bold outline-none">
                <Sparkles size={18} aria-hidden /> Perfect score — {phase.score}/{phase.total}
              </h3>
              <p className="mt-0.5 text-body-sm">{phase.earned ? `+${phase.points} pts added to your balance.` : "Points for this were already earned, so none were added."}</p>
            </div>
          ) : (
            <div role="status" className="rounded-xl bg-error-50 px-4 py-3 text-error-700">
              <h3 ref={headingRef} tabIndex={-1} className="text-body font-bold outline-none">
                Not passed yet — {phase.score}/{phase.total} correct
              </h3>
              <p className="mt-0.5 text-body-sm text-ink-secondary">
                No points this time. Read the {phase.wrong.size === 1 ? "explanation" : "explanations"} below, then try the{" "}
                {phase.wrong.size === 1 ? "question you missed" : `${phase.wrong.size} questions you missed`} again. Your correct answers are kept.
              </p>
            </div>
          )}
        </div>

        <ol className="mt-4 grid gap-3">
          {ordered.map((q, i) => {
            const isWrong = phase.wrong.has(q.id);
            const given = q.options.find((o) => o.id === answers[q.id])?.text;
            const correct = q.options.find((o) => o.id === q.answer)?.text;
            return (
              <li key={q.id} data-qid={q.id} className={cn("rounded-xl px-3.5 py-3 ring-1", isWrong ? "ring-error-600/40" : "ring-ink/[0.08]")}>
                <p className="flex items-start gap-2 text-body-sm font-semibold text-navy-950">
                  {isWrong ? <XCircle size={18} className="mt-0.5 shrink-0 text-error-700" aria-label="Incorrect" /> : <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-success-700" aria-label="Correct" />}
                  <span><span className="text-ink-muted">{i + 1}. </span>{q.prompt}</span>
                </p>
                {isWrong ? (
                  <div className="mt-2 grid gap-1.5 pl-[26px] text-body-sm">
                    <p className="text-ink-secondary">Your answer: {given}</p>
                    <p className="rounded-lg bg-gold-50 px-3 py-2 text-navy-950">
                      <span className="font-semibold">Correct answer: {correct}.</span> {q.explanation}
                    </p>
                  </div>
                ) : (
                  <p className="mt-1 pl-[26px] text-caption text-ink-secondary">{correct}</p>
                )}
              </li>
            );
          })}
        </ol>

        {!phase.perfect && (
          <button type="button" onClick={retry} className="mt-4 inline-flex h-12 items-center gap-2 rounded-full bg-navy-900 px-6 text-body-sm font-semibold text-white hover:bg-navy-800">
            <RotateCcw size={16} aria-hidden /> Try again
          </button>
        )}
      </section>
    );
  }

  /* ------------------------------------------------------------------ one question per screen */
  const qid = queue[step];
  const q = byId.get(qid)!;
  const last = step === queue.length - 1;
  const checking = phase.name === "checking";
  const answeredInQueue = queue.filter((id) => answers[id]).length;
  const retrying = attempt > 1;

  return (
    <section aria-labelledby={`quiz-${contentId}`} data-quiz-state="answering" className="rounded-2xl bg-surface p-4 ring-1 ring-ink/[0.07] sm:p-5">
      {header}

      <div className="mt-4">
        <ProgressBar
          value={answeredInQueue}
          max={queue.length}
          tone="navy"
          size="sm"
          label={retrying ? `Retry · question ${step + 1} of ${queue.length}` : `Question ${step + 1} of ${queue.length}`}
          valueLabel={`${answeredInQueue}/${queue.length} answered`}
        />
      </div>

      <fieldset key={`${attempt}-${qid}`} data-qid={qid} disabled={checking} className="mt-4">
        <legend className="w-full">
          <h3 ref={headingRef} tabIndex={-1} className="text-body font-semibold text-navy-950 outline-none">{q.prompt}</h3>
        </legend>
        <div className="mt-3 grid gap-2">
          {layout.options[qid].map((oid) => {
            const o = q.options.find((x) => x.id === oid)!;
            const selected = answers[qid] === o.id;
            return (
              <label
                key={o.id}
                className={cn(
                  "flex min-h-12 cursor-pointer items-center gap-3 rounded-xl px-3.5 py-2.5 text-body-sm ring-1 transition-colors duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-navy-900",
                  selected ? "bg-navy-50 text-navy-950 ring-navy-900" : "bg-surface text-ink ring-ink/12 hover:ring-ink/30",
                  checking && "cursor-default",
                )}
              >
                <input
                  type="radio"
                  name={`${contentId}-${qid}-${attempt}`}
                  value={o.id}
                  checked={selected}
                  onChange={() => choose(qid, o.id)}
                  className="size-4 shrink-0 accent-navy-900"
                />
                <span className="min-w-0 flex-1">{o.text}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {error && (
        <p role="alert" className="mt-4 flex items-center gap-2 rounded-xl bg-error-50 px-4 py-3 text-body-sm font-semibold text-error-700">
          <XCircle size={18} aria-hidden /> {error}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => go(() => setStep((s) => s - 1))}
            disabled={checking}
            className="inline-flex h-12 items-center gap-2 rounded-full px-4 text-body-sm font-semibold text-navy-900 ring-1 ring-ink/15 hover:ring-ink/30 disabled:text-ink-muted"
          >
            <ArrowLeft size={16} aria-hidden /> Back
          </button>
        ) : (
          <span />
        )}
        {last ? (
          <button
            type="button"
            onClick={submit}
            disabled={!answers[qid] || checking}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-crimson-600 px-6 text-body-sm font-semibold text-white hover:bg-crimson-700 disabled:bg-ink/15 disabled:text-ink-muted"
          >
            {checking && <Loader2 size={16} className="animate-spin" aria-hidden />}
            Check answers
          </button>
        ) : (
          <button
            type="button"
            onClick={() => go(() => setStep((s) => s + 1))}
            disabled={!answers[qid]}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-navy-900 px-6 text-body-sm font-semibold text-white hover:bg-navy-800 disabled:bg-ink/15 disabled:text-ink-muted"
          >
            Next <ArrowRight size={16} aria-hidden />
          </button>
        )}
      </div>
    </section>
  );
}
