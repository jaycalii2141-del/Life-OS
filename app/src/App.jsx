// ─────────────────────────────────────────────────────────
// LIFE OS — App shell
// Auth gate → iPhone bezel, tab state, FAB → Quick Capture, AI sheet.
// ─────────────────────────────────────────────────────────
import { useState } from 'react';
import { IOSDevice } from './components/IOSDevice.jsx';
import { TabBar } from './components/TabBar.jsx';
import { QuickCapture } from './components/QuickCapture.jsx';
import { MissionControl } from './screens/MissionControl.jsx';
import { TrainingHQ } from './screens/TrainingHQ.jsx';
import { ContentStudio } from './screens/ContentStudio.jsx';
import { ONAHQ } from './screens/ONAHQ.jsx';
import { AIScreen } from './screens/AIScreen.jsx';
import { TODAY, TIMELINE } from './data.js';
import { todayKey } from './usePersistentState.js';
import { useSyncedState } from './useSyncedState.js';
import { useAuth } from './auth/AuthProvider.jsx';
import LoginScreen from './auth/LoginScreen.jsx';
import { SyncBadge } from './SyncBadge.jsx';

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

  // Mission Control state — per-day, synced to the cloud when signed in.
  const [missionState, setMissionState] = useSyncedState(`lifeos:daily:${todayKey()}`, {
    readiness: TODAY.readiness,
    energy: TODAY.energy,
    focus: TODAY.focus,
    body: TODAY.body,
    mood: TODAY.mood,
    oneThingDone: false,
    oneThing: TODAY.oneThing,
    timeline: TIMELINE,
  });

  // Captures — a synced log across all days, newest first.
  const [captures, setCaptures] = useSyncedState('lifeos:captures', []);
  const addCapture = (entry) => setCaptures((list) => [entry, ...list].slice(0, 50));

  // Re-key the screen container on tab change so screenIn animation fires
  const screenKey = tab;

  let screen;
  switch (tab) {
    case 'home':   screen = <MissionControl state={missionState} setState={setMissionState} />; break;
    case 'train':  screen = <TrainingHQ />; break;
    case 'create': screen = <ContentStudio />; break;
    case 'ona':    screen = <ONAHQ />; break;
    case 'ai':     screen = <AIScreen captures={captures} />; break;
    default:       screen = <MissionControl state={missionState} setState={setMissionState} />;
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
          onChange={setTab}
          onFab={() => setCapture({ open: true, voice: false })}
          onFabLong={() => setCapture({ open: true, voice: true })}
        />

        <QuickCapture
          open={capture.open}
          voiceMode={capture.voice}
          onSave={addCapture}
          onClose={() => setCapture({ open: false, voice: false })}
        />
      </div>
    </IOSDevice>
  );
}
