// ─────────────────────────────────────────────────────────
// The Presence — ambient, proactive intelligence.
//
// Surfaces ONE unasked observation on Command, derived deterministically
// from the identity model (so it's instant and always works). Tapping it
// opens the Companion to go deeper. This is the first proactive-AI beat
// from the redesign's ambient-intelligence layer: the app reaches out
// instead of waiting to be asked.
// ─────────────────────────────────────────────────────────
import { questProgress } from './quests.js';

const DOMAIN_NAMES = {
  athlete: 'Athletics', business: 'Business', relationships: 'Relationships',
  health: 'Health', creativity: 'Creativity', learning: 'Learning',
  adventure: 'Adventure', growth: 'Growth',
};

export function proactiveInsight({ oneThing, allDone, becoming, quests = [] } = {}) {
  // 1. The day's keystone isn't set yet — highest priority.
  if (!oneThing && !allDone) {
    return { text: "You haven't named your one thing yet — that's where the day lives or dies.", seed: 'Help me choose my one thing for today.' };
  }
  // 2. A genuinely neglected domain.
  if (becoming?.focus && becoming.focus.score < 45) {
    const name = DOMAIN_NAMES[becoming.focus.id] || becoming.focus.id;
    return { text: `${name} is your most neglected domain right now. One deliberate move this week moves it.`, seed: `What's the single highest-leverage move this week to raise my ${name.toLowerCase()} domain?` };
  }
  // 3. A stalling campaign.
  const active = (quests || []).filter((q) => questProgress(q) < 100);
  const stalling = active.sort((a, b) => questProgress(a) - questProgress(b))[0];
  if (stalling && questProgress(stalling) < 25) {
    return { text: `"${stalling.title}" hasn't moved much lately — one milestone restarts the momentum.`, seed: `What's the next concrete step on "${stalling.title}"?` };
  }
  // 4. Rising — affirm and protect.
  if (becoming?.trend === 'rising') {
    return { text: "You're trending up — your momentum is compounding. Protect the streak today.", seed: 'What should I focus on to keep my momentum compounding?' };
  }
  // 5. Steady default.
  return { text: 'Everything that matters is in view. Pick the one move that makes today count.', seed: 'What single move makes today count most?' };
}
