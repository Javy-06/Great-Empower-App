import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ExternalLink,
  FastForward,
  Hand,
  Pause,
  Play,
  RotateCcw,
  RefreshCw,
  SkipBack,
  SkipForward,
  Square,
  TriangleAlert,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { autoRunner, useAuto, type AutoSpeed, type AutoStatus } from "./runner";
import { features } from "./script";

const STATUS: Record<AutoStatus, { label: string; cls: string }> = {
  ready: { label: "Ready", cls: "bg-sunken text-navy-900" },
  playing: { label: "Playing", cls: "bg-teal-600 text-white" },
  paused: { label: "Paused", cls: "bg-gold-500 text-navy-950" },
  manual: { label: "Manual control", cls: "bg-navy-900 text-white" },
  completed: { label: "Completed", cls: "bg-success-600 text-white" },
};

/** "Auto demo a feature" menu: any feature's complete journey, on its own. */
export function FeatureMenu({ className, align = "left" }: { className?: string; align?: "left" | "right" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const key = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", close, true);
    window.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", close, true);
      window.removeEventListener("keydown", key);
    };
  }, [open]);
  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-body-sm font-semibold text-navy-900 ring-1 ring-ink/15 hover:bg-sunken"
      >
        Auto demo a feature <ChevronDown size={15} aria-hidden />
      </button>
      {open && (
        <ul role="menu" aria-label="Auto demo a feature" className={cn("absolute bottom-12 z-50 grid max-h-[60vh] w-64 gap-0.5 overflow-y-auto rounded-2xl bg-surface p-1.5 shadow-e3 ring-1 ring-ink/10", align === "right" ? "right-0" : "left-0")}>
          {features.map((f) => (
            <li key={f.id} role="none">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  autoRunner.startFeature(f.id);
                }}
                className="flex min-h-11 w-full items-center justify-between gap-2 rounded-xl px-3 text-left text-body-sm font-semibold text-navy-950 hover:bg-sunken"
              >
                {f.title}
                <span className="text-caption font-normal text-ink-muted">{f.steps.length} steps</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Ctl({ label, onClick, children, disabled, primary, wide }: { label: string; onClick: () => void; children: React.ReactNode; disabled?: boolean; primary?: boolean; wide?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-full text-body-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        wide ? "px-4" : "w-10",
        primary ? "bg-crimson-600 text-white hover:bg-crimson-700" : "text-navy-900 hover:bg-sunken",
      )}
    >
      {children}
    </button>
  );
}

/**
 * The presenter's Auto Demo bar: status, what's happening now, what's next, progress, and every
 * control (play/pause, skip waiting, previous/next feature, restart feature, restart all, take
 * control / return to Auto Demo, stop). Compact on phones; one line on presentation screens.
 */
export function AutoBar() {
  const a = useAuto();
  const active = a.mode !== null;
  const f = autoRunner.feature;
  const s = autoRunner.step;
  const next = autoRunner.nextStep;
  const { done, total } = autoRunner.progress();
  const st = STATUS[a.status];

  if (!active) {
    return (
      <div className="flex flex-wrap items-center gap-2 border-t border-ink/10 bg-paper px-3 py-2 sm:px-5" data-testid="auto-bar">
        <span className={cn("rounded-full px-2.5 py-1 text-caption font-bold uppercase tracking-[0.08em]", st.cls)} data-testid="auto-status">{st.label}</span>
        <p className="hidden min-w-0 flex-1 text-body-sm text-ink-secondary md:block">Auto Demo walks through every feature in the live app. Pause or take control at any time.</p>
        <span className="flex-1 md:hidden" />
        <SpeedPicker value={a.speed} />
        <FeatureMenu align="right" />
      </div>
    );
  }

  const playing = a.status === "playing";
  const manual = a.status === "manual";
  return (
    <section aria-label="Auto Demo controls" className="border-t border-ink/10 bg-paper px-3 py-2 sm:px-5" data-testid="auto-bar">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-caption font-bold uppercase tracking-[0.08em]", st.cls)} data-testid="auto-status">
          {st.label}
        </span>
        <div className="min-w-0 flex-1 basis-[14rem]">
          <p className="truncate text-body-sm" data-testid="auto-now">
            <span className="font-bold text-navy-950">{f?.title ?? "Auto Demo"}</span>
            {s && a.status !== "completed" && <span className="text-ink-secondary"> · {s.caption}</span>}
            {a.status === "completed" && <span className="text-ink-secondary"> · Demo complete. Explore freely, or replay any feature.</span>}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-sunken" role="progressbar" aria-label="Auto Demo progress" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done}>
              <span className="block h-full rounded-full bg-crimson-600 transition-[width] duration-300" style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
            </span>
            <span className="shrink-0 text-caption tabular-nums text-ink-muted">{done}/{total}</span>
          </div>
          {next && a.status !== "completed" && <p className="mt-0.5 hidden truncate text-caption text-ink-muted lg:block">Next: {next.caption}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-0.5">
          {a.status === "completed" ? (
            <Ctl label="Restart full demo" onClick={() => autoRunner.restartAll()} primary wide>
              <RefreshCw size={16} aria-hidden /> Replay
            </Ctl>
          ) : manual ? (
            <Ctl label="Return to Auto Demo" onClick={() => autoRunner.resume()} primary wide>
              <Play size={16} aria-hidden /> Return to Auto Demo
            </Ctl>
          ) : (
            <Ctl label={playing ? "Pause" : "Resume"} onClick={() => (playing ? autoRunner.pause() : autoRunner.resume())} primary wide>
              {playing ? <Pause size={16} aria-hidden /> : <Play size={16} aria-hidden />} {playing ? "Pause" : "Resume"}
            </Ctl>
          )}
          <Ctl label="Skip waiting" onClick={() => autoRunner.skipWaiting()} disabled={!playing && !a.prompt}><FastForward size={17} aria-hidden /></Ctl>
          <Ctl label="Previous feature" onClick={() => autoRunner.prevFeature()}><SkipBack size={17} aria-hidden /></Ctl>
          <Ctl label="Next feature" onClick={() => autoRunner.nextFeature()}><SkipForward size={17} aria-hidden /></Ctl>
          <Ctl label="Restart current feature" onClick={() => autoRunner.restartFeature()}><RotateCcw size={17} aria-hidden /></Ctl>
          <Ctl label="Restart full demo" onClick={() => autoRunner.restartAll()}><RefreshCw size={17} aria-hidden /></Ctl>
          {!manual && a.status !== "completed" && <Ctl label="Take manual control" onClick={() => autoRunner.takeControl()}><Hand size={17} aria-hidden /></Ctl>}
          <Ctl label="Stop Auto Demo" onClick={() => autoRunner.stop()}><Square size={15} aria-hidden /></Ctl>
          <SpeedPicker value={a.speed} />
        </div>
      </div>

      {(a.prompt || a.error || manual) && (
        <div role="status" className={cn("mt-2 flex flex-wrap items-center gap-2 rounded-2xl px-3 py-2 text-body-sm", a.error ? "bg-gold-50 text-navy-950 ring-1 ring-gold-100" : "bg-navy-50 text-navy-950")}>
          {a.error && <TriangleAlert size={16} className="shrink-0 text-gold-700" aria-hidden />}
          <span className="min-w-0 flex-1">
            {a.error ?? (a.prompt ? a.prompt.prompt : "You're in control: tap around the phone freely. Return to Auto Demo to carry on from this step.")}
          </span>
          {a.prompt && (
            <>
              <a href={a.prompt.href} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-1.5 rounded-full bg-crimson-600 px-4 font-bold text-white">
                {a.prompt.label} <ExternalLink size={14} aria-hidden />
                <span className="sr-only"> (opens a separate website in a new tab)</span>
              </a>
              <button type="button" onClick={() => autoRunner.resume()} className="inline-flex h-10 items-center rounded-full px-4 font-semibold ring-1 ring-ink/15">
                Continue
              </button>
            </>
          )}
        </div>
      )}
    </section>
  );
}

function SpeedPicker({ value }: { value: AutoSpeed }) {
  return (
    <label className="inline-flex h-10 items-center gap-1.5 rounded-full px-2 text-caption font-semibold text-ink-secondary">
      <span className="hidden sm:inline">Pace</span>
      <select
        value={value}
        onChange={(e) => autoRunner.setSpeed(e.target.value as AutoSpeed)}
        aria-label="Auto Demo pace"
        className="h-9 rounded-full bg-sunken px-2 text-body-sm font-semibold text-navy-900"
      >
        <option value="slow">Relaxed</option>
        <option value="normal">Normal</option>
        <option value="fast">Brisk</option>
      </select>
    </label>
  );
}
