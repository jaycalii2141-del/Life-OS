// ─────────────────────────────────────────────────────────
// ObjectMenu — the contextual action layer for an "interactive object".
// Long-press any major card → this springs up with the verbs that make
// sense for it. AI actions run inline: thinking dots → the answer types
// itself out right here, no jump to a chat window.
//
// actions: [{ id, icon, label, hint, tone?, ai?, run }]
//   ai:false → run() fires and the menu closes (navigate / edit / toggle)
//   ai:true  → run() returns a Promise<string>; the text streams in place
// ─────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { Sheet } from './Sheet.jsx';
import { IconClose, IconSparkles, IconChevronRight, IconArrowRight } from './icons.jsx';

export function ObjectMenu({ open, onClose, title, subtitle, accent = 'var(--cyan)', actions = [], onPrimary, primaryLabel }) {
  const [view, setView] = useState('menu');   // 'menu' | 'thinking' | 'result'
  const [label, setLabel] = useState('');
  const [result, setResult] = useState('');
  const [shown, setShown] = useState('');

  useEffect(() => { if (open) { setView('menu'); setResult(''); setShown(''); } }, [open]);

  // Typewriter reveal — gives AI answers a living, streaming feel.
  useEffect(() => {
    if (view !== 'result' || !result) return;
    setShown('');
    let i = 0;
    const id = setInterval(() => {
      i += 2;
      setShown(result.slice(0, i));
      if (i >= result.length) clearInterval(id);
    }, 12);
    return () => clearInterval(id);
  }, [view, result]);

  const choose = async (a) => {
    if (!a.ai) { a.run?.(); onClose?.(); return; }
    setLabel(a.label);
    setView('thinking');
    try {
      const text = await a.run();
      setResult((text && String(text).trim()) || 'Nothing came back — try again in a moment.');
    } catch {
      setResult('Could not reach the AI just now. Give it a second and try again.');
    }
    setView('result');
  };

  const typing = shown.length < result.length;

  return (
    <Sheet open={open} onClose={onClose} maxHeight="86%">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
        <div style={{ minWidth: 0 }}>
          <div className="eyebrow" style={{ color: accent }}>{view === 'result' ? label : 'Actions'}</div>
          <div className="display" style={{ fontSize: 22, marginTop: 2, lineHeight: 1.1, textWrap: 'pretty' }}>{title}</div>
          {subtitle && view === 'menu' && <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 4, lineHeight: 1.4 }}>{subtitle}</div>}
        </div>
        <div className="pressable" onClick={onClose} style={{ width: 32, height: 32, borderRadius: 999, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.06)', color: 'var(--muted)' }}><IconClose size={16} /></div>
      </div>

      {view === 'menu' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {actions.map((a, i) => (
            <div key={a.id} className="pressable action-in" onClick={() => choose(a)}
              style={{
                animationDelay: `${i * 32}ms`,
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 13px', borderRadius: 13,
                background: 'rgba(255,255,255,0.035)', border: '1px solid var(--line)',
              }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: a.ai ? `${accent}1c` : 'rgba(255,255,255,0.05)', color: a.ai ? accent : 'var(--muted)' }}>
                {a.icon || <IconSparkles size={15} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 650, color: 'var(--text)' }}>{a.label}</div>
                {a.hint && <div style={{ fontSize: 11, color: 'var(--dim)', marginTop: 1 }}>{a.hint}</div>}
              </div>
              {a.ai
                ? <IconSparkles size={14} color={accent} style={{ flexShrink: 0, opacity: 0.8 }} />
                : <IconChevronRight size={15} color="var(--dim)" style={{ flexShrink: 0 }} />}
            </div>
          ))}
        </div>
      )}

      {view === 'thinking' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '18px 4px', color: accent }}>
          <span className="think-dot" /><span className="think-dot" /><span className="think-dot" />
          <span className="mono" style={{ fontSize: 11, letterSpacing: '0.1em', color: 'var(--muted)', marginLeft: 4 }}>THINKING…</span>
        </div>
      )}

      {view === 'result' && (
        <div className="unfold">
          <div className={typing ? 'ai-caret' : ''} style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{shown}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            {onPrimary && !typing && (
              <div className="pressable" onClick={() => { onPrimary(result); onClose?.(); }} style={{
                flex: 1, height: 46, borderRadius: 13, background: `linear-gradient(135deg, ${accent}, #45B7E8)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, color: '#0A0B0D', fontWeight: 800, fontSize: 13, letterSpacing: '0.04em',
              }}>{primaryLabel || 'Use this'} <IconArrowRight size={15} stroke={2.4} /></div>
            )}
            <div className="pressable" onClick={() => setView('menu')} style={{
              padding: '0 18px', height: 46, borderRadius: 13, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--line-strong)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontWeight: 700, fontSize: 13,
            }}>Back</div>
          </div>
        </div>
      )}

      <div style={{ height: 6 }} />
    </Sheet>
  );
}
