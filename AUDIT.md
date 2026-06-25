# JAM HQ — Audit Guide

A single entry point for auditing this app (built for an external reviewer, e.g. ChatGPT). It explains **what the app is, how it's built, what each part does, and how it behaves** — so the codebase can be assessed without running it. Every file reference is a relative link you can open on GitHub.

- **Repo:** https://github.com/jaycalii2141-del/Life-OS (public)
- **Live (login-gated):** https://life-os-ochre-one.vercel.app — runs behind Supabase auth, so it can't be browsed anonymously. To audit *behavior*, read this doc + the source.
- **App source lives in [`app/`](app/).** (The repo root also contains a separate, older standalone prototype — see "Two apps in this repo" below. The real product is the Vite app in `app/`.)

---

## 1. What it is

JAM HQ ("Life HQ") is a premium, AI-native personal operating system PWA for one user (Jay Martinez — movement athlete & coach, co-owner of Obstacle Ninja Academy "ONA" and Podium Creations, creator @jayy_martinez).

North star: **"a living headquarters that visually represents who you're becoming"** — an identity/evolution tracker, not a to-do app. The signature system is the **Becoming Engine**: one earned number ("Becoming"), a living identity artifact ("The Self"), and the rituals/celebrations around them.

---

## 2. Stack & architecture

- **Vite + React 18 SPA.** No router — a four-tab state machine in [`app/src/App.jsx`](app/src/App.jsx), rendered inside a simulated iPhone frame ([`app/src/components/IOSDevice.jsx`](app/src/components/IOSDevice.jsx)).
- **Four surfaces:** `today` = Command, `life` = Map, `perform` = Move, `build` = Build. Plus one ambient AI layer ("the Presence").
- **State:** local-first key–value document store under `lifeos:*` keys, synced per-user to a single Supabase table `app_state(user_id, key, value jsonb)` (RLS enforced). See [`app/src/useSyncedState.js`](app/src/useSyncedState.js) + [`app/src/usePersistentState.js`](app/src/usePersistentState.js).
- **AI:** Vercel serverless functions in [`app/api/`](app/api) call Anthropic (`claude-haiku-4-5`). The API key is server-side only; the browser attaches a Supabase JWT ([`app/src/lib/api.js`](app/src/lib/api.js), gated by [`app/api/_auth.js`](app/api/_auth.js)). Offline/un-authed, AI calls fall back to deterministic local logic.
- **Deploy:** Vercel, root dir `app/`, auto-deploys on push to `main`.
- **Deps are minimal:** `react`, `react-dom`, `@supabase/supabase-js`. No state library, no CSS framework (inline styles + one global stylesheet), **no test/lint tooling**.

---

## 3. Code map (start here)

| Area | Files |
|---|---|
| **Shell / orchestration** | [`app/src/App.jsx`](app/src/App.jsx) — auth gate, tab switch, command bar, and the single source of truth for Becoming, streak/freezes, momentum, history, daily Self-snapshots, milestone & ceremony detection |
| **Screens** | [`TodayScreen.jsx`](app/src/screens/TodayScreen.jsx) (Command), [`TrainingHQ.jsx`](app/src/screens/TrainingHQ.jsx) (Move), [`BuildScreen.jsx`](app/src/screens/BuildScreen.jsx), [`LifeMapScreen.jsx`](app/src/screens/LifeMapScreen.jsx) (Map), [`ONAHQ.jsx`](app/src/screens/ONAHQ.jsx), [`ContentStudio.jsx`](app/src/screens/ContentStudio.jsx) |
| **Engines (`lib/`)** | [`mission.js`](app/src/lib/mission.js) (the `snapshot()` hub + recommendations), [`becoming.js`](app/src/lib/becoming.js) (Becoming Index), [`level.js`](app/src/lib/level.js) (Life Level), [`quests.js`](app/src/lib/quests.js) (`domainScores`, campaigns), [`milestones.js`](app/src/lib/milestones.js), [`crossDomain.js`](app/src/lib/crossDomain.js), [`presence.js`](app/src/lib/presence.js), [`identity.js`](app/src/lib/identity.js), [`streak.js`](app/src/lib/streak.js), [`xp.js`](app/src/lib/xp.js), [`ceremony.js`](app/src/lib/ceremony.js), [`nudges.js`](app/src/lib/nudges.js) |
| **Signature components** | [`TheSelf.jsx`](app/src/components/TheSelf.jsx) (living identity artifact), [`BecomingTimeLapse.jsx`](app/src/components/BecomingTimeLapse.jsx), [`CeremonyLayer.jsx`](app/src/components/CeremonyLayer.jsx), [`XpLayer.jsx`](app/src/components/XpLayer.jsx), [`atoms.jsx`](app/src/components/atoms.jsx) (gauges/sparklines/radar) |
| **Setup** | [`SetupFlow.jsx`](app/src/SetupFlow.jsx) ("Make it yours" real-data calibration) |
| **AI endpoints** | [`app/api/companion.js`](app/api/companion.js), [`chief.js`](app/api/chief.js), [`coach.js`](app/api/coach.js), [`decompose.js`](app/api/decompose.js), [`calendar.js`](app/api/calendar.js), [`ona-webhook.js`](app/api/ona-webhook.js) |
| **Seed data** | [`app/src/data.js`](app/src/data.js) + `SEED_QUESTS` in [`quests.js`](app/src/lib/quests.js) — **placeholder values** (see caveats) |

