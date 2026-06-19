import { useState, useEffect, useRef } from 'react';

// ─────────────────────────────────────────────────────────
// Atoms — shared building blocks
// ─────────────────────────────────────────────────────────

// HUD corner ticks (4 L-brackets)
function HUDTicks() {
  return (
    <>
      <span className="hud-tick tl" />
      <span className="hud-tick tr" />
      <span className="hud-tick bl" />
      <span className="hud-tick br" />
    </>
  );
}

// Animated counter — ticks from 0 to value
function TickCounter({ value, duration = 1100, format = (v) => v, style, className }) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef(null);
  const rafRef = useRef(null);
  const targetRef = useRef(value);

  useEffect(() => {
    targetRef.current = value;
    startRef.current = null;
    const tick = (t) => {
      if (!startRef.current) startRef.current = t;
      const p = Math.min(1, (t - startRef.current) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(targetRef.current * eased);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return <span className={className} style={style}>{format(display)}</span>;
}

// Section heading with eyebrow label + optional trailing
function SectionHead({ eyebrow, title, trailing, style }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12, ...style }}>
      <div>
        {eyebrow && <div className="eyebrow" style={{ marginBottom: 6 }}>{eyebrow}</div>}
        {title && <div className="section-title">{title}</div>}
      </div>
      {trailing}
    </div>
  );
}

// Progress bar
function ProgressBar({ value, color = 'var(--cyan)', height = 4, animated = true }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(value), 50);
    return () => clearTimeout(t);
  }, [value]);
  return (
    <div className="bar-track" style={{ height }}>
      <div
        className="bar-fill"
        style={{
          width: `${animated ? w : value}%`,
          background: color,
          boxShadow: `0 0 12px ${color}`,
        }}
      />
    </div>
  );
}

// Pill / chip
function Pill({ children, variant = 'default', style, dot }) {
  const cls = ({
    default: 'pill',
    red: 'pill pill-red',
    cyan: 'pill pill-cyan',
    lime: 'pill pill-lime',
    violet: 'pill pill-violet',
    gold: 'pill pill-gold',
    orange: 'pill pill-orange',
    muted: 'pill pill-muted',
  })[variant] || 'pill';
  return (
    <span className={cls} style={style}>
      {dot && <span className="pill-dot" style={{ background: dot }} />}
      {children}
    </span>
  );
}

// Glass card with HUD ticks
function HUDCard({ children, style, className = '', glow, mesh, padding = 16, onClick }) {
  const classes = ['glass', 'hud'];
  if (glow) classes.push(`glow-${glow}`);
  if (mesh) classes.push(`mesh-${mesh}`);
  if (onClick) classes.push('pressable');
  if (className) classes.push(className);
  return (
    <div
      className={classes.join(' ')}
      style={{ padding, ...style }}
      onClick={onClick}
    >
      <HUDTicks />
      {children}
    </div>
  );
}

// Confetti burst (60 pieces from a center point)
function ConfettiBurst({ trigger, colors = ['#FF6B5B', '#45B7E8', '#2DD4BF', '#34D399', '#E9C46A', '#F4A261'] }) {
  const [tokens, setTokens] = useState([]);
  useEffect(() => {
    if (!trigger) return;
    const pieces = Array.from({ length: 50 }).map((_, i) => {
      const angle = (Math.PI * 2 * i) / 50 + (Math.random() - 0.5) * 0.4;
      const dist = 120 + Math.random() * 140;
      return {
        id: `${trigger}-${i}`,
        dx: Math.cos(angle) * dist + 'px',
        dy: Math.sin(angle) * dist + 'px',
        rot: Math.floor(Math.random() * 720 - 360) + 'deg',
        color: colors[i % colors.length],
        delay: Math.random() * 80,
      };
    });
    setTokens(pieces);
    const t = setTimeout(() => setTokens([]), 1300);
    return () => clearTimeout(t);
  }, [trigger]);
  return (
    <div className="confetti-host">
      {tokens.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            background: p.color,
            '--dx': p.dx,
            '--dy': p.dy,
            '--rot': p.rot,
            animationDelay: `${p.delay}ms`,
          }}
        />
      ))}
    </div>
  );
}

