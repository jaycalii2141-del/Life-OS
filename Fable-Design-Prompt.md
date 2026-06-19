# Design Prompt — LIFE OS (for Fable)

## Your role
You are a world-class product designer (think the team that would result if Apple, Linear, Notion, Oura, and Arc collaborated). Design **Life OS** into a top-tier, award-quality mobile app. Prioritize emotional desirability, clarity, motion, and craft. Every screen should feel premium, calm, fast, and alive — never cluttered or "productivity-app boring."

## The product in one line
Life OS is a personal operating system: a movement athlete and entrepreneur's second brain, coach, and chief of staff in one — it tells him what matters today, lets him capture everything in one place, trains him like an elite coach, runs his businesses, and gets smarter over time.

## Who it's for
Jay Martinez — co-owner of **Obstacle Ninja Academy** (a ninja/movement gym in Orlando) and **Podium Creations** (premium obstacle equipment), an **elite movement athlete & coach** (gymnastics, tricking, calisthenics, partner acrobatics & hand-balancing, parkour, ninja warrior), a **creator** (@jayy_martinez), and a husband who travels with his wife Chelsea. He values clarity, calm, freedom, growth, and craft; he hates clutter and busywork. He uses this daily, mostly one-handed, on his phone.

## Design north star (the feeling)
- **Premium dark "HUD"** aesthetic — like the cockpit of a high-performance machine, but warm and human.
- **Calm confidence.** Lots of negative space, restraint, and one clear focal action per screen.
- **Alive.** Subtle motion everywhere — things ease in, respond to touch, and reward progress.
- **Effortless.** Any daily interaction completes in under 3 minutes, mostly taps, rarely typing.

## Design system

**Surface & materials**
- Near-black background `#06060A`, layered with darker/lighter panels `#0B0B12` / `#11111A`.
- "Glass" cards: translucent white fill (~3–6% opacity), 1px hairline borders (white 6–12%), generous rounded corners (14–22px), soft deep shadows.
- Signature detail: subtle **HUD corner ticks** (little L-brackets) on key cards; faint mesh/radial-gradient glows behind hero elements.

**Color (neon accents on black)**
- Cyan `#00D4FF`, Violet `#B14CFF`, Magenta `#FF3CC8`, Lime `#B6FF3C`, Gold `#FFD23C`, ONA-Red `#FF0033`, Orange `#FF8A3C`.
- Use color semantically and sparingly: each domain/discipline has its own accent; one accent leads per screen. Text is near-white `#F5F5F7`, muted `#8A8A95`, dim `#5A5A66`.

**Typography**
- Display: a tall condensed sans (Bebas Neue feel) for big numbers, titles, hero wordmarks — UPPERCASE, tight.
- Body: Inter (300–800).
- Mono: JetBrains Mono for labels, eyebrows, stats, tags — small, letter-spaced, uppercase.

**Motion & feel (critical to "top tier")**
- Screens enter with a **staggered cascade** — cards fade-and-rise in sequence (~50ms apart).
- **Bottom sheets** for all modals: slide up on open, slide down + scrim-fade on close.
- **Tactile press**: everything interactive scales ~0.96 on tap, with light haptic feedback.
- **Reward moments**: completing/mastering something triggers a confetti burst + success haptic.
- **Skeleton shimmer** loaders for anything async — never a blank state or spinner.
- A signature **spinning conic-gradient orb** (cyan→violet→magenta) used as the AI/brand mark.
- A **cinematic boot splash** on open: the orb blooms in, the "LIFE OS" wordmark reveals by tightening its letter-spacing, a tagline rises, then the whole thing lifts away into the app (~2s).
- Respect reduced-motion.

## Information architecture
A bottom tab bar with **6 surfaces**, a center/right **+ capture FAB**, and an always-present **AI Companion orb** (bottom-left). Never add a 7th tab — depth lives inside these.

1. **Today** (Home / command center)
2. **Train**
3. **Create**
4. **ONA** (business)
5. **Mind** (second brain)
6. **Agents** (AI team)

Plus two global elements on every screen: the **Capture FAB** and the **Companion orb**.

## Screen-by-screen

### 1) Today — the command center
- Date + warm greeting, and a **Readiness hero**: four meters (Energy, Focus, Body, Mood) rolling up into a single Readiness score 0–100, with a trend vs the last 7 days.
- **Chief of Staff brief** card: an AI morning briefing ("you're sharp today… first up is Coach @ ONA at 3pm… 1 thought to triage… ▸ highest-leverage action"), ending in a single highest-leverage action, with one-tap **action chips** (Plan a block, Triage inbox, etc.).
- **One Thing** card: the single win for today, with a satisfying complete state.
- **Momentum**: streak + a 14-day momentum heatmap.
- **Today's timeline**: time-blocked schedule, merged read-only with Google Calendar; quick-add.

