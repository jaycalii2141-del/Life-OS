// LifeOS Companion — an always-present AI partner Jay can open from any
// screen to talk, collaborate, learn, build, and grow. Knows his whole
// world (training, businesses, day, captures, goals) and remembers the
// conversation across sessions.
import { useState, useRef, useEffect } from 'react';
import { IconSparkles, IconSend, IconClose } from './components/icons.jsx';
import { Sheet } from './components/Sheet.jsx';
import { DISCIPLINES } from './data.js';
import { analyzeBlindspots } from './coaching.js';
import { useSyncedState } from './useSyncedState.js';
import { todayKey } from './usePersistentState.js';

function readJSON(key, fb) {
  try { const r = localStorage.getItem(key); return r != null ? JSON.parse(r) : fb; } catch { return fb; }
}

// Assemble a compact snapshot of Jay's whole world for the companion.
function buildGlobalContext() {
  const d = readJSON(`lifeos:daily:${todayKey()}`, {});
  const readiness = d.energy != null ? Math.round(((d.energy + d.focus + d.body + d.mood) / 40) * 100) : null;
  const sessions = readJSON('lifeos:sessions', []);
  const skills = readJSON('lifeos:skills:v2', {});
  const ona = readJSON('lifeos:ona', {});
  const content = readJSON('lifeos:content', {});
  const captures = readJSON('lifeos:captures', []);
  const focus = readJSON('lifeos:weeklyfocus', {}).text;
  const folders = readJSON('lifeos:folders', []);

  const L = [];
  L.push(`Today: ${new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}.`);
  if (readiness != null) L.push(`Readiness ${readiness}/100. One thing: ${d.oneThing || 'not set'}.`);
  if (focus) L.push(`This week's focus: ${focus}.`);

  // Training
  const active = [];
  DISCIPLINES.forEach((disc) => (skills[disc.id] || []).forEach((s) => { if (s.status === 'active') active.push(`${disc.name}:${s.name} ${s.pct}%`); }));
  if (active.length) L.push(`Training — active skills: ${active.join(', ')}.`);
  L.push(`Training sessions logged: ${sessions.length}.`);
  const bs = analyzeBlindspots(skills, sessions, readiness, DISCIPLINES).filter((b) => b.sev !== 'low');
  if (bs.length) L.push(`Training blindspots: ${bs.map((b) => b.title).join('; ')}.`);

  // ONA
  if (ona.stats) L.push(`ONA: members ${ona.stats.members}, MRR $${ona.stats.mrr}, NPS ${ona.stats.nps}.`);
  if (ona.initiatives?.length) L.push(`ONA initiatives: ${ona.initiatives.map((i) => `${i.priority} ${i.title} ${i.pct}%`).join('; ')}.`);

  // Content / folders
  if (content.brands?.length) L.push(`Brands: ${content.brands.map((b) => `${b.name}(${b.status})`).join(', ')}.`);
  const projs = [];
  folders.forEach((f) => (f.projects || []).forEach((p) => { const done = (p.steps || []).filter((s) => s.done).length; projs.push(`${f.name}:${p.title} (${done}/${(p.steps || []).length})`); }));
  if (projs.length) L.push(`Active projects: ${projs.slice(0, 8).join('; ')}.`);

  // Capture
  const inbox = captures.filter((c) => (c.status || 'inbox') === 'inbox').length;
  if (inbox) L.push(`${inbox} thoughts waiting in the capture inbox.`);

  return L.join('\n');
}

const STARTERS = [
  "What should I focus on today?",
  'Help me think through a Podium decision',
  'Coach me on my cork progression',
  "What am I neglecting right now?",
];

// ── Floating launcher, present on every screen ──
export function CompanionLauncher({ onOpen }) {
  return (
    <div
      className="pressable"
      onClick={onOpen}
      style={{
        position: 'absolute', left: 18, bottom: 'calc(env(safe-area-inset-bottom, 0px) + 96px)',
        width: 52, height: 52, borderRadius: 18, zIndex: 50,
        background: 'linear-gradient(135deg, #B14CFF 0%, #00D4FF 100%)',
        border: '1px solid rgba(255,255,255,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 10px 30px -8px rgba(177,76,255,0.6)',
      }}
    >
      <div style={{ position: 'absolute', inset: -8, borderRadius: '50%', background: 'radial-gradient(circle, rgba(177,76,255,0.4) 0%, transparent 65%)' }} className="glow-pulse-red" />
      <IconSparkles size={24} color="#06060A" stroke={2} style={{ position: 'relative' }} />
    </div>
  );
}

