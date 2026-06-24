// ─────────────────────────────────────────────────────────
// LIFE OS V2 — App shell
// Four surfaces (Today · Life · Perform · Build) + one Intelligence.
// The Mission Engine lives here so every screen can feed it.
// Auth gate → iPhone bezel, tab state, FAB → Quick Capture.
// ─────────────────────────────────────────────────────────
import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { IOSDevice } from './components/IOSDevice.jsx';
import { TabBar } from './components/TabBar.jsx';
import { QuickCapture } from './components/QuickCapture.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import { XpLayer } from './components/XpLayer.jsx';
import { CeremonyLayer } from './components/CeremonyLayer.jsx';
import { CommandSpotlight } from './components/CommandSpotlight.jsx';
// Today is the default tab → load it eagerly for an instant first paint.
import { TodayScreen } from './screens/TodayScreen.jsx';
// Everything else is split into its own chunk, loaded on demand.
const PerformScreen = lazy(() => import('./screens/TrainingHQ.jsx').then((m) => ({ default: m.PerformScreen })));
const BuildScreen = lazy(() => import('./screens/BuildScreen.jsx').then((m) => ({ default: m.BuildScreen })));
const LifeMapScreen = lazy(() => import('./screens/LifeMapScreen.jsx').then((m) => ({ default: m.LifeMapScreen })));
const WeeklyReview = lazy(() => import('./WeeklyReview.jsx').then((m) => ({ default: m.WeeklyReview })));
const MonthlyUpgrade = lazy(() => import('./MonthlyUpgrade.jsx').then((m) => ({ default: m.MonthlyUpgrade })));
const Settings = lazy(() => import('./Settings.jsx').then((m) => ({ default: m.Settings })));
const CalendarSheet = lazy(() => import('./CalendarSheet.jsx').then((m) => ({ default: m.CalendarSheet })));
import { logEvent } from './lib/telemetry.js';
import { googleCalendarUrl, mailtoUrl, openExternal } from './lib/actions.js';
import { TIMELINE } from './data.js';
import { todayKey } from './usePersistentState.js';
import { useSyncedState } from './useSyncedState.js';
import { useMissionEngine } from './lib/useMissionEngine.js';
import { maybeMorningNudge } from './lib/nudges.js';
import { earnedFreezes, healFreezes, freezeState } from './lib/streak.js';
import { becomingIndex } from './lib/becoming.js';
import { lifeLevel } from './lib/level.js';
import { fireCeremony } from './lib/ceremony.js';
import { qualifyingMilestoneIds, MILESTONE_BY_ID } from './lib/milestones.js';
import { useAuth } from './auth/AuthProvider.jsx';
import LoginScreen from './auth/LoginScreen.jsx';
import { SyncBadge } from './SyncBadge.jsx';
import { Onboarding } from './Onboarding.jsx';
import { BootSplash } from './BootSplash.jsx';
import { Companion, CompanionLauncher } from './Companion.jsx';

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
            <div className="orb-spin" style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: 'conic-gradient(from 0deg, #45B7E8, #2DD4BF, #45B7E8)',
              WebkitMask: 'radial-gradient(circle, transparent 60%, #000 62%)',
              mask: 'radial-gradient(circle, transparent 60%, #000 62%)',
            }} />
            <div style={{
              position: 'absolute', inset: '34%', borderRadius: '50%',
              background: '#45B7E8',
            }} />
          </div>
          <span className="display" style={{ fontSize: 22, letterSpacing: '0.1em', color: 'var(--text)' }}>
            JAM HQ
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
  const [tab, setTab] = useState('today');
  const [capture, setCapture] = useState({ open: false, voice: false });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [onboarded, setOnboarded] = useSyncedState('lifeos:onboarded', false);
  const [booting, setBooting] = useState(true);
  const [companionOpen, setCompanionOpen] = useState(false);
  const [companionVoice, setCompanionVoice] = useState(false);
  const openCompanion = (voice = false) => {
    setCompanionVoice(!!voice);
    setCompanionOpen(true);
    logEvent('companion', voice ? 'open-voice' : 'open');
  };

  // Visual system — CALM by default (Oura/Linear restraint); GLOW is the
  // original command-center skin, one toggle away in Settings.
  const [vibe, setVibe] = useSyncedState('lifeos:vibe', 'calm');
  useEffect(() => {
    document.documentElement.dataset.vibe = vibe === 'glow' ? 'glow' : 'calm';
  }, [vibe]);

  // Tab changes are the backbone of usage telemetry (the "mirror").
  const changeTab = (t) => { setTab(t); logEvent(t, 'open'); };
  useEffect(() => { logEvent('today', 'open'); }, []);

  const today = todayKey();

  // Daily state — meters, one thing, timeline. Per-day, cloud-synced.
  const [missionState, setMissionState] = useSyncedState(`lifeos:daily:${today}`, freshDailyDefault(today));

  // ── The Mission Engine ── (see lib/useMissionEngine.js)
  // Generates the day's missions, keeps the One Thing in lockstep, and
  // adaptively re-ranks training to readiness. Build can push moves in.
  const { missions, doneIds, adaptedAt, toggleMission, regenerateMissions, addMission } =
    useMissionEngine(today, missionState, setMissionState);

  // Morning nudge on open (once/day) — the "welcome back, here's your focus" moment.
  useEffect(() => {
    maybeMorningNudge(missionState.oneThing ? `Today's focus: ${missionState.oneThing}` : 'Name your one thing — that’s where today lives or dies.');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Captures — a synced log across all days, newest first.
  const [captures, setCaptures] = useSyncedState('lifeos:captures', []);
  const addCapture = (entry) => { setCaptures((list) => [entry, ...list].slice(0, 50)); logEvent('capture', 'add', entry.tag); };

  // Training sessions live at the shell so the Intelligence can log them too.
  const [sessions, setSessions] = useSyncedState('lifeos:sessions', []);
  const logSession = (s) => setSessions((list) => [s, ...list].slice(0, 200));

  // Intelligence actions — propose & prefill; Jay confirms external steps.
  const runAction = (a) => {
    if (!a || !a.type) return;
    if (a.type === 'event') {
      const time = a.time || '12:00';
      setMissionState((s) => ({ ...s, timeline: [...(s.timeline ?? TIMELINE), { time, label: a.title || a.label || 'Block', kind: 'Focus', color: '#2DD4BF' }].sort((x, y) => x.time.localeCompare(y.time)) }));
      openExternal(googleCalendarUrl({ title: a.title || a.label || 'Block', time, durationMin: a.durationMin || 60, details: a.details }));
    } else if (a.type === 'email') {
      openExternal(mailtoUrl({ to: a.to || '', subject: a.subject || a.label || '', body: a.body || '' }));
    } else if (a.type === 'session') {
      logSession({ id: Date.now(), discipline: a.discipline || 'mixed', disciplineName: a.disciplineName || a.discipline || 'Mixed', duration: a.duration || 60, intensity: a.intensity || 7, date: new Date().toISOString() });
    } else if (a.type === 'capture') {
      const now = Date.now();
      addCapture({ id: now, ts: now, text: a.text || a.label || '', tag: a.tag || 'idea', color: '#45B7E8', status: 'inbox', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
    } else if (a.type === 'focus') {
      setMissionState((s) => ({ ...s, oneThing: a.text || a.label || '' }));
    }
  };

  // Daily history — powers the real streak, momentum heatmap, and 7-day trend.
  const [history, setHistory] = useSyncedState('lifeos:history', {});

  // Streak insurance — earned freeze tokens that heal a genuine 1-day gap.
  const [freezes, setFreezes] = useSyncedState('lifeos:freezes', { used: {} });

  // The becoming record — one Self-snapshot per day, so the evolution of who
  // you're becoming can be replayed over time (the foundation of the time-lapse).
  const [selfHistory, setSelfHistory] = useSyncedState('lifeos:self-history', {});

  // Level-up ceremony — fire when the Life Level crosses a new threshold.
  const [lastLevel, setLastLevel] = useSyncedState('lifeos:last-level', null);

  // Identity milestones — the "who you've become" unlocks (see lib/milestones.js).
  // Earned ids are remembered with the date crossed; a new one fires a ceremony.
  const [milestones, setMilestones] = useSyncedState('lifeos:milestones', {});

  // App settings (e.g. connected Google Calendar iCal link).
  const [settings, setSettings] = useSyncedState('lifeos:settings', {});

  // Score the day by mission completion (+ a readiness bonus).
  const todayReadiness = Math.round(((missionState.energy + missionState.focus + missionState.body + missionState.mood) / 40) * 100);
  const doneCount = missions.filter((m) => doneIds.includes(m.id)).length;
  const todayScore = Math.min(4, doneCount + (todayReadiness >= 75 ? 1 : 0));
  useEffect(() => {
    setHistory((h) => {
      const cur = h[today];
      if (cur && cur.score === todayScore && cur.readiness === todayReadiness) return h;
      return { ...h, [today]: { score: todayScore, readiness: todayReadiness, done: doneCount } };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayScore, todayReadiness, doneCount]);

  // Auto-apply freezes to heal recent 1-day gaps (re-runs when today is earned).
  useEffect(() => {
    const used = freezes.used || {};
    const healed = healFreezes(history, used, todayScore, earnedFreezes(history));
    if (Object.keys(healed).length !== Object.keys(used).length) {
      setFreezes((f) => ({ ...f, used: healed }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history, todayScore]);

  const momentum = buildMomentum(history, today, todayScore);
  const streak = computeStreak(history, today, todayScore, freezes.used || {});
  const trend = readinessTrend(history, today, todayReadiness);
  const freezeInfo = freezeState(history, freezes.used || {});

  // The Becoming Index — computed ONCE here and passed to every screen, so the
  // number is identical everywhere ("one true number"). Recomputes as state syncs.
  let becoming = null;
  try { becoming = becomingIndex(); } catch { /* first run */ }

  // Record today's Self snapshot for the time-lapse. We store the eight
  // facet scores + trend (not just the number) so the Self's SHAPE — not
  // only its glow — can be replayed across time.
  useEffect(() => {
    try {
      const b = becomingIndex();
      const lvl = lifeLevel();
      setSelfHistory((h) => {
        const cur = h[today];
        const next = {
          becoming: b.score,
          level: lvl.level,
          trend: b.trend,
          facets: (b.facets || []).map((f) => ({ id: f.id, score: f.score })),
        };
        // Re-write if the day is new, the numbers moved, or this is an
        // older facet-less snapshot being upgraded in place.
        if (cur && cur.becoming === next.becoming && cur.level === next.level && cur.facets) return h;
        return { ...h, [today]: next };
      });
    } catch { /* first run */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayScore, doneCount]);

  // Level-up ceremony.
  useEffect(() => {
    try {
      const lvl = lifeLevel().level;
      if (lastLevel == null) { setLastLevel(lvl); return; }
      if (lvl > lastLevel) { fireCeremony({ kicker: 'LEVEL UP', title: `Level ${lvl}`, subtitle: 'you’ve become more' }); setLastLevel(lvl); }
      else if (lvl !== lastLevel) setLastLevel(lvl);
    } catch { /* */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayScore, doneCount, sessions]);

  // Identity milestones — detect newly-earned thresholds. On the very first
  // run we backfill what already qualifies SILENTLY (no ceremony storm from
  // existing data); after that, crossing one fires a single ceremony.
  useEffect(() => {
    let qualifying;
    try { qualifying = qualifyingMilestoneIds({ becoming }); } catch { return; }
    const seeded = !!milestones._seeded;
    const newlyEarned = qualifying.filter((id) => !milestones[id]);
    if (seeded && !newlyEarned.length) return;
    setMilestones((prev) => {
      const next = { ...prev };
      qualifying.forEach((id) => { if (!next[id]) next[id] = { earnedAt: today }; });
      if (!prev._seeded) next._seeded = today;
      return next;
    });
    if (seeded && newlyEarned.length) {
      const m = MILESTONE_BY_ID[newlyEarned[0]];
      if (m) fireCeremony({ kicker: 'IDENTITY UNLOCKED', title: m.name, subtitle: m.statement });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayScore, doneCount, sessions, becoming?.score]);

  // Untriaged captures → a gentle badge on the Life tab.
  const inboxCount = captures.filter((c) => (c.status || 'inbox') === 'inbox').length;

  // Re-key the screen container on tab change so screenIn animation fires
  const screenKey = tab;

  // ── The command bar ──
  // Long-press anywhere that isn't itself actionable → summon the spotlight.
  const [cmdOpen, setCmdOpen] = useState(false);
  const cmdTimer = useRef(null);
  const cmdStart = useRef({ x: 0, y: 0 });
  const clearCmd = () => { if (cmdTimer.current) { clearTimeout(cmdTimer.current); cmdTimer.current = null; } };
  const onHostPointerDown = (e) => {
    if (e.target?.closest?.('.pressable, input, textarea, button, a, [role="button"], svg')) return;
    cmdStart.current = { x: e.clientX, y: e.clientY };
    clearCmd();
    cmdTimer.current = setTimeout(() => { try { navigator.vibrate?.(14); } catch { /* */ } setCmdOpen(true); }, 500);
  };
  const onHostPointerMove = (e) => {
    if (!cmdTimer.current) return;
    if (Math.abs(e.clientX - cmdStart.current.x) > 12 || Math.abs(e.clientY - cmdStart.current.y) > 12) clearCmd();
  };

  let screen;
  switch (tab) {
    case 'life':
      screen = <LifeMapScreen captures={captures} setCaptures={setCaptures} readiness={todayReadiness} trend={trend} history={history} becoming={becoming} onOpenReview={() => setReviewOpen(true)} onOpenUpgrade={() => setUpgradeOpen(true)} onGoTab={changeTab} />;
      break;
    case 'perform':
      screen = <PerformScreen sessions={sessions} onLogSession={logSession} readiness={todayReadiness} />;
      break;
    case 'build':
      screen = <BuildScreen onAddMission={addMission} missionIds={missions.map((m) => m.id)} />;
      break;
    case 'today':
    default:
      screen = (
        <TodayScreen
          state={missionState}
          setState={setMissionState}
          missions={missions}
          doneIds={doneIds}
          adaptedAt={adaptedAt}
          onToggleMission={toggleMission}
          onRegenerate={regenerateMissions}
          momentum={momentum}
          streak={streak}
          freezes={freezeInfo}
          becoming={becoming}
          trend={trend}
          icalUrl={settings.icalUrl}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenCalendar={() => setCalendarOpen(true)}
          onOpenCompanion={openCompanion}
          onGoTab={changeTab}
        />
      );
  }

  return (
    <IOSDevice dark width={402} height={874}>
      <div className="screen-host" onPointerDown={onHostPointerDown} onPointerMove={onHostPointerMove} onPointerUp={clearCmd} onPointerLeave={clearCmd} onPointerCancel={clearCmd}>
        <SyncBadge />
        <XpLayer />
        <CeremonyLayer />
        <CommandSpotlight
          open={cmdOpen}
          onClose={() => setCmdOpen(false)}
          onAsk={() => openCompanion(false)}
          onCapture={() => setCapture({ open: true, voice: false })}
          onCalendar={() => setCalendarOpen(true)}
          onReview={() => setReviewOpen(true)}
          onGoTab={changeTab}
        />
        <div className="screen-scroll" key={screenKey}>
          <ErrorBoundary resetKey={screenKey}>
            <Suspense fallback={<ScreenLoading />}>
              {screen}
            </Suspense>
          </ErrorBoundary>
        </div>

        <TabBar
          active={tab}
          onChange={changeTab}
          badges={{ life: inboxCount }}
          onFab={() => setCapture({ open: true, voice: false })}
          onFabLong={() => setCapture({ open: true, voice: true })}
        />

        <QuickCapture
          open={capture.open}
          voiceMode={capture.voice}
          onSave={addCapture}
          onClose={() => setCapture({ open: false, voice: false })}
        />

        <CompanionLauncher onOpen={() => openCompanion(false)} onOpenVoice={() => openCompanion(true)} />
        <Companion open={companionOpen} startVoice={companionVoice} onClose={() => { setCompanionOpen(false); setCompanionVoice(false); }} onAction={runAction} />

        {/* Modals mount only when opened, so their code loads on first use. */}
        <Suspense fallback={null}>
          {settingsOpen && (
            <Settings
              open={settingsOpen}
              onClose={() => setSettingsOpen(false)}
              icalUrl={settings.icalUrl}
              onSetIcal={(url) => setSettings((s) => ({ ...s, icalUrl: url }))}
              vibe={vibe}
              onSetVibe={setVibe}
            />
          )}
          {calendarOpen && (
            <CalendarSheet open={calendarOpen} onClose={() => setCalendarOpen(false)} icalUrl={settings.icalUrl} />
          )}
          {reviewOpen && (
            <WeeklyReview open={reviewOpen} onClose={() => setReviewOpen(false)} />
          )}
          {upgradeOpen && (
            <MonthlyUpgrade open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
          )}
        </Suspense>

        {!onboarded && <Onboarding onDone={() => setOnboarded(true)} />}
        {booting && <BootSplash onDone={() => setBooting(false)} />}
      </div>
    </IOSDevice>
  );
}

// Minimal, on-brand fallback while a screen chunk loads.
// Skeleton placeholders that mirror a screen's shape — content fades in
// over structure, the way premium apps load (never a blank or a spinner).
function ScreenLoading() {
  const Card = ({ h, children }) => (
    <div className="hud glass" style={{ borderRadius: 18, padding: 16, height: h }}>{children}</div>
  );
  const Line = ({ w, h = 11, mt = 0 }) => <div className="skeleton" style={{ width: w, height: h, marginTop: mt }} />;
  return (
    <div className="screen-content" style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 8 }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Line w={90} h={9} />
            <Line w={150} h={18} mt={8} />
            <Line w={110} h={9} mt={10} />
          </div>
          <div className="skeleton" style={{ width: 78, height: 78, borderRadius: '50%' }} />
        </div>
        <Line w="100%" h={4} mt={16} />
        <Line w="92%" mt={14} />
        <Line w="74%" mt={8} />
      </Card>
      <Card h={70}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div className="skeleton" style={{ width: 34, height: 34, borderRadius: 10 }} />
          <Line w="60%" />
        </div>
      </Card>
      <Card>
        <Line w={80} h={9} />
        <Line w="100%" h={26} mt={12} />
        <div style={{ display: 'flex', gap: 4, marginTop: 10 }}>
          {Array.from({ length: 14 }).map((_, i) => <div key={i} className="skeleton" style={{ flex: 1, height: 24, borderRadius: 5 }} />)}
        </div>
      </Card>
    </div>
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
    checkedIn: false,
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

// Consecutive days (ending today) with any activity. A frozen past day
// (streak insurance) counts as kept; today is never frozen.
function computeStreak(history, today, todayScore, frozen = {}) {
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const k = keyDaysAgo(i);
    const score = k === today ? todayScore : (history[k]?.score ?? 0);
    if (score >= 1 || frozen[k]) streak += 1;
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
