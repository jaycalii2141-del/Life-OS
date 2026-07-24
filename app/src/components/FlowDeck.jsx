import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  IconActivity,
  IconBolt,
  IconCheck,
  IconClose,
  IconGlobe,
  IconHeart,
  IconPlay,
  IconSparkles,
  IconTarget,
  IconTrendUp,
} from './icons.jsx';
import { celebrate } from '../lib/haptics.js';

const PRESETS = {
  focus: {
    id: 'focus',
    label: 'Deep work',
    eyebrow: 'FOCUS CAPSULE',
    title: 'Make the next hour count.',
    description: 'One outcome. No context switching. Let the rest of life wait outside.',
    duration: 45,
    color: '#45B7E8',
    Icon: IconTarget,
  },
  move: {
    id: 'move',
    label: 'Move',
    eyebrow: 'ATHLETE MODE',
    title: 'Turn readiness into skill.',
    description: 'A focused movement block built around the breakthrough closest to landing.',
    duration: 60,
    color: '#34D399',
    Icon: IconBolt,
  },
  restore: {
    id: 'restore',
    label: 'Restore',
    eyebrow: 'NERVOUS SYSTEM RESET',
    title: 'Come back sharper.',
    description: 'Downshift on purpose so your next session has quality—not just effort.',
    duration: 12,
    color: '#2DD4BF',
    Icon: IconActivity,
  },
  build: {
    id: 'build',
    label: 'Build',
    eyebrow: 'FOUNDER SPRINT',
    title: 'Ship something real.',
    description: 'Move Podium, content, or your next freedom-building project forward.',
    duration: 35,
    color: '#E9C46A',
    Icon: IconTrendUp,
  },
  connect: {
    id: 'connect',
    label: 'Connect',
    eyebrow: 'LIFE TOGETHER',
    title: 'Choose the part that matters.',
    description: 'Create an intentional pocket of time for Chelsea, your people, or your community.',
    duration: 20,
    color: '#FF7FA7',
    Icon: IconHeart,
  },
  explore: {
    id: 'explore',
    label: 'Explore',
    eyebrow: 'ADVENTURE MODE',
    title: 'Make life feel bigger.',
    description: 'Plan the trip, chase the view, or follow the curiosity you keep postponing.',
    duration: 25,
    color: '#FF8A4C',
    Icon: IconGlobe,
  },
};

const ORDER = ['focus', 'move', 'restore', 'build', 'connect', 'explore'];

export function recommendedMode(nextMission, readiness) {
  if (readiness < 52) return 'restore';
  if (nextMission?.kind === 'train') return 'move';
  if (nextMission?.kind === 'build') return 'build';
  if (nextMission?.kind === 'ritual') return 'restore';
  return 'focus';
}

