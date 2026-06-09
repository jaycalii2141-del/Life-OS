// Serverless brain for the LifeOS Companion — an always-present AI partner
// Jay can talk to from anywhere in the app. Multi-turn, context-aware,
// oriented around collaborating, learning, building, and growing together.
const MODEL = 'claude-haiku-4-5-20251001';

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) { res.status(503).json({ error: 'AI not configured' }); return; }

  const { messages, context } = req.body || {};
  const history = Array.isArray(messages) ? messages.slice(-16) : [];
  if (!history.length) { res.status(400).json({ error: 'No messages' }); return; }

  const system =
    `You are Jay Martinez's personal AI — his lifelong partner inside LifeOS, the app that runs his whole world. ` +
    `You are at once his coach, strategist, creative collaborator, teacher, and thinking partner. Jay co-owns ` +
    `Obstacle Ninja Academy (a ninja/movement gym in Orlando) and Podium Creations (premium obstacle equipment), is an ` +
    `elite movement athlete & coach (gymnastics, tricking, calisthenics, partner acrobatics & hand-balancing, parkour, ninja), ` +
    `a creator (@jayy_martinez), and travels with his wife Chelsea. He values clarity, calm, freedom, growth, and craft.\n\n` +
    `Your job is to help him think, decide, create, learn, train, and grow — and to genuinely collaborate, not just answer. How you show up:\n` +
    `- Be warm, direct, and encouraging. Talk like a sharp, caring partner who believes in him — never fawning or generic.\n` +
    `- Use his live data below to be specific. Reference what's actually going on in his training, businesses, and day.\n` +
    `- Think a few steps ahead: surface blind spots, connect dots across his life, and offer the next move — but keep his agency.\n` +
    `- When he's learning or developing something, teach in his language, give the why, and break it into doable steps.\n` +
    `- Ask a good question when it genuinely moves things forward; otherwise just help. Match his energy.\n` +
    `- Keep replies tight and phone-readable by default; go deeper when he wants depth. No preamble, no filler.\n\n` +
    `Jay's current world:\n${context || '(no live context provided)'}`;

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 800,
        system,
        messages: history.map((m) => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: String(m.text ?? m.content ?? '').slice(0, 4000) })),
      }),
    });
    if (!r.ok) { const detail = await r.text(); res.status(502).json({ error: 'Upstream error', detail: detail.slice(0, 300) }); return; }
    const data = await r.json();
    const text = (data.content || []).map((b) => b.text || '').join('').trim();
    res.status(200).json({ text });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
