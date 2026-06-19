# JAM HQ / Life HQ — Screen Inventory

> **App:** JAM HQ (a.k.a. "Life HQ", formerly LifeOS V2) — a React PWA rendered inside a simulated iPhone frame (`components/IOSDevice.jsx`).
> **Owner:** Jay Martinez — movement athlete & coach; co-owns Obstacle Ninja Academy ("ONA") and Podium Creations; content creator; married to Chelsea.
> **Shell:** `App.jsx` is the auth gate + tab router + lazy-loaded sheet host. Four primary tabs (`Command`, `Map`, `Move`, `Build`) live in `components/TabBar.jsx`. A floating "+" FAB (Quick Capture) and a floating cyan orb (Intelligence/Companion) are present on every screen.
> **Design language:** Dark HUD aesthetic. Two visual "vibes" — `calm` (default) and `glow` — toggled in Settings, applied via `document.documentElement.dataset.vibe`.
> **Persistence:** Everything keyed under `lifeos:*` in localStorage via `useSyncedState`, optionally cloud-synced through Supabase (`auth/AuthProvider.jsx`). AI features call `/api/*` endpoints via `aiFetch`; every AI surface has a deterministic local fallback when no key is configured.

This document inventories **every** screen, tab, modal, sheet, and overlay, grouped into:
- **A. Boot / Auth**
- **B. Primary Tabs**
- **C. Sheets / Modals / Overlays**

---

## A. Boot / Auth

### A1. BootSplash
- **Component / file:** `BootSplash` (`BootSplash.jsx`)
- **Purpose:** Cinematic launch animation shown once per app launch. The orb blooms in, the "JAM HQ" wordmark reveals, a tagline rises, then the whole overlay lifts away into the app.
- **Features:** Animated orb (glow + two spinning rings + core), wordmark "JAM HQ", tagline "Mission control for an extraordinary life".
- **Inputs:** None (no user input; purely time-driven).
- **Outputs:** A full-screen overlay (`z-index` over the app).
- **Interactions:** Auto-dismisses. Two timers: at 1650ms it adds the `boot-leaving` class; at 2150ms it calls `onDone()`, which sets `booting=false` in `MainApp`, unmounting the splash.
- **Navigation:** Reveals whatever `MainApp` is rendering underneath (default `TodayScreen`). Mounted last in `MainApp` so it overlays everything: `{booting && <BootSplash onDone={() => setBooting(false)} />}`.

### A2. Auth loading state
- **Component / file:** inline in `App()` (`App.jsx`)
- **Purpose:** Shown while Supabase resolves the session (`configured && loading`).
- **Features:** Spinning conic-gradient orb + "JAM HQ" wordmark inside the iPhone frame.
- **Inputs:** None.
- **Outputs:** Loading screen.
- **Interactions:** None; transitions automatically once `loading` is false.
- **Navigation:** → `LoginScreen` if no session, → `MainApp` if a session exists. If Supabase is **not** configured, this state never appears and the app runs straight on localStorage (no login).

### A3. LoginScreen
- **Component / file:** `LoginScreen` (default export) (`auth/LoginScreen.jsx`)
- **Purpose:** Email + password sign-in / sign-up. Only shown when Supabase is configured **and** there is no session.
- **Features:** Branded card (HUD ticks, gradient sparkles badge, "JAM HQ" wordmark), mode subtitle ("WELCOME BACK" / "CREATE YOUR ACCOUNT"), email field, password field, primary CTA, mode-toggle link, inline error + notice text.
- **Inputs:** Email (text), Password (password, Enter submits), tap CTA, tap "SIGN IN / CREATE ONE" toggle.
- **Outputs:** Auth result. On sign-up where email confirmation is still on, shows a yellow notice telling Jay to turn off confirmation in Supabase or check his inbox. On error, shows the message in red.
- **Interactions:** `submit()` calls `signInWithPassword` or `signUp` from `useAuth()`. Toggle switches `mode` between `signin`/`signup` and clears messages.
- **Navigation:** On success, `onAuthStateChange` (in `AuthProvider`) swaps the gate to `MainApp`. No explicit navigation in this component.

