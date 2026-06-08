// ─────────────────────────────────────────────────────────
// Chief of Staff — the morning brief at the top of Home.
// Assembles today's calendar, readiness, open capture-inbox and
// "one thing" into a single glanceable brief, ending in the one
// highest-leverage action. Caches per day; AI when the key is set,
// deterministic otherwise.
// ─────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { IconCompass, IconSparkles, IconChevronDown } from './components/icons.jsx';
import { todayKey } from './usePersistentState.js';

function readJSON(key, fb) {
  try { const r = localStorage.getItem(key); return r != null ? JSON.parse(r) : fb; } catch { return fb; }
}

function inboxCount() {
  return readJSON('lifeos:captures', []).filter((c) => (c.status || 'inbox') === 'inbox').length;
}

function buildContext({ readiness, oneThing, calendarEvents }) {
  const inbox = inboxCount();
  const sessions = readJSON('lifeos:sessions', []).slice(0, 3);
  const focus = readJSON('lifeos:weeklyfocus', {}).text;
  const lines = [];
  lines.push(`Readiness today: ${readiness}/100.`);
  lines.push(`Calendar today: ${calendarEvents?.length ? calendarEvents.map((e) => `${e.time} ${e.label}`).join('; ') : 'nothing scheduled'}.`);
  lines.push(`Capture inbox: ${inbox} thought${inbox === 1 ? '' : 's'} waiting to triage.`);
  lines.push(`Today's one thing: ${oneThing ? oneThing : 'not set yet'}.`);
  if (focus) lines.push(`This week's focus: ${focus}.`);
  if (sessions.length) lines.push(`Recent training: ${sessions.map((s) => `${s.disciplineName || s.discipline} ${s.duration}min`).join(', ')}.`);
  return lines.join('\n');
}

function buildLocal({ readiness, oneThing, calendarEvents }) {
  const inbox = inboxCount();
  const focus = readJSON('lifeos:weeklyfocus', {}).text;
  const out = [];
  if (readiness >= 75) out.push(`You're sharp today — readiness ${readiness}. Good day to push.`);
  else if (readiness >= 55) out.push(`Steady start — readiness ${readiness}. Solid work, watch the load.`);
  else out.push(`Readiness ${readiness} today — keep it technical and recover well.`);

  if (calendarEvents?.length) {
    const first = calendarEvents[0];
    out.push(`On your calendar: ${calendarEvents.slice(0, 3).map((e) => `${e.time} ${e.label}`).join(' · ')}${calendarEvents.length > 3 ? ` +${calendarEvents.length - 3} more` : ''}.`);
    out.push(`First up is ${first.label} at ${first.time}.`);
  } else {
    out.push(`Calendar's clear — your time is yours to direct.`);
  }
  if (inbox) out.push(`${inbox} thought${inbox === 1 ? '' : 's'} waiting in your inbox — a 2-minute triage clears the mental clutter.`);
  if (focus) out.push(`This week's focus: ${focus}.`);

  out.push('');
  if (oneThing) out.push(`▸ Highest leverage: ${oneThing}.`);
  else out.push(`▸ Highest leverage: decide your one thing for today — the single win that matters most.`);
  return out.join('\n');
}

export function ChiefBrief({ readiness, oneThing, calendarEvents }) {
  const day = todayKey();
  const cacheKey = `lifeos:brief:${day}`;
  const [brief, setBrief] = useState('');
  const [usedAI, setUsedAI] = useState(false);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(true);

  const generate = async (force) => {
    if (!force) {
      const cached = readJSON(cacheKey, null);
      if (cached && cached.text) { setBrief(cached.text); setUsedAI(!!cached.ai); return; }
    }
    setLoading(true);
    const context = buildContext({ readiness, oneThing, calendarEvents });
    let text = '', ai = false;
    try {
      const r = await fetch('/api/chief', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ mode: 'brief', context }) });
      if (!r.ok) throw new Error('no ai');
      const data = await r.json();
      text = (data.text || '').trim();
      if (!text) throw new Error('empty');
      ai = true;
    } catch {
      text = buildLocal({ readiness, oneThing, calendarEvents }); ai = false;
    }
    setBrief(text); setUsedAI(ai); setLoading(false);
    try { localStorage.setItem(cacheKey, JSON.stringify({ text, ai, ts: Date.now() })); } catch { /* */ }
  };

  // Generate (from cache or fresh) once the calendar has had a beat to load.
  useEffect(() => {
    const t = setTimeout(() => generate(false), 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day]);

  return (
    <div className="hud glass-strong" style={{ padding: '16px 16px 14px', borderRadius: 20, position: 'relative', overflow: 'hidden', border: '1px solid rgba(177,76,255,0.28)', boxShadow: '0 0 40px -18px rgba(177,76,255,0.6)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: open ? 12 : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 8, background: 'linear-gradient(135deg, #B14CFF, #00D4FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#06060A' }}><IconCompass size={15} /></div>
          <div>
            <div className="eyebrow" style={{ color: 'var(--violet)' }}>Chief of Staff</div>
            <div className="mono" style={{ fontSize: 9, color: 'var(--dim)', letterSpacing: '0.1em' }}>{usedAI ? 'AI BRIEF' : 'YOUR BRIEF'} · {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div className="pressable" onClick={() => generate(true)} title="Refresh" style={{ width: 30, height: 30, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--violet)', background: 'rgba(177,76,255,0.1)' }}>
            <IconSparkles size={15} className={loading ? 'blink' : ''} />
          </div>
          <div className="pressable" onClick={() => setOpen((o) => !o)} style={{ width: 30, height: 30, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
            <IconChevronDown size={16} style={{ transform: open ? 'none' : 'rotate(-90deg)', transition: 'transform 200ms' }} />
          </div>
        </div>
      </div>

      {open && (
        loading && !brief ? (
          <div className="eyebrow" style={{ opacity: 0.7, padding: '6px 0' }}>assembling your brief…</div>
        ) : (
          <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{brief}</div>
        )
      )}
    </div>
  );
}
