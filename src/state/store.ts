import { useSyncExternalStore } from "react";

/**
 * Minimal persisted store (no dependency). State lives in memory and is mirrored to
 * localStorage on this device.
 *
 * Scopes
 *  - "account" (default): one copy per signed-in demo account. The key is suffixed with the
 *    active account id (`ge-learn-v1::<accountId>`); with no account active the store holds
 *    its initial value in memory and writes nothing. Switching account reloads every store.
 *  - "device": one copy for the whole browser (e.g. the device account list).
 *  - "memory": never persisted.
 */
export interface Store<T> {
  get: () => T;
  set: (next: T) => void;
  subscribe: (listener: () => void) => () => void;
  reset: () => void;
}

export type StoreScope = "account" | "device" | "memory";

let accountNamespace: string | null = null;
const accountStores = new Set<{ reload: () => void }>();

export const namespacedKey = (key: string, accountId: string) => `${key}::${accountId}`;
export const getAccountNamespace = () => accountNamespace;

/** Point every account-scoped store at another account (or none) and re-read its state. */
export function setAccountNamespace(accountId: string | null) {
  accountNamespace = accountId;
  accountStores.forEach((store) => store.reload());
}

/** Write a value for an account that is not necessarily active (seeding, migration). */
export function writeAccountValue(key: string, accountId: string, value: unknown) {
  localStorage.setItem(namespacedKey(key, accountId), JSON.stringify(value));
}

export function removeAccountValue(key: string, accountId: string) {
  try {
    localStorage.removeItem(namespacedKey(key, accountId));
  } catch {
    /* ignore */
  }
}

export function createStore<T>(key: string, initial: () => T, scope: StoreScope = "account"): Store<T> {
  const storageKey = () =>
    scope === "device" ? key : scope === "account" && accountNamespace ? namespacedKey(key, accountNamespace) : null;
  const read = (): T => {
    const k = storageKey();
    if (!k) return initial();
    try {
      const raw = typeof localStorage !== "undefined" ? localStorage.getItem(k) : null;
      return raw ? ({ ...initial(), ...JSON.parse(raw) } as T) : initial();
    } catch {
      return initial();
    }
  };
  let state = read();
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((listener) => listener());
  if (scope === "account")
    accountStores.add({
      reload: () => {
        state = read();
        emit();
      },
    });
  return {
    get: () => state,
    set: (next) => {
      state = next;
      const k = storageKey();
      if (k)
        try {
          localStorage.setItem(k, JSON.stringify(next));
        } catch {
          /* storage unavailable: keep in-memory state */
        }
      emit();
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    reset: () => {
      state = initial();
      const k = storageKey();
      if (k)
        try {
          localStorage.removeItem(k);
        } catch {
          /* ignore */
        }
      emit();
    },
  };
}

export function useStore<T>(store: Store<T>): T {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}
