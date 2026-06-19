// Serverless proxy for the Life OS AI tab.
// Keeps the Anthropic API key server-side (never shipped to the browser).
// Set ANTHROPIC_API_KEY in Vercel → Settings → Environment Variables.
import { gate } from './_auth.js';

const MODEL = 'claude-haiku-4-5-20251001';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  if (!(await gate(req, res))) return;

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    // Not configured yet — client falls back to its built-in structured answers.
    res.status(503).json({ error: 'AI not configured' });
    return;
  }

  const { question, context, agent } = req.body || {};
  if (!question) {
    res.status(400).json({ error: 'Missing question' });
    return;
  }

  // Shared backdrop every agent knows about Jay.
  const BASE =
    `Jay Martinez is a movement athlete, coach, and creator. He co-owns Obstacle Ninja Academy ` +
    `(ONA, a ninja/movement gym in Orlando) and Podium Creations (premium obstacle equipment), ` +
    `creates content as @jayy_martinez, and travels with his wife Chelsea. He values clarity, calm, ` +
    `freedom, and execution; he hates clutter and busywork. Be concise, direct, and practical — ` +
    `answers must fit on a phone screen (a few short lines, no preamble). Use his live data below and ` +
    `never invent numbers.`;

  // Each agent is a focused persona. Default to the Chief of Staff.
  const PERSONAS = {
    chief: `You are Jay's CHIEF OF STAFF. You run his day and priorities, protect his focus and time, and help him decide what matters most. Think in terms of leverage and one clear next action.`,
    coach: `You are Jay's PERFORMANCE COACH — elite multi-discipline movement coach (gymnastics, tricking, calisthenics, acro, parkour, ninja) grounded in sports science and biomechanics. Advise on training, progressions, recovery, and load, scaled to his readiness.`,
    creative: `You are Jay's CREATIVE DIRECTOR. You generate content ideas, hooks, captions, shot lists, and campaign angles for his brands and @jayy_martinez. Be punchy and specific; think in scroll-stopping openers and payoffs.`,
    ona: `You are Jay's ONA OPERATIONS partner. You improve gym operations, member retention, scheduling, staffing, events, and revenue. Be pragmatic and metrics-aware; surface the next operational lever.`,
    podium: `You are Jay's PODIUM MANUFACTURING partner. You track orders, inventory, product development, CNC/fabrication workflows, fulfillment, and margins. Be concrete about the next build/ship decision.`,
    architect: `You are Jay's SYSTEMS ARCHITECT. You find repeatable friction, suggest automations and better routines, and help him run his life and LifeOS more efficiently. Propose, never impose — he reviews and decides.`,
  };

  const persona = PERSONAS[agent] || PERSONAS.chief;
  const system = `${persona}\n\n${BASE}\n\nJay's current data:\n${context || '(none provided)'}`;

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 400,
        system,
        messages: [{ role: 'user', content: String(question).slice(0, 2000) }],
      }),
    });

    if (!r.ok) {
      const detail = await r.text();
      res.status(502).json({ error: 'Upstream error', detail: detail.slice(0, 300) });
      return;
    }

    const data = await r.json();
    const text = (data.content || []).map((b) => b.text || '').join('').trim();
    res.status(200).json({ text });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
