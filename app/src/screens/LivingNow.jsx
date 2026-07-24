import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { TheSelf } from '../components/TheSelf.jsx';
import {
  IconArrowRight,
  IconBolt,
  IconCheck,
  IconClose,
  IconHeart,
  IconPlay,
  IconTrendUp,
} from '../components/icons.jsx';
import { celebrate } from '../lib/haptics.js';

const REALMS = [
  { id: 'move', label: 'Move', color: '#42E0B1', Icon: IconBolt, go: 'perform' },
  { id: 'build', label: 'Build', color: '#FFB250', Icon: IconTrendUp, go: 'build' },
  { id: 'belong', label: 'Belong', color: '#FF74A9', Icon: IconHeart, go: 'map' },
];

export function experienceHeadline(readiness) {
  if (readiness < 46) return ['Today wants softness', 'before speed.'];
  if (readiness < 72) return ['Today wants rhythm,', 'not pressure.'];
  return ['Today wants precision,', 'not pressure.'];
}

export function recommendedRealm(mission) {
  if (mission?.kind === 'train') return 'move';
  if (mission?.kind === 'build') return 'build';
  if (mission?.kind === 'ritual') return 'belong';
  return 'move';
}

function currentMoment() {
  return new Intl.DateTimeFormat([], {
    weekday: 'long',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date());
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
}

function CurrentSheet({ open, state, onMeter, onClose }) {
  const meters = [
    ['energy', 'Energy'],
    ['focus', 'Focus'],
    ['body', 'Body'],
    ['mood', 'Mood'],
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="living-sheet-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.section
            className="living-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 30 }}
            onClick={(event) => event.stopPropagation()}
            aria-label="Tune your current"
          >
            <div className="living-sheet__handle" />
            <div className="living-kicker">TUNE YOUR CURRENT</div>
            <h2>How are you arriving?</h2>
            <p>The world changes around your real capacity—not an imaginary perfect day.</p>
            <div className="current-meters">
              {meters.map(([id, label]) => (
                <label key={id} className="current-meter">
                  <span>{label}</span>
                  <strong>{state[id]}</strong>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={state[id]}
                    onChange={(event) => onMeter(id, Number(event.target.value))}
                  />
                </label>
              ))}
            </div>
            <button className="living-primary" onClick={onClose}>Set the current</button>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MomentMode({ open, mission, realm, onClose, onComplete }) {
  const initial = 45 * 60;
  const [remaining, setRemaining] = useState(initial);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!open) return;
    setRemaining(initial);
    setRunning(false);
  }, [open, initial]);

  useEffect(() => {
    if (!open || !running) return undefined;
    const timer = window.setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          window.clearInterval(timer);
          setRunning(false);
          celebrate();
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [open, running]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="moment-mode"
          style={{ '--realm-color': realm.color }}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
        >
          <button className="moment-close" onClick={onClose} aria-label="Close moment mode">
            <IconClose size={18} />
          </button>
          <div className="moment-mode__current" />
          <div className="living-kicker">{remaining === 0 ? 'MOMENT COMPLETE' : `${realm.label.toUpperCase()} CURRENT`}</div>
          <div className="moment-mode__time">{formatTime(remaining)}</div>
          <h2>{mission?.title || 'Move with full attention.'}</h2>
          <p>{mission?.why || 'One meaningful block. Let everything else wait outside.'}</p>
          {remaining === 0 ? (
            <button className="living-primary" onClick={onComplete}>
              Bank the moment <IconCheck size={16} />
            </button>
          ) : (
            <button className="living-primary" onClick={() => setRunning((value) => !value)}>
              {running ? 'Pause the current' : remaining < initial ? 'Return to flow' : 'Enter flow'}
              <IconPlay size={16} />
            </button>
          )}
          {remaining > 0 && (
            <button className="moment-finish" onClick={() => setRemaining(0)}>Finish early</button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function LivingNow({
  state,
  setState,
  missions = [],
  doneIds = [],
  onToggleMission,
  becoming,
  onGoTab,
}) {
  const readiness = Math.round(((state.energy + state.focus + state.body + state.mood) / 40) * 100);
  const nextMission = useMemo(
    () => missions.find((mission) => !doneIds.includes(mission.id)),
    [missions, doneIds],
  );
  const activeRealm = recommendedRealm(nextMission);
  const realm = REALMS.find((item) => item.id === activeRealm) || REALMS[0];
  const headline = experienceHeadline(readiness);
  const [currentOpen, setCurrentOpen] = useState(false);
  const [momentOpen, setMomentOpen] = useState(false);

  const setMeter = (key, value) => {
    setState((current) => ({ ...current, [key]: value, checkedIn: true }));
  };

  const completeMoment = () => {
    if (nextMission && !doneIds.includes(nextMission.id)) onToggleMission?.(nextMission.id);
    setMomentOpen(false);
  };

  return (
    <main className="living-now">
      <div className="living-now__aura living-now__aura--cyan" />
      <div className="living-now__aura living-now__aura--violet" />
      <div className="living-now__aura living-now__aura--ember" />

      <header className="living-presence">
        <span>{currentMoment()}</span>
        <button onClick={() => setCurrentOpen(true)} aria-label="Tune readiness">JAM</button>
      </header>

      <section className="living-narrative">
        <div className="living-kicker">YOUR ENERGY IS {readiness >= 72 ? 'RISING' : readiness < 46 ? 'ASKING FOR SPACE' : 'FINDING RHYTHM'}</div>
        <h1>{headline[0]}<br />{headline[1]}</h1>
      </section>

      <section className="self-stage" aria-label={`Readiness ${readiness}`}>
        <motion.button
          className="self-stage__core"
          onClick={() => setCurrentOpen(true)}
          whileTap={{ scale: 0.96 }}
          aria-label="Open readiness check-in"
        >
          <TheSelf
            facets={becoming?.facets}
            becoming={readiness}
            trend={becoming?.trend}
            size={238}
            label="READY"
          />
        </motion.button>
        {REALMS.map((item) => (
          <motion.button
            key={item.id}
            className={`realm-orbit realm-orbit--${item.id}${item.id === activeRealm ? ' is-current' : ''}`}
            style={{ '--realm-color': item.color }}
            whileTap={{ scale: 0.94 }}
            onClick={() => onGoTab?.(item.go)}
          >
            <item.Icon size={13} />
            {item.label}
          </motion.button>
        ))}
      </section>

      <section className="next-moment">
        <div className="next-moment__meta">
          NEXT MOMENT · {realm.label.toUpperCase()} · {nextMission?.duration || 45} MIN
        </div>
        <h2>{nextMission?.title || 'Train the line that opens everything else.'}</h2>
        <button
          className="living-primary"
          style={{ '--realm-color': realm.color }}
          onClick={() => setMomentOpen(true)}
        >
          Enter flow <IconArrowRight size={16} />
        </button>
      </section>

      <CurrentSheet
        open={currentOpen}
        state={state}
        onMeter={setMeter}
        onClose={() => setCurrentOpen(false)}
      />
      <MomentMode
        open={momentOpen}
        mission={nextMission}
        realm={realm}
        onClose={() => setMomentOpen(false)}
        onComplete={completeMoment}
      />
    </main>
  );
}
