import { useEffect, useRef, useSyncExternalStore } from "react";
import { removeAccountValue, setAccountNamespace } from "@/state/store";
import { ACCOUNT_KEYS } from "@/account/session";
import { rewardsStore } from "@/rewards/store";
import { DEMO_ACCOUNT_ID } from "../demoData";
import { isDemoRuntime } from "../demoSession";
import { findJourney, followStep } from "./journeys";

/**
 * App Demo control state: the active guided journey, its step, pause, journey signals, and the
 * "Skip waiting" handler the current screen offers. Kept in sessionStorage (this tab only), so it
 * survives the reloads used by Restart journey and Reset demo. Demo runtime only.
 */
export interface ControlState {
  journey: string | null;
  step: number;
  paused: boolean;
  signals: string[];
}

const KEY = "ge-demo-control-v1";
const SNAPSHOT = "ge-demo-journey-snapshot-v1";
const idle: ControlState = { journey: null, step: 0, paused: false, signals: [] };

function load(): ControlState {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? { ...idle, ...JSON.parse(raw) } : idle;
  } catch {
    return idle;
  }
}

let state: ControlState = typeof window !== "undefined" ? load() : idle;
const listeners = new Set<() => void>();
function set(next: ControlState) {
  state = next;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
export const getControl = () => state;
export const useControl = () => useSyncExternalStore(subscribe, getControl, getControl);

const currentHash = () => window.location.hash.replace(/^#/, "").split("?")[0] || "app/home";

function openRoute(route: string | undefined, focus?: string) {
  if (route && currentHash() !== route) {
    window.location.hash = route;
    window.scrollTo({ top: 0 });
  }
  if (focus) window.setTimeout(() => document.querySelector(focus)?.scrollIntoView({ behavior: "smooth", block: "center" }), route && currentHash() !== route ? 500 : 50);
}

/* ------------------------------------------------------------------ journey snapshot (Restart) */

function snapshotDemo() {
  const out: Record<string, string | null> = {};
  for (const k of ACCOUNT_KEYS) out[k] = localStorage.getItem(`${k}::${DEMO_ACCOUNT_ID}`);
  sessionStorage.setItem(SNAPSHOT, JSON.stringify(out));
}

function restoreSnapshot() {
  const raw = sessionStorage.getItem(SNAPSHOT);
  if (!raw) return;
  const data = JSON.parse(raw) as Record<string, string | null>;
  for (const k of ACCOUNT_KEYS) {
    const v = data[k];
    if (v === null || v === undefined) removeAccountValue(k, DEMO_ACCOUNT_ID);
    else localStorage.setItem(`${k}::${DEMO_ACCOUNT_ID}`, v);
  }
  setAccountNamespace(DEMO_ACCOUNT_ID);
}

/* ------------------------------------------------------------------ actions */

export const demoControl = {
  start(id: string) {
    const j = findJourney(id);
    if (!j) return;
    snapshotDemo();
    set({ journey: id, step: 0, paused: false, signals: [] });
    openRoute(j.steps[0].route, j.steps[0].focus);
  },
  /** Advance one checkpoint. Opens that step's screen: an explicit presenter action. */
  next() {
    const j = findJourney(state.journey);
    if (!j) return;
    const step = Math.min(state.step + 1, j.steps.length - 1);
    set({ ...state, step });
    openRoute(j.steps[step].route, j.steps[step].focus);
  },
  /** Back to the journey's first step with the demo data as it was when the journey started. */
  restart() {
    const j = findJourney(state.journey);
    if (!j) return;
    restoreSnapshot();
    set({ ...state, step: 0, paused: false, signals: [] });
    const first = j.steps[0].route ?? "app/home";
    window.location.hash = first;
    window.location.reload(); // clears screen state (open checkouts, simulator drafts)
  },
  exit() {
    set(idle);
  },
  pause() {
    set({ ...state, paused: true });
  },
  resume() {
    set({ ...state, paused: false });
  },
  /** Reset demo / leaving the demo: forget the journey and its snapshot. */
  clear() {
    try {
      sessionStorage.removeItem(SNAPSHOT);
    } catch {
      /* ignore */
    }
    set(idle);
  },
  /** Called by the app when the step indicator should follow (hash change, signal, points). */
  follow() {
    const j = findJourney(state.journey);
    if (!j || state.paused) return;
    const step = followStep(j, state.step, { hash: currentHash(), signals: state.signals, earned: rewardsStore.get().earned });
    if (step !== state.step) set({ ...state, step });
  },
};

/** A journey event from the real UI (e.g. "reward-confirm"). No-op outside the demo or a journey. */
export function demoSignal(name: string) {
  if (!isDemoRuntime() || !state.journey || state.signals.includes(name)) return;
  set({ ...state, signals: [...state.signals, name] });
  demoControl.follow();
}

/* ------------------------------------------------------------------ Skip waiting registry */

type Skip = { label: string; run: () => void };
let skip: Skip | null = null;
const skipListeners = new Set<() => void>();
const getSkip = () => skip;
const subscribeSkip = (l: () => void) => {
  skipListeners.add(l);
  return () => skipListeners.delete(l);
};
export const useSkipWaiting = () => useSyncExternalStore(subscribeSkip, getSkip, getSkip);

/**
 * A screen offers one "Skip waiting" action while `enabled` (e.g. the video page while points are
 * still pending). Demo runtime only; the real app never registers anything.
 */
export function useDemoSkip(label: string, run: () => void, enabled: boolean) {
  const runRef = useRef(run);
  runRef.current = run;
  useEffect(() => {
    if (!enabled || !isDemoRuntime()) return;
    const entry: Skip = { label, run: () => runRef.current() };
    skip = entry;
    skipListeners.forEach((l) => l());
    return () => {
      if (skip === entry) {
        skip = null;
        skipListeners.forEach((l) => l());
      }
    };
  }, [label, enabled]);
}
