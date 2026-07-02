// Identity milestones — "earned from real evidence, never self-reported".
// Pins the thresholds and progress math for the unlocks, plus quest math.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { evaluateMilestones, qualifyingMilestoneIds } from '../milestones.js';
import { questProgress, nextMilestone, alignmentScore } from '../quests.js';

const key = (n) => {
  const d = new Date(); d.setDate(d.getDate() - n);
  const p = (x) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

const SNAP = (over = {}) => ({
  skills: {}, sessions: [], ona: {}, onaLive: null, content: {},
  journal: [], captures: [], folders: [], daily: {}, readiness: 50,
  ...over,
});
const SCORES = (v) => Object.fromEntries(
  ['athlete', 'business', 'relationships', 'health', 'creativity', 'learning', 'adventure', 'growth']
    .map((id) => [id, { score: v, signal: '' }])
);
const BECOMING = (momentum) => ({ momentum, score: 50, trend: 'steady', facets: [] });

const evalWith = (over = {}, history = {}, momentum = 0, scores = SCORES(0)) =>
  evaluateMilestones({ snapshot: SNAP(over), history, becoming: BECOMING(momentum), scores });

const byId = (list, id) => list.find((m) => m.id === id);

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 6, 1, 12, 0, 0)); });
afterEach(() => { vi.useRealTimers(); });

describe('evaluateMilestones', () => {
  it('nothing unlocks on truly empty evidence', () => {
    const list = evalWith();
    expect(list.some((m) => m.done)).toBe(false);
    expect(list).toHaveLength(13);
  });

  it('The Consistent needs a 7-day streak ending today', () => {
    const history = {};
    for (let i = 0; i < 7; i++) history[key(i)] = { score: 1 };
    expect(byId(evalWith({}, history), 'consistent').done).toBe(true);
    // a broken streak (gap yesterday) does not qualify
    delete history[key(1)];
    expect(byId(evalWith({}, history), 'consistent').done).toBe(false);
  });

  it('The Disciplined needs action on a low-readiness (<55) day', () => {
    const history = { [key(1)]: { score: 2, readiness: 48, done: 1 } };
    expect(byId(evalWith({}, history), 'disciplined').done).toBe(true);
    const easy = { [key(1)]: { score: 2, readiness: 80, done: 1 } };
    expect(byId(evalWith({}, easy), 'disciplined').done).toBe(false);
  });

  it('The Athlete counts sessions with proportional progress', () => {
    expect(byId(evalWith({ sessions: Array(25).fill({}) }), 'athlete').done).toBe(true);
    const partial = byId(evalWith({ sessions: Array(20).fill({}) }), 'athlete');
    expect(partial.done).toBe(false);
    expect(partial.progress).toBe(80);
  });

  it('The Master and The Polymath read skill mastery breadth', () => {
    const one = { skills: { gymnastics: [{ status: 'done' }] } };
    expect(byId(evalWith(one), 'master').done).toBe(true);
    expect(byId(evalWith(one), 'polymath').done).toBe(false);
    const three = { skills: {
      gymnastics: [{ status: 'done' }], tricking: [{ status: 'done' }], parkour: [{ status: 'done' }],
    } };
    expect(byId(evalWith(three), 'polymath').done).toBe(true);
  });

  it('The Operator reads ONA scale', () => {
    expect(byId(evalWith({ ona: { stats: { members: 250 } } }), 'scaling').done).toBe(true);
    expect(byId(evalWith({ ona: { stats: { members: 125 } } }), 'scaling').progress).toBe(50);
  });

  it('The Reflective / The Intentional / The Centered / The Ascending', () => {
    expect(byId(evalWith({ journal: Array(20).fill({}) }), 'reflective').done).toBe(true);
    expect(byId(evalWith({ captures: Array(15).fill({ status: 'triaged' }) }), 'intentional').done).toBe(true);
    expect(byId(evalWith({}, {}, 0, SCORES(50)), 'centered').done).toBe(true);
    expect(byId(evalWith({}, {}, 70), 'ascending').done).toBe(true);
    expect(byId(evalWith({}, {}, 69), 'ascending').done).toBe(false);
  });

  it('progress is always clamped 0..100 and done implies 100', () => {
    const list = evalWith({ sessions: Array(500).fill({}) }, {}, 500);
    for (const m of list) {
      expect(m.progress).toBeGreaterThanOrEqual(0);
      expect(m.progress).toBeLessThanOrEqual(100);
      if (m.done) expect(m.progress).toBe(100);
    }
  });

  it('qualifyingMilestoneIds returns exactly the done ids', () => {
    const ids = qualifyingMilestoneIds({ snapshot: SNAP({ sessions: Array(25).fill({}) }), history: {}, becoming: BECOMING(0), scores: SCORES(0) });
    expect(ids).toContain('athlete');
    expect(ids).not.toContain('consistent');
  });
});

describe('quest math', () => {
  it('questProgress is done/total milestones, 0 when empty', () => {
    expect(questProgress({ milestones: [] })).toBe(0);
    expect(questProgress({})).toBe(0);
    expect(questProgress({ milestones: [{ done: true }, { done: true }, { done: false }, { done: false }] })).toBe(50);
  });

  it('nextMilestone is the first not-done', () => {
    const q = { milestones: [{ id: 1, done: true }, { id: 2, done: false }, { id: 3, done: false }] };
    expect(nextMilestone(q).id).toBe(2);
    expect(nextMilestone({ milestones: [{ done: true }] })).toBeNull();
  });

  it('alignmentScore is the rounded domain average', () => {
    expect(alignmentScore(SCORES(50))).toBe(50);
    expect(alignmentScore({ ...SCORES(0), athlete: { score: 80 } })).toBe(10);
  });
});
