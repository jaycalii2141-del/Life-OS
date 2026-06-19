# JAM HQ — Visual Direction
*Research-grounded. Inspired by the best, copied from none.*

I studied the design languages of Linear, Apple Vision Pro / visionOS, Arc, Raycast, and the 2025–26 wave of premium AI apps, plus modern dashboard and fitness-viz work. The recurring lessons that matter most for JAM HQ:

- **Linear:** color is *functional only*; restraint is the system; headlines "whisper authority through restraint" (light display weights), not shout. Two decisions — base type size + grid unit — cascade into everything. *(LogRocket; Nathan Lane)*
- **visionOS:** **glass + vibrancy** — foreground content pulls light/color forward from behind it for legibility; **darker materials separate sections, lighter materials mark interactive elements**; never stack light-on-light; three vibrancy tiers (primary/secondary/tertiary) carry hierarchy. *(Apple HIG; Pratham Rasal)*
- **Arc / Raycast:** dark-first; **subtle borders instead of shadows for depth; luminance hierarchy instead of weight hierarchy**; spring physics for reordering; transitions "instant but not abrupt — speed with grace"; one signature *delighter* for the halo effect. *(efficient.app; CXL)*
- **AI apps 2025–26:** **streaming text containers**, skeleton loaders, **confidence indicators**, ambient/adaptive layouts, multimodal (voice+touch), anticipatory/predictive surfaces. *(Groovyweb; Codebridge)*

JAM HQ already has the bones (glass, dark, motion, the orb). The work is to trade its *gamer-HUD* dialect for a *visionOS-meets-Linear* one: calmer, deeper, more legible, more alive.

---

## 1. Moodboard Direction

**The feeling:** *standing inside a calm, intelligent machine at night.* Deep space-black, panes of real frosted glass lit from behind by a slow aurora, one confident accent of light per room, big quiet numbers, and an intelligence that breathes. Less "mission-control HUD," more **"visionOS dashboard designed by Linear, scored like a film."**

**Texture & material:** layered frosted glass with genuine depth — *darker* glass for the canvas and section dividers, *lighter/vibrant* glass only for the one interactive hero per screen. Depth comes from **luminance + hairline borders, not heavy drop-shadows or neon glow.** A faint film grain and a slow aurora keep it alive without noise.

**Light:** the aurora and the orb are the only "neon." Everything else is graphite, slate, and bone-white, with a single accent acting as *light* (a glow on the focal element), never as paint across the whole screen.

**Reference pull (for feeling, not copying):**
- *visionOS Control Center / widgets* → the glass, the vibrancy, the depth.
- *Linear app* → the restraint, the spacing rhythm, the quiet type.
- *Arc sidebar / Raycast* → luminance hierarchy, hairline borders, spring motion.
- *Apple Fitness rings / Oura* → big legible numbers, one ring as hero, calm data.
- *Perplexity / ChatGPT* → streaming intelligence, confidence cues.
- *Tesla app* → glanceable dark control, status without rainbow.

**Three words:** *Deep · Quiet · Alive.*

---

## 2. Aesthetic Principles to Apply

1. **Luminance hierarchy over weight hierarchy.** Establish importance with brightness and glass density, not by bolding and color. (Arc/Raycast)
2. **Vibrancy tiers.** Exactly three text levels: primary (bone white), secondary (slate), tertiary (graphite). No more ad-hoc greys. (visionOS)
3. **Darker = structure, lighter = interactive.** The canvas and dividers are the darkest glass; the one thing you should touch on a screen is the lightest. (visionOS)
4. **Depth from borders, not shadows.** Hairline 1px borders (white 8–12%) + subtle inner light define cards. Kill heavy neon drop-shadows. (Arc)
5. **Color is functional, singular, per surface.** One accent leads each surface; supporting elements go neutral. Reserve a second color only for true semantic state (success/warn/danger). (Linear)
6. **Type whispers.** Sentence-case humanist sans; light/medium weights for titles; numbers are the only "loud" element. 12px floor. (Linear)
7. **One hero per screen.** Everything else is quiet and collapsible. Restraint is the luxury. (Linear)
8. **Motion is physical and fast.** Spring for reordering/entry; 120–320ms; "speed with grace." (Arc)
9. **The intelligence is present, not hidden.** It streams, it greets, it nudges once. (AI 2025)
10. **One signature delighter,** not confetti everywhere. (Arc fidget-logo principle)

---

## 3. Specific UI Upgrades (mapped to JAM HQ)

