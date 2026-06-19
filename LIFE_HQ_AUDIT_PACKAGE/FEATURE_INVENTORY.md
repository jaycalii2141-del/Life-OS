# JAM HQ / Life HQ — Feature Inventory

Exhaustive feature-by-feature documentation for an external product audit. JAM HQ (also branded "Life HQ" / "LifeOS") is a Vite + React 18 PWA: a personal operating system for Jay Martinez (movement athlete/coach; co-owns Obstacle Ninja Academy + Podium Creations; creator @jayy_martinez). Auth + per-user cloud sync via Supabase (`app_state(user_id, key, value jsonb)`); AI via Vercel serverless functions calling Anthropic (`claude-haiku-4-5-20251001`).

For each feature: **What it does · Why it exists · User value · Dependencies · Related screens · Status.**

**Global status notes that apply throughout:**
- `ANTHROPIC_API_KEY` is now **SET** → all AI features are **live**. Every AI feature still ships a deterministic/local fallback for when the key is unset, the user is signed out (401), or upstream errors.
- Seed data (`data.js`) is still **placeholder** (e.g. ONA 248 members / $38,450 MRR, sample skills, sample timeline).
- **Podium is largely a stub** (manual KPI fields + reads the Podium folder; no live order data).
- **ONA live webhook** is built but **needs env vars** (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ONA_WEBHOOK_SECRET`, `ONA_USER_ID`) to flow GymDesk→Zapier→app.

The four surfaces are labeled in the UI as **Command** (Today), **Map** (Life), **Move** (Perform/Training), **Build**, plus the always-present **Intelligence** orb.

---

## 1. Daily Mission Engine

- **What it does:** Generates a ranked list of ≤5 "missions" each day from every data source (readiness, skills, sessions, ONA, content, projects/folders, captures, calendar, cadence). Each mission carries `{id, icon, title, why, est, go(tab), kind}`. Order: (1) the One Thing if set, (2) training — readiness decides *what* not *whether* (push edge skill / technique-only / recovery), (3) highest-leverage ONA move, (4) highest-leverage content/project move, (5) a cadence ritual (Sunday weekly review / clear inbox ≥3 / weekend plan-with-Chelsea). The React hook owns the per-day mission document (generate once, regenerable, done-state survives re-plans), can have moves pushed in from Build's Action Center, and never auto-executes anything.
- **Why it exists:** To answer, on opening the app, "what matters most, what to do next, what can wait" — converting every metric into a next best action with a WHY so trust builds.
- **User value:** One ranked to-do list synthesized from the whole system; no decision fatigue; recommendations are explained, not imposed.
- **Dependencies:** `lib/mission.js` (`generateMissions`, `snapshot`, `recommendOna`, `recommendContent`, `nextBreakthrough`, `estimateLabel`), `lib/useMissionEngine.js`, `useSyncedState`, `lib/telemetry`. State: `lifeos:mission:<day>`, `lifeos:daily:<day>`.
- **Related screens:** Command (TodayScreen `MissionCard`/`MissionRow`); referenced by the Companion; appended to from Build.
- **Status:** Live and functional; mission quality scales with how much real data exists (currently mostly seed).

## 2. Readiness Check-in

- **What it does:** Four 0–10 tap meters (Energy, Focus, Body, Mood) → a 0–100 readiness score. Setting any meter marks `checkedIn` and re-keys the day. Shows a trend vs the 7-day average.
- **Why it exists:** Readiness is the calibration input the mission engine and coach auto-regulate around.
- **User value:** A 5-second self-check that changes what the system recommends (push vs technique vs recover).
- **Dependencies:** `components/atoms` (`StateMeter`), daily state `lifeos:daily:<day>`, history `lifeos:history` (trend).
- **Related screens:** Command (`CheckInCard`); the value flows into Move, the Coach, the Companion, and the Health domain.
- **Status:** Live.

## 3. Adaptive Mission Re-ranking

- **What it does:** When readiness crosses a threshold after check-in (push ≥60 / tech ≥45 / recover <45), the engine swaps the training mission to match the moment — preserving order, the other missions, and completion state — and flashes a "RE-PLANNED FOR READINESS" badge. Logs a `mission/adapt` telemetry event.
- **Why it exists:** The cockpit should re-plan itself the instant the athlete's state changes, without wiping progress.
- **User value:** Training guidance that's honest about today's body instead of a static plan.
- **Dependencies:** `lib/useMissionEngine.js` (bucket ref + effect), `lib/mission.js`, `lib/telemetry`.
- **Related screens:** Command (badge in `MissionCard`).
- **Status:** Live.

## 4. Alignment Gauge

- **What it does:** A single 0–100 "ALIGN" number at the top of the cockpit — the average of all eight life-domain scores. Answers "Am I becoming the person I want to become?"
- **Why it exists:** The one number that summarizes whole-life balance.
- **User value:** Instant whole-life pulse without reading eight numbers.
- **Dependencies:** `lib/quests.js` (`alignmentScore`, `domainScores`), `components/atoms` (`RadialGauge`).
- **Related screens:** Command (header gauge), Map (also shown over the Life-Map viz).
- **Status:** Live (computed from real activity; scores currently reflect seed/early data).

## 5. Momentum, Streak & History

- **What it does:** Scores each day by mission completion + a readiness bonus (cap 4); persists `{score, readiness, done}` per day in `lifeos:history`. Derives a real consecutive-day streak, a 14-day momentum heatmap + sparkline, and a readiness trend vs the prior 7 days.
- **Why it exists:** Momentum is fuel; visible streaks reinforce consistency over intensity.
- **User value:** Proof of consistency and a gentle nudge not to break the chain.
- **Dependencies:** `App.jsx` (`buildMomentum`, `computeStreak`, `readinessTrend`), `components/atoms` (`Sparkline`), `lifeos:history`.
- **Related screens:** Command (`MomentumStrip`, streak chips); growth domain uses streak.
- **Status:** Live.

## 6. Quest / Campaign System

- **What it does:** Long-term goals become MISSIONS (campaigns) broken into checkable milestones. Five seed campaigns (hybrid athlete, scale ONA, Podium launch, marriage, explore) editable in-app. Each campaign card shows progress %, next milestone, expandable roadmap with tappable milestones (records `doneAt`), and a long-press AI ObjectMenu (break into next actions, analyze blockers, generate a 5-step plan, view roadmap). New campaigns are created via the Goal Decomposer.
- **Why it exists:** Connects the daily mission to the 10-year identity — the daily engine can pull a campaign's next step into the day.
- **User value:** Big goals made walkable; milestone wins feed the wins strip and domain scores.
- **Dependencies:** `lib/quests.js` (`SEED_QUESTS`, `questProgress`, `nextMilestone`), `screens/TodayScreen.jsx` (`CampaignCard`/`MissionsCard`), `components/ObjectMenu`, `lib/aiActions`, `lib/useLongPress`. State: `lifeos:quests`.
- **Related screens:** Command (`MissionsCard`); feeds Map domain scores and wins.
- **Status:** Live; seed campaigns are placeholder content.

## 7. Goal Decomposition (Goal Decomposer)

- **What it does:** Name a big goal + pick a Life-Map domain → `/api/decompose` returns strict JSON `{title, why, milestones[]}` (a 3–6-step sequenced progression, last step = goal achieved). User can edit/add/delete milestones, then save as a real campaign. Deterministic scaffold when AI is unavailable.
- **Why it exists:** Turns a vague aspiration into a concrete, ordered path coached "like a world-class coach who has taken people to this exact outcome."
- **User value:** Instant, editable roadmap that becomes a tracked campaign on Command.
- **Dependencies:** `GoalDecomposer.jsx`, `api/decompose.js`, `lib/api`, `lib/quests` (`LIFE_MAP_DOMAINS`).
- **Related screens:** Command (New Goal → sheet); also exposed inline via campaign ObjectMenu (`decomposeText` in `lib/aiActions`).
- **Status:** Live (AI on; key set).

## 8. Skill Tree & Disciplines (Movement OS)

- **What it does:** Six disciplines (gymnastics, tricking, calisthenics, acro, parkour, ninja) each with a tiered skill tree (Foundation→Developing→Advanced→Elite), per-skill cue, editable status (locked/active/done) and % mastery. Tap-to-edit nodes; prerequisite awareness; readiness gates per tier; mastery-time estimates ("~N weeks left"); "closest breakthrough" and "about to unlock" logic.
- **Why it exists:** A research-grounded progression engine so training targets the next real step, respecting prerequisites.
- **User value:** A clear, editable map of where the athlete is and what's next across all disciplines.
- **Dependencies:** `data.js` (`SKILLS`, `DISCIPLINES`), `coaching.js`, `screens/TrainingHQ.jsx` (`SkillTree`, `SkillNode`, `ProgressionHero`, `MovementPyramid`), `lib/mission.js` (`TIER_META`, `masteryEstimate`, `prereqFor`, `upcomingUnlocks`, `nextBreakthrough`). State: `lifeos:skills:v2`.
- **Related screens:** Move/Perform; the athlete domain on Map summarizes it.
- **Status:** Live; skill content is seed/placeholder, user-editable.

## 9. Drills & Fundamentals Tracking

- **What it does:** Per-discipline tier DRILLS (each with cue, measurable gate, common fault) presented as an ordered teaching sequence; cross-discipline athletic FOUNDATIONS (wrist, shoulder, spine, hips, straight-arm, pull balance, posterior chain, core, landing, capacity); and deep `FUNDAMENTALS_BY_DISCIPLINE` (the science-grounded bedrock — set/block/twist mechanics, air awareness, landing durability, etc.). Per-user drill/fundamental progress is tap-to-cycle (todo→working→done) stored in `lifeos:trackables`.
- **Why it exists:** Separates "knows tricks" from "elite" — and catches the most-skipped pillars (landing, mobility, pull balance).
- **User value:** Coach-grade drill progressions with the cue that matters and the standard to advance.
- **Dependencies:** `coaching.js` (`DRILLS`, `FOUNDATIONS`, `FUNDAMENTALS_BY_DISCIPLINE`, `drillsFor`, `fundamentalsFor`), `screens/TrainingHQ.jsx` (`FundamentalsPanel`, `TrackBtn`). State: `lifeos:trackables`.
- **Related screens:** Move/Perform; feeds the Coach context.
- **Status:** Live; the knowledge base is rich and real (not placeholder).

## 10. AI Coach — Session Builder (CoachSheet)

- **What it does:** "Build my session." Pick focus discipline + duration → builds context from skill tree, recent sessions, readiness, blindspots, and concrete drills/fundamentals → `/api/coach` designs today's session (prep/mobility, primary skill, supporting strength, cool-down, a blindspot note). Always-on "blindspots your coach is watching" panel. Logs the session on completion. Deterministic builder fallback.
- **Why it exists:** Programs the right session for *today's* body while actively catching blindspots so weaknesses don't become plateaus/injuries.
- **User value:** A personalized, expert session in one tap, scaled to readiness.
- **Dependencies:** `CoachSheet.jsx`, `api/coach.js`, `coaching.js` (`analyzeBlindspots`, `drillsFor`, `fundamentalsFor`), `lib/api`, `lifeos:sessions`.
- **Related screens:** Move/Perform (Coach action + per-skill "generate a session").
- **Status:** Live (key set).

## 11. Blindspot Analyzer

- **What it does:** Reads skill tree + recent (21-day) sessions + readiness and flags gaps: no recent training, neglected disciplines, shaky foundations under advanced work, training monotony, under-recovery, plus an always-on rotating foundation nudge. Each flag has severity + detail + fix.
- **Why it exists:** An elite coach's job is catching what's holding you back, not chasing flashy skills.
- **User value:** Honest, specific "here's your weak link and the fix" guidance.
- **Dependencies:** `coaching.js` (`analyzeBlindspots`).
- **Related screens:** CoachSheet (panel), WeekPlanSheet, Companion (context), used by Move.
- **Status:** Live.

## 12. Periodization — Plan My Week (WeekPlanSheet)

- **What it does:** Pick training days (3–6) + priority discipline → optional AI personalization via `/api/coach` (mode `week`) producing a periodized microcycle; always shows the proven `WEEK_TEMPLATE` (day-by-day with impact tags) and the `PROGRAMMING_PRINCIPLES` behind it.
- **Why it exists:** Great single sessions still fail without smart weekly structure (skill/power fresh, alternate impact, mobility daily, real recovery, deloads).
- **User value:** A sound, personalized training week with the reasoning exposed.
- **Dependencies:** `WeekPlanSheet.jsx`, `api/coach.js`, `coaching.js` (`WEEK_TEMPLATE`, `PROGRAMMING_PRINCIPLES`, `analyzeBlindspots`), `lib/api`.
- **Related screens:** Move/Perform (Week action).
- **Status:** Live.

## 13. Training Session Logging & Phase/Radar

- **What it does:** Log a session (discipline, duration, intensity) from the LogSessionSheet, the Coach, or the Companion. An editable training-phase card (phase label/name, day N/90 with progress) and an editable Body Radar (current vs goal across Strength/Power/Skill/Mobility/Endurance/Recovery).
- **Why it exists:** Sessions are the raw signal for blindspots, recommendations, reviews, and wins; the radar/phase give a felt sense of the macro.
- **User value:** Lightweight logging that powers the whole intelligence layer.
- **Dependencies:** `screens/TrainingHQ.jsx` (`LogSessionSheet`, `BodyRadar`), `components/atoms` (`RadarChart`). State: `lifeos:sessions`, `lifeos:training`.
- **Related screens:** Move/Perform; sessions feed Weekly/Monthly reviews and momentum.
- **Status:** Live.

## 14. Companion AI with Long-term Memory (The Intelligence)

- **What it does:** One always-present AI partner (floating orb, present on every screen; tap = open, long-press = voice). One mind with switchable hats (partner/chief/coach/creative/ona/podium/architect). Multi-turn synced conversation (`lifeos:companion`), context-aware (assembles a compact snapshot of Jay's whole world incl. mission, training, blindspots, ONA, brands, projects, inbox), and a distilled **long-term memory** (`lifeos:companion:memory`) updated every few exchanges so it grows with the user ("REMEMBERS YOU" badge). Can ACT in-app (event/session/capture/focus/email one-tap actions) — always propose-and-confirm. Falls back to `localAnswer` (keyword-routed answers from live data) without AI.
- **Why it exists:** A lifelong collaborator that knows the whole system and can both advise and act.
- **User value:** Ask anything, anywhere; it references real data, remembers you, and can do things in one tap.
- **Dependencies:** `Companion.jsx`, `api/companion.js`, `lib/api`, `lib/voice`, `lib/mission` (`snapshot`/`generateMissions`/`localAnswer`), `coaching` (`analyzeBlindspots`), `useSyncedState`. State: `lifeos:companion`, `lifeos:companion:memory`, `lifeos:voicereplies`.
- **Related screens:** Everywhere (orb); Ask bar on Command.
- **Status:** Live (key set).

## 15. Voice / Hands-free Loop

- **What it does:** Speech-to-text (Web Speech API) + text-to-speech (`speechSynthesis`), no key/server. Powers the Companion's hands-free loop (speak → transcribe → answer → speak back → listen again) and Quick Capture dictation. Strips markdown/emoji for natural speech; safe no-op where unsupported (e.g. iOS Safari STT limitations).
- **Why it exists:** Frictionless capture/conversation while training or moving.
- **User value:** Talk to the system instead of typing.
- **Dependencies:** `lib/voice.js`. Used by `Companion.jsx`, `components/QuickCapture.jsx`.
- **Related screens:** Companion, Quick Capture (FAB long-press), Ask bar mic.
- **Status:** Live where the browser supports the APIs.

## 16. Chief of Staff Brief (ChiefBrief)

- **What it does:** A morning brief card at the top of Command. Assembles today's calendar + readiness + capture inbox + one-thing + weekly focus + recent training → `/api/chief` (mode `brief`) writes a tight brief ending in the single highest-leverage action, plus up to 3 one-tap ACTIONS_JSON (event/email/note). Cached per day; action chips (triage inbox, plan-a-block inline composer, AI event→Google Calendar, AI email→mailto). Deterministic local brief fallback.
- **Why it exists:** Protect focus and surface the one thing that makes today a win.
- **User value:** A under-a-minute brief with one-tap follow-throughs.
- **Dependencies:** `ChiefBrief.jsx`, `api/chief.js`, `lib/actions` (deep links), `lib/api`. State: `lifeos:brief:<day>`.
- **Related screens:** Command.
- **Status:** Live.

## 17. Weekly Review

- **What it does:** Reads the week from history/sessions/captures/telemetry; shows days-active, avg readiness, sessions, minutes, an attention-allocation bar chart (captured thoughts by domain), a domain-balance check ("which domains went dark"), an optional AI reflection (`/api/chief` mode `review`), and captures one focus for next week (`lifeos:weeklyfocus`) with one-tap Google Calendar scheduling of the focus + dark domains.
- **Why it exists:** The heartbeat that keeps the system honest — see where attention actually went and pick next week's focus.
- **User value:** A 10-minute Sunday ritual that turns reflection into scheduled time.
- **Dependencies:** `WeeklyReview.jsx`, `api/chief.js`, `lib/telemetry`, `lib/actions`, `lib/api`. State: `lifeos:weeklyfocus`.
- **Related screens:** Map (growth domain), surfaced as a Sunday mission.
- **Status:** Live.

## 18. Monthly Upgrade Report

- **What it does:** Reflects on ~30 days of usage (telemetry + data). Surfaces deterministic improvement proposals (make triage a daily habit, protect a neglected domain, cross-train, build a recovery block, rethink a barely-used surface, prune empty folders, lock the Sunday review, capture more) plus an optional AI note (`/api/chief` mode `upgrade`). Accept/Dismiss each — accepting records a changelog entry and bumps a "LifeOS version"; nothing auto-executes.
- **Why it exists:** A safe self-improving loop — the app reflects on how it's used and proposes how to run life and the app better, while the user stays in command.
- **User value:** Monthly meta-coaching on the system itself; a visible changelog of accepted upgrades.
- **Dependencies:** `MonthlyUpgrade.jsx`, `api/chief.js`, `lib/telemetry`, `useSyncedState`, `lib/api`. State: `lifeos:upgrades`, `lifeos:upgradeDismissed`.
- **Related screens:** Map (growth domain).
- **Status:** Live.

## 19. Universal Capture & Triage

- **What it does:** A FAB on every screen opens Quick Capture (type or dictate, tag Idea/ONA/Dream/Task) → saved to the inbox (`lifeos:captures`). On Map, the triage view routes each capture to a Life domain (creating a note in the matching folder, marking it triaged with `routedAt`), or archive/delete. A "Recently routed" list and inbox-zero state. The Companion can also create captures via actions.
- **Why it exists:** Get every thought out of the head instantly; route it to where it belongs to keep the mind clean.
- **User value:** One-tap capture from anywhere; structured offloading that feeds folders, projects, and reviews.
- **Dependencies:** `components/QuickCapture.jsx`, `screens/LifeMapScreen.jsx` (`RouteRow`, routing), `App.jsx` (`addCapture`), `data` (`LIFE_DOMAINS`, `DOMAIN_ALIASES`, folder matching). State: `lifeos:captures`, `lifeos:folders`.
- **Related screens:** FAB (everywhere), Map (triage), Command (badge/brief).
- **Status:** Live.

## 20. Life Map & Balance Radar

- **What it does:** A living map of 8 life domains (Athlete, Business, Relationships, Health, Creativity, Learning, Adventure, Growth), each scored 0–100 from real activity with a one-line signal. A Life-Map viz + a Balance radar reads all eight as a single shape (lopsided web = where life is out of balance). Tapping a domain opens a `DomainSheet` with domain-specific tools (health readiness verdict, date-night planner, Learning Lab, Adventure Hub, athlete/business/creativity summaries with go-to-tab buttons, growth → reviews).
- **Why it exists:** Make whole-life balance legible and actionable, not just felt.
- **User value:** See at a glance where life is thriving vs neglected, then jump to act.
- **Dependencies:** `screens/LifeMapScreen.jsx`, `lib/quests.js` (`LIFE_MAP_DOMAINS`, `domainScores`, `alignmentScore`), `components/atoms` (`RadarChart`). State: `lifeos:journal`, `lifeos:learning`, `lifeos:adventure`, `lifeos:folders`.
- **Related screens:** Map; alignment shown on Command.
- **Status:** Live.

## 21. Learning Lab, Adventure Hub & Journal

- **What it does:** Lightweight list trackers inside domain sheets — Learning Lab (books/courses/skills/questions; mark LEARNED), Adventure Hub (trips/experiences/challenges; mark LIVED), and a free-form Journal on Map. These feed the Learning, Adventure, and Growth domain scores.
- **Why it exists:** Track the compounding inputs (learning, experiences, reflection) that the score model rewards.
- **User value:** A digital passport + study log + reflection space tied into the alignment system.
- **Dependencies:** `screens/LifeMapScreen.jsx` (`ListHub`, `DomainSheet`). State: `lifeos:learning`, `lifeos:adventure`, `lifeos:journal`.
- **Related screens:** Map.
- **Status:** Live.

## 22. Folders & Projects Workbench (BuildScreen / ContentStudio)

- **What it does:** A folder/project workspace (Studio). Folders carry a domain (routing target for captures), notes, and projects; projects have reorderable steps with completion. Build's "Workbench" surfaces all active projects across folders with next-action + due status, and a long-press AI ObjectMenu. Project next-actions with near deadlines feed the mission engine's content recommendations.
- **Why it exists:** A single place for everything being built, with the next move always visible.
- **User value:** Project momentum surfaced where decisions happen, with AI help inline.
- **Dependencies:** `screens/ContentStudio.jsx` (folders/projects), `screens/BuildScreen.jsx` (`Workbench`, `ProjectCard`), `lib/mission` (`recommendContent`), `components/ObjectMenu`. State: `lifeos:folders`.
- **Related screens:** Build (Studio + Workbench); Podium reads its folder.
- **Status:** Live.

## 23. ONA Business Hub (ONAHQ)

- **What it does:** The Obstacle Ninja Academy command hub. Editable header KPIs (members/MRR/NPS), a live GymDesk card, a sales pipeline with a per-stage mini-CRM of named people (add/advance/contact with stale-lead detection), a coach roster (grade/role/PL price/active), and an initiative list (P0–P2, %, due). The mission engine's `recommendOna` turns these into moves (call stale leads, check trials, win-back churn, push the top P0) with estimated $ impact.
- **Why it exists:** Run the gym as an engine — surface the next operational lever with metrics awareness.
- **User value:** Gym operations + pipeline + staffing in one editable hub that generates recommended moves.
- **Dependencies:** `screens/ONAHQ.jsx`, `data` (`ONA_STATS`/`SALES_STAGES`/`COACHES`/`INITIATIVES`), `lib/mission` (`recommendOna`). State: `lifeos:ona`, `lifeos:ona:live`.
- **Related screens:** Build (ONA segment); business domain on Map; Action Center.
- **Status:** Live UI; KPIs/pipeline are placeholder/manual until the live webhook is wired.

## 24. ONA Live Webhook (GymDesk → Zapier pipeline)

- **What it does:** GymDesk has no public REST API, so the supported path is GymDesk → Zapier → `/api/ona-webhook`. Zapier POSTs updated stats (members, active_members, mrr, nps, attendance_week, new_members_month, churn_month, visits_today; supports `inc` increments), shared-secret gated; the endpoint writes them into Jay's `app_state` row (`lifeos:ona:live`) via the Supabase service role; the ONA screen reads that key. The live card shows the freshest snapshot with a relative timestamp.
- **Why it exists:** Get real, near-live gym stats into the app without a GymDesk API.
- **User value:** Live members/MRR/churn on the ONA hub, driving real recommendations.
- **Dependencies:** `api/ona-webhook.js`, `@supabase/supabase-js` (service role), `screens/ONAHQ.jsx` (`LiveOnaCard`). Env: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ONA_WEBHOOK_SECRET`, `ONA_USER_ID`.
- **Related screens:** Build (ONA).
- **Status:** Built; **needs env vars** to go live (returns 503 "Pipeline not configured" until set).

## 25. Podium Hub

- **What it does:** The second company's command hub. Tap-to-edit KPIs (open orders, monthly revenue, in-build) and projects/notes pulled from the Podium folder. The Companion's "podium" hat acknowledges it isn't wired to live order data.
- **Why it exists:** Give Podium Creations its own surface alongside ONA.
- **User value:** A place to track equipment orders/builds (manually for now).
- **Dependencies:** `screens/BuildScreen.jsx` (`PodiumHub`, `PodiumStat`), reads the Podium folder. State: `lifeos:podium`.
- **Related screens:** Build (Podium segment).
- **Status:** **Largely a stub** — manual KPIs + folder read; no live data integration.

## 26. Content Studio (brands / hooks / pipeline / calendar)

- **What it does:** The creator workspace. Brand tiles + editor (status, weekly goal, %), a content pipeline (idea→plan→shoot→edit→schedule→posted), a Hook Bank (idea openers), a weekly posting calendar (tap-to-cycle slots), and the folders/projects system. The mission engine's `recommendContent` turns these into moves (batch clips for a behind brand, clear the edit queue, refill the hook bank, push near-deadline project steps).
- **Why it exists:** Keep the content cadence unbroken and convert content state into next moves.
- **User value:** One place to track brands, hooks, pipeline, and posting rhythm, with AI-recommended content moves.
- **Dependencies:** `screens/ContentStudio.jsx`, `data` (`BRANDS`/`PIPELINE_STAGES`/`HOOKS`), `lib/mission` (`recommendContent`). State: `lifeos:content`, `lifeos:folders`.
- **Related screens:** Build (Studio); creativity domain on Map; Action Center; Companion creative hat.
- **Status:** Live UI; brand/hook content is placeholder/seed.

## 27. Action Center (metrics → moves → mission)

- **What it does:** At the top of Build, converts ONA + content metrics into up to 4 recommended moves, each with a WHY and estimated impact, plus a one-tap "do today" that pushes the move into today's mission (dedup-guarded) with confetti/haptic feedback.
- **Why it exists:** V1 showed numbers; V2 turns every metric into a recommended action you can act on instantly.
- **User value:** The single highest-leverage business/content moves, one tap from the daily mission.
- **Dependencies:** `screens/BuildScreen.jsx` (`ActionCenter`), `lib/mission` (`recommendOna`, `recommendContent`), `App.jsx` (`addMission`), `lib/haptics`, `lib/telemetry`.
- **Related screens:** Build → Command.
- **Status:** Live.

## 28. Calendar / iCal Integration

- **What it does:** Connect a Google Calendar "secret iCal" link in Settings → the serverless `/api/calendar` fetches and parses the `.ics` server-side (no CORS), expands recurrence + EXDATE, converts to the user's timezone, and returns events. Today's events appear read-only on the Command timeline; a 14-day read-only CalendarSheet groups events by day; quick-add opens Google Calendar prefilled. SSRF-guarded to `calendar.google.com` only.
- **Why it exists:** Show real schedule context without OAuth, while creation/edits stay in Google.
- **User value:** Real calendar on the timeline + the brief, with safe prefilled add.
- **Dependencies:** `api/calendar.js`, `CalendarSheet.jsx`, `Settings.jsx` (icalUrl), `screens/TodayScreen.jsx` (timeline). State: `lifeos:settings.icalUrl`.
- **Related screens:** Command (timeline/brief), Settings, CalendarSheet.
- **Status:** Live (no key needed; just the iCal link).

## 29. Deep-link Actions (propose-and-confirm)

- **What it does:** All "irreversible" actions are handled via deep links — Google Calendar prefilled URLs and `mailto:` drafts — so the user confirms the create/send step in their own Google. No OAuth, no stored credentials. Used by the Chief brief actions, Companion event/email actions, Weekly Review scheduling, and the relationships date-night planner.
- **Why it exists:** Let AI act helpfully without holding sensitive credentials or auto-sending anything.
- **User value:** One tap pre-fills everything; the user stays in control of the final step.
- **Dependencies:** `lib/actions.js` (`googleCalendarUrl`, `mailtoUrl`, `openExternal`).
- **Related screens:** Command (ChiefBrief), Companion, WeeklyReview, Map (DomainSheet).
- **Status:** Live.

## 30. Interaction-first Long-press ObjectMenu System

- **What it does:** Any major card is an "interactive object": tap = primary action, long-press (440ms, scroll-tolerant, with haptic) = a contextual action sheet. AI actions run **inline** — thinking dots → the answer types itself out in place (typewriter), no jump to a chat window. Non-AI actions run and close. Wired on daily missions (approach/why/set-as-one-thing), campaigns (break down/blockers/plan/roadmap), skills (fastest path/limiter/generate session), and projects.
- **Why it exists:** Make the whole app feel like a direct, tactile surface where intelligence lives on the objects themselves.
- **User value:** Contextual AI help exactly where the object is, with a premium streaming feel.
- **Dependencies:** `components/ObjectMenu.jsx`, `lib/useLongPress.js`, `lib/aiActions.js` (`askCompanion`, `decomposeText`), `api/companion.js`/`api/decompose.js`.
- **Related screens:** Command, Move/Perform, Build.
- **Status:** Live.

## 31. Telemetry ("the mirror")

- **What it does:** A tiny, local-only ring buffer (max 600 events) records what the user opens/does (tab opens, mission toggles/adapts, segment switches, routes, etc.). Rolls up surface usage over N days. Feeds the Weekly Review ("you barely opened X") and Monthly Upgrade ("rethink the X surface"). Deliberately **not** synced — a private behavioral log.
- **Why it exists:** Reflect real usage back so the system (and the user) can see dead features and habits.
- **User value:** Honest "how am I actually using this" signal in the reviews.
- **Dependencies:** `lib/telemetry.js`. Used by `App.jsx`, `useMissionEngine`, `WeeklyReview`, `MonthlyUpgrade`, Map, Build. State: `lifeos:telemetry` (local only).
- **Related screens:** Weekly Review, Monthly Upgrade.
- **Status:** Live.

## 32. Cloud Sync (local-first)

- **What it does:** `useSyncedState` makes every key local-first (localStorage = instant source of truth, offline-safe) and syncs to Supabase `app_state(user_id,key,value)` when signed in — pulls the remote row once on login, then pushes every change (skipping no-op echoes), dispatching `lifeos:sync` on success. A shared in-memory store registry keeps same-key hooks in lockstep and a `storage` listener syncs across tabs.
- **Why it exists:** Fast, offline-capable UI with seamless per-user cloud persistence across devices.
- **User value:** Data is always saved, works offline, and follows the user across devices.
- **Dependencies:** `useSyncedState.js`, `usePersistentState.js`, `lib/supabase.js`, `auth/AuthProvider`.
- **Related screens:** Everywhere; surfaced by SyncBadge.
- **Status:** Live when Supabase env vars are set; localStorage-only otherwise.

## 33. Sync Badge

- **What it does:** A quiet "SAVED" pill that briefly appears when a sync completes (listens for `lifeos:sync`).
- **Why it exists:** Reassure the user their changes persisted without being noisy.
- **User value:** Calm confirmation of saves.
- **Dependencies:** `SyncBadge.jsx`, the `lifeos:sync` event from `useSyncedState`.
- **Related screens:** Global (screen host).
- **Status:** Live.

## 34. Authentication (Supabase)

- **What it does:** Email + password sign-in / sign-up via Supabase (`AuthProvider` + `LoginScreen`). Auth gate in `App` (loading orb → login → app). Safe no-op (localStorage-only, no login) when Supabase isn't configured. AI endpoints verify the session JWT so the Anthropic key can't be used as an open proxy.
- **Why it exists:** Per-user cloud sync and gated AI access.
- **User value:** Personal, synced account; secure AI usage.
- **Dependencies:** `auth/AuthProvider.jsx`, `auth/LoginScreen.jsx`, `lib/supabase.js`, `api/_auth.js`. (Note: header comments mention magic-link; the implementation is email/password.)
- **Related screens:** Login, Settings (sign out).
- **Status:** Live when configured.

## 35. AI Access Gate & Rate Limit

- **What it does:** `api/_auth.js` `gate()` verifies the caller's Supabase JWT against Supabase Auth and applies a best-effort per-user in-memory rate limit (40 req/min). All AI endpoints call it; `aiFetch` attaches the bearer token; unauthenticated calls 401 and clients fall back to local logic.
- **Why it exists:** Prevent the deploy URL's AI endpoints from being abused as a free LLM proxy.
- **User value:** (Indirect) protects the owner's API spend; keeps AI responsive.
- **Dependencies:** `api/_auth.js`, `lib/api.js`, all `api/*` AI handlers.
- **Related screens:** n/a (infrastructure).
- **Status:** Live.

## 36. PWA / Offline

- **What it does:** Installs as a PWA (service worker `/sw.js`, `manifest.webmanifest`, icons). Local-first state means the app works offline. `IOSDevice` drops the fake iPhone bezel and uses real device chrome when running on a phone / installed PWA.
- **Why it exists:** A native-feeling, installable, offline-capable phone app.
- **User value:** Add-to-home-screen, works without connectivity, feels native.
- **Dependencies:** `main.jsx` (SW registration), `public/sw.js` + `manifest.webmanifest` + icons, `components/IOSDevice.jsx`.
- **Related screens:** Global frame.
- **Status:** Live.

## 37. Error Boundary

- **What it does:** Catches render-time throws in a screen chunk and shows a recover card ("Try again" / "Reload") instead of white-screening; auto-resets when the active tab (`resetKey`) changes.
- **Why it exists:** One bad render shouldn't trap the whole app.
- **User value:** Resilience — a crash on one screen is recoverable and data is safe.
- **Dependencies:** `components/ErrorBoundary.jsx`, wrapped in `App.jsx` around the screen host.
- **Related screens:** All (wraps the lazy screen container).
- **Status:** Live.

## 38. Haptics

- **What it does:** Subtle Vibration-API feedback. A global listener taps on every `.pressable`; `celebrate()` plays a richer reward pattern (skill mastered, session logged, captured, milestone). Safe no-op where unsupported (iOS Safari).
- **Why it exists:** Make the PWA feel native and rewarding.
- **User value:** Tactile, satisfying interactions.
- **Dependencies:** `lib/haptics.js` (+ `lib/useLongPress` uses `navigator.vibrate` directly), installed in `main.jsx`.
- **Related screens:** Global.
- **Status:** Live on supporting devices.

## 39. Vibes — Glow / Calm Visual System

- **What it does:** Two themes toggled in Settings and applied via `document.documentElement.dataset.vibe`: CALM (default — Oura/Linear restraint, less noise) and GLOW (the original full command-center energy). Synced per user (`lifeos:vibe`).
- **Why it exists:** Let the user choose between quiet focus and high-energy HUD.
- **User value:** Personal aesthetic control of the whole app.
- **Dependencies:** `App.jsx` (vibe state/effect), `styles.css` (`[data-vibe]` themes), `Settings.jsx`.
- **Related screens:** Global; toggled in Settings.
- **Status:** Live.

## 40. Onboarding & Boot Splash

- **What it does:** A one-time first-run Onboarding (orients to the four surfaces + the Intelligence orb; gated by `lifeos:onboarded`) and a short cinematic Boot Splash (orb bloom + wordmark) on each launch.
- **Why it exists:** A considered, premium first open that gets out of the way.
- **User value:** Clear orientation + a polished launch feel.
- **Dependencies:** `Onboarding.jsx`, `BootSplash.jsx`, `App.jsx`. State: `lifeos:onboarded`.
- **Related screens:** Global overlays.
- **Status:** Live.

## 41. Settings & Data Export

- **What it does:** Account (email, sign out), the Calm/Glow toggle, Google Calendar iCal connect/update/clear, and a JSON export of all `lifeos:*` keys (full local backup), plus About.
- **Why it exists:** Account control, integration setup, and data ownership.
- **User value:** Own and back up your data; manage account and integrations.
- **Dependencies:** `Settings.jsx`, `auth/AuthProvider`, `components/Sheet`. State: all `lifeos:*` for export.
- **Related screens:** Settings sheet (from Command check-in / app shell).
- **Status:** Live.

## 42. Navigation Shell — Four Surfaces + FAB + Orb

- **What it does:** The app frame: a bottom TabBar (Command/Map/Move/Build) with per-tab badges (inbox count on Map), a floating capture FAB (tap = capture, long-press = voice capture), the floating Intelligence orb (tap = open, long-press = voice), lazy-loaded screen chunks with skeleton fallbacks, and tab-change telemetry.
- **Why it exists:** A strict, glanceable IA — four surfaces plus one omnipresent AI.
- **User value:** Fast, predictable navigation with capture and AI always one tap away.
- **Dependencies:** `components/TabBar.jsx`, `components/QuickCapture.jsx`, `Companion.jsx` (launcher), `App.jsx` (routing/lazy/Suspense).
- **Related screens:** Global.
- **Status:** Live.

---

## Appendix — Notable audit observations

- **Legacy endpoint:** `api/ai.js` (multi-persona single-turn proxy) exists but no current `src/` file routes to it; the live app uses `/api/companion`. Candidate for removal or documentation.
- **Repo hygiene:** `app/` contains ~90 stale `vite.config.js.timestamp-*.mjs` temp files that should be gitignored/cleaned.
- **Auth comment drift:** AuthProvider header says "magic-link" but implements email/password.
- **Seed vs real:** The coaching knowledge layer (`coaching.js`) is genuinely deep/real; most business/training *numbers* (`data.js`) are placeholders awaiting real input or the ONA live webhook.
