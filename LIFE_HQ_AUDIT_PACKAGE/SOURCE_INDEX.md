# JAM HQ / Life HQ — Source Index

Exhaustive file-by-file index of every source file under `app/src/` and `app/api/` (54 files). Organized by directory. For each file: relative path · purpose · key exports · in-project dependencies (what it imports from the codebase) · used by (which project files import it).

Stack: Vite + React 18 SPA. Supabase auth + per-user cloud sync (`app_state(user_id, key, value jsonb)`). Vercel serverless functions calling Anthropic (model `claude-haiku-4-5-20251001`). State persists locally (localStorage) first and syncs to Supabase when signed in.

**Build/config context (not in src/api, listed for completeness):** `app/index.html`, `app/vite.config.js`, `app/package.json`, `app/vercel.json`, `app/netlify.toml`, `app/README.md`, `app/supabase/` (schema), and `app/public/` (PWA assets: `manifest.webmanifest`, `sw.js`, `icon-192.png`, `icon-512.png`, `icon.svg`, `apple-touch-icon.png`, `favicon-32.png`). Note: the `app/` directory also contains many stale `vite.config.js.timestamp-*.mjs` Vite temp files that should be gitignored/cleaned.

---

## `app/api/` — Vercel serverless functions (8 files)

All AI endpoints proxy Anthropic server-side so the `ANTHROPIC_API_KEY` never reaches the browser. Each (except `calendar.js` and `ona-webhook.js`) is gated by `gate()` from `_auth.js` (Supabase JWT verify + per-user in-memory rate limit). Each AI endpoint returns `503 {error:'AI not configured'}` when the key is unset, which clients catch and fall back to local logic.

### `app/api/_auth.js`
- **Purpose:** Shared auth + rate-limit gate for the AI endpoints. Verifies the caller's Supabase session JWT against Supabase Auth (`/auth/v1/user`) using the project's existing URL + anon key (no new env vars), preventing the Anthropic key from being used as an open LLM proxy.
- **Key exports:** `verifyUser(req)`, `rateLimit(id, max=40, windowMs=60000)`, `gate(req, res)`.
- **Imports (project):** none.
- **Used by:** `api/ai.js`, `api/chief.js`, `api/coach.js`, `api/companion.js`, `api/decompose.js`.

### `app/api/ai.js`
- **Purpose:** Generic AI proxy for the "AI tab" personas (chief/coach/creative/ona/podium/architect). Single-turn Q&A with a per-persona system prompt + Jay backdrop + live context. (Largely superseded by `companion.js` in V2, but still present.)
- **Key exports:** default `handler(req,res)`. Const `MODEL`, `BASE`, `PERSONAS`.
- **Imports (project):** `gate` from `./_auth.js`.
- **Used by:** No current `src/` caller found (legacy/standalone endpoint; the live app routes through `/api/companion`).

### `app/api/calendar.js`
- **Purpose:** Server-side reader for a Google Calendar "secret iCal" feed. Fetches the `.ics` (no CORS), parses VEVENTs, expands DAILY/WEEKLY/MONTHLY/YEARLY recurrence + EXDATE, converts to the user's timezone, returns today's (or an N-day range of) events. SSRF-guarded: only `https://calendar.google.com` allowed. **Not** auth-gated (read-only public-feed proxy).
- **Key exports:** default `handler`. Internal: `unfold`, `parseEvents`, `parseDt`, `toUserTz`, `parseRRule`, `occursOn`, `buildEvents`.
- **Imports (project):** none.
- **Used by (via fetch, not import):** `src/CalendarSheet.jsx`, `src/screens/TodayScreen.jsx`.

### `app/api/chief.js`
- **Purpose:** Chief-of-Staff serverless brain with three modes — `brief` (morning brief + up to 3 one-tap ACTIONS_JSON), `review` (honest weekly reflection), `upgrade` (monthly meta-reflection on app usage). Splits prose from an `ACTIONS_JSON:` marker.
- **Key exports:** default `handler`. Const `SYSTEMS` (brief/review/upgrade prompts).
- **Imports (project):** `gate` from `./_auth.js`.
- **Used by (via fetch):** `src/ChiefBrief.jsx` (brief), `src/WeeklyReview.jsx` (review), `src/MonthlyUpgrade.jsx` (upgrade).

### `app/api/coach.js`
- **Purpose:** AI movement coach. Default mode designs **today's** session from skill tree + recent sessions + readiness + blindspots; `mode:'week'` designs a periodized microcycle. Elite multi-discipline coaching prompt that actively addresses blindspots and balances the body.
- **Key exports:** default `handler`. Const `MODEL`.
- **Imports (project):** `gate` from `./_auth.js`.
- **Used by (via fetch):** `src/CoachSheet.jsx` (session), `src/WeekPlanSheet.jsx` (week).

### `app/api/companion.js`
- **Purpose:** The Companion / "JAM Intelligence" brain. Multi-turn (last 16 messages), context-aware, one persona with switchable "hats" (partner/chief/coach/creative/ona/podium/architect). Can emit `ACTIONS_JSON:` one-tap actions (event/session/capture/focus/email). Also used by the Companion's long-term-memory distillation and by `aiActions.askCompanion`.
- **Key exports:** default `handler`. Const `MODEL`, `HATS`.
- **Imports (project):** `gate` from `./_auth.js`.
- **Used by (via fetch):** `src/Companion.jsx`, `src/lib/aiActions.js` (`askCompanion`).

