// ─────────────────────────────────────────────────────────
// LifeOS V2 — THE INTELLIGENCE.
// One mind, different hats. The six separate "agents" of V1 are now
// modes of a single companion that knows Jay's whole world and keeps
// one continuous, synced conversation. Open it from anywhere.
// It can ACT (calendar, email, session, capture, focus) — always
// propose-and-confirm, never silent execution.
// ─────────────────────────────────────────────────────────
import { useState, useRef, useEffect } from 'react';
import { IconSparkles, IconSend, IconClose, IconCalendar, IconActivity, IconPlus, IconTarget, IconMic } from './components/icons.jsx';
import { Sheet } from './components/Sheet.jsx';
import { celebrate } from './lib/haptics.js';
import { voiceSupported, ttsSupported, createListener, speak, stopSpeaking } from './lib/voice.js';
import { DISCIPLINES } from './data.js';
import { analyzeBlindspots } from './coaching.js';
import { generateMissions, localAnswer, snapshot } from './lib/mission.js';
import { useSyncedState } from './useSyncedState.js';
import { todayKey } from './usePersistentState.js';

function readJSON(key, fb) {
  try { const r = localStorage.getItem(key); return r != null ? JSON.parse(r) : fb; } catch { return fb; }
}

// One intelligence, different hats.
const MODES = [
  { id: 'partner',   name: 'Partner',   color: '#2DD4BF', hint: 'whole-life thinking partner' },
  { id: 'chief',     name: 'Chief',     color: '#45B7E8', hint: 'runs your day & priorities' },
  { id: 'coach',     name: 'Coach',     color: '#34D399', hint: 'training & recovery' },
  { id: 'creative',  name: 'Creative',  color: '#FF8A4C', hint: 'content & brands' },
  { id: 'ona',       name: 'ONA',       color: '#FF6B5B', hint: 'gym operations' },
  { id: 'podium',    name: 'Podium',    color: '#E9C46A', hint: 'equipment & builds' },
  { id: 'architect', name: 'Architect', color: '#F4A261', hint: 'improves your systems' },
];

const STARTERS = {
  partner: ["What should I focus on today?", 'What am I neglecting right now?', 'Help me think something through'],
  chief: ['Plan my day around my mission', "What's the highest-leverage hour today?"],
  coach: ['Am I recovered enough to push?', 'Coach me on my closest breakthrough'],
  creative: ['Write me 3 hooks for JayMuvs', "What content move matters most this week?"],
  ona: ['Run the ONA pulse', 'How do I revive the stale leads?'],
  podium: ["What's next for Podium?"],
  architect: ['Where am I losing time?', 'What should LifeOS do better?'],
};

