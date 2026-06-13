# JAM HQ — V3: The Life Operating System

*June 12, 2026 — full reinvention. Build verified.*

## The shift

V2 made the app decide what deserves attention today. V3 makes it answer the bigger question: **"What should I focus on next to become the person I want to become?"** The app no longer tracks a life — it shapes one.

## Identity

Renamed **JAM HQ** — boot screen, home-screen icon, browser title, manifest. Tagline: *Mission control for an extraordinary life.* The neon command-center palette is gone; the entire system (every token and inline color) now runs on a Jay Alvarez ocean-sunset palette: matte black `#0A0B0D` / charcoal surfaces, ocean blue `#45B7E8`, deep teal `#2DD4BF`, sunset orange `#FF8A4C`, warm gold `#E9C46A`, coral `#FF6B5B`, seafoam `#34D399`. Calm glassmorphism remains the default; GLOW toggle still exists.

## The four surfaces + the Intelligence

**COMMAND** (home — the cockpit). Today's mission (daily, auto-generated), the **Life Alignment Score** in the header, the ask-your-AI bar, **MISSIONS** — the quest system: long campaigns seeded from Jay's actual vision (World-class hybrid athlete · Scale ONA past 250 · Podium launch · Marriage · 3 new countries), each broken into milestones you check off with confetti-worthy weight — then check-in, momentum, **Recent Wins** (real events from the last 7 days), AI brief, timeline.

**MAP** (the Life Map). An orbital SVG ecosystem: JAY at the center ringed by the alignment score, eight domains around him — Athlete, Business, Relationships, Health, Creativity, Learning, Adventure, Growth — each node ringed by a score computed from real activity (skill mastery, initiative progress, readiness average, brand pace, streaks…). Tap a domain to enter it: Health = recovery verdict; Relationships = date-night planner + shared notes; **Learning Lab** = books/courses/questions you're studying; **Adventure Hub** = a digital passport (bucket list → LIVED); Growth = journal + weekly/monthly rituals. The capture inbox and journal live below the map.

**MOVE** (the Movement OS). The hero now answers "how close am I to the athlete I want to become": HYBRID ATHLETE level + % toward world-class, expandable **identity meters** (Elite Gymnast, Advanced Tricker, Elite Calisthenics Athlete, Elite Acrobat, Advanced Parkour Athlete, Elite Ninja Athlete). The **Movement Pyramid** stacks four layers — Foundations (from the body radar) → Capabilities (coordination/balance/air & spatial awareness/rhythm, inferred from the disciplines that train them) → Disciplines → Skills — each layer feeding the one above. Mastery roadmaps keep prereqs, readiness gates, weeks-to-mastery, drills/faults/gates, plus a **BIGGEST LIMITER** callout per discipline (the first untrained fundamental). Coach/Log/Week actions and the radar remain.

**BUILD**. Three command hubs: **ONA** (live stats, funnel, coaches, initiatives), **PODIUM** (new — vision line, tap-to-edit KPIs at `lifeos:podium`, projects and notes pulled from the Podium folder), **STUDIO** (folders, hooks, pipeline, posting calendar). The Action Center on top still converts metrics into one-tap missions.

**THE INTELLIGENCE** (orb, everywhere). Unchanged from V2's unification + voice: seven hats, hands-free loop, app actions. Header now reads JAM INTELLIGENCE.

## New engines

- `src/lib/quests.js` — quest system (seeded missions + milestones at `lifeos:quests`), 8-domain scoring, `alignmentScore()`, `recentWins()`.
- `src/screens/LifeMapScreen.jsx` — the map + domain sheets + Learning Lab (`lifeos:learning`) + Adventure Hub (`lifeos:adventure`). Replaces LifeScreen.
- Movement identity/pyramid layers in `TrainingHQ.jsx` (`identityScores`, `MovementPyramid`).
- Podium hub in `BuildScreen.jsx`.

All previous data preserved; new keys: `lifeos:quests`, `lifeos:learning`, `lifeos:adventure`, `lifeos:podium`.

## Deploy

```
cd ~/Life-OS && rm -f .git/index.lock && git add -A app JAM-HQ-V3-Notes.md && git commit -m "JAM HQ V3 — Life OS: rebrand, Life Map, Movement Identity OS, quests, Podium hub" && git push origin main
```

Note: after deploy, re-add the app to your phone home screen to pick up the new JAM HQ name.
