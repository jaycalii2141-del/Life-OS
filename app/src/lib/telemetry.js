// ─────────────────────────────────────────────────────────
// Telemetry — the mirror. A tiny, local-only ring buffer that
// records what Jay opens and does, so LifeOS can reflect usage
// back in the Weekly Review and (later) the Monthly Upgrade Report.
// Local-only on purpose: it's a private behavioural log, not state
// worth syncing. Never blocks the UI; failures are swallowed.
// ─────────────────────────────────────────────────────────
const KEY = 'lifeos:telemetry';
const MAX = 600; // ~weeks of normal use; oldest events roll off

export function logEvent(surface, action, meta) {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? JSON.parse(raw) : [];
    list.push({ s: surface, a: action, t: Date.now(), ...(meta ? { m: meta } : {}) });
    if (list.length > MAX) list.splice(0, list.length - MAX);
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch { /* never let analytics break the app */ }
}

export function readEvents() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

// Surface-usage rollup over the last N days: opens per surface.
export function usageBySurface(days = 7) {
  const cutoff = Date.now() - days * 864e5;
  const counts = {};
  for (const e of readEvents()) {
    if (e.t < cutoff || e.a !== 'open') continue;
    counts[e.s] = (counts[e.s] || 0) + 1;
  }
  return counts; // { home: 12, train: 5, ... }
}
