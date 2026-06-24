// ─────────────────────────────────────────────────────────
// Identity Milestones — the "who you've become" unlocks.
//
// Not "10 tasks done" but "You became someone who trains on low days."
// Each milestone is an identity threshold earned from REAL evidence the
// app already records (streak, sessions, mastered skills, shipped work,
// reflection, balance, momentum). They are named, dated, remembered — and
// crossing one fires a ceremony. This is the reward layer of the Becoming
// Engine: rare, true, and about identity, not chores.
// ─────────────────────────────────────────────────────────
import { snapshot } from './mission.js';
import { becomingIndex } from './becoming.js';
import { domainScores } from './quests.js';
import { DISCIPLINES } from '../data.js';

function readHistory() {
  try { const r = localStorage.getItem('lifeos:history'); return r ? JSON.parse(r) : {}; } catch { return {}; }
}

// Consecutive days (ending today) with any committed activity.
function currentStreak(history) {
  const p = (x) => String(x).padStart(2, '0');
  let n = 0;
  for (let i = 0; i < 400; i++) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const k = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
    if ((history[k]?.score ?? 0) >= 1) n += 1; else break;
  }
  return n;
}

const clampPct = (v) => Math.max(0, Math.min(100, Math.round(v)));

// The catalog. Each entry: a check(ctx) → { done, progress } where progress
// is 0–100 toward earning it (so locked milestones show how close you are).
const CATALOG = [
  {
    id: 'consistent', name: 'The Consistent', accent: '#45B7E8',
    statement: 'You showed up seven days straight.',
    hint: 'Earn a 7-day streak.',
    check: (c) => ({ done: c.streak >= 7, progress: (c.streak / 7) * 100 }),
  },
  {
    id: 'relentless', name: 'The Relentless', accent: '#FF6B5B',
    statement: 'Thirty days unbroken — this is just who you are now.',
    hint: 'Reach a 30-day streak.',
    check: (c) => ({ done: c.streak >= 30, progress: (c.streak / 30) * 100 }),
  },
  {
    id: 'disciplined', name: 'The Disciplined', accent: '#E9C46A',
    statement: 'You kept moving on a day your body wanted to quit.',
    hint: 'Commit to the day even when readiness is low (<55).',
    check: (c) => {
      const lowDayActed = Object.values(c.history).some((d) => typeof d?.readiness === 'number' && d.readiness < 55 && (d.done ?? 0) >= 1);
      return { done: lowDayActed, progress: lowDayActed ? 100 : 0 };
    },
  },
  {
    id: 'athlete', name: 'The Athlete', accent: '#34D399',
    statement: 'Twenty-five sessions in the log — the work is undeniable.',
    hint: 'Log 25 training sessions.',
    check: (c) => ({ done: c.sessions >= 25, progress: (c.sessions / 25) * 100 }),
  },
  {
    id: 'master', name: 'The Master', accent: '#45B7E8',
    statement: 'You mastered your first skill.',
    hint: 'Take any skill to mastered.',
    check: (c) => ({ done: c.mastered >= 1, progress: c.mastered >= 1 ? 100 : (c.bestSkillPct || 0) }),
  },
  {
    id: 'polymath', name: 'The Polymath', accent: '#2DD4BF',
    statement: 'Mastery across three disciplines — a complete mover.',
    hint: 'Master a skill in 3 different disciplines.',
    check: (c) => ({ done: c.masteredDisciplines >= 3, progress: (c.masteredDisciplines / 3) * 100 }),
  },
  {
    id: 'builder', name: 'The Builder', accent: '#FF6B5B',
    statement: 'You shipped a business initiative — a builder, not a dreamer.',
    hint: 'Complete an ONA initiative.',
    check: (c) => ({ done: c.shippedInits >= 1, progress: c.shippedInits >= 1 ? 100 : (c.openInits ? 50 : 0) }),
  },
  {
    id: 'scaling', name: 'The Operator', accent: '#34D399',
    statement: 'ONA crossed 250 members — you scaled it.',
    hint: 'Grow ONA past 250 members.',
    check: (c) => ({ done: c.onaMembers >= 250, progress: (c.onaMembers / 250) * 100 }),
  },
  {
    id: 'creator', name: 'The Creator', accent: '#FF8A4C',
    statement: 'You put your work into the world, again and again.',
    hint: 'Ship 8 pieces of content.',
    check: (c) => ({ done: c.posted >= 8, progress: (c.posted / 8) * 100 }),
  },
  {
    id: 'reflective', name: 'The Reflective', accent: '#2DD4BF',
    statement: 'Twenty reflections deep — you examine your life.',
    hint: 'Write 20 journal entries.',
    check: (c) => ({ done: c.journal >= 20, progress: (c.journal / 20) * 100 }),
  },
  {
    id: 'intentional', name: 'The Intentional', accent: '#45B7E8',
    statement: 'You turn fleeting thoughts into action — nothing is lost.',
    hint: 'Route 15 captures to where they belong.',
    check: (c) => ({ done: c.triaged >= 15, progress: (c.triaged / 15) * 100 }),
  },
  {
    id: 'centered', name: 'The Centered', accent: '#E9C46A',
    statement: 'Every part of your life is alive at once — a whole self.',
    hint: 'Get all eight domains above 50.',
    check: (c) => ({ done: c.minDomain >= 50, progress: (c.minDomain / 50) * 100 }),
  },
  {
    id: 'ascending', name: 'The Ascending', accent: '#34D399',
    statement: 'Real momentum — you are visibly trending toward your best.',
    hint: 'Build your Becoming momentum to 70+.',
    check: (c) => ({ done: c.momentum >= 70, progress: (c.momentum / 70) * 100 }),
  },
];