### 2) Train — the elite coaching engine (this is a signature surface, go deep)
- Phase header + a **Body radar** (athletic attributes).
- Two CTAs: **Build My Session** (AI coach) and **Plan Week** (periodization).
- A **"Working On"** rollup: every active skill + every drill/fundamental marked "working," in one focused list.
- **Skill trees** per discipline (gymnastics, tricking, calisthenics, acro, parkour, ninja). Each discipline is a collapsible tree of skills across four tiers — **Foundation → Developing → Advanced → Elite** (tier-colored: lime, cyan, gold, red). Each skill shows status (locked/active/mastered), a progress %, and a coaching cue.
- Expanding a skill reveals **ordered drill progressions**: numbered steps, each with a cue, a red **⚠ common-fault → fix**, and a green **✓ "ready when" gate** (the measurable standard to advance). Every drill and fundamental has a **tap-to-cycle tracker** chip: TRACK → WORKING → ✓ GOT IT.
- A **Fundamentals panel** atop each discipline: the athletic + technical bedrock (e.g., for tricking: air-awareness, the set, the block, twisting mechanics, reactive power, landing/eccentrics) — each with the *why*, the *how*, and a standard.
- **Build My Session** (bottom sheet): pick focus discipline + duration; shows a live **"Blindspots your coach is watching"** panel; generates a structured session (prep → primary skill work → supporting strength → cool-down) and lets you log it.
- **Plan Week** (bottom sheet): pick training days/week + priority; shows a color-coded weekly **microcycle** (high-impact vs low-impact vs recovery vs rest) and the periodization principles behind it.

### 3) Create — the creative studio
- **Brand/life folders** as bold colored tiles: ONA, Podium, Movement, @jayy_martinez, Wife & I, Self (each with emoji, accent color, pin).
- Open a folder → **Notes** + **Projects**. Projects are real checklists: ordered steps with progress %, a **due date** (color-coded on-track/soon/overdue), and the **next action** surfaced on the collapsed card.
- A Hook/idea bank + capture-import.

### 4) ONA — business HQ
- Hero stats (Members, MRR, NPS) — editable, plus a **live "Live · GymDesk"** card fed by real data.
- Sales pipeline, coaches roster, prioritized initiatives with progress.

### 5) Mind — the second brain
- **Capture inbox + triage**: everything captured lands here; route each thought to a domain folder (the captured tag suggests the best one), archive, or delete. Show an inbox-zero celebration. The Mind tab shows a **count badge** of untriaged items.
- **Journal**.
- **Weekly Review** (sheet): days active, readiness, training volume, and a standout **"where your attention actually went"** bar chart across the six life domains; set one focus for next week, with one-tap **schedule it** actions.
- **Monthly Upgrade Report** (sheet): the self-improving loop — reflects on how he used the app, surfaces patterns/dead features, and proposes improvements he can **Accept / Dismiss**; accepted items bump a visible **LifeOS v1 → v2 → v3** changelog. (Nothing changes automatically — he reviews.)

### 6) Agents — the AI team
- A roster of **six specialist agents**, each a distinct persona with its own accent: **Chief of Staff, Performance Coach, Creative Director, ONA Ops, Podium Ops, Systems Architect**. Tap one to chat scoped to that specialist; each has tailored quick actions. A glowing AI orb anchors the screen.

### Global — the AI Companion (centerpiece)
- A floating **orb launcher** on every screen opens a full-screen chat with one AI that knows his **entire world** (training, businesses, day, captures, goals) and remembers the conversation.
- It's a partner: coach, strategist, creative collaborator, thinking partner. Warm, direct, specific.
- It can **act**, not just advise: replies include one-tap **action chips** — Block time (opens calendar prefilled + adds to today), Log session, Save (to capture), Set focus, Draft email. Reversible in-app actions happen instantly; external/irreversible ones are prefilled for the user to confirm. Tapped chips flip to **✓ done**.

### Global — Universal Capture
- A **+ FAB** on every screen opens a fast capture sheet (type or voice), with a tag, that drops into the Mind inbox in seconds. Confirmation = a quick "CAPTURED" with haptic.

### First run — Onboarding
- A considered welcome: the orb, the gradient **LIFE OS** wordmark, a one-line promise, and four highlight cards (Today, Train, Mind, Agents) cascading in, then a "Let's build" CTA.

## Signature details to nail
- The boot splash and the AI orb are the brand — make them gorgeous.
- The skill-tree drill cards (cue + red fault + green gate + tracker chip) are dense but must feel elegant and scannable.
- The "where your attention went" weekly bar chart is a hero data-viz moment.
- Reward confetti on mastering a skill or logging a session.
- Inbox-zero and empty states should feel intentional and warm (dashed "add here" affordances with an icon, never bare text).

## The quality bar
Top-tier means: pixel-perfect spacing on a rhythmic grid, restrained color, confident typography, motion that feels physical, and not one element that looks default or unconsidered. Benchmark the feel against Linear (speed/precision), Oura (calm data), Arc (delight), Superhuman (focus), and Apple (restraint). If a feature doesn't make Jay's life clearer, calmer, or more capable, simplify or cut it.

## Deliverables
Design the full app: a cohesive design system (color, type, components, motion specs), all six core screens plus the Companion, Capture, Build-My-Session, Plan-Week, Weekly Review, and onboarding, in a polished dark theme, mobile-first, with the signature interactions specified above. Show light and dark states of the key components if relevant, but dark is the hero.
