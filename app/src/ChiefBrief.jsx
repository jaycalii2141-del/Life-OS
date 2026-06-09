// ─────────────────────────────────────────────────────────
// Chief of Staff — the morning brief at the top of Home.
// Assembles today's calendar, readiness, open capture-inbox and
// "one thing" into a single glanceable brief, ending in the one
// highest-leverage action. Caches per day; AI when the key is set,
// deterministic otherwise.
// ─────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { IconCompass, IconSparkles, IconChevronDown, IconCalendar, IconSend, IconInbox, IconArrowRight, IconCheck, IconClose } from './components/icons.jsx';
import { todayKey } from './usePersistentState.js';
import { googleCalendarUrl, mailtoUrl, openExternal } from './lib/actions.js';

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

export function ChiefBrief({ readiness, oneThing, calendarEvents, onAddEvent, onGoMind }) {
  const day = todayKey();
  const cacheKey = `lifeos:brief:${day}`;
  const [brief, setBrief] = useState('');
  const [actions, setActions] = useState([]);
  const [usedAI, setUsedAI] = useState(false);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(true);
  const [composing, setComposing] = useState(null); // null | event payload draft

  const inbox = inboxCount();

  const generate = async (force) => {
    if (!force) {
      const cached = readJSON(cacheKey, null);
      if (cached && cached.text) { setBrief(cached.text); setUsedAI(!!cached.ai); setActions(cached.actions || []); return; }
    }
    setLoading(true);
    const context = buildContext({ readiness, oneThing, calendarEvents });
    let text = '', ai = false, acts = [];
    try {
      const r = await fetch('/api/chief', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ mode: 'brief', context }) });
      if (!r.ok) throw new Error('no ai');
      const data = await r.json();
      text = (data.text || '').trim();
      if (!text) throw new Error('empty');
      acts = Array.isArray(data.actions) ? data.actions : [];
      ai = true;
    } catch {
      text = buildLocal({ readiness, oneThing, calendarEvents }); ai = false; acts = [];
    }
    setBrief(text); setUsedAI(ai); setActions(acts); setLoading(false);
    try { localStorage.setItem(cacheKey, JSON.stringify({ text, ai, actions: acts, ts: Date.now() })); } catch { /* */ }
  };

  // Run an AI-proposed action (event prefills Google Calendar + app timeline; email prefills mail).
  const runAction = (a) => {
    if (a.type === 'event') {
      onAddEvent?.({ time: a.time || '12:00', label: a.title || a.label || 'Block', kind: 'Focus', color: '#B14CFF' });
      openExternal(googleCalendarUrl({ title: a.title || a.label, time: a.time, durationMin: a.durationMin || 60 }));
    } else if (a.type === 'email') {
      openExternal(mailtoUrl({ to: a.to || '', subject: a.subject || a.label || '', body: a.body || '' }));
    }
  };

  // Confirm the inline "plan a block" composer.
  const confirmEvent = () => {
    const ev = composing;
    if (!ev || !ev.title.trim()) { setComposing(null); return; }
    onAddEvent?.({ time: ev.time || '12:00', label: ev.title.trim(), kind: 'Focus', color: '#B14CFF' });
    openExternal(googleCalendarUrl({ title: ev.title.trim(), time: ev.time, durationMin: parseInt(ev.dur, 10) || 60 }));
    setComposing(null);
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '4px 0' }}>
            <div className="skeleton" style={{ height: 11, width: '92%' }} />
            <div className="skeleton" style={{ height: 11, width: '78%' }} />
            <div className="skeleton" style={{ height: 11, width: '85%' }} />
            <div className="skeleton" style={{ height: 11, width: '60%' }} />
          </div>
        ) : (
          <>
            <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{brief}</div>

            {/* Action row — propose & prefill; you confirm send/create in Google */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 14 }}>
              {inbox > 0 && (
                <ActionChip icon={<IconInbox size={13} />} color="#FFD23C" label={`Triage ${inbox}`} onClick={() => onGoMind?.()} />
              )}
              <ActionChip icon={<IconCalendar size={13} />} color="#00D4FF" label="Plan a block" onClick={() => setComposing({ title: '', time: '09:00', dur: '60' })} />
              {actions.map((a, i) => (
                a.type === 'event'
                  ? <ActionChip key={i} icon={<IconCalendar size={13} />} color="#B14CFF" label={a.label || a.title || 'Add event'} onClick={() => runAction(a)} />
                  : a.type === 'email'
                    ? <ActionChip key={i} icon={<IconSend size={13} />} color="#B6FF3C" label={a.label || 'Draft email'} onClick={() => runAction(a)} />
                    : null
              ))}
            </div>

            {/* Inline quick-event composer */}
            {composing && (
              <div className="hud glass" style={{ padding: 12, borderRadius: 12, marginTop: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span className="eyebrow" style={{ color: 'var(--cyan)' }}>New block</span>
                  <div className="pressable" onClick={() => setComposing(null)} style={{ color: 'var(--dim)' }}><IconClose size={14} /></div>
                </div>
                <input
                  autoFocus value={composing.title}
                  onChange={(e) => setComposing((c) => ({ ...c, title: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === 'Enter') confirmEvent(); }}
                  placeholder="What are you blocking time for?"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', borderRadius: 10, padding: '10px 12px', color: 'var(--text)', fontSize: 14, outline: 'none', fontFamily: 'var(--font-body)', marginBottom: 8 }}
                />
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="time" value={composing.time} onChange={(e) => setComposing((c) => ({ ...c, time: e.target.value }))} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', borderRadius: 10, padding: '8px 10px', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'var(--font-mono)' }} />
                  <select value={composing.dur} onChange={(e) => setComposing((c) => ({ ...c, dur: e.target.value }))} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', borderRadius: 10, padding: '8px 10px', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'var(--font-mono)' }}>
                    {['30', '45', '60', '90', '120'].map((m) => <option key={m} value={m} style={{ background: '#0B0B12' }}>{m} min</option>)}
                  </select>
                  <div className="pressable" onClick={confirmEvent} style={{ flex: 1, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #00D4FF, #B14CFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#06060A', fontWeight: 700, fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    <IconCheck size={15} stroke={2.4} /> Add to calendar
                  </div>
                </div>
                <div className="eyebrow" style={{ marginTop: 8, opacity: 0.7 }}>opens Google Calendar prefilled — you hit save</div>
              </div>
            )}
          </>
        )
      )}
    </div>
  );
}

function ActionChip({ icon, label, color, onClick }) {
  return (
    <div className="pressable" onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 999,
      background: `${color}1a`, border: `1px solid ${color}66`, color,
      fontSize: 12, fontWeight: 700, letterSpacing: '0.02em',
    }}>{icon}{label}</div>
  );
}
