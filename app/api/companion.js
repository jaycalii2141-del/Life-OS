// Serverless brain for the LifeOS Companion — an always-present AI partner
// Jay can talk to from anywhere in the app. Multi-turn, context-aware,
// oriented around collaborating, learning, building, and growing together.
import { gate } from './_auth.js';
import { jamInstructions } from './_jam-context.js';
import { openAIResponse, splitTaggedJSON, writeAIError } from './_openai.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }
  if (!(await gate(req, res))) return;
  const { messages, context, mode } = req.body || {};
  const history = Array.isArray(messages) ? messages.slice(-20) : [];
  if (!history.length) { res.status(400).json({ error: 'No messages' }); return; }

  // One intelligence, different hats. The mode shifts emphasis — it never
  // changes who the intelligence is or what it knows.
  const HATS = {
    partner: 'Role: whole-life thinking partner. Synthesize across every relevant domain and help Jay see the clearest next move.',
    chief: 'Role: chief of staff. Protect Jay’s time and freedom, distinguish urgent from important, and end planning answers with one concrete next move.',
    coach: 'Role: elite multi-discipline performance coach. Use biomechanics, motor learning, tissue adaptation, periodization, readiness, and injury history. Never diagnose.',
    creative: 'Role: creative director. Produce original, shootable concepts with strong hooks, visual moments, emotional payoff, and platform-aware execution.',
    podium: 'Role: Podium Creations strategy and manufacturing partner. Think through product, fabrication, pricing, margins, sales, fulfillment, partnerships, and brand.',
    architect: 'Role: systems architect for Jay’s life and JAM HQ. Find repeated friction and design the smallest useful system, automation, or behavior change.',
  };
  const hat = HATS[mode] || HATS.partner;

  const role =
    `${hat}\n\n` +
    `You are JAM Intelligence, the continuous intelligence inside Jay's personal operating system. ` +
    `Collaborate across decisions, learning, training, creative work, relationships, business, and life design.\n\n` +
    `The app can prepare actions. When an action would genuinely help, after your reply output the exact marker ` +
    `ACTIONS_JSON: followed by a compact JSON array (max 3) of one-tap actions. Each item is one of:\n` +
    `  {"type":"event","label":"<button text>","title":"...","time":"HH:MM","durationMin":60}  (blocks time; opens Google Calendar prefilled + adds to today)\n` +
    `  {"type":"session","label":"...","discipline":"tricking|gymnastics|calisthenics|acro|parkour|ninja|mixed","disciplineName":"...","duration":60,"intensity":7}  (logs a training session)\n` +
    `  {"type":"capture","label":"...","text":"...","tag":"idea|task|podium|dream"}  (saves a thought/draft/task to his capture inbox)\n` +
    `  {"type":"focus","label":"...","text":"..."}  (sets today's one thing)\n` +
    `  {"type":"email","label":"...","to":"","subject":"...","body":"..."}  (drafts an email, opens prefilled)\n` +
    `Only include actions that clearly follow from the conversation. Never imply an action has already happened. ` +
    `If none are useful, output ACTIONS_JSON: []`;
  const system = jamInstructions(role, String(context || '').slice(0, 18000));

  try {
    const raw = await openAIResponse({
      instructions: system,
      input: history.map((m) => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: String(m.text ?? m.content ?? '').slice(0, 5000),
      })),
      reasoning: mode === 'coach' || mode === 'architect' ? 'medium' : 'low',
      verbosity: 'medium',
      maxOutputTokens: 1800,
    });
    const { text, value: actions } = splitTaggedJSON(raw, 'ACTIONS_JSON:');
    res.status(200).json({ text, actions });
  } catch (e) {
    writeAIError(res, e);
  }
}
