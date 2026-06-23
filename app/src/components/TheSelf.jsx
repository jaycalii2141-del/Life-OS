// ─────────────────────────────────────────────────────────
// The Self — the living identity artifact at the heart of JAM HQ.
//
// Its SHAPE is your eight-domain balance (each facet pushes the aura out),
// its GLOW is your Becoming, its EDGE COLOR is your trajectory, and it
// breathes. The emotional centerpiece of the Becoming Engine — the thing
// that visually represents who you're becoming.
// ─────────────────────────────────────────────────────────
import { useCountUp } from './atoms.jsx';

export function TheSelf({ facets = [], becoming = 0, level, trend = 'steady', size = 196 }) {
  const cx = size / 2, cy = size / 2;
  const n = facets.length || 8;
  const baseR = size * 0.17;
  const maxR = size * 0.40;

  const pts = (facets.length ? facets : Array.from({ length: 8 }, () => ({ score: 0 }))).map((f, i) => {
    const ang = -Math.PI / 2 + (i / n) * Math.PI * 2;
    const r = baseR + (Math.max(0, Math.min(100, f.score || 0)) / 100) * (maxR - baseR);
    return [cx + r * Math.cos(ang), cy + r * Math.sin(ang)];
  });
  const blob = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ') + ' Z';

  const shown = useCountUp(Math.round(becoming || 0));
  const trendColor = trend === 'rising' ? '#34D399' : trend === 'dipping' ? '#FF6B5B' : '#45B7E8';
  // Glow intensity scales with Becoming — the brighter you are, the brighter the Self.
  const glowAlpha = 0.25 + (Math.max(0, Math.min(100, becoming || 0)) / 100) * 0.45;
  const glow = `drop-shadow(0 0 ${8 + (becoming || 0) / 6}px rgba(69,183,232,${glowAlpha.toFixed(2)}))`;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg className="self-breathe" width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', overflow: 'visible', filter: glow }}>
        <defs>
          <radialGradient id="selfFill" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="rgba(69,183,232,0.45)" />
            <stop offset="55%" stopColor="rgba(45,212,191,0.22)" />
            <stop offset="100%" stopColor="rgba(45,212,191,0.04)" />
          </radialGradient>
        </defs>
        {/* faint outer boundary — the space you could fill */}
        <circle cx={cx} cy={cy} r={maxR} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        {/* the Self — your shape */}
        <path d={blob} fill="url(#selfFill)" stroke={trendColor} strokeWidth="1.6" strokeLinejoin="round" opacity="0.95" />
        {/* core */}
        <circle cx={cx} cy={cy} r={baseR * 0.92} fill="rgba(10,11,13,0.55)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        <div className="display" style={{ fontSize: size * 0.2, lineHeight: 1, color: 'var(--text)' }}>{shown}</div>
        <div className="eyebrow" style={{ color: 'var(--cyan)', marginTop: 2 }}>BECOMING</div>
        {level != null && <div className="mono" style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.12em', marginTop: 3 }}>LV {level}</div>}
      </div>
    </div>
  );
}
