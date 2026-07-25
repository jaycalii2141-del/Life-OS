import { useRef } from 'react';
import { motion } from 'framer-motion';
import { IconBrain, IconMic, IconTarget } from './icons.jsx';

const TABS = [
  { id: 'today', label: 'Now', Icon: IconTarget },
  { id: 'life', label: 'Worlds', Icon: IconBrain },
  { id: 'ask', label: 'Ask', Icon: IconMic },
];

function TabBar({ active, onChange, onAsk, onCapture, onCaptureVoice }) {
  const timer = useRef(null);
  const longPressed = useRef(false);
  const worldsActive = active !== 'today';

  const startAsk = () => {
    longPressed.current = false;
    timer.current = window.setTimeout(() => {
      longPressed.current = true;
      onCaptureVoice?.();
    }, 500);
  };

  const finishAsk = (event) => {
    window.clearTimeout(timer.current);
    // Context-menu/right-click is the desktop equivalent of hold-to-capture.
    // It must not fall through to the normal Ask action on pointer-up.
    if (event?.button !== 0) return;
    if (!longPressed.current) onAsk?.();
  };

  const captureFromContext = (event) => {
    event.preventDefault();
    event.stopPropagation();
    window.clearTimeout(timer.current);
    longPressed.current = true;
    onCapture?.();
  };

  return (
    <nav className="lens-nav" aria-label="Primary navigation">
      {TABS.map((tab) => {
        const selected = tab.id === 'today'
          ? active === 'today'
          : tab.id === 'life'
            ? worldsActive
            : false;
        const ask = tab.id === 'ask';

        return (
          <motion.button
            key={tab.id}
            className={`lens-nav__item${selected ? ' is-active' : ''}`}
            onClick={ask ? undefined : () => onChange(tab.id)}
            onPointerDown={ask ? startAsk : undefined}
            onPointerUp={ask ? finishAsk : undefined}
            onPointerCancel={ask ? () => window.clearTimeout(timer.current) : undefined}
            onContextMenu={ask ? captureFromContext : undefined}
            whileTap={{ scale: 0.94 }}
            aria-current={selected ? 'page' : undefined}
            aria-label={ask ? 'Ask JAM intelligence. Hold for voice capture.' : tab.label}
          >
            {selected && (
              <motion.span
                className="lens-nav__current"
                layoutId="living-lens"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            )}
            <tab.Icon size={15} />
            <span>{tab.label}</span>
          </motion.button>
        );
      })}
    </nav>
  );
}

export { TabBar, TABS };
