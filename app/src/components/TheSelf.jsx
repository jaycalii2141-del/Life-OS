// ─────────────────────────────────────────────────────────
// The Self — the living identity artifact at the heart of JAM HQ.
//
// Its SHAPE is your eight-domain balance (each facet pushes the aura out),
// its GLOW is your Becoming, its EDGE COLOR is your trajectory, and it
// breathes. The emotional centerpiece of the Becoming Engine — the thing
// that visually represents who you're becoming.
// ─────────────────────────────────────────────────────────
import { useCountUp } from './atoms.jsx';

// A smooth, closed Catmull-Rom curve through the points — an organic aura
// instead of a faceted polygon.
function smoothClosed(p) {
  const n = p.length;
  if (n < 3) return '';
  let d = `M${p[0][0].toFixed(1)},${p[0][1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p0 = p[(i - 1 + n) % n], p1 = p[i], p2 = p[(i + 1) % n], p3 = p[(i + 2) % n];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d + ' Z';
}

export function TheSelf({ facets = [], becoming = 0, level, trend = 'steady', size = 196 }) {
  const cx = size / 2, cy = size / 2;
  const n = facets.length || 8;
  const baseR = size * 0.19;
  const maxR = size * 0.42;

  const pts = (facets.length ? facets : Array.from({ length: 8 }, () => ({ score: 0 }))).map((f, i) => {
    const ang = -Math.PI / 2 + (i / n) * Math.PI * 2;
    const r = baseR + (Math.max(0, Math.min(100, f.score || 0)) / 100) * (maxR - baseR);
    return [cx + r * Math.cos(ang), cy + r * Math.sin(ang)];
  });
  const blob = smoothClosed(pts);

  const shown = useCountUp(Math.round(becoming || 0));
  // Mood light — refined aqua / neutral / ember (not a stoplight). The Self
  // emits it and the canvas borrows the same hue, so it reads as the source.
  const moodColor = trend === 'rising' ? '#57C9D2' : trend === 'dipping' ? '#E0A968' : '#5BB6DE';
  const trendColor = moodColor;
  // Glow intensity scales with Becoming — the brighter you are, the brighter the Self.
  const glow = `drop-shadow(0 0 ${10 + (becoming || 0) / 5}px ${moodColor}80)`;

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
