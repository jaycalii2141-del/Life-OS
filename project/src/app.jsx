// ─────────────────────────────────────────────────────────
// LIFE OS — App shell
// Wraps everything in the iPhone bezel, manages tab state,
// FAB → Quick Capture modal, AI sheet.
// ─────────────────────────────────────────────────────────

function App() {
  const [tab, setTab] = useState('home');
  const [capture, setCapture] = useState({ open: false, voice: false });

  // Mission Control mutable state (so meters + One Thing work across tab switches)
  const [missionState, setMissionState] = useState({
    readiness: TODAY.readiness,
    energy: TODAY.energy,
    focus: TODAY.focus,
    body: TODAY.body,
    mood: TODAY.mood,
    oneThingDone: false,
  });

  // Re-key the screen container on tab change so screenIn animation fires
  const screenKey = tab;

  let screen;
  switch (tab) {
    case 'home':   screen = <MissionControl state={missionState} setState={setMissionState} />; break;
    case 'train':  screen = <TrainingHQ />; break;
    case 'create': screen = <ContentStudio />; break;
    case 'ona':    screen = <ONAHQ />; break;
    case 'ai':     screen = <AIScreen />; break;
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
          onClose={() => setCapture({ open: false, voice: false })}
        />
      </div>
    </IOSDevice>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
