import { setAccountNamespace, writeAccountValue, removeAccountValue } from "@/state/store";
import { ACCOUNT_KEYS, sessionStore } from "@/account/session";
import type { DeviceAccount } from "@/account/registry";
import { DEMO_BOOKMARKED, DEMO_COMPLETED, demoBooking, demoRewardsState } from "@/account/seed";
import { REWARDS_KEY } from "@/rewards/store";
import { LEARN_KEY } from "@/state/learnProgress";
import { PROFILE_KEY } from "@/state/profile";
import { APPLICATION_KEY } from "@/state/application";
import { SESSIONS_KEY } from "@/app/guide/SessionsView";
import { CHECKLIST_KEY } from "@/app/GuideCentre";
import { NOTIFICATIONS_KEY } from "@/data/notifications";
import { DEMO_ACCOUNT_ID, DEMO_SEED_VERSION, demoApplicationDraft, demoPersona, demoProfile } from "./demoData";

/**
 * Demo System runtime. ISOLATION:
 *  - All demo data lives under its own account namespace (`<key>::ge-demo-showcase`), which is
 *    never added to the device's account list and never becomes the "active" account.
 *  - It is always device-only: the cloud layer is never loaded in demo mode, so nothing is synced
 *    to Supabase and no real account (demo or new) is opened, changed or reset.
 *  - Reset rewrites ONLY the keys in that namespace.
 */
export type DemoMode = "entry" | "app" | "present";

export function readDemoMode(search = typeof window !== "undefined" ? window.location.search : ""): DemoMode | null {
  const p = new URLSearchParams(search);
  if (!p.has("demo")) return null;
  const v = p.get("demo");
  return v === "app" || v === "present" ? v : "entry";
}

/** The real app is running as the App Demo (full screen, or inside the presentation's phone). */
export const isDemoRuntime = () => readDemoMode() === "app";
/** Running inside the presentation's (or desktop App Demo's) phone frame. */
export const isEmbedded = () => new URLSearchParams(window.location.search).get("embed") === "1";

export const DEMO_URL = {
  entry: "/?demo",
  app: "/?demo=app#app/home",
  present: (topic?: string) => `/?demo=present${topic ? `&topic=${topic}` : ""}`,
  phone: (hash: string) => `/?demo=app&embed=1#${hash}`,
};

const SEED_FLAG = `ge-demo-seed::${DEMO_ACCOUNT_ID}`;

export const demoAccount: DeviceAccount = {
  id: DEMO_ACCOUNT_ID,
  type: "demo",
  mode: "local",
  displayName: demoPersona.name,
  createdAt: 0,
  lastUsedAt: 0,
};

/** Writes the sample profile, learning, rewards and application draft into the demo namespace. */
export function seedDemo(now = Date.now()) {
  for (const key of ACCOUNT_KEYS) removeAccountValue(key, DEMO_ACCOUNT_ID);
  writeAccountValue(REWARDS_KEY, DEMO_ACCOUNT_ID, demoRewardsState(now));
  writeAccountValue(LEARN_KEY, DEMO_ACCOUNT_ID, { language: "en", bookmarked: DEMO_BOOKMARKED, started: DEMO_COMPLETED, completed: DEMO_COMPLETED });
  writeAccountValue(SESSIONS_KEY, DEMO_ACCOUNT_ID, { bookings: [demoBooking(now)] });
  writeAccountValue(PROFILE_KEY, DEMO_ACCOUNT_ID, demoProfile(now));
  writeAccountValue(APPLICATION_KEY, DEMO_ACCOUNT_ID, { byArea: { critical: demoApplicationDraft(now) } });
  writeAccountValue(CHECKLIST_KEY, DEMO_ACCOUNT_ID, { done: [] });
  writeAccountValue(NOTIFICATIONS_KEY, DEMO_ACCOUNT_ID, { read: [] });
  try {
    localStorage.setItem(SEED_FLAG, String(DEMO_SEED_VERSION));
  } catch {
    /* storage unavailable: the stores keep their in-memory seed */
  }
}

const isSeeded = () => {
  try {
    return localStorage.getItem(SEED_FLAG) === String(DEMO_SEED_VERSION);
  } catch {
    return false;
  }
};

/** Opens the demo namespace (seeding it the first time). Synchronous: call before the app renders. */
export function startDemoSession() {
  if (!isSeeded()) seedDemo();
  setAccountNamespace(DEMO_ACCOUNT_ID);
  sessionStore.set({ kind: "ready", account: demoAccount });
}

/** Restores the demo to its sample state. Touches nothing outside the demo namespace. */
export function resetDemoData() {
  seedDemo();
  // Re-read the stores if this page is showing the demo; the caller reloads to clear page state.
  if (isDemoRuntime()) setAccountNamespace(DEMO_ACCOUNT_ID);
}
