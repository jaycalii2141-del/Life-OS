import { useState, useRef, useEffect } from 'react';
import { HUDTicks, Pill, SectionHead } from '../components/atoms.jsx';
import { IconSparkles, IconCalendar, IconCamera, IconActivity, IconFlame, IconUsers, IconTarget, IconMic, IconSend } from '../components/icons.jsx';
import { useAuth } from '../auth/AuthProvider.jsx';
import { todayKey } from '../usePersistentState.js';
import { COACHES } from '../data.js';

// ─────────────────────────────────────────────────────────
// SCREEN 5 — AI Command Sheet (data-driven assistant)
// ─────────────────────────────────────────────────────────

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw != null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
const getDaily = () => readJSON(`lifeos:daily:${todayKey()}`, {});
const getOna = () => readJSON('lifeos:ona', {});
const getContent = () => readJSON('lifeos:content', {});
const getSessions = () => readJSON('lifeos:sessions', []);
const readiness = (d) =>
  d.energy != null ? Math.round(((d.energy + d.focus + d.body + d.mood) / 40) * 100) : null;

// ── Responders: turn live app data into real answers ──
function planDay() {
  const d = getDaily();
  const r = readiness(d);
  const head = r != null ? `Readiness ${r}/100  ·  E${d.energy} F${d.focus} B${d.body} M${d.mood}` : 'Set your meters on Home to calibrate the day.';
  const one = d.oneThing ? `Lock in first → ${d.oneThing}${d.oneThingDone ? '  (done)' : ''}` : 'No One Thing set yet — pick it on Home.';
  const blocks = (d.timeline || []).map((e) => `  ${e.time}   ${e.label}`).join('\n');
  return `${head}\n\n${one}\n\nToday's blocks:\n${blocks || '  (none scheduled)'}`;
}

function recovery() {
  const d = getDaily();
  if (d.body == null) return 'Set your Body and Energy meters on Home and I\'ll call it.';
  const score = (d.body + d.energy) / 2;
  const verdict =
    score >= 8 ? 'Fully recovered — green light to push hard today.'
    : score >= 6 ? 'Mostly recovered — train, but cap intensity around 80%.'
    : score >= 4 ? 'Under-recovered — skill and technique work, skip max efforts.'
    : 'Run down — prioritize mobility, food, and sleep. Active recovery only.';
  return `Body ${d.body}/10  ·  Energy ${d.energy}/10\n\n${verdict}`;
}

function onaPulse() {
  const o = getOna();
  const s = o.stats || {};
  const inits = o.initiatives || [];
  const p0 = inits.filter((i) => i.priority === 'P0');
  const stats = `Members ${s.members ?? '—'}  ·  MRR $${(s.mrr ?? 0).toLocaleString()}  ·  NPS ${s.nps ?? '—'}`;
  const p0txt = p0.length ? p0.map((i) => `  • ${i.title} (${i.pct}%)`).join('\n') : '  • No P0 initiatives — pick the next big rock.';
  return `${stats}\n\nP0 priorities:\n${p0txt}`;
}

function writeHook() {
  const c = getContent();
  const hooks = (c.hooks || []).map((h) => h.text).filter(Boolean);
  if (hooks.length) {
    const pick = hooks[Math.floor(Math.random() * hooks.length)];
    return `From your Hook Bank:\n\n"${pick}"\n\nOpen with this, pay it off in 3 seconds, loop the ending.`;
  }
  return 'Your Hook Bank is empty — add a few on the Create tab and I\'ll pull from them.';
}

function shotList() {
  const c = getContent();
  const brands = c.brands || [];
  const needy = brands.filter((b) => ['Cold', 'Building', 'Paused'].includes(b.status));
  const list = needy.length
    ? needy.map((b) => `  • ${b.name} — ${b.status} (${b.weeklyGoal})`).join('\n')
    : '  • All brands on pace. Bank extra content while you can.';
  return `Brands that need shots:\n${list}\n\nFormula per clip: hook → demo → payoff. Batch 3 verticals back-to-back.`;
}