export function formatClock(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function FlowCapsule({ open, preset, mission, onClose, onFinish }) {
  const initial = preset.duration * 60;
  const [remaining, setRemaining] = useState(initial);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!open) return;
    setRemaining(initial);
    setRunning(false);
    setFinished(false);
  }, [open, initial, preset.id]);

  useEffect(() => {
    if (!open || !running || finished) return undefined;
    const id = setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          setRunning(false);
          setFinished(true);
          celebrate();
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [open, running, finished]);

  const progress = initial ? ((initial - remaining) / initial) * 100 : 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="flow-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          <motion.div
            className="flow-capsule"
            style={{ '--flow-accent': preset.color }}
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 16 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          >
            <button className="flow-close" onClick={onClose} aria-label="Close flow capsule">
              <IconClose size={17} />
            </button>

            <div className="flow-capsule__eyebrow">{finished ? 'CAPSULE COMPLETE' : preset.eyebrow}</div>

            <div className={`flow-orbit${running ? ' is-running' : ''}`}>
              <div
                className="flow-orbit__progress"
                style={{ background: `conic-gradient(${preset.color} ${progress}%, rgba(255,255,255,0.07) 0)` }}
              />
              <div className="flow-orbit__core">
                <preset.Icon size={22} color={preset.color} stroke={1.8} />
                <span className="flow-orbit__time">{formatClock(remaining)}</span>
                <span className="flow-orbit__state">{finished ? 'done' : running ? 'in flow' : 'ready'}</span>
              </div>
            </div>

            <div className="flow-capsule__title">{mission?.title || preset.title}</div>
            <div className="flow-capsule__copy">
              {mission?.why || preset.description}
            </div>

            {!finished ? (
              <button
                className="flow-primary"
                style={{ '--flow-accent': preset.color }}
                onClick={() => setRunning((value) => !value)}
              >
                {running ? 'Pause capsule' : remaining < initial ? 'Resume capsule' : 'Enter flow'}
                <IconPlay size={15} color="#071011" stroke={2.2} />
              </button>
            ) : (
              <button className="flow-primary" style={{ '--flow-accent': preset.color }} onClick={onFinish}>
                Bank the win
                <IconCheck size={16} color="#071011" stroke={2.6} />
              </button>
            )}

            {!finished && (
              <button className="flow-secondary" onClick={() => { setFinished(true); setRunning(false); }}>
                Finish early & bank it
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function FlowDeck({ missions = [], doneIds = [], readiness = 70, onToggleMission }) {
  const nextMission = useMemo(
    () => missions.find((mission) => !doneIds.includes(mission.id)),
    [missions, doneIds],
  );
  const recommendation = recommendedMode(nextMission, readiness);
  const [selectedId, setSelectedId] = useState(recommendation);
  const [open, setOpen] = useState(false);
  const manuallySelected = useRef(false);

  useEffect(() => {
    if (!manuallySelected.current) setSelectedId(recommendation);
  }, [recommendation]);

  const preset = PRESETS[selectedId] || PRESETS.focus;
  const missionMatches = (
    (selectedId === 'focus' && (!nextMission?.kind || nextMission.kind === 'focus'))
    || (selectedId === 'move' && nextMission?.kind === 'train')
    || (selectedId === 'build' && nextMission?.kind === 'build')
    || (selectedId === 'restore' && nextMission?.kind === 'ritual')
  );
  const capsuleMission = missionMatches ? nextMission : null;

  const finish = () => {
    if (capsuleMission && !doneIds.includes(capsuleMission.id)) onToggleMission?.(capsuleMission.id);
    celebrate();
    setOpen(false);
  };

  return (
    <>
      <motion.section
        className="flow-deck"
        style={{ '--flow-accent': preset.color }}
        layout
        transition={{ layout: { duration: 0.25 } }}
      >
        <div className="flow-deck__halo" />
        <div className="flow-deck__header">
          <div>
            <div className="flow-deck__kicker">
              <span className="flow-live-dot" />
              LIVE MODE
            </div>
            <div className="flow-deck__signal">
              {readiness < 52 ? 'Recovery protects tomorrow’s ceiling' : `${readiness}% ready · prime window available`}
            </div>
          </div>
          <div className="flow-deck__recommend">
            <IconSparkles size={12} color={preset.color} />
            suggested
          </div>
        </div>

        <div className="flow-mode-rail" aria-label="Choose a life mode">
          {ORDER.map((id) => {
            const item = PRESETS[id];
            const active = id === selectedId;
            return (
              <button
                key={id}
                className={`flow-mode${active ? ' is-active' : ''}`}
                style={{ '--mode-color': item.color }}
                onClick={() => {
                  manuallySelected.current = true;
                  setSelectedId(id);
                }}
              >
                <item.Icon size={14} stroke={active ? 2 : 1.6} />
                {item.label}
              </button>
            );
          })}
        </div>

        <motion.div
          key={selectedId}
          className="flow-deck__body"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
        >
          <div className="flow-deck__eyebrow">{preset.eyebrow}</div>
          <div className="flow-deck__title">{capsuleMission?.title || preset.title}</div>
          <div className="flow-deck__description">{capsuleMission?.why || preset.description}</div>

          <button className="flow-launch" onClick={() => setOpen(true)}>
            <span>
              <strong>Launch capsule</strong>
              <small>{preset.duration} min · guided focus</small>
            </span>
            <span className="flow-launch__icon">
              <IconPlay size={16} color="#071011" stroke={2.3} />
            </span>
          </button>
        </motion.div>
      </motion.section>

      <FlowCapsule
        open={open}
        preset={preset}
        mission={capsuleMission}
        onClose={() => setOpen(false)}
        onFinish={finish}
      />
    </>
  );
}
