import { createStore, useStore } from "@/state/store";

/**
 * Cloud save status for the active account. Kept apart from cloud.ts so the UI can read it
 * without pulling the (lazy-loaded) Supabase client into the main bundle.
 */
export type SyncState = "idle" | "saving" | "error";
export const syncStatusStore = createStore<{ state: SyncState }>("ge-sync-status", () => ({ state: "idle" }), "memory");
export const useSyncStatus = () => useStore(syncStatusStore);

/** Unsaved cloud changes per account survive sign-out/reload and are pushed before the next pull. */
const DIRTY_KEY = (accountId: string) => `ge-sync-dirty::${accountId}`;

export function readDirty(accountId: string): string[] {
  try {
    return JSON.parse(localStorage.getItem(DIRTY_KEY(accountId)) ?? "[]");
  } catch {
    return [];
  }
}

export function writeDirty(accountId: string, jobs: string[]) {
  try {
    if (jobs.length) localStorage.setItem(DIRTY_KEY(accountId), JSON.stringify(jobs));
    else localStorage.removeItem(DIRTY_KEY(accountId));
  } catch {
    /* storage unavailable */
  }
}
