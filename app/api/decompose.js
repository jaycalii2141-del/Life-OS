// Goal decomposition — name a goal, get back a clear, sequenced progression
// of milestones. The AI thinks like Jay's coach/strategist; the client has a
// deterministic fallback so it's useful before the key is set.
import { gate } from './_auth.js';

const MODEL = 'claude-haiku-4-5-20251001';

function extractJSON(text) {
  if (!text) return null;
  let t = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  const a = t.indexOf('{'), b = t.lastIndexOf('}');
  if (a === -1 || b === -1) return null;
  try { return JSON.parse(t.slice(a, b + 1)); } catch { return null; }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }
  if (!(await gate(req, res))) return;
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) { res.status(503).json({ error: 'AI not configured' }); return; }

  const { goal, domain, context } = req.body || {};
  if (!goal) { res.status(400).json({ error: 'Missing goal' }); return; }

  const system =
    `You are Jay Martinez's elite coach and strategist. Jay is a movement athlete & coach who co-owns Obstacle Ninja ` +
    `Academy (a ninja gym) and Podium Creations (obstacle equipment), creates content as @jayy_martinez, and is married to ` +
    `Chelsea. He trains gymnastics, tricking, calisthenics, partner acrobatics & hand-balancing, parkour, and ninja.\n\n` +
    `Break the goal below into a CLEAR, SEQUENCED progression: 3–6 concrete, checkable milestones in the order he should ` +
    `tackle them — each a real outcome (not vague advice), each building on the last, the last one BEING the goal achieved. ` +
    `Think like a world-class coach who has taken people to this exact outcome. Domain: ${domain || 'general'}.\n\n` +
    `Respond with STRICT JSON only, no prose, no code fence:\n` +
    `{"title":"<a crisp version of the goal>","why":"<one short motivating line on why this matters>","milestones":["<m1>","<m2>","<m3>", "..."]}`;

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: MODEL, max_tokens: 700, system,
        messages: [{ role: 'user', content: `Goal: ${String(goal).slice(0, 500)}\n${context ? `Context: ${String(context).slice(0, 1200)}` : ''}` }],
      }),
    });
    if (!r.ok) { const detail = await r.text(); res.status(502).json({ error: 'Upstream error', detail: detail.slice(0, 300) }); return; }
    const data = await r.json();
    const text = (data.content || []).map((b) => b.text || '').join('');
    const parsed = extractJSON(text);
    if (!parsed || !Array.isArray(parsed.milestones)) { res.status(502).json({ error: 'Bad shape', raw: text.slice(0, 200) }); return; }
    res.status(200).json({
      title: String(parsed.title || goal).slice(0, 120),
      why: String(parsed.why || '').slice(0, 200),
      milestones: parsed.milestones.map((m) => String(m).slice(0, 160)).slice(0, 6),
    });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
