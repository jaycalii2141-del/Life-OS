// Goal decomposition — name a goal, get back a clear, sequenced progression
// of milestones. The AI thinks like Jay's coach/strategist; the client has a
// deterministic fallback so it's useful before the key is set.
import { gate } from './_auth.js';
import { jamInstructions } from './_jam-context.js';
import { openAIResponse, writeAIError } from './_openai.js';

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
  const { goal, domain, context } = req.body || {};
  if (!goal) { res.status(400).json({ error: 'Missing goal' }); return; }

  const system =
    `Role: elite coach and strategist helping Jay sequence a real goal.\n\n` +
    `Break the goal below into a CLEAR, SEQUENCED progression: 3–6 concrete, checkable milestones in the order he should ` +
    `tackle them — each a real outcome (not vague advice), each building on the last, the last one BEING the goal achieved. ` +
    `Think like a world-class coach who has taken people to this exact outcome. Domain: ${domain || 'general'}.\n\n` +
    `Respond with STRICT JSON only, no prose, no code fence:\n` +
    `{"title":"<a crisp version of the goal>","why":"<one short motivating line on why this matters>","milestones":["<m1>","<m2>","<m3>", "..."]}\n` +
    `Do not invent deadlines, resources, prerequisites, or current progress not present in the live context.`;

  try {
    const text = await openAIResponse({
      instructions: jamInstructions(system, String(context || '').slice(0, 5000)),
      input: `Goal: ${String(goal).slice(0, 800)}`,
      reasoning: 'medium',
      verbosity: 'low',
      maxOutputTokens: 1400,
    });
    const parsed = extractJSON(text);
    if (!parsed || !Array.isArray(parsed.milestones)) { res.status(502).json({ error: 'Bad shape', raw: text.slice(0, 200) }); return; }
    res.status(200).json({
      title: String(parsed.title || goal).slice(0, 120),
      why: String(parsed.why || '').slice(0, 200),
      milestones: parsed.milestones.map((m) => String(m).slice(0, 160)).slice(0, 6),
    });
  } catch (e) {
    writeAIError(res, e);
  }
}
