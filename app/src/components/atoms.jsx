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
function ConfettiBurst({ trigger, colors = ['#FF0033', '#00D4FF', '#B14CFF', '#B6FF3C', '#FFD23C', '#FF8A3C'] }) {
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

export {
  HUDTicks, TickCounter, SectionHead, ProgressBar, Pill, HUDCard,
  ConfettiBurst, StateMeter, TimelineEvent, StatTile, EmptyState,
};