### `app/api/decompose.js`
- **Purpose:** Goal decomposition. Takes a goal + domain + light context, returns strict JSON `{title, why, milestones[]}` — a 3–6-step sequenced progression. Robust JSON extraction with a coach/strategist prompt.
- **Key exports:** default `handler`. Internal `extractJSON`.
- **Imports (project):** `gate` from `./_auth.js`.
- **Used by (via fetch):** `src/GoalDecomposer.jsx`, `src/lib/aiActions.js` (`decomposeText`).

### `app/api/ona-webhook.js`
- **Purpose:** ONA live-stats ingestion. GymDesk has no public REST API, so the pipeline is GymDesk → Zapier → this endpoint. Writes incoming stats into Jay's `app_state` row (`key 'lifeos:ona:live'`) via the Supabase **service role**; the ONA screen reads that key like any synced value. Supports field set + `inc` increments. Shared-secret gated (`ONA_WEBHOOK_SECRET`). **Status: needs env vars** (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ONA_WEBHOOK_SECRET`, `ONA_USER_ID`).
- **Key exports:** default `handler`. Const `KEY`, `FIELDS`.
- **Imports (project):** `createClient` from `@supabase/supabase-js` (npm).
- **Used by:** External (Zapier POST). The data it writes is read by `src/screens/ONAHQ.jsx` and the mission engine.

---

## `app/src/` — root (app shell, AI sheets, auth gate, lifecycle)

### `app/src/main.jsx`
- **Purpose:** App entry. Mounts `<App>` inside `<AuthProvider>` and `<StrictMode>`, installs global haptics, registers the service worker (`/sw.js`) for PWA/offline.
- **Key exports:** none (side-effect entry).
- **Imports (project):** `App.jsx`, `auth/AuthProvider.jsx`, `lib/haptics.js`, `styles.css`.
- **Used by:** `index.html` (script entry).

### `app/src/App.jsx`
- **Purpose:** App shell. Auth gate (loading orb → `LoginScreen` → `MainApp`). Owns the four-surface tab state (Today/Life/Perform/Build), the per-day daily state, the Mission Engine, captures, sessions, history (streak/momentum/trend), settings, vibe (calm/glow), and the Companion + all modals. Implements `runAction` (event/email/session/capture/focus deep-link handoffs). Derives streak, momentum heatmap, readiness trend; carries the timeline forward day-to-day.
- **Key exports:** default `App`. Internal: `MainApp`, `ScreenLoading`, `freshDailyDefault`, `buildMomentum`, `computeStreak`, `readinessTrend`, `latestPriorTimeline`, `keyDaysAgo`.
- **Imports (project):** `components/IOSDevice`, `components/TabBar`, `components/QuickCapture`, `components/ErrorBoundary`, `screens/TodayScreen`, lazy `screens/TrainingHQ`, lazy `screens/BuildScreen`, lazy `screens/LifeMapScreen`, lazy `WeeklyReview`, lazy `MonthlyUpgrade`, lazy `Settings`, lazy `CalendarSheet`, `lib/telemetry`, `lib/actions`, `data`, `usePersistentState`, `useSyncedState`, `lib/useMissionEngine`, `auth/AuthProvider`, `auth/LoginScreen`, `SyncBadge`, `Onboarding`, `BootSplash`, `Companion`.
- **Used by:** `main.jsx`.

### `app/src/BootSplash.jsx`
- **Purpose:** Cinematic ~2.1s boot animation (orb bloom + wordmark + tagline), shown once per launch.
- **Key exports:** `BootSplash({onDone})`.
- **Imports (project):** none.
- **Used by:** `App.jsx`.

### `app/src/Onboarding.jsx`
- **Purpose:** First-run welcome screen orienting the user to the four surfaces + the Intelligence orb; one-time (gated by `lifeos:onboarded`).
- **Key exports:** `Onboarding({onDone})`. Const `HIGHLIGHTS`.
- **Imports (project):** `components/icons`.
- **Used by:** `App.jsx`.

### `app/src/SyncBadge.jsx`
- **Purpose:** Quiet "SAVED" pill that briefly appears when state syncs to the cloud (listens for the `lifeos:sync` window event dispatched by `useSyncedState`).
- **Key exports:** `SyncBadge`.
- **Imports (project):** `components/icons`.
- **Used by:** `App.jsx`.

### `app/src/Companion.jsx`
- **Purpose:** THE INTELLIGENCE — the always-present AI partner (floating orb launcher). One mind, switchable hats; continuous synced conversation; long-term memory distillation; hands-free voice loop (STT → answer → TTS → listen); inline one-tap actions. Assembles a compact global context snapshot of Jay's whole world. Falls back to `localAnswer` when AI is unavailable.
- **Key exports:** `Companion({open,onClose,onAction,startVoice})`, `CompanionLauncher({onOpen,onOpenVoice})`. Internal: `buildGlobalContext`, `MODES`, `STARTERS`, `ACTION_META`.
- **Imports (project):** `components/icons`, `components/Sheet`, `lib/haptics`, `lib/api` (`aiFetch`), `lib/voice`, `data`, `coaching` (`analyzeBlindspots`), `lib/mission` (`generateMissions`,`localAnswer`,`snapshot`), `useSyncedState`, `usePersistentState` (`todayKey`).
- **Used by:** `App.jsx`.

### `app/src/ChiefBrief.jsx`
- **Purpose:** The Chief-of-Staff morning brief card at the top of Today. Assembles calendar + readiness + inbox + one-thing into context, calls `/api/chief` (mode brief), caches per day (`lifeos:brief:<day>`), renders AI/local brief + one-tap action chips (triage, plan-a-block composer, AI event/email).
- **Key exports:** `ChiefBrief({...})`. Internal: `ActionChip`, `buildContext`, `buildLocal`, `inboxCount`.
- **Imports (project):** `components/icons`, `usePersistentState` (`todayKey`), `lib/actions`, `lib/api`.
- **Used by:** `screens/TodayScreen.jsx`.

