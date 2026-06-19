// ─────────────────────────────────────────────────────────
// The Becoming Index (v1) — the seed of the Becoming Engine.
//
// One earned number that answers: "Am I moving toward who I said I'd
// become?" It is NOT self-reported — it's computed from real evidence the
// app already records: identity breadth across the eight life domains,
// momentum from the mission-day history, and today's actual effort.
//
//   score    0–100 composite (identity 50% · momentum 35% · today 15%)
//   delta    recent vs prior trajectory (from real history day-scores)
//   trend    'rising' | 'steady' | 'dipping'
//   facets   the eight domain scores (who you are right now)
//   top      strongest facet · focus = the one asking for attention
// ─────────────────────────────────────────────────────────
import { snapshot } from './mission.js';
import { domainScores } from './quests.js';

function readHistory() {
  try { const r = localStorage.getItem('lifeos:history'); return r ? JSON.parse(r) : {}; } catch { return {}; }
}

function dayKeys(n) {
  const out = [];
  const today = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  }
  return out; // most-recent first
}

const avg = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);

export function becomingIndex(opts = {}) {
  const s = opts.snapshot || snapshot();
  const history = opts.history || readHistory();
  const scores = opts.scores || domainScores(s);

  const facets = Object.entries(scores).map(([id, d]) => ({ id, score: d.score, signal: d.signal }));
  const identity = Math.round(avg(facets.map((f) => f.score)));

  // Momentum + trajectory from real recorded mission-day scores (0..4 → 0..100).
  const keys = dayKeys(14);
  const dayVal = (k) => { const v = history[k]; return v ? (Math.min(4, v.score ?? 0) / 4) * 100 : null; };
  const series = keys.map(dayVal);
  const window7 = series.slice(0, 7).filter((v) => v != null);
  const momentum = window7.length ? Math.round(avg(window7)) : 50;

  const todayK = keys[0];
  const action = history[todayK]
    ? Math.round((Math.min(4, history[todayK].score ?? 0) / 4) * 100)
    : (s.readiness ?? 50);

  const score = Math.round(identity * 0.5 + momentum * 0.35 + action * 0.15);

  const recent = series.slice(0, 3).filter((v) => v != null);
  const prior = series.slice(3, 10).filter((v) => v != null);
  const delta = (recent.length && prior.length) ? Math.round(avg(recent) - avg(prior)) : 0;
  const trend = delta > 4 ? 'rising' : delta < -4 ? 'dipping' : 'steady';

  const sorted = [...facets].sort((a, b) => b.score - a.score);
  const top = sorted[0] || null;
  const focus = sorted[sorted.length - 1] || null;

  return { score, delta, trend, identity, momentum, facets, top, focus };
}

// A short, human read of who you're becoming + trajectory.
const BECOMING_LABEL = {
  athlete: 'an elite athlete',
  business: 'a builder',
  relationships: 'a present partner',
  health: 'resilient',
  creativity: 'a creator',
  learning: 'a learner',
  adventure: 'an explorer',
  growth: 'someone who grows',
};

export function becomingLine(b) {
  if (!b || !b.top) return 'Becoming — building your baseline';
  const dir = b.trend === 'rising' ? 'trending up' : b.trend === 'dipping' ? 'slipping — re-engage' : 'holding steady';
  return `Becoming ${BECOMING_LABEL[b.top.id] || 'who you intend'} · ${dir}`;
}
