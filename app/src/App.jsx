// ─────────────────────────────────────────────────────────
// LIFE OS — App shell
// Auth gate → iPhone bezel, tab state, FAB → Quick Capture, AI sheet.
// ─────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { IOSDevice } from './components/IOSDevice.jsx';
import { TabBar } from './components/TabBar.jsx';
import { QuickCapture } from './components/QuickCapture.jsx';
import { MissionControl } from './screens/MissionControl.jsx';
import { TrainingHQ } from './screens/TrainingHQ.jsx';
import { ContentStudio } from './screens/ContentStudio.jsx';
import { ONAHQ } from './screens/ONAHQ.jsx';
import { AIScreen } from './screens/AIScreen.jsx';
import { MindScreen } from './screens/MindScreen.jsx';
import { WeeklyReview } from './WeeklyReview.jsx';
import { MonthlyUpgrade } from './MonthlyUpgrade.jsx';
import { logEvent } from './lib/telemetry.js';
import { TODAY, TIMELINE } from './data.js';
import { todayKey } from './usePersistentState.js';
import { useSyncedState } from './useSyncedState.js';
import { useAuth } from './auth/AuthProvider.jsx';
import LoginScreen from './auth/LoginScreen.jsx';
import { SyncBadge } from './SyncBadge.jsx';
import { Settings } from './Settings.jsx';
import { CalendarSheet } from './CalendarSheet.jsx';

// ─────────────────────────────────────────────────────────
// Auth gate — decides login vs app. When Supabase isn't
// configured, the app runs as-is on localStorage (no login).
// ─────────────────────────────────────────────────────────
export default function App() {
  const { configured, loading, session } = useAuth();

  if (configured && loading) {
    return (
      <IOSDevice dark width={402} height={874}>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', gap: 18,
          alignItems: 'center', justifyContent: 'center',
          background: 'var(--bg-0)',
        }}>
          <div style={{ position: 'relative', width: 84, height: 84 }}>
            <div style={{
              position: 'absolute', inset: -14, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0,212,255,0.35) 0%, transparent 65%)',
            }} />
            <div className="orb-spin" style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: 'conic-gradient(from 0deg, #00D4FF, #B14CFF, #00D4FF)',
              WebkitMask: 'radial-gradient(circle, transparent 60%, #000 62%)',
              mask: 'radial-gradient(circle, transparent 60%, #000 62%)',
            }} />
            <div style={{
              position: 'absolute', inset: '34%', borderRadius: '50%',
              background: '#00D4FF', boxShadow: '0 0 20px rgba(0,212,255,0.7)',
            }} />
          </div>
          <span className="display" style={{ fontSize: 22, letterSpacing: '0.1em', color: 'var(--text)' }}>
            LIFE OS
          </span>
        </div>
      </IOSDevice>
    );
  }

  if (configured && !session) return <LoginScreen />;

  return <MainApp />;
}