### A4. Onboarding
- **Component / file:** `Onboarding` (`Onboarding.jsx`)
- **Purpose:** First-run welcome overlay. Orients Jay to the four surfaces + the Intelligence, then gets out of the way. Shown when `lifeos:onboarded` is false (`!onboarded && <Onboarding .../>`).
- **Features:** Brand block (animated orb, gradient "JAM HQ" wordmark, mission copy), five highlight cards (each = icon tile + title + body):
  1. **Command** (cyan, `IconTarget`) — "The cockpit. Your daily mission, alignment score, missions, and wins."
  2. **Map** (gold, `IconBrain`) — "A living map of 8 life domains, each scored from real activity."
  3. **Move** (green, `IconBolt`) — "The Movement OS: identity meters, the movement pyramid, mastery roadmaps."
  4. **Build** (red, `IconTrendUp`) — "ONA, Podium, and the Creator Studio with an Action Center."
  5. **Intelligence** (teal, `IconSparkles`) — "One AI partner, many hats — open it anywhere with the orb."
  - CTA: "Let's build →"; footer hint: "Capture with the + button from anywhere".
- **Inputs:** Tap the CTA.
- **Outputs:** Full-screen scrolling overlay (`z-index: 300`).
- **Interactions:** CTA fires `onDone`, which sets `lifeos:onboarded = true`, unmounting the overlay.
- **Navigation:** Reveals the underlying app (default Command tab).

---

## B. Primary Tabs

The tab bar (`components/TabBar.jsx`) shows four tabs plus a "+" FAB. Internal tab ids vs. labels:

| Tab id (`tab` state) | Label shown | Component | Color |
|---|---|---|---|
| `today` | **Command** | `TodayScreen` | cyan `#45B7E8` |
| `life` | **Map** | `LifeMapScreen` | gold `#E9C46A` |
| `perform` | **Move** | `PerformScreen` (= `TrainingHQ`) | green `#34D399` |
| `build` | **Build** | `BuildScreen` | red `#FF6B5B` |

The **Map** tab carries a numeric badge equal to the count of untriaged captures (`badges={{ life: inboxCount }}`). The Intelligence has no tab — it lives on the floating orb everywhere.

---

### B1. Command (tab id `today`) — `TodayScreen.jsx`
- **Purpose:** The operating system's front door / cockpit. In one glance: what matters most today, what to do next, what can wait, and how the campaign is going. Strict hierarchy L1 (mission) → L2 (check-in + momentum) → L3 (brief + timeline).
- **Cards / sections (top to bottom):**
  1. **MissionCard** (L1) — greeting (`Good morning/afternoon/evening, Jay`), real date, READY readiness number, streak badge, a **RadialGauge** ALIGN score (alignment), "Today's mission" with a `done/total · time-estimate` line, a **re-plan** sparkles button, a progress bar, the mission list, and a "+ SET YOUR ONE THING" inline editor when no One Thing is set. Shows "MISSION COMPLETE" when all done. Includes a "RE-PLANNED FOR READINESS" flash badge when the engine adapts.
  2. **AskBar** — "Ask your AI anything…" door to the Intelligence, with a mic button (opens Companion in voice mode).
  3. **MissionsCard** — the long campaigns ("Missions" / quests). Header shows active campaign count + "NEW GOAL" button. Each campaign is a `CampaignCard`.
  4. **GoalDecomposer** (mounted here, opened by "NEW GOAL") — see C2.
  5. **CheckInCard** (L2) — readiness number + 7-day trend, a settings (sliders) button, and four `StateMeter`s (Energy, Focus, Body, Mood). Collapsible; defaults open until checked in.
  6. **MomentumStrip** (L2) — streak number + 14-day momentum: a Sparkline and a 14-cell heatmap.
  7. **WinsStrip** — "Recent wins" (only if any), pulled from `recentWins()`.
  8. **ChiefBrief** (L3) — the Chief of Staff morning brief (see below; component `ChiefBrief.jsx`).
  9. **TimelineCard** (L3) — "Later today": merged manual + synced calendar blocks, collapsible, with add-block form and a "Calendar" button.
- **Inputs:**
  - Tap a mission checkbox → toggle done (haptic + confetti on completing the last one).
  - Tap a mission body → navigate to its screen (`onGoTab(m.go)`), except `focus` (One Thing) which stays.
  - **Long-press a mission** → opens the mission **ObjectMenu** (see ObjectMenu, C-section). Mission actions: *How should I approach this?* (AI), *Why does this matter?* (AI), *Set as my One Thing* (local).
  - Tap re-plan (sparkles) → `onRegenerate` regenerates the day's missions.
  - "+ SET YOUR ONE THING" → inline text input (Enter saves) → sets `oneThing`.
  - Tap a campaign → expand/collapse its roadmap; tap a milestone → toggle done (haptic).
  - **Long-press a campaign** → campaign **ObjectMenu**. Actions: *Break into next actions* (AI decompose), *Analyze blockers* (AI), *Generate a plan* (AI), *View roadmap* (local, expands it).
  - Tap "NEW GOAL" → opens GoalDecomposer.
  - Check-in meters (StateMeter) → set energy/focus/body/mood (also sets `checkedIn`, which drives adaptive re-rank).
  - Check-in sliders button → opens Settings.
  - Timeline: tap header → expand; "Block" → inline add form (time + label + category pills Body/Create/Train/ONA/Acro/Focus); delete (×) a manual block; "Calendar" → opens CalendarSheet.
  - ChiefBrief: refresh, expand/collapse, action chips (Triage N → Map, Plan a block → inline composer, AI-proposed event/email chips).
