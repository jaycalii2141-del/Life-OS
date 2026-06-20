// ─────────────────────────────────────────────────────────
// Life Level — the unified meta-progression for the Self.
//
// One compounding level earned from REAL cumulative activity across every
// domain (mission days, training sessions, mastered/active skills, routed
// captures). Unlike the daily Becoming Index (a state), Life Level only
// goes up — it's the long-term "who you've become" number that lives at
// the center of the Life Map constellation.
// ─────────────────────────────────────────────────────────
import { snapshot } from './mission.js';

function readJSON(k, fb) {
  try { const r = localStorage.getItem(k); return r != null ? JSON.parse(r) : fb; } catch { return fb; }
}

export function lifeLevel(s) {
  s = s || snapshot();
  const history = readJSON('lifeos:history', {});

  let xp = 0;
  // Every committed day compounds (score 0..4 → up to 48 XP/day).
  Object.values(history).forEach((d) => { xp += Math.min(4, d.score || 0) * 12; });
  // Training shows up.
  xp += (s.sessions || []).length * 25;
  // Skills: mastery is the big reward; active work counts too.
  let mastered = 0, active = 0;
  Object.values(s.skills || {}).forEach((arr) => (arr || []).forEach((sk) => {
    if (sk.status === 'done') mastered += 1; else if (sk.status === 'active') active += 1;
  }));
  xp += mastered * 130 + active * 18;
  // Thoughts captured and routed (intentional living).
  xp += (s.captures || []).filter((c) => c.status === 'triaged').length * 6;
  xp = Math.round(xp);

  // Rising cost curve — later levels take more.
  const need = (L) => Math.round(60 * Math.pow(Math.max(0, L - 1), 1.6));
  let level = 1;
  while (need(level + 1) <= xp) level += 1;

  const cur = need(level), nxt = need(level + 1);
  const pct = nxt > cur ? Math.round(((xp - cur) / (nxt - cur)) * 100) : 0;
  return { level, xp, pct: Math.max(0, Math.min(100, pct)), toNext: Math.max(0, nxt - xp) };
}