### `app/src/CoachSheet.jsx`
- **Purpose:** "Build my session" AI coach sheet. Pick focus discipline + duration; builds context from skill tree + sessions + readiness + blindspots + concrete drills/fundamentals; calls `/api/coach`; renders plan + always-on blindspot panel; logs the session.
- **Key exports:** `CoachSheet({open,onClose,skills,onLog})`. Internal: `trainTier`, `buildContext`, `buildLocal`, `readiness`.
- **Imports (project):** `components/icons`, `data`, `coaching` (`analyzeBlindspots`,`drillsFor`,`fundamentalsFor`), `lib/haptics`, `components/Sheet`, `usePersistentState` (`todayKey`), `lib/api`.
- **Used by:** `screens/TrainingHQ.jsx`.

### `app/src/WeekPlanSheet.jsx`
- **Purpose:** "Plan my week" periodization sheet. Pick training days + priority discipline; optional AI personalization via `/api/coach` (mode week); always shows the proven `WEEK_TEMPLATE` microcycle + `PROGRAMMING_PRINCIPLES`.
- **Key exports:** `WeekPlanSheet({open,onClose,skills})`. Internal: `buildContext`, `readinessScore`, `IMPACT_COLOR`.
- **Imports (project):** `components/icons`, `data`, `coaching` (`WEEK_TEMPLATE`,`PROGRAMMING_PRINCIPLES`,`analyzeBlindspots`), `usePersistentState` (`todayKey`), `components/Sheet`, `lib/api`.
- **Used by:** `screens/TrainingHQ.jsx`.

### `app/src/GoalDecomposer.jsx`
- **Purpose:** Goal-decomposition sheet. Name a goal + pick a Life-Map domain → `/api/decompose` returns a sequenced milestone progression (editable) → save as a real quest/campaign (`onAddQuest`). Deterministic scaffold fallback.
- **Key exports:** `GoalDecomposer({open,onClose,onAddQuest})`. Internal: `buildLocal`, `lightContext`.
- **Imports (project):** `components/Sheet`, `components/icons` (incl. `domainIcon`), `lib/quests` (`LIFE_MAP_DOMAINS`), `lib/haptics`, `lib/api`.
- **Used by:** `screens/TodayScreen.jsx`.

### `app/src/WeeklyReview.jsx`
- **Purpose:** Weekly Review sheet — the honesty ritual. Crunches the week from history/sessions/captures/telemetry; shows days-active/readiness/sessions/minutes, attention-allocation bars, domain-balance ("which domains went dark") check; optional AI reflection via `/api/chief` (review); captures one focus for next week (`lifeos:weeklyfocus`); schedules it / dark domains via Google Calendar deep links.
- **Key exports:** `WeeklyReview({open,onClose})`. Internal: `buildWeek`, `buildLocalSummary`, `tomorrow9`, `dayKey`, `SURFACE_NAMES`, `Stat`.
- **Imports (project):** `components/icons`, `data` (`LIFE_DOMAINS`), `components/Sheet`, `lib/telemetry` (`usageBySurface`), `lib/actions`, `lib/api`.
- **Used by:** `App.jsx` (lazy).

### `app/src/MonthlyUpgrade.jsx`
- **Purpose:** Monthly Upgrade Report — the safe self-improving loop. Reflects on 30 days of usage (telemetry + data), surfaces deterministic improvement proposals (triage habit, protect a neglected domain, cross-train, recovery block, retire/rethink dead surfaces, prune empty folders, lock the weekly ritual), optional AI note via `/api/chief` (upgrade). Accepting records a changelog entry and bumps "LifeOS version"; nothing auto-executes.
- **Key exports:** `MonthlyUpgrade({open,onClose})`. Internal: `buildMonth`, `buildProposals`, `SURFACE_NAMES`.
- **Imports (project):** `components/icons`, `data` (`LIFE_DOMAINS`), `lib/telemetry`, `useSyncedState`, `lib/api`, `components/Sheet`.
- **Used by:** `App.jsx` (lazy).

### `app/src/CalendarSheet.jsx`
- **Purpose:** Read-only 14-day calendar view from the connected iCal feed (`/api/calendar`), grouped by day; plus a quick-add form that opens Google Calendar prefilled.
- **Key exports:** `CalendarSheet({open,onClose,icalUrl})`. Internal: `todayStr`, `dayLabel`, `DAYS`, `MONS`.
- **Imports (project):** `components/icons`, `components/Sheet`.
- **Used by:** `App.jsx` (lazy).

### `app/src/Settings.jsx`
- **Purpose:** Settings sheet — account (email, sign out), visual-system toggle (Calm/Glow), Google Calendar iCal connect/update/clear, JSON data export (all `lifeos:*` keys), About.
- **Key exports:** `Settings({open,onClose,icalUrl,onSetIcal,vibe,onSetVibe})`. Internal: `exportData`, `rowStyle`.
- **Imports (project):** `components/icons`, `auth/AuthProvider` (`useAuth`), `components/Sheet`.
- **Used by:** `App.jsx` (lazy).

