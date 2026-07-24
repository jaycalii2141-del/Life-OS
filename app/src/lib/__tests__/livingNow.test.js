import { describe, expect, it } from 'vitest';
import { experienceHeadline, recommendedRealm } from '../../screens/LivingNow.jsx';

describe('living experience direction', () => {
  it('softens the day when readiness is low', () => {
    expect(experienceHeadline(35)).toEqual(['Today wants softness', 'before speed.']);
  });

  it('routes mission kinds into experiential realms', () => {
    expect(recommendedRealm({ kind: 'train' })).toBe('move');
    expect(recommendedRealm({ kind: 'build' })).toBe('build');
    expect(recommendedRealm({ kind: 'ritual' })).toBe('belong');
  });
});
