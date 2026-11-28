import { useSyncExternalStore } from "react";
import { removeAccountValue, writeAccountValue } from "@/state/store";
import { ACCOUNT_KEYS } from "@/account/session";
import { DEMO_ACCOUNT_ID } from "../../demoData";
import { DEMO_URL, resetDemoData } from "../../demoSession";
import { Cancelled, Driver, type Pace } from "./driver";
import { features, findFeature, type AutoFeature, type AutoStep } from "./script";

/**
 * Auto Demo runner: plays the script against the live app in the presentation phone.
 *
 *   ready ──Play──▶ playing ⇄ paused (Pause/Resume) ──▶ completed
 *                     │  ▲
 *        Take control ▼  │ Return to Auto Demo (re-runs the current step from its start)
 *                    manual
 *
 * Every wait and action goes through a per-run `Pace`: Pause holds it, Skip waiting ends the
 * current wait, and any jump (next/previous feature, restart, stop) cancels the run in progress.
 * A step that fails is retried from its start; after 3 tries the demo pauses and says so.
 */
export type AutoStatus = "ready" | "playing" | "paused" | "manual" | "completed";
export type AutoSpeed = "slow" | "normal" | "fast";

export interface AutoState {
  status: AutoStatus;
  mode: "full" | "feature" | null;
  list: string[];
  fi: number;
  si: number;
  speed: AutoSpeed;
  error: string | null;
  prompt: AutoStep["presenter"] | null;
}

const SPEED: Record<AutoSpeed, number> = { slow: 1.5, normal: 1, fast: 0.6 };
/** QA hook (`&autospeed=0.05`): scales every wait so tests can run the whole script quickly. */
const qaScale = () => {
  const v = Number(new URLSearchParams(window.location.search).get("autospeed"));
  return Number.isFinite(v) && v > 0 && v <= 1 ? v : 1;
};

const initial: AutoState = { status: "ready", mode: null, list: features.map((f) => f.id), fi: 0, si: 0, speed: "normal", error: null, prompt: null };

class AutoRunner {
  state: AutoState = initial;
  private listeners = new Set<() => void>();
  private gen = 0;
  private waiters: Array<() => void> = [];
  private hurry = false;
  private frame: () => HTMLIFrameElement | null = () => null;
  private onTopic: (topic: string) => void = () => undefined;
  private featureSnapshot: Record<string, string | null> | null = null;

  attach(frame: () => HTMLIFrameElement | null, onTopic: (topic: string) => void) {
    this.frame = frame;
    this.onTopic = onTopic;
  }

