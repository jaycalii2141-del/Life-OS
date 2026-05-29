// ─────────────────────────────────────────────────────────
// Persistence — tiny localStorage-backed state hook
// ─────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';

// Today's date as a stable YYYY-MM-DD key (local time)
export function todayKey() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// useState that mirrors its value into localStorage under `key`.
// Reads the stored value on first mount; falls back to `initialValue`.
export function usePersistentState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw != null ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage full or unavailable — ignore */
    }
  }, [key, value]);

  return [value, setValue];
}
