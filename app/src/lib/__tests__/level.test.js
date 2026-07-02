// Life Level — the monotonic meta-progression. Pins the XP credit values
// and the rising cost curve so "who you've become" can't silently reprice.
import { describe, it, expect } from 'vitest';
import { lifeLevel } from '../level.js';

const EMPTY = { sessions: [], skills: {}, captures: [] };

describe('lifeLevel', () => {
  it('starts at level 1 with 60 xp to the next level', () => {
    const l = lifeLevel(EMPTY);
    expect(l.level).toBe(1);
    expect(l.xp).toBe(0);
    expect(l.toNext).toBe(60);
    expect(l.pct).toBe(0);
  });

  it('credits committed days at 12 xp per score point (capped at 4)', () => {
    localStorage.setItem('lifeos:history', JSON.stringify({
      'a': { score: 4 }, 'b': { score: 1 }, 'c': { score: 9 }, // 9 caps to 4
    }));
    const l = lifeLevel(EMPTY);
    expect(l.xp).toBe(48 + 12 + 48);
  });

  it('crosses level 2 exactly at 60 xp', () => {
    localStorage.setItem('lifeos:history', JSON.stringify({
      a: { score: 1 }, b: { score: 1 }, c: { score: 1 }, d: { score: 1 }, e: { score: 1 },
    }));
    const l = lifeLevel(EMPTY); // 5 × 12 = 60
    expect(l.xp).toBe(60);
    expect(l.level).toBe(2);
    expect(l.pct).toBe(0);
  });

  it('credits sessions ×25, mastery ×130, active skills ×18, triaged captures ×6', () => {
    const l = lifeLevel({
      sessions: [{}, {}],
      skills: { gym: [{ status: 'done' }, { status: 'active' }, { status: 'locked' }] },
      captures: [{ status: 'triaged' }, { status: 'inbox' }],
    });
    expect(l.xp).toBe(2 * 25 + 130 + 18 + 6); // 204
    expect(l.level).toBe(3); // need(3) = round(60·2^1.6) = 182 ≤ 204 < need(4)=348
  });

  it('never reports pct outside 0..100', () => {
    const l = lifeLevel({ ...EMPTY, sessions: Array.from({ length: 40 }, () => ({})) });
    expect(l.pct).toBeGreaterThanOrEqual(0);
    expect(l.pct).toBeLessThanOrEqual(100);
  });
});