- **Outputs:** Alignment score, readiness, streak, momentum heatmap + sparkline, mission progress, campaign progress %, recent wins, the daily brief, timeline blocks (with `· SYNCED` indicator when calendar connected).
- **Data in/out:** Reads `missionState` (daily meters + One Thing + timeline), `missions`/`doneIds`/`adaptedAt` (from the Mission Engine), `momentum`/`streak`/`trend` (history math), `icalUrl`. Owns `lifeos:quests` (SEED_QUESTS), computes `alignmentScore()`/`domainScores()`/`recentWins()` locally, fetches today's real calendar events from `/api/calendar`.
- **Navigation destinations:** Companion (Ask bar / mission AI), GoalDecomposer, Settings, CalendarSheet, and via `onGoTab`: Move (`perform`), Map (`life`), Build (`build`).

---

### B2. Map (tab id `life`) — `LifeMapScreen.jsx`
- **Purpose:** "A living map of who you're becoming." Eight life domains orbit a center node ("JAY") in an SVG ecosystem; each node's ring shows its live score. Below the map are the daily "mind tools" — capture Inbox and Journal.
- **Cards / sections:**
  1. **SectionHead** — "LIFE MAP".
  2. **LifeMapViz** — orbital SVG: center "JAY" + alignment number, 8 domain nodes (Athlete, Business, Relationships, Health, Creativity, Learning, Adventure, Growth), each with emoji, score ring, score number, and label. Connection lines between nodes. "tap a domain to enter it."
  3. **BALANCE** card — a **RadarChart** ("The shape of your life") of the same 8 domains read as one shape.
  4. **View toggle** — Inbox / Journal segmented control (Inbox shows a count).
  5. **Inbox view** — untriaged captures, each with tag dot, text, tag+date meta, delete, and a **RouteRow** (Route → domain chips with a starred suggestion based on tag, or Archive). "INBOX ZERO" empty state. A "Recently routed" list of the last 6 triaged captures.
  6. **Journal view** — a journal input (Enter adds) + reversed list of entries (last 30) with relative dates.
  7. **DomainSheet** (opens on tapping a node) — per-domain panel (see C-section / below).
- **Inputs:**
  - Tap a domain node → opens that domain's **DomainSheet**.
  - Toggle Inbox/Journal.
  - Inbox: delete a capture (trash), tap "Route" → pick a domain chip (routes it into a folder note + marks triaged), tap "Archive".
  - Journal: type an entry, Enter/+ to add.
- **Outputs:** 8 live domain scores, alignment score, a radar shape, inbox count, recently routed list, journal entries.
- **Data in/out:** Reads `captures` (and writes status/domain on route/archive/delete), `readiness`, `trend`, `history`. Owns `lifeos:journal`, `lifeos:folders` (SEED_FOLDERS), `lifeos:learning`, `lifeos:adventure`. Routing writes a note into the matching folder (creating it if missing). Scores via `domainScores()`/`alignmentScore()`.
- **Navigation destinations:** DomainSheet (per domain). Domain sheets contain "GoBtn"s and ritual buttons that call `onClose()` then `onGoTab` (`perform`/`build`) or `onOpenReview` (WeeklyReview) / `onOpenUpgrade` (MonthlyUpgrade). The Map tab badge equals inbox count.

#### B2a. DomainSheet (per-domain panels, inside LifeMapScreen)
Each of the eight nodes opens a `Sheet` with a domain-specific body:
- **Health** — readiness verdict (Green light / Steady / Recover) with the number, trend vs 7-day, and a line pointing to the Command check-in.
- **Relationships** — "Plan date night" button (opens Google Calendar prefilled), plus shared "Wife & I" folder notes (or empty copy).
- **Learning** — a **ListHub** "Learning Lab": add/toggle/delete items, "LEARNED" section.
- **Adventure** — a **ListHub** "Adventure Hub": "LIVED" section (digital passport).
- **Athlete** — mastery count across disciplines + a "Open Movement OS" button → Move tab.
- **Business** — ONA Members / MRR / Initiatives stats + "Open Build · ONA + Podium" button → Build tab.
- **Creativity** — active brands with progress bars + "Open Creator Studio" button → Build tab.
- **Growth** — copy + two ritual buttons: "WEEKLY REVIEW" (→ WeeklyReview) and "UPGRADE" (→ MonthlyUpgrade).

