// Goal decomposition — name a big goal, the AI breaks it into a sequenced
// progression of milestones you can review, edit, and save as a real mission
// (quest). Works on a deterministic scaffold before the AI key is set.
import { useState } from 'react';
import { Sheet } from './components/Sheet.jsx';
import { IconSparkles, IconCheck, IconPlus, IconClose, IconTrash, IconArrowRight, domainIcon } from './components/icons.jsx';
import { LIFE_MAP_DOMAINS } from './lib/quests.js';
import { celebrate } from './lib/haptics.js';
import { aiFetch } from './lib/api.js';

function readJSON(key, fb) {
  try { const r = localStorage.getItem(key); return r != null ? JSON.parse(r) : fb; } catch { return fb; }
}

// A clean scaffold when the AI isn't available — still useful, still ordered.
function buildLocal(goal) {
  const g = goal.trim().replace(/\.$/, '');
  return {
    title: g,
    why: 'A goal worth committing to — broken into a path you can actually walk.',
    milestones: [
      `Define exactly what "done" looks like for: ${g}`,
      'Identify the single biggest blocker and the first concrete step',
      'Build the weekly habit/rep that drives it forward',
      'Hit the halfway marker — prove it\'s working',
      `Final push — ${g}`,
    ],
  };
}

function lightContext(domain) {
  const lines = [];
  if (domain === 'athlete') {
    const skills = readJSON('lifeos:skills:v2', {});
    const active = [];
    Object.values(skills).forEach((arr) => (arr || []).forEach((s) => { if (s.status === 'active') active.push(`${s.name} ${s.pct}%`); }));
    if (active.length) lines.push(`Currently training: ${active.slice(0, 6).join(', ')}.`);
  }
  if (domain === 'business') {
    const ona = readJSON('lifeos:ona', {});
    if (ona.stats) lines.push(`ONA: ${ona.stats.members} members, $${ona.stats.mrr} MRR.`);
  }
  return lines.join(' ');
}

