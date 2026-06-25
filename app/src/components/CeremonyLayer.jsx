// ─────────────────────────────────────────────────────────
// CeremonyLayer — stages the rare, earned moments. The world stills, light
// blooms, the achievement rises, a haptic crescendo lands. Mounted once in
// the shell; listens for 'jamhq:ceremony' events.
// ─────────────────────────────────────────────────────────
import { useState, useEffect, useRef } from 'react';
import { dayComplete } from '../lib/haptics.js';

export function CeremonyLayer() {
  const [cer, setCer] = useState(null);
  const timerRef = useRef(null);
  useEffect(() => {
    const on = (e) => {
      setCer(e.detail || {});
      try { dayComplete(); } catch { /* */ }
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCer(null), 2600);
    };
    window.addEventListener('jamhq:ceremony', on);
    return () => { window.removeEventListener('jamhq:ceremony', on); clearTimeout(timerRef.current); };
  }, []);

  if (!cer) return null;
  return (
    <div onClick={() => setCer(null)} style={{
      position: 'absolute', inset: 0, zIndex: 80,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(6,7,9,0.8)', backdropFilter: 'blur(9px)', WebkitBackdropFilter: 'blur(9px)',
      animation: 'scrimIn 280ms ease',
    }}>
      <div style={{ position: 'relative', textAlign: 'center', padding: '0 30px' }}>
        <div className="ceremony-bloom" style={{ width: 260, height: 260, margin: '-130px 0 0 -130px' }} />
        <div className="ceremony-text" style={{ position: 'relative' }}>
          <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 10, color: 'var(--lime)', letterSpacing: '0.14em', marginBottom: 14 }}>{cer.kicker || 'MILESTONE'}</div>
          <div className="serif" style={{ fontSize: 34, color: 'var(--text)', lineHeight: 1.08, textWrap: 'pretty' }}>{cer.title}</div>
          {cer.subtitle && <div style={{ fontSize: 13.5, color: 'var(--text-2)', marginTop: 12, lineHeight: 1.5 }}>{cer.subtitle}</div>}
          <div className="eyebrow" style={{ color: 'var(--dim)', marginTop: 18 }}>tap to continue</div>
        </div>
      </div>
    </div>
  );
}
