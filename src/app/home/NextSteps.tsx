import { ArrowRight, Check, ClipboardCheck, Gift, GraduationCap, Scale } from "lucide-react";
import { useLearnProgress } from "@/state/learnProgress";
import { profileCompleteness, useProfile } from "@/state/profile";
import { useRewards } from "@/rewards/store";
import { demoLessons } from "@/data/demo-courses";
import { researchedProducts } from "@/data/protection";
import { cn } from "@/lib/cn";

const go = (hash: string) => { window.location.hash = hash; };

/**
 * Home's main action: the GREAT EMPOWER path (Learn → Check → Compare) with live progress.
 * The first unfinished step is the one primary action; finished steps show a tick.
 * Reads progress stores only — no rewards or profile logic lives here.
 */
export function NextSteps() {
  const learn = useLearnProgress();
  const profile = useProfile();
  const rewards = useRewards();
  const lessonsDone = demoLessons.filter((l) => learn.completed.includes(l.id)).length;
  const next = demoLessons.find((l) => !learn.completed.includes(l.id));
  const check = profileCompleteness(profile);
  const products = researchedProducts.filter((p) => p.evidence !== "ISSUER_NOTICE").length;

  const steps = [
    {
      key: "learn",
      icon: GraduationCap,
      title: "Learn the basics",
      status: `${lessonsDone} of ${demoLessons.length} lessons`,
      progress: lessonsDone / demoLessons.length,
      done: lessonsDone === demoLessons.length,
      action: next ? `Continue: ${next.title}` : "Review lessons",
      to: next ? `app/learn/lesson/${next.id}` : "app/learn?format=lessons",
    },
    {
      key: "check",
      icon: ClipboardCheck,
      title: "Check your protection",
      status: `${check.done} of ${check.total} answers`,
      progress: check.done / check.total,
      done: check.done === check.total,
      action: check.done ? "Finish your check" : "Start your check",
      to: "app/simulate",
    },
    {
      key: "compare",
      icon: Scale,
      title: "Explore real products",
      status: `${products} verified products`,
      progress: 0,
      done: false,
      action: "Compare side by side",
      to: "app/learn/protection/products",
    },
  ];
  const current = steps.findIndex((s) => !s.done);

  return (
    <section aria-labelledby="next-title" className="rounded-[1.25rem] bg-surface p-4 shadow-e1 ring-1 ring-ink/[0.06] sm:p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="next-title" className="font-brand text-[1.75rem] font-semibold leading-tight text-navy-950">Your next step</h2>
        <button type="button" onClick={() => go("app/rewards")} className="inline-flex min-h-11 shrink-0 items-center gap-1.5 text-body-sm font-semibold text-gold-700">
          <Gift size={16} aria-hidden /> {rewards.points.toLocaleString("en-MY")} pts
        </button>
      </div>
      <ol className="mt-3 grid gap-2 md:grid-cols-3">
        {steps.map((s, i) => {
          const primary = i === current;
          return (
            <li key={s.key}>
              <button
                type="button"
                onClick={() => go(s.to)}
                aria-current={primary ? "step" : undefined}
                className={cn(
                  "group flex h-full w-full flex-col gap-3 rounded-2xl p-3.5 text-left transition-shadow",
                  primary ? "bg-navy-950 text-white shadow-e2" : "bg-sunken text-navy-950 hover:shadow-e1",
                )}
              >
                <span className="flex items-center gap-3">
                  <span className={cn("inline-flex size-10 shrink-0 items-center justify-center rounded-xl", primary ? "bg-white/10" : s.done ? "bg-teal-600 text-white" : "bg-white text-navy-800")}>
                    {s.done ? <Check size={18} strokeWidth={2.5} aria-hidden /> : <s.icon size={19} aria-hidden />}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-body-sm font-semibold">{i + 1}. {s.title}</span>
                    <span className={cn("block text-caption", primary ? "text-white/75" : "text-ink-muted")}>{s.done ? "Done" : s.status}</span>
                  </span>
                </span>
                {s.progress > 0 && !s.done && (
                  <span className={cn("block h-1.5 overflow-hidden rounded-full", primary ? "bg-white/15" : "bg-white")} aria-hidden>
                    <span className={cn("block h-full rounded-full", primary ? "bg-teal-300" : "bg-teal-600")} style={{ width: `${Math.round(s.progress * 100)}%` }} />
                  </span>
                )}
                <span className={cn("mt-auto inline-flex items-center gap-1.5 text-body-sm font-semibold", primary ? "text-white" : "text-crimson-600")}>
                  <span className="line-clamp-1">{s.action}</span>
                  <ArrowRight size={15} className="shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
