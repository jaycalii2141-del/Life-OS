# Screenshots & Visual Reference — JAM HQ / Life HQ

> **Note on format:** These are detailed, structured visual descriptions of every screen captured live from the running production app (`https://life-os-ochre-one.vercel.app`, authenticated session, June 19 2026). The audit-capture environment cannot persist binary image files, so each screen is documented in text precise enough for an external reviewer or AI to reconstruct the visual. The app renders inside a simulated iPhone frame (402×874) on a near-black canvas.

---

## Live verification finding (important)

During capture, switching to the **Map** tab surfaced the app's **ErrorBoundary** ("THIS SCREEN HIT A SNAG · Try again / Reload the app") rather than the screen. Console showed:

```
TypeError: Failed to fetch dynamically imported module: .../assets/LifeMapScreen-BI3dYuVP.js
```

This is **not a code defect** — it's a stale-chunk / mid-session-deploy artifact: a new Vercel deploy changed the hashed lazy-chunk filenames while the tab was still running the previous `index.html`, so the old dynamic `import()` 404'd. A hard reload resolved it instantly and Map rendered perfectly. **It is, however, a real production UX risk worth fixing** (see `PRODUCT_SELF_AUDIT.md`): PWA + hashed code-split chunks should catch dynamic-import failures and auto-reload once. The good news — the ErrorBoundary did its job: one broken lazy chunk degraded to a recover card instead of white-screening the app.

---

## 1. Command (tab id `today`, `TodayScreen.jsx`)

The default front door. Top to bottom:

- **Header / hero card** (`glass-strong mesh-readiness`, radius 22): small eyebrow date "Friday, June 19"; large display greeting "Good evening, Jay" (time-aware); a mono "READY 70" pill colored by readiness band (red/gold/lime). Top-right: an 80px **RadialGauge** "33 / ALIGN" (cyan) — the cockpit's single number (alignment score).
- **Today's mission** strip: eyebrow "Today's mission", right side "0/4 · ~2h 15m" estimate + a cyan circular **regenerate** button (sparkle icon). A thin cyan progress bar under it.
- **4 mission rows** (interactive objects — tap to open, long-press for AI actions). Each: a 24px checkbox (44px hit area), a kind stroke-icon (bolt/trend/compass), bold title, muted "why" line. The next-up row has a cyan border + "NEXT UP · ~75M ›". Live example rows: "Train RO–BHS–back tuck (80%)" (bolt), "Call 7 stale leads" (trend), "Refill the Hook Bank" (trend), "Plan something with Chelsea" (compass).
- **"+ SET YOUR ONE THING"** dashed red pill (appears when no One Thing set).
- **AskBar**: rounded "Ask your AI anything…" input with a mic button → opens the Companion.
- **Missions card** (campaigns): eyebrow "Missions", "5 CAMPAIGNS", a cyan "✦ NEW GOAL" pill. Lists active quests (e.g. "Become a world-class hybrid athlete") with domain icon, next-milestone line, and a big % — each a long-press object.
- **Check-in card**: "Check-in 70 ▲+5 VS 7D"; expands to four cyan **StateMeter** bars (Energy/Focus/Body/Mood) — now unified to one accent.
- **Momentum card**: "Momentum 0 DAY STREAK · 14D", a gold sparkline + a 14-day heatmap row.
- **Chief of Staff** card: "AI BRIEF · FRI, JUN 19" + live-AI written brief, with one-tap action chips.
- **Timeline card**: today's schedule from the connected calendar.
- Floating: bottom-left **Companion launcher** (sparkle orb), bottom-right **FAB** (+, Quick Capture), and the 4-tab bar.

## 2. Map (tab id `life`, `LifeMapScreen.jsx`)

