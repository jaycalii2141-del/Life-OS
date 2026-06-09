// ─────────────────────────────────────────────────────────
// Haptics — subtle tactile feedback that makes the PWA feel native.
// Uses the Vibration API (Android/Chrome); a no-op where unsupported
// (e.g. iOS Safari), so it's always safe to call.
// ─────────────────────────────────────────────────────────
export function haptic(ms = 8) {
  try { if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(ms); } catch { /* */ }
}

// A richer "success" pattern for reward moments (mastered a skill, logged
// a session, captured a thought). Safe no-op where unsupported.
export function celebrate() {
  try { if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([14, 40, 24]); } catch { /* */ }
}

// Light tap feedback on every interactive `.pressable` element, installed
// once globally so we don't have to wire each handler.
export function installGlobalHaptics() {
  if (typeof window === 'undefined' || !('vibrate' in navigator)) return;
  let last = 0;
  window.addEventListener('pointerdown', (e) => {
    const el = e.target && e.target.closest && e.target.closest('.pressable');
    if (!el) return;
    const now = Date.now();
    if (now - last < 40) return; // debounce rapid double-fires
    last = now;
    try { navigator.vibrate(7); } catch { /* */ }
  }, { passive: true });
}
