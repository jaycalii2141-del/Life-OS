# Life OS Prototype

_Started 2026-05-28 03:36 UTC_

---

## User

<system-info comment="Only acknowledge these if relevant">
Project title is now "Life OS App"
Project is currently empty (no files)
Current date is now May 27, 2026
</system-info>

<default aesthetic_system_instructions>
The user has not attached a design system. If they have ALSO not attached references or art direction, and the project is empty, you must ASK the user what visual aesthetic they want. Use the questions_v2 tool to ask about preferred vibe, audience, colors, type, mood, etc. Do NOT just pick your own visual aesthetic without getting the user's aesthetic input -- this is how you get slop!

Once answered, use this guidance when creating designs:
- Choose a type pairing from web-safe set or Google Fonts. Helvetica is a good choice. Avoid hard-to-read or overly stylized fonts. Use 1-3 fonts only.
- Foreground and background: choose a color tone (warm, cool, neutral, something in-between). Use subtly-toned whites and blacks; avoid saturations above 0.02 for whites.
- Accents: choose 0-2 additional accent colors using oklch. All accents should share same chroma and lightness; vary hue.
- NEVER write out an SVG yourself that's more complicated than a square, circle, diamond, etc.
- For imagery, never hand-draw SVGs; use subtly-striped SVG placeholders instead with monospace explainers for what should be dropped there (e.g. “product shot”)

CRITICAL: ignore default aesthetic entirely if given other aesthetic instructions like reference images, design systems or guidance, or if there are files in the project already.
</default aesthetic_system_instructions>

<pasted_text name="Pasted text (230 lines)">
LIFE OS — MOBILE APP BUILD PROMPT
Paste this into Claude (Claude.ai, Claude Code, or API). It's self-contained.

ROLE
You are a senior product engineer + mobile design lead. You ship premium consumer apps. You've shipped to the App Store. You write clean, working code — not pseudocode, not "you would do X here" — actual files I can run.
Your job is to design and build the iOS + Android version of my personal Life OS app. This is a real project, not a tutorial. I want a working app on my phone, not a Figma file or a README.

WHO I AM (bake this into the product)
I'm Jay Martinez. Movement Architect · Coach · Creator · Builder.
Aliases: JayMuvs · Jungle Jay · Jammin Jay.
Base: Orlando, FL — nomadic with my partner Chelsea.
I'm an acrobat, gymnast, ninja warrior athlete, tricker, parkour athlete, calisthenics practitioner, and acro performer. I coach. I create content across six brands (JayMuvs, Motion Mob, ONA Elite, JK Acrobatics, Acro Wooks, Perfect Party Places). I own and run Obstacle Ninja Academy (ONA) in Orlando.
I want this app to feel like: Apple meets Linear meets the Iron Man HUD, scored to ODESZA. Not a Notion clone. Not corporate. Cinematic, dark, glowing, athletic, premium. The app I genuinely want to open every morning.
Tagline: "Move with purpose. Create with passion. Live in motion."

THE NORTH STAR
When I open the app at 6:30am, within 8 seconds I should know:

What today's One Thing is
My readiness score (energy/focus/body/mood)
My current momentum streak
What's on my timeline today

That's it. Everything else is one tap deep.

SCOPE — MVP (V1.0)
Build exactly these 5 screens. Nothing more. Resist the urge to add settings, profiles, social features, login flows beyond the minimum, dark mode toggles, or anything else. Ship the spine first.
SCREEN 1 — Mission Control (home)

Hero panel: today's date, "Good morning Jay", readiness score (big number 0–100), four meters (Energy / Focus / Body / Mood, 0–10 each, swipeable to set)
"Today's One Thing" card with red glow — text + checkbox + a "Mark done" button that triggers haptic + confetti
14-day momentum heatmap (a horizontal strip of color-intensity cells)
"Today's Timeline" — vertical list of today's events (time + label + color dot)
Bottom: floating Quick Capture button (+)

SCREEN 2 — Training HQ

Header with current 90-day phase + sessions completed
"Body Radar" — radar chart across Strength, Power, Skill, Mobility, Endurance, Recovery
Skill Trees — collapsible sections for the 6 disciplines (Gymnastics, Tricking, Calisthenics, Acro, Parkour, Ninja). Each contains skill nodes that show as done/active/locked with % progress bars
Bottom CTA: "Log session" button → opens a modal with skill picker + duration + intensity + notes + photo

SCREEN 3 — Content Studio

Six brand tiles in a 2-column grid, each with its own gradient (JayMuvs red, Motion Mob blue, ONA Elite lime, JK Acro violet, Acro Wooks orange, PPP white). Each tile shows: brand name (Bebas Neue), status pill, weekly goal, progress bar
Pipeline strip: Idea → Plan → Shoot → Edit → Schedule → Posted (with counts)
Hook Bank — a tap-to-copy list of viral hooks
7-day calendar strip showing planned posts

