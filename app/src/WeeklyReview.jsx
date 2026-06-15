// ─────────────────────────────────────────────────────────
// Weekly Review — the heartbeat that keeps LifeOS honest.
// Reads the week from history, sessions, triaged captures and
// usage telemetry, shows where attention actually went, and asks
// for one focus for next week. Optional AI summary via /api/chief.
// ─────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { IconClose, IconCompass, IconActivity, IconSparkles, IconCalendar } from './components/icons.jsx';
import { LIFE_DOMAINS } from './data.js';
import { Sheet } from './components/Sheet.jsx';
import { usageBySurface } from './lib/telemetry.js';
import { googleCalendarUrl, openExternal } from './lib/actions.js';

// Next weekday morning, for scheduling next-week intentions.
function tomorrow9() {
  const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(9, 0, 0, 0); return d;
}

function readJSON(key, fb) {
  try { const r = localStorage.getItem(key); return r != null ? JSON.parse(r) : fb; } catch { return fb; }
}
function dayKey(d) {
  const p = (x) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

const SURFACE_NAMES = { home: 'Home', train: 'Train', create: 'Create', ona: 'ONA', mind: 'Mind', ai: 'Agents', today: 'Today', life: 'Life', perform: 'Perform', build: 'Build', companion: 'Intelligence', mission: 'Mission' };

// Crunch the week from local data.
function buildWeek() {
  const now = new Date();
  const weekAgo = now.getTime() - 7 * 864e5;
  const history = readJSON('lifeos:history', {});
  const sessions = readJSON('lifeos:sessions', []);
  const captures = readJSON('lifeos:captures', []);

  // Days active + avg readiness over the last 7 calendar days.
  let active = 0, rTotal = 0, rDays = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const e = history[dayKey(d)];
    if (e) { if ((e.score ?? 0) >= 1) active += 1; if (typeof e.readiness === 'number') { rTotal += e.readiness; rDays += 1; } }
  }
  const avgReadiness = rDays ? Math.round(rTotal / rDays) : null;

  // Training volume this week.
  const wkSessions = sessions.filter((s) => new Date(s.date || s.ts || 0).getTime() >= weekAgo);
  const minutes = wkSessions.reduce((n, s) => n + (s.duration || 0), 0);
  const discCount = {};
  wkSessions.forEach((s) => { const k = s.disciplineName || s.discipline || '—'; discCount[k] = (discCount[k] || 0) + 1; });

  // Attention split — where captured thoughts were routed this week.
  const wkCaptures = captures.filter((c) => (c.ts || c.id || 0) >= weekAgo);
  const byDomain = {};
  wkCaptures.forEach((c) => { if (c.domain) byDomain[c.domain] = (byDomain[c.domain] || 0) + 1; });
  const inboxLeft = captures.filter((c) => (c.status || 'inbox') === 'inbox').length;

  // Surface usage from telemetry.
  const usage = usageBySurface(7);
  const usageSorted = Object.entries(usage).sort((a, b) => b[1] - a[1]);

  return { active, avgReadiness, wkSessions: wkSessions.length, minutes, discCount, byDomain, inboxLeft, usageSorted, wkCaptures: wkCaptures.length };
}

// Plain-language reflection when the AI key isn't set.
function buildLocalSummary(w) {
  const out = [];
  out.push(`You were active ${w.active}/7 days this week.`);
  if (w.avgReadiness != null) out.push(`Average readiness ${w.avgReadiness}/100.`);
  out.push(w.wkSessions ? `${w.wkSessions} training session${w.wkSessions > 1 ? 's' : ''} · ${w.minutes} min logged.` : 'No training logged this week — even one session keeps momentum.');
  const domains = Object.entries(w.byDomain).sort((a, b) => b[1] - a[1]);
  if (domains.length) {
    const top = LIFE_DOMAINS.find((d) => d.id === domains[0][0]);
    out.push(`Most of your captured thinking went to ${top?.name || domains[0][0]} (${domains[0][1]}).`);
    const missing = LIFE_DOMAINS.filter((d) => !w.byDomain[d.id]).map((d) => d.name);
    if (missing.length) out.push(`Nothing landed in: ${missing.join(', ')}. Intentional, or a blind spot?`);
  }
  if (w.inboxLeft) out.push(`${w.inboxLeft} thought${w.inboxLeft > 1 ? 's' : ''} still waiting in your capture inbox.`);
  if (w.usageSorted.length) {
    const least = w.usageSorted[w.usageSorted.length - 1];
    if (w.usageSorted.length > 2 && least[1] <= 1) out.push(`You barely opened ${SURFACE_NAMES[least[0]] || least[0]} this week.`);
  }
  return out.join(' ');
}

