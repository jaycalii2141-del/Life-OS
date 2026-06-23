// ─────────────────────────────────────────────────────────
// XP feedback — fires a "+N XP" reward float when you earn toward your
// Life Level. The float is celebratory feedback; the actual Life Level is
// always recomputed from cumulative state (lib/level.js), so this never
// drifts from the real number — the amounts just mirror what that engine
// credits (mission ~12, milestone ~15, session 25, mastery 130).
// ─────────────────────────────────────────────────────────
export function awardXp(amount, label) {
  try {
    window.dispatchEvent(new CustomEvent('jamhq:xp', {
      detail: { amount, label, id: `${Date.now()}-${Math.random()}` },
    }));
  } catch { /* SSR / unsupported — no-op */ }
}