SCREEN 4 — ONA HQ

Hero: Members · MRR · NPS (3 big numbers)
Sales Pipeline (4 stages: Leads, Trials, Closing, New Members) with counts and a warning badge when leads are >48h old
Coach roster (Riley, Luke, Jay Lache, Avery, Eric, plus backup bench: Myra, Ava, Jordan, Billy) — each with avatar, private lesson price, performance grade
Active Initiatives list with P0/P1/P2 priority pills

SCREEN 5 — Quick Capture (modal, accessible from anywhere)

A single text input at the top
Voice memo button next to it
4 quick-tag pills: IDEA · ONA · DREAM · TASK
"Capture" button → saves to Supabase, dismisses modal, haptic feedback


DESIGN SYSTEM (use these tokens exactly)
COLORS
  bg-0      #06060A   (deep ink, base)
  bg-1      #0B0B12   (carbon, surface)
  bg-2      #11111A   (raised)
  text      #F5F5F7
  muted     #8A8A95
  dim       #5A5A66
  line      rgba(255,255,255,0.06)
  glass     rgba(255,255,255,0.035)

  ona-red   #FF0033   (fire, today, urgent)
  ona-blue  #0055FF
  cyan      #00D4FF   (system, data, trust)
  violet    #B14CFF   (vision, AI, future)
  magenta   #FF3CC8   (community, soul)
  lime      #B6FF3C   (body, performance)
  gold      #FFD23C   (wealth, mastery)
  orange    #FF8A3C

TYPOGRAPHY
  Display:  Bebas Neue (hero numbers, brand names, section titles)
  Body/UI:  Inter (everything else)
  Mono:     JetBrains Mono (data, time, ratios)

EFFECTS
  - Glassmorphism: 4–6% white over backdrop blur 18–22px
  - Mesh gradient backgrounds for hero panels
  - Soft glow (60–120px radial) under accent colors
  - HUD corner ticks on key panels (10×10px L-brackets in corners)
  - All counters tick up on render
  - Page transitions: 400ms fade-up, ease (cubic-bezier(.2,.7,.2,1))

MOTION
  - Hover/press: 3px lift + accent border glow
  - Streak cells shimmer subtly
  - Active skill nodes pulse cyan
  - AI orb spins forever (conic gradient)

ICONOGRAPHY
  Use Lucide icons (already in expo-icons / lucide-react-native).
  Avoid emoji except where they ARE the brand (the JayMuvs / brand pills).
I have a working HTML prototype with this exact aesthetic — I'll attach it. Match the feel, don't copy pixel-for-pixel. Mobile is different — bigger touch targets (44px min), thumb-reachable nav, swipe-first interactions.

