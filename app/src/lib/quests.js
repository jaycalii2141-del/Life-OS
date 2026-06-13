// ─────────────────────────────────────────────────────────
// JAM HQ — Quest Engine & Life Alignment
//
// Goals become MISSIONS: long campaigns broken into milestones
// (quests). Every domain of Jay's life gets a living score, and
// the Alignment Score answers the only question that matters:
// "Am I becoming the person I want to become?"
//
// Pure functions over the same localStorage snapshot the mission
// engine uses. No React in here.
// ─────────────────────────────────────────────────────────
import { snapshot } from './mission.js';
import { DISCIPLINES } from '../data.js';

function readJSON(key, fb) {
  try { const r = localStorage.getItem(key); return r != null ? JSON.parse(r) : fb; } catch { return fb; }
}

// ─────────────────────────────────────────────────────────
// The eight life domains — the Life Map's territory.
// ─────────────────────────────────────────────────────────
export const LIFE_MAP_DOMAINS = [
  { id: 'athlete',       name: 'Athlete',       icon: '🤸', color: '#45B7E8' },
  { id: 'business',      name: 'Business',      icon: '📈', color: '#E9C46A' },
  { id: 'relationships', name: 'Relationships', icon: '❤️', color: '#FF8A4C' },
  { id: 'health',        name: 'Health',        icon: '🫀', color: '#34D399' },
  { id: 'creativity',    name: 'Creativity',    icon: '🎬', color: '#F4A261' },
  { id: 'learning',      name: 'Learning',      icon: '📚', color: '#2DD4BF' },
  { id: 'adventure',     name: 'Adventure',     icon: '🌍', color: '#1E9FD8' },
  { id: 'growth',        name: 'Growth',        icon: '🧭', color: '#FF6B5B' },
];

// ─────────────────────────────────────────────────────────
// Seed missions — Jay's actual long-term campaigns.
// Fully editable in-app; stored at lifeos:quests.
// ─────────────────────────────────────────────────────────
export const SEED_QUESTS = [
  {
    id: 'hybrid-athlete', domain: 'athlete', icon: '🥇',
    title: 'Become a world-class hybrid movement athlete',
    why: 'The 10-year identity everything else trains for.',
    milestones: [
      { id: 1, text: 'Master the layout full twist', done: false },
      { id: 2, text: 'Land a clean cork', done: false },
      { id: 3, text: 'Full front lever, 5s hold', done: false },
      { id: 4, text: 'Standing hand-to-hand with Chelsea', done: false },
    ],
  },
  {
    id: 'scale-ona', domain: 'business', icon: '🥷',
    title: 'Scale ONA past 250 members',
    why: 'The gym becomes an engine, not a job.',
    milestones: [
      { id: 1, text: 'Launch Adult Ninja League', done: false },
      { id: 2, text: 'Reactivate 50 old leads', done: false },
      { id: 3, text: 'Hit 200 active members', done: false },
      { id: 4, text: 'Hit $25k MRR', done: false },
    ],
  },
  {
    id: 'podium-launch', domain: 'business', icon: '🏆',
    title: 'Launch the next Podium product line',
    why: 'Equipment revenue that compounds while you sleep.',
    milestones: [
      { id: 1, text: 'Pick the one product that moves revenue', done: false },
      { id: 2, text: 'Prototype built and tested', done: false },
      { id: 3, text: 'First 10 orders shipped', done: false },
    ],
  },
  {
    id: 'marriage', domain: 'relationships', icon: '❤️',
    title: 'A marriage that gets better every season',
    why: 'The foundation under everything else.',
    milestones: [
      { id: 1, text: 'Weekly date night, 8 weeks straight', done: false },
      { id: 2, text: 'Plan the next adventure trip together', done: false },
    ],
  },
  {
    id: 'explore', domain: 'adventure', icon: '🌍',
    title: 'Train and film in 3 new countries',
    why: 'Movement is a passport. Use it.',
    milestones: [
      { id: 1, text: 'Pick the 3 destinations', done: false },
      { id: 2, text: 'Book trip #1', done: false },
    ],
  },
];

export function questProgress(q) {
  const total = (q.milestones || []).length;
  if (!total) return 0;
  return Math.round(((q.milestones || []).filter((m) => m.done).length / total) * 100);
}

export function nextMilestone(q) {
  return (q.milestones || []).find((m) => !m.done) || null;
}

