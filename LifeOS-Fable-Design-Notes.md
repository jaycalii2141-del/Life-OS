# LIFE OS — Fable Design Notes

**Deliverable:** `LifeOS-Fable-Design.html` — a single self-contained interactive prototype (open in any browser; renders as a framed iPhone on desktop, full-bleed on mobile). No build step; fonts via Google Fonts CDN.

## Direction
Premium dark HUD — a high-performance cockpit that stays warm and human. One leading accent per surface (Today cyan, Train lime, Create magenta, ONA red, Mind gold, Agents violet) on near-black `#06060A`, glass cards with hairline borders and the signature L-bracket corner ticks, mesh-gradient glows behind every hero. Bebas Neue for display, Inter for body, JetBrains Mono for eyebrows/labels/stats.

## Motion system (all implemented)
- **Boot splash** — conic-gradient orb blooms in, "LIFE OS" wordmark reveals by tightening letter-spacing, tagline rises, whole thing lifts away (~2.5s) into onboarding (4 cascading highlight cards + "Let's build").
- **Staggered cascade** on every tab switch (~50ms per card, `cubic-bezier(.2,.7,.2,1)`); in-place state changes re-render without re-animating.
- **Bottom sheets** for everything modal: spring slide-up, slide-down + scrim-fade on close.
- **Tactile press** (`scale .96`) + `navigator.vibrate` haptics on everything interactive.
- **Confetti bursts** on: One Thing complete, tracker "✓ GOT IT", session logged, inbox zero, upgrade accepted.
- **Skeleton shimmer** while the AI coach "thinks" in Build My Session. Reduced-motion respected.

## What to look at first
1. **Train** (the showpiece): body radar (current vs dashed goal), Working On rollup, all six real skill trees with tier-colored rails (Foundation lime → Developing cyan → Advanced gold → Elite red). Tricking is open by default with **Butterfly twist** expanded — numbered drill cards each carry the cue, the red **⚠ common-fault → fix**, the green **✓ ready-when gate**, and a tap-to-cycle tracker chip (TRACK → WORKING → ✓ GOT IT). The Fundamentals panel (10 pillars for tricking, with why/how/standard) scrolls horizontally above the tiers.
2. **Build My Session** sheet: focus + duration → "Blindspots your coach is watching" → skeleton load → structured plan (prep → primary → supporting strength → cool-down) → Log = confetti.
3. **Companion** (orb, bottom-left): chat that replies with one-tap action chips (Block time, Log session, Save, Set focus, Draft email) that flip to ✓ done. Try "Coach me on my cork progression."
4. **Mind**: triage the 3 captures to reach the inbox-zero celebration; Weekly Review sheet has the animated "where your attention actually went" bar chart; Monthly Upgrade card runs the accept/dismiss v3→v4 loop.
5. **Capture FAB** (+): tag chips per life domain, lands in Mind with a "CAPTURED" toast and badge update.

All content is real app data — discipline trees from `data.js`, drills/fundamentals/blindspots/microcycle from `coaching.js`, agents from `AIScreen.jsx`, ONA stats/roster/initiatives, brand folders, and the hook bank.