// ─────────────────────────────────────────────────────────
// The actual app (all stateful hooks live here, below the gate)
// ─────────────────────────────────────────────────────────
function MainApp() {
  const [tab, setTab] = useState('home');
  const [capture, setCapture] = useState({ open: false, voice: false });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  // Tab changes are the backbone of usage telemetry (the "mirror").
  const changeTab = (t) => { setTab(t); logEvent(t, 'open'); };
  useEffect(() => { logEvent('home', 'open'); }, []);

  // Mission Control state — per-day, synced to the cloud when signed in.
  // Each new day starts fresh: blank One Thing, neutral meters to re-assess,
  // and yesterday's timeline carried forward as an editable template.
  const [missionState, setMissionState] = useSyncedState(`lifeos:daily:${todayKey()}`, freshDailyDefault(todayKey()));

  // Captures — a synced log across all days, newest first.
  const [captures, setCaptures] = useSyncedState('lifeos:captures', []);
  const addCapture = (entry) => { setCaptures((list) => [entry, ...list].slice(0, 50)); logEvent('capture', 'add', entry.tag); };

  // Daily history — powers the real streak, momentum heatmap, and 7-day trend.
  const [history, setHistory] = useSyncedState('lifeos:history', {});

  // App settings (e.g. connected Google Calendar iCal link).
  const [settings, setSettings] = useSyncedState('lifeos:settings', {});

  // Record today's score whenever mission state changes.
  const today = todayKey();
  const todayReadiness = Math.round(((missionState.energy + missionState.focus + missionState.body + missionState.mood) / 40) * 100);
  const todayScore = Math.min(4, 1 + (missionState.oneThingDone ? 2 : 0) + (todayReadiness >= 75 ? 1 : 0));
  useEffect(() => {
    setHistory((h) => {
      const cur = h[today];
      if (cur && cur.score === todayScore && cur.readiness === todayReadiness) return h;
      return { ...h, [today]: { score: todayScore, readiness: todayReadiness, done: missionState.oneThingDone } };
    });
  }, [todayScore, todayReadiness, missionState.oneThingDone]);

  const momentum = buildMomentum(history, today, todayScore);
  const streak = computeStreak(history, today, todayScore);
  const trend = readinessTrend(history, today, todayReadiness);

  // Re-key the screen container on tab change so screenIn animation fires
  const screenKey = tab;

  let screen;
  switch (tab) {
    case 'home':   screen = <MissionControl state={missionState} setState={setMissionState} momentum={momentum} streak={streak} trend={trend} icalUrl={settings.icalUrl} onOpenSettings={() => setSettingsOpen(true)} onOpenCalendar={() => setCalendarOpen(true)} onGoMind={() => changeTab('mind')} />; break;
    case 'train':  screen = <TrainingHQ />; break;
    case 'create': screen = <ContentStudio />; break;
    case 'ona':    screen = <ONAHQ />; break;
    case 'mind':   screen = <MindScreen captures={captures} setCaptures={setCaptures} onOpenReview={() => setReviewOpen(true)} onOpenUpgrade={() => setUpgradeOpen(true)} />; break;
    case 'ai':     screen = <AIScreen captures={captures} />; break;
    default:       screen = <MissionControl state={missionState} setState={setMissionState} momentum={momentum} streak={streak} trend={trend} icalUrl={settings.icalUrl} onOpenSettings={() => setSettingsOpen(true)} onOpenCalendar={() => setCalendarOpen(true)} onGoMind={() => changeTab('mind')} />;
  }

  return (
    <IOSDevice dark width={402} height={874}>
      <div className="screen-host">
        <SyncBadge />
        <div className="screen-scroll" key={screenKey}>
          {screen}
        </div>

        <TabBar
          active={tab}
          onChange={changeTab}
          onFab={() => setCapture({ open: true, voice: false })}
          onFabLong={() => setCapture({ open: true, voice: true })}
        />

        <QuickCapture
          open={capture.open}
          voiceMode={capture.voice}
          onSave={addCapture}
          onClose={() => setCapture({ open: false, voice: false })}
        />

        <Settings
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          icalUrl={settings.icalUrl}
          onSetIcal={(url) => setSettings((s) => ({ ...s, icalUrl: url }))}
        />

        <CalendarSheet
          open={calendarOpen}
          onClose={() => setCalendarOpen(false)}
          icalUrl={settings.icalUrl}
        />

        <WeeklyReview
          open={reviewOpen}
          onClose={() => setReviewOpen(false)}
        />

        <MonthlyUpgrade
          open={upgradeOpen}
          onClose={() => setUpgradeOpen(false)}
        />
      </div>
    </IOSDevice>
  );
}

// ─────────────────────────────────────────────────────────
// Fresh daily default — carry the timeline forward, reset the rest
// ─────────────────────────────────────────────────────────
function latestPriorTimeline(todayK) {
  let bestDate = '';
  let timeline = null;
  const prefix = 'lifeos:daily:';
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(prefix)) {
      const date = k.slice(prefix.length);
      if (date < todayK && date > bestDate) {
        try {
          const parsed = JSON.parse(localStorage.getItem(k));
          if (parsed?.timeline) { bestDate = date; timeline = parsed.timeline; }
        } catch { /* skip */ }
      }
    }
  }
  return timeline;
}

function freshDailyDefault(todayK) {
  return {
    energy: 7, focus: 7, body: 7, mood: 7,
    oneThingDone: false,
    oneThing: '',
    timeline: latestPriorTimeline(todayK) ?? TIMELINE,
  };
}

// ─────────────────────────────────────────────────────────
// History math — date key for N days ago, plus derived stats
// ─────────────────────────────────────────────────────────
function keyDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const p = (x) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// Last 14 days of momentum scores (0–4); today's live score caps the array.
function buildMomentum(history, today, todayScore) {
  const out = [];
  for (let i = 13; i >= 0; i--) {
    const k = keyDaysAgo(i);
    const score = k === today ? todayScore : (history[k]?.score ?? 0);
    out.push(score);
  }
  return out;
}

// Consecutive days (ending today) with any activity.
function computeStreak(history, today, todayScore) {
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const k = keyDaysAgo(i);
    const score = k === today ? todayScore : (history[k]?.score ?? 0);
    if (score >= 1) streak += 1;
    else break;
  }
  return streak;
}

// Today's readiness vs the average of the prior days that have data.
function readinessTrend(history, today, todayReadiness) {
  const vals = [];
  for (let i = 1; i <= 7; i++) {
    const e = history[keyDaysAgo(i)];
    if (e && typeof e.readiness === 'number') vals.push(e.readiness);
  }
  if (!vals.length) return null;
  const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
  return Math.round(todayReadiness - avg);
}
