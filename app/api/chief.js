// ─────────────────────────────────────────────────────────
// Serverless Chief of Staff — two modes:
//   mode:'brief'  → today's priorities + the single highest-leverage action
//   mode:'review' → an honest weekly reflection
// Falls back to the client's local logic when no API key is set.
// ─────────────────────────────────────────────────────────
const MODEL = 'claude-haiku-4-5-20251001';

const SYSTEMS = {
  brief:
    `You are Jay Martinez's Chief of Staff. Jay co-owns Obstacle Ninja Academy (a ninja/movement gym) and Podium Creations ` +
    `(premium obstacle equipment), is an elite movement athlete and coach, and travels with his wife Chelsea. He values ` +
    `clarity, calm, and freedom, and hates clutter and busywork.\n\n` +
    `Using the data below, write a tight morning brief he can read in under a minute. Rules:\n` +
    `- Open with one warm, grounded sentence about today (no fluff, no clichés).\n` +
    `- Name what genuinely needs attention given his calendar, readiness, and open loops.\n` +
    `- End with ONE highest-leverage action — the single thing that, if done, makes today a win. Make it concrete.\n` +
    `- Be brief and specific. Short lines, no preamble, no headers like "Morning Brief". Speak directly to Jay.\n\n` +
    `After the brief, on a new line output the exact marker ACTIONS_JSON: followed by a compact JSON array (max 3) of concrete actions Jay could take in one tap. Each item: ` +
    `{"type":"event"|"email"|"note","label":"<short button text>", and for event: "title","time"(HH:MM 24h),"durationMin"; for email: "to"(if known else ""),"subject","body"; for note: "text","domain"(one of ona,podium,movement,social,wife,self)}. ` +
    `Only propose actions that clearly follow from the data (e.g. block prep time before a coaching session, draft a follow-up). If none are warranted, output ACTIONS_JSON: []`,
  review:
    `You are Jay Martinez's Chief of Staff doing his weekly review. Jay co-owns Obstacle Ninja Academy and Podium Creations, ` +
    `trains as an elite movement athlete, and protects time with his wife Chelsea. He wants honest reflection, not cheerleading.\n\n` +
    `Using the week's data below, write a short, honest reflection. Rules:\n` +
    `- Note what went well and what slipped, plainly.\n` +
    `- Call out attention imbalance across his domains (ONA, Podium, Movement, social, wife, self) if you see it — gently but truthfully.\n` +
    `- Surface one blind spot or pattern worth his attention.\n` +
    `- Suggest one focus for next week. Keep it to a few short lines, no headers, speak directly to Jay.`,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) { res.status(503).json({ error: 'AI not configured' }); return; }

  const { mode = 'brief', context } = req.body || {};
  const system = (SYSTEMS[mode] || SYSTEMS.brief) + `\n\nData:\n${context || '(none provided)'}`;
  const ask = mode === 'review' ? 'Give me my weekly reflection.' : 'Give me my brief for today.';

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: MODEL, max_tokens: 600, system, messages: [{ role: 'user', content: ask }] }),
    });
    if (!r.ok) { const detail = await r.text(); res.status(502).json({ error: 'Upstream error', detail: detail.slice(0, 300) }); return; }
    const data = await r.json();
    const raw = (data.content || []).map((b) => b.text || '').join('').trim();
    // Split the brief prose from the optional ACTIONS_JSON marker.
    let text = raw, actions = [];
    const mi = raw.indexOf('ACTIONS_JSON:');
    if (mi !== -1) {
      text = raw.slice(0, mi).trim();
      try { const parsed = JSON.parse(raw.slice(mi + 'ACTIONS_JSON:'.length).trim()); if (Array.isArray(parsed)) actions = parsed.slice(0, 3); } catch { /* ignore */ }
    }
    res.status(200).json({ text, actions });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
