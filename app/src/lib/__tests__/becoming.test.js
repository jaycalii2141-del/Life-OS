// The Becoming Index — the "one true number". These tests pin the composite
// math (identity 50% · momentum 35% · action 15%) and the trend thresholds
// so refactors can't silently change what the number means.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { becomingIndex, becomingLine } from '../becoming.js';

const key = (n) => {
  const d = new Date(); d.setDate(d.getDate() - n);
  const p = (x) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

const SCORES = (v) => Object.fromEntries(
  ['athlete', 'business', 'relationships', 'health', 'creativity', 'learning', 'adventure', 'growth']
    .map((id) => [id, { score: v, signal: '' }])
);

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 6, 1, 12, 0, 0)); });
afterEach(() => { vi.useRealTimers(); });

describe('becomingIndex', () => {
  it('composes identity 50% + momentum 35% + action 15%', () => {
    // No history → momentum defaults 50; action falls back to readiness.
    const b = becomingIndex({ snapshot: { readiness: 80 }, history: {}, scores: SCORES(60) });
    expect(b.identity).toBe(60);
    expect(b.momentum).toBe(50);
    // 60*0.5 + 50*0.35 + 80*0.15 = 30 + 17.5 + 12 = 59.5 → 60
    expect(b.score).toBe(60);
  });

  it('reads momentum and action from real history (score 0..4 → 0..100)', () => {
    const history = {};
    for (let i = 0; i < 7; i++) history[key(i)] = { score: 4 };
    const b = becomingIndex({ snapshot: { readiness: 10 }, history, scores: SCORES(40) });
    expect(b.momentum).toBe(100);
    // today present in history → action = 100, readiness ignored
    // 40*0.5 + 100*0.35 + 100*0.15 = 20 + 35 + 15 = 70
    expect(b.score).toBe(70);
  });

  it('trend rises when the recent window beats the prior window', () => {
    const history = {};
    for (let i = 0; i < 3; i++) history[key(i)] = { score: 4 };
    for (let i = 3; i < 10; i++) history[key(i)] = { score: 0 };
    const b = becomingIndex({ snapshot: {}, history, scores: SCORES(50) });
    expect(b.delta).toBe(100);
    expect(b.trend).toBe('rising');
  });

  it('trend dips when the recent window falls', () => {
    const history = {};
    for (let i = 0; i < 3; i++) history[key(i)] = { score: 0 };
    for (let i = 3; i < 10; i++) history[key(i)] = { score: 4 };
    const b = becomingIndex({ snapshot: {}, history, scores: SCORES(50) });
    expect(b.delta).toBe(-100);
    expect(b.trend).toBe('dipping');
  });

  it('is steady inside the ±4 dead zone', () => {
    const history = {};
    for (let i = 0; i < 10; i++) history[key(i)] = { score: 2 };
    const b = becomingIndex({ snapshot: {}, history, scores: SCORES(50) });
    expect(b.delta).toBe(0);
    expect(b.trend).toBe('steady');
  });

  it('surfaces the strongest facet as top and the weakest as focus', () => {
    const scores = { ...SCORES(50), athlete: { score: 95, signal: '' }, learning: { score: 5, signal: '' } };
    const b = becomingIndex({ snapshot: {}, history: {}, scores });
    expect(b.top.id).toBe('athlete');
    expect(b.focus.id).toBe('learning');
    expect(becomingLine(b)).toContain('an elite athlete');
  });

  it('facets are clamped into 0..100 in the score', () => {
    const b = becomingIndex({ snapshot: { readiness: 0 }, history: {}, scores: SCORES(100) });
    expect(b.identity).toBe(100);
    expect(b.score).toBeLessThanOrEqual(100);
  });
});
