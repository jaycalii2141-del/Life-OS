// ─────────────────────────────────────────────────────────
// Streak insurance (freezes) — the retention safety net.
//
// You earn freeze tokens over time; a freeze auto-heals a *genuine 1-day
// gap* (a missed day flanked by activity) so one slip doesn't reset a long
// streak. Today is never auto-frozen — the current day must still be earned.
// All functions are pure; App.jsx owns the stored `used` map.
// ─────────────────────────────────────────────────────────

function keyDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const p = (x) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function activeDayCount(history) {
  return Object.values(history || {}).filter((v) => (v?.score ?? 0) >= 1).length;
}

// Earned freezes: a base of 2, +1 per completed week of real activity, capped.
export function earnedFreezes(history) {
  return Math.min(6, 2 + Math.floor(activeDayCount(history) / 7));
}

// Heal genuine 1-day gaps using available freezes. Pure → returns a (possibly
// new) `used` map. `todayScore` lets today act as the newer flank once earned.
export function healFreezes(history, used, todayScore, earned) {
  const out = { ...(used || {}) };
  let avail = earned - Object.keys(out).length;
  if (avail <= 0) return out;
  const scoreAt = (i) => (i === 0 ? (todayScore ?? 0) : (history[keyDaysAgo(i)]?.score ?? 0));
  const keptAt = (i) => scoreAt(i) >= 1 || !!out[keyDaysAgo(i)];
  for (let i = 1; i <= 14 && avail > 0; i++) {
    const k = keyDaysAgo(i);
    if (out[k]) continue;
    if ((history[k]?.score ?? 0) >= 1) continue; // not a missed day
    // Bridge only a real 1-day gap: both flanks kept (active or already frozen).
    if (keptAt(i - 1) && keptAt(i + 1)) { out[k] = true; avail -= 1; }
  }
  return out;
}

export function freezeState(history, used) {
  const earned = earnedFreezes(history);
  const usedCount = Object.keys(used || {}).length;
  return { earned, usedCount, available: Math.max(0, earned - usedCount) };
}
