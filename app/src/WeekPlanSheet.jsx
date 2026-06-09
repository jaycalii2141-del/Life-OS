// "Plan my week" — periodization. Shows a sound movement-athlete
// microcycle + the principles behind it, and can personalize the week
// with AI from your skill tree, blindspots, and chosen training days.
import { useState } from 'react';
import { IconClose, IconCheck, IconCalendar, IconSparkles, IconChevronDown } from './components/icons.jsx';
import { DISCIPLINES } from './data.js';
import { WEEK_TEMPLATE, PROGRAMMING_PRINCIPLES, analyzeBlindspots } from './coaching.js';
import { todayKey } from './usePersistentState.js';

function readJSON(key, fb) {
  try { const r = localStorage.getItem(key); return r != null ? JSON.parse(r) : fb; } catch { return fb; }
}
function readinessScore() {
  const d = readJSON(`lifeos:daily:${todayKey()}`, {});
  if (d.energy == null) return null;
  return Math.round(((d.energy + d.focus + d.body + d.mood) / 40) * 100);
}

const IMPACT_COLOR = { high: '#FF0033', med: '#FFD23C', low: '#00D4FF', recovery: '#B14CFF', rest: 'var(--muted)' };

function buildContext(skills, days, priorityId) {
  const r = readinessScore();
  const lines = [];
  const pri = DISCIPLINES.find((d) => d.id === priorityId);
  lines.push(`Train ${days} days/week. Priority discipline: ${priorityId === 'all' ? 'balanced all-around' : pri?.name}.`);
  if (r != null) lines.push(`Current readiness: ${r}/100.`);
  for (const d of DISCIPLINES) {
    const list = skills[d.id] || [];
    const active = list.filter((s) => s.status === 'active');
    if (active.length) lines.push(`${d.name} active: ${active.map((s) => `${s.name} (${s.pct}%)`).join(', ')}.`);
  }
  const bs = analyzeBlindspots(skills, readJSON('lifeos:sessions', []), r, DISCIPLINES);
  if (bs.length) lines.push(`Blindspots to weave in: ${bs.map((b) => b.title).join('; ')}.`);
  return lines.join('\n');
}

export function WeekPlanSheet({ open, onClose, skills }) {
  const [days, setDays] = useState(5);
  const [priority, setPriority] = useState('all');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState('');
  const [showPrinciples, setShowPrinciples] = useState(false);

  if (!open) return null;

  const generate = async () => {
    setLoading(true); setPlan('');
    try {
      const r = await fetch('/api/coach', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ mode: 'week', context: buildContext(skills, days, priority) }) });
      if (!r.ok) throw new Error('no ai');
      const data = await r.json();
      const text = (data.text || '').trim();
      if (!text) throw new Error('empty');
      setPlan(text);
    } catch {
      setPlan(''); // fall back to the visual template below
    }
    setLoading(false);
  };

  const focusChips = [{ id: 'all', name: 'Balanced', color: '#00D4FF' }, ...DISCIPLINES];

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="sheet" style={{ maxHeight: '90%', overflowY: 'auto' }}>
        <div className="sheet-handle" />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div className="eyebrow">Periodization</div>
            <div className="display" style={{ fontSize: 24, marginTop: 2 }}>PLAN MY WEEK</div>
          </div>
          <div className="pressable" onClick={onClose} style={{ width: 32, height: 32, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.06)', color: 'var(--muted)' }}><IconClose size={16} /></div>
        </div>

        {/* Training days */}
        <div className="eyebrow" style={{ marginBottom: 8 }}>Training days / week</div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          {[3, 4, 5, 6].map((n) => (
            <div key={n} className="pressable" onClick={() => setDays(n)} style={{
              flex: 1, padding: '9px 0', textAlign: 'center', borderRadius: 10,
              background: days === n ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${days === n ? 'rgba(0,212,255,0.6)' : 'var(--line)'}`,
              color: days === n ? 'var(--cyan)' : 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700,
            }}>{n}</div>
          ))}
        </div>

        {/* Priority */}
        <div className="eyebrow" style={{ marginBottom: 8 }}>This week's priority</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
          {focusChips.map((d) => {
            const on = priority === d.id;
            return (
              <div key={d.id} className="pressable" onClick={() => setPriority(d.id)} style={{
                padding: '6px 11px', borderRadius: 999, fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
                background: on ? `${d.color}20` : 'rgba(255,255,255,0.04)', border: `1px solid ${on ? d.color : 'var(--line)'}`, color: on ? d.color : 'var(--muted)',
              }}>{d.name}</div>
            );
          })}
        </div>

        <div className="pressable" onClick={generate} style={{
          height: 50, borderRadius: 14, background: 'linear-gradient(135deg, #B14CFF 0%, #00D4FF 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#06060A',
          fontWeight: 800, fontSize: 14, letterSpacing: '0.14em', textTransform: 'uppercase', opacity: loading ? 0.6 : 1,
          boxShadow: '0 10px 30px -10px rgba(177,76,255,0.5)',
        }}>
          <IconSparkles size={18} />{loading ? 'Planning…' : 'Personalize with AI'}
        </div>

        {/* AI plan (when available) */}
        {plan && (
          <div className="hud glass" style={{ marginTop: 16, padding: 14, borderRadius: 14 }}>
            <div className="mono" style={{ fontSize: 9, color: 'var(--lime)', letterSpacing: '0.1em', marginBottom: 8 }}>● YOUR PERIODIZED WEEK · FROM YOUR DATA</div>
            <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{plan}</div>
          </div>
        )}

        {/* Recommended template (always shown as the proven structure) */}
        <div className="eyebrow" style={{ margin: '18px 0 10px' }}>{plan ? 'The structure it follows' : 'Recommended microcycle'}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {WEEK_TEMPLATE.map((d, i) => {
            const c = IMPACT_COLOR[d.impact] || 'var(--muted)';
            const dim = d.impact !== 'rest' && i >= days && d.impact !== 'recovery'; // soften days beyond chosen count
            return (
              <div key={i} className="hud glass" style={{ padding: '11px 13px', borderRadius: 12, borderLeft: `3px solid ${c}`, opacity: dim ? 0.5 : 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{d.day}</div>
                  <span className="mono" style={{ fontSize: 8, color: c, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{d.impact}</span>
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 3, lineHeight: 1.4 }}>{d.focus}</div>
                <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {d.includes.map((it, j) => (
                    <div key={j} style={{ fontSize: 11.5, color: 'var(--text)', lineHeight: 1.4, display: 'flex', gap: 6 }}>
                      <span style={{ color: c }}>•</span><span>{it}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Principles */}
        <div className="hud glass" style={{ marginTop: 12, padding: '11px 13px', borderRadius: 12 }}>
          <div className="pressable" onClick={() => setShowPrinciples((s) => !s)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="eyebrow" style={{ color: 'var(--gold)' }}>The principles behind it</span>
            <IconChevronDown size={15} style={{ transform: showPrinciples ? 'none' : 'rotate(-90deg)', transition: 'transform 200ms', color: 'var(--muted)' }} />
          </div>
          {showPrinciples && (
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {PROGRAMMING_PRINCIPLES.map((p, i) => (
                <div key={i} style={{ fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.45, display: 'flex', gap: 7 }}>
                  <span style={{ color: 'var(--gold)', fontWeight: 800 }}>{i + 1}</span><span>{p}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ height: 10 }} />
      </div>
    </>
  );
}
