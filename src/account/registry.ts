import { createStore, useStore } from "@/state/store";

/**
 * Accounts known to THIS browser. This is a demo account picker, not real authentication:
 * nothing here is verified, and an account can only be reopened on the device that created it.
 *
 *  - mode "cloud": a Supabase anonymous user (`uid`); its session lives in localStorage under
 *    `ge-sb-<id>` and its data in Supabase (with a local cache).
 *  - mode "local": saved in this browser only (cloud not configured, or chosen offline).
 *  - type "legacy": progress that existed on this device before accounts were introduced.
 */
export type AccountType = "demo" | "new" | "legacy";
export type AccountMode = "cloud" | "local";

export interface DeviceAccount {
  id: string;
  type: AccountType;
  mode: AccountMode;
  uid?: string;
  displayName?: string;
  createdAt: number;
  lastUsedAt: number;
}

interface Registry {
  version: 1;
  accounts: DeviceAccount[];
  activeId: string | null;
}

export const REGISTRY_KEY = "ge-accounts-v1";

export const registryStore = createStore<Registry>(
  REGISTRY_KEY,
  () => ({ version: 1, accounts: [], activeId: null }),
  "device",
);

export const useRegistry = () => useStore(registryStore);

export const findAccount = (id: string | null) =>
  id ? registryStore.get().accounts.find((a) => a.id === id) : undefined;

export function upsertAccount(account: DeviceAccount) {
  const r = registryStore.get();
  const others = r.accounts.filter((a) => a.id !== account.id);
  registryStore.set({ ...r, accounts: [...others, account] });
}

export function setActiveAccount(id: string | null) {
  const r = registryStore.get();
  registryStore.set({
    ...r,
    activeId: id,
    accounts: id ? r.accounts.map((a) => (a.id === id ? { ...a, lastUsedAt: Date.now() } : a)) : r.accounts,
  });
}

/** Label shown in the picker. Never implies a verified identity. */
export function accountLabel(a: DeviceAccount, all: DeviceAccount[] = registryStore.get().accounts) {
  if (a.type === "demo") return "Demo account";
  if (a.type === "legacy") return "Earlier progress on this device";
  const news = all.filter((x) => x.type === "new").sort((x, y) => x.createdAt - y.createdAt);
  const n = news.findIndex((x) => x.id === a.id) + 1;
  return a.displayName ? `${a.displayName} · new account` : `New account ${n || ""}`.trim();
}

export const newAccountId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `acc-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
