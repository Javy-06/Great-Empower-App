import { createStore, useStore } from "./store";

/** Bookmarks and progress for lessons, videos and infographics (this device only). */
export interface LearnProgress {
  bookmarked: string[];
  started: string[];
  completed: string[];
}

export const learnProgressStore = createStore<LearnProgress>("ge-learn-v1", () => ({
  bookmarked: ["medical-cards"],
  started: [],
  completed: [],
}));

export const useLearnProgress = () => useStore(learnProgressStore);

const add = (list: string[], id: string) => (list.includes(id) ? list : [...list, id]);

export const learnActions = {
  toggleBookmark(id: string) {
    const s = learnProgressStore.get();
    learnProgressStore.set({
      ...s,
      bookmarked: s.bookmarked.includes(id) ? s.bookmarked.filter((x) => x !== id) : [...s.bookmarked, id],
    });
  },
  start(id: string) {
    const s = learnProgressStore.get();
    learnProgressStore.set({ ...s, started: add(s.started, id) });
  },
  complete(id: string) {
    const s = learnProgressStore.get();
    learnProgressStore.set({ ...s, started: add(s.started, id), completed: add(s.completed, id) });
  },
};
