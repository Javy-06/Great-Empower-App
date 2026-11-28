import { useEffect, useRef, useState } from "react";
import { Check, ChevronUp, FastForward, Flag, Pause, Play, RotateCcw, Route, SkipForward, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { rewardsStore } from "@/rewards/store";
import { resetDemoData } from "../demoSession";
import { demoControl, useControl, useSkipWaiting } from "./demoControl";
import { findJourney, journeys } from "./journeys";

/**
 * The App Demo's floating control: a small pill (bottom right, above the tab bar) that opens a
 * compact panel. It never navigates on its own: only Start, Next step and Restart open screens.
 *
 * Pause stops demo timing (videos, animations, the step indicator following along) but leaves the
 * app fully usable. Resume continues from the same point.
 */
export function DemoToolbar() {
  const c = useControl();
  const skip = useSkipWaiting();
  const [open, setOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const journey = findJourney(c.journey);
  const step = journey?.steps[c.step];
  const last = journey ? c.step >= journey.steps.length - 1 : true;

  // The step indicator follows the presenter's own taps (it never navigates).
  useEffect(() => {
    const follow = () => demoControl.follow();
    follow();
    window.addEventListener("hashchange", follow);
    const unsub = rewardsStore.subscribe(follow);
    return () => {
      window.removeEventListener("hashchange", follow);
      unsub();
    };
  }, []);

  // Pause: stop playing media and CSS animations; Resume restarts exactly what was playing.
  const pausedMedia = useRef<HTMLMediaElement[]>([]);
  useEffect(() => {
    const root = document.documentElement;
    if (c.paused) {
      root.setAttribute("data-demo-paused", "");
      pausedMedia.current = [...document.querySelectorAll<HTMLMediaElement>("video, audio")].filter((m) => !m.paused);
      pausedMedia.current.forEach((m) => m.pause());
      // Anything that starts playing while paused is paused again.
      const hold = (e: Event) => (e.target as HTMLMediaElement).pause();
      document.addEventListener("play", hold, true);
      return () => document.removeEventListener("play", hold, true);
    }
    root.removeAttribute("data-demo-paused");
    pausedMedia.current.forEach((m) => void m.play().catch(() => undefined));
    pausedMedia.current = [];
  }, [c.paused]);

  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    // Tapping the app closes the panel (and the tap still reaches the app): it never blocks the demo.
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown, true);
    panelRef.current?.querySelector<HTMLElement>("button")?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown, true);
    };
  }, [open]);

  const btn = "inline-flex h-11 items-center justify-center gap-1.5 rounded-full px-3 text-body-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-45";

  return (
    <div
      ref={rootRef}
      className="fixed right-3 z-[45] flex flex-col items-end gap-2 bottom-[calc(max(0.75rem,env(safe-area-inset-bottom))+5rem)] md:bottom-4 md:right-4"
      data-testid="demo-toolbar"
    >
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Demo controls"
          className="ge-sheet w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-3xl bg-surface text-ink shadow-e3 ring-1 ring-ink/10"
        >
          <div className="flex items-center justify-between gap-2 bg-navy-950 px-4 py-3 text-white">
            <p className="flex items-center gap-2 text-caption font-bold uppercase tracking-[0.12em]">
              <span className="size-2 rounded-full bg-crimson-600" aria-hidden /> Demo mode
              {c.paused && <span className="rounded-full bg-gold-500 px-2 py-0.5 text-navy-950">Paused</span>}
            </p>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close demo controls" className="-mr-2 inline-flex size-10 items-center justify-center rounded-full hover:bg-white/10">
              <X size={18} aria-hidden />
            </button>
          </div>

          <div className="max-h-[min(30rem,62vh)] overflow-y-auto p-4">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  if (c.paused) demoControl.resume();
                  else demoControl.pause();
                }} className={cn(btn, c.paused ? "bg-gold-500 text-navy-950" : "bg-sunken text-navy-950")}>
                {c.paused ? <Play size={16} aria-hidden /> : <Pause size={16} aria-hidden />} {c.paused ? "Resume" : "Pause"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  skip?.run();
                }}
                disabled={!skip} title={skip ? skip.label : "Nothing to wait for on this screen"} className={cn(btn, "bg-sunken text-navy-950")}>
                <FastForward size={16} aria-hidden /> Skip waiting
              </button>
              {journey && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      demoControl.next();
                    }}
                    disabled={last} className={cn(btn, "col-span-2 bg-crimson-600 text-white hover:bg-crimson-700")}>
                    <SkipForward size={16} aria-hidden /> {last ? "Last step" : `Next step: ${journey.steps[c.step + 1].label}`}
                  </button>
                  <button type="button" onClick={() => demoControl.restart()} className={cn(btn, "ring-1 ring-ink/15 text-navy-900")}>
                    <RotateCcw size={16} aria-hidden /> Restart journey
                  </button>
                  <button type="button" onClick={() => demoControl.exit()} className={cn(btn, "ring-1 ring-ink/15 text-navy-900")}>
                    <Flag size={16} aria-hidden /> Exit journey
                  </button>
                </>
              )}
            </div>
            {skip && <p className="mt-2 text-caption text-ink-muted">Skip waiting here: {skip.label}. Demo only.</p>}

            <div className="mt-4">
            {journey ? (
              <section aria-labelledby="demo-journey-title">
                <p className="text-caption font-bold uppercase tracking-[0.12em] text-ink-muted">Journey</p>
                <h2 id="demo-journey-title" className="text-body font-semibold text-navy-950">{journey.title}</h2>
                <ol className="mt-2 grid gap-1" aria-label="Steps">
                  {journey.steps.map((s, i) => (
                    <li
                      key={s.id}
                      aria-current={i === c.step ? "step" : undefined}
                      className={cn("flex items-start gap-2 rounded-xl px-2 py-1.5 text-body-sm", i === c.step ? "bg-navy-50 font-semibold text-navy-950" : i < c.step ? "text-ink-secondary" : "text-ink-muted")}
                    >
                      <span className={cn("mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold", i < c.step ? "bg-teal-600 text-white" : i === c.step ? "bg-crimson-600 text-white" : "bg-sunken text-ink-muted")} aria-hidden>
                        {i < c.step ? <Check size={12} strokeWidth={3} /> : i + 1}
                      </span>
                      <span className="min-w-0">
                        {s.label}
                        {i === c.step && <span className="mt-0.5 block text-caption font-normal text-ink-secondary">{s.hint}</span>}
                      </span>
                    </li>
                  ))}
                </ol>
              </section>
            ) : (
              <section aria-labelledby="demo-journeys-title">
                <h2 id="demo-journeys-title" className="text-body font-semibold text-navy-950">Guided journeys</h2>
                <p className="text-caption text-ink-secondary">Optional. Start one, or just explore the app freely.</p>
                <ul className="mt-2 grid gap-1.5">
                  {journeys.map((j) => (
                    <li key={j.id}>
                      <button
                        type="button"
                        onClick={() => {
                          demoControl.start(j.id);
                          setOpen(false);
                        }}
                        className="flex min-h-12 w-full items-center gap-3 rounded-2xl px-3 py-2 text-left ring-1 ring-ink/[0.08] hover:bg-sunken"
                      >
                        <Route size={17} className="shrink-0 text-crimson-600" aria-hidden />
                        <span className="min-w-0">
                          <span className="block text-body-sm font-semibold text-navy-950">{j.title}</span>
                          <span className="block text-caption text-ink-secondary">{j.summary}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            </div>
            <div className="mt-4 border-t border-ink/10 pt-3">
              {confirmReset ? (
                <div className="rounded-2xl bg-gold-50 p-3 text-body-sm text-navy-950">
                  <p className="font-semibold">Reset the whole demo?</p>
                  <p className="mt-1 text-caption text-ink-secondary">Sample profile, points, progress and drafts go back to the start. Real accounts aren&apos;t touched.</p>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        demoControl.clear();
                        resetDemoData();
                        window.location.reload();
                      }}
                      className="inline-flex h-10 items-center rounded-full bg-crimson-600 px-4 font-bold text-white"
                    >
                      Yes, reset demo
                    </button>
                    <button type="button" onClick={() => setConfirmReset(false)} className="inline-flex h-10 items-center rounded-full px-4 font-semibold ring-1 ring-ink/15">Cancel</button>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={() => setConfirmReset(true)} className="inline-flex min-h-11 items-center gap-2 text-body-sm font-semibold text-navy-800">
                  <RotateCcw size={15} aria-hidden /> Reset demo…
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-1 rounded-full bg-navy-950/95 p-1 text-white shadow-e3 ring-1 ring-white/15 backdrop-blur">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="inline-flex h-10 max-w-[14rem] items-center gap-2 rounded-full pl-3 pr-2.5 text-caption font-bold"
        >
          <span className={cn("size-2 shrink-0 rounded-full", c.paused ? "bg-gold-500" : "bg-crimson-500")} aria-hidden />
          <span className="uppercase tracking-[0.1em]">{c.paused ? "Paused" : "Demo"}</span>
          <span className="sr-only"> controls</span>
          {journey && (
            <span className="min-w-0 truncate font-semibold normal-case tracking-normal text-white/85">
              {c.step + 1}/{journey.steps.length} · {step!.label}
            </span>
          )}
          {journey && <span className="sr-only">, {journey.title}</span>}
          <ChevronUp size={15} className={cn("shrink-0 transition-transform", !open && "rotate-180")} aria-hidden />
        </button>
        {journey && !last && (
          <button type="button" onClick={() => demoControl.next()} aria-label={`Next step: ${journey.steps[c.step + 1].label}`} className="inline-flex size-10 items-center justify-center rounded-full bg-crimson-600 hover:bg-crimson-700">
            <SkipForward size={16} aria-hidden />
          </button>
        )}
      </div>
    </div>
  );
}
