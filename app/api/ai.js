// Serverless proxy for the Life OS AI tab.
// Keeps the OpenAI API key server-side (never shipped to the browser).
import { gate } from './_auth.js';
import { jamInstructions } from './_jam-context.js';
import { openAIResponse, writeAIError } from './_openai.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  if (!(await gate(req, res))) return;

  const { question, context, agent } = req.body || {};
  if (!question) {
    res.status(400).json({ error: 'Missing question' });
    return;
  }

  // Each agent is a focused persona. Default to the Chief of Staff.
  const PERSONAS = {
    chief: `You are Jay's CHIEF OF STAFF. You run his day and priorities, protect his focus and time, and help him decide what matters most. Think in terms of leverage and one clear next action.`,
    coach: `You are Jay's PERFORMANCE COACH — elite multi-discipline movement coach (gymnastics, tricking, calisthenics, acro, parkour, ninja) grounded in sports science and biomechanics. Advise on training, progressions, recovery, and load, scaled to his readiness.`,
    creative: `You are Jay's CREATIVE DIRECTOR. You generate content ideas, hooks, captions, shot lists, and campaign angles for his brands and @jayy_martinez. Be punchy and specific; think in scroll-stopping openers and payoffs.`,
    podium: `You are Jay's PODIUM MANUFACTURING partner. You track orders, inventory, product development, CNC/fabrication workflows, fulfillment, and margins. Be concrete about the next build/ship decision.`,
    architect: `You are Jay's SYSTEMS ARCHITECT. You find repeatable friction, suggest automations and better routines, and help him run his life and LifeOS more efficiently. Propose, never impose — he reviews and decides.`,
  };

  const persona = PERSONAS[agent] || PERSONAS.chief;
  const system = jamInstructions(persona, String(context || '').slice(0, 14000));

  try {
    const text = await openAIResponse({
      instructions: system,
      input: String(question).slice(0, 3000),
      reasoning: agent === 'coach' || agent === 'architect' ? 'medium' : 'low',
      verbosity: 'medium',
      maxOutputTokens: 1400,
    });
    res.status(200).json({ text });
  } catch (e) {
    writeAIError(res, e);
  }
}
