// "Build my session" — AI coach that reads your skill tree, recent
// sessions and readiness, then designs today's training. Falls back to a
// solid deterministic builder when the AI key isn't set.
import { useState } from 'react';
import { IconClose, IconCheck, IconActivity, IconWarn } from './components/icons.jsx';
import { DISCIPLINES } from './data.js';
import { analyzeBlindspots, drillsFor, fundamentalsFor } from './coaching.js';
import { celebrate } from './lib/haptics.js';
import { Sheet } from './components/Sheet.jsx';
import { todayKey } from './usePersistentState.js';

// Pick the tier to train for a discipline: the active skill's tier,
// else the next locked skill's tier, else Foundation.
function trainTier(list) {
  const active = list.find((s) => s.status === 'active');
  if (active) return active.tier;
  const next = list.find((s) => s.status === 'locked');
  return next ? next.tier : 'Foundation';
}

function readJSON(key, fb) {
  try { const r = localStorage.getItem(key); return r != null ? JSON.parse(r) : fb; } catch { return fb; }
}

function readiness() {
  const d = readJSON(`lifeos:daily:${todayKey()}`, {});
  if (d.energy == null) return null;
  return { score: Math.round(((d.energy + d.focus + d.body + d.mood) / 40) * 100), body: d.body, energy: d.energy };
}

// Compact text summary of the skill tree for the chosen focus.
function buildContext(skills, focusId, duration) {
  const r = readiness();
  const sessions = readJSON('lifeos:sessions', []).slice(0, 5);
  const discs = focusId === 'all' ? DISCIPLINES : DISCIPLINES.filter((d) => d.id === focusId);
  const lines = [];
  lines.push(`Focus: ${focusId === 'all' ? 'mixed / full body' : discs[0]?.name}. Time available: ${duration} min.`);
  if (r) lines.push(`Readiness today: ${r.score}/100 (body ${r.body}/10, energy ${r.energy}/10).`);
  for (const d of discs) {
    const list = skills[d.id] || [];
    const active = list.filter((s) => s.status === 'active');
    const next = list.find((s) => s.status === 'locked');
    const mastered = list.filter((s) => s.status === 'done').length;
    lines.push(
      `${d.name}: ${mastered} mastered. ` +
      `Active → ${active.length ? active.map((s) => `${s.name} (${s.pct}%, cue: ${s.cue})`).join('; ') : 'none'}. ` +
      `Next up → ${next ? `${next.name} (${next.tier}, cue: ${next.cue})` : 'progression complete'}.`
    );
  }
  if (sessions.length) lines.push(`Recent sessions: ${sessions.map((s) => `${s.disciplineName || s.discipline} ${s.duration}min`).join(', ')}.`);

  // Blindspots the coach should actively address.
  const blindspots = analyzeBlindspots(skills, readJSON('lifeos:sessions', []), r ? r.score : null, DISCIPLINES);
  if (blindspots.length) lines.push(`Blindspots to address: ${blindspots.map((b) => `[${b.sev}] ${b.title} — ${b.fix}`).join(' | ')}`);

  // Concrete drills for the focus discipline(s) at the relevant tier.
  for (const d of discs) {
    const tier = trainTier(skills[d.id] || []);
    const dr = drillsFor(d.id, tier);
    if (dr.length) lines.push(`${d.name} ${tier} drill progression (in order): ${dr.map((x) => `${x.name} — ${x.cue} [common fault: ${x.fault}] [advance when: ${x.gate}]`).join(' | ')}`);
    const fund = fundamentalsFor(d.id);
    if (fund.length) lines.push(`${d.name} core fundamentals to keep developing (athletic + technical bedrock): ${fund.map((f) => f.name).join('; ')}. Program some of these into the session, not just tricks.`);
  }
  return lines.join('\n');
}