**Global**
- **Replace all emoji-as-icons** (🎯🥷🏆🤸) with a cohesive stroke-icon set. *(Top credibility win — doing this now.)*
- **Two material tiers, not one:** define `.glass-canvas` (darkest, for the screen bg + dividers) and `.glass-hero` (lighter, vibrant, for the one focal card). Demote every other card to a near-flat `.panel` (hairline border, almost no fill).
- **Depth pass:** remove neon `box-shadow` glows from cards; depth = 1px hairline + a 1px top inner-highlight (`inset 0 1px 0 rgba(255,255,255,0.05)`). Keep glow *only* on the orb and the single hero metric.
- **Vibrancy text tokens:** `--text` (primary), `--text-2` (secondary), `--text-3` (tertiary) — and use only these three.
- **Color discipline:** confine the 8 domain colors to the Map; everywhere else those items get a neutral dot. Desaturate the accent palette ~12%.

**Command**
- Make the **alignment gauge + the single next mission** the hero pane (lighter glass), everything else (check-in, momentum, wins) demoted to flat panels below the fold.
- **Stream the AI brief** in, line by line, with a soft caret. Add a small **confidence/"source" line** ("based on readiness, calendar, 3 open loops").
- A single **proactive line** at the top when something changed ("Readiness dropped — I moved today to recovery").

**Move**
- The **movement pyramid** and **body radar** become the hero viz; the phase card + working-on demote to panels. Animate the pyramid fill on scroll-into-view.
- Skill drills: lighten the dense mono labels (the type pass started this).

**Map**
- The **orbital Life Map** is already your signature — lean in. Add gentle parallax: nodes drift a few px with device tilt / scroll. Confine all domain color here.

**Build**
- Collapse ONA/Podium/Studio into a top **segmented control** (Raycast-style), with Overview = Action Center + Workbench only. One screen, not three stacked.

**Intelligence**
- Streaming replies (see motion). A persistent **orb state**: calm when idle, a slow breath when it has a proactive nudge.
- A **command palette** (long-press the orb / ⌘-style): type to jump to any skill, project, or action ("plan my week," "decompose a goal"). This is the Raycast move that screams premium.

---

## 4. Motion & Animation Ideas (premium-inspired)

- **Streaming AI text** (ChatGPT/Perplexity): tokens appear with a 1px blinking caret; the card height springs as it grows. Kill the "THINKING…" blink — replace with a shimmering gradient line that resolves into text.
- **Spring reordering** (Arc): missions and inbox items reorder with spring physics; **swipe-to-complete / swipe-to-triage** with a rubber-band and a satisfying snap.
- **Morphing transitions** (Arc): tapping a skill/project should *expand from the card it lives in* (shared-element grow), not cut to a new screen.
- **Number roll** (Apple Fitness): every changing stat counts up; the alignment gauge **sweeps** when readiness changes (not just on mount).
- **Vibrancy on press** (visionOS): pressed elements brighten/pull-forward for a frame, not just scale.
- **Parallax depth** on the Map and hero cards: 2–6px layer drift on scroll/tilt → spatial feel.
- **One signature delighter** (Arc fidget): the orb is spinnable/“chargeable” when idle — a tiny, optional moment of joy. Reserve confetti for skill mastery + campaign completion only.
- **Motion contract:** durations 120 (press) / 220 (cards & sheets) / 320 (screen); entry easing `cubic-bezier(0.2,0.7,0.2,1)`, exit `cubic-bezier(0.4,0,0.2,1)`; springs for reorder/expand. Nothing > 360ms. Motion must communicate state — never decorate.

---

## 5. Before / After Plan

| Area | Before (today) | After (this direction) |
|---|---|---|
| **Labels** | 9px wide-tracked UPPERCASE mono everywhere | sentence-case Inter, 11–12px, quiet *(done in pass 1)* |
| **Icons** | emoji (🎯🥷🏆) | cohesive custom stroke set |
| **Depth** | neon drop-shadow glow on every card | hairline borders + inner highlight; glow only on orb/hero |
| **Cards** | all identical glass heroes | 3 tiers: canvas / hero / flat panel |
| **Color** | 6 surface + 8 domain + tier + discipline (rainbow) | one accent per surface; domain color only in Map; desaturated |
| **Hierarchy** | 6–8 equal cards per screen | one luminous hero + quiet panels, progressive disclosure |
| **Text greys** | many ad-hoc opacities | 3 vibrancy tiers |
| **AI** | hidden, pops in all at once, blinking dots | opens by default *(done)*, **streams**, one proactive nudge |
| **Motion** | stagger + confetti-heavy | streaming, spring reorder, morph-expand, number roll; confetti rare |
| **Nav/find** | features buried in buttons | command palette to jump anywhere |
| **Type floor** | down to 6.5px | 12px floor |

