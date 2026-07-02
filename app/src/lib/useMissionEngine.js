// ─────────────────────────────────────────────────────────
// useMissionEngine — the daily Mission Engine, extracted from App.jsx.
//
// Owns the per-day mission document (generate once, regenerable, done-state
// survives re-plans), keeps the One Thing in lockstep with the list, and
// adaptively swaps the training mission when readiness crosses a threshold.
//
// Inputs: today's key, plus the daily missionState (for One Thing + meters)
// and its setter (to mirror the One-Thing done flag).
// Returns the mission list, done ids, adaptedAt stamp, and the mutators.
// ─────────────────────────────────────────────────────────
import { useEffect, useRef } from 'react';
import { useSyncedState } from '../useSyncedState.js';
import { generateMissions } from './mission.js';
import { logEvent } from './telemetry.js';

export function useMissionEngine(today, missionState, setMissionState) {
  // Generated once per day from every data source; regenerable; Build's
  // Action Center can push extra missions in. Done-state survives re-plans.
  const [missionDoc, setMissionDoc] = useSyncedState(`lifeos:mission:${today}`, { items: null, doneIds: [] });

  useEffect(() => {
    if (!missionDoc.items) {
      const items = generateMissions();
      setMissionDoc((d) => (d.items ? d : { ...d, items, doneIds: d.doneIds || [] }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missionDoc.items]);

  // Defensive dedupe by id on read — heals any persisted doc that picked up
  // a duplicate (the old lockstep guard raced its own updater; docs persist,
  // so a duplicate written once would otherwise live forever).
  const missions = (missionDoc.items || []).filter((m, i, arr) => arr.findIndex((x) => x.id === m.id) === i);
  const doneIds = missionDoc.doneIds || [];

  // Keep the One Thing and the mission list in lockstep. All checks live
  // INSIDE the functional updater so a double-fired effect can't prepend twice.
  useEffect(() => {
    if (!missionDoc.items || !missionState.oneThing) return;
    setMissionDoc((d) => {
      const items = d.items || [];
      const idx = items.findIndex((m) => m.id === 'one-thing');
      if (idx === -1) {
        return {
          ...d,
          items: [{ id: 'one-thing', kind: 'focus', icon: '🎯', title: missionState.oneThing, why: 'Your One Thing — the single win that makes today a success.', est: 90, go: 'today' }, ...items].slice(0, 5),
        };
      }
      if (items[idx].title !== missionState.oneThing) {
        return { ...d, items: items.map((m) => (m.id === 'one-thing' ? { ...m, title: missionState.oneThing } : m)) };
      }
      return d;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missionState.oneThing, missionDoc.items]);

  // ── Adaptive re-rank ──
  // When readiness crosses a threshold after check-in, swap the training
  // mission to match the moment (push → technique → recovery) — preserving
  // order, the other missions, and completion. The cockpit re-plans itself.
  const lastBucketRef = useRef(null);
  useEffect(() => {
    if (!missionDoc.items || !missionState.checkedIn) return;
    const r = Math.round(((missionState.energy + missionState.focus + missionState.body + missionState.mood) / 40) * 100);
    const bucket = r >= 60 ? 'push' : r >= 45 ? 'tech' : 'recover';
    if (lastBucketRef.current === null) { lastBucketRef.current = bucket; return; }
    if (bucket === lastBucketRef.current) return;
    lastBucketRef.current = bucket;
    const freshTrain = generateMissions().find((m) => m.kind === 'train');
    if (!freshTrain) return;
    setMissionDoc((d) => {
      const oldTrain = (d.items || []).find((m) => m.kind === 'train');
      if (!oldTrain || oldTrain.id === freshTrain.id) return d;
      const items = (d.items || []).map((m) => (m.kind === 'train' ? freshTrain : m));
      let doneIds = d.doneIds || [];
      if (doneIds.includes(oldTrain.id)) doneIds = [...doneIds.filter((x) => x !== oldTrain.id), freshTrain.id];
      return { ...d, items, doneIds, adaptedAt: Date.now() };
    });
    logEvent('mission', 'adapt', bucket);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missionState.energy, missionState.focus, missionState.body, missionState.mood, missionState.checkedIn, missionDoc.items]);

  const toggleMission = (id) => {
    setMissionDoc((d) => {
      const done = (d.doneIds || []).includes(id);
      const doneIdsNext = done ? d.doneIds.filter((x) => x !== id) : [...(d.doneIds || []), id];
      return { ...d, doneIds: doneIdsNext };
    });
    if (id === 'one-thing') {
      setMissionState((s) => ({ ...s, oneThingDone: !doneIds.includes(id) }));
    }
    logEvent('mission', 'toggle', id);
  };

  const regenerateMissions = () => {
    const items = generateMissions();
    setMissionDoc((d) => ({ ...d, items, doneIds: (d.doneIds || []).filter((id) => items.some((m) => m.id === id)) }));
    logEvent('mission', 'regenerate');
  };

  // Build's Action Center → "do today" pushes a move into the mission.
  const addMission = (rec) => {
    setMissionDoc((d) => {
      const items = d.items || [];
      if (items.some((m) => m.id === rec.id)) return d;
      return { ...d, items: [...items, { ...rec, kind: rec.kind || 'build', go: rec.go || 'build' }] };
    });
  };

  return { missions, doneIds, adaptedAt: missionDoc.adaptedAt, toggleMission, regenerateMissions, addMission };
}
