// ─────────────────────────────────────────────────────────
// Serverless Chief of Staff — two modes:
//   mode:'brief'  → today's priorities + the single highest-leverage action
//   mode:'review' → an honest weekly reflection
// Falls back to the client's local logic when no API key is set.
// ─────────────────────────────────────────────────────────
import { gate } from './_auth.js';
import { jamInstructions } from './_jam-context.js';
import { openAIResponse, splitTaggedJSON, writeAIError } from './_openai.js';

const SYSTEMS = {
  brief:
    `Role: Jay Martinez's chief of staff.\n\n` +
    `Using the data below, write a tight morning brief he can read in under a minute. Rules:\n` +
    `- Open with one warm, grounded sentence about today (no fluff, no clichés).\n` +
    `- Name what genuinely needs attention given his calendar, readiness, and open loops.\n` +
    `- End with ONE highest-leverage action — the single thing that, if done, makes today a win. Make it concrete.\n` +
    `- Be brief and specific. Short lines, no preamble, no headers like "Morning Brief". Speak directly to Jay.\n\n` +
    `After the brief, on a new line output the exact marker ACTIONS_JSON: followed by a compact JSON array (max 3) of concrete actions Jay could take in one tap. Each item: ` +
    `{"type":"event"|"email"|"note","label":"<short button text>", and for event: "title","time"(HH:MM 24h),"durationMin"; for email: "to"(if known else ""),"subject","body"; for note: "text","domain"(one of podium,movement,social,wife,self)}. ` +
    `Only propose actions that clearly follow from the data (e.g. block prep time before a coaching session, draft a follow-up). If none are warranted, output ACTIONS_JSON: []\n\n` +
    `Finally, on its own line, output the exact marker WHISPER: followed by ONE short proactive line (max 140 chars) for the ambient Presence card — ` +
    `the single most important unasked observation from the data (a pattern, an identity milestone within reach, a neglected domain, a risk to the streak). ` +
    `Personal, specific, calm — never generic, never a command. No quotes.`,
  review:
    `Role: Jay Martinez's chief of staff conducting an honest weekly review, not a cheerleading exercise.\n\n` +
    `Using the week's data below, write a short, honest reflection. Rules:\n` +
    `- Note what went well and what slipped, plainly.\n` +
    `- Call out attention imbalance across his domains (Podium, Movement, social, wife, self) if you see it — gently but truthfully.\n` +
    `- Surface one blind spot or pattern worth his attention.\n` +
    `- Suggest one focus for next week. Keep it to a few short lines, no headers, speak directly to Jay.`,
  upgrade:
    `Role: systems architect for Jay Martinez's JAM HQ personal operating system. Your job is monthly meta-reflection: ` +
    `look at how Jay actually used the system this month and how his life is trending, then tell him plainly how to run his life and ` +
    `this app better.\n\n` +
    `Using the month's usage + life data below, write a short, sharp monthly note. Rules:\n` +
    `- Name what's working in how he's using LifeOS, and what he's ignoring (dead features, unused surfaces).\n` +
    `- Surface the strongest pattern or imbalance across his life this month.\n` +
    `- Be honest and specific, a few short lines, no headers. Speak directly to Jay. Do not propose anything destructive or automatic — he reviews and decides.`,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }
  if (!(await gate(req, res))) return;
  const { mode = 'brief', context } = req.body || {};
  const system = jamInstructions(SYSTEMS[mode] || SYSTEMS.brief, String(context || '').slice(0, 18000));
  const ask = mode === 'review' ? 'Give me my weekly reflection.' : 'Give me my brief for today.';

  try {
    let raw = await openAIResponse({
      instructions: system,
      input: ask,
      reasoning: 'medium',
      verbosity: 'medium',
      maxOutputTokens: 1800,
    });
    // Peel the optional WHISPER line (the ambient Presence beat) off the end.
    let whisper = '';
    const wi = raw.lastIndexOf('WHISPER:');
    if (wi !== -1) {
      whisper = raw.slice(wi + 'WHISPER:'.length).trim().split('\n')[0].trim().slice(0, 180);
      raw = raw.slice(0, wi).trim();
    }
    // Split the brief prose from the optional ACTIONS_JSON marker.
    const { text, value: actions } = splitTaggedJSON(raw, 'ACTIONS_JSON:');
    res.status(200).json({ text, actions, whisper });
  } catch (e) {
    writeAIError(res, e);
  }
}
