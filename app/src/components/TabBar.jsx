import { useRef } from 'react';
import { IconHome, IconBolt, IconPlay, IconNinja, IconSparkles, IconPlus, IconBrain } from './icons.jsx';
import { HUDTicks } from './atoms.jsx';

// ─────────────────────────────────────────────────────────
// TabBar — bottom nav (5 tabs) + floating action button
// ─────────────────────────────────────────────────────────

const TABS = [
  { id: 'home',   label: 'Home',   Icon: IconHome,     color: '#00D4FF' },
  { id: 'train',  label: 'Train',  Icon: IconBolt,     color: '#B6FF3C' },
  { id: 'create', label: 'Create', Icon: IconPlay,     color: '#FF3CC8' },
  { id: 'ona',    label: 'ONA',    Icon: IconNinja,    color: '#FF0033' },
  { id: 'mind',   label: 'Mind',   Icon: IconBrain,    color: '#FFD23C' },
  { id: 'ai',     label: 'AI',     Icon: IconSparkles, color: '#B14CFF' },
];

function TabBar({ active, onChange, onFab, onFabLong, badges = {} }) {
  const longPressTimer = useRef(null);
  const longPressed = useRef(false);

  const fabDown = () => {
    longPressed.current = false;
    longPressTimer.current = setTimeout(() => {
      longPressed.current = true;
      onFabLong?.();
    }, 450);
  };
  const fabUp = () => {
    clearTimeout(longPressTimer.current);
    if (!longPressed.current) onFab?.();
  };
  const fabCancel = () => clearTimeout(longPressTimer.current);

  return (
    <div style={{
      position: 'absolute',
      bottom: 0, left: 0, right: 0,
      height: 96,
      zIndex: 40,
      pointerEvents: 'none',
    }}>
      {/* gradient veil so content fades into the bar */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(180deg, transparent 0%, rgba(6,6,10,0.7) 38%, #06060A 70%)',
        pointerEvents: 'none',
      }} />

      {/* bar */}
      <div style={{
        position: 'absolute',
        left: 12, right: 12, bottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
        height: 60,
        background: 'rgba(11, 11, 18, 0.78)',
        backdropFilter: 'blur(28px) saturate(180%)',
        WebkitBackdropFilter: 'blur(28px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 22,
        display: 'flex',
        alignItems: 'center',
        padding: '0 4px',
        pointerEvents: 'auto',
        boxShadow: '0 18px 50px rgba(0,0,0,0.55)',
      }}>
        <HUDTicks />
        {TABS.map((t) => {
          const isActive = active === t.id;
          return (
            <div
              key={t.id}
              className="pressable"
              onClick={() => onChange(t.id)}
              style={{
                flex: 1,
                height: 52,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                position: 'relative',
                color: isActive ? t.color : 'var(--muted)',
                transition: 'color 220ms',
              }}
            >
              {isActive && (
                <span style={{
                  position: 'absolute',
                  top: 6,
                  width: 22, height: 2,
                  borderRadius: 999,
                  background: t.color,
                  boxShadow: `0 0 8px ${t.color}`,
                }} />
              )}
              {badges[t.id] > 0 && (
                <span style={{
                  position: 'absolute',
                  top: 4, right: '50%', marginRight: -18,
                  minWidth: 15, height: 15, padding: '0 4px',
                  borderRadius: 999,
                  background: t.color,
                  color: '#06060A',
                  fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 0 8px ${t.color}`,
                  border: '1.5px solid #0B0B12',
                }}>{badges[t.id] > 9 ? '9+' : badges[t.id]}</span>
              )}
              <t.Icon size={20} stroke={isActive ? 1.9 : 1.5} />
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 8,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                fontWeight: isActive ? 700 : 500,
              }}>{t.label}</span>
            </div>
          );
        })}
      </div>

      {/* FAB */}
      <div
        className="pressable fab-glow"
        onMouseDown={fabDown}
        onMouseUp={fabUp}
        onMouseLeave={fabCancel}
        onTouchStart={fabDown}
        onTouchEnd={fabUp}
        style={{
          position: 'absolute',
          right: 18, bottom: 'calc(env(safe-area-inset-bottom, 0px) + 96px)',
          width: 54, height: 54,
          borderRadius: 18,
          background: 'linear-gradient(135deg, #00D4FF 0%, #B14CFF 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#06060A',
          pointerEvents: 'auto',
          border: '1px solid rgba(255,255,255,0.2)',
        }}
      >
        <IconPlus size={26} stroke={2.4} color="#06060A" />
      </div>
    </div>
  );
}

export { TabBar, TABS };
