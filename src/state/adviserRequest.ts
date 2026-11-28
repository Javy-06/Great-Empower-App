import { createStore, useStore } from "./store";
import { emptyAdviserRequest, type AdviserRequestDraft, type SavedAdviserRequest } from "@/data/adviserRequest";

/**
 * Adviser requests: the in-progress draft and the requests saved on this device. Account-scoped and
 * ALWAYS device-only: never synced to Supabase or sent anywhere (there is no adviser backend).
 */
export const ADVISER_REQUEST_KEY = "ge-adviser-requests-v1";

interface AdviserRequestState {
  draft: AdviserRequestDraft;
  saved: SavedAdviserRequest[];
}

export const adviserRequestStore = createStore<AdviserRequestState>(ADVISER_REQUEST_KEY, () => ({ draft: emptyAdviserRequest(), saved: [] }));
export const useAdviserRequests = () => useStore(adviserRequestStore);

export const adviserRequestActions = {
  setDraft(draft: AdviserRequestDraft) {
    adviserRequestStore.set({ ...adviserRequestStore.get(), draft });
  },
  save(request: SavedAdviserRequest) {
    const cur = adviserRequestStore.get();
    adviserRequestStore.set({ draft: emptyAdviserRequest(), saved: [request, ...cur.saved].slice(0, 10) });
  },
  remove(savedAt: number) {
    const cur = adviserRequestStore.get();
    adviserRequestStore.set({ ...cur, saved: cur.saved.filter((r) => r.savedAt !== savedAt) });
  },
};
