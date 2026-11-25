import { useSyncExternalStore } from "react";

/**
 * Minimal persisted store (no dependency). State lives in memory and is mirrored to
 * localStorage on this device only — there is no cloud sync or cross-device persistence.
 */
export interface Store<T> {
  get: () => T;
  set: (next: T) => void;
  subscribe: (listener: () => void) => () => void;
  reset: () => void;
}

export function createStore<T>(key: string, initial: () => T): Store<T> {
  const read = (): T => {
    try {
      const raw = typeof localStorage !== "undefined" ? localStorage.getItem(key) : null;
      return raw ? ({ ...initial(), ...JSON.parse(raw) } as T) : initial();
    } catch {
      return initial();
    }
  };
  let state = read();
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((listener) => listener());
  return {
    get: () => state,
    set: (next) => {
      state = next;
      try {
        localStorage.setItem(key, JSON.stringify(next));
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
      try {
        localStorage.removeItem(key);
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
