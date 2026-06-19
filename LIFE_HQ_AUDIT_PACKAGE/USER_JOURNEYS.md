# JAM HQ / Life HQ — User Journeys

> Step-by-step journeys traced through the **actual code paths**. Component/file names are cited inline. Internal tab ids: `today`=Command, `life`=Map, `perform`=Move, `build`=Build.
> Persistence is localStorage under `lifeos:*` via `useSyncedState` (optionally Supabase-synced). AI calls hit `/api/*` via `aiFetch`; every AI surface has a deterministic local fallback, so each journey works with or without an AI key.

---

## Journey 1 — New user flow (boot → login → onboarding → first Command view)

**Screens/components:** `App.jsx`, `auth/AuthProvider.jsx`, `auth/LoginScreen.jsx`, `Onboarding.jsx`, `BootSplash.jsx`, `TodayScreen.jsx`, `lib/useMissionEngine.js`.

1. **App boots.** `App()` reads `useAuth()` → `{ configured, loading, session }`.
2. **Auth gate decides** (`App.jsx`):
   - If Supabase **not** configured → straight to `MainApp` (offline mode, no login).
   - If configured **and** loading → the spinning-orb loading screen inside `IOSDevice`.
   - If configured **and** no session → `LoginScreen`.
3. **Login** (`LoginScreen.jsx`): Jay enters email + password and taps "Create Account" (sign-up) or "Sign In". `submit()` calls `signUp` / `signInWithPassword`. On a successful session, `AuthProvider`'s `onAuthStateChange` updates `session`, and the gate re-renders to `MainApp`. (Sign-up with email-confirmation on shows a yellow notice instead.)
4. **MainApp mounts** (`App.jsx` → `MainApp()`): initial state `tab='today'`, `booting=true`, plus `onboarded` from `lifeos:onboarded` (false for a new user). It logs a `today/open` telemetry event and sets the visual vibe (`calm`).
5. **Daily state initializes:** `missionState` = `freshDailyDefault(today)` (energy/focus/body/mood all 7, `oneThing:''`, `checkedIn:false`, timeline carried forward from the latest prior day or the `TIMELINE` seed).
6. **Mission Engine runs** (`useMissionEngine`): with no stored mission doc, it calls `generateMissions()` and writes `lifeos:mission:{today}` (`{ items, doneIds:[] }`).
7. **Overlays stack on top of Command:** `MainApp` renders `TodayScreen` underneath, then mounts `{!onboarded && <Onboarding/>}` and `{booting && <BootSplash/>}` last (so both overlay everything).
8. **BootSplash plays** (`BootSplash.jsx`): orb blooms, "JAM HQ" + tagline; at ~1.65s it starts leaving, at ~2.15s `onDone()` sets `booting=false` and it unmounts.
9. **Onboarding shows** (`Onboarding.jsx`): five highlight cards (Command, Map, Move, Build, Intelligence). Jay taps **"Let's build →"** → `onDone()` sets `lifeos:onboarded=true`, unmounting it.
10. **First Command view** (`TodayScreen.jsx`): Jay lands on the cockpit — MissionCard (greeting, READY, ALIGN gauge, generated missions, "+ SET YOUR ONE THING"), AskBar, MissionsCard (seed campaigns), CheckInCard (open by default since not checked in), MomentumStrip, ChiefBrief, TimelineCard. The "+" FAB and the Companion orb are present.

**Outcome:** Authenticated (or offline), onboarded, sitting on a fully-populated Command screen with today's mission generated and seed campaigns live.

---

## Journey 2 — Daily use flow (morning check-in → readiness → mission → Chief brief)

**Screens/components:** `TodayScreen.jsx` (`CheckInCard`, `MissionCard`, `ChiefBrief`), `lib/useMissionEngine.js`, `components/atoms.jsx` (`StateMeter`, `RadialGauge`), `App.jsx`.

