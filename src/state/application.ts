import { createStore, useStore } from "./store";
import type { ProtectionArea } from "./profile";
import type { InsuranceApplication } from "@/data/application";

/**
 * In-app applications, one per kind of cover. Account-scoped and ALWAYS device-only: like the
 * protection profile, these answers (including the yes/no health questions) are never sent to
 * Supabase or anywhere else. See src/data/application.ts for what "completed" means.
 */
export const APPLICATION_KEY = "ge-applications-v1";
export const applicationStore = createStore<{ byArea: Partial<Record<ProtectionArea, InsuranceApplication>> }>(APPLICATION_KEY, () => ({ byArea: {} }));
export const useApplications = () => useStore(applicationStore);

export const applicationActions = {
  save(a: InsuranceApplication) {
    const cur = applicationStore.get();
    applicationStore.set({ byArea: { ...cur.byArea, [a.area]: { ...a, updatedAt: Date.now() } } });
  },
  remove(area: ProtectionArea) {
    const next = { ...applicationStore.get().byArea };
    delete next[area];
    applicationStore.set({ byArea: next });
  },
};
