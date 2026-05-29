// ─────────────────────────────────────────────────────────
// LIFE OS — App shell
// Wraps everything in the iPhone bezel, manages tab state,
// FAB → Quick Capture modal, AI sheet.
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
import { usePersistentState, todayKey } from './usePersistentState.js';

export default function App() {
  const [tab, setTab] = useState('home');
  const [capture, setCapture] = useState({ open: false, voice: false });

  // Mission Control state — persisted per-day so it survives reloads but
  // starts fresh each morning (matches the "open it at 6:30am" product intent).
  const [missionState, setMissionState] = usePersistentState(`lifeos:daily:${todayKey()}`, {
    readiness: TODAY.readiness,
    energy: TODAY.energy,
    focus: TODAY.focus,
    body: TODAY.body,
    mood: TODAY.mood,
    oneThingDone: false,
    oneThing: TODAY.oneThing,
    timeline: TIMELINE,
  });

  // Captures — a persistent log across all days, newest first.
  const [captures, setCaptures] = usePersistentState('lifeos:captures', []);
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