function coachReview() {
  if (!COACHES.length) return 'No coaches on the roster yet.';
  const top = COACHES[0];
  const avgPrice = Math.round(COACHES.reduce((s, c) => s + c.plPrice, 0) / COACHES.length);
  return `${top.name} · ${top.role} · grade ${top.grade} · $${top.plPrice}/hr\n\nRoster: ${COACHES.length} active, avg private lesson $${avgPrice}/hr. Review session notes weekly and protect your A-graders' schedules.`;
}

function snapshot() {
  const d = getDaily();
  const r = readiness(d);
  const sessions = getSessions().length;
  return `Here's your snapshot:\n  Readiness ${r ?? '—'}/100\n  One Thing → ${d.oneThing || 'not set'}\n  Sessions logged: ${sessions}\n\nAsk me to plan your day, check recovery, run an ONA pulse, or write a hook.`;
}

function routeFreeText(q) {
  const t = q.toLowerCase();
  if (/plan|day|schedule|today/.test(t)) return planDay();
  if (/recover|ready|readiness|rest|sore|tired/.test(t)) return recovery();
  if (/ona|pulse|member|mrr|nps|gym|academy/.test(t)) return onaPulse();
  if (/hook|caption|opener|script/.test(t)) return writeHook();
  if (/shot|shoot|content|film|post|brand/.test(t)) return shotList();
  if (/coach|riley|roster|lesson/.test(t)) return coachReview();
  return snapshot();
}

// Compact summary of Jay's live data, sent to the LLM as context.
function buildContext() {
  const d = getDaily();
  const o = getOna();
  const c = getContent();
  const sess = getSessions();
  const r = readiness(d);
  const lines = [];
  lines.push(`Readiness: ${r ?? 'unset'}/100 (energy ${d.energy ?? '-'}, focus ${d.focus ?? '-'}, body ${d.body ?? '-'}, mood ${d.mood ?? '-'})`);
  lines.push(`One Thing: ${d.oneThing || 'not set'}${d.oneThingDone ? ' [done]' : ''}`);
  if (d.timeline?.length) lines.push(`Today's timeline: ${d.timeline.map((e) => `${e.time} ${e.label}`).join('; ')}`);
  if (o.stats) lines.push(`ONA: members ${o.stats.members}, MRR $${o.stats.mrr}, NPS ${o.stats.nps}`);
  if (o.initiatives?.length) lines.push(`Initiatives: ${o.initiatives.map((i) => `${i.priority} ${i.title} ${i.pct}%`).join('; ')}`);
  if (c.brands?.length) lines.push(`Brands: ${c.brands.map((b) => `${b.name}(${b.status})`).join(', ')}`);
  if (c.hooks?.length) lines.push(`Hook bank: ${c.hooks.map((h) => h.text).slice(0, 6).join(' | ')}`);
  lines.push(`Training sessions logged: ${sess.length}`);
  return lines.join('\n');
}

// Ask the real LLM via the serverless function; fall back to structured answers.
async function askLLM(question) {
  const resp = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ question, context: buildContext() }),
  });
  if (!resp.ok) throw new Error('ai unavailable');
  const data = await resp.json();
  const text = (data.text || '').trim();
  if (!text) throw new Error('empty');
  return text;
}

// Spinning conic-gradient AI orb
function AIOrb({ size = 140, listening = false }) {
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <div style={{ position: 'absolute', inset: -20, background: 'radial-gradient(circle, rgba(177,76,255,0.35) 0%, transparent 60%)', filter: 'blur(8px)' }} className={listening ? 'glow-pulse-red' : ''} />
      <div className="orb-spin" style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: 'conic-gradient(from 0deg, #00D4FF, #B14CFF, #FF3CC8, #FFD23C, #00D4FF)',
        WebkitMask: 'radial-gradient(circle, transparent 60%, #000 62%, #000 75%, transparent 76%)',
        mask: 'radial-gradient(circle, transparent 60%, #000 62%, #000 75%, transparent 76%)',
      }} />
      <div className="orb-spin-fast" style={{
        position: 'absolute', inset: '15%', borderRadius: '50%',
        background: 'conic-gradient(from 90deg, transparent 0deg, #00D4FF 30deg, transparent 60deg, transparent 180deg, #B14CFF 210deg, transparent 240deg)',
        WebkitMask: 'radial-gradient(circle, transparent 50%, #000 52%, #000 90%, transparent 92%)',
        mask: 'radial-gradient(circle, transparent 50%, #000 52%, #000 90%, transparent 92%)',
      }} />
      <div style={{
        position: 'absolute', inset: '30%', borderRadius: '50%',
        background: 'radial-gradient(circle at 30% 30%, #fff 0%, #00D4FF 30%, #B14CFF 70%, #06060A 100%)',
        boxShadow: '0 0 30px rgba(0, 212, 255, 0.6), inset 0 0 14px rgba(255,255,255,0.4)',
      }} />
      <IconSparkles size={size * 0.18} color="#fff" stroke={1.8} style={{ position: 'relative', zIndex: 2, filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.8))' }} />
    </div>
  );
}