### `app/src/data.js`
- **Purpose:** All hard-coded seed data (placeholder values from the spec): brands, content pipeline stages, hooks, disciplines, skill trees (`SKILLS` with tier/cue/status/pct), body radar axes/current/goal, today's timeline, momentum, ONA stats/sales/coaches/bench/initiatives, the day's `TODAY` defaults, life domains, seed folders, domain aliases.
- **Key exports:** `BRANDS, PIPELINE_STAGES, HOOKS, DISCIPLINES, SKILLS, RADAR_AXES, RADAR_CURRENT, RADAR_GOAL, TIMELINE, MOMENTUM, ONA_STATS, SALES_STAGES, COACHES, BENCH, INITIATIVES, TODAY, LIFE_DOMAINS, SEED_FOLDERS, DOMAIN_ALIASES`.
- **Imports (project):** none.
- **Used by:** `App.jsx`, `Companion.jsx`, `CoachSheet.jsx`, `WeekPlanSheet.jsx`, `WeeklyReview.jsx`, `MonthlyUpgrade.jsx`, `lib/mission.js`, `lib/quests.js`, `screens/TodayScreen.jsx`, `screens/TrainingHQ.jsx`, `screens/LifeMapScreen.jsx`, `screens/ONAHQ.jsx`, `screens/ContentStudio.jsx`.

### `app/src/coaching.js`
- **Purpose:** The coaching knowledge layer — the "brain" behind the elite coach. Per-discipline tier `DRILLS` (each with cue/gate/fault), cross-discipline athletic `FOUNDATIONS` (the most-neglected pillars), `FUNDAMENTALS_BY_DISCIPLINE` (the science-grounded bedrock under the tricks), `analyzeBlindspots` (reads skill tree + recent sessions + readiness → flagged gaps), `PROGRAMMING_PRINCIPLES`, and the `WEEK_TEMPLATE` microcycle.
- **Key exports:** `DRILLS`, `FOUNDATIONS`, `analyzeBlindspots(skills,sessions,readiness,disciplines)`, `drillsFor(disciplineId,tier)`, `FUNDAMENTALS_BY_DISCIPLINE`, `fundamentalsFor(disciplineId)`, `PROGRAMMING_PRINCIPLES`, `WEEK_TEMPLATE`.
- **Imports (project):** none.
- **Used by:** `Companion.jsx`, `CoachSheet.jsx`, `WeekPlanSheet.jsx`, `screens/TrainingHQ.jsx`.

### `app/src/usePersistentState.js`
- **Purpose:** localStorage-backed state with a shared in-memory store registry (all hook instances using the same key re-render together) + cross-tab `storage` listener. Also exports `todayKey()` (stable local YYYY-MM-DD).
- **Key exports:** `usePersistentState(key,initial)`, `todayKey()`.
- **Imports (project):** none.
- **Used by:** `useSyncedState.js`, and (via `todayKey`) `App.jsx`, `Companion.jsx`, `ChiefBrief.jsx`, `CoachSheet.jsx`, `WeekPlanSheet.jsx`, `lib/mission.js`.

### `app/src/useSyncedState.js`
- **Purpose:** Local-first state that also syncs to Supabase `app_state` when signed in. Pulls the remote row once on login, then pushes every local change (skipping no-op echoes). Dispatches `lifeos:sync` on success (drives `SyncBadge`). Falls back to localStorage-only when unconfigured.
- **Key exports:** `useSyncedState(key,initial)`.
- **Imports (project):** `usePersistentState`, `auth/AuthProvider` (`useAuth`), `lib/supabase`.
- **Used by:** `App.jsx`, `Companion.jsx`, `MonthlyUpgrade.jsx`, `lib/useMissionEngine.js`, `screens/TodayScreen.jsx`, `screens/TrainingHQ.jsx`, `screens/LifeMapScreen.jsx`, `screens/ONAHQ.jsx`, `screens/ContentStudio.jsx`, `screens/BuildScreen.jsx`.

### `app/src/styles.css`
- **Purpose:** Global stylesheet — CSS variables (colors, fonts), the Calm/Glow vibe themes (`data-vibe`), HUD/glass surfaces, mesh backgrounds, animations (boot, orb-spin, cardIn, screenFade, unfold, blink, think-dot, ai-caret, obj-pulse, shimmer), skeletons, sheet/scrim, and PWA-safe-area layout.
- **Key exports:** n/a (CSS).
- **Imports (project):** none.
- **Used by:** `main.jsx`.

---

## `app/src/auth/` — authentication (2 files)

### `app/src/auth/AuthProvider.jsx`
- **Purpose:** Auth context wrapping the app. Tracks the Supabase session, exposes `signInWithPassword`/`signUp`/`signOut` (email + password). Safe no-op when Supabase isn't configured. (Note: file header mentions magic-link but the implementation is email/password.)
- **Key exports:** `AuthProvider`, `useAuth`.
- **Imports (project):** `lib/supabase`.
- **Used by:** `main.jsx`, `App.jsx`, `useSyncedState.js`, `Settings.jsx`, `auth/LoginScreen.jsx`.

### `app/src/auth/LoginScreen.jsx`
- **Purpose:** Email + password sign-in / sign-up screen in the dark HUD aesthetic; surfaces the "confirm email still ON" Supabase hint.
- **Key exports:** default `LoginScreen`. Const `inputStyle`.
- **Imports (project):** `components/IOSDevice`, `components/atoms` (`HUDTicks`), `components/icons`, `auth/AuthProvider` (`useAuth`).
- **Used by:** `App.jsx`.

---

## `app/src/lib/` — libraries & engines (12 files)

