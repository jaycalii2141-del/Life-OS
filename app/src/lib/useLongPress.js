// ─────────────────────────────────────────────────────────
// useLongPress — turns any element into an interactive object.
//   tap        → onTap         (primary action)
//   long-press → onLongPress   (reveal contextual actions) + haptic
//   scroll/drag → neither      (movement past tolerance cancels both)
//
// Spread the returned handlers onto the element. Don't also give it an
// onClick for the same action — onTap replaces it (avoids double-firing).
// ─────────────────────────────────────────────────────────
import { useRef, useCallback } from 'react';

export function useLongPress(onLongPress, onTap, { delay = 440, moveTolerance = 10 } = {}) {
  const timer = useRef(null);
  const longFired = useRef(false);
  const moved = useRef(false);
  const start = useRef({ x: 0, y: 0 });

  const clearTimer = () => { if (timer.current) { clearTimeout(timer.current); timer.current = null; } };

  const onPointerDown = useCallback((e) => {
    longFired.current = false;
    moved.current = false;
    start.current = { x: e.clientX, y: e.clientY };
    clearTimer();
    timer.current = setTimeout(() => {
      longFired.current = true;
      try { navigator.vibrate?.(12); } catch { /* unsupported */ }
      onLongPress?.(e);
    }, delay);
  }, [onLongPress, delay]);

  const onPointerMove = useCallback((e) => {
    const dx = Math.abs(e.clientX - start.current.x);
    const dy = Math.abs(e.clientY - start.current.y);
    if (dx > moveTolerance || dy > moveTolerance) { moved.current = true; clearTimer(); }
  }, [moveTolerance]);

  const onPointerUp = useCallback((e) => {
    clearTimer();
    if (!longFired.current && !moved.current) onTap?.(e);
  }, [onTap]);

  const onPointerLeave = useCallback(() => clearTimer(), []);
  const onPointerCancel = useCallback(() => clearTimer(), []);

  return { onPointerDown, onPointerMove, onPointerUp, onPointerLeave, onPointerCancel };
}