// Deterministic session when the AI isn't available.
function buildLocal(skills, focusId, duration) {
  const r = readiness();
  const discs = focusId === 'all' ? DISCIPLINES.slice(0, 3) : DISCIPLINES.filter((d) => d.id === focusId);
  const low = r && r.score < 55;
  const out = [];
  out.push(`TODAY · ${focusId === 'all' ? 'MIXED MOVEMENT' : (discs[0]?.name || '').toUpperCase()} · ${duration} MIN`);
  if (r) out.push(low ? `Readiness ${r.score}/100 — keep it technical, cap impact today.` : `Readiness ${r.score}/100 — green light to work hard.`);
  out.push('');
  out.push('PREP / WARM-UP (8–12 min)');
  out.push('• Pulse raise + joint circles (wrists, shoulders, hips, ankles)');
  out.push('• Hollow/arch holds + handstand or wall drills to wake the line');
  out.push('');
  out.push('PRIMARY SKILL WORK');
  for (const d of discs) {
    const list = skills[d.id] || [];
    const active = list.filter((s) => s.status === 'active');
    const next = list.find((s) => s.status === 'locked');
    out.push(`— ${d.name} —`);
    if (active.length) {
      active.slice(0, 2).forEach((s) => {
        const sets = low ? '3–4 quality reps' : '5–6 sets, 2–3 reps';
        out.push(`• ${s.name} (${s.pct}%): ${sets}. Cue: ${s.cue}.`);
      });
    } else {
      out.push('• No active skill set — pick one from the tree to focus.');
    }
    if (next && !low) out.push(`• Next progression: attempt ${next.name} (${next.cue}).`);
    // Drills that build this discipline at its working tier (in teaching order).
    const dr = drillsFor(d.id, trainTier(list)).slice(0, 2);
    dr.forEach((x) => out.push(`  ↳ ${x.name} — ${x.cue}  (✓ ${x.gate})`));
  }
  out.push('');
  out.push('SUPPORTING STRENGTH (10–15 min)');
  out.push(low ? '• Light tempo: core line, mobility, light pulls/holds.' : '• Straight-arm strength + PULL work to balance push + explosive pulls/jumps.');
  out.push('• Landing/eccentric: a few quiet depth landings — protect the knees.');
  out.push('');
  out.push('COOL-DOWN (5–8 min)');
  out.push('• Down-regulate breathing, mobilize the tissues you loaded, hydrate.');

  // The single blindspot to keep front of mind.
  const blindspots = analyzeBlindspots(skills, readJSON('lifeos:sessions', []), r ? r.score : null, DISCIPLINES);
  const top = blindspots.find((b) => b.sev === 'high') || blindspots.find((b) => b.sev === 'med') || blindspots[0];
  if (top) { out.push(''); out.push(`⚠ BLINDSPOT: ${top.title} — ${top.fix}`); }
  out.push('');
  out.push('— Built from your skill tree. Add your Anthropic key for full AI coaching.');
  return out.join('\n');
}