### `app/src/lib/mission.js`
- **Purpose:** The Mission Engine brain (pure-ish, no React). `snapshot()` reads every data source from localStorage; skill-progression meta (`TIER_META`, `masteryEstimate`, `prereqFor`, `nextBreakthrough`, `upcomingUnlocks`); metric→move recommenders (`recommendOna`, `recommendContent`); `generateMissions()` (≤5 ranked daily missions with why/est/go/kind); `estimateLabel`; and `localAnswer()` — keyword-routed answers from live data used by the Companion before/without the AI key.
- **Key exports:** `snapshot`, `TIER_META`, `masteryEstimate`, `prereqFor`, `nextBreakthrough`, `upcomingUnlocks`, `recommendOna`, `recommendContent`, `generateMissions`, `estimateLabel`, `localAnswer`.
- **Imports (project):** `usePersistentState` (`todayKey`), `data` (`DISCIPLINES`).
- **Used by:** `lib/useMissionEngine.js`, `lib/quests.js`, `Companion.jsx`, `screens/TodayScreen.jsx` (`estimateLabel`), `screens/BuildScreen.jsx`, `screens/LifeMapScreen.jsx`, `screens/TrainingHQ.jsx`.

### `app/src/lib/useMissionEngine.js`
- **Purpose:** React hook wrapping the Mission Engine. Owns the per-day mission document (`lifeos:mission:<day>` — generate once, regenerable, done-state survives re-plans), keeps the One Thing in lockstep, and adaptively swaps the training mission when readiness crosses push/tech/recover thresholds. Exposes toggle/regenerate/addMission mutators.
- **Key exports:** `useMissionEngine(today, missionState, setMissionState)`.
- **Imports (project):** `useSyncedState`, `lib/mission` (`generateMissions`), `lib/telemetry` (`logEvent`).
- **Used by:** `App.jsx`.

