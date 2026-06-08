// Serverless AI coach — designs today's training session from Jay's skill
// tree, recent sessions, and readiness. Falls back to the client's local
// builder when no API key is set.
const MODEL = 'claude-haiku-4-5-20251001';

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) { res.status(503).json({ error: 'AI not configured' }); return; }

  const { context } = req.body || {};

  const system =
    `You are an elite movement coach and program designer. You blend the expertise of the best coaches and ` +
    `athletes in the world across artistic gymnastics, tricking, calisthenics/street workout, partner acrobatics, ` +
    `parkour/freerunning, ninja warrior, dance, and martial arts — plus sports science, biomechanics, motor learning, ` +
    `and periodization. You design safe, specific, progression-correct training sessions.\n\n` +
    `You are programming TODAY'S session for Jay Martinez — a professional movement athlete and coach. Use the data below. Rules:\n` +
    `- Prioritize his ACTIVE skills and the immediate next progression. Respect prerequisites; never skip tiers.\n` +
    `- Scale intensity to his readiness (low readiness = more technique/quality and prep, less max effort & impact).\n` +
    `- Vary stimulus vs. his recent sessions (avoid overloading the same tissue/discipline two days running).\n` +
    `- Structure the session clearly: PREP / WARM-UP, PRIMARY SKILL WORK (name the skill, the key cue, concrete sets×reps or quality targets, and the next progression to attempt), STRENGTH & CONDITIONING that supports those skills, then COOL-DOWN / MOBILITY.\n` +
    `- Be specific, expert, and actionable. Keep it tight enough to read on a phone — short labeled sections and short lines, no filler or preamble. Start directly with the session.\n\n` +
    `Jay's training data:\n${context || '(none provided)'}`;

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 900,
        system,
        messages: [{ role: 'user', content: 'Build my training session for today.' }],
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