// Vertical "swipeable" meter (0..10)
function StateMeter({ label, value, max = 10, color, onChange }) {
  const bars = Array.from({ length: max });
  const barRefs = useRef([]);

  const setFromX = (clientX) => {
    if (!barRefs.current[0]) return;
    const first = barRefs.current[0].getBoundingClientRect();
    const last = barRefs.current[max - 1].getBoundingClientRect();
    const total = last.right - first.left;
    const ratio = Math.max(0, Math.min(1, (clientX - first.left) / total));
    const next = Math.max(1, Math.round(ratio * max));
    if (next !== value) onChange?.(next);
  };

  const handleDown = (e) => {
    const move = (ev) => {
      const x = ev.touches ? ev.touches[0].clientX : ev.clientX;
      setFromX(x);
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchmove', move);
    window.addEventListener('touchend', up);
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    setFromX(x);
  };

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <span className="eyebrow" style={{ color: 'var(--muted)' }}>{label}</span>
        <span className="mono" style={{ fontSize: 11, color: color, fontWeight: 600 }}>{value}</span>
      </div>
      <div
        onMouseDown={handleDown}
        onTouchStart={handleDown}
        style={{ display: 'flex', gap: 3, cursor: 'pointer', touchAction: 'none' }}
      >
        {bars.map((_, i) => {
          const filled = i < value;
          return (
            <div
              key={i}
              ref={(el) => (barRefs.current[i] = el)}
              style={{
                flex: 1,
                height: 14,
                borderRadius: 2,
                background: filled ? color : 'rgba(255,255,255,0.06)',
                boxShadow: filled ? `0 0 8px ${color}80` : 'none',
                transition: 'background 200ms, box-shadow 200ms',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

// Vertical timeline event
function TimelineEvent({ time, label, color, kind, last }) {
  return (
    <div style={{ display: 'flex', gap: 12, position: 'relative' }}>
      {/* dot + rail */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 2 }}>
        <div style={{
          width: 10, height: 10, borderRadius: 999,
          background: color,
          boxShadow: `0 0 10px ${color}`,
        }} />
        {!last && (
          <div style={{
            flex: 1, width: 1, marginTop: 4,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.03))',
          }} />
        )}
      </div>
      <div style={{ flex: 1, paddingBottom: last ? 0 : 14 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{time}</span>
          {kind && <Pill variant="muted" style={{ fontSize: 8 }}>{kind}</Pill>}
        </div>
        <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500, marginTop: 2 }}>{label}</div>
      </div>
    </div>
  );
}

// Number tile (big mono number with label)
function StatTile({ label, value, suffix, color = 'var(--text)', format = (v) => Math.round(v), style }) {
  return (
    <div style={{ ...style }}>
      <div className="eyebrow" style={{ marginBottom: 4 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span className="display" style={{ fontSize: 36, color, lineHeight: 0.9 }}>
          <TickCounter value={value} format={format} />
        </span>
        {suffix && <span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{suffix}</span>}
      </div>
    </div>
  );
}

// Shared empty state — a calm, dashed "add something here" affordance.
// Keeps every list's blank state visually consistent across the app.
function EmptyState({ icon, text, style }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
      padding: '24px 18px', borderRadius: 14,
      border: '1px dashed var(--line-strong, var(--line))',
      background: 'rgba(255,255,255,0.015)',
      ...style,
    }}>
      {icon && <div style={{ color: 'var(--dim)', opacity: 0.8 }}>{icon}</div>}
      <div className="eyebrow" style={{ color: 'var(--dim)', textAlign: 'center', maxWidth: 240, lineHeight: 1.5 }}>{text}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Data-visuals — SVG primitives that turn numbers into something
// you can read at a glance. All theme via a passed accent color.
// ─────────────────────────────────────────────────────────

// Animated radial gauge: a glowing arc that fills to `value` (0–100)
// with the score big in the middle. Great for an alignment/readiness score.
function RadialGauge({ value = 0, size = 132, stroke = 11, color = '#45B7E8', label, sub }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  const gid = `g-${color.replace('#', '')}`;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor="#2DD4BF" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`url(#${gid})`} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c}
          strokeDashoffset={c - (c * v) / 100}
          style={{ transition: 'stroke-dashoffset 900ms cubic-bezier(0.2,0.7,0.2,1)', filter: `drop-shadow(0 0 6px ${color}99)` }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="display" style={{ fontSize: size * 0.32, lineHeight: 1, color: 'var(--text)' }}>{Math.round(v)}</div>
        {label && <div className="eyebrow" style={{ marginTop: 3, color }}>{label}</div>}
        {sub && <div className="mono" style={{ fontSize: 8, color: 'var(--dim)', marginTop: 2, letterSpacing: '0.1em' }}>{sub}</div>}
      </div>
    </div>
  );
}

// Sparkline: a tiny trend line for a series of numbers, with a soft fill
// and a glowing endpoint. Shows momentum at a glance.
function Sparkline({ data = [], width = 120, height = 36, color = '#45B7E8', showDot = true }) {
  if (!data.length) return <svg width={width} height={height} />;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((d, i) => [(i / (data.length - 1 || 1)) * width, height - 4 - ((d - min) / range) * (height - 8)]);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const area = `${line} L${width},${height} L0,${height} Z`;
  const gid = `s-${color.replace('#', '')}`;
  const end = pts[pts.length - 1];
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 4px ${color}88)` }} />
      {showDot && <circle cx={end[0]} cy={end[1]} r="2.8" fill={color} style={{ filter: `drop-shadow(0 0 5px ${color})` }} />}
    </svg>
  );
}

// Radar / spider chart for multi-axis scores (life domains, body attributes,
// identity meters). Pass axes: [{label, value 0–100}]. Optional `goal` ring.
function RadarChart({ axes = [], size = 220, color = '#45B7E8', goalColor = 'rgba(255,255,255,0.25)', goal }) {
  const cx = size / 2, cy = size / 2, R = size / 2 - 26;
  const n = axes.length || 1;
  const pt = (i, val) => {
    const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
    const rad = (Math.max(0, Math.min(100, val)) / 100) * R;
    return [cx + rad * Math.cos(a), cy + rad * Math.sin(a)];
  };
  const poly = (vals) => vals.map((v, i) => pt(i, v).join(',')).join(' ');
  const gid = `r-${color.replace('#', '')}`;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', margin: '0 auto' }}>
      <defs>
        <radialGradient id={gid}>
          <stop offset="0%" stopColor={color} stopOpacity="0.45" />
          <stop offset="100%" stopColor={color} stopOpacity="0.12" />
        </radialGradient>
      </defs>
      {[25, 50, 75, 100].map((g) => (
        <polygon key={g} points={poly(axes.map(() => g))} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      ))}
      {axes.map((_, i) => { const [x, y] = pt(i, 100); return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />; })}
      {goal && <polygon points={poly(goal)} fill="none" stroke={goalColor} strokeWidth="1.5" strokeDasharray="3 3" />}
      <polygon points={poly(axes.map((a) => a.value))} fill={`url(#${gid})`} stroke={color} strokeWidth="2" style={{ filter: `drop-shadow(0 0 6px ${color}66)` }} />
      {axes.map((a, i) => {
        const [x, y] = pt(i, a.value);
        const [lx, ly] = pt(i, 122);
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="3" fill={color} />
            <text x={lx} y={ly} fill="var(--muted)" fontSize="8.5" fontFamily="var(--font-mono)" textAnchor="middle" dominantBaseline="middle" style={{ letterSpacing: '0.04em' }}>{a.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

// Horizontal labeled bar meters — clean comparison of several values.
function MiniBars({ items = [], max, height = 8 }) {
  const top = max || Math.max(1, ...items.map((i) => i.value));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      {items.map((it, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 70, fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.label}</span>
          <div style={{ flex: 1, height, borderRadius: 999, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
            <div style={{ width: `${(it.value / top) * 100}%`, height: '100%', borderRadius: 999, background: it.color || '#45B7E8', boxShadow: `0 0 8px ${it.color || '#45B7E8'}66`, transition: 'width 700ms cubic-bezier(0.2,0.7,0.2,1)' }} />
          </div>
          <span className="mono" style={{ width: 22, textAlign: 'right', fontSize: 11, color: it.color || 'var(--cyan)' }}>{it.value}</span>
        </div>
      ))}
    </div>
  );
}

export {
  HUDTicks, TickCounter, SectionHead, ProgressBar, Pill, HUDCard,
  ConfettiBurst, StateMeter, TimelineEvent, StatTile, EmptyState,
  RadialGauge, Sparkline, RadarChart, MiniBars,
};