---

### B3. Move (tab id `perform`) — `TrainingHQ.jsx` (exported as `PerformScreen`)
- **Purpose:** The Movement OS / progression engine. "How close am I to the athlete I want to become?" Identity meters, the movement pyramid, mastery roadmaps toward world-class.
- **Cards / sections (top to bottom):**
  1. **ProgressionHero** — "Movement identity / HYBRID ATHLETE", LEVEL (mastered count) + % toward world-class, readiness number. Progress bar. A collapsible "WHO I'M BECOMING" list of identity meters (one per discipline, e.g. "Elite Gymnast", with a % bar). A "Closest breakthrough" tappable card (→ Coach) and an "ABOUT TO UNLOCK" line.
  2. **Action row** — three buttons: **Coach** (→ CoachSheet), **Log** (→ LogSessionSheet), **Week** (→ WeekPlanSheet).
  3. **MovementPyramid** — collapsible SVG pyramid of four layers (L4 Skills → L3 Disciplines → L2 Capabilities → L1 Foundations), each with a computed score; expandable per-layer breakdown bars.
  4. **SKILL TREES** — discipline picker (horizontal scroll of 6 disciplines, each with done/total), then the active discipline's **SkillTree**: a "biggest limiter" line, a **FundamentalsPanel** (collapsible pillars w/ TRACK buttons), and tier groups (Foundation/Developing/Advanced/Elite) of **SkillNode**s. Mastered skills fold into one line per tier.
  5. **WorkingOnPanel** — "Your current edges / WORKING ON · N": every active skill + every drill/fundamental marked WORKING, in one list.
  6. **Training phase** card — editable phase label/name, day X/90 stepper, sessions-logged count, phase progress bar.
  7. **Body Radar** card — `BodyRadar` SVG (6 axes, current vs goal), with an EDIT mode of per-axis steppers.
- **Inputs:**
  - Tap discipline chips to switch the focused tree (remembered in `lifeos:lastdisc`).
  - Tap a **SkillNode** → expand its detail/editor (cue, prereq/unlock info, mastery weeks + readiness gate, status pills Locked/Active/Mastered, "COACH ME", ± percent steppers, tier drills with TRACK buttons).
  - **Long-press a SkillNode** → skill **ObjectMenu**. Actions: *Fastest path to mastery* (AI), *Analyze my limiter* (AI), *Generate a session* (local → Coach), *Review drills & detail* (local → expand).
  - Tap TRACK on any drill/fundamental → cycles `todo → working → done` (haptic on done).
  - Coach / Log / Week buttons open their sheets.
  - Training phase: EDIT toggles inline editing (label, name, day stepper). Body Radar: EDIT toggles per-axis ± steppers.
- **Outputs:** Overall mastery %, level, identity meters, pyramid scores, per-discipline done/total, working-on list, training phase progress, body radar shape, session count (`BASE_SESSIONS` 38 + logged).
- **Data in/out:** Owns `lifeos:skills:v2` (SKILLS), `lifeos:trackables`, `lifeos:training`; reads/writes `lifeos:sessions` (shared with the shell so Companion can also log). Reads `readiness` prop.
- **Navigation destinations:** CoachSheet, WeekPlanSheet, LogSessionSheet (all bottom sheets), and skill ObjectMenu (inline AI + Coach).

---

### B4. Build (tab id `build`) — `BuildScreen.jsx`
- **Purpose:** Business, content, projects, operations. Opens with the **Action Center** (metrics → recommended moves), then a cross-folder **Workbench**, then one of three segment workspaces (ONA / Podium / Studio).
- **Cards / sections:**
  1. **SectionHead "BUILD"** with a 3-way segment toggle (ONA / Podium / Studio).
  2. **ActionCenter** — up to 4 recommended moves (`recommendOna` + `recommendContent`), each with title, why, an `IMPACT` line, and a "DO TODAY / ON IT" button that pushes it into today's mission (`onAddMission`).
  3. **Workbench** — "What's on your plate": every active project across every folder (ONA/Podium/Studio/personal), sorted by due-urgency then progress, each as a **ProjectCard** with surfaced next step + due badge.
  4. **Segment body** — `ONAHQ embedded` / `PodiumHub` / `ContentStudio embedded` based on the selected segment.