TECH STACK (use this, don't substitute without asking)

Framework: Expo (React Native) — TypeScript template
Routing: Expo Router v3 (file-based)
Styling: NativeWind v4 (Tailwind for RN) — paired with the design tokens above as a tailwind.config.js extension
State: Zustand for client state, TanStack Query for server state
Database & auth: Supabase (Postgres + Auth + Storage) — magic-link email auth for me only
Animations: React Native Reanimated 3 + Moti
Charts: react-native-gifted-charts for the radar + heatmap (the most polished RN chart lib)
Haptics: expo-haptics
Icons: lucide-react-native
Fonts: expo-font with Bebas Neue, Inter, JetBrains Mono from Google Fonts
Build: EAS Build for iOS + Android. EAS Submit for TestFlight when ready.

Don't use Firebase. Don't use raw RN CLI. Don't use Tamagui. Don't use Redux. The stack above is opinionated for a reason — minimal moving parts, fastest path to a polished app.

DATA MODEL (Supabase schema — define this first)
Build these tables in supabase/migrations/0001_init.sql:
users         (id, email, created_at)
daily_logs    (id, user_id, date, energy, focus, body_score, mood, readiness, one_thing, one_thing_done)
sessions      (id, user_id, date, discipline, skill, duration_min, intensity, energy_pre, notes, photo_url)
skills        (id, user_id, discipline, name, parent_skill_id, status, progress_pct, video_url)
brands        (id, user_id, name, color, status, weekly_goal, weekly_progress)
content_items (id, user_id, brand_id, stage, title, hook, scheduled_for, posted_at, performance)
ona_leads     (id, source, name, email, phone, status, created_at, last_contacted_at)
ona_coaches   (id, name, pl_price, grade, role, active)
ona_initiatives (id, title, priority, progress_pct, due_date)
captures      (id, user_id, raw_text, tag, voice_url, created_at, routed_to)
Seed skills from this list (status=locked unless noted):
Gymnastics: Round-off (done), Layout (done), Full Twist (active 68%), Double Full
Tricking: Aerial (done), Btwist (active 82%), Cheat 720, Jackknife
Calisthenics: Muscle-up (done), Front Lever (active 72%), Planche
Acro: H2H (done), Icarian (done), Dynamic throws (active 55%)
Parkour: Precision (done), Kong (done), Wallrun (active 60%), Palm flip
Ninja: Salmon ladder (done), Cliffhanger (active 45%), Warped wall
Seed brands, ona_coaches, and ona_initiatives with the data from my HTML prototype.

NAVIGATION
Bottom tab bar with 5 tabs (use Expo Router (tabs) group):
◐ Home       → Mission Control
⚡ Train      → Training HQ
▶ Create    → Content Studio
🥷 ONA       → ONA HQ
✦ AI         → opens AI command sheet (later milestone — stub for now)
The Quick Capture (+) button is a floating action button on every screen, bottom-right above the tab bar. Tap = modal. Long-press = voice memo.

DELIVERABLES (build in this order, don't skip ahead)
Milestone 1 — Foundation (single response if possible)

package.json with all deps + scripts
tailwind.config.js with the design tokens
app.json / eas.json for Expo + EAS
app/_layout.tsx — root layout with fonts loaded and Supabase client provided
app/(tabs)/_layout.tsx — bottom tab bar with the 5 tabs styled per design system
lib/supabase.ts — Supabase client
lib/theme.ts — color + typography tokens exported
supabase/migrations/0001_init.sql — full schema
supabase/seed.sql — seed data for skills, brands, coaches, initiatives
A README.md with: how to install Expo Go, how to run npx expo start, how to set the 2 env vars (SUPABASE_URL, SUPABASE_ANON_KEY)

Milestone 2 — Mission Control screen

app/(tabs)/index.tsx — full screen
components/ReadinessHero.tsx, components/StateMeter.tsx, components/OneThingCard.tsx, components/MomentumStrip.tsx, components/TodayTimeline.tsx
Confetti + haptic on completing the One Thing

Milestone 3 — Training HQ

app/(tabs)/train.tsx
components/BodyRadar.tsx (radar chart, current vs goal)
components/SkillTree.tsx (collapsible section per discipline)
components/SkillNode.tsx (3 states)
components/LogSessionSheet.tsx (bottom sheet modal)

Milestone 4 — Content Studio

app/(tabs)/create.tsx
components/BrandTile.tsx, components/PipelineStrip.tsx, components/HookBank.tsx, components/PostingCalendar.tsx

Milestone 5 — ONA HQ

app/(tabs)/ona.tsx
components/SalesPipeline.tsx, components/CoachRoster.tsx, components/InitiativeList.tsx

Milestone 6 — Quick Capture + polish

components/QuickCapture.tsx (modal)
components/FAB.tsx (floating action button)
Voice memo via expo-av
Onboarding screen (one screen, magic-link email entry)
App icon + splash screen (generate placeholder, I'll swap)


HARD RULES

No placeholders. If you write a component, it must render with no errors. No // TODO: implement this blocks.
No web-isms. No div, no className strings that won't work in NativeWind, no onClick. Use View, Pressable, onPress.
Type everything. Strict TypeScript. No any.
One file = one purpose. No 800-line components.
Match the design system exactly. If you invent a new color or font size, stop and reconsider.
Test on iPhone 15 Pro frame in Expo Go. All screen layouts must work at 393×852 viewport. Tablet/landscape is out of scope.
Ask before substituting libraries. If something on the stack doesn't fit, tell me why and propose an alternative — don't silently swap.
Commit your work in chunks. End each milestone with a clear summary of what's done and what runs.


WHAT I'M ATTACHING

jay-life-os-prototype.html — the desktop HTML prototype. Use this as the visual reference for what every screen should feel like. Match the aesthetic, adapt the layouts for mobile (single-column, larger touch targets, swipe-first).
jay-life-os-strategy.md — the full 12-section product strategy. Read sections 1, 2, 4, 6, 7 for context. Skip the rest unless you need it.


START HERE
Begin with Milestone 1. Set up the project, install everything, write the schema, create the layout shell, load the fonts, define the theme. End that response with:

The list of files you created
The exact terminal commands I should run (npx create-expo-app, cd, npx expo install …, npx expo start)
What I should see when I open Expo Go and scan the QR code (it'll be blank tabs at this point — that's fine, confirm the tab bar styling is correct)
The two env vars I need to set and where to put them

Then wait for my "go" before moving to Milestone 2.
Don't ship me everything at once. We build this together, milestone by milestone.
Move.
</pasted_text>


<system-reminder>Auto-injected reminder (ignore if not relevant): do not recreate copyrighted or branded UI unless the user's email domain matches that company. Create original designs instead.</system-reminder>

## Assistant

_[tool: questions_v2]_

Before I start — a quick reality check on what I can ship here, then a few questions so I build the right thing.

**What I can do in this environment:** I produce design artifacts as HTML. I can build a gorgeous, fully interactive, iPhone-framed hi-fi prototype of all 5 screens (Mission Control, Training HQ, Content Studio, ONA HQ, Quick Capture) — matching your exact design tokens, with real animations, haptic-style feedback, working state, the radar chart, the heatmap, the skill trees, the FAB, swipeable meters, etc. This is the right medium for nailing the *feel* of the app before you (or a dev) translate it to Expo/RN.

**What I can't do here:** ship an actual Expo/React Native project with `package.json`, EAS config, Supabase migrations, and TypeScript files you can `npx expo start`. I don't have a Node/Expo toolchain or device deploys — only HTML output. If you want the real RN scaffold, that's a job for Claude Code in a terminal on your machine; I'd point you there for Milestone 1 as written.

**My proposal:** I build you the **hi-fi clickable HTML prototype** — the visual + interaction reference your dev (or future-you in Claude Code) can match pixel-for-pixel when wiring up the real app. Mobile-sized (393×852), iPhone bezel, all 5 screens, tab bar nav, FAB → Quick Capture modal, the works.

A few questions before I start:

## User

Questions answered:
- scope_confirm: Hi-fi HTML prototype of all 5 screens, iPhone-framed, clickable nav between them — full visual spec for the dev build
- prototype_attached: file:///Users/jaymartinez/Library/Application%20Support/Claude/local-agent-mode-sessions/7fe7b4df-f179-4f26-adfb-7fd9949ea480/76c7ef15-72fc-4074-bf77-43b8d860dc1d/local_6dfb9d0f-4e9f-4034-ae9a-8a6ad3d9bc1c/outputs/jay-life-os-prototype.html
- fidelity: Pixel-perfect, every detail (glow, mesh gradients, HUD ticks, counters tick up, shimmer) — slow and beautiful
- interaction_depth: Full: tab nav works, FAB opens modal, One Thing checkbox triggers confetti, skill trees expand, swipe-set meters
- device_frame: Yes, single iPhone bezel with bottom tab bar to switch screens inside it
- data_state: Seed with the data from your prompt (Riley/Luke/etc, skill list, brands) so it looks real
- ai_tab: Actually design a basic AI command sheet too
- handoff_note: No, just the prototype

## Assistant

_[tool: update_todos]_

_[tool: copy_starter_component]_

_[tool: read_file]_

_[tool: write_file]_

_[tool: write_file]_

Now let me build this in pieces. Starting with the foundation — styles, index, and shared components.

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: show_html]_

_[tool: done]_

_[tool: update_todos]_

_[tool: fork_verifier_agent]_

Built. Five iPhone-framed screens with the exact tokens you spec'd:

- **Mission Control** — date + greeting, animated readiness ring + ticking 0–84 counter, four swipeable Energy/Focus/Body/Mood meters, glowing red One Thing card (tap the checkbox or "Mark Done" → confetti burst + lime check), 14-day momentum heatmap (red→cyan intensity, today outlined), full vertical timeline.
- **Training HQ** — Phase 03 header with progress, 6-axis SVG Body Radar (cyan current vs dashed violet goal, animates in), collapsible skill trees per discipline with pulse-cyan active nodes and locked nodes, "Log Session" bottom sheet with discipline picker / duration chips / intensity heatbars.
- **Content Studio** — 2-column brand grid (JayMuvs red / Motion Mob blue / ONA lime / JK violet / Wooks orange / PPP white), pipeline strip with ticking counters & chevrons, tap-to-copy Hook Bank (turns lime on copy), 7-day calendar with colored post bars.
- **ONA HQ** — Members / MRR / NPS hero, sales funnel with blinking ⚠ STALE badges, full roster (Riley/Luke/Jay Lache/Avery/Eric + bench of Myra/Ava/Jordan/Billy) with grade pills, P0/P1/P2 initiatives.
- **AI** — spinning conic-gradient orb, gradient-text "HOW CAN I MOVE YOU?", input + mic, 2×3 quick-action grid, recent auto-routed history.

**Cross-screen:** floating cyan→violet FAB on every screen → tap opens Quick Capture (single input + mic + IDEA/ONA/DREAM/TASK pills + capture); long-press opens the same modal in voice mode with a red waveform strip.

**Caveat (re-stating):** this is the visual + interaction spec, not a runnable Expo project. When you (or Claude Code) wire up the real RN app, every token, motion, and component name here maps 1:1 to your Milestone breakdown.

Verifier is sweeping the tabs in the background — I'll surface anything it flags.

## User

Verifier agent check completed

## Assistant

Verifier signed off clean. Prototype is ready to review in the preview pane — click through the tabs, tap the + FAB, mark the One Thing done for the confetti, and expand a couple of skill trees on the Train tab to see the pulse-cyan active nodes.

