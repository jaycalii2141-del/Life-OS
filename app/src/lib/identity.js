// ─────────────────────────────────────────────────────────
// Identity digest — structured, deterministic memory of who Jay is
// becoming, assembled from real app state (not a lossy LLM re-summary).
//
// Injected into the AI's context on every surface so the Presence is
// consistently aware of the identity model: the Becoming index + trend,
// the Life Level, the strongest and most-neglected domains, and the full
// domain-score picture. This is the Phase-2 "structured memory" upgrade.
// ─────────────────────────────────────────────────────────
import { snapshot } from './mission.js';
import { domainScores } from './quests.js';
import { becomingIndex } from './becoming.js';
import { lifeLevel } from './level.js';

export function identityDigest(s = snapshot()) {
  try {
    const scores = domainScores(s);
    const b = becomingIndex({ snapshot: s, scores });
    const lvl = lifeLevel(s);
    const domainLine = Object.entries(scores).map(([k, v]) => `${k} ${v.score}`).join(', ');
    return [
      'WHO JAY IS BECOMING (identity model — weave this into your thinking, don\'t recite it):',
      `Becoming index ${b.score}/100, ${b.trend}. Life Level ${lvl.level} (${lvl.pct}% to next).`,
      `Strongest domain: ${b.top?.id || '—'}. Most neglected: ${b.focus?.id || '—'} — nudge it when it fits naturally.`,
      `Domain scores: ${domainLine}.`,
    ].join('\n');
  } catch {
    return '';
  }
}