- **Inputs:**
  - Tap a segment chip (ONA/Podium/Studio) → swap the workspace.
  - ActionCenter "DO TODAY" → adds the rec as a mission (haptic + telemetry); becomes "ON IT".
  - **Long-press a Workbench ProjectCard** → project **ObjectMenu**. Actions: *Summarize progress* (AI), *Generate next steps* (AI), *Surface blockers* (AI).
  - All segment-specific inputs (see ONA HQ, Podium Hub, Content Studio below).
- **Outputs:** Recommended moves, active-project plate, and the selected workspace's full UI.
- **Data in/out:** `onAddMission` + `missionIds` from the shell; everything else read via `snapshot()` and owned by the embedded workspaces.
- **Navigation destinations:** project ObjectMenu (inline AI); embedded workspaces with their own sheets (e.g. Studio's FolderSheet).

#### B4a. ONA HQ (`screens/ONAHQ.jsx`, embedded in Build's ONA segment)
- **Purpose:** Command hub for Obstacle Ninja Academy (Orlando). Fully editable + cloud-synced mini-business OS.
- **Sections:** Hero stats (Members / MRR / NPS, tap-to-edit), **LiveOnaCard** (live GymDesk metrics via Zapier `/api/ona-webhook`, hidden until data arrives), **SalesPipeline** (a real mini-CRM: stages Leads/Trials/Closing/New; tap a stage to see people with phone, first/last visit, notes, days-silent flag, one-tap CALL/TEXT/✓ TOUCHED/advance-stage, add person, rough-count fallback), **CoachRoster** (coaches with avatar, role, $/hr, grade A–C, active toggle; full CRUD + a bench strip), **InitiativeList** (P0/P1/P2 initiatives with %, due date; full CRUD).
- **Inputs:** Edit stats; manage pipeline people; CALL/TEXT (tel:/sms: links); advance stages; add/edit/delete coaches & initiatives.
- **Data:** `lifeos:ona` (+ `lifeos:ona:live`).

#### B4b. Podium Hub (`PodiumHub` inside BuildScreen)
- **Purpose:** Command hub for Podium Creations (premium obstacle equipment).
- **Sections:** Hero ("PODIUM") with three tap-to-edit KPIs (Open orders / Revenue (mo) / In build), Projects list (pulled from the Podium folder), Latest notes.
- **Inputs:** Tap KPIs to edit; projects/notes flow in from the Podium folder (route captures there from the Map inbox).
- **Data:** `lifeos:podium` + the Podium folder from `snapshot()`.

#### B4c. Content Studio (`screens/ContentStudio.jsx`, embedded in Build's Studio segment)
- **Purpose:** Creator studio — folders/spaces, hook bank, posting calendar, projects.
- **Sections:** Hero ("CREATE · BUILD · TRACK", folder/project counts), **FoldersSection** (2-col grid of folders/spaces; tap to open **FolderSheet**), **HookBank** ("VIRAL OPENERS" — tap to copy, full CRUD), **PostingCalendar** (current 7-day strip, tap a day to cycle scheduled-post count).
- **FolderSheet** (per folder): rename, color/emoji/pin, Notes (add/edit/delete; import from captures), and an embedded **Projects** system (projects with reorderable steps, due dates, brand tags, full CRUD), plus delete-folder (with confirm).
- **Data:** `lifeos:content` (hooks, calendar), `lifeos:folders` (shared with the Map and Podium).

---

## C. Sheets / Modals / Overlays

All bottom sheets use the shared `Sheet` component (`components/Sheet.jsx`) — a scrim + drag-handle sheet that animates out before unmounting. Modals in `App.jsx` are lazy-loaded and only mount when opened.

### C1. Companion — The Intelligence (`Companion.jsx`)
- **Purpose:** "One mind, different hats." A single AI partner that knows Jay's whole world, keeps one continuous synced conversation, can ACT (calendar/email/session/capture/focus) on a propose-and-confirm basis, and grows a long-term memory of Jay. Opened from the floating orb (everywhere), the Command Ask bar, or any mission/screen.
- **Two pieces:**
  - **CompanionLauncher** — the floating cyan orb (bottom-left). **Tap** opens the Companion; **long-press** (450ms) opens it straight into voice mode.
  - **Companion** — the conversation sheet.
- **Features:** Header (active mode hint + "JAM INTELLIGENCE" + a "REMEMBERS YOU" badge when memory exists), Voice on/off toggle (TTS), CLEAR conversation, close. A **hats** row of 7 modes: Partner, Chief, Coach, Creative, ONA, Podium, Architect. Conversation thread (user bubbles + AI bubbles, AI bubbles tag their mode), per-mode starter chips, "THINKING…" and "SPEAKING · TAP TO STOP" indicators. Inline **action buttons** on AI messages (event / session / capture / focus / email) that run via `onAction` (propose-and-confirm).
- **Inputs:** Type a message (Enter sends), tap a starter chip, tap the mic (speech-to-text; full hands-free loop when Voice is on), switch hats, tap an AI action button, toggle voice, clear, close.
- **Outputs:** AI replies (or a deterministic `localAnswer()` when no key), proposed actions, an evolving long-term memory (`lifeos:companion:memory`, distilled every ~5 exchanges).
- **Data in/out:** `lifeos:companion` (messages), `lifeos:companion:memory`, `lifeos:voicereplies`. Builds a compact global context (`buildGlobalContext()`) from the whole `snapshot()` and posts to `/api/companion`. Actions route up to `App.runAction` which prefills Google Calendar / mailto, logs a session, adds a capture, or sets the One Thing.
- **Navigation:** Acts in place; external actions open Google Calendar / mail in a new tab. Closing returns to the current screen.

### C2. Goal Decomposer (`GoalDecomposer.jsx`)
- **Purpose:** Name a big goal → AI breaks it into a sequenced, editable progression of milestones → save it as a real mission (quest). Works on a deterministic scaffold before the AI key is set.
- **Features:** Goal input, domain picker (the 8 LIFE_MAP_DOMAINS), "Break it down / Re-map" button, an editable milestone list (numbered, edit/delete/add), an AI-vs-scaffold indicator, "Add as mission →" save, and footer copy explaining it becomes a Command campaign.
- **Inputs:** Type the goal (Enter decomposes), pick a domain, edit/add/delete milestones, save.
- **Outputs:** A quest object pushed to `lifeos:quests` via `onAddQuest`, which then appears in Command's MissionsCard and feeds the daily mission engine.
- **Data in/out:** Calls `/api/decompose` (with light domain context), falls back to `buildLocal()`. Opened from Command's "NEW GOAL".
- **Navigation:** Closes back to Command; the saved campaign appears immediately.

### C3. CalendarSheet (`CalendarSheet.jsx`)
- **Purpose:** Read-only 14-day calendar view from the connected iCal feed, plus a quick-add that opens Google Calendar prefilled.
- **Features:** Header ("Next 14 days / CALENDAR"), add (+) toggle, quick-add form (title, date, start/end time → "Create in Google Calendar"), events grouped by day (TODAY/TOMORROW/weekday labels) with time + label, loading/error/empty states, "Connect Google Calendar in Settings first" prompt when no `icalUrl`.
- **Inputs:** Toggle add, fill quick-add form, create-in-Google-Calendar, close.
- **Outputs:** Grouped read-only event list; quick-add opens a Google Calendar template URL in a new tab.
- **Data in/out:** Fetches `/api/calendar?...&days=14`. Opened from Command's TimelineCard "Calendar" button.
- **Navigation:** External Google Calendar tab on quick-add; otherwise self-contained.

### C4. Settings (`Settings.jsx`)
- **Purpose:** Account, visual system, calendar connection, data export, and app info.
- **Features / sections:** **Account** (signed-in email + Sign Out, or "Running offline" when Supabase unconfigured), **Visual system** (CALM / GLOW vibe toggle), **Google Calendar** (paste secret iCal link → Connect/Update, disconnect ×, "● CONNECTED" indicator), **Your data** (Export my data → downloads a `life-os-backup-*.json` of all `lifeos:*` keys), **About** ("JAM HQ", tagline, "VERSION 1.0 · JAY MARTINEZ").
- **Inputs:** Sign out, toggle vibe, paste/connect/update/disconnect iCal, export data, close.
- **Outputs:** Auth sign-out, vibe change (applied app-wide), `icalUrl` set/cleared, JSON backup download.
- **Data in/out:** `useAuth()`, `lifeos:vibe`, `lifeos:settings.icalUrl`. Opened from Command's check-in sliders button.
- **Navigation:** Self-contained.

### C5. Weekly Review (`WeeklyReview.jsx`)
- **Purpose:** The Sunday heartbeat. Reads the week from history, sessions, triaged captures and usage telemetry; shows where attention actually went; asks for one focus for next week.
- **Features / sections:** Stat row (Days active /7, Readiness, Sessions, Minutes), **"Where your attention went"** (per-domain bars from routed captures), **Domain balance check** (lit/8, flags domains that went dark), **Reflection** (a data-built summary with an "AI REFLECT" button → `/api/chief mode=review`), **"One focus for next week"** input (saved to `lifeos:weeklyfocus`), **"Act on it"** chips (block focus time / plan a dark domain → Google Calendar prefilled).
- **Inputs:** AI Reflect, type the weekly focus, tap calendar-block chips, close.
- **Outputs:** Weekly stats, attention split, balance verdict, reflection text, saved weekly focus, prefilled Google Calendar events.
- **Data in/out:** Reads `lifeos:history`, `lifeos:sessions`, `lifeos:captures`, telemetry (`usageBySurface`); writes `lifeos:weeklyfocus`. Opened from Map → Growth domain → "WEEKLY REVIEW".
- **Navigation:** External Google Calendar on "Act on it"; otherwise self-contained.

### C6. Monthly Upgrade Report (`MonthlyUpgrade.jsx`)
- **Purpose:** The self-improving loop, made safe. JAM HQ reflects on how Jay used it this month and **proposes** improvements he can Accept or Dismiss. Nothing changes automatically — accepting records the decision to a changelog and bumps the "LifeOS version".
- **Features / sections:** Header ("Self-improvement · LifeOS v{version}" where version = 1 + accepted count), **"This month"** note (data-built, with "AI REFLECT" → `/api/chief mode=upgrade`), **Proposed upgrades** (deterministic proposals from the month's data — triage habit, protect a neglected domain, cross-train, recovery block, rethink a barely-used surface, prune empty folders, lock the weekly review, capture more — each with Accept / Dismiss), **"ALL CLEAR"** empty state, and an **Accepted changelog**.
- **Inputs:** AI Reflect, Accept a proposal, Dismiss a proposal, close.
- **Outputs:** Reflection text, accepted upgrades (`lifeos:upgrades` → changelog + version bump), dismissed list (`lifeos:upgradeDismissed`).
- **Data in/out:** Reads `lifeos:history`, `lifeos:sessions`, `lifeos:captures`, `lifeos:folders`, `lifeos:weeklyfocus`, telemetry; writes `lifeos:upgrades`/`lifeos:upgradeDismissed`. Opened from Map → Growth domain → "UPGRADE".
- **Navigation:** Self-contained.

### C7. Quick Capture (`components/QuickCapture.jsx`)
- **Purpose:** Frictionless capture from anywhere. Bottom sheet triggered by the "+" FAB.
- **Features:** Header ("Quick Capture / WHAT'S ON YOUR MIND?"), text input + mic (dictation) button, a "LISTENING · JUST TALK" recording strip with a waveform, four tag pills (IDEA / ONA / DREAM / TASK), a "Capture" button, footer hint, and a "CAPTURED" success state.
- **Inputs:** Type or speak the thought, pick a tag, tap Capture (Enter via the FAB long-press opens voice mode).
- **Outputs:** A capture object (`{id, ts, text, tag, color, time, status:'inbox'}`) saved to `lifeos:captures` via `onSave`; appears in the Map inbox and bumps the Map tab badge.
- **Data in/out:** Writes `lifeos:captures`. **Tap the "+" FAB** opens it normally; **long-press the FAB** opens it in voice mode.
- **Navigation:** Closes back to the current screen; the capture lands in Map's inbox.

### C8. Coach Sheet (`CoachSheet.jsx`)
- **Purpose:** "Build my session." An AI coach that reads the skill tree, recent sessions and readiness, then designs today's training. Deterministic builder fallback when no key.
- **Features:** Focus picker (Mixed + 6 disciplines), Time-available picker (30/45/60/90/120), "Build session / Regenerate" button, an always-on **Blindspots** panel ("Blindspots your coach is watching", severity-coded), the generated plan (AI or local), an AI-vs-local indicator, and a "Log this session" button.
- **Inputs:** Pick focus + duration, generate, expand/collapse blindspots, log the session, close.
- **Outputs:** A multi-section session plan; logging writes a session.
- **Data in/out:** Reads `skills`, `lifeos:sessions`, readiness; calls `/api/coach`, falls back to `buildLocal()`. Opened from Move's Coach button, the ProgressionHero breakthrough card, and skill nodes' "COACH ME" / ObjectMenu "Generate a session".
- **Navigation:** Logging closes the sheet; session appears in counts.

### C9. Week Plan Sheet (`WeekPlanSheet.jsx`)
- **Purpose:** "Plan my week." Periodization — shows a sound movement-athlete microcycle and can personalize it with AI.
- **Features:** Training-days picker (3–6), this-week's-priority picker (Balanced + 6 disciplines), "Personalize with AI" button, an AI plan block (when available), the recommended **microcycle** template (per-day cards, days beyond the chosen count softened), and a collapsible "The principles behind it" list.
- **Inputs:** Pick days + priority, personalize with AI, expand principles, close.
- **Outputs:** An AI-periodized week (when key set) and/or the proven template.
- **Data in/out:** Reads `skills`, readiness, blindspots; calls `/api/coach mode=week`, falls back to the visual `WEEK_TEMPLATE`. Opened from Move's "Week" button.
- **Navigation:** Self-contained.

### C10. Chief Brief (`ChiefBrief.jsx`) — embedded card on Command
- **Purpose:** The Chief of Staff morning brief at the top-middle of Command. Assembles today's calendar, readiness, capture-inbox and One Thing into a single glanceable brief ending in the one highest-leverage action. Caches per day.
- **Features:** Header ("Chief of Staff", AI/your-brief + date), refresh + collapse buttons, the brief text (AI or `buildLocal()`), an action row (Triage N → Map, Plan a block → inline composer, AI-proposed event/email chips), and an inline quick-event composer (title + time + duration → "Add to calendar", prefills Google Calendar).
- **Inputs:** Refresh, expand/collapse, action chips, fill + confirm the block composer.
- **Outputs:** A cached daily brief (`lifeos:brief:{day}`), timeline blocks added to Command, prefilled external calendar/mail.
- **Data in/out:** Calls `/api/chief mode=brief`; reads readiness/oneThing/calendarEvents/inbox/weeklyfocus.
- **Navigation:** "Triage" → Map tab; external Google Calendar / mail.

### C11. ObjectMenu — the long-press contextual AI layer (`components/ObjectMenu.jsx`)
- **Purpose:** The contextual action layer for every "interactive object." **Long-press** any major card and this sheet springs up with the verbs that make sense for it. AI actions run **inline** — thinking dots, then the answer types itself out right there (typewriter reveal), with no jump to a chat window.
- **Where it appears (long-press targets):**
  - **Command → mission rows** (MissionRow): *How should I approach this?* (AI), *Why does this matter?* (AI), *Set as my One Thing* (local).
  - **Command → campaign cards** (CampaignCard): *Break into next actions* (AI decompose), *Analyze blockers* (AI), *Generate a plan* (AI), *View roadmap* (local).
  - **Move → skill nodes** (SkillNode): *Fastest path to mastery* (AI), *Analyze my limiter* (AI), *Generate a session* (local → Coach), *Review drills & detail* (local → expand).
  - **Build → Workbench project cards** (ProjectCard): *Summarize progress* (AI), *Generate next steps* (AI), *Surface blockers* (AI).
- **Features:** Title + subtitle (object context), an accent color, a list of actions (AI actions show a sparkles glyph; local actions show a chevron), a "THINKING…" state, and a "result" state with the typed answer plus "Back" (and an optional primary "Use this" button).
- **Inputs:** Tap an action. Local actions (`ai:false`) run and close the sheet (navigate/edit/toggle). AI actions (`ai:true`) call `askCompanion()` / `decomposeText()` (`lib/aiActions.js` → `/api/companion`/`/api/decompose`) and stream the answer in place.
- **Outputs:** Inline AI answers; or a local side-effect (set One Thing, expand roadmap/detail, open Coach).
- **Long-press mechanics:** `lib/useLongPress.js` — 440ms hold, 10px move tolerance cancels, a 12ms haptic fires on trigger; a plain tap fires the object's primary action instead.

---

## Floating / always-present elements
- **TabBar** (`components/TabBar.jsx`) — four tabs (Command/Map/Move/Build) + a glass veil + the "+" FAB. Map shows the inbox badge.
- **"+" FAB** — bottom-right. Tap → Quick Capture; long-press (450ms) → Quick Capture in voice mode.
- **Companion orb** (`CompanionLauncher`) — bottom-left. Tap → Companion; long-press → Companion in voice mode.
- **SyncBadge** (`SyncBadge.jsx`) — cloud-sync status indicator at the top of the screen host.
- **IOSDevice frame** (`components/IOSDevice.jsx`) — simulated iPhone bezel + status bar + home indicator on desktop; full-bleed (real device chrome) on an actual phone / installed PWA.
- **ScreenLoading** (in `App.jsx`) — skeleton placeholders shown while a lazy screen chunk loads.
- **ErrorBoundary** (`components/ErrorBoundary.jsx`) — wraps the active screen, re-keyed on tab change.
