# JAM HQ / Life HQ — Application Architecture

> Technical architecture reference for external audit.
> Product names in code: **"JAM HQ"** (login/splash/manifest), **"Life OS / LifeOS V2"** (source comments), **"Life HQ"** (audit alias). All refer to the same app.
> Codebase root: `/Users/jaymartinez/Life-OS`. The deployable app lives entirely in `/Users/jaymartinez/Life-OS/app` (this is the Vercel root directory).

---

## 0. Stack at a glance

| Layer | Technology |
|---|---|
| UI framework | React 18.3 (`react`, `react-dom`), function components + hooks, `StrictMode` |
| Build / dev | Vite 5.4 + `@vitejs/plugin-react`; `base: './'`; manual chunks for `react` and `supabase` |
| Routing | **None.** No router library. Navigation is `useState` tab switching inside a `switch` in `App.jsx` |
| Persistence (local) | `localStorage` via a custom module-level shared store (`usePersistentState.js`) |
| Persistence (cloud) | Supabase Postgres table `app_state(user_id, key, value jsonb)`, one row per `(user, key)` |
| Auth | Supabase Auth — email + password (`signInWithPassword` / `signUp`), session JWT |
| AI backend | Vercel serverless ESM functions in `app/api/*.js` that proxy Anthropic Messages API (model `claude-haiku-4-5-20251001`) |
| AI gate | Every AI endpoint verifies the caller's Supabase session JWT (`api/_auth.js`) + per-user in-memory rate limit |
| External ingestion | GymDesk → Zapier → `api/ona-webhook.js` → Supabase `app_state` row (service role) |
| Calendar | Google Calendar secret iCal feed, read server-side via `api/calendar.js` |
| PWA | `public/manifest.webmanifest` + `public/sw.js` (cache-first app shell, same-origin only) |
| Hosting | Vercel (`vercel.json`: build → `dist`, SPA rewrite of all non-`/api` paths to `/index.html`). A `netlify.toml` also exists but Vercel is the documented deploy target. |

---

## 1. FOLDER STRUCTURE

Real tree of `app/` (build artifacts, `node_modules`, and the ~100 stale `vite.config.js.timestamp-*.mjs` temp files omitted):

