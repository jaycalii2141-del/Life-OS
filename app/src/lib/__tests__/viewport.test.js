import { describe, expect, it } from 'vitest';
import { resolveAppHeight } from '../viewport.js';

describe('resolveAppHeight', () => {
  it('keeps an installed portrait PWA at physical screen height after a keyboard shrink', () => {
    expect(resolveAppHeight({
      standalone: true,
      portrait: true,
      screenWidth: 402,
      screenHeight: 874,
      innerHeight: 706,
      clientHeight: 706,
    })).toBe(874);
  });

  it('uses the short physical side for an installed landscape PWA', () => {
    expect(resolveAppHeight({
      standalone: true,
      portrait: false,
      screenWidth: 402,
      screenHeight: 874,
      innerHeight: 380,
      clientHeight: 380,
    })).toBe(402);
  });

  it('respects the layout viewport in a regular browser tab', () => {
    expect(resolveAppHeight({
      standalone: false,
      portrait: true,
      screenWidth: 402,
      screenHeight: 874,
      innerHeight: 720,
      clientHeight: 720,
    })).toBe(720);
  });
});