// ─────────────────────────────────────────────────────────
// Domain scores (0–100) — computed from real activity, not vibes.
// Each returns { score, signal } where signal is the one-line "why".
// ─────────────────────────────────────────────────────────
export function domainScores(s = snapshot()) {
  const quests = readJSON('lifeos:quests', SEED_QUESTS);
  const history = readJSON('lifeos:history', {});
  const adventure = readJSON('lifeos:adventure', []);
  const learning = readJSON('lifeos:learning', []);

  // Athlete — overall mastery across all trees.
  let total = 0, pctSum = 0;
  DISCIPLINES.forEach((d) => (s.skills[d.id] || []).forEach((sk) => {
    total += 1; pctSum += sk.status === 'done' ? 100 : (sk.pct || 0);
  }));
  const athlete = total ? Math.round(pctSum / total) : 0;

  // Health — 7-day readiness average.
  const rVals = Object.entries(history).sort(([a], [b]) => (a < b ? 1 : -1)).slice(0, 7)
    .map(([, v]) => v.readiness).filter((v) => typeof v === 'number');
  const health = rVals.length ? Math.round(rVals.reduce((x, y) => x + y, 0) / rVals.length) : (s.readiness ?? 50);

  // Business — average progress of ONA initiatives + business quests.
  const inits = (s.ona.initiatives || []).map((i) => i.pct || 0);
  const bizQuests = quests.filter((q) => q.domain === 'business').map(questProgress);
  const bizParts = [...inits, ...bizQuests];
  const business = bizParts.length ? Math.round(bizParts.reduce((x, y) => x + y, 0) / bizParts.length) : 40;

  // Relationships — recency of attention to the Wife & I domain.
  const wifeFolder = (s.folders || []).find((f) => f.domain === 'wife');
  const wifeNotes = (wifeFolder?.notes || []).length;
  const relQuest = quests.find((q) => q.domain === 'relationships');
  const relationships = Math.min(100, 40 + wifeNotes * 6 + (relQuest ? questProgress(relQuest) / 2 : 0));

  // Creativity — brand pace this week.
  const brands = (s.content.brands || []).filter((b) => b.status !== 'Paused');
  const creativity = brands.length
    ? Math.round(brands.reduce((x, b) => x + Math.min(100, b.pct || 0), 0) / brands.length)
    : 50;

  // Learning — items in motion in the Learning Lab.
  const activeLearning = learning.filter((l) => !l.done).length;
  const doneLearning = learning.filter((l) => l.done).length;
  const learn = Math.min(100, 30 + activeLearning * 12 + doneLearning * 6);

  // Adventure — planned + lived experiences.
  const plannedAdv = adventure.filter((a) => !a.done).length;
  const livedAdv = adventure.filter((a) => a.done).length;
  const adv = Math.min(100, 25 + plannedAdv * 8 + livedAdv * 12);

  // Growth — streak + reflection cadence.
  const streakDays = (() => {
    let n = 0;
    const today = new Date();
    for (let i = 0; i < 60; i++) {
      const d = new Date(today); d.setDate(today.getDate() - i);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if ((history[k]?.score ?? 0) >= 1) n += 1; else if (i > 0) break;
    }
    return n;
  })();
  const journalCount = (s.journal || []).length;
  const growth = Math.min(100, 30 + streakDays * 5 + Math.min(20, journalCount * 2));

  return {
    athlete:       { score: athlete,                    signal: `${total} skills mapped` },
    business:      { score: business,                   signal: `${(s.ona.initiatives || []).length} initiatives live` },
    relationships: { score: Math.round(relationships),  signal: wifeNotes ? `${wifeNotes} shared notes` : 'plan something together' },
    health:        { score: health,                     signal: `readiness ${s.readiness ?? '—'} today` },
    creativity:    { score: creativity,                 signal: `${brands.length} brands active` },
    learning:      { score: learn,                      signal: activeLearning ? `${activeLearning} in progress` : 'open the Learning Lab' },
    adventure:     { score: adv,                        signal: plannedAdv ? `${plannedAdv} planned` : 'add to the bucket list' },
    growth:        { score: growth,                     signal: `${streakDays}-day streak` },
  };
}

// The one number at the top of the cockpit.
export function alignmentScore(scores = domainScores()) {
  const vals = Object.values(scores).map((d) => d.score);
  return Math.round(vals.reduce((x, y) => x + y, 0) / vals.length);
}

// ─────────────────────────────────────────────────────────
// Recent wins — fuel. Pulled from real events in the last 7 days.
// ─────────────────────────────────────────────────────────
export function recentWins(s = snapshot(), limit = 4) {
  const wins = [];
  const weekAgo = Date.now() - 7 * 864e5;

  // Sessions trained this week.
  const sessions = (s.sessions || []).filter((x) => new Date(x.date).getTime() > weekAgo);
  if (sessions.length) wins.push({ icon: '💪', text: `${sessions.length} training session${sessions.length > 1 ? 's' : ''} this week` });

  // Mission days completed (score ≥ 2) this week.
  const history = readJSON('lifeos:history', {});
  const goodDays = Object.entries(history).filter(([k, v]) => {
    const t = new Date(`${k}T12:00:00`).getTime();
    return t > weekAgo && (v.score ?? 0) >= 2;
  }).length;
  if (goodDays) wins.push({ icon: '🎯', text: `${goodDays} strong mission day${goodDays > 1 ? 's' : ''}` });

  // Quest milestones knocked out (any time — most recent few).
  const quests = readJSON('lifeos:quests', SEED_QUESTS);
  quests.forEach((q) => (q.milestones || []).forEach((m) => {
    if (m.done && m.doneAt && m.doneAt > weekAgo) wins.push({ icon: q.icon, text: m.text });
  }));

  // Captures routed (mind kept clean).
  const routed = (s.captures || []).filter((c) => c.status === 'triaged' && (c.routedAt || 0) > weekAgo).length;
  if (routed >= 3) wins.push({ icon: '🧠', text: `${routed} thoughts captured & routed` });

  return wins.slice(0, limit);
}