```
app/                              ← Vercel root directory
├── index.html                    ← SPA entry; mounts #root, links manifest
├── package.json                  ← deps: react, react-dom, @supabase/supabase-js
├── vite.config.js                ← base './', manualChunks {react, supabase}
├── vercel.json                   ← build → dist; rewrite non-/api → /index.html
├── netlify.toml                  ← secondary host config (Vercel is primary)
├── .env.example                  ← documents VITE_SUPABASE_* and ANTHROPIC_API_KEY
├── README.md
│
├── api/                          ← Vercel serverless functions (ESM, Node)
│   ├── _auth.js                  ← shared JWT verify + rate-limit gate (verifyUser, rateLimit, gate)
│   ├── ai.js                     ← generic multi-persona AI proxy (chief/coach/creative/ona/podium/architect)
│   ├── chief.js                  ← Chief-of-Staff: morning brief / weekly review / monthly upgrade
│   ├── coach.js                  ← training-session designer + week (microcycle) planner
│   ├── companion.js              ← the always-present multi-turn Companion brain
│   ├── decompose.js              ← goal → sequenced milestones (strict JSON out)
│   ├── calendar.js               ← reads a Google secret iCal feed, expands recurrence (NOT auth-gated)
│   └── ona-webhook.js            ← GymDesk/Zapier ingestion → app_state via service role (secret-gated)
│
├── public/                       ← static assets served as-is
│   ├── manifest.webmanifest      ← PWA manifest ("JAM HQ", standalone, portrait)
│   ├── sw.js                     ← service worker (cache-first shell, same-origin GET only)
│   ├── icon.svg / icon-192.png / icon-512.png / favicon-32.png / apple-touch-icon.png
│
├── supabase/
│   └── schema.sql                ← app_state table DDL + RLS "own rows" policy
│
└── src/
    ├── main.jsx                  ← React root; wraps <App> in <AuthProvider>; installs haptics + SW
    ├── App.jsx                   ← shell: auth gate, tab switch, modals, mission engine wiring
    ├── styles.css                ← global CSS, design tokens (--bg-0, --cyan, vibe themes…)
    ├── data.js                   ← all seed/static data (skills, brands, ONA, disciplines, domains…)
    ├── coaching.js               ← coaching knowledge base (DRILLS, FOUNDATIONS, blindspot analyzer, periodization)
    ├── usePersistentState.js     ← localStorage-backed shared store + cross-tab sync + todayKey()
    ├── useSyncedState.js         ← wraps usePersistentState, adds Supabase pull-once + push-on-change
    │
    │  ── top-level screens-as-modals / overlays (lazy-loaded from App) ──
    ├── BootSplash.jsx            ← first-paint splash
    ├── Onboarding.jsx            ← first-run onboarding (gated on lifeos:onboarded)
    ├── Companion.jsx             ← THE INTELLIGENCE: launcher + chat sheet + voice loop
    ├── CompanionLauncher         ← (exported from Companion.jsx) floating orb on every screen
    ├── Settings.jsx              ← iCal link, vibe (calm/glow) toggle
    ├── CalendarSheet.jsx         ← 14-day calendar view (calls /api/calendar)
    ├── WeeklyReview.jsx          ← Sunday review (calls /api/chief mode:review)
    ├── MonthlyUpgrade.jsx        ← monthly meta-report (calls /api/chief mode:upgrade)
    ├── ChiefBrief.jsx            ← morning brief card (calls /api/chief mode:brief)
    ├── CoachSheet.jsx            ← today's session designer (calls /api/coach)
    ├── WeekPlanSheet.jsx         ← week microcycle planner (calls /api/coach mode:week)
    ├── GoalDecomposer.jsx        ← goal → milestones (calls /api/decompose)
    ├── SyncBadge.jsx             ← transient "SAVED" pill, listens for 'lifeos:sync' event
    │
    ├── auth/
    │   ├── AuthProvider.jsx      ← Supabase session context (configured/loading/session + signIn/up/out)
    │   └── LoginScreen.jsx       ← email+password sign-in / sign-up screen
    │
    ├── components/               ← shared UI primitives
    │   ├── IOSDevice.jsx         ← iPhone bezel/status-bar/home-indicator frame (+ IOSStatusBar/NavBar/List/Keyboard)
    │   ├── TabBar.jsx            ← 4-tab bottom bar + center FAB (+ TABS export)
    │   ├── QuickCapture.jsx      ← FAB capture sheet (text + voice)
    │   ├── Companion-related Sheet.jsx ← bottom-sheet container primitive
    │   ├── ErrorBoundary.jsx     ← per-screen error boundary, resets on resetKey (tab) change
    │   ├── ObjectMenu.jsx        ← context/long-press object menu
    │   ├── QuickCapture.jsx
    │   ├── atoms.jsx             ← tiny visual atoms (HUDTicks, etc.)
    │   └── icons.jsx             ← all SVG icon components
    │
    ├── screens/                  ← the four tab screens + their heavy sub-screens
    │   ├── TodayScreen.jsx       ← "Command/Today" tab (eager-loaded — default tab)
    │   ├── LifeMapScreen.jsx     ← "Life/Map" tab (domains, captures triage, journal)
    │   ├── TrainingHQ.jsx        ← "Perform/Move" tab (PerformScreen — skill trees, sessions)
    │   ├── BuildScreen.jsx       ← "Build" tab (Action Center, ONA/Content/Podium entry)
    │   ├── ONAHQ.jsx             ← ONA operations dashboard (sub-screen of Build)
    │   ├── ContentStudio.jsx     ← content/brand workspace (sub-screen of Build)
    │   └── ContentStudio/ONAHQ feed the mission engine's recommendOna/recommendContent
    │
    └── lib/
        ├── supabase.js          ← creates the Supabase client iff VITE_SUPABASE_* present
        ├── api.js               ← aiFetch(): POST to /api with Bearer access_token attached
        ├── useMissionEngine.js  ← the daily Mission Engine hook (generate/regenerate/adapt/toggle/add)
        ├── mission.js           ← pure mission logic: snapshot(), generateMissions(), recommendOna/Content, localAnswer()
        ├── quests.js            ← Quest engine: SEED_QUESTS, domainScores(), alignmentScore(), recentWins()
        ├── telemetry.js         ← local-only "mirror" ring buffer (logEvent / usageBySurface)
        ├── actions.js           ← external-action URL builders (googleCalendarUrl, mailtoUrl, openExternal)
        ├── aiActions.js         ← thin helpers over aiFetch (companion + decompose)
        ├── haptics.js           ← global haptics install + celebrate()
        ├── voice.js             ← Web Speech API wrappers (listener, TTS speak/stop)
        ├── useLongPress.js      ← long-press gesture hook
        └── icons / etc.
```