### `app/src/lib/quests.js`
- **Purpose:** Quest engine & Life Alignment (pure functions). The 8 Life-Map domains (`LIFE_MAP_DOMAINS`), seed campaigns (`SEED_QUESTS`), `questProgress`/`nextMilestone`, `domainScores()` (computes each domain's 0–100 score + signal from real activity), `alignmentScore()` (the one cockpit number), `recentWins()`.
- **Key exports:** `LIFE_MAP_DOMAINS`, `SEED_QUESTS`, `questProgress`, `nextMilestone`, `domainScores`, `alignmentScore`, `recentWins`.
- **Imports (project):** `lib/mission` (`snapshot`), `data` (`DISCIPLINES`).
- **Used by:** `screens/TodayScreen.jsx`, `screens/LifeMapScreen.jsx`, `GoalDecomposer.jsx`.

### `app/src/lib/actions.js`
- **Purpose:** Deep-link action helpers — the Chief proposes & **prefills**, the user confirms the irreversible step in their own Google (no OAuth, no stored creds). Builds prefilled Google Calendar URLs and mailto: drafts; opens externally.
- **Key exports:** `googleCalendarUrl({...})`, `mailtoUrl({...})`, `openExternal(url)`.
- **Imports (project):** none.
- **Used by:** `App.jsx`, `ChiefBrief.jsx`, `WeeklyReview.jsx`, `screens/LifeMapScreen.jsx`.

### `app/src/lib/aiActions.js`
- **Purpose:** Shared inline-AI helpers for the long-press `ObjectMenu`. `askCompanion(prompt,context)` → freeform model text; `decomposeText(title,domain)` → sequenced numbered progression text. Both throw on failure so the menu can show its graceful retry state.
- **Key exports:** `askCompanion`, `decomposeText`.
- **Imports (project):** `lib/api` (`aiFetch`).
- **Used by:** `screens/TodayScreen.jsx`, `screens/TrainingHQ.jsx`, `screens/BuildScreen.jsx`.

### `app/src/lib/api.js`
- **Purpose:** `aiFetch(path, body)` — POSTs to an `/api` AI endpoint with the user's Supabase session token attached (Authorization: Bearer), so the gated endpoints accept the call. Tokenless calls 401 and callers fall back to local logic.
- **Key exports:** `aiFetch`.
- **Imports (project):** `lib/supabase` (`supabase`).
- **Used by:** `Companion.jsx`, `ChiefBrief.jsx`, `CoachSheet.jsx`, `WeekPlanSheet.jsx`, `GoalDecomposer.jsx`, `WeeklyReview.jsx`, `MonthlyUpgrade.jsx`, `lib/aiActions.js`.

### `app/src/lib/haptics.js`
- **Purpose:** Subtle tactile feedback via the Vibration API (no-op where unsupported, e.g. iOS Safari). `celebrate()` reward pattern; `installGlobalHaptics()` wires a light tap to every `.pressable` element globally.
- **Key exports:** `celebrate`, `installGlobalHaptics`.
- **Imports (project):** none.
- **Used by:** `main.jsx`, `Companion.jsx`, `CoachSheet.jsx`, `GoalDecomposer.jsx`, `components/QuickCapture.jsx`, `screens/TodayScreen.jsx`, `screens/TrainingHQ.jsx`, `screens/LifeMapScreen.jsx`, `screens/BuildScreen.jsx`, `screens/ContentStudio.jsx` (haptics usage), and `lib/useLongPress.js` uses `navigator.vibrate` directly.

### `app/src/lib/supabase.js`
- **Purpose:** Creates the Supabase client only when `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` are present; otherwise the app runs localStorage-only (no login).
- **Key exports:** `supabase`, `isSupabaseConfigured`.
- **Imports (project):** `@supabase/supabase-js` (npm).
- **Used by:** `auth/AuthProvider.jsx`, `useSyncedState.js`, `lib/api.js`.

### `app/src/lib/telemetry.js`
- **Purpose:** "The mirror" — a tiny local-only ring buffer (max 600 events) recording what the user opens/does, feeding the Weekly Review and Monthly Upgrade. Never blocks the UI; failures swallowed.
- **Key exports:** `logEvent(surface,action,meta)`, `readEvents()`, `usageBySurface(days)`.
- **Imports (project):** none.
- **Used by:** `App.jsx`, `lib/useMissionEngine.js`, `WeeklyReview.jsx`, `MonthlyUpgrade.jsx`, `screens/LifeMapScreen.jsx`, `screens/BuildScreen.jsx`.

### `app/src/lib/useLongPress.js`
- **Purpose:** Turns any element into an interactive object: tap → `onTap`, long-press (440ms) → `onLongPress` + haptic, scroll/drag past tolerance cancels both. Powers the `ObjectMenu` system.
- **Key exports:** `useLongPress(onLongPress,onTap,opts)`.
- **Imports (project):** none.
- **Used by:** `screens/TodayScreen.jsx`, `screens/TrainingHQ.jsx`, `screens/BuildScreen.jsx`.

### `app/src/lib/voice.js`
- **Purpose:** Voice layer. Speech-to-text (Web Speech API) and text-to-speech (`speechSynthesis`) with no key/server. Powers the hands-free Companion loop and Quick Capture dictation. Strips markdown/emoji for natural speech; picks a good voice.
- **Key exports:** `voiceSupported`, `ttsSupported`, `createListener({...})`, `speak(text,opts)`, `stopSpeaking`.
- **Imports (project):** none.
- **Used by:** `Companion.jsx`, `components/QuickCapture.jsx`.

---

## `app/src/components/` — shared components (9 files)

### `app/src/components/IOSDevice.jsx`
- **Purpose:** The iPhone-bezel frame + iOS chrome primitives. Drops the fake bezel when running on a real phone / installed PWA (`useIsPhone`). Provides reusable iOS-style UI atoms.
- **Key exports:** `IOSDevice`, `IOSStatusBar`, `IOSNavBar`, `IOSGlassPill`, `IOSList`, `IOSListRow`, `IOSKeyboard`.
- **Imports (project):** none.
- **Used by:** `App.jsx`, `auth/LoginScreen.jsx`.

### `app/src/components/TabBar.jsx`
- **Purpose:** Bottom tab bar — four surfaces (Command/Map/Move/Build) + the floating capture FAB (tap = capture, long-press = voice capture) + per-tab badges (inbox count on Map).
- **Key exports:** `TabBar`, `TABS`.
- **Imports (project):** `components/icons`, `components/atoms` (`HUDTicks`).
- **Used by:** `App.jsx`.

### `app/src/components/QuickCapture.jsx`
- **Purpose:** Universal capture bottom-sheet (from the FAB anywhere). Type or dictate a thought, tag it (Idea/ONA/Dream/Task), save to the inbox. Voice mode auto-starts dictation.
- **Key exports:** `QuickCapture`. Const `CAPTURE_TAGS`.
- **Imports (project):** `components/icons`, `lib/haptics`, `components/Sheet`, `lib/voice`.
- **Used by:** `App.jsx`.

### `app/src/components/ObjectMenu.jsx`
- **Purpose:** The contextual action layer for an "interactive object." Long-press a card → this springs up with verbs. AI actions run inline (thinking dots → typewriter-streamed answer in place, no chat jump). `ai:false` runs and closes; `ai:true` returns a Promise<string> streamed in place; optional primary "use this" button.
- **Key exports:** `ObjectMenu({open,onClose,title,subtitle,accent,actions,onPrimary,primaryLabel})`.
- **Imports (project):** `components/Sheet`, `components/icons`.
- **Used by:** `screens/TodayScreen.jsx`, `screens/TrainingHQ.jsx`, `screens/BuildScreen.jsx`.

### `app/src/components/Sheet.jsx`
- **Purpose:** Reusable bottom sheet that owns its open/close lifecycle so it animates OUT before unmounting; renders scrim + handle.
- **Key exports:** `Sheet({open,onClose,children,maxHeight})`.
- **Imports (project):** none.
- **Used by:** `Companion.jsx`, `CoachSheet.jsx`, `WeekPlanSheet.jsx`, `GoalDecomposer.jsx`, `WeeklyReview.jsx`, `MonthlyUpgrade.jsx`, `CalendarSheet.jsx`, `Settings.jsx`, `components/QuickCapture.jsx`, `components/ObjectMenu.jsx`, `screens/LifeMapScreen.jsx`, `screens/TrainingHQ.jsx`.

### `app/src/components/atoms.jsx`
- **Purpose:** The visual atom library — HUD/data-viz building blocks. Ticks, animated counters, section headers, progress bars, pills, cards, confetti, the 0–10 state meter, timeline events, stat tiles, empty states, and the charts (radial gauge, sparkline, radar, mini-bars).
- **Key exports:** `HUDTicks, TickCounter, SectionHead, ProgressBar, Pill, HUDCard, ConfettiBurst, StateMeter, TimelineEvent, StatTile, EmptyState, RadialGauge, Sparkline, RadarChart, MiniBars`.
- **Imports (project):** none.
- **Used by:** `auth/LoginScreen.jsx`, `components/TabBar.jsx`, `screens/TodayScreen.jsx`, `screens/TrainingHQ.jsx`, `screens/LifeMapScreen.jsx`, `screens/ONAHQ.jsx`, `screens/ContentStudio.jsx`, `screens/BuildScreen.jsx`.

### `app/src/components/icons.jsx`
- **Purpose:** Inline stroke-SVG icon set (37 icons) + domain/kind icon maps replacing emoji-as-icons.
- **Key exports:** `Ico` and the full icon set (`IconHome, IconBolt, IconPlay, IconNinja, IconSparkles, IconPlus, IconCheck, IconMic, IconChevronRight, IconChevronDown, IconClose, IconLock, IconCircle, IconFlame, IconCamera, IconCopy, IconUsers, IconTrendUp, IconTarget, IconWarn, IconCalendar, IconClock, IconArrowRight, IconSend, IconActivity, IconSliders, IconDownload, IconBrain, IconInbox, IconArchive, IconTrash, IconBook, IconCompass, IconHeart, IconGlobe, IconPulse`), plus `domainIcon(id)`, `kindIcon(kind)`.
- **Imports (project):** none.
- **Used by:** nearly every UI file (`Onboarding`, `SyncBadge`, `Companion`, `ChiefBrief`, `CoachSheet`, `WeekPlanSheet`, `GoalDecomposer`, `WeeklyReview`, `MonthlyUpgrade`, `CalendarSheet`, `Settings`, `auth/LoginScreen`, `components/TabBar`, `components/QuickCapture`, `components/ObjectMenu`, and all five screens).

### `app/src/components/ErrorBoundary.jsx`
- **Purpose:** Catches render-time throws in a screen chunk → shows a recover card instead of white-screening; auto-resets when `resetKey` (tab) changes.
- **Key exports:** `ErrorBoundary` (class).
- **Imports (project):** none (React only).
- **Used by:** `App.jsx`.

---

## `app/src/screens/` — the five surfaces + sub-hubs (5 files)

### `app/src/screens/TodayScreen.jsx`  (tab: **Command**)
- **Purpose:** The app's front door / cockpit. Strict hierarchy: L1 Today's Mission (greeting, alignment gauge, ranked missions with check-off + "re-planned for readiness" flash + per-mission long-press AI ObjectMenu + One-Thing setter); the Ask bar (Companion door); the Missions/campaign (quest) card with roadmaps + long-press AI actions + New Goal (GoalDecomposer); the readiness Check-in card (meters that re-plan the mission); Momentum strip; Recent Wins; the ChiefBrief; and the collapsible Timeline (manual blocks + synced calendar events).
- **Key exports:** `TodayScreen({...})`. Internal: `MissionCard`, `MissionRow`, `missionActions`, `CampaignCard`, `campaignActions`, `MissionsCard`, `WinsStrip`, `AskBar`, `CheckInCard`, `MomentumStrip`, `TimelineCard`, `realDateLabel`, `greetingLabel`.
- **State keys owned:** `lifeos:quests` (also reads daily + calendar via fetch).
- **Imports (project):** `components/atoms`, `components/icons`, `ChiefBrief`, `lib/haptics`, `lib/mission` (`estimateLabel`), `lib/quests`, `GoalDecomposer`, `components/ObjectMenu`, `lib/useLongPress`, `lib/aiActions`, `useSyncedState`, `data` (`TIMELINE`). Calls `/api/calendar` via fetch.
- **Used by:** `App.jsx` (eager).

### `app/src/screens/TrainingHQ.jsx`  (tab: **Move / Perform**)
- **Purpose:** The Movement OS / progression engine. Progression hero (closest breakthrough + coach CTA), Coach/Log/Week action row, the Movement Pyramid, per-discipline skill trees (tap-to-edit nodes with tier/cue/drills/gates/faults + long-press AI ObjectMenu: fastest path to mastery / analyze limiter / generate session), the "Working On" panel, editable training-phase card, and the Body Radar (current vs goal). Hosts CoachSheet, WeekPlanSheet, LogSessionSheet.
- **Key exports:** `TrainingHQ`, `PerformScreen` (alias), `BodyRadar`, `SkillTree`, `SkillNode`, `LogSessionSheet`, `identityScores`. Internal: `ProgressionHero`, `MovementPyramid`, `WorkingOnPanel`, `skillActions`, `Stepper`, `TrackBtn`, `FundamentalsPanel`.
- **State keys owned:** `lifeos:sessions`, `lifeos:trackables`, `lifeos:skills:v2`, `lifeos:training`, `lifeos:lastdisc`.
- **Imports (project):** `components/atoms`, `lib/haptics`, `components/icons`, `components/ObjectMenu`, `lib/useLongPress`, `lib/aiActions` (`askCompanion`), `data`, `useSyncedState`, `CoachSheet`, `WeekPlanSheet`, `components/Sheet`, `coaching` (`drillsFor`,`fundamentalsFor`), `lib/mission` (`TIER_META`,`masteryEstimate`,`prereqFor`,`upcomingUnlocks`,`nextBreakthrough`).
- **Used by:** `App.jsx` (lazy, as `PerformScreen`).

### `app/src/screens/LifeMapScreen.jsx`  (tab: **Map / Life**)
- **Purpose:** A living map of the 8 life domains. The Life-Map viz + Balance radar (each domain's live score), the per-domain `DomainSheet` (health readiness verdict, relationships/date-night, Learning Lab, Adventure Hub, athlete/business/creativity summaries with go-to-tab buttons, growth → Weekly Review/Monthly Upgrade), the capture inbox/triage (route captures into folders by domain) and the Journal.
- **Key exports:** `LifeMapScreen({...})`. Internal: `LifeMapViz`, `ListHub`, `DomainSheet`, `RouteRow`, helpers (`folderForDomain`, `fmtDay`, `TAG_COLORS`).
- **State keys owned:** `lifeos:journal`, `lifeos:folders`, `lifeos:learning`, `lifeos:adventure` (captures are passed in from `App`).
- **Imports (project):** `components/atoms`, `components/Sheet`, `components/icons`, `data`, `useSyncedState`, `lib/telemetry`, `lib/haptics`, `lib/actions`, `lib/quests` (`LIFE_MAP_DOMAINS`,`domainScores`,`alignmentScore`), `lib/mission` (`snapshot`).
- **Used by:** `App.jsx` (lazy).

### `app/src/screens/BuildScreen.jsx`  (tab: **Build**)
- **Purpose:** Business / content / operations. Opens with the Action Center (metrics → recommended moves with why + impact, one tap into today's mission) and the Workbench ("what's on your plate" — active projects across all folders with long-press AI actions). Segments into ONA (embeds `ONAHQ`), Podium (`PodiumHub` — tap-to-edit KPIs + projects/notes from the Podium folder; **largely a stub**), and Studio (embeds `ContentStudio`).
- **Key exports:** `BuildScreen({onAddMission,missionIds})`. Internal: `PodiumStat`, `PodiumHub`, `ActionCenter`, `ProjectCard`, `Workbench`, `projectActions`, `dueStatus`, `SEGMENTS`.
- **State keys owned:** `lifeos:podium`.
- **Imports (project):** `components/atoms`, `components/icons`, `screens/ONAHQ`, `screens/ContentStudio`, `lib/mission` (`snapshot`,`recommendOna`,`recommendContent`), `useSyncedState`, `lib/haptics`, `lib/telemetry`, `components/ObjectMenu`, `lib/useLongPress`, `lib/aiActions` (`askCompanion`).
- **Used by:** `App.jsx` (lazy).

### `app/src/screens/ONAHQ.jsx`  (sub-hub of Build)
- **Purpose:** The ONA business command hub. Header KPIs (members/MRR/NPS, tap-to-edit), the live GymDesk card (`lifeos:ona:live`, fed by `api/ona-webhook`), the sales pipeline with a per-stage mini-CRM of named people (add/advance/contact), the coach roster (grade/role/PL price), and the initiative list (P0–P2, %, due).
- **Key exports:** `ONAHQ`, `SalesPipeline`, `CoachRoster`, `InitiativeList`. Internal: `ONAStat`, `PersonCard`, `CoachAvatar`, `CoachRow`, `InitiativeRow`, `LiveOnaCard`, `Stepper`, consts `GRADES`,`PRIORITIES`,`LIVE_FIELDS`,`relTime`.
- **State keys owned:** `lifeos:ona`, reads `lifeos:ona:live`.
- **Imports (project):** `components/atoms`, `components/icons`, `data` (`ONA_STATS`,`SALES_STAGES`,`COACHES`,`BENCH`,`INITIATIVES`), `useSyncedState`.
- **Used by:** `screens/BuildScreen.jsx`. (Recommenders in `lib/mission` also read `lifeos:ona`/`lifeos:ona:live`.)

### `app/src/screens/ContentStudio.jsx`  (sub-hub of Build, the Creator Studio)
- **Purpose:** The content + projects workspace. Brand tiles/editor, content pipeline (idea→plan→shoot→edit→schedule→posted), the Hook Bank, a weekly posting calendar (tap-to-cycle), folders/projects (the Workbench/`BuildScreen` reads these too), per-folder sheet with notes + projects + reorderable steps. The folder system is the routing target for triaged captures.
- **Key exports:** `ContentStudio`, `BrandTile`, `PipelineStrip`, `HookBank`, `PostingCalendar`. Internal: `BrandEditor`, `ContentPipeline`, `ContentItemRow`, `Projects`, `ProjectCard`, `StepRow`, `NoteCard`, `FolderSheet`, `FoldersSection`, `Step`.
- **State keys owned:** `lifeos:content`, `lifeos:folders`.
- **Imports (project):** `components/atoms`, `components/icons`, `data` (`BRANDS`,`PIPELINE_STAGES`,`HOOKS`,`SEED_FOLDERS`), `useSyncedState`.
- **Used by:** `screens/BuildScreen.jsx`.

---

## Cross-cutting: localStorage / `app_state` keys (the data model)

Each is stored locally and (when signed in) synced to `app_state(user_id, key, value)`:
- `lifeos:daily:<YYYY-MM-DD>` — meters, one-thing, check-in flag, timeline (per day)
- `lifeos:mission:<YYYY-MM-DD>` — the day's mission document (items + doneIds + adaptedAt)
- `lifeos:brief:<YYYY-MM-DD>` — cached Chief brief
- `lifeos:history` — per-day {score, readiness, done} (streak/momentum/trend)
- `lifeos:quests` — campaigns (quest system)
- `lifeos:skills:v2` — skill trees · `lifeos:trackables` — drill/fundamental progress · `lifeos:training` — phase/radar · `lifeos:lastdisc`
- `lifeos:sessions` — logged training sessions
- `lifeos:ona` — ONA workspace · `lifeos:ona:live` — GymDesk live stats (webhook-written)
- `lifeos:content` — Studio content/hooks/calendar · `lifeos:folders` — folders/projects/notes · `lifeos:podium` — Podium KPIs
- `lifeos:captures` — universal capture log · `lifeos:journal` · `lifeos:learning` · `lifeos:adventure`
- `lifeos:weeklyfocus` — one focus for the week
- `lifeos:companion` — conversation · `lifeos:companion:memory` — long-term memory · `lifeos:voicereplies`
- `lifeos:upgrades` / `lifeos:upgradeDismissed` — Monthly Upgrade changelog/dismissals
- `lifeos:settings` (icalUrl) · `lifeos:vibe` (calm/glow) · `lifeos:onboarded`
- `lifeos:telemetry` — local-only usage ring buffer (NOT synced, by design)
