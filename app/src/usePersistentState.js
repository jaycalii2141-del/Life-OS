// ─────────────────────────────────────────────────────────
// Persistence — localStorage-backed state, shared per key.
//
// All hook instances that use the same `key` share ONE in-memory
// store and re-render together. Without this, two components calling
// usePersistentState('lifeos:folders', …) would hold independent
// React states that only reconcile on remount — a silent divergence.
// A `storage` listener also keeps multiple browser tabs in sync.
// ─────────────────────────────────────────────────────────
import { useState, useEffect, useCallback } from 'react';

// Today's date as a stable YYYY-MM-DD key (local time)
export function todayKey() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// ── Shared store registry: key -> { value, subs:Set<fn> } ──
const stores = new Map();

function readInitial(key, initialValue) {
  try {
    const raw = localStorage.getItem(key);
    return raw != null ? JSON.parse(raw) : initialValue;
  } catch {
    return initialValue;
  }
}

function getStore(key, initialValue) {
  let s = stores.get(key);
  if (!s) {
    s = { value: readInitial(key, initialValue), subs: new Set() };
    stores.set(key, s);
  }
  return s;
}

// Write a new value (or updater fn), persist it, and notify subscribers.
function writeStore(key, next) {
  const s = stores.get(key);
  if (!s) return;
  const value = typeof next === 'function' ? next(s.value) : next;
  if (Object.is(value, s.value)) return;
  s.value = value;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or unavailable — ignore */
  }
  s.subs.forEach((fn) => fn(value));
}

// Cross-tab sync: when another tab writes the same key, update locally.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (!e.key || !stores.has(e.key)) return;
    const s = stores.get(e.key);
    let v;
    try {
      v = e.newValue != null ? JSON.parse(e.newValue) : undefined;
    } catch {
      return;
    }
    if (v === undefined || Object.is(v, s.value)) return;
    s.value = v; // don't re-write localStorage — the other tab already did
    s.subs.forEach((fn) => fn(v));
  });
}

// useState that mirrors into a shared, localStorage-backed store.
export function usePersistentState(key, initialValue) {
  const store = getStore(key, initialValue);
  const [value, setLocal] = useState(store.value);

  useEffect(() => {
    const s = getStore(key, initialValue);
    const fn = (v) => setLocal(v);
    s.subs.add(fn);
    // Catch any change that landed between render and effect (incl. key change).
    if (!Object.is(s.value, value)) setLocal(s.value);
    return () => { s.subs.delete(fn); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const setValue = useCallback((next) => writeStore(key, next), [key]);
  return [value, setValue];
}