1. **Open the app → Command.** `MainApp` defaults to `tab='today'`. `missionState` for the day is loaded (or freshly defaulted).
2. **Morning check-in** (`CheckInCard`, open by default when `!state.checkedIn`): Jay drags the four `StateMeter`s — Energy, Focus, Body, Mood. Each calls `setMeter(k, v)` → `setState({ ...s, [k]: v, checkedIn: true })`.
3. **Readiness computes live:** `readiness = round(((energy+focus+body+mood)/40)*100)`. The header READY number and CheckInCard number recolor (lime ≥75 / gold ≥50 / red below) and show a trend vs the 7-day average (`readinessTrend` in `App.jsx`).
4. **The mission engine re-plans to readiness** (`useMissionEngine`): once `checkedIn` is true, a readiness bucket is derived (`push ≥60 / tech ≥45 / recover` below). When the bucket *changes*, the training mission is swapped for a fresh one matching the moment, preserving order + completion, stamping `adaptedAt`, and logging `mission/adapt`.
5. **"RE-PLANNED FOR READINESS" flash:** `MissionCard` watches `adaptedAt` and flashes a gold badge for ~6s so the cockpit visibly re-plans itself.
6. **Work the mission:** Jay taps a mission's checkbox → `onToggleMission(id)` → `toggleMission` flips `doneIds` in the mission doc (haptic; confetti when the final one completes). The progress bar + `done/total · estimate` update; "MISSION COMPLETE" shows when all are done.
7. **Navigate from a mission:** tapping a mission *body* calls `goMission(m)` → `onGoTab(m.go)` (e.g. a `train` mission → Move), except the `focus` (One Thing) mission, which stays on Command.
8. **Alignment + wins recompute:** a `useEffect` on `[doneIds, quests]` recomputes `alignmentScore()` (the ALIGN gauge) and `recentWins()` (the WinsStrip).
9. **History records the day** (`App.jsx`): an effect writes `lifeos:history[today] = { score, readiness, done }`, where `todayScore = min(4, doneCount + (readiness≥75 ? 1 : 0))`. This drives the real streak, the 14-day momentum heatmap/sparkline, and the trend.
10. **Chief of Staff brief** (`ChiefBrief.jsx`): ~600ms after load it generates (from cache `lifeos:brief:{day}` or fresh). It builds context (readiness, today's calendar, inbox count, One Thing, weekly focus, recent training) and calls `/api/chief mode=brief`; on no key it uses `buildLocal()`. The brief ends in "▸ Highest leverage: …". Action chips let Jay triage the inbox (→ Map), "Plan a block" (inline composer → Google Calendar prefilled), or fire an AI-proposed event/email.

**Data that moves:** meters → `missionState` (`lifeos:daily:{today}`) → readiness → mission re-rank (`lifeos:mission:{today}`) → history (`lifeos:history`) → momentum/streak/trend + alignment + brief.

**Outcome:** A checked-in day with a readiness-adapted mission, a recorded history entry feeding streak/momentum, and a Chief brief pointing at the single highest-leverage move.

---

## Journey 3 — Goal creation flow (GoalDecomposer)

**Screens/components:** `TodayScreen.jsx` (`MissionsCard`), `GoalDecomposer.jsx`, `lib/quests.js`, `lib/useMissionEngine.js`.

1. **Open the decomposer:** On Command, Jay taps **"NEW GOAL"** in the MissionsCard header → `setGoalOpen(true)` mounts `GoalDecomposer`.
2. **Name the goal:** Jay types e.g. "Land a standing back tuck" and picks a **domain** (one of the 8 `LIFE_MAP_DOMAINS`).
3. **Break it down:** Tapping "Break it down" (or Enter) calls `decompose()` → `/api/decompose` with `{ goal, domain, context }` (light context, e.g. active skills for `athlete`). On success it sets `{ title, why, milestones[] }` and marks `usedAI`. On failure it uses `buildLocal(goal)` — a clean 5-step scaffold — and shows the "○ STARTER SCAFFOLD" indicator.
4. **Edit the progression:** Jay edits any milestone text, deletes (`delMs`) or adds (`addMs`) milestones.
5. **Save as mission:** "Add as mission →" calls `save()` → builds a quest `{ id:'goal-{ts}', domain, icon, title, why, milestones:[{id,text,done:false}] }` and pushes it via `onAddQuest` → `addQuest` prepends it to `lifeos:quests`. Haptic fires; the sheet closes.
6. **It appears as a campaign:** The new quest shows immediately in Command's MissionsCard as a `CampaignCard` (tap to open its roadmap, long-press for AI actions).
7. **It feeds the daily mission:** `generateMissions()` (used by `useMissionEngine`) pulls quest progress into the day's mission generation, so the campaign's next step can surface in "Today's mission".

**Data that moves:** goal + domain → `/api/decompose` (or local scaffold) → editable milestones → a quest object in `lifeos:quests` → Command campaign + daily mission input.

**Outcome:** A big goal becomes a structured, milestone-tracked campaign on Command that the engine can pull into daily missions.

---

## Journey 4 — Habit / mission tracking flow

**Screens/components:** `TodayScreen.jsx` (`MissionCard`, `MissionRow`, `MissionsCard`, `CampaignCard`), `lib/useMissionEngine.js`, `components/ObjectMenu.jsx`.

1. **See today's mission:** Command's MissionCard lists the day's missions (`missions` from the engine) with the next one highlighted "NEXT UP · ~Nm".
2. **Complete a mission:** Tap the checkbox → `toggle(m)` → `onToggle(m.id)` → `toggleMission` updates `doneIds`. Celebrating haptic + confetti on finishing the last one. The One Thing mission (`id:'one-thing'`) also mirrors its done flag into `missionState.oneThingDone`.
3. **Set the One Thing:** If unset, "+ SET YOUR ONE THING" opens an inline input → `onSetOneThing(txt)` sets `state.oneThing`. The engine (`useMissionEngine`) keeps it in lockstep: it injects/updates a `one-thing` mission at the top of the list.
4. **Re-plan:** Tapping the sparkles re-plan button → `onRegenerate` → `regenerateMissions()` rebuilds the list while keeping any still-valid done ids.
5. **Contextual AI on a mission (long-press):** Long-press a `MissionRow` → mission `ObjectMenu`. Pick *How should I approach this?* or *Why does this matter?* → `askCompanion()` streams an answer inline; or *Set as my One Thing* (local) sets it and closes.
6. **Track a campaign milestone:** In MissionsCard, tap a `CampaignCard` to expand its roadmap, then tap a milestone → `onToggleMilestone(qid, mid)` flips `done` (+ `doneAt`) in `lifeos:quests` (haptic). Progress % updates; completed milestones strike through.
7. **Contextual AI on a campaign (long-press):** Long-press a `CampaignCard` → campaign `ObjectMenu`: *Break into next actions* (`decomposeText` inline), *Analyze blockers* / *Generate a plan* (`askCompanion` inline), or *View roadmap* (local, expands it).
8. **It rolls up:** Completions feed `todayScore`/history (→ streak + momentum), and milestone `doneAt` timestamps surface in `recentWins()` (the Command WinsStrip).

**Data that moves:** mission toggles → `lifeos:mission:{today}.doneIds`; One Thing → `missionState.oneThing` ↔ the `one-thing` mission; milestone toggles → `lifeos:quests`; all of it → history/momentum/wins.

**Outcome:** Daily missions and long-campaign milestones are tracked with one tap, with inline AI a long-press away, and progress visibly compounds into streak, momentum, alignment, and wins.

---

## Journey 5 — Learning / training flow (Move skills + CoachSheet + WeekPlanSheet)

**Screens/components:** `TrainingHQ.jsx` (`ProgressionHero`, `SkillTree`, `SkillNode`, `FundamentalsPanel`, `WorkingOnPanel`, `LogSessionSheet`), `CoachSheet.jsx`, `WeekPlanSheet.jsx`, `coaching.js`, `lib/mission.js`.

1. **Open Move** (`perform` tab → `PerformScreen`/`TrainingHQ`). ProgressionHero shows movement identity, level, % toward world-class, readiness, the closest breakthrough, and upcoming unlocks.
2. **Pick a discipline:** Tap a chip in SKILL TREES (Gymnastics/Tricking/Calisthenics/Acro/Parkour/Ninja) — remembered in `lifeos:lastdisc`. The `SkillTree` renders that discipline's fundamentals + tiered skills.
3. **Work a skill** (`SkillNode`): Tap to expand → see the cue, mastery-weeks estimate + readiness gate, status pills (Locked/Active/Mastered), ± percent steppers, "COACH ME", and the tier's drills (each with a TRACK button). Setting a skill to "Mastered" fires confetti + haptic. Changes write to `lifeos:skills:v2`.
4. **Track drills & fundamentals:** Tap TRACK on any drill/fundamental → cycles `todo → working → done` (`cycleTrack` → `lifeos:trackables`; haptic on done). "WORKING" items + active skills aggregate into the **WorkingOnPanel** ("Your current edges").
5. **Contextual AI on a skill (long-press):** Long-press a `SkillNode` → skill `ObjectMenu`: *Fastest path to mastery* / *Analyze my limiter* (`askCompanion` inline), *Generate a session* (→ opens CoachSheet), *Review drills & detail* (expands the node).
6. **Coach a session** (`CoachSheet.jsx`): from the Coach button, the breakthrough card, "COACH ME", or the ObjectMenu. Jay picks a focus discipline + duration → "Build session". `buildContext()` summarizes the tree, readiness, recent sessions, blindspots, and drill progressions and calls `/api/coach`; no key → `buildLocal()` produces a structured session (warm-up → primary skill work → strength → cool-down → blindspot). An always-on **Blindspots** panel shows what the coach is watching.
7. **Log the session:** "Log this session" (in CoachSheet) or the standalone **LogSessionSheet** (discipline + duration + intensity) → `onLog` → `logSession` prepends to `lifeos:sessions` (owned by the shell so the Companion can log too). Session count = `BASE_SESSIONS (38) + sessions.length`.
8. **Plan the week** (`WeekPlanSheet.jsx`): the "Week" button → pick training-days (3–6) + priority discipline → "Personalize with AI" calls `/api/coach mode=week` (`buildContext` from tree + blindspots); no key → the proven `WEEK_TEMPLATE` microcycle renders, with a "principles behind it" section.
9. **It rolls up:** Skill %s and mastery feed the Athlete domain score, the identity meters, the movement pyramid, and ProgressionHero; logged sessions feed weekly/monthly reviews and "recent wins".

**Data that moves:** skill edits → `lifeos:skills:v2`; drill/fundamental tracking → `lifeos:trackables`; sessions → `lifeos:sessions`; coach/week context → `/api/coach` (or local). All of it → Move's hero/pyramid/identity + the Athlete domain on the Map.

**Outcome:** A roadmap-driven training system where Jay tracks skills/drills, gets readiness-aware AI (or local) session and week plans, and logs sessions that compound across the app.

---

## Journey 6 — AI interaction flow (Companion + long-press ObjectMenu inline AI)

**Screens/components:** `Companion.jsx` (`CompanionLauncher`, `Companion`), `components/ObjectMenu.jsx`, `lib/aiActions.js`, `lib/mission.js` (`snapshot`, `buildGlobalContext`, `localAnswer`), `App.jsx` (`runAction`).

### 6a. Full conversation (Companion)
1. **Open it:** Tap the floating cyan **orb** (`CompanionLauncher`, present on every screen), the Command **Ask bar**, or its mic. Tap = open; **long-press = open straight into voice mode** (`openCompanion(true)`).
2. **Pick a hat:** Choose one of 7 modes (Partner, Chief, Coach, Creative, ONA, Podium, Architect) — each carries its own system framing + starter chips.
3. **Ask:** Type (Enter) or speak (mic; full hands-free loop when Voice is on). `send()` appends the message, builds `buildGlobalContext()` (a compact snapshot of Jay's whole world — readiness, One Thing, today's mission, active skills, blindspots, ONA/brands/projects, inbox count, and **long-term memory**) and posts to `/api/companion`. No key → `localAnswer(q, mode)` answers from live data.
4. **Act on a reply (propose-and-confirm):** AI replies can carry **action buttons** (event / session / capture / focus / email). Tapping one calls `doAction` → `onAction` → `App.runAction(a)`: an `event` adds a timeline block + opens Google Calendar prefilled; `email` opens mailto; `session` logs a training session; `capture` adds an inbox capture; `focus` sets the One Thing. Nothing executes silently.
5. **Memory grows:** Every ~5 AI exchanges, `updateMemory()` distills the conversation into `lifeos:companion:memory` (shown as a "REMEMBERS YOU" badge), carried forward into future context.

### 6b. Inline AI on an object (long-press ObjectMenu)
1. **Long-press a major card** anywhere — a Command **mission** or **campaign**, a Move **skill**, or a Build **project** (`lib/useLongPress.js`: 440ms hold, 10px move cancels, haptic on trigger). A plain tap does the object's primary action instead.
2. **The ObjectMenu springs up** (`components/ObjectMenu.jsx`) with verbs scoped to that object (see SCREEN_INVENTORY C11 for the per-object action lists).
3. **Run an action:**
   - **AI actions** (`ai:true`) call `askCompanion(prompt)` or `decomposeText(title, domain)` (`lib/aiActions.js` → `/api/companion` / `/api/decompose`). The menu shows "THINKING…" then **types the answer out in place** (typewriter reveal) — no jump to a chat window. "Back" returns to the action list.
   - **Local actions** (`ai:false`) run and close — e.g. *Set as my One Thing*, *View roadmap*, *Generate a session* (opens Coach), *Review drills & detail* (expands the node).

**Data that moves:** Companion ↔ `lifeos:companion` (messages) + `lifeos:companion:memory`; both surfaces read the same `snapshot()` context and call the same model endpoints; Companion actions route through `App.runAction` into calendar/mail/session/capture/focus.

**Outcome:** One intelligence everywhere — a full multi-mode conversation that can act with confirmation and remembers Jay over time, plus instant inline AI on any object via long-press without leaving the screen.

---

## Journey 7 — Review flow (WeeklyReview + MonthlyUpgrade)

**Screens/components:** `LifeMapScreen.jsx` (Growth `DomainSheet`), `WeeklyReview.jsx`, `MonthlyUpgrade.jsx`, `lib/telemetry.js`, `App.jsx`.

### 7a. Weekly Review
1. **Open it:** Map tab → tap the **Growth** domain node → DomainSheet → "WEEKLY REVIEW" (`onOpenReview` → `setReviewOpen(true)` in `App.jsx`).
2. **The week is crunched** (`buildWeek()`): from `lifeos:history` (days active + avg readiness), `lifeos:sessions` (count + minutes + discipline mix), `lifeos:captures` (attention by domain + inbox left), and telemetry (`usageBySurface(7)`).
3. **Read the week:** Stat row (Days active/7, Readiness, Sessions, Minutes), "Where your attention went" (per-domain bars), and a **Domain balance check** flagging which domains went dark.
4. **Reflect:** A `buildLocalSummary()` plain-language reflection shows by default; "AI REFLECT" calls `/api/chief mode=review` with the week's context for a richer summary (falls back to local).
5. **Set next week's focus:** Type into "One focus for next week" → saved live to `lifeos:weeklyfocus` (this then feeds the Chief brief and the Monthly Upgrade's "weekly ritual" check).
6. **Act on it:** "Block focus time" and "Plan {dark domain}" chips open Google Calendar prefilled for tomorrow 9am.

