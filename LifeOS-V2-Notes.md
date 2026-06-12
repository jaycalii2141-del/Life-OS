# LifeOS V2 — From Command Center to Operating System

*June 12, 2026 — full V2 refactor. Build verified.*

## 1 · Product critique (what was wrong with V1)

V1 was visually impressive but informational. The core problems:

**It showed, it didn't decide.** Six tabs of dashboards each asked Jay to figure out what mattered. Readiness, MRR, skill %, pipeline counts — all displayed, none converted into action. Every open of the app started with a decision tax.

**The AI was a feature, not the system.** Six separate "agents" plus a Companion plus a Chief brief = three disconnected AI surfaces with no shared spine. They felt like chatbots bolted on, not an intelligence running the place.

**Navigation was six apps in a trench coat.** Home/Train/Create/ONA/Mind/AI gave equal weight to everything, so nothing was primary. ONA (one business) held a top-level tab while "relationships" had none.

**Flat hierarchy, maximal stimulation.** Glow, shimmer, HUD ticks, mesh gradients, and pulsing animations gave a P2 metric the same visual energy as the day's critical task. Beautiful for a demo; fatiguing for daily multi-hour use.

**Weak retention spine.** A streak existed but wasn't tied to anything meaningful — you could keep a streak by sliding a meter. No campaign feeling, no unlock anticipation.

## 2 · New architecture

```
TODAY      ← default. The Mission. AI-generated daily campaign.
LIFE       ← recovery · relationships · reflection · capture inbox
PERFORM    ← skill trees (flagship) · readiness · coach · radar
BUILD      ← Action Center · ONA · Studio (content/projects)
 ⚪ orb     ← LifeOS Intelligence — one mind, 7 hats, everywhere
 ＋ fab     ← Quick Capture, everywhere
```

**The Mission Engine (`src/lib/mission.js`)** is the new core. Every data source — readiness meters, skill trees, sessions, ONA pipeline, brand cadence, project deadlines, capture inbox, day-of-week rituals — feeds one ranked list of ≤5 missions. Each mission carries a *why*, a time estimate, and a destination. Readiness decides *what kind* of training mission you get (push / technique-only / recover), not whether you train. Sundays inject the Weekly Review; weekends inject time with Chelsea. Completing missions drives the streak and the momentum heatmap (score = missions done + readiness bonus).

**Today screen** answers the four questions instantly: mission list with next-best-action highlighted (L1), check-in + momentum (L2), AI brief + timeline collapsed (L3). The One Thing is mission #1 and stays in lockstep with the daily state.

**LifeOS Intelligence** replaces the agent roster. One synced conversation, seven hats (Partner/Chief/Coach/Creative/ONA/Podium/Architect) as mode chips; the server (`api/companion.js`) now takes a `mode` and shifts emphasis without changing identity. It knows today's mission, blindspots, businesses, and projects, and can still act (calendar/email/session/capture/focus — always propose-and-confirm). Until the Anthropic key is set, `localAnswer()` gives real data-driven answers per mode. The old AI tab and `AIScreen.jsx` are gone.

**Perform = progression engine.** New hero: Level (mastered skills), overall %, closest breakthrough with weeks-to-mastery, and "about to unlock" line. Each tree header shows a tier quest-map (FOU/DEV/ADV/ELI completion). Each skill node now shows: prerequisite for locked skills, ~weeks-to-mastery + readiness gate for active skills (⚠ warns when today's readiness is below the tier gate), a COACH ME chip into the AI coach, plus the existing drills/gates/faults and fundamentals.

**Build = action system.** The Action Center sits above ONA/Studio and converts metrics into moves with estimated impact ("Call 5 stale leads ≈ +$190/mo if 1 in 4 converts"), each with a DO TODAY button that pushes it into the day's mission. All V1 CRUD (pipeline, coaches, initiatives, folders, hooks, posting calendar) is preserved underneath, one segment away.

**Life** absorbs Mind and elevates the human side: a recovery verdict card (readiness → green light / steady / recover, with 7-day average), a Wife & I card with one-tap date-night planning (Google Calendar prefill), then inbox triage, journal, Weekly Review and Monthly Upgrade.

**Visual system: Calm by default.** `data-vibe="calm"` (set pre-paint in index.html, persisted at `lifeos:vibe`) strips glow, text-shadows, HUD ticks, shimmer loops and mesh gradients; widens breathing room; keeps depth only where it carries meaning (sheets, tab bar). The original command-center skin survives intact as the GLOW toggle in Settings → Visual system.

## 3 · Files changed

- **New:** `src/lib/mission.js`, `src/screens/TodayScreen.jsx`, `src/screens/LifeScreen.jsx`, `src/screens/BuildScreen.jsx`
- **Rewritten:** `src/Companion.jsx` (unified intelligence), `src/App.jsx` (4-tab shell + mission state + vibe), `src/components/TabBar.jsx` (4 tabs)
- **Upgraded:** `src/screens/TrainingHQ.jsx` (→ PerformScreen, progression engine), `src/styles.css` (calm system), `src/Settings.jsx` (vibe toggle), `src/Onboarding.jsx`, `src/ChiefBrief.jsx` (collapsible), `api/companion.js` (modes)
- **Removed:** `src/screens/AIScreen.jsx`, `src/screens/MissionControl.jsx`, `src/screens/MindScreen.jsx`
- **Data:** all existing keys preserved (`lifeos:daily:*`, `skills:v2`, `captures`, `ona`, `content`, `folders`, `journal`, `history`, `companion`…). New keys: `lifeos:mission:<date>`, `lifeos:vibe`.

## 4 · Designed for scale

Nothing in the mission engine is Jay-specific except the data it reads. Domains, disciplines, brands, and rituals are config (`data.js`); the engine, the progression meta (tier gates / mastery estimates), the action-recommendation pattern, and the one-intelligence-many-hats model generalize directly to athletes, creators, founders, and coaches. Personalization lives in data; the OS lives in code.

## 5 · Deploy

```
cd ~/Life-OS && rm -f .git/index.lock && git add app LifeOS-V2-Notes.md && git commit -m "LifeOS V2 — mission engine, 4-surface nav, unified intelligence, progression engine, calm visual system" && git push origin main
```

Reminder: `ANTHROPIC_API_KEY` is still unset in Vercel — the Intelligence, brief, and coach run on deterministic local fallbacks until you add it (Vercel → Settings → Environment Variables).