// Assemble a compact snapshot of Jay's whole world for the intelligence.
function buildGlobalContext() {
  const s = snapshot();
  const d = s.daily;
  const L = [];
  L.push(`Today: ${new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}.`);
  if (s.readiness != null) L.push(`Readiness ${s.readiness}/100. One thing: ${d.oneThing || 'not set'}.`);
  if (s.weeklyFocus) L.push(`This week's focus: ${s.weeklyFocus}.`);

  // Today's mission (the campaign the whole app revolves around).
  const missionDoc = readJSON(`lifeos:mission:${todayKey()}`, null);
  const missions = missionDoc?.items?.length ? missionDoc.items : generateMissions(s);
  const doneIds = missionDoc?.doneIds || [];
  if (missions.length) L.push(`Today's mission: ${missions.map((m) => `${doneIds.includes(m.id) ? '[done] ' : ''}${m.title}`).join('; ')}.`);

  // Training
  const active = [];
  DISCIPLINES.forEach((disc) => (s.skills[disc.id] || []).forEach((sk) => { if (sk.status === 'active') active.push(`${disc.name}:${sk.name} ${sk.pct}%`); }));
  if (active.length) L.push(`Training — active skills: ${active.join(', ')}.`);
  L.push(`Training sessions logged: ${s.sessions.length}.`);
  const bs = analyzeBlindspots(s.skills, s.sessions, s.readiness, DISCIPLINES).filter((b) => b.sev !== 'low');
  if (bs.length) L.push(`Training blindspots: ${bs.map((b) => b.title).join('; ')}.`);

  // Businesses
  if (s.ona.stats) L.push(`ONA: members ${s.ona.stats.members}, MRR $${s.ona.stats.mrr}, NPS ${s.ona.stats.nps}.`);
  if (s.ona.initiatives?.length) L.push(`ONA initiatives: ${s.ona.initiatives.map((i) => `${i.priority} ${i.title} ${i.pct}%`).join('; ')}.`);
  if (s.content.brands?.length) L.push(`Brands: ${s.content.brands.map((b) => `${b.name}(${b.status})`).join(', ')}.`);
  const projs = [];
  s.folders.forEach((f) => (f.projects || []).forEach((p) => { const done = (p.steps || []).filter((x) => x.done).length; projs.push(`${f.name}:${p.title} (${done}/${(p.steps || []).length})`); }));
  if (projs.length) L.push(`Active projects: ${projs.slice(0, 8).join('; ')}.`);

  const inbox = s.captures.filter((c) => (c.status || 'inbox') === 'inbox').length;
  if (inbox) L.push(`${inbox} thoughts waiting in the capture inbox.`);

  // Long-term memory — what the companion has learned about Jay over time.
  const mem = readJSON('lifeos:companion:memory', '');
  if (mem) L.unshift(`LONG-TERM MEMORY (what you've learned about Jay over time, carry it forward): ${mem}`);

  return L.join('\n');
}

// ── Floating launcher, present on every screen ──
// Tap = open the Intelligence. Long-press = open straight into voice.
export function CompanionLauncher({ onOpen, onOpenVoice }) {
  const timer = useRef(null);
  const longPressed = useRef(false);
  const down = () => {
    longPressed.current = false;
    timer.current = setTimeout(() => { longPressed.current = true; onOpenVoice?.(); }, 450);
  };
  const up = () => {
    clearTimeout(timer.current);
    if (!longPressed.current) onOpen?.();
  };
  const cancel = () => clearTimeout(timer.current);
  return (
    <div
      className="pressable"
      onMouseDown={down}
      onMouseUp={up}
      onMouseLeave={cancel}
      onTouchStart={down}
      onTouchEnd={up}
      style={{
        position: 'absolute', left: 18, bottom: 'calc(env(safe-area-inset-bottom, 0px) + 96px)',
        width: 52, height: 52, borderRadius: 18, zIndex: 50,
        background: 'linear-gradient(135deg, #2DD4BF 0%, #45B7E8 100%)',
        border: '1px solid rgba(255,255,255,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 10px 30px -8px rgba(45,212,191,0.6)',
      }}
    >
      <IconSparkles size={24} color="#0A0B0D" stroke={2} style={{ position: 'relative' }} />
    </div>
  );
}

const ACTION_META = {
  event: { Icon: IconCalendar, color: '#45B7E8', verb: 'Add to calendar' },
  session: { Icon: IconActivity, color: '#34D399', verb: 'Log session' },
  capture: { Icon: IconPlus, color: '#E9C46A', verb: 'Save' },
  focus: { Icon: IconTarget, color: '#FF6B5B', verb: 'Set focus' },
  email: { Icon: IconSend, color: '#2DD4BF', verb: 'Draft email' },
};