> Note: `Sheet.jsx`, `ObjectMenu.jsx`, `QuickCapture.jsx`, `atoms.jsx`, `icons.jsx` are the real files under `src/components/`. The repo root (outside `app/`) also contains design docs, an older `project/` prototype, and an unrelated top-level `index.html` — none of those ship.

---

## 2. ROUTE STRUCTURE

There is **no router**. The app is a single SPA surface; "routes" are a tab-state machine in `App.jsx`.

### Entry & auth gate (`App.jsx` → `App()`)
```
App()
 ├─ const { configured, loading, session } = useAuth()
 ├─ if (configured && loading)  → render JAM HQ loading splash (orb)
 ├─ if (configured && !session) → return <LoginScreen/>     ← the only "auth route"
 └─ else                        → <MainApp/>                 ← the app proper
```
When Supabase env vars are absent, `configured === false`, the gate is skipped entirely, and the app runs localStorage-only with no login.

### Tab state machine (`MainApp()`)
A single `const [tab, setTab] = useState('today')`. `changeTab(t)` sets the tab **and** logs a telemetry `open` event (the "mirror"). The screen is chosen by a `switch (tab)`:

| `tab` value | TabBar label | Screen component | Load |
|---|---|---|---|
| `today` (default) | **Command** | `TodayScreen` | eager (instant first paint) |
| `life` | **Map** | `LifeMapScreen` | lazy chunk |
| `perform` | **Move** | `PerformScreen` (from `TrainingHQ.jsx`) | lazy chunk |
| `build` | **Build** | `BuildScreen` | lazy chunk |

The chosen `screen` is rendered inside:
```
<div className="screen-scroll" key={tab}>     ← re-key on tab change → screenIn animation
  <ErrorBoundary resetKey={tab}>              ← crash isolation per screen
    <Suspense fallback={<ScreenLoading/>}>    ← skeleton while lazy chunk loads
      {screen}
```

### Modals / sheets (no route — boolean state)
Each overlay has its own `useState` boolean and mounts **only when open**, so its chunk loads on first use. The lazy modals share one `<Suspense fallback={null}>`:

| State flag | Component | Trigger |
|---|---|---|
| `settingsOpen` | `Settings` (lazy) | TodayScreen → onOpenSettings |
| `calendarOpen` | `CalendarSheet` (lazy) | TodayScreen → onOpenCalendar |
| `reviewOpen` | `WeeklyReview` (lazy) | LifeMapScreen → onOpenReview |
| `upgradeOpen` | `MonthlyUpgrade` (lazy) | LifeMapScreen → onOpenUpgrade |
| `capture.open` | `QuickCapture` (eager) | TabBar FAB (tap = text, long-press = voice) |
| `companionOpen` | `Companion` (eager) | `CompanionLauncher` orb, anywhere |
| `!onboarded` | `Onboarding` | first run (`lifeos:onboarded` false) |
| `booting` | `BootSplash` | initial render |

The Companion and its launcher are **persistent on every tab** (rendered in `MainApp`, not inside a screen).

---

## 3. COMPONENT HIERARCHY