**Outcome:** An honest weekly snapshot, a reflection, a saved single focus, and optional scheduled time to act on it.

### 7b. Monthly Upgrade Report
1. **Open it:** Map tab → **Growth** domain → DomainSheet → "UPGRADE" (`onOpenUpgrade` → `setUpgradeOpen(true)`).
2. **The month is crunched** (`buildMonth()`): ~30 days of history, sessions, captures, folders, weekly-focus, and telemetry (`usageBySurface(30)`).
3. **Reflect:** A data note shows; "AI REFLECT" calls `/api/chief mode=upgrade` (falls back to a local summary).
4. **Review proposals** (`buildProposals(m)`): deterministic, data-driven suggestions — make triage a daily habit, protect a neglected domain, add a cross-training session, build a recovery block, rethink a barely-used surface, prune empty folders, lock in the weekly review, or capture more.
5. **Decide (safe loop):** Each proposal has **Accept** / **Dismiss**. Accept records `{ id, title, version, ts }` to `lifeos:upgrades` (the changelog) and **bumps the version** (`version = 1 + upgrades.length`); Dismiss adds the id to `lifeos:upgradeDismissed`. **Nothing changes automatically** — the app stays Jay's to steer.
6. **Changelog:** Accepted upgrades list at the bottom as "your LifeOS changelog" with version stamps. When nothing's left to propose, an "ALL CLEAR" state shows.

**Data that moves:** history/sessions/captures/folders/telemetry → `buildWeek()`/`buildMonth()` → reflections (`/api/chief` or local) → `lifeos:weeklyfocus` (weekly) and `lifeos:upgrades`/`lifeos:upgradeDismissed` + version (monthly).

**Outcome:** A weekly honesty ritual that sets one focus, and a monthly self-improvement loop that proposes upgrades Jay explicitly accepts or dismisses — a self-tuning system that never changes itself behind his back.
