import { createStore, setAccountNamespace, useStore, writeAccountValue, removeAccountValue } from "@/state/store";
import { cloudConfigured } from "./config";
import {
  findAccount,
  newAccountId,
  registryStore,
  setActiveAccount,
  upsertAccount,
  type DeviceAccount,
} from "./registry";
import { DEMO_BOOKMARKED, DEMO_COMPLETED, DEMO_DISPLAY_NAME, demoBooking, demoRewardsState } from "./seed";
import { emptyRewardsState } from "@/rewards/economy";
import { REWARDS_KEY, WATCH_COVERAGE_KEY, watchCoverageStore } from "@/rewards/store";
import { LEARN_KEY } from "@/state/learnProgress";
import { PROFILE_KEY, profileStore } from "@/state/profile";
import { APPLICATION_KEY } from "@/state/application";
import { SESSIONS_KEY } from "@/app/guide/SessionsView";
import { CHECKLIST_KEY } from "@/app/GuideCentre";
import { NOTIFICATIONS_KEY } from "@/data/notifications";

/**
 * Demo account session controller (app-level, not real authentication).
 *
 * Sign out NEVER calls supabase.auth.signOut(): for an anonymous user that would revoke the only
 * way back into the account. Instead the active selection is cleared; the account, its session
 * and its data stay on this device and can be reopened from the account picker.
 */
export type SessionStatus =
  | { kind: "signed-out" }
  | { kind: "loading"; message: string }
  | { kind: "ready"; account: DeviceAccount }
  | { kind: "error"; message: string; accountId?: string; canUseDevice?: boolean };

export const sessionStore = createStore<SessionStatus>("ge-session", () => ({ kind: "signed-out" }), "memory");
export const useSession = () => useStore(sessionStore);

const ACCOUNT_KEYS = [REWARDS_KEY, LEARN_KEY, PROFILE_KEY, SESSIONS_KEY, CHECKLIST_KEY, NOTIFICATIONS_KEY, WATCH_COVERAGE_KEY, APPLICATION_KEY];
const loadCloud = () => import("./cloud");

/* ------------------------------------------------------------------------------------------
 * Local (device-only) seeding
 * ---------------------------------------------------------------------------------------- */

function writeLocalSeed(accountId: string, type: "demo" | "new") {
  const now = Date.now();
  for (const key of ACCOUNT_KEYS) removeAccountValue(key, accountId);
  if (type === "demo") {
    writeAccountValue(REWARDS_KEY, accountId, demoRewardsState(now));
    writeAccountValue(LEARN_KEY, accountId, {
      language: "en",
      bookmarked: DEMO_BOOKMARKED,
      started: DEMO_COMPLETED,
      completed: DEMO_COMPLETED,
    });
    writeAccountValue(SESSIONS_KEY, accountId, { bookings: [demoBooking(now)] });
  } else {
    writeAccountValue(REWARDS_KEY, accountId, emptyRewardsState());
    writeAccountValue(LEARN_KEY, accountId, { language: "en", bookmarked: [], started: [], completed: [] });
    writeAccountValue(SESSIONS_KEY, accountId, { bookings: [] });
  }
  writeAccountValue(CHECKLIST_KEY, accountId, { done: [] });
  writeAccountValue(NOTIFICATIONS_KEY, accountId, { read: [] });
}

/* ------------------------------------------------------------------------------------------
 * Activation
 * ---------------------------------------------------------------------------------------- */

async function activate(account: DeviceAccount) {
  const cloud = account.mode === "cloud" ? await loadCloud() : null;
  cloud?.deactivateCloud();
  if (account.mode === "local") {
    setAccountNamespace(account.id);
    setActiveAccount(account.id);
    sessionStore.set({ kind: "ready", account: findAccount(account.id)! });
    return;
  }
  sessionStore.set({ kind: "loading", message: "Opening your account…" });
  // Cached copy for this same account only; replaced by the server state below.
  setAccountNamespace(account.id);
  try {
    const profile = await cloud!.activateCloud(account.id, account.uid!, account.type === "demo" ? "demo" : "new", account.displayName);
    upsertAccount({ ...account, displayName: profile.displayName ?? account.displayName });
    setActiveAccount(account.id);
    sessionStore.set({ kind: "ready", account: findAccount(account.id)! });
  } catch (e) {
    cloud!.deactivateCloud();
    setAccountNamespace(null);
    setActiveAccount(null);
    sessionStore.set({
      kind: "error",
      accountId: account.id,
      message: e instanceof Error ? e.message : "Couldn't open this account.",
    });
  }
}

