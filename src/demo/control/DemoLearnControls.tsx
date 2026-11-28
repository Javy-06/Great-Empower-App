import { useState, type RefObject } from "react";
import { ArrowRight, CheckCircle2, FastForward, GraduationCap, SkipForward } from "lucide-react";
import { rewardsActions, rewardsStore, useRewards } from "@/rewards/store";
import { earningRules } from "@/rewards/catalogue";
import { watchKey } from "@/rewards/verification";
import { useLearnProgress } from "@/state/learnProgress";
import { useDemoSkip } from "./demoControl";

const pts = (n: number) => `${n.toLocaleString("en-MY")} pts`;
const go = (hash: string) => {
  window.location.hash = hash;
  window.scrollTo({ top: 0 });
};

/**
 * DEMO ONLY (rendered only in the App Demo). Lets a presenter finish a video without waiting.
 *  - "Skip video" jumps playback to the end. Like the real app, skipped footage earns nothing.
 *  - "Complete demo lesson" simulates the remaining watch time through the SAME rewards rule
 *    (`recordWatch`), on the demo's device-only ledger. The real app never shows these controls,
 *    and its rule (watch the whole video to earn) is unchanged.
 */
export function DemoLearnControls({ videoRef, videoId, lang, required, earned }: { videoRef: RefObject<HTMLVideoElement | null>; videoId: string; lang: string; required: number; earned: boolean }) {
  const rewards = useRewards();
  const progress = useLearnProgress();
  const [result, setResult] = useState<{ points: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const points = earningRules["video-finished"].points;

  const skipVideo = () => {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    if (Number.isFinite(v.duration)) v.currentTime = Math.max(0, v.duration - 0.5);
  };

  const complete = async () => {
    videoRef.current?.pause();
    const confirmed = rewardsStore.get().watch?.[watchKey(videoId, lang)] ?? 0;
    const remaining = Math.max(0, Math.ceil(required - confirmed));
    const r = await rewardsActions.recordWatch(videoId, lang, remaining);
    if (!r.ok) return setError(r.error);
    setError(null);
    setResult({ points: r.earned ? r.points : 0 });
    window.setTimeout(() => document.querySelector("[data-demo='lesson-complete']")?.scrollIntoView({ behavior: "smooth", block: "center" }), 60);
  };

  useDemoSkip("skip the video wait and complete the demo lesson", () => void complete(), !earned && required > 0);

  if (earned) {
    return (
      <section data-demo="lesson-complete" aria-labelledby="demo-complete-title" className="mt-4 rounded-2xl bg-navy-950 p-5 text-white ring-1 ring-white/15">
        <p className="flex items-center gap-2 text-caption font-bold uppercase tracking-[0.12em] text-gold-300">
          <CheckCircle2 size={15} aria-hidden /> Lesson complete
        </p>
        <h2 id="demo-complete-title" className="mt-1 font-brand text-[1.75rem] font-semibold leading-tight">
          {result?.points ? `+${pts(result.points)} earned` : "Points earned"}
        </h2>
        <dl className="mt-3 grid grid-cols-2 gap-2 text-left">
          <div className="rounded-xl bg-white/10 p-3">
            <dt className="text-caption text-white/70">Demo balance</dt>
            <dd className="font-brand text-[1.375rem] font-semibold tabular-nums">{pts(rewards.points)}</dd>
          </div>
          <div className="rounded-xl bg-white/10 p-3">
            <dt className="text-caption text-white/70">Learning progress</dt>
            <dd className="flex items-center gap-1.5 font-brand text-[1.375rem] font-semibold"><GraduationCap size={18} aria-hidden /> {progress.completed.length} done</dd>
          </div>
        </dl>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => go("app/rewards/wallet")} className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-4 text-body-sm font-bold text-navy-950">
            See points history <ArrowRight size={15} aria-hidden />
          </button>
          <button type="button" onClick={() => go("app/learn")} className="inline-flex h-11 items-center rounded-full px-4 text-body-sm font-semibold ring-1 ring-white/30">
            Back to Learn
          </button>
        </div>
      </section>
    );
  }

  if (!required) return null;
  return (
    <section aria-label="Demo-only controls" className="mt-3 rounded-2xl border-2 border-dashed border-gold-500/70 bg-gold-50 p-3.5 text-navy-950">
      <p className="text-caption font-bold uppercase tracking-[0.12em] text-gold-700">Demo only · presenter shortcut</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" onClick={skipVideo} className="inline-flex h-11 items-center gap-1.5 rounded-full bg-white px-4 text-body-sm font-semibold ring-1 ring-ink/15">
          <SkipForward size={16} aria-hidden /> Skip video
        </button>
        <button type="button" onClick={() => void complete()} className="inline-flex h-11 items-center gap-1.5 rounded-full bg-navy-900 px-4 text-body-sm font-bold text-white">
          <FastForward size={16} aria-hidden /> Complete demo lesson (+{points} pts)
        </button>
      </div>
      <p className="mt-2 text-caption text-ink-secondary">
        Skipping alone earns nothing, just like the real app. “Complete demo lesson” simulates the rest of the watch time in the demo only; real users must watch the whole video.
      </p>
      {error && <p role="alert" className="mt-1 text-caption font-semibold text-error-700">{error}</p>}
    </section>
  );
}