  subscribe = (l: () => void) => {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  };
  get = () => this.state;
  private set(patch: Partial<AutoState>) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((l) => l());
  }

  /* ------------------------------------------------------------------ derived */
  get feature(): AutoFeature | undefined {
    return findFeature(this.state.list[this.state.fi]);
  }
  get step(): AutoStep | undefined {
    return this.feature?.steps[this.state.si];
  }
  get nextStep(): AutoStep | undefined {
    const f = this.feature;
    if (!f) return undefined;
    return f.steps[this.state.si + 1] ?? findFeature(this.state.list[this.state.fi + 1])?.steps[0];
  }
  progress() {
    const list = this.state.list.map((id) => findFeature(id)!);
    const total = list.reduce((n, f) => n + f.steps.length, 0);
    const done = list.slice(0, this.state.fi).reduce((n, f) => n + f.steps.length, 0) + this.state.si;
    return { done: this.state.status === "completed" ? total : done, total };
  }

  /* ------------------------------------------------------------------ pacing */
  private release() {
    const w = this.waiters;
    this.waiters = [];
    w.forEach((r) => r());
  }
  private cancel() {
    this.gen++;
    this.hurry = false;
    this.release();
  }
  private pace(gen: number): Pace {
    const self = this;
    const gate = async () => {
      for (;;) {
        if (gen !== self.gen) throw new Cancelled();
        if (self.state.status === "playing") return;
        await new Promise<void>((r) => self.waiters.push(r));
      }
    };
    return {
      gate,
      async sleep(ms: number) {
        let left = ms * SPEED[self.state.speed] * qaScale();
        while (left > 0) {
          await gate();
          if (self.hurry) return;
          const slice = Math.min(100, left);
          await new Promise((r) => setTimeout(r, slice));
          left -= slice;
        }
        await gate();
      },
      get hurry() {
        return self.hurry;
      },
    };
  }

  /* ------------------------------------------------------------------ phone */
  private async reloadPhone(hash: string, gen: number) {
    const f = this.frame();
    const w = f?.contentWindow;
    if (!f || !w) return;
    const loaded = new Promise<void>((r) => f.addEventListener("load", () => r(), { once: true }));
    try {
      w.location.replace(DEMO_URL.phone(hash));
      w.location.reload();
    } catch {
      f.src = DEMO_URL.phone(hash);
    }
    await loaded;
    if (gen !== this.gen) throw new Cancelled();
    const d = new Driver(this.frame, this.pace(gen));
    await d.find("main h1", 15000);
  }

  private snapshot() {
    const out: Record<string, string | null> = {};
    for (const k of ACCOUNT_KEYS) out[k] = localStorage.getItem(`${k}::${DEMO_ACCOUNT_ID}`);
    return out;
  }
  private restore(snap: Record<string, string | null>) {
    for (const k of ACCOUNT_KEYS) {
      const v = snap[k];
      if (v === null || v === undefined) removeAccountValue(k, DEMO_ACCOUNT_ID);
      else writeAccountValue(k, DEMO_ACCOUNT_ID, JSON.parse(v));
    }
  }

  /* ------------------------------------------------------------------ the run loop */
  private async loop(gen: number, opts: { reseed?: boolean; restore?: boolean } = {}) {
    const pace = this.pace(gen);
    const d = new Driver(this.frame, pace);
    try {
      if (opts.reseed) {
        resetDemoData();
        await this.reloadPhone("app/home", gen);
      }
      if (opts.restore && this.featureSnapshot) {
        this.restore(this.featureSnapshot);
        await this.reloadPhone(this.feature?.steps[0] ? "app/home" : "app/home", gen);
      }
      while (this.state.fi < this.state.list.length) {
        const f = this.feature!;
        this.onTopic(f.topic);
        if (this.state.si === 0 && !opts.restore) this.featureSnapshot = this.snapshot();
        opts.restore = false;
        while (this.state.si < f.steps.length) {
          const s = this.step!;
          this.hurry = false;
          this.set({ error: null, prompt: null });
          for (let attempt = 1; ; attempt++) {
            try {
              await pace.gate();
              await s.run(d);
              break;
            } catch (e) {
              if (e instanceof Cancelled) throw e;
              if (attempt < 3) {
                await pace.sleep(700);
                continue;
              }
              // Hand over to the presenter instead of looping forever.
              this.set({ status: "paused", error: `Couldn't finish “${s.caption}” automatically. Take control, then resume or skip ahead.` });
              await pace.gate();
              attempt = 0;
            }
          }
          if (s.presenter) {
            this.set({ status: "paused", prompt: s.presenter });
            await pace.gate();
          } else {
            await pace.sleep(s.hold ?? 2600);
          }
          this.set({ si: this.state.si + 1 });
        }
        this.set({ fi: this.state.fi + 1, si: 0 });
      }
      d.clearSpot();
      this.set({ status: "completed", fi: Math.max(0, this.state.list.length - 1), si: 0, prompt: null, error: null });
      if (this.state.mode === "full") this.onTopic("impact");
    } catch (e) {
      if (!(e instanceof Cancelled)) this.set({ status: "paused", error: e instanceof Error ? e.message : "The demo stopped." });
    }
  }

  private run(opts?: { reseed?: boolean; restore?: boolean }) {
    this.cancel();
    void this.loop(this.gen, opts);
  }

  /* ------------------------------------------------------------------ controls */
  /** Full Auto Demo: every feature in the recommended order, from the fresh sample profile. */
  startFull() {
    this.set({ ...initial, speed: this.state.speed, status: "playing", mode: "full", list: features.map((f) => f.id) });
    this.run({ reseed: true });
  }
  /** Feature Auto Demo: one feature's complete journey, from the fresh sample profile. */
  startFeature(id: string) {
    if (!findFeature(id)) return;
    this.set({ ...initial, speed: this.state.speed, status: "playing", mode: "feature", list: [id] });
    this.run({ reseed: true });
  }
  pause() {
    if (this.state.status === "playing") this.set({ status: "paused" });
  }
  resume() {
    const wasManual = this.state.status === "manual";
    if (this.state.status !== "paused" && !wasManual) return;
    this.set({ status: "playing", error: null, prompt: null });
    if (wasManual) this.run(); // the presenter may have moved: re-run this step from its start
    else this.release();
  }
  takeControl() {
    if (this.state.status === "playing" || this.state.status === "paused") {
      this.set({ status: "manual", prompt: null });
      try {
        new Driver(this.frame, this.pace(this.gen)).clearSpot();
      } catch {
        /* ignore */
      }
    }
  }
  skipWaiting() {
    if (this.state.prompt) return this.resume();
    this.hurry = true;
  }
  private jump(fi: number) {
    const keep = this.state.status === "paused" || this.state.status === "manual" ? "paused" : "playing";
    this.set({ fi: Math.max(0, Math.min(fi, this.state.list.length - 1)), si: 0, status: keep, error: null, prompt: null });
    this.run();
  }
  nextFeature() {
    if (!this.state.mode) return;
    if (this.state.fi >= this.state.list.length - 1) return this.set({ status: "completed" });
    this.jump(this.state.fi + 1);
  }
  prevFeature() {
    if (!this.state.mode) return;
    this.jump(this.state.fi - (this.state.si === 0 && this.state.fi > 0 ? 1 : 0));
  }
  /** Jump to a feature from the topic navigator: within a full run, or as a Feature Auto Demo. */
  jumpTo(id: string) {
    const i = this.state.list.indexOf(id);
    if (this.state.mode === "full" && i >= 0) return this.jump(i);
    this.startFeature(id);
  }
    /** Back to the current feature's first step, with the demo data as it was when it started. */
  restartFeature() {
    if (!this.state.mode) return;
    this.set({ si: 0, status: "playing", error: null, prompt: null });
    this.run({ restore: true });
  }
  restartAll() {
    if (this.state.mode === "feature") this.startFeature(this.state.list[0]);
    else this.startFull();
  }
  /** Leave the Auto Demo; the phone stays where it is for free exploration. */
  stop() {
    this.cancel();
    try {
      new Driver(this.frame, this.pace(this.gen)).clearSpot();
    } catch {
      /* ignore */
    }
    this.set({ ...initial, speed: this.state.speed });
  }
  setSpeed(speed: AutoSpeed) {
    this.set({ speed });
  }
}

export const autoRunner = new AutoRunner();
export const useAuto = () => useSyncExternalStore(autoRunner.subscribe, autoRunner.get, autoRunner.get);
