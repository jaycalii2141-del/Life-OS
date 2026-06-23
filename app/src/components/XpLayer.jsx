// ─────────────────────────────────────────────────────────
// XpLayer — listens for 'jamhq:xp' events and floats a "+N XP" reward near
// the top of the headquarters. Mounted once in the app shell; purely visual.
// ─────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';

export function XpLayer() {
  const [floats, setFloats] = useState([]);
  useEffect(() => {
    const on = (e) => {
      const f = { id: e.detail.id, amount: e.detail.amount, label: e.detail.label };
      setFloats((list) => [...list, f]);
      setTimeout(() => setFloats((list) => list.filter((x) => x.id !== f.id)), 1200);
    };
    window.addEventListener('jamhq:xp', on);
    return () => window.removeEventListener('jamhq:xp', on);
  }, []);

  if (!floats.length) return null;
  return (
    <div style={{ position: 'absolute', top: '13%', left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, pointerEvents: 'none', zIndex: 60 }}>
      {floats.map((f) => (
        <div key={f.id} className="xp-float">
          +{f.amount} XP{f.label ? ` · ${String(f.label).toUpperCase()}` : ''}
        </div>
      ))}
    </div>
  );
}
