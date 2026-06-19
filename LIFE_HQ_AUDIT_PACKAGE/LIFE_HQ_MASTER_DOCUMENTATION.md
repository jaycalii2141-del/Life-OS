# JAM HQ / Life HQ — Master Documentation

*Comprehensive product + technical reference for independent audit. Generated June 19 2026 from the live codebase and running production app. Companion documents: `SCREEN_INVENTORY.md`, `FEATURE_INVENTORY.md`, `DESIGN_SYSTEM.md`, `APP_ARCHITECTURE.md`, `AI_SYSTEMS.md`, `USER_JOURNEYS.md`, `SOURCE_INDEX.md`, `SCREENSHOTS.md`, `PRODUCT_SELF_AUDIT.md`.*

---

## 1. Product Vision

JAM HQ (internally "Life HQ", formerly "LifeOS") is a **premium, AI-native personal operating system** — a single private "headquarters" that runs one person's entire life: their training, their businesses, their content, their relationships, and their growth. It is built for an audience of one, deeply: it is not a generic productivity template but a bespoke command center modeled on its owner's actual world.

The aspiration is explicitly **"JARVIS meets a meditation app meets Linear"** — a calm, futuristic, intelligent companion that knows your whole world, tells you the one thing that matters today, helps you act on it, and gets smarter over time. The product should feel less like a dashboard or a database and more like a *living operating system* and a *personal AI headquarters*.

## 2. Purpose of the App

To collapse the dozen tools a high-output multi-hyphenate juggles (todo app, training log, CRM, content planner, journal, calendar, coach, business dashboard) into **one coherent surface with one intelligence woven through it**. Concretely it exists to answer, every morning, in one glance:

1. What matters most today?
2. What should I do next?
3. What can wait?
4. How are my long campaigns actually going?

…and then to help the user *act* — generate a plan, break down a goal, analyze a blocker, log a session, draft a message — without leaving the app or context-switching into a chatbot.

## 3. Target User

**Primary (and only) user: Jay Martinez.** An elite movement athlete and coach (gymnastics, tricking, calisthenics, partner acrobatics & hand-balancing, parkour, ninja), co-owner of **Obstacle Ninja Academy (ONA)** — a ninja/movement gym in Orlando — and **Podium Creations** (premium obstacle equipment manufacturing), a content creator (@jayy_martinez), married to Chelsea, timezone America/New_York. He values clarity, calm, freedom, growth, and craft; he hates clutter and busywork.

The app's data model, copy, AI prompts, and domain taxonomy are all hardcoded around Jay's real life. It could generalize to other high-agency multi-business athletes/creators, but it is currently a **single-tenant, single-user product** by design.

## 4. Core Philosophy

- **One intelligence, many hats.** Not six chatbots — one companion that knows everything and shifts emphasis (Chief of Staff, Coach, Creative Director, ONA Ops, Podium, Architect, Partner).
- **Signal over spectacle / calm at rest, alive on touch.** Premium restraint: still and quiet when idle; motion and intelligence fire on interaction. (A recent design correction pulled the app back from over-animation toward this principle.)
- **Interaction-first.** Every major piece of information is an *interactive object*: tap for the primary action, long-press for contextual AI actions that run inline.
- **Local-first, cloud-synced.** Instant, offline-capable, but synced per-user so it follows you across devices.
- **Graceful degradation.** Every AI feature has a deterministic local fallback so the app is useful even with no key/session.
- **Propose-and-confirm.** The AI can *act* (calendar, email, session, capture, focus) but always proposes and the user confirms — never silent execution.

## 5. Feature Inventory (summary)

Full detail with status in `FEATURE_INVENTORY.md` (42 features). Headline systems:

- **Daily Mission Engine** — generates the day's 4–5 missions from every data source; regenerable; done-state survives re-plans; adaptive re-rank to readiness.
- **Readiness Check-in** — 4 meters (energy/focus/body/mood) → a readiness score that re-plans training.
- **Alignment & Momentum** — alignment gauge (are your actions matching your goals?), real streak, 14-day momentum heatmap + sparkline, 7-day trend.
- **Quests / Campaigns** — long multi-milestone goals that feed their next step into the daily mission.
- **Goal Decomposition** — name a goal → AI breaks it into a sequenced progression you can edit and save as a campaign.
- **Skill Trees & Disciplines** — six movement disciplines with tiered skill progressions, drills, fundamentals, fault→fix coaching, and per-skill % tracking.
- **AI Coach** — designs a training session from your skill tree + readiness; **Plan-my-week** periodization.
- **Companion** — always-present AI partner (7 hats), multi-turn, voice, long-term memory, operator actions.
- **Chief of Staff brief** — a tight, honest morning brief ending in the single highest-leverage action.
- **Weekly Review & Monthly Upgrade** — reflective loops; the monthly report critiques how you used the app and your life trends.
- **Universal Capture & Triage** — capture anything; route it into folders/projects.
- **Life Map** — a domain-balance constellation + radar across 8 life domains.
- **Build** — Action Center (metrics→moves), Workbench (active projects across folders), ONA business hub, Podium hub, Content Studio (brands/hooks/posting calendar).
- **Calendar / iCal** integration; **ONA live pipeline** (GymDesk→Zapier→webhook).
- **Interaction layer** — long-press ObjectMenu with inline AI on missions, campaigns, skills, projects.
- Plus: telemetry/usage mirror, cloud sync, PWA/offline, auth + AI gate, error boundary, haptics, vibes (glow/calm), onboarding, settings.

## 6. Navigation Structure

A **routerless, four-tab state machine** inside a simulated iPhone frame. Bottom tab bar:

| Tab label | internal id | Screen | Role |
|---|---|---|---|
| Command | `today` | TodayScreen | Daily cockpit (default) |
| Map | `life` | LifeMapScreen | Life-domain balance + capture |
| Move | `perform` | TrainingHQ | Training / skills |
| Build | `build` | BuildScreen | Businesses / content / projects |

A floating **FAB** (Quick Capture) and a **Companion launcher** float above all tabs. All other surfaces are **bottom sheets/modals** mounted on demand (Companion, Goal Decomposer, Calendar, Settings, Weekly Review, Monthly Upgrade, Coach, Week Plan, ObjectMenu). Boot → (auth gate) → Login → Onboarding → Command.

## 7. Information Architecture