// ── The conversation ──
export function Companion({ open, onClose, onAction, startVoice = false }) {
  const [messages, setMessages] = useSyncedState('lifeos:companion', []);
  // Long-term memory — a distilled, persistent sense of Jay that the
  // companion carries across every conversation, so it grows with you.
  const [memory, setMemory] = useSyncedState('lifeos:companion:memory', '');
  const memTickRef = useRef(0);
  const [mode, setMode] = useState('partner');
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  // Voice replies on = full hands-free loop (speak → answer → listen again).
  const [voiceOn, setVoiceOn] = useSyncedState('lifeos:voicereplies', false);
  const endRef = useRef(null);
  const listenerRef = useRef(null);
  const openRef = useRef(open);
  const voiceOnRef = useRef(voiceOn);
  useEffect(() => { openRef.current = open; }, [open]);
  useEffect(() => { voiceOnRef.current = voiceOn; }, [voiceOn]);

  const activeMode = MODES.find((m) => m.id === mode) || MODES[0];

  const stopListening = () => {
    listenerRef.current?.abort();
    listenerRef.current = null;
    setListening(false);
  };

  const startListening = () => {
    if (!voiceSupported() || thinking) return;
    stopSpeaking();
    setSpeaking(false);
    stopListening();
    const l = createListener({
      onInterim: (t) => setInput(t),
      onResult: (t) => { setInput(''); sendRef.current?.(t); },
      onEnd: () => setListening(false),
    });
    if (!l) return;
    listenerRef.current = l;
    setListening(true);
    l.start();
  };

  const doAction = (msgIdx, actIdx, a) => {
    onAction?.(a);
    celebrate();
    setMessages((list) => list.map((m, mi) => (mi === msgIdx ? { ...m, actions: (m.actions || []).map((x, ai) => (ai === actIdx ? { ...x, done: true } : x)) } : m)));
  };

  useEffect(() => { if (open) setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 120); }, [open, messages, thinking]);

  // Opened in voice mode (mic on the Ask bar / long-press on the orb).
  useEffect(() => {
    if (open && startVoice) setTimeout(() => startListening(), 450);
    if (!open) { stopListening(); stopSpeaking(); setSpeaking(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, startVoice]);

  // Distill the conversation into durable long-term memory (every few
  // exchanges). Runs only when the AI is live; a graceful no-op otherwise.
  const updateMemory = async (history) => {
    try {
      const instr = `[INTERNAL] Update your long-term memory of Jay. Prior memory: """${memory || 'none yet'}""". From our recent conversation, write an updated, concise long-term memory — durable facts about who he is, his goals, preferences, recurring patterns, and what's worked or not. Keep it under 180 words as short plain lines. Merge with prior memory; drop nothing important. Output ONLY the memory text, no preamble.`;
      const r = await fetch('/api/companion', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ messages: [...history.slice(-14), { role: 'user', text: instr }], context: '', mode: 'partner' }) });
      if (!r.ok) return;
      const data = await r.json();
      const m = (data.text || '').trim();
      if (m && m.length > 20) setMemory(m.slice(0, 1600));
    } catch { /* no key → keep existing memory */ }
  };

  const send = async (text) => {
    const q = (text ?? input).trim();
    if (!q || thinking) return;
    setInput('');
    const next = [...messages, { role: 'user', text: q }];
    setMessages(next.slice(-60));
    setThinking(true);
    let reply, acts = [], aiOk = false;
    try {
      const r = await fetch('/api/companion', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ messages: next, context: buildGlobalContext(), mode }) });
      if (!r.ok) throw new Error('no ai');
      const data = await r.json();
      reply = (data.text || '').trim();
      if (!reply) throw new Error('empty');
      acts = Array.isArray(data.actions) ? data.actions : [];
      aiOk = true;
    } catch {
      // Local intelligence — real answers from live data until the key is set.
      reply = localAnswer(q, mode);
    }
    setMessages((m) => [...m, { role: 'ai', text: reply, actions: acts, mode }].slice(-60));
    setThinking(false);
    // Fold the conversation into long-term memory every few exchanges.
    if (aiOk) {
      memTickRef.current += 1;
      if (memTickRef.current >= 5) { memTickRef.current = 0; updateMemory([...next, { role: 'ai', text: reply }]); }
    }
    // Speak the answer, then hand the mic back — a real conversation.
    if (voiceOnRef.current && openRef.current) {
      setSpeaking(true);
      speak(reply, {
        onEnd: () => {
          setSpeaking(false);
          if (openRef.current && voiceOnRef.current) startListening();
        },
      });
    }
  };
  const sendRef = useRef(send);
  useEffect(() => { sendRef.current = send; });

  return (
    <Sheet open={open} onClose={onClose} maxHeight="92%">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 11, background: `linear-gradient(135deg, ${activeMode.color}, #45B7E8)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A0B0D' }}><IconSparkles size={19} /></div>
          <div>
            <div className="eyebrow" style={{ color: activeMode.color }}>{activeMode.hint}</div>
            <div className="display" style={{ fontSize: 20, marginTop: 1 }}>JAM INTELLIGENCE</div>
            {memory && <div className="mono" style={{ fontSize: 8, color: 'var(--lime)', letterSpacing: '0.1em', marginTop: 2 }}>🧠 REMEMBERS YOU</div>}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {ttsSupported() && (
            <div className="pressable mono" onClick={() => { if (voiceOn) { stopSpeaking(); setSpeaking(false); } setVoiceOn(!voiceOn); }} style={{
              fontSize: 9, letterSpacing: '0.1em', fontWeight: 700, padding: '5px 9px', borderRadius: 999,
              background: voiceOn ? 'rgba(52,211,153,0.14)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${voiceOn ? 'rgba(52,211,153,0.5)' : 'var(--line)'}`,
              color: voiceOn ? 'var(--lime)' : 'var(--muted)',
            }}>{voiceOn ? '🔊 VOICE ON' : '🔇 VOICE'}</div>
          )}
          {messages.length > 0 && (
            <div className="pressable mono" onClick={() => setMessages([])} style={{ fontSize: 9, color: 'var(--dim)', letterSpacing: '0.12em', padding: '4px 8px' }}>CLEAR</div>
          )}
          <div className="pressable" onClick={onClose} style={{ width: 32, height: 32, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.06)', color: 'var(--muted)' }}><IconClose size={16} /></div>
        </div>
      </div>

      {/* Hats — one intelligence, different modes */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8, WebkitOverflowScrolling: 'touch' }}>
        {MODES.map((m) => {
          const on = m.id === mode;
          return (
            <div key={m.id} className="pressable" onClick={() => setMode(m.id)} style={{
              flexShrink: 0, padding: '6px 12px', borderRadius: 999,
              background: on ? `${m.color}1c` : 'rgba(255,255,255,0.04)',
              border: `1px solid ${on ? m.color : 'var(--line)'}`,
              color: on ? m.color : 'var(--muted)',
              fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
            }}>{m.name.toUpperCase()}</div>
          );
        })}
      </div>

      {/* Conversation */}
      <div style={{ minHeight: 220, maxHeight: '50vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 6 }}>
        {messages.length === 0 && !thinking && (
          <div style={{ padding: '8px 0' }}>
            <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.55 }}>One partner across everything — your day, your training, your businesses. Pick a hat above or just start:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
              {(STARTERS[mode] || STARTERS.partner).map((s, i) => (
                <div key={i} className="pressable" onClick={() => send(s)} style={{ padding: '11px 14px', borderRadius: 12, background: `${activeMode.color}10`, border: `1px solid ${activeMode.color}45`, color: 'var(--text)', fontSize: 13 }}>{s}</div>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => {
          if (m.role === 'user') {
            return (
              <div key={i} style={{ alignSelf: 'flex-end', maxWidth: '86%', padding: '9px 13px', borderRadius: 16, borderBottomRightRadius: 4, background: 'linear-gradient(135deg, rgba(69,183,232,0.18), rgba(45,212,191,0.18))', border: '1px solid rgba(45,212,191,0.3)', fontSize: 13.5, color: 'var(--text)', lineHeight: 1.45 }}>{m.text}</div>
            );
          }
          const mMode = MODES.find((x) => x.id === m.mode) || MODES[0];
          return (
            <div key={i} style={{ alignSelf: 'flex-start', maxWidth: '92%', display: 'flex', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: mMode.color, marginTop: 6, flexShrink: 0 }} />
              <div style={{ minWidth: 0 }}>
                <div style={{ padding: '9px 13px', borderRadius: 16, borderBottomLeftRadius: 4, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', fontSize: 13.5, color: 'var(--text)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                  {m.mode && m.mode !== 'partner' && <div className="mono" style={{ fontSize: 8, color: mMode.color, letterSpacing: '0.14em', marginBottom: 4 }}>{mMode.name.toUpperCase()} MODE</div>}
                  {m.text}
                </div>
                {m.actions && m.actions.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                    {m.actions.map((a, ai) => {
                      const meta = ACTION_META[a.type] || { Icon: IconSparkles, color: '#2DD4BF' };
                      const label = a.label || meta.verb;
                      return (
                        <div key={ai} className="pressable" onClick={() => !a.done && doAction(i, ai, a)} style={{
                          display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 999,
                          background: a.done ? 'rgba(52,211,153,0.14)' : `${meta.color}1a`,
                          border: `1px solid ${a.done ? 'rgba(52,211,153,0.5)' : meta.color + '66'}`,
                          color: a.done ? 'var(--lime)' : meta.color, fontSize: 12, fontWeight: 700, opacity: a.done ? 0.85 : 1,
                        }}>
                          <meta.Icon size={13} /> {a.done ? `✓ ${label}` : label}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {thinking && (
          <div style={{ alignSelf: 'flex-start', display: 'flex', gap: 6, alignItems: 'center', padding: '4px 6px' }}>
            <span className="blink" style={{ width: 6, height: 6, borderRadius: 999, background: activeMode.color }} />
            <span className="mono" style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.12em' }}>THINKING…</span>
          </div>
        )}
        {speaking && !thinking && (
          <div className="pressable" onClick={() => { stopSpeaking(); setSpeaking(false); }} style={{ alignSelf: 'flex-start', display: 'flex', gap: 6, alignItems: 'center', padding: '4px 6px' }}>
            <span className="blink" style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--lime)' }} />
            <span className="mono" style={{ fontSize: 10, color: 'var(--lime)', letterSpacing: '0.12em' }}>SPEAKING · TAP TO STOP</span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input — type it, or just talk */}
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <div style={{
          flex: 1, background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${listening ? 'rgba(255,107,91,0.6)' : `${activeMode.color}55`}`,
          borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', transition: 'border-color 200ms',
        }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder={listening ? 'Listening… just talk' : `Talk to your AI · ${activeMode.hint}…`}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: listening ? 'var(--ona-red)' : 'var(--text)', fontSize: 15, fontFamily: 'var(--font-body)' }}
          />
        </div>
        {voiceSupported() && (
          <div className="pressable" onClick={() => (listening ? stopListening() : startListening())} style={{
            width: 50, borderRadius: 14,
            background: listening ? 'rgba(255,107,91,0.18)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${listening ? 'rgba(255,107,91,0.6)' : 'var(--line-strong)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: listening ? 'var(--ona-red)' : 'var(--text)', transition: 'all 200ms',
          }}>
            <IconMic size={20} className={listening ? 'blink' : ''} />
          </div>
        )}
        <div className="pressable" onClick={() => send()} style={{ width: 50, borderRadius: 14, background: input.trim() ? `linear-gradient(135deg, ${activeMode.color}, #45B7E8)` : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: input.trim() ? '#0A0B0D' : 'var(--dim)' }}>
          <IconSend size={19} stroke={2.2} />
        </div>
      </div>
      <div style={{ height: 6 }} />
    </Sheet>
  );
}