export function WeeklyReview({ open, onClose }) {
  const [w, setW] = useState(null);
  const [focus, setFocus] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [usedAI, setUsedAI] = useState(false);

  useEffect(() => {
    if (open) {
      const week = buildWeek();
      setW(week);
      setFocus(readJSON('lifeos:weeklyfocus', { text: '' }).text || '');
      setSummary(buildLocalSummary(week));
      setUsedAI(false);
    }
  }, [open]);

  if (!w) return <Sheet open={open} onClose={onClose} maxHeight="90%" />;

  const saveFocus = (val) => {
    setFocus(val);
    try { localStorage.setItem('lifeos:weeklyfocus', JSON.stringify({ text: val, ts: Date.now() })); } catch { /* */ }
  };

  const reflect = async () => {
    setLoading(true);
    const ctx = [
      `Days active: ${w.active}/7.`,
      w.avgReadiness != null ? `Avg readiness: ${w.avgReadiness}/100.` : '',
      `Training: ${w.wkSessions} sessions, ${w.minutes} min. ${Object.entries(w.discCount).map(([k, v]) => `${k} x${v}`).join(', ')}.`,
      `Attention (captures routed): ${Object.entries(w.byDomain).map(([k, v]) => `${(LIFE_DOMAINS.find((d) => d.id === k) || {}).name || k} x${v}`).join(', ') || 'none routed'}.`,
      `Domain balance: ${LIFE_DOMAINS.filter((d) => w.byDomain[d.id]).length}/${LIFE_DOMAINS.length} lit. Dark this week: ${LIFE_DOMAINS.filter((d) => !w.byDomain[d.id]).map((d) => d.name).join(', ') || 'none'}.`,
      `Inbox left: ${w.inboxLeft}.`,
      `App surface opens: ${w.usageSorted.map(([k, v]) => `${SURFACE_NAMES[k] || k} ${v}`).join(', ') || 'n/a'}.`,
    ].filter(Boolean).join('\n');
    try {
      const r = await fetch('/api/chief', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ mode: 'review', context: ctx }) });
      if (!r.ok) throw new Error('no ai');
      const data = await r.json();
      const text = (data.text || '').trim();
      if (!text) throw new Error('empty');
      setSummary(text); setUsedAI(true);
    } catch {
      setSummary(buildLocalSummary(w)); setUsedAI(false);
    }
    setLoading(false);
  };

  const domains = LIFE_DOMAINS.map((d) => ({ ...d, n: w.byDomain[d.id] || 0 }));
  const maxN = Math.max(1, ...domains.map((d) => d.n));

  const Stat = ({ label, value, accent }) => (
    <div className="hud glass" style={{ flex: 1, padding: '12px 10px', borderRadius: 12, textAlign: 'center' }}>
      <div className="display" style={{ fontSize: 22, color: accent || 'var(--text)' }}>{value}</div>
      <div className="eyebrow" style={{ marginTop: 2 }}>{label}</div>
    </div>
  );

  return (
    <Sheet open={open} onClose={onClose} maxHeight="90%">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div className="eyebrow">The week in review</div>
            <div className="display" style={{ fontSize: 24, marginTop: 2 }}>WEEKLY REVIEW</div>
          </div>
          <div className="pressable" onClick={onClose} style={{ width: 32, height: 32, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.06)', color: 'var(--muted)' }}><IconClose size={16} /></div>
        </div>

        {/* Stat row */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <Stat label="Days active" value={`${w.active}/7`} accent="var(--cyan)" />
          <Stat label="Readiness" value={w.avgReadiness != null ? w.avgReadiness : '—'} accent="var(--lime)" />
          <Stat label="Sessions" value={w.wkSessions} accent="var(--gold)" />
          <Stat label="Minutes" value={w.minutes} accent="var(--violet)" />
        </div>

        {/* Attention allocation */}
        <div className="eyebrow" style={{ marginBottom: 8 }}>Where your attention went</div>
        <div className="hud glass" style={{ padding: 14, borderRadius: 14, marginBottom: 14 }}>
          {domains.map((d) => (
            <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ width: 64, fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{d.emoji} {d.name}</span>
              <div style={{ flex: 1, height: 8, borderRadius: 999, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                <div style={{ width: `${(d.n / maxN) * 100}%`, height: '100%', background: d.color, borderRadius: 999, transition: 'width 400ms' }} />
              </div>
              <span className="mono" style={{ width: 16, textAlign: 'right', fontSize: 11, color: d.n ? d.color : 'var(--dim)' }}>{d.n}</span>
            </div>
          ))}
          <div className="eyebrow" style={{ marginTop: 4, opacity: 0.7 }}>captured thoughts routed this week</div>
        </div>

        {/* Domain balance check — which domains went dark this week */}
        {(() => {
          const dark = domains.filter((d) => d.n === 0);
          const lit = domains.length - dark.length;
          const ok = dark.length === 0;
          const warn = '#FF8A4C';
          return (
            <>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Domain balance check</div>
              <div className="hud glass" style={{ padding: 14, borderRadius: 14, marginBottom: 14, border: `1px solid ${ok ? 'rgba(52,211,153,0.4)' : 'rgba(255,138,76,0.4)'}` }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: ok ? 0 : 10 }}>
                  <span className="display" style={{ fontSize: 20, color: ok ? 'var(--lime)' : warn }}>{lit}/{domains.length}</span>
                  <span className="eyebrow">domains lit this week</span>
                </div>
                {ok ? (
                  <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.5 }}>Every domain got at least one touch. Balanced week.</div>
                ) : (
                  <>
                    <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 10 }}>
                      {dark.length === 1 ? 'One domain went dark — possible blind spot:' : `${dark.length} domains went dark — possible blind spots:`}
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {dark.map((d) => (
                        <span key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 999, background: `${d.color}1a`, border: `1px solid ${d.color}55`, color: d.color, fontSize: 11.5, fontWeight: 700 }}>
                          {d.emoji} {d.name}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </>
          );
        })()}

        {/* Reflection */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div className="eyebrow">Reflection</div>
          <div className="pressable" onClick={reflect} style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 999,
            background: 'rgba(45,212,191,0.12)', border: '1px solid rgba(45,212,191,0.4)', color: 'var(--violet)',
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
          }}><IconSparkles size={13} /> {loading ? 'THINKING…' : 'AI REFLECT'}</div>
        </div>
        <div className="hud glass" style={{ padding: 14, borderRadius: 14, marginBottom: 6 }}>
          <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{summary}</div>
        </div>
        <div className="mono" style={{ fontSize: 9, color: usedAI ? 'var(--lime)' : 'var(--dim)', letterSpacing: '0.1em', marginBottom: 16, textAlign: 'center' }}>
          {usedAI ? '● REFLECTED BY AI · FROM YOUR WEEK' : '○ SUMMARY FROM YOUR DATA'}
        </div>

        {/* One focus for next week */}
        <div className="eyebrow" style={{ marginBottom: 8 }}>One focus for next week</div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 14,
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(69,183,232,0.4)', marginBottom: 18,
          boxShadow: '0 0 30px -12px rgba(69,183,232,0.5)',
        }}>
          <IconCompass size={18} color="var(--cyan)" />
          <input
            value={focus}
            onChange={(e) => saveFocus(e.target.value)}
            placeholder="What's the one thing that would make next week a win?"
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 14, fontFamily: 'var(--font-body)' }}
          />
        </div>

        {/* Act on it — turn intentions into scheduled time */}
        <div className="eyebrow" style={{ marginBottom: 8 }}>Act on it</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
          {focus.trim() && (
            <div className="pressable" onClick={() => openExternal(googleCalendarUrl({ title: focus.trim(), date: tomorrow9(), time: '09:00', durationMin: 90, details: "This week's focus, from your LifeOS review." }))}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 13px', borderRadius: 999, background: 'rgba(69,183,232,0.14)', border: '1px solid rgba(69,183,232,0.5)', color: 'var(--cyan)', fontSize: 12, fontWeight: 700 }}>
              <IconCalendar size={13} /> Block focus time
            </div>
          )}
          {domains.filter((d) => d.n === 0).slice(0, 2).map((d) => (
            <div key={d.id} className="pressable" onClick={() => openExternal(googleCalendarUrl({ title: `Time for ${d.name}`, date: tomorrow9(), time: '09:00', durationMin: 60, details: `${d.name} got no attention last week — protect time for it.` }))}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 13px', borderRadius: 999, background: `${d.color}1a`, border: `1px solid ${d.color}66`, color: d.color, fontSize: 12, fontWeight: 700 }}>
              <IconCalendar size={13} /> Plan {d.emoji} {d.name}
            </div>
          ))}
          {!focus.trim() && domains.every((d) => d.n > 0) && (
            <div className="eyebrow" style={{ opacity: 0.6 }}>set a focus above to schedule it →</div>
          )}
        </div>

        <div style={{ height: 8 }} />
    </Sheet>
  );
}