Three-layer hierarchy per screen (L1 = what matters / what's next, L2 = state & momentum, L3 = detail, collapsed until wanted). Cross-cutting taxonomies:

- **Life domains** (Map): athlete, business, relationships, health, creativity, learning, adventure, growth.
- **Business/operations domains** (Build): ONA, Podium, Studio/content, plus folders.
- **Movement disciplines** (Move): gymnastics, tricking, calisthenics, acro, parkour, ninja.
- **Mission kinds**: focus, train, build, ritual.
- **Companion hats**: partner, chief, coach, creative, ona, podium, architect.

Detail in `APP_ARCHITECTURE.md` (§IA) and `SCREEN_INVENTORY.md`.

## 8. Screen Inventory (summary)

Boot/Auth: BootSplash, Login, Onboarding. Primary tabs: Command, Map, Move, Build. Sheets/modals: Companion, Goal Decomposer, ObjectMenu (long-press), Quick Capture, Calendar, Settings, Weekly Review, Monthly Upgrade, Coach Sheet, Week Plan Sheet. Embedded workspaces: ONA HQ, Podium Hub, Content Studio. Full breakdown (purpose/features/inputs/outputs/interactions/destinations) in `SCREEN_INVENTORY.md`.

## 9. Database Schema

**Supabase Postgres**, one table:

```sql
create table app_state (
  user_id uuid    references auth.users not null,
  key     text    not null,
  value   jsonb   not null,
  updated_at timestamptz default now(),
  primary key (user_id, key)
);
alter table app_state enable row level security;
create policy "own rows" on app_state for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

RLS is **enabled and enforcing** in production (verified). The app is a **key-value document store**: each feature persists a JSON blob under a `lifeos:*` key. Enumerated keys (see `APP_ARCHITECTURE.md`): `lifeos:daily:<DATE>`, `lifeos:mission:<DATE>`, `lifeos:captures`, `lifeos:sessions`, `lifeos:history`, `lifeos:settings`, `lifeos:skills:v2`, `lifeos:ona`, `lifeos:folders`, `lifeos:quests`, `lifeos:companion:memory`, content/brand keys, telemetry keys, etc. Auth tables are Supabase-managed (`auth.users`).

## 10. User Flows

Seven flows mapped step-by-step in `USER_JOURNEYS.md`: New user, Daily use, Goal creation, Habit/mission tracking, Learning/training, AI interaction, Review. Core daily loop: open → check-in (4 meters) → readiness computed → mission engine generates/adapts → act on missions (tap to complete, long-press for AI) → Chief brief → history records → momentum/streak update.

## 11. AI Systems

All AI runs through Vercel serverless functions calling **Anthropic Messages API, model `claude-haiku-4-5-20251001`**, now **live** (the `ANTHROPIC_API_KEY` is set and verified). Endpoints: `companion`, `chief`, `coach`, `decompose`, `ai` (legacy/orphaned), plus non-LLM `calendar` and `ona-webhook`. Every endpoint is **gated behind a Supabase session JWT** (`api/_auth.js`) with a per-user rate limit, so the key can't be used as an open proxy. Every AI feature has a **deterministic local fallback**. Full prompt-level detail, the "one intelligence/many hats" model, the long-term memory system, the `ACTIONS_JSON` propose-and-confirm operator model, and an honest assessment of the heuristic recommendation engines are in `AI_SYSTEMS.md`.

## 12. Tracking Systems

- **Readiness**: daily 4-meter check-in → readiness score.
- **History**: per-day `{score, readiness, done}` → streak, 14-day momentum heatmap, 7-day trend.
- **Telemetry ("the mirror")**: `lib/telemetry.js` logs tab opens and feature usage by surface; powers the Weekly Review and the Monthly Upgrade report ("what features you actually use vs ignore").
- **Skill tracking**: per-skill % + status (locked/active/mastered), drill/fundamental WORKING/DONE states.
- **Business metrics**: ONA members/MRR/NPS, sales pipeline, content brand %s, hook bank counts (currently editable seed data).

## 13. Skill Systems

Six disciplines, each a **tiered skill tree** (fundamentals → progressions → elite skills) authored in `data.js` and deepened by `coaching.js` (a genuinely deep, real coaching knowledge layer: drill libraries, fault→fix corrections, readiness "gates" per tier, periodization templates, blindspot analysis). Skills are interactive objects (long-press → AI). The AI Coach and Plan-my-week read the tree + readiness to build sessions/weeks. The Movement Pyramid and Body Radar visualize development.

## 14. Analytics Systems

Self-analytics, not third-party: the usage telemetry mirror, the momentum/streak/trend engine, the alignment score (actions vs goals), domain balance (Life Map radar), and the Monthly Upgrade report that reflects on patterns. No external analytics/ads SDKs.

## 15. Progression Systems

- **Campaigns/quests** with milestones feeding daily missions.
- **Skill % + tier unlocks** with readiness gates.
- **Movement "identity" level** ("Hybrid Athlete · Level 31 · 61% toward world-class").
- **Streak + momentum** for daily consistency.
- **Alignment** as a meta-progression (are you becoming who you intend?).

## 16. Integrations

- **Supabase** — auth + per-user cloud sync.
- **Anthropic** — the live AI brain.
- **Google Calendar / iCal** — read via `api/calendar.js` (SSRF-allowlisted to Google), quick-add deep-links to Google Calendar.
- **GymDesk → Zapier → `api/ona-webhook.js`** — live ONA gym metrics ingestion (built; requires `SUPABASE_SERVICE_ROLE_KEY`, `ONA_WEBHOOK_SECRET`, `ONA_USER_ID`, currently likely unset).
- **mailto deep-links** for AI-drafted emails. **PWA** install/offline.

## 17. Technical Stack

- **Frontend**: Vite + React 18 SPA, no router (tab-state machine), lazy/Suspense code-splitting, inline-style-heavy with a CSS design-token layer. Simulated iPhone device frame.
- **State**: custom `useSyncedState` — module-level shared store per key + localStorage mirror + cross-tab `storage` events + Supabase upsert (pull-once, echo-guarded). `useMissionEngine` hook extracts the mission logic.
- **Backend**: Vercel serverless ESM functions (`app/api/*`). Supabase Postgres (single `app_state` table, RLS).
- **AI**: Anthropic Haiku via serverless, JWT-gated, rate-limited, with local fallbacks.
- **Deps**: minimal — `react`, `react-dom`, `@supabase/supabase-js`; dev `vite`, `@vitejs/plugin-react`. No test/lint tooling installed.
- **Deploy**: Vercel (root = `app`), prod `life-os-ochre-one.vercel.app`. Repo `~/Life-OS` (branch main).

## 18. Current Strengths

- Genuinely **AI-native now** (key live): the brief, Companion, coach, decomposer, and reviews produce real, specific, coach-grade output.
- **Deep, real domain knowledge** in the coaching layer — not filler.
- **Premium dark "aurora glass" visual system** with real depth, a coherent token set, and recent restraint.
- **Interaction-first layer** (long-press objects + inline AI) is distinctive and on-trend.
- **Solid engineering hygiene**: clean build, minimal deps, lazy-split chunks, error boundary, cross-tab-safe sync, no committed secrets, correct secret separation, JWT-gated AI, RLS enforced.
- **Resilient by design**: every AI feature degrades gracefully; data is local-first.

## 19. Known Weaknesses

- **Seed data is placeholder.** Business metrics, skill %s, and quests are demo values; until replaced with Jay's real numbers the live AI reasons about fiction.
- **Recommendation "intelligence" is hand-authored heuristics** dressed as analysis (e.g. ROI math is `count × constant`); honest but oversold by the UI.
- **Podium is a stub**; the ONA live webhook needs env vars to actually flow real data.
- **`api/ai.js` is orphaned** legacy code.
- **PWA + hashed chunks** can throw "failed to fetch dynamically imported module" after a deploy until hard reload (caught live; needs an auto-reload-on-chunk-error guard).
- **Two god-files** remain (`TrainingHQ.jsx` ~1.2k lines, `ContentStudio.jsx` ~0.9k) and ~1,200 inline-style objects; no test/lint tooling.
- **Long-term memory** only updates with a live AI round-trip (no deterministic structured memory).
- Minor: comment drift (auth header says "magic-link" but it's email/password), ~90 stale `vite.config.js.timestamp-*` temp files in the working tree.

## 20. Future Roadmap (proposed)

1. **Real data** — replace all seed values with Jay's actual numbers (or an in-app setup flow).
2. **Roll the interaction-first layer everywhere** + a streaming token presence and a command palette.
3. **Make recommendations genuinely data-driven** (use real history) and structured deterministic memory.
4. **Activate the ONA live pipeline** (env vars) and build Podium past stub.
5. **Harden the PWA** (chunk-error auto-reload, SW update flow).
6. **Refactor the god-files**, add lint/tests.
7. **God-tier horizons** (from the original vision): predictive coaching, form/vision analysis, wearables, Stripe/Square, multi-tenant if it ever generalizes.