**Sequence:** (a) finish the type/restraint pass *(in progress)* → (b) emoji→icons → (c) material/depth tiers + vibrancy tokens → (d) streaming AI + orb state → (e) spring/swipe/morph motion → (f) command palette.

---

## 6. Exact Instructions (hand to Claude / Fable / a developer)

```
Refine JAM HQ (dark, mobile-first React PWA) from a "sci-fi HUD" look to a calm,
premium "visionOS-meets-Linear" look. Keep all features. Apply RESTRAINT.

DESIGN TOKENS (enforce, no off-scale values):
- Radius: 12 / 16 / 20 / 999 only.
- Space: 4 / 8 / 12 / 16 / 24 / 32 only. Card padding = 16.
- Type (Inter; min 12px): label 12 / body 14 / subtitle 16 / title 20–26 /
  hero-number 40–64. Weights 400/510/600. Sentence case. Bebas display reserved
  for hero NUMBERS only (scores, %), never body labels.
- Text vibrancy, 3 tiers only: --text #F5F5F7 / --text-2 #A7ADBA / --text-3 #6B7280.
- Color: ONE accent per surface (Command cyan, Map teal, Move green, Build orange,
  Intelligence violet) used as LIGHT on the single hero element; everything else
  neutral. Confine the 8 domain colors to the Map only. Desaturate accents ~12%.

MATERIAL (visionOS-style):
- Three card tiers: .glass-canvas (darkest, screen bg + dividers),
  .glass-hero (lighter, vibrant, ONE per screen, the interactive focal point),
  .panel (near-flat, hairline 1px border white 10%, ~2% fill, NO glow).
- Depth = hairline border + inset top highlight (inset 0 1px 0 rgba(255,255,255,.05)),
  NOT drop-shadow glow. Remove neon box-shadows from cards. Keep glow only on the
  AI orb and the single hero metric.
- Remove the HUD corner-ticks (done). Keep aurora + faint grain.

LAYOUT: one luminous hero per screen; demote everything else to flat panels;
collapse secondary content by default (progressive disclosure). Build uses a top
segmented control (Overview / ONA / Podium / Studio), not a long stack.

ICONS: replace ALL emoji-as-icons with one cohesive stroke set (1.75px), matching
the existing Lucide-style icons. Map per domain/discipline/mission-kind.

AI PRESENCE: brief opens by default and is Command's hero; STREAM responses token
by token with a 1px caret; replace "THINKING…" with a shimmering gradient line;
add one proactive line when state changed; orb breathes when it has a nudge.

MOTION CONTRACT: 120ms press / 220ms cards+sheets / 320ms screens; entry
cubic-bezier(0.2,0.7,0.2,1), exit (0.4,0,0.2,1); SPRING for reorder + card-expand.
Add: streaming text, swipe-to-complete (missions) & swipe-to-triage (inbox),
shared-element morph when opening a skill/project, number roll on stat changes,
gauge sweep on value change. Reserve confetti for skill mastery + campaign
completion ONLY. Nothing slower than 360ms; motion must communicate, not decorate.

DELIGHT: one signature moment (the spinnable idle orb). "Since last week" deltas
(▲4) on the alignment gauge and domain scores.

NON-NEGOTIABLES: 12px type floor, sentence case, no emoji icons, one accent per
surface, depth via borders not glow, AI streams. Subtract before adding.
```

---

*The through-line: JAM HQ doesn't need more — it needs **deeper, quieter, and more alive.** Restraint is the upgrade; presence is the magic.*

**Sources:** [Linear design — LogRocket](https://blog.logrocket.com/ux-design/linear-design/) · [Typography & spacing systems — Nathan Lane](https://nathanlane.info/posts/design-system-typography-spacing/) · [Vibrancy in Vision Pro](https://medium.com/@prathamrasal71583/vibrancy-in-apples-vision-pro-b85162244b10) · [Design Spatial UI — Apple WWDC](https://developer.apple.com/videos/play/wwdc2023/10076/) · [Arc + Raycast design](https://efficient.app/integrations/arc-raycast) · [Micro-interaction examples — CXL](https://cxl.com/blog/micro-interaction-examples/) · [AI UI/UX trends 2026 — Groovyweb](https://www.groovyweb.co/blog/ui-ux-design-trends-ai-apps-2026)
