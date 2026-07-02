// ─────────────────────────────────────────────────────────
// The Self — the living identity artifact at the heart of JAM HQ.
//
// Its SHAPE is your eight-domain balance, its GLOW is your Becoming, its
// EDGE is your trajectory — and it's genuinely alive: the aura morphs on a
// spring as your facets shift, breathes with an organic idle, and resolves
// with a soft spring when it arrives. Physics by Framer Motion.
// ─────────────────────────────────────────────────────────
import { useCountUp } from './atoms.jsx';
import { motion, useReducedMotion } from 'framer-motion';

// A smooth, closed Catmull-Rom curve through the points — an organic aura
// instead of a faceted polygon. Stable command structure so it can morph.
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

// `shared` opts this instance into the app-wide shared element (layoutId) —
// The Self physically travels between Command's hero and the Map's center on
// tab switch. Only ONE shared instance may be mounted at a time (the
// time-lapse sheet renders a non-shared Self for this reason).
export function TheSelf({ facets = [], becoming = 0, level, trend = 'steady', size = 196, shared = false }) {
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
  const glow = `drop-shadow(0 0 ${10 + (becoming || 0) / 5}px ${moodColor}80)`;
  const reduce = useReducedMotion();

  return (
    <motion.div
      layoutId={shared ? 'the-self' : undefined}
      initial={shared ? false : { scale: 0.92, opacity: 0 }}
      animate={shared ? undefined : { scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 150, damping: 19 }}
      style={{ position: 'relative', width: size, height: size }}
    >
      <motion.svg
        width={size} height={size} viewBox={`0 0 ${size} ${size}`}
        style={{ display: 'block', overflow: 'visible', filter: glow, transformOrigin: 'center' }}
        animate={reduce ? undefined : { scale: [1, 1.03, 1], y: [0, -size * 0.008, 0] }}
        transition={reduce ? undefined : { duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <defs>
          <radialGradient id="selfFill" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="rgba(69,183,232,0.45)" />
            <stop offset="55%" stopColor="rgba(45,212,191,0.22)" />
            <stop offset="100%" stopColor="rgba(45,212,191,0.04)" />
          </radialGradient>
        </defs>
        {/* faint outer boundary — the space you could fill */}
        <circle cx={cx} cy={cy} r={maxR} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        {/* the Self — your shape, morphing on a spring as facets change */}
        <motion.path
          d={blob}
          animate={{ d: blob }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          fill="url(#selfFill)" stroke={moodColor} strokeWidth="1.6" strokeLinejoin="round" opacity="0.95"
        />
        {/* core */}
        <circle cx={cx} cy={cy} r={baseR * 0.92} fill="rgba(10,11,13,0.55)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      </motion.svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        <div className="display" style={{ fontSize: size * 0.2, lineHeight: 1, color: 'var(--text)' }}>{shown}</div>
        <div className="eyebrow" style={{ color: 'var(--cyan)', marginTop: 2 }}>BECOMING</div>
        {level != null && <div className="mono" style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.12em', marginTop: 3 }}>LV {level}</div>}
      </div>
    </motion.div>
  );
}