```
main.jsx
└─ <StrictMode>
   └─ <AuthProvider>                       ← Supabase session context (lib/supabase.js)
      └─ <App>                             ← auth gate
         ├─ (loading)  IOSDevice → splash orb
         ├─ (no session) <LoginScreen> → IOSDevice → HUD card
         └─ <MainApp>
            └─ <IOSDevice dark 402×874>    ← iPhone frame (or full-bleed on real phone/PWA)
               └─ <div.screen-host>
                  ├─ <SyncBadge>                       ← "SAVED" pill (listens 'lifeos:sync')
                  │
                  ├─ <div.screen-scroll key={tab}>
                  │   └─ <ErrorBoundary resetKey={tab}>
                  │      └─ <Suspense fallback={<ScreenLoading/>}>   ← skeleton
                  │         └─ {screen}  — ONE of:
                  │            ├─ <TodayScreen>          (eager)   ← Command/Today
                  │            │     props: state,setState,missions,doneIds,adaptedAt,
                  │            │            onToggleMission,onRegenerate,momentum,streak,
                  │            │            trend,icalUrl,onOpen*,onGoTab
                  │            ├─ <LifeMapScreen>        (lazy chunk)  ← Life/Map
                  │            ├─ <PerformScreen>        (lazy chunk, from TrainingHQ.jsx)  ← Perform/Move
                  │            │     └─ (sub-screens) skill trees, CoachSheet, WeekPlanSheet
                  │            └─ <BuildScreen>          (lazy chunk)  ← Build
                  │                  └─ <ONAHQ>, <ContentStudio>, Podium (sub-screens)
                  │
                  ├─ <TabBar active onChange badges={{life:inboxCount}} onFab onFabLong>
                  │     └─ 4× tab + center FAB (long-press → voice capture)
                  │
                  ├─ <QuickCapture open voiceMode onSave onClose>     (eager)
                  │
                  ├─ <CompanionLauncher onOpen onOpenVoice>           ← floating orb (eager)
                  ├─ <Companion open startVoice onClose onAction={runAction}>  (eager)
                  │     └─ <Sheet> → message list + mode pills + voice loop
                  │
                  ├─ <Suspense fallback={null}>          ← modal chunks, mount-on-open
                  │   ├─ {settingsOpen && <Settings/>}        (lazy)
                  │   ├─ {calendarOpen && <CalendarSheet/>}   (lazy)
                  │   ├─ {reviewOpen   && <WeeklyReview/>}     (lazy)
                  │   └─ {upgradeOpen  && <MonthlyUpgrade/>}   (lazy)
                  │
                  ├─ {!onboarded && <Onboarding/>}
                  └─ {booting && <BootSplash/>}
```

### Lazy-loaded chunks (code-splitting, declared in `App.jsx`)
`React.lazy(() => import(...))` is used for: `PerformScreen` (TrainingHQ), `BuildScreen`, `LifeMapScreen`, `WeeklyReview`, `MonthlyUpgrade`, `Settings`, `CalendarSheet`. `TodayScreen` is imported eagerly so the default tab paints instantly. Vite additionally splits `react`/`react-dom` and `@supabase/supabase-js` into their own cached vendor chunks (`vite.config.js → manualChunks`).

### `IOSDevice` (`components/IOSDevice.jsx`)
The frame component. On a real phone or installed PWA (`display-mode: standalone`, `navigator.standalone`, or `max-width:540px`) it renders **full-bleed** (real device chrome). Otherwise it renders a faux iPhone bezel with dynamic island, a live-updating status bar, and a home indicator. Also exports `IOSStatusBar`, `IOSNavBar`, `IOSGlassPill`, `IOSList`, `IOSListRow`, `IOSKeyboard` (liquid-glass primitives).

---

## 4. STATE MANAGEMENT

Two layered hooks implement a **local-first, optionally cloud-synced, cross-tab-consistent** store.

### 4.1 `usePersistentState(key, initial)` — the shared local store (`usePersistentState.js`)
- A **module-level `Map` registry**: `stores: Map<key, { value, subs: Set<setter> }>`. Every hook instance using the same `key` shares **one** in-memory value and a set of subscriber callbacks.
- `readInitial(key, initial)` seeds the value from `localStorage` (JSON-parsed), falling back to `initial`.
- `writeStore(key, next)` accepts a value or updater fn, bails on `Object.is` equality, writes through to `localStorage`, then notifies **all** subscribers → every component on that key re-renders together. (Without the shared store, two components on `lifeos:folders` would silently diverge until remount.)
- **Cross-tab sync:** a single window `storage` listener catches writes from other browser tabs, updates the in-memory value, and notifies subscribers **without** re-writing localStorage (the other tab already did).
- `todayKey()` (exported here) is the canonical local-time `YYYY-MM-DD` day key used across the app.

### 4.2 `useSyncedState(key, initial)` — adds Supabase sync (`useSyncedState.js`)
Wraps `usePersistentState`, so localStorage stays the **instant source of truth** (fast paint, offline-safe). When a Supabase session exists it adds:
1. **Pull-once on login** — effect keyed on `[uid, key, configured]`. Reads `app_state.value` for `(user_id, key)` via `.maybeSingle()`. If a remote value exists, it stores `lastSynced.current = JSON.stringify(value)` (the **echo guard**) and calls `setValue(remote)`. Sets `pulled.current = true`.
2. **Push-on-change** — effect keyed on `[value, uid, key, configured]`. Skips until `pulled.current` is true; serializes `value`; if it equals `lastSynced.current` it is a **no-op echo and is skipped** (this is what prevents the pull from immediately bouncing back up). Otherwise upserts `{ user_id, key, value, updated_at }` with `onConflict: 'user_id,key'`, then dispatches a `window` `'lifeos:sync'` CustomEvent (drives the `SyncBadge` "SAVED" pill).

