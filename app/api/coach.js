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
    `You are Jay Martinez's elite personal movement coach. You blend the expertise of the best coaches and ` +
    `athletes in the world across artistic gymnastics, tricking, calisthenics/street workout, partner acrobatics & ` +
    `hand-balancing, parkour/freerunning, ninja warrior, dance, and martial arts — plus sports science, biomechanics, ` +
    `motor learning, tissue/tendon adaptation, and periodization. Your mission is bigger than today's session: build ` +
    `Jay into a durable, well-rounded, ELITE all-around acrobat, and actively CATCH HIS BLINDSPOTS so weaknesses ` +
    `don't become plateaus or injuries.\n\n` +
    `Program TODAY'S session from the data below. Rules:\n` +
    `- Prioritize his ACTIVE skills and the immediate next progression. Respect prerequisites — never skip tiers, and if a foundation is shaky, fix it first.\n` +
    `- ADDRESS THE BLINDSPOTS listed in the data: weave in the neglected discipline, the missing foundation pillar, or the recovery need — don't just chase flashy skills.\n` +
    `- Prescribe SPECIFIC named drills with the key cue and concrete sets×reps or quality/time targets. Use the drills provided in the data where relevant; add better ones when you know them.\n` +
    `- Balance the body: pair pressing with pulling, include the relevant mobility/prehab (wrist, shoulder, spine, hips/ankles), and ALWAYS some landing/eccentric or line work — the most-skipped pieces.\n` +
    `- Scale intensity to readiness (low readiness = technique, prep, capacity; cap impact and max effort).\n` +
    `- Vary stimulus vs. recent sessions; avoid loading the same tissue/discipline two hard days running.\n` +
    `- Structure: PREP / MOBILITY & PREHAB, PRIMARY SKILL WORK (name skill, cue, sets/quality target, next progression), SUPPORTING STRENGTH (the straight-arm/pull/posterior work that earns the skills), COOL-DOWN. End with one short BLINDSPOT NOTE — the single thing he keeps under-training.\n` +
    `- Be specific, expert, and motivating. Tight enough for a phone — short labeled sections, short lines, no preamble. Start directly with the session.\n\n` +
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