---

## 4. The Becoming Engine (the heart — audit this closely)

All of these are computed from **real evidence the app records**, not self-report. The Becoming number is computed once in `App.jsx` and passed to every screen ("one true number").

1. **Becoming Index** ([`becoming.js`](app/src/lib/becoming.js)) — a daily 0–100 composite: `identity 50% + momentum 35% + today's action 15%`. `identity` = average of the eight domain scores; `momentum` = 7-day mission-completion history; `action` = today's score.
2. **Life Level** ([`level.js`](app/src/lib/level.js)) — monotonic cumulative XP from mission days, sessions, mastered/active skills, routed captures.
3. **The Self** ([`TheSelf.jsx`](app/src/components/TheSelf.jsx)) — an SVG aura whose **shape** = the eight facet scores, **glow** = Becoming, **edge color** = trend. Lives at the center of the Map and (recently) in the Command header.
4. **Domain scores** ([`quests.js`](app/src/lib/quests.js) `domainScores()`) — eight facets (athlete, business, relationships, health, creativity, learning, adventure, growth), each derived from a specific real source (skills mastery, ONA initiatives, content pace, readiness history, journaling, etc.).
5. **Becoming time-lapse** ([`BecomingTimeLapse.jsx`](app/src/components/BecomingTimeLapse.jsx)) — a scrubbable replay morphing The Self through daily snapshots (`lifeos:self-history`, which records all eight facet scores + trend per day). Recorder is in `App.jsx`.
6. **Identity milestones** ([`milestones.js`](app/src/lib/milestones.js)) — 13 named identity unlocks ("The Disciplined: you kept moving on a low-readiness day") computed from real thresholds; first run backfills silently, later crossings fire a ceremony; earned permanently with a date. Surfaced on the Map (card + sheet).
7. **Milestone-aware Presence** ([`presence.js`](app/src/lib/presence.js)) — the Command whisper names an identity unlock within reach (≥70%) and the move to finish it.
8. **Cross-domain insight** ([`crossDomain.js`](app/src/lib/crossDomain.js)) — reads the per-domain facet history and surfaces one pattern (trade-off / sharp slip / real climb), e.g. "Business is climbing while Relationships slipped." Shown on the Map.
9. **Ceremonies & XP** ([`ceremony.js`](app/src/lib/ceremony.js), [`xp.js`](app/src/lib/xp.js), [`CeremonyLayer.jsx`](app/src/components/CeremonyLayer.jsx), [`XpLayer.jsx`](app/src/components/XpLayer.jsx)) — event-driven reward layers for skill mastery, campaign completion, level-up, identity unlock, and closing the day.

---

## 5. State & data model

Everything is a `lifeos:*` key (local-first, Supabase-synced). Notable keys:

