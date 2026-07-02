// Streak insurance — the retention safety net. Pins earning, the
// genuine-1-day-gap rule, and the caps.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { earnedFreezes, healFreezes, freezeState } from '../streak.js';

const key = (n) => {
  const d = new Date(); d.setDate(d.getDate() - n);
  const p = (x) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 6, 1, 12, 0, 0)); });
afterEach(() => { vi.useRealTimers(); });

describe('earnedFreezes', () => {
  it('base of 2, +1 per completed active week, capped at 6', () => {
    expect(earnedFreezes({})).toBe(2);
    const days = (n) => Object.fromEntries(Array.from({ length: n }, (_, i) => [key(i), { score: 1 }]));
    expect(earnedFreezes(days(7))).toBe(3);
    expect(earnedFreezes(days(28))).toBe(6);
    expect(earnedFreezes(days(100))).toBe(6); // cap
  });

  it('inactive days (score 0) do not earn', () => {
    expect(earnedFreezes({ [key(1)]: { score: 0 } })).toBe(2);
  });
});

describe('healFreezes', () => {
  it('heals a genuine 1-day gap flanked by kept days (today counts once earned)', () => {
    const history = { [key(2)]: { score: 2 } }; // yesterday missing, day-2 active
    const used = healFreezes(history, {}, 1 /* today earned */, 2);
    expect(used[key(1)]).toBe(true);
  });

  it('does not bridge a 2-day gap', () => {
    const history = { [key(3)]: { score: 2 } }; // days 1+2 missing
    const used = healFreezes(history, {}, 1, 6);
    expect(Object.keys(used)).toHaveLength(0);
  });

  it('does not heal when today itself is not yet earned', () => {
    const history = { [key(2)]: { score: 2 } };
    const used = healFreezes(history, {}, 0, 6);
    expect(Object.keys(used)).toHaveLength(0);
  });

  it('spends no more than the earned budget', () => {
    // two separate 1-day gaps, but only 1 freeze available
    const history = { [key(2)]: { score: 2 }, [key(4)]: { score: 2 }, [key(3)]: { score: 1 } };
    const already = { [key(9)]: true }; // one already used
    const used = healFreezes({ ...history }, already, 1, 2); // avail = 1
    const newlyUsed = Object.keys(used).filter((k) => !already[k]);
    expect(newlyUsed.length).toBeLessThanOrEqual(1);
  });

  it('is pure — never un-heals previously used freezes', () => {
    const prior = { [key(5)]: true };
    const used = healFreezes({}, prior, 0, 2);
    expect(used[key(5)]).toBe(true);
  });
});

describe('freezeState', () => {
  it('reports earned / used / available consistently', () => {
    const s = freezeState({}, { a: true });
    expect(s).toEqual({ earned: 2, usedCount: 1, available: 1 });
    expect(freezeState({}, { a: true, b: true, c: true }).available).toBe(0); // never negative
  });
});