export function openAccount(id: string) {
  const account = findAccount(id);
  if (account) return activate(account);
}

async function createAccount(type: "demo" | "new", mode: "cloud" | "local", displayName?: string) {
  const id = newAccountId();
  const now = Date.now();
  const base: DeviceAccount = {
    id,
    type,
    mode,
    displayName: type === "demo" ? DEMO_DISPLAY_NAME : displayName?.trim() || undefined,
    createdAt: now,
    lastUsedAt: now,
  };
  if (mode === "local") {
    writeLocalSeed(id, type);
    upsertAccount(base);
    return activate(base);
  }
  sessionStore.set({ kind: "loading", message: type === "demo" ? "Preparing the demo account…" : "Creating your account…" });
  try {
    const { createAnonymousUser } = await loadCloud();
    const uid = await createAnonymousUser(id);
    // Recorded before seeding so a failed setup is completed (idempotently) on the next open.
    const account = { ...base, uid };
    upsertAccount(account);
    return activate(account);
  } catch (e) {
    sessionStore.set({
      kind: "error",
      message: e instanceof Error ? e.message : "Couldn't create the account.",
      canUseDevice: true,
    });
  }
}

/** Opens this device's demo account, creating it only if it doesn't exist yet. */
export function startDemo(mode: "cloud" | "local" = cloudConfigured ? "cloud" : "local") {
  const existing = registryStore.get().accounts.find((a) => a.type === "demo" && a.mode === mode);
  return existing ? activate(existing) : createAccount("demo", mode);
}

export function createNewAccount(displayName?: string, mode: "cloud" | "local" = cloudConfigured ? "cloud" : "local") {
  return createAccount("new", mode, displayName);
}

/** App-level sign out: keeps the account, its session and its data on this device. */
export async function signOut() {
  const account = findAccount(registryStore.get().activeId);
  if (account?.mode === "cloud") {
    const cloud = await loadCloud();
    await cloud.flushSync();
    cloud.deactivateCloud();
  }
  setAccountNamespace(null);
  setActiveAccount(null);
  sessionStore.set({ kind: "signed-out" });
  window.location.hash = "app/home";
}

/** Restores ONLY the demo account to its approved seed (explicit, confirmed user action). */
export async function resetDemo() {
  const status = sessionStore.get();
  if (status.kind !== "ready" || status.account.type !== "demo") throw new Error("Only the demo account can be reset.");
  const account = status.account;
  if (account.mode === "cloud") {
    const cloud = await loadCloud();
    await cloud.resetDemoCloud(); // server re-seeds atomically, then the stores are re-pulled
  } else {
    writeLocalSeed(account.id, "demo");
    setAccountNamespace(account.id);
  }
  profileStore.reset(); // the demo's device-only Analyze inputs
  watchCoverageStore.reset(); // the server cleared its watch progress too
}

export const dismissError = () => sessionStore.set({ kind: "signed-out" });

/* ------------------------------------------------------------------------------------------
 * One-time migration of pre-account local data (idempotent, non-destructive)
 * ---------------------------------------------------------------------------------------- */

const MIGRATION_FLAG = "ge-accounts-migration-v1";

export function migrateLegacyData() {
  try {
    if (localStorage.getItem(MIGRATION_FLAG)) return;
    const present = ACCOUNT_KEYS.filter((k) => localStorage.getItem(k) !== null);
    if (present.length) {
      const id = newAccountId();
      // Copy (never move): the originals stay untouched as a rollback path.
      for (const key of present) localStorage.setItem(`${key}::${id}`, localStorage.getItem(key)!);
      const now = Date.now();
      upsertAccount({ id, type: "legacy", mode: "local", createdAt: now, lastUsedAt: now });
    }
    localStorage.setItem(MIGRATION_FLAG, new Date().toISOString());
  } catch {
    /* storage unavailable or full: leave legacy data untouched and try again next launch */
  }
}

/** Startup: migrate once, then reopen the account that was active (if any). */
export function initAccounts() {
  migrateLegacyData();
  const active = findAccount(registryStore.get().activeId);
  if (active) void activate(active);
}