const AI_COMMANDS = [
  { id: 'plan',   label: 'Plan my day',          icon: IconCalendar, color: '#00D4FF', run: planDay },
  { id: 'shoot',  label: 'Generate shot list',   icon: IconCamera,   color: '#FF3CC8', run: shotList },
  { id: 'recov',  label: 'Am I recovered?',      icon: IconActivity, color: '#B6FF3C', run: recovery },
  { id: 'hook',   label: 'Write me a hook',      icon: IconFlame,    color: '#FF8A3C', run: writeHook },
  { id: 'review', label: 'Coach review (Riley)', icon: IconUsers,    color: '#FFD23C', run: coachReview },
  { id: 'pulse',  label: 'ONA pulse check',      icon: IconTarget,   color: '#FF0033', run: onaPulse },
];

function AIScreen({ captures = [] }) {
  const [input, setInput] = useState('');
  const [listening, setListening] = useState(false);
  const [messages, setMessages] = useState([]);
  const [thinking, setThinking] = useState(false);
  const { configured, session, signOut } = useAuth();
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, thinking]);

  const ask = (label, responder) => {
    setMessages((m) => [...m, { role: 'user', text: label }]);
    setThinking(true);
    setListening(true);
    setTimeout(() => {
      const text = responder();
      setMessages((m) => [...m, { role: 'ai', text }]);
      setThinking(false);
      setListening(false);
    }, 420);
  };

  const submitInput = async () => {
    const q = input.trim();
    if (!q || thinking) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', text: q }]);
    setThinking(true);
    setListening(true);
    let text;
    try {
      text = await askLLM(q);
    } catch {
      text = routeFreeText(q); // graceful fallback before the API key is set
    }
    setMessages((m) => [...m, { role: 'ai', text }]);
    setThinking(false);
    setListening(false);
  };

  return (
    <div className="screen-content" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="hud glass-strong mesh-ai" style={{ padding: '22px 18px', borderRadius: 22, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
        <HUDTicks />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 14 }}>
          <Pill variant="violet" dot="#B14CFF">CLAUDE · 3.7</Pill>
          {configured && session ? (
            <span className="pressable mono" onClick={signOut} style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.16em' }}>SIGN OUT</span>
          ) : (
            <span className="mono" style={{ fontSize: 9, color: 'var(--lime)', letterSpacing: '0.18em' }}>● ONLINE</span>
          )}
        </div>

        <AIOrb size={140} listening={listening} />

        <div className="display" style={{ fontSize: 28, marginTop: 16, background: 'linear-gradient(90deg, #00D4FF, #B14CFF, #FF3CC8)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
          HOW CAN I MOVE YOU?
        </div>
        <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4, letterSpacing: '0.16em' }}>ASK · DECIDE · ROUTE</div>

        <div style={{ width: '100%', marginTop: 18, display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(177,76,255,0.35)', borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 0 30px -8px rgba(177,76,255,0.4)' }}>
            <IconSparkles size={16} color="var(--violet)" />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitInput()}
              placeholder="Ask anything about your day…"
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 14, fontFamily: 'var(--font-body)' }}
            />
            <div className="pressable" onClick={submitInput} style={{ color: input.trim() ? 'var(--violet)' : 'var(--dim)' }}>
              <IconSend size={18} stroke={2.2} />
            </div>
          </div>
          <div className="pressable" onClick={() => setListening((l) => !l)} style={{ width: 48, borderRadius: 14, background: listening ? 'rgba(255,0,51,0.18)' : 'rgba(255,255,255,0.04)', border: `1px solid ${listening ? 'rgba(255,0,51,0.5)' : 'var(--line-strong)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: listening ? 'var(--ona-red)' : 'var(--text)' }}>
            <IconMic size={20} className={listening ? 'blink' : ''} />
          </div>
        </div>
      </div>

      {/* Conversation */}
      {(messages.length > 0 || thinking) && (
        <div className="hud glass" style={{ padding: 14, borderRadius: 16 }}>
          <HUDTicks />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map((m, i) => (
              m.role === 'user' ? (
                <div key={i} style={{ alignSelf: 'flex-end', maxWidth: '85%', padding: '8px 12px', borderRadius: 14, borderBottomRightRadius: 4, background: 'linear-gradient(135deg, rgba(0,212,255,0.18), rgba(177,76,255,0.18))', border: '1px solid rgba(177,76,255,0.3)', fontSize: 13, color: 'var(--text)' }}>
                  {m.text}
                </div>
              ) : (
                <div key={i} style={{ alignSelf: 'flex-start', maxWidth: '92%', display: 'flex', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--violet)', boxShadow: '0 0 8px var(--violet)', marginTop: 6, flexShrink: 0 }} />
                  <div style={{ padding: '8px 12px', borderRadius: 14, borderBottomLeftRadius: 4, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', fontSize: 13, color: 'var(--text)', lineHeight: 1.45, whiteSpace: 'pre-wrap' }}>
                    {m.text}
                  </div>
                </div>
              )
            ))}
            {thinking && (
              <div style={{ alignSelf: 'flex-start', display: 'flex', gap: 6, alignItems: 'center', padding: '4px 6px' }}>
                <span className="blink" style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--violet)' }} />
                <span className="mono" style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.12em' }}>THINKING…</span>
              </div>
            )}
            <div ref={endRef} />
          </div>
        </div>
      )}

      {/* Quick commands */}
      <div>
        <SectionHead eyebrow="Tap a command" title="QUICK ACTIONS" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          {AI_COMMANDS.map((cmd) => (
            <div key={cmd.id} className="pressable hud" onClick={() => ask(cmd.label, cmd.run)} style={{ padding: '12px 12px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: `1px solid ${cmd.color}30`, display: 'flex', alignItems: 'center', gap: 10, position: 'relative', boxShadow: `0 0 16px -8px ${cmd.color}` }}>
              <HUDTicks />
              <div style={{ width: 32, height: 32, borderRadius: 10, background: `${cmd.color}18`, border: `1px solid ${cmd.color}50`, color: cmd.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <cmd.icon size={16} />
              </div>
              <span style={{ fontSize: 12, color: 'var(--text)', fontWeight: 600, lineHeight: 1.2 }}>{cmd.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent captures */}
      <div className="hud glass" style={{ padding: 14, borderRadius: 16 }}>
        <HUDTicks />
        <div style={{ marginBottom: 12 }}>
          <div className="eyebrow">Recent · auto-routed</div>
          <div className="section-title" style={{ fontSize: 20, marginTop: 2 }}>HISTORY</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {captures.length === 0 && (
            <div className="eyebrow" style={{ color: 'var(--dim)' }}>Nothing captured yet — tap + on any screen.</div>
          )}
          {captures.map((c, i) => (
            <div key={c.id || i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--line)' }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: c.color || '#00D4FF', boxShadow: `0 0 8px ${c.color || '#00D4FF'}`, marginTop: 6, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.3 }}>{c.text}</div>
                <div className="mono" style={{ fontSize: 9, color: 'var(--dim)', marginTop: 3, letterSpacing: '0.1em' }}>{c.time}  ·  {c.tag}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="eyebrow" style={{ textAlign: 'center', color: 'var(--dim)' }}>
        Answers are generated live from your own data.
      </div>
    </div>
  );
}

export { AIScreen, AIOrb };
