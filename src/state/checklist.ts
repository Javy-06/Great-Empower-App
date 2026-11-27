import { createStore } from "./store";

/** The readiness checklist (Guide → Checklist, and Protect → Get cover → Get ready). Per account. */
export const CHECKLIST_KEY = "ge-guide-checklist-v1";
export const checklistStore = createStore<{ done: string[] }>(CHECKLIST_KEY, () => ({ done: [] }));
