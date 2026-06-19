// ─────────────────────────────────────────────────────────
// Shared inline-AI helpers for contextual object actions.
// Used by the long-press ObjectMenu on Command, Move, and Build so every
// "interactive object" talks to the same live model the same way.
// ─────────────────────────────────────────────────────────
import { aiFetch } from './api.js';

// Freeform ask → returns the model's text (throws on failure so the
// ObjectMenu can show its graceful "try again" state).
export async function askCompanion(prompt, context = '') {
  const r = await aiFetch('/api/companion', { messages: [{ role: 'user', text: prompt }], context, mode: 'partner' });
  if (!r.ok) throw new Error('ai');
  const d = await r.json();
  return d.text || '';
}

// Goal → a sequenced, numbered progression as display text.
export async function decomposeText(title, domain) {
  const r = await aiFetch('/api/decompose', { goal: title, domain: domain || 'growth', context: '' });
  if (!r.ok) throw new Error('ai');
  const d = await r.json();
  const ms = Array.isArray(d.milestones) ? d.milestones : [];
  return (d.why ? d.why + '\n\n' : '') + ms.map((m, i) => `${i + 1}. ${m}`).join('\n');
}
