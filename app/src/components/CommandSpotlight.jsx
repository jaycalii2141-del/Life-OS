// ─────────────────────────────────────────────────────────
// CommandSpotlight — the universal command bar. Summoned by long-pressing
// anywhere on the headquarters (the mobile ⌘K). One gesture to talk to the
// Presence or jump anywhere, from any screen.
// ─────────────────────────────────────────────────────────
import { IconSparkles, IconPlus, IconCalendar, IconCompass, IconClose, IconArrowRight, IconHome, IconTrendUp, IconBolt } from './icons.jsx';

const TABS = [
  { id: 'today', label: 'Command', Icon: IconHome },
  { id: 'life', label: 'Map', Icon: IconCompass },
  { id: 'perform', label: 'Move', Icon: IconBolt },
  { id: 'build', label: 'Build', Icon: IconTrendUp },
];

export function CommandSpotlight({ open, onClose, onAsk, onCapture, onCalendar, onReview, onGoTab }) {
  if (!open) return null;
  const run = (fn) => () => { onClose?.(); setTimeout(() => fn?.(), 60); };

  const quick = [
    { id: 'capture', label: 'Capture a thought', Icon: IconPlus, fn: onCapture },
    { id: 'calendar', label: 'Open calendar', Icon: IconCalendar, fn: onCalendar },
    { id: 'review', label: 'Weekly review', Icon: IconCompass, fn: onReview },
  ];

  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, zIndex: 70,
      background: 'rgba(6,7,9,0.62)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '16%',
      animation: 'scrimIn 180ms ease',
    }}>
      <div onClick={(e) => e.stopPropagation()} className="glass-strong" style={{
        width: '88%', maxWidth: 360, borderRadius: 22, padding: 16,
        boxShadow: 'var(--top-hi), 0 30px 70px -30px rgba(0,0,0,0.8)', animation: 'actionIn 240ms cubic-bezier(0.34,1.4,0.64,1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div className="mono" style={{ fontSize: 9, color: 'var(--cyan)', letterSpacing: '0.16em' }}>COMMAND</div>
          <div className="pressable" onClick={onClose} style={{ width: 28, height: 28, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.06)', color: 'var(--muted)' }}><IconClose size={14} /></div>
        </div>

        {/* Primary — talk to the Presence */}
        <div className="pressable" onClick={run(onAsk)} style={{
          height: 52, borderRadius: 14, background: 'linear-gradient(135deg, #45B7E8, #2DD4BF)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, color: '#0A0B0D', fontWeight: 800, fontSize: 14, letterSpacing: '0.02em',
        }}>
          <IconSparkles size={18} /> Ask the Presence <IconArrowRight size={15} stroke={2.4} />
        </div>

        {/* Quick actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 12 }}>
          {quick.map((a) => (
            <div key={a.id} className="pressable" onClick={run(a.fn)} style={{
              display: 'flex', alignItems: 'center', gap: 11, padding: '11px 13px', borderRadius: 12,
              background: 'rgba(255,255,255,0.035)', border: '1px solid var(--line)',
            }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', color: 'var(--muted)', flexShrink: 0 }}><a.Icon size={15} /></div>
              <div style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: 'var(--text)' }}>{a.label}</div>
            </div>
          ))}
        </div>

        {/* Jump to */}
        <div className="eyebrow" style={{ margin: '14px 0 8px' }}>Jump to</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {TABS.map((t) => (
            <div key={t.id} className="pressable" onClick={run(() => onGoTab?.(t.id))} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 4px', borderRadius: 12,
              background: 'rgba(255,255,255,0.035)', border: '1px solid var(--line)', color: 'var(--muted)',
            }}>
              <t.Icon size={17} />
              <span className="mono" style={{ fontSize: 8.5, letterSpacing: '0.08em' }}>{t.label.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