When Supabase is unconfigured or there's no session, `useSyncedState` is pure localStorage. Conflict model is **last-write-wins per key** (no merge); there is no realtime subscription pulling remote changes mid-session — pull happens once at login.

### 4.3 The keys (`lifeos:*`) — enumerated from the codebase

**Daily / per-date (date-suffixed):**
| Key | Shape | Owner |
|---|---|---|
| `lifeos:daily:YYYY-MM-DD` | `{ energy, focus, body, mood, oneThing, oneThingDone, checkedIn, timeline[] }` | App.jsx (`freshDailyDefault`) |
| `lifeos:mission:YYYY-MM-DD` | `{ items[], doneIds[], adaptedAt }` | useMissionEngine.js |
| `lifeos:brief:YYYY-MM-DD` | cached chief morning brief | ChiefBrief.jsx |

**Cross-day synced state:**
| Key | Shape | Owner |
|---|---|---|
| `lifeos:captures` | array, newest-first (capped 50) | App.jsx (`addCapture`) |
| `lifeos:sessions` | array of training sessions (capped 200) | App.jsx / TrainingHQ / CoachSheet |
| `lifeos:history` | `{ [date]: { score, readiness, done } }` | App.jsx |
| `lifeos:settings` | `{ icalUrl, … }` | App.jsx / Settings |
| `lifeos:skills:v2` | per-discipline skill trees `{ disciplineId: skill[] }` | TrainingHQ / GoalDecomposer |
| `lifeos:training` | training prefs/state | TrainingHQ |
| `lifeos:trackables` | tracked metrics | TrainingHQ |
| `lifeos:lastdisc` | last-trained discipline | TrainingHQ |
| `lifeos:ona` | ONA dashboard model (stats, sales, initiatives, pipelinePeople…) | ONAHQ |
| `lifeos:ona:live` | live GymDesk stats (written by webhook) | ONAHQ (read), ona-webhook (write) |
| `lifeos:content` | content brands + pipeline items + hooks | ContentStudio |
| `lifeos:podium` | Podium product/order state | BuildScreen |
| `lifeos:folders` | Create-workspace folders (notes + projects, domain-tagged) | LifeMapScreen / ContentStudio |
| `lifeos:journal` | journal entries | LifeMapScreen |
| `lifeos:learning` | Learning Lab items | LifeMapScreen |
| `lifeos:adventure` | bucket-list / adventures | LifeMapScreen |
| `lifeos:quests` | long-term missions (seeded from `SEED_QUESTS`) | TodayScreen / quests.js |
| `lifeos:weeklyfocus` | `{ text }` chosen each weekly review | WeeklyReview |
| `lifeos:companion` | full Companion conversation | Companion.jsx (synced) |
| `lifeos:companion:memory` | distilled long-term memory string | Companion.jsx (synced) |
| `lifeos:voicereplies` | hands-free voice loop toggle | Companion.jsx |
| `lifeos:onboarded` | bool, first-run flag | App.jsx |
| `lifeos:vibe` | `'calm'` (default) or `'glow'` theme | App.jsx |
| `lifeos:upgrades` / `lifeos:upgradeDismissed` | monthly report cache/dismiss | MonthlyUpgrade |

**Local-only (never synced):**
| Key | Shape | Owner |
|---|---|---|
| `lifeos:telemetry` | ring buffer of `{ s, a, t, m }` events (max 600) | telemetry.js |

`'lifeos:sync'` is a window **event name**, not a storage key (fires the SAVED badge).

### 4.4 `useMissionEngine` extraction (`lib/useMissionEngine.js`)
The daily Mission Engine was lifted out of `App.jsx` into its own hook. It owns the `lifeos:mission:DATE` document via `useSyncedState` and returns `{ missions, doneIds, adaptedAt, toggleMission, regenerateMissions, addMission }`. Behaviors:
- **Generate once/day:** if `items` is null, calls `generateMissions()` (from `mission.js`) and writes them; done-state survives re-plans.
- **One-Thing lockstep:** an effect keeps a `one-thing` mission synced to `missionState.oneThing` (insert/rename), and `toggleMission('one-thing')` mirrors `missionState.oneThingDone`.
- **Adaptive re-rank:** after check-in, watches readiness; buckets it `push` (≥60) / `tech` (≥45) / `recover` (<45). When the bucket **changes**, it swaps only the `train`-kind mission for a fresh one, preserves order and completion (migrating the done-id), stamps `adaptedAt`, and logs `mission/adapt`.
- **`addMission(rec)`** lets Build's Action Center append a move to today's mission.