- Eyebrow "A living map of who you're becoming", display "LIFE MAP".
- **Constellation card**: a radial arrangement of 8 domain nodes around a central "JAY / 33" hub. Each node is a ring-gauge (score-filled), a playful emoji/icon marker, a score, and a label: ATHLETE 0, BUSINESS 32, RELATIONSHIPS 40, HEALTH 54, CREATIVITY 50, LEARNING 30, ADVENTURE 25, GROWTH 30. Caption "tap a domain to enter it". (This is the one screen that intentionally keeps colorful per-domain markers.)
- **Balance card**: eyebrow "The shape of your life", display "BALANCE", an 8-axis **RadarChart** of the same domains.
- Below (scroll): capture inbox / triage, review & upgrade launchers.

## 3. Move (tab id `perform`, `TrainingHQ.jsx` / `PerformScreen`)

- **Movement-identity hero**: eyebrow "Movement identity", display "HYBRID ATHLETE", right "Readiness 70"; "LEVEL 31 · 61% TOWARD WORLD-CLASS" + progress bar; "WHO I'M BECOMING · 6 IDENTITIES".
- **Breakthrough card**: bolt icon + "Closest breakthrough: RO–BHS–back tuck · 80% / GYMNASTICS · ~3 WKS LEFT · TAP FOR A SESSION PLAN".
- **Action row**: three buttons — COACH (AI session builder), LOG (log a session), WEEK (plan-my-week periodization).
- **MOVEMENT PYRAMID**: an SVG trapezoid pyramid of training layers.
- Below (scroll): discipline chips, the **SkillTree** (skills are long-press objects → Fastest path to mastery / Analyze limiter / Generate a session / Review drills), "What I'm working on" panel, training phase, and a **BodyRadar**.

## 4. Build (tab id `build`, `BuildScreen.jsx`)

- Eyebrow "Business · content · operations", display "BUILD". Segmented control **ONA / PODIUM / STUDIO** (active segment lit its domain color).
- **Action Center** ("METRICS → MOVES"): recommendation cards, each with an icon, title, why, a green impact line, and a one-tap chip ("ON IT" / "+ DO TODAY" → pushes into today's mission). Live examples: "Call 7 stale leads · ≈ +$217/MO IF 1 IN 4 CONVERTS", "Check in on 11 trial members · ≈ +$409/MO AT +30% CLOSE", "Push 'Refit obstacle wall — Lane 3' past 40% · UNBLOCKS THE BIGGEST ROCK AT ONA", "Refill the Hook Bank".
- **Workbench** ("What's on your plate · N ACTIVE PROJECTS"): urgency-sorted active projects across all folders — each a long-press object (Summarize progress / Generate next steps / Surface blockers). Shows an empty-state when none.
- Below: the selected segment's full workspace — **ONA HQ** (Obstacle Ninja Academy · Orlando: members/MRR/NPS, coaches, sales pipeline, initiatives), **Podium Hub** (KPIs + projects), or **Content Studio** (brands, hook bank, posting calendar).

---

## Sheets / modals (bottom-sheet overlays)

Documented in full in `SCREEN_INVENTORY.md`; visually they share the `Sheet` component (slide-up, scrim, rounded top, drag handle):

- **Companion** ("JAM INTELLIGENCE"): mode-hat picker row (Partner/Chief/Coach/Creative/ONA/Podium/Architect), chat transcript, thinking indicator, voice loop, "🧠 REMEMBERS YOU" badge (brain icon), gradient send.
- **Goal Decomposer** ("BREAK IT DOWN"): goal input, domain chips, gradient "Break it down" → AI milestone list (typewriter), "Add as mission".
- **ObjectMenu** (new long-press layer): object title + contextual action rows (AI rows show sparkle); selecting an AI action shows breathing **thinking dots** then the answer **types itself out** with a caret, then Back/primary buttons.
- **Calendar** (week view + quick-add), **Settings** (iCal link, vibe glow/calm), **Weekly Review**, **Monthly Upgrade**, **Quick Capture** (FAB → tag picker → save, voice mode), **Coach Sheet**, **Week Plan Sheet**.
- **Boot/Auth**: cinematic **BootSplash**, **Login** ("JAM HQ / WELCOME BACK", email + password, Sign in), **Onboarding**.