export function GoalDecomposer({ open, onClose, onAddQuest }) {
  const [goal, setGoal] = useState('');
  const [domain, setDomain] = useState('athlete');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { title, why, milestones:[] }
  const [usedAI, setUsedAI] = useState(false);

  const reset = () => { setGoal(''); setResult(null); setUsedAI(false); };
  const close = () => { onClose?.(); setTimeout(reset, 300); };

  const decompose = async () => {
    if (!goal.trim() || loading) return;
    setLoading(true);
    try {
      const r = await aiFetch('/api/decompose', { goal, domain, context: lightContext(domain) });
      if (!r.ok) throw new Error('no ai');
      const data = await r.json();
      if (!Array.isArray(data.milestones) || !data.milestones.length) throw new Error('empty');
      setResult({ title: data.title || goal.trim(), why: data.why || '', milestones: data.milestones });
      setUsedAI(true);
    } catch {
      setResult(buildLocal(goal)); setUsedAI(false);
    }
    setLoading(false);
  };

  const editMs = (i, v) => setResult((r) => ({ ...r, milestones: r.milestones.map((m, j) => (j === i ? v : m)) }));
  const delMs = (i) => setResult((r) => ({ ...r, milestones: r.milestones.filter((_, j) => j !== i) }));
  const addMs = () => setResult((r) => ({ ...r, milestones: [...r.milestones, ''] }));

  const save = () => {
    const dom = LIFE_MAP_DOMAINS.find((d) => d.id === domain) || LIFE_MAP_DOMAINS[0];
    const ms = (result.milestones || []).map((t) => t.trim()).filter(Boolean);
    if (!ms.length) return;
    onAddQuest?.({
      id: `goal-${Date.now()}`,
      domain: dom.id,
      icon: dom.icon,
      title: result.title.trim() || goal.trim(),
      why: result.why.trim(),
      milestones: ms.map((t, i) => ({ id: i + 1, text: t, done: false })),
    });
    celebrate();
    close();
  };

  const inputStyle = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', borderRadius: 10, padding: '11px 13px', color: 'var(--text)', fontSize: 15, outline: 'none', fontFamily: 'var(--font-body)', boxSizing: 'border-box' };

  return (
    <Sheet open={open} onClose={close} maxHeight="90%">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <div className="eyebrow" style={{ color: 'var(--cyan)' }}>Goal decomposition</div>
          <div className="display" style={{ fontSize: 24, marginTop: 1 }}>BREAK IT DOWN</div>
        </div>
        <div className="pressable" onClick={close} style={{ width: 32, height: 32, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.06)', color: 'var(--muted)' }}><IconClose size={16} /></div>
      </div>

      {/* Goal input */}
      <div className="eyebrow" style={{ marginBottom: 8 }}>What's the goal?</div>
      <input value={goal} onChange={(e) => setGoal(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && decompose()}
        placeholder="e.g. Land a standing back tuck · $30k Podium month" style={inputStyle} />

      {/* Domain */}
      <div className="eyebrow" style={{ margin: '14px 0 8px' }}>Domain</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        {LIFE_MAP_DOMAINS.map((d) => {
          const on = domain === d.id;
          return (
            <div key={d.id} className="pressable" onClick={() => setDomain(d.id)} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '6px 11px', borderRadius: 999, fontSize: 11, fontWeight: 700,
              background: on ? `${d.color}1f` : 'rgba(255,255,255,0.04)', border: `1px solid ${on ? d.color : 'var(--line)'}`,
              color: on ? d.color : 'var(--muted)',
            }}>{(() => { const K = domainIcon(d.id); return <K size={13} stroke={2} />; })()} {d.name}</div>
          );
        })}
      </div>

      <div className="pressable" onClick={decompose} style={{
        height: 50, borderRadius: 14, background: goal.trim() ? 'linear-gradient(135deg, #45B7E8, #2DD4BF)' : 'rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: goal.trim() ? '#0A0B0D' : 'var(--dim)',
        fontWeight: 800, fontSize: 14, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: loading ? 0.7 : 1,
      }}>
        <IconSparkles size={18} className={loading ? 'blink' : ''} /> {loading ? 'Mapping the path…' : result ? 'Re-map' : 'Break it down'}
      </div>

      {/* Result — editable progression */}
      {result && (
        <div style={{ marginTop: 16 }}>
          <div className="mono" style={{ fontSize: 9, color: usedAI ? 'var(--lime)' : 'var(--dim)', letterSpacing: '0.1em', marginBottom: 8 }}>
            {usedAI ? '● MAPPED BY AI · YOUR PROGRESSION' : '○ STARTER SCAFFOLD · ADD AI KEY FOR A TAILORED PATH'}
          </div>
          {result.why && <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 12 }}>{result.why}</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {result.milestones.map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span style={{ width: 22, height: 22, borderRadius: 999, flexShrink: 0, background: 'rgba(69,183,232,0.14)', border: '1px solid rgba(69,183,232,0.4)', color: 'var(--cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700 }}>{i + 1}</span>
                <input value={m} onChange={(e) => editMs(i, e.target.value)} style={{ ...inputStyle, fontSize: 13, padding: '9px 11px' }} />
                <div className="pressable" onClick={() => delMs(i)} style={{ color: 'var(--dim)', flexShrink: 0 }}><IconTrash size={15} /></div>
              </div>
            ))}
          </div>
          <div className="pressable" onClick={addMs} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10, color: 'var(--cyan)', fontSize: 12, fontWeight: 600 }}>
            <IconPlus size={14} /> Add a milestone
          </div>

          <div className="pressable" onClick={save} style={{
            marginTop: 16, height: 50, borderRadius: 14, background: 'linear-gradient(135deg, #34D399, #45B7E8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#0A0B0D',
            fontWeight: 800, fontSize: 14, letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
            <IconCheck size={18} stroke={2.4} /> Add as mission <IconArrowRight size={16} stroke={2.4} />
          </div>
          <div className="eyebrow" style={{ textAlign: 'center', color: 'var(--dim)', marginTop: 10 }}>it becomes a campaign on Command — the engine pulls its next step into your daily mission</div>
        </div>
      )}

      <div style={{ height: 8 }} />
    </Sheet>
  );
}
