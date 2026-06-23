// ─────────────────────────────────────────────────────────
// Ceremonies — the rare, earned, cinematic moments (mastering a skill,
// crossing an identity threshold). Fire an event; CeremonyLayer stages it.
// ─────────────────────────────────────────────────────────
export function fireCeremony(detail) {
  try { window.dispatchEvent(new CustomEvent('jamhq:ceremony', { detail })); } catch { /* no-op */ }
}
