// Premium boot animation — a short, cinematic open: the orb blooms in,
// the wordmark reveals, a tagline rises, then the whole thing lifts away
// into the app. Shows once per app launch.
import { useState, useEffect } from 'react';

export function BootSplash({ onDone }) {
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setLeaving(true), 1650);
    const t2 = setTimeout(() => onDone?.(), 2150);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div className={`boot${leaving ? ' boot-leaving' : ''}`}>
      <div className="boot-orb">
        <div className="boot-orb-glow" />
        <div className="boot-orb-core" />
      </div>
      <div className="boot-word">JAM HQ</div>
      <div className="boot-tag">A quiet home for who you're becoming</div>
    </div>
  );
}
