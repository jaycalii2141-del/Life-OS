// Serverless proxy for the Life OS AI tab.
// Keeps the Anthropic API key server-side (never shipped to the browser).
// Set ANTHROPIC_API_KEY in Vercel → Settings → Environment Variables.
const MODEL = 'claude-haiku-4-5-20251001';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    // Not configured yet — client falls back to its built-in structured answers.
    res.status(503).json({ error: 'AI not configured' });
    return;
  }

  const { question, context } = req.body || {};
  if (!question) {
    res.status(400).json({ error: 'Missing question' });
    return;
  }

  const system =
    `You are the AI assistant inside Jay Martinez's "Life OS" app. Jay is a movement athlete, ` +
    `coach, and creator who runs Obstacle Ninja Academy (ONA) in Orlando and six content brands ` +
    `(JayMuvs, Motion Mob, ONA Elite, JK Acro, Acro Wooks, PPP). Be concise, direct, practical, ` +
    `and motivating — answers must fit on a phone screen (a few short lines, no preamble). Use ` +
    `Jay's live data below to be specific, and never invent numbers. Tagline: "Move with purpose."\n\n` +
    `Jay's current data:\n${context || '(none provided)'}`;

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