export function CoachSheet({ open, onClose, skills, onLog }) {
  const [focus, setFocus] = useState('all');
  const [duration, setDuration] = useState(60);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState('');
  const [usedAI, setUsedAI] = useState(false);
  const [bsOpen, setBsOpen] = useState(true);

  const blindspots = analyzeBlindspots(skills, readJSON('lifeos:sessions', []), readiness()?.score ?? null, DISCIPLINES);
  const sevColor = (s) => (s === 'high' ? 'var(--ona-red)' : s === 'med' ? 'var(--gold)' : 'var(--cyan)');

  const generate = async () => {
    setLoading(true); setPlan('');
    const context = buildContext(skills, focus, duration);
    try {
      const resp = await fetch('/api/coach', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ context }) });
      if (!resp.ok) throw new Error('no ai');
      const data = await resp.json();
      const text = (data.text || '').trim();
      if (!text) throw new Error('empty');
      setPlan(text); setUsedAI(true);
    } catch {
      setPlan(buildLocal(skills, focus, duration)); setUsedAI(false);
    }
    setLoading(false);
  };

  const logIt = () => {
    const d = DISCIPLINES.find((x) => x.id === focus);
    onLog?.({ id: Date.now(), discipline: focus === 'all' ? 'mixed' : focus, disciplineName: d?.name || 'Mixed', duration, intensity: 7, date: new Date().toISOString() });
    celebrate();
    onClose?.();
  };

  return (
    <Sheet open={open} onClose={onClose} maxHeight="88%">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div className="eyebrow">AI Coach</div>
            <div className="display" style={{ fontSize: 24, marginTop: 2 }}>BUILD MY SESSION</div>
          </div>
          <div className="pressable" onClick={onClose} style={{ width: 32, height: 32, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.06)', color: 'var(--muted)' }}><IconClose size={16} /></div>
        </div>

        {/* Focus */}
        <div className="eyebrow" style={{ marginBottom: 8 }}>Focus</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
          {[{ id: 'all', name: 'Mixed', color: '#45B7E8' }, ...DISCIPLINES].map((d) => {
            const on = focus === d.id;
            return (
              <div key={d.id} className="pressable" onClick={() => setFocus(d.id)} style={{
                padding: '6px 11px', borderRadius: 999, fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
                background: on ? `${d.color}20` : 'rgba(255,255,255,0.04)', border: `1px solid ${on ? d.color : 'var(--line)'}`,
                color: on ? d.color : 'var(--muted)',
              }}>{d.name}</div>
            );
          })}
        </div>

        {/* Duration */}
        <div className="eyebrow" style={{ marginBottom: 8 }}>Time available</div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {[30, 45, 60, 90, 120].map((m) => (
            <div key={m} className="pressable" onClick={() => setDuration(m)} style={{
              flex: 1, padding: '9px 0', textAlign: 'center', borderRadius: 10,
              background: duration === m ? 'rgba(69,183,232,0.15)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${duration === m ? 'rgba(69,183,232,0.6)' : 'var(--line)'}`,
              color: duration === m ? 'var(--cyan)' : 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700,
            }}>{m}</div>
          ))}
        </div>

        <div className="pressable" onClick={generate} style={{
          height: 50, borderRadius: 14, background: 'linear-gradient(135deg, #45B7E8 0%, #34D399 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#0A0B0D',
          fontWeight: 800, fontSize: 14, letterSpacing: '0.14em', textTransform: 'uppercase', opacity: loading ? 0.6 : 1,
          boxShadow: '0 10px 30px -10px rgba(69,183,232,0.5)',
        }}>
          <IconActivity size={18} stroke={2.4} />
          {loading ? 'Coaching…' : plan ? 'Regenerate' : 'Build session'}
        </div>

        {/* Blindspots — what your coach is watching, always on */}
        {blindspots.length > 0 && (
          <div className="hud glass" style={{ marginTop: 16, padding: 14, borderRadius: 14, border: '1px solid rgba(233,196,106,0.22)' }}>
            <div className="pressable" onClick={() => setBsOpen((o) => !o)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <IconWarn size={15} color="var(--gold)" />
                <span className="eyebrow" style={{ color: 'var(--gold)' }}>Blindspots your coach is watching</span>
              </div>
              <span className="mono" style={{ fontSize: 9, color: 'var(--dim)' }}>{blindspots.length}</span>
            </div>
            {bsOpen && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                {blindspots.slice(0, 4).map((b, i) => (
                  <div key={i} style={{ display: 'flex', gap: 9 }}>
                    <span style={{ width: 6, height: 6, borderRadius: 999, background: sevColor(b.sev), marginTop: 5, flexShrink: 0, boxShadow: `0 0 6px ${sevColor(b.sev)}` }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{b.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.45, marginTop: 1 }}>{b.detail}</div>
                      <div style={{ fontSize: 12, color: sevColor(b.sev), lineHeight: 1.45, marginTop: 3 }}>→ {b.fix}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {plan && (
          <div style={{ marginTop: 16 }}>
            <div className="hud glass" style={{ padding: 14, borderRadius: 14 }}>
              <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{plan}</div>
            </div>
            <div className="mono" style={{ fontSize: 9, color: usedAI ? 'var(--lime)' : 'var(--dim)', letterSpacing: '0.1em', marginTop: 8, textAlign: 'center' }}>
              {usedAI ? '● COACHED BY AI · FROM YOUR DATA' : '○ BUILT FROM YOUR SKILL TREE'}
            </div>
            <div className="pressable" onClick={logIt} style={{
              marginTop: 10, height: 46, borderRadius: 12, background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--lime)',
              fontWeight: 700, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>
              <IconCheck size={16} stroke={2.4} /> Log this session
            </div>
          </div>
        )}

        <div style={{ height: 10 }} />
    </Sheet>
  );
}