// Reduce the whole app state into the scalar facts the checks need.
function buildContext(opts = {}) {
  const s = opts.snapshot || snapshot();
  const history = opts.history || readHistory();
  let becoming = opts.becoming;
  let scores = opts.scores;
  try { if (!becoming) becoming = becomingIndex({ snapshot: s, history }); } catch { becoming = null; }
  try { if (!scores) scores = domainScores(s); } catch { scores = {}; }

  let mastered = 0, bestSkillPct = 0;
  const masteredDiscSet = new Set();
  DISCIPLINES.forEach((d) => (s.skills?.[d.id] || []).forEach((sk) => {
    if (sk.status === 'done') { mastered += 1; masteredDiscSet.add(d.id); }
    if ((sk.pct || 0) > bestSkillPct) bestSkillPct = sk.pct || 0;
  }));

  const inits = s.ona?.initiatives || [];
  const content = s.content || {};
  const posted = (content.items || []).filter((i) => (i.stage || i.status) === 'posted').length
    + (content.brands || []).reduce((n, b) => n + (b.posted || 0), 0);
  const domainVals = Object.values(scores || {}).map((d) => d?.score ?? 0);

  return {
    history,
    streak: currentStreak(history),
    sessions: (s.sessions || []).length,
    mastered,
    bestSkillPct,
    masteredDisciplines: masteredDiscSet.size,
    shippedInits: inits.filter((i) => i.status === 'done').length,
    openInits: inits.length,
    onaMembers: s.ona?.stats?.members ?? s.onaLive?.members ?? 0,
    posted,
    journal: (s.journal || []).length,
    triaged: (s.captures || []).filter((c) => c.status === 'triaged').length,
    minDomain: domainVals.length ? Math.min(...domainVals) : 0,
    momentum: becoming?.momentum ?? 0,
  };
}

// Evaluate the full catalog → display list (earned status + progress).
export function evaluateMilestones(opts = {}) {
  const ctx = buildContext(opts);
  return CATALOG.map((m) => {
    let r;
    try { r = m.check(ctx); } catch { r = { done: false, progress: 0 }; }
    return {
      id: m.id, name: m.name, statement: m.statement, hint: m.hint, accent: m.accent,
      done: !!r.done, progress: clampPct(r.done ? 100 : (r.progress || 0)),
    };
  });
}

// The ids currently qualifying as earned — used by the earn-detector.
export function qualifyingMilestoneIds(opts = {}) {
  return evaluateMilestones(opts).filter((m) => m.done).map((m) => m.id);
}

export const MILESTONE_BY_ID = Object.fromEntries(CATALOG.map((m) => [m.id, m]));
