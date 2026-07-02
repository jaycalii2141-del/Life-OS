// Test setup — a minimal localStorage shim so the pure engines (which read
// lifeos:* keys defensively) run in a plain node environment. Tests that
// care about stored state set it explicitly; everything else sees "empty".
class MemoryStorage {
  constructor() { this.m = new Map(); }
  getItem(k) { return this.m.has(k) ? this.m.get(k) : null; }
  setItem(k, v) { this.m.set(String(k), String(v)); }
  removeItem(k) { this.m.delete(k); }
  clear() { this.m.clear(); }
  key(i) { return [...this.m.keys()][i] ?? null; }
  get length() { return this.m.size; }
}

globalThis.localStorage = new MemoryStorage();
// Minimal window stub — usePersistentState registers a cross-tab 'storage'
// listener at import time; the engines never need real events in tests.
if (typeof globalThis.window === 'undefined' || typeof globalThis.window.addEventListener !== 'function') {
  globalThis.window = {
    localStorage: globalThis.localStorage,
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() { return true; },
  };
}

import { beforeEach } from 'vitest';
beforeEach(() => { globalThis.localStorage.clear(); });
