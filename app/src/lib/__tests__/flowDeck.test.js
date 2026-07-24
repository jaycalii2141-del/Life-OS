import { describe, expect, it } from 'vitest';
import { formatClock, recommendedMode } from '../../components/FlowDeck.jsx';

describe('FlowDeck recommendation', () => {
  it('protects recovery when readiness is low', () => {
    expect(recommendedMode({ kind: 'train' }, 45)).toBe('restore');
  });

  it('maps the next mission to the right life mode', () => {
    expect(recommendedMode({ kind: 'train' }, 78)).toBe('move');
    expect(recommendedMode({ kind: 'build' }, 78)).toBe('build');
    expect(recommendedMode({ kind: 'ritual' }, 78)).toBe('restore');
    expect(recommendedMode({ kind: 'focus' }, 78)).toBe('focus');
  });
});

describe('FlowCapsule clock', () => {
  it('renders a stable tabular countdown label', () => {
    expect(formatClock(2700)).toBe('45:00');
    expect(formatClock(61)).toBe('01:01');
    expect(formatClock(0)).toBe('00:00');
  });
});