// ── The conversation ──
export function Companion({ open, onClose }) {
  const [messages, setMessages] = useSyncedState('lifeos:companion', []);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { if (open) setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 120); }, [open, messages, thinking]);

  const send = async (text) => {
    const q = (text ?? input).trim();
    if (!q || thinking) return;
    setInput('');
    const next = [...messages, { role: 'user', text: q }];
    setMessages(next.slice(-60));
    setThinking(true);
    let reply;
    try {
      const r = await fetch('/api/companion', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ messages: next, context: buildGlobalContext() }) });
      if (!r.ok) throw new Error('no ai');
      const data = await r.json();
      reply = (data.text || '').trim();
      if (!reply) throw new Error('empty');
    } catch {
      reply = "I'm ready to think and build with you — add your Anthropic key in Settings and I'll come fully online with everything happening across your training, businesses, and day.";
    }
    setMessages((m) => [...m, { role: 'ai', text: reply }].slice(-60));
    setThinking(false);
  };

  return (
    <Sheet open={open} onClose={onClose} maxHeight="90%">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 11, background: 'linear-gradient(135deg, #B14CFF, #00D4FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#06060A' }}><IconSparkles size={19} /></div>
          <div>
            <div className="eyebrow" style={{ color: 'var(--violet)' }}>Your AI</div>
            <div className="display" style={{ fontSize: 21, marginTop: 1 }}>LIFE OS</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {messages.length > 0 && (
            <div className="pressable mono" onClick={() => setMessages([])} style={{ fontSize: 9, color: 'var(--dim)', letterSpacing: '0.12em', padding: '4px 8px' }}>CLEAR</div>
          )}
          <div className="pressable" onClick={onClose} style={{ width: 32, height: 32, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.06)', color: 'var(--muted)' }}><IconClose size={16} /></div>
        </div>
      </div>

      {/* Conversation */}
      <div style={{ minHeight: 220, maxHeight: '52vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 6 }}>
        {messages.length === 0 && !thinking && (
          <div style={{ padding: '8px 0' }}>
            <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.55 }}>Hey Jay — I'm your partner across all of this. Ask me anything, think out loud, or pick a starting point:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
              {STARTERS.map((s, i) => (
                <div key={i} className="pressable" onClick={() => send(s)} style={{ padding: '11px 14px', borderRadius: 12, background: 'rgba(177,76,255,0.08)', border: '1px solid rgba(177,76,255,0.3)', color: 'var(--text)', fontSize: 13 }}>{s}</div>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          m.role === 'user' ? (
            <div key={i} style={{ alignSelf: 'flex-end', maxWidth: '86%', padding: '9px 13px', borderRadius: 16, borderBottomRightRadius: 4, background: 'linear-gradient(135deg, rgba(0,212,255,0.18), rgba(177,76,255,0.18))', border: '1px solid rgba(177,76,255,0.3)', fontSize: 13.5, color: 'var(--text)', lineHeight: 1.45 }}>{m.text}</div>
          ) : (
            <div key={i} style={{ alignSelf: 'flex-start', maxWidth: '92%', display: 'flex', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--violet)', boxShadow: '0 0 8px var(--violet)', marginTop: 6, flexShrink: 0 }} />
              <div style={{ padding: '9px 13px', borderRadius: 16, borderBottomLeftRadius: 4, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', fontSize: 13.5, color: 'var(--text)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{m.text}</div>
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

      {/* Input */}
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(177,76,255,0.35)', borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', boxShadow: '0 0 30px -10px rgba(177,76,255,0.4)' }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Talk to your AI…"
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 15, fontFamily: 'var(--font-body)' }}
          />
        </div>
        <div className="pressable" onClick={() => send()} style={{ width: 50, borderRadius: 14, background: input.trim() ? 'linear-gradient(135deg, #B14CFF, #00D4FF)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: input.trim() ? '#06060A' : 'var(--dim)' }}>
          <IconSend size={19} stroke={2.2} />
        </div>
      </div>
      <div style={{ height: 6 }} />
    </Sheet>
  );
}
