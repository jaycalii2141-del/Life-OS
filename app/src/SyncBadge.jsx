// A quiet "Saved" pill that briefly appears when state syncs to the cloud.
import { useState, useEffect, useRef } from 'react';
import { IconCheck } from './components/icons.jsx';

export function SyncBadge() {
  const [show, setShow] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    const onSync = () => {
      setShow(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setShow(false), 1500);
    };
    window.addEventListener('lifeos:sync', onSync);
    return () => {
      window.removeEventListener('lifeos:sync', onSync);
      clearTimeout(timer.current);
    };
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        top: 'calc(env(safe-area-inset-top, 0px) + 10px)',
        left: '50%',
        transform: `translateX(-50%) translateY(${show ? '0' : '-8px'})`,
        zIndex: 80,
        pointerEvents: 'none',
        opacity: show ? 1 : 0,
        transition: 'opacity 320ms, transform 320ms',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '5px 12px',
          borderRadius: 999,
          background: 'rgba(11,11,18,0.82)',
          border: '1px solid rgba(52,211,153,0.4)',
          backdropFilter: 'blur(14px) saturate(180%)',
          WebkitBackdropFilter: 'blur(14px) saturate(180%)',
          boxShadow: '0 6px 22px rgba(0,0,0,0.45)',
        }}
      >
        <IconCheck size={12} color="#34D399" stroke={3} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', color: '#34D399' }}>
          SAVED
        </span>
      </div>
    </div>
  );
}
