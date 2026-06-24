// ─────────────────────────────────────────────────────────
// Cross-domain insight — the strategic-thinking beat of the Presence.
//
// Reads the recorded per-domain facet history (lifeos:self-history, which
// now stores all eight facet scores per day) and surfaces ONE pattern no
// single screen shows: a trade-off, a sharp slip, or a real climb across
// domains. "Business is climbing while Relationships slipped — watch the
// trade-off." Deterministic so it's instant and always true to the data.
// ─────────────────────────────────────────────────────────
const DOMAIN_NAMES = {
  athlete: 'Athletics', business: 'Business', relationships: 'Relationships',
  health: 'Health', creativity: 'Creativity', learning: 'Learning',
  adventure: 'Adventure', growth: 'Growth',
};
const nameOf = (id) => DOMAIN_NAMES[id] || id;
const avg = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);

export function crossDomainInsight(selfHistory = {}) {
  const frames = Object.keys(selfHistory).sort()
    .map((k) => selfHistory[k])
    .filter((f) => f && Array.isArray(f.facets) && f.facets.length);
  if (frames.length < 6) return null; // need enough history to mean anything

  const domains = frames[frames.length - 1].facets.map((f) => f.id);
  const window = (id) => frames.map((f) => f.facets.find((z) => z.id === id)?.score).filter((v) => v != null);

  // Recent vs the stretch just before it — a short-term trajectory per domain.
  const n = Math.min(3, Math.floor(frames.length / 2));
  const deltas = domains.map((id) => {
    const s = window(id);
    if (s.length < n * 2) return { id, delta: 0 };
    const recent = avg(s.slice(-n));
    const prior = avg(s.slice(-n * 2, -n));
    return { id, delta: Math.round(recent - prior) };
  });

  const drop = [...deltas].sort((a, b) => a.delta - b.delta)[0];   // most negative
  const rise = [...deltas].sort((a, b) => b.delta - a.delta)[0];   // most positive

  // 1. A trade-off — one climbing while another slips. The richest signal.
  if (drop && rise && drop.id !== rise.id && drop.delta <= -8 && rise.delta >= 8) {
    return {
      kind: 'tradeoff',
      domainId: drop.id,
      text: `${nameOf(rise.id)} is climbing while ${nameOf(drop.id)} slipped ${Math.abs(drop.delta)} pts this week — watch the trade-off.`,
      seed: `My ${nameOf(rise.id)} is rising but ${nameOf(drop.id)} is slipping. How do I protect ${nameOf(drop.id)} without losing the ${nameOf(rise.id)} momentum?`,
    };
  }
  // 2. A sharp, isolated slip — name it before it compounds.
  if (drop && drop.delta <= -10) {
    return {
      kind: 'drop',
      domainId: drop.id,
      text: `${nameOf(drop.id)} dropped ${Math.abs(drop.delta)} pts over the last few days — it's quietly asking for attention.`,
      seed: `What's the single highest-leverage move this week to steady my ${nameOf(drop.id)}?`,
    };
  }
  // 3. A genuine climb — affirm it and protect the momentum.
  if (rise && rise.delta >= 12) {
    return {
      kind: 'rise',
      domainId: rise.id,
      text: `${nameOf(rise.id)} is on a real climb — up ${rise.delta} pts this week. Keep feeding it.`,
      seed: `My ${nameOf(rise.id)} is climbing fast. What keeps this momentum compounding?`,
    };
  }
  return null;
}