---

## 5. DATA FLOW

### 5.1 Check-in → readiness → mission → history → momentum
```
TodayScreen check-in (energy/focus/body/mood sliders + checkedIn)
   └─ setState → lifeos:daily:DATE
        │
        ├─ todayReadiness = round((e+f+b+m)/40 * 100)            [App.jsx]
        │
        ├─ useMissionEngine watches readiness:
        │     bucket push/tech/recover; on change → swap train mission (adaptedAt)
        │
        ├─ generateMissions(snapshot()) ranks ≤5 missions:       [mission.js]
        │     1. One Thing (if set)
        │     2. Training (readiness decides WHAT: edge skill / technique / recovery)
        │     3. Top ONA move        (recommendOna → reads lifeos:ona + :live)
        │     4. Top content/project (recommendContent → lifeos:content + :folders)
        │     5. Ritual (Sun=weekly review / inbox≥3 / weekend=Chelsea)
        │
        └─ score the day:
              doneCount = #missions done
              todayScore = min(4, doneCount + (readiness≥75 ? 1 : 0))
              effect writes history[DATE] = { score, readiness, done }  → lifeos:history
                   │
                   ├─ buildMomentum(history, today, score) → last 14 days (0–4) heatmap
                   ├─ computeStreak(history)               → consecutive active days
                   └─ readinessTrend(history)              → today vs prior-7-day avg
```
`momentum`, `streak`, `trend` flow back down as props to `TodayScreen`. The Quest engine (`quests.js → domainScores`/`alignmentScore`) reads `lifeos:history`, `lifeos:skills:v2`, `lifeos:ona`, folders, learning, adventure to compute per-domain scores and the single Alignment Score on the Life Map.

### 5.2 Captures → folders
```
FAB (TabBar) → QuickCapture (text or voice)
   └─ onSave → App.addCapture → prepend to lifeos:captures
                                 { id, ts, text, tag, color, status:'inbox', time }
        │
        ├─ inboxCount = captures where status==='inbox'  → badge on Life/Map tab
        │
        └─ LifeMapScreen triage: a capture is routed into a folder by `domain`
              (SEED_FOLDERS each carry a domain; DOMAIN_ALIASES matches legacy
               untagged folders) → folder.notes; capture.status → 'triaged' (+ routedAt)
                   └─ recentWins() counts ≥3 routed thoughts/week
```
The Companion's `runAction({type:'capture'})` can also inject a capture directly.

### 5.3 Editing → persistence → mission/AI context (`snapshot()`)
Every editable surface writes its own `lifeos:*` key through `useSyncedState`/`usePersistentState`, so edits are instantly local, mirrored cross-tab, and pushed to Supabase. The Mission Engine and the AI layer never read React props for context — they take a fresh **`snapshot()`** straight from localStorage:

```
snapshot()  [mission.js]  → one synchronous read of:
   daily(today), readiness, skills:v2, sessions, ona, ona:live,
   content, folders, captures, weeklyFocus, journal
```
`generateMissions()` and `localAnswer()` run off this snapshot. The Companion builds a richer `buildGlobalContext()` string (snapshot + today's mission doc + active skills + blindspots + ONA/brands/projects + inbox count + `lifeos:companion:memory`) that is sent as the `context` field to `/api/companion`. Because everything flows through localStorage first, an edit anywhere is immediately visible to the next mission regeneration or AI call.

### 5.4 The "mirror" (telemetry)
`changeTab` and many user actions call `logEvent(surface, action, meta)` → `lifeos:telemetry` ring buffer (local-only, max 600). `usageBySurface(days)` rolls up `open` events per surface; this feeds the Weekly Review and Monthly Upgrade reflections ("dead features / unused surfaces").

---

## 6. API ARCHITECTURE

All AI endpoints are Vercel serverless ESM functions under `app/api/`. They keep `ANTHROPIC_API_KEY` server-side and call `https://api.anthropic.com/v1/messages` with model **`claude-haiku-4-5-20251001`**, `anthropic-version: 2023-06-01`.

### 6.1 The client wrapper — `aiFetch(path, body)` (`lib/api.js`)
Every AI call goes through `aiFetch`. It pulls the current Supabase session via `supabase.auth.getSession()`, attaches `authorization: Bearer <access_token>`, and POSTs JSON. If unauthenticated it proceeds tokenless (and 401s, which callers handle by falling back to local logic). Endpoints used: `/api/companion`, `/api/chief`, `/api/coach`, `/api/decompose`. (`/api/calendar` is called with a plain `fetch`, not `aiFetch`, since it is a GET with query params and is not auth-gated.)

### 6.2 Shared gate — `api/_auth.js`
- `verifyUser(req)`: reads `Authorization: Bearer`, then **server-validates** the token by calling Supabase's `GET {SUPABASE_URL}/auth/v1/user` with the `apikey` (anon) + bearer. Returns `{ ok, user }` or a `{ status, error }` (401 / 503). No new secrets — reuses the project's URL + anon key. (Env reads accept both `SUPABASE_*` and `VITE_SUPABASE_*` names.)
- `rateLimit(id, max=40, windowMs=60000)`: in-memory per-user counter. Best-effort only — survives only within a warm serverless instance; a backstop against runaway loops, not a hard guarantee.
- `gate(req, res)`: one call — verifies auth, applies the rate limit, writes the error response itself (401/429/503), and returns the `user` or `null`. **Every AI handler calls `if (!(await gate(req, res))) return;` first.** This closed the prior hole where the endpoints were open proxies for the Anthropic key.

### 6.3 Endpoint catalog

| Endpoint | Method | Gated? | Request body | Response | Notes |
|---|---|---|---|---|---|
| `/api/ai` | POST | ✅ gate | `{ question, context, agent }` | `{ text }` | 6 personas (chief default / coach / creative / ona / podium / architect) + shared `BASE` persona about Jay. `max_tokens 400`. 405/400/503/502/500 paths. |
| `/api/chief` | POST | ✅ gate | `{ mode, context }` | `{ text, actions[] }` | `mode` ∈ brief / review / upgrade. Brief & upgrade may emit an `ACTIONS_JSON:` marker the handler splits into a `≤3`-item actions array. `max_tokens 600`. |
| `/api/coach` | POST | ✅ gate | `{ context, mode }` | `{ text }` | Default = today's session (`max_tokens 900`); `mode:'week'` = periodized microcycle (`max_tokens 1100`). |
| `/api/companion` | POST | ✅ gate | `{ messages[], context, mode }` | `{ text, actions[] }` | Multi-turn (last 16 msgs); 7 "hats" via `mode`; maps `role:'ai'`→`assistant`; emits `ACTIONS_JSON:` (event/session/capture/focus/email). `max_tokens 800`. |
| `/api/decompose` | POST | ✅ gate | `{ goal, domain, context }` | `{ title, why, milestones[≤6] }` | Strict-JSON out (`extractJSON` strips fences). `max_tokens 700`. 502 on bad shape. |
| `/api/calendar` | GET | ❌ not gated | query: `url, tz, date, days` | `{ events[] }` | Reads a Google **secret iCal** feed server-side (no CORS); custom VEVENT parser expands DAILY/WEEKLY/MONTHLY/YEARLY recurrence + EXDATE; **SSRF guard**: only `https://calendar.google.com` allowed; capped 200 events / 31 days. |
| `/api/ona-webhook` | POST | ❌ (secret-gated instead) | stat fields + optional `inc{}` | `{ ok, stored }` | Ingestion — see §7. |

Shared error contract: non-POST → 405; missing required field → 400; `ANTHROPIC_API_KEY` unset → **503 "AI not configured"** (clients fall back to local logic via `mission.js → localAnswer` / deterministic builders); upstream Anthropic non-2xx → 502 with truncated detail; thrown error → 500.

The AI personas all share a hard-coded backdrop about Jay (movement athlete/coach; co-owns Obstacle Ninja Academy "ONA" in Orlando and Podium Creations; creator `@jayy_martinez`; wife Chelsea; values clarity/calm/freedom; concise phone-readable answers; "never invent numbers").

---

## 7. BACKEND ARCHITECTURE

### 7.1 Supabase (auth + storage)
- **Auth:** email + password. `AuthProvider` calls `getSession()` and subscribes to `onAuthStateChange`; exposes `configured` (= env present), `loading`, `session`, plus `signInWithPassword` / `signUp` / `signOut`. Client (`lib/supabase.js`) is created **only** when both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` exist (`persistSession`, `autoRefreshToken`, `detectSessionInUrl` all on). When absent, `isSupabaseConfigured === false` and the whole auth+sync layer no-ops.
- **Storage — `public.app_state` (`supabase/schema.sql`):**
  ```sql
  create table public.app_state (
    user_id    uuid not null references auth.users(id) on delete cascade,
    key        text not null,
    value      jsonb,
    updated_at timestamptz not null default now(),
    primary key (user_id, key)
  );
  ```
  One JSON document per `(user_id, key)`. `on delete cascade` removes a user's rows when the auth user is deleted.
- **RLS — single "own rows" policy:**
  ```sql
  alter table public.app_state enable row level security;
  create policy "own rows" on public.app_state
    for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
  ```
  RLS is on, and the one policy lets a user do anything **only** to rows where `auth.uid() = user_id`. The browser client carries the user JWT, so all reads/writes are automatically scoped to the signed-in user.

### 7.2 Vercel serverless
The `api/*.js` functions run as Vercel Node serverless functions. `vercel.json` builds with `npm run build` to `dist/` and rewrites every non-`/api` path to `/index.html` (SPA). `vite.config.js` uses `base:'./'` and splits vendor chunks.

### 7.3 GymDesk → Zapier → ona-webhook ingestion path
GymDesk has no public REST API, so live gym stats arrive via:
```
GymDesk (event)  →  Zapier (Zap)  →  POST /api/ona-webhook
                                       ├─ auth: shared secret ONA_WEBHOOK_SECRET
                                       │        via ?token= OR X-Webhook-Secret header
                                       ├─ uses SUPABASE_SERVICE_ROLE_KEY (bypasses RLS)
                                       │        to write Jay's row (ONA_USER_ID)
                                       └─ key: lifeos:ona:live
```
The handler whitelists fields (`members, active_members, mrr, nps, attendance_week, new_members_month, churn_month, visits_today`), merges them onto the existing `lifeos:ona:live` snapshot, supports `inc{}` increments, stamps `updated_at` + optional `source`, and upserts with `onConflict: 'user_id,key'`. The ONA screen then reads `lifeos:ona:live` like any other synced value. The service-role key never leaves the server.

### 7.4 Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL` | client build + (fallback) server | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | client build + (fallback) server | Supabase anon/public key (safe in frontend) |
| `SUPABASE_URL` | server | preferred server-side Supabase URL (`_auth.js`, webhook) |
| `SUPABASE_ANON_KEY` | server | preferred server-side anon key (token verification in `_auth.js`) |
| `ANTHROPIC_API_KEY` | server only (no `VITE_` prefix) | Anthropic Messages API key — never shipped to browser |
| `SUPABASE_SERVICE_ROLE_KEY` | server only (webhook) | service role for `ona-webhook` (bypasses RLS to write Jay's row) |
| `ONA_WEBHOOK_SECRET` | server only (webhook) | shared secret gating the ONA webhook |
| `ONA_USER_ID` | server only (webhook) | the `user_id` whose `lifeos:ona:live` row the webhook writes |

`.env.example` documents the public Supabase vars and `ANTHROPIC_API_KEY`; the service-role / webhook / ical-related vars are documented inline in `api/ona-webhook.js` and are set directly in Vercel → Environment Variables. The Google iCal URL is **not** an env var — it is user data stored in `lifeos:settings.icalUrl` and passed to `/api/calendar` per request.

---

## 8. Security & resilience notes (observed in code)
- **AI proxy lockdown:** all five AI endpoints are session-gated (`gate`) + per-user rate-limited; the Anthropic key cannot be used as an open proxy.
- **SSRF guard on calendar:** `/api/calendar` only fetches `https://calendar.google.com`. (It is itself **not** session-gated — it relies on the host allow-list; the only data it can exfiltrate is the user-supplied Google iCal feed.)
- **RLS isolation:** per-user row ownership enforced at the database, independent of client code.
- **Service-role isolation:** only the webhook uses the service role, and it is behind a shared secret + a fixed `ONA_USER_ID`.
- **Graceful degradation:** missing Supabase → localStorage-only, no login; missing `ANTHROPIC_API_KEY` → 503 and clients fall back to deterministic local intelligence (`localAnswer`, local session/decompose builders).
- **Crash isolation:** per-screen `ErrorBoundary` (resets on tab change) prevents one screen from white-screening the app; data is safe in localStorage.
- **Offline:** service worker caches the same-origin app shell (cache-fallback on network failure); Supabase and `/api` calls pass straight through (not cached).
- **Last-write-wins:** cloud sync is per-key LWW with a pull-once-on-login model and an echo guard; there is no server-side merge or mid-session realtime pull.
```