| Key | Holds |
|---|---|
| `lifeos:daily:YYYY-MM-DD` | today's check-in (energy/focus/body/mood), one-thing, timeline |
| `lifeos:history` | per-day `{score, readiness, done}` — powers streak, momentum, Becoming |
| `lifeos:self-history` | per-day `{becoming, level, trend, facets[]}` — powers the time-lapse + cross-domain insight |
| `lifeos:skills:v2` | skill-tree state per discipline (`{status, pct, tier}`) → athlete domain |
| `lifeos:ona` | `{stats:{members,mrr,nps}, initiatives, sales, coaches}` |
| `lifeos:podium` | `{orders, revenue, builds}` |
| `lifeos:content` | `{brands[], hooks[]}` → creativity domain |
| `lifeos:milestones` | earned identity unlocks `{id:{earnedAt}, _seeded}` |
| `lifeos:quests`, `lifeos:captures`, `lifeos:journal`, `lifeos:learning`, `lifeos:adventure`, `lifeos:freezes`, `lifeos:settings`, `lifeos:setup-complete` | campaigns, inbox, reflections, etc. |

---

## 6. Behavior walkthrough (how it "works")

- **Open → Command (`today`):** greeting, **The Self** (Becoming number + identity shape) in the header, readiness, today's mission list (generated by the Mission Engine, adapts to readiness), an ask bar, and the **Presence** whisper (one proactive observation — names your one thing, an identity unlock within reach, a neglected domain, or affirms momentum). Completing the day's missions fires a close-the-day celebration and ticks Becoming up.
- **Map (`life`):** The Self at the center of an eight-domain constellation; below it the becoming line, the time-lapse entry, the **Identity** milestones card, a **cross-domain PATTERN** annotation, and a Balance radar; plus the capture inbox and journal. Tap a domain to enter its world; long-press for inline AI.
- **Move (`perform`):** the movement OS — six disciplines, skill trees (Foundation→Elite), a body radar, drill tracking.
- **Build (`build`):** ONA + Podium + Content Studio with an Action Center that turns metrics into recommended moves.
- **Setup:** Settings → "Make it yours → Set up my data" launches [`SetupFlow.jsx`](app/src/SetupFlow.jsx) to enter real ONA/Podium/content numbers (patches state, preserving detail).
- **AI ("the Presence"):** long-press any object for contextual AI; a Companion for freeform chat; all calls carry a structured identity digest ([`identity.js`](app/src/lib/identity.js)) and fall back to deterministic logic when offline.

---

## 7. Known caveats (be skeptical of these)

- **Seed data is placeholder.** ONA metrics, skill %s, content brands, and campaigns in [`data.js`](app/src/data.js) / `SEED_QUESTS` are demo values. Until the setup flow / editors are used, the Becoming number and AI reason about fiction, not Jay's real life.
- **Two apps in this repo.** The real product is the Vite SPA in [`app/`](app/) (deployed to Vercel). The repo root also contains a separate older standalone prototype (`index.html` + `concepts/`, CDN React/Babel, served via GitHub Pages) that does **not** share the `app/src` code. Audit `app/` for the live product.
- **No tests or linting.** No automated test suite, no ESLint/Prettier configured.
- **God-files.** [`TrainingHQ.jsx`](app/src/screens/TrainingHQ.jsx) (~1.2k lines) and [`ContentStudio.jsx`](app/src/screens/ContentStudio.jsx) (~0.9k lines) are large; heavy inline-style usage throughout.
- **Background push** is local opt-in only (no server-side Web Push/VAPID yet).
- [`app/api/ai.js`](app/api/ai.js) is legacy/orphaned (the live Companion uses `companion.js`).

---

## 8. Suggested audit reading order

1. [`app/src/App.jsx`](app/src/App.jsx) — how everything is wired and where the core derived state lives.
2. [`app/src/lib/mission.js`](app/src/lib/mission.js) `snapshot()` — the single read of all state the engines consume.
3. [`app/src/lib/becoming.js`](app/src/lib/becoming.js), [`level.js`](app/src/lib/level.js), [`quests.js`](app/src/lib/quests.js) — the math behind the headline numbers.
4. [`app/src/lib/milestones.js`](app/src/lib/milestones.js), [`crossDomain.js`](app/src/lib/crossDomain.js), [`presence.js`](app/src/lib/presence.js) — the identity/intelligence layer.
5. [`app/src/components/TheSelf.jsx`](app/src/components/TheSelf.jsx) — the signature artifact.
6. The screens, then [`app/api/`](app/api) for the AI surface and [`app/src/useSyncedState.js`](app/src/useSyncedState.js) for the sync model.
