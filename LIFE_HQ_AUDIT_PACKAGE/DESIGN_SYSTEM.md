# JAM HQ / Life HQ — Design System

**Document type:** Exhaustive design-system reference for external design audit
**Product:** "JAM HQ" / "Life HQ" — a dark "aurora glass" React PWA
**Source of truth:** `app/src/styles.css`, `app/src/components/atoms.jsx`, `app/src/components/icons.jsx`, `app/src/components/Sheet.jsx`, `app/src/components/TabBar.jsx`, `app/src/components/ObjectMenu.jsx`

Every value below is pulled verbatim from the code. This is a documentation artifact, not a summary — exact hex, px, ms, easing, and class names are reproduced so an auditor can verify against source.

---

## 0. System overview

The app is a **dark-only**, **single-iPhone-frame** PWA built on a glass-morphism material system. Depth comes from **hairline borders + an inset top highlight**, not heavy drop-shadows. A slow-drifting aurora gradient and a fine film-grain texture sit behind everything so the surface "feels alive and breathing, not static" (per source comment). Color accents are reserved and semantic — the system explicitly de-noised itself in recent passes (see the "restraint changes" notes throughout).

There are **two visual modes**, switched via the `data-vibe` attribute on `<html>`:

- **`data-vibe="glow"`** — the original "command-center" skin (default behavior of the base tokens): mesh heroes, glow utilities, shimmer, HUD grid.
- **`data-vibe="calm"`** — "CALM is the default" per the V2 comment block. Oura/Linear restraint: no glow, no HUD ticks, no shimmer, flat surfaces, stronger whitespace, "signal over spectacle." Selected via Settings → Visual system.

---

## 1. COLORS

### 1.1 Core `:root` tokens

All defined in `:root` in `styles.css`. Hex/rgba exactly as authored.

| Token | Value | Intended usage |
|---|---|---|
| `--bg-0` | `#0A0B0D` | Base app background (deepest). Used by `.screen-host`. Near-black with a hint of blue. |
| `--bg-1` | `#101214` | Mid background. Used by `.sheet`, mesh gradient floor. |
| `--bg-2` | `#16191C` | Raised background. Mesh gradient ceiling. |
| `--text` | `#F5F5F7` | Primary text (off-white). |
| `--text-2` | `#A7ADBA` | Secondary text (cool grey). |
| `--text-3` | `#6B7280` | Tertiary text (dim slate). |
| `--muted` | `#9AA0AC` | Muted labels / eyebrows / secondary captions. |
| `--dim` | `#6B7280` | Dimmest text — section-label, hints, empty-state copy. |
| `--line` | `rgba(255,255,255,0.06)` | Hairline border (default tier). |
| `--line-strong` | `rgba(255,255,255,0.11)` | Stronger hairline border (panel / strong tier). |
| `--glass` | `rgba(255,255,255,0.035)` | Default glass fill tint. |
| `--top-hi` | `inset 0 1px 0 rgba(255,255,255,0.05)` | The signature inset top-highlight box-shadow — the depth primitive used across every material tier. |

### 1.2 Accent palette

| Token | Value | Role / where used |
|---|---|---|
| `--ona-red` | `#FF6B5B` | "ONA" brand red / alert/critical accent. Build tab color, `.pill-red`, `.glow-red`, `glow-pulse-red`. |
| `--ona-blue` | `#1E6F9F` | "ONA" brand blue. Root ambient glow, `brand-motionmob`. |
| `--cyan` | `#45B7E8` | Primary interactive accent. Default bar-fill, FAB, Command tab, `ai-caret`, `obj-pulse`, gauges/sparklines default. |
| `--violet` | `#2DD4BF` | NOTE: named "violet" but is actually a **teal** (`#2DD4BF`). Secondary accent — gradient endpoints, `.pill-violet`, `.glow-violet`. |
| `--magenta` | `#FF8A4C` | NOTE: named "magenta" but is actually a **warm orange** (`#FF8A4C`). Content/creative accent in aurora + mesh. |
| `--lime` | `#34D399` | NOTE: named "lime" but is a **green** (`#34D399`). Perform/Move tab color, `.pill-lime`, ONA-elite brand. |
| `--gold` | `#E9C46A` | Map tab color, `.pill-gold`, `.glow-gold`, gold aurora. |
| `--orange` | `#F4A261` | Warm secondary orange. `.pill-orange`, content mesh, acro-wooks brand. |

**Auditor note:** several accent names are misnomers — `--violet` is teal, `--magenta` is orange, `--lime` is green. The literal hex values are what render. The effective palette is a cyan → teal → green → gold → orange → coral-red warm-cool spread, not a true RGB-violet/magenta set.

### 1.3 Ambient background gradients

**`#root` background** (the area outside the phone frame):
```
radial-gradient(ellipse 800px 600px at 20% 10%, rgba(30,111,159,0.06) 0%, transparent 60%),
radial-gradient(ellipse 700px 500px at 80% 90%, rgba(45,212,191,0.05) 0%, transparent 60%),
#000
```
Faint ona-blue (top-left) + teal (bottom-right) wash over pure black.

**`#root::before`** — faint HUD grid behind the device: two 1px white-`0.018` line gradients at `48px × 48px`, masked by `radial-gradient(ellipse 70% 70% at 50% 50%, #000 30%, transparent 80%)`. Hidden in calm mode.

**`.screen-host::before`** — the living aurora inside the screen (z-index 0, under glass):
```
radial-gradient(circle 360px at 16% 12%, rgba(69,183,232,0.10), transparent 62%),   /* cyan */
radial-gradient(circle 420px at 86% 26%, rgba(45,212,191,0.09), transparent 62%),   /* teal */
radial-gradient(circle 480px at 52% 96%, rgba(255,138,76,0.07), transparent 62%),   /* orange */
radial-gradient(circle 300px at 90% 88%, rgba(233,196,106,0.05), transparent 62%)   /* gold */
```
`filter: blur(6px)`, animated by `auroraDrift 30s ease-in-out infinite alternate`.

**`.screen-host::after`** — film grain: inline SVG `feTurbulence` fractal noise, `opacity: 0.035`, `mix-blend-mode: overlay`, animated by `grainShift 1.6s steps(3) infinite`.

### 1.4 Mesh hero gradients

Five named hero backgrounds. Each is layered radial color blobs over a `linear-gradient(140deg, #101214 0%, #16191C 100%)` floor. Applied via `mesh={...}` on `HUDCard`.

| Class | Color blobs (radial) |
|---|---|
| `.mesh-readiness` | cyan `rgba(69,183,232,0.13)` @15%/20%, teal `rgba(45,212,191,0.11)` @90%/10%, coral `rgba(255,107,91,0.10)` @50%/100% |
| `.mesh-train` | cyan `rgba(69,183,232,0.16)` @80%/20%, green `rgba(52,211,153,0.08)` @20%/90% |
| `.mesh-content` | orange `rgba(255,138,76,0.18)` @20%/20%, orange `rgba(244,162,97,0.16)` @90%/100% |
| `.mesh-ona` | coral `rgba(255,107,91,0.20)` @10%/0%, green `rgba(52,211,153,0.10)` @100%/100% |
| `.mesh-ai` | teal `rgba(45,212,191,0.30)` @50%/0%, cyan `rgba(69,183,232,0.20)` @50%/100% (the most saturated hero) |

In **calm mode** all five flatten to `linear-gradient(150deg, #0D0D15 0%, #0A0A10 100%)` (near-solid quiet panels).

### 1.5 Glow utilities

Box-shadow halos, always combined with `--top-hi`. Suppressed entirely in calm mode (`box-shadow: none !important`).

| Class | Shadow |
|---|---|
| `.glow-red` | `0 0 64px -22px rgba(255,107,91,0.40)` + `0 0 0 1px rgba(255,107,91,0.16) inset` |
| `.glow-cyan` | `0 0 56px -22px rgba(69,183,232,0.30)` |
| `.glow-violet` | `0 0 56px -22px rgba(45,212,191,0.30)` |
| `.glow-lime` | `0 0 56px -22px rgba(52,211,153,0.24)` |
| `.glow-gold` | `0 0 48px -22px rgba(233,196,106,0.28)` |

### 1.6 Brand gradients

Per-sub-brand 145° linear gradients (used for brand tiles/badges):

| Class | Gradient | Text override |
|---|---|---|
| `.brand-jaymuvs` | `#FF6B5B → #8a001b` | — |
| `.brand-motionmob` | `#1E6F9F → #002a8a` | — |
| `.brand-ona-elite` | `#34D399 → #5a8a1e` | `color: #101214` (dark text on bright) |
| `.brand-jk-acro` | `#2DD4BF → #5a2680` | — |
| `.brand-acro-wooks` | `#F4A261 → #8a4520` | — |
| `.brand-ppp` | `#F5F5F7 → #8a8a95` | `color: #101214` |

---

## 2. TYPOGRAPHY

### 2.1 Font families

Imported from Google Fonts (`Bebas Neue`, `Inter` weights 300–800, `JetBrains Mono` weights 400–700).

| Variable | Stack | Role |
|---|---|---|
| `--font-display` | `'Bebas Neue', 'Helvetica Neue', sans-serif` | Display / hero numerals / section titles. Tall condensed all-caps face. |
| `--font-body` | `'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif` | Body, labels, eyebrows. |
| `--font-mono` | `'JetBrains Mono', 'SF Mono', Menlo, monospace` | Data, pills, tab labels, timestamps, section-label. |

### 2.2 Type classes (exact specs)

| Class | Font | Size | Weight | Letter-spacing | Other |
|---|---|---|---|---|---|
| `.display` | display (Bebas) | (inline per-use) | — | `0.02em` | Used at 22 (ObjectMenu title), 36 (StatTile), `size*0.32` (RadialGauge center), 46 (boot word). |
| `.section-title` | display (Bebas) | `26px` | — | `0.01em` | `line-height: 1`, `color: var(--text)`. |
| `.eyebrow` | **body (Inter)** | `11px` | `600` | `0.005em` | `text-transform: none`, `color: var(--muted)`. **Restraint change** — see below. |
| `.section-label` | mono (JetBrains) | `10px` | `500` | `0.22em` | `text-transform: uppercase`, `color: var(--dim)`. The remaining loud mono-caps label. |
| `.mono` | mono (JetBrains) | (inline per-use) | — | — | Generic monospace utility. |

### 2.3 Restraint changes (documented in source)

The CSS comments explicitly record two de-noising decisions:

1. **`.eyebrow` was re-grounded.** Comment: *"Labels are quiet and legible now — sentence-case Inter, not shouting mono caps. This single change de-noises most of the app."* The eyebrow moved from uppercase mono to **sentence-case Inter 11px/600**, near-zero tracking (`0.005em`), no transform.
2. **`.section-title`** dropped to a tame `0.01em` tracking on Bebas at 26px — readable, not theatrical.

`.section-label` (mono, `0.22em`, uppercase) is the one surviving "HUD" label style, used sparingly.

### 2.4 Boot/splash type

- `.boot-word` — display, `46px`, `line-height: 1`, gradient text-fill `linear-gradient(90deg, #45B7E8, #2DD4BF, #FF8A4C)` clipped to text. Animates from `letter-spacing: 0.5em` → `0.06em`.
- `.boot-tag` — `12px`, `color: var(--muted)`, `letter-spacing: 0.02em`, `line-height: 1.5`, `max-width: 240px`.

---

## 3. SPACING & RADII

### 3.1 Radius ladder

| Surface | Radius | Class |
|---|---|---|
| Panel | `16px` | `.panel` |
| Glass / glass-canvas | `18px` | `.glass`, `.glass-canvas` |
| Glass-strong | `20px` | `.glass-strong` |
| Glass-hero | `22px` | `.glass-hero` |
| Tab bar | `22px` | TabBar inline |
| FAB | `18px` | TabBar inline |
| Sheet | `28px 28px 0 0` | `.sheet` (top corners only) |
| Pills | `999px` | `.pill`, `.pill-dot`, `.bar-track`, `.bar-fill` |
| ObjectMenu action row | `13px` | inline |
| ObjectMenu icon chip | `9px` | inline |
| EmptyState | `14px` | inline |
| Skeleton | `7px` | `.skeleton` |

The ladder reads small→large: **panel 16 < glass/canvas 18 < strong 20 < hero 22**, with sheet (28) and pills (999) as outliers.

### 3.2 Observed padding/spacing conventions

- `.screen-content`: `padding: 0 16px` (glow) / `0 18px` (calm — "a touch more breathing room").
- `.screen-scroll`: `padding-top: 56px` (below status bar), `padding-bottom: 130px` (above tab bar). Full-bleed PWA variant uses `env(safe-area-inset-*)`.
- `HUDCard` default `padding: 16`.
- `.sheet`: `padding: 14px 20px 32px`.
- `.pill`: `padding: 4px 9px`, `gap: 6px`.
- `SectionHead`: `margin-bottom: 12`, eyebrow `margin-bottom: 6`.
- `EmptyState`: `padding: 24px 18px`, `gap: 8`.
- ObjectMenu action rows: `padding: 12px 13px`, `gap: 12`, list `gap: 7`.
- Standard small gaps observed: 3 / 6 / 7 / 8 / 9 / 12 px.

---

## 4. MATERIAL TIERS

Depth model (per source comment): *"depth from hairline + inset top highlight, not drop-shadow glow. Canvas (recessed) < panel (flat) < hero."* Every tier is `position: relative`.

| Tier | Background | Border | Radius | Backdrop-filter | Shadow |
|---|---|---|---|---|---|
| `.glass-canvas` (recessed) | `rgba(255,255,255,0.02)` | `--line` | 18 | none | none |
| `.panel` (flat) | `rgba(255,255,255,0.022)` | `--line-strong` | 16 | none | `--top-hi` |
| `.glass` | `--glass` (`0.035`) | `--line` | 18 | `blur(20px) saturate(150%)` | `--top-hi` |
| `.glass-strong` | `rgba(255,255,255,0.05)` | `--line-strong` | 20 | `blur(24px) saturate(165%)` | `--top-hi` |
| `.glass-hero` | (transparent — mesh shows through) | `--line-strong` | 22 | `blur(24px) saturate(170%)` | `--top-hi` + `0 24px 60px -32px rgba(0,0,0,0.7)` |

**Depth reading:** opacity climbs `0.02 → 0.022 → 0.035 → 0.05` as the tier rises; blur climbs `20 → 24px`; saturate climbs `150 → 170%`. The hero is the only tier carrying a real ambient drop-shadow. The inset top-highlight (`--top-hi`) is the unifying gloss that fakes a lit top edge on every surface above canvas.

**Tab bar material** (TabBar inline, not a tier class): `background: rgba(11,11,18,0.78)`, `backdrop-filter: blur(28px) saturate(180%)`, `border: 1px solid rgba(255,255,255,0.08)`, `radius 22`, `box-shadow: 0 18px 50px rgba(0,0,0,0.55)` — the strongest blur/saturation in the app.

**Scrim** (`.scrim`): `rgba(0,0,0,0.6)` + `backdrop-filter: blur(8px)`, `z-index: 150`.

**Sheet** (`.sheet`): solid `var(--bg-1)` (not glass), `border-top: 1px solid var(--line-strong)`, `box-shadow: 0 -20px 60px rgba(0,0,0,0.6)` (calm: `0 -16px 48px rgba(0,0,0,0.5)`).

---

## 5. COMPONENTS — atoms.jsx

Each export from `atoms.jsx`, with props and purpose.

### 5.1 `HUDTicks()`
Returns `null`. **Decommissioned** — comment: *"Corner ticks removed for a calmer, less 'sci-fi template' look (kept as a no-op so existing call sites don't need editing). Restraint reads premium."* Still imported by `HUDCard` and `TabBar` but renders nothing.

### 5.2 `TickCounter({ value, duration = 1100, format = v=>v, style, className })`
Animated count-up from 0 → `value` via `requestAnimationFrame`, **easeOutCubic** (`1 - (1-p)^3`). Renders a `<span>`. Used inside `StatTile`. Re-runs on `value`/`duration` change.

### 5.3 `SectionHead({ eyebrow, title, trailing, style })`
Flex row, `align-items: flex-end`, `space-between`, `margin-bottom: 12`. Renders `.eyebrow` (mb 6) over `.section-title`, plus optional `trailing` node on the right.

### 5.4 `ProgressBar({ value, color = 'var(--cyan)', height = 4, animated = true })`
Renders `.bar-track` > `.bar-fill`. Animates width from 0 → `value%` after a 50ms timeout (so the CSS `width` transition fires). Adds inline `boxShadow: 0 0 12px {color}`. Default cyan, 4px tall.

### 5.5 `Pill({ children, variant = 'default', style, dot })`
Maps `variant` → class: `default | red | cyan | lime | violet | gold | orange | muted`. Optional leading `dot` (colored 6px circle via `.pill-dot`). See §7 for pill CSS.

### 5.6 `HUDCard({ children, style, className='', glow, mesh, padding = 16, onClick })`
The workhorse card. Composes classes `glass hud` + `glow-{glow}` + `mesh-{mesh}` + `pressable` (if `onClick`) + any `className`. Renders `<HUDTicks/>` (no-op) then children. Default `padding: 16`.

### 5.7 `ConfettiBurst({ trigger, colors = [...6 brand colors] })`
Default colors: `['#FF6B5B','#45B7E8','#2DD4BF','#34D399','#E9C46A','#F4A261']`. On `trigger` change, spawns **50 pieces** (comment says 60; code generates 50) radiating from center: angle = even distribution + jitter, distance `120–260px`, rotation `-360..+360deg`, staggered `delay 0–80ms`. Each is a `.confetti-piece` driven by `--dx/--dy/--rot` CSS vars. Cleared after 1300ms. Host is `.confetti-host` (`z-index: 200`).

### 5.8 `StateMeter({ label, value, max = 10, color, onChange })`
Horizontal swipeable 1–N bar selector (a touch/drag rating control). Renders `max` flex bars, each `height: 14`, `border-radius: 2`, filled = `color` with `0 0 8px {color}80` glow, empty = `rgba(255,255,255,0.06)`. Drag math maps clientX across first→last bar to a `1..max` value; calls `onChange(next)`. Header row: `.eyebrow` label + mono value (11px, colored). `touch-action: none`.

### 5.9 `TimelineEvent({ time, label, color, kind, last })`
Vertical timeline row: a 10px colored dot (`0 0 10px {color}` glow) + a fading 1px rail (gradient `rgba(255,255,255,0.18)→0.03`, hidden if `last`). Content: mono `time` (11px muted) + optional muted `kind` Pill + 14px/500 `label`.

### 5.10 `StatTile({ label, value, suffix, color = 'var(--text)', format = v=>Math.round(v), style })`
Big-number tile: `.eyebrow` label (mb 4) over a `.display` 36px number (`line-height: 0.9`) wrapping a `TickCounter`, with optional mono `suffix` (11px muted, baseline-aligned).

### 5.11 `EmptyState({ icon, text, style })`
Shared blank-state affordance: centered column, `padding: 24px 18px`, `border: 1px dashed var(--line-strong)`, `background: rgba(255,255,255,0.015)`, `radius 14`. Optional dim `icon` + `.eyebrow` dim text (`max-width: 240`, `line-height: 1.5`). Comment: *"a calm, dashed 'add something here' affordance … visually consistent across the app."*

### 5.12 Data-visuals (SVG primitives)

Comment: *"SVG primitives that turn numbers into something you can read at a glance. All theme via a passed accent color."*

**`RadialGauge({ value = 0, size = 132, stroke = 11, color = '#45B7E8', label, sub })`**
Glowing arc gauge 0–100. Track circle `rgba(255,255,255,0.07)`; value arc stroked with a `linearGradient` `{color} → #2DD4BF`, `strokeLinecap: round`, `drop-shadow(0 0 6px {color}99)`. Dash-offset animates `900ms cubic-bezier(0.2,0.7,0.2,1)`. SVG rotated `-90deg` so fill starts at top. Center stack: `.display` number at `size*0.32`, optional `.eyebrow` label (in accent color), optional mono `sub` (8px, dim, `0.1em`). Clamps value 0–100.

**`Sparkline({ data = [], width = 120, height = 36, color = '#45B7E8', showDot = true })`**
Tiny trend line with soft area fill (vertical gradient `{color}` `0.28 → 0`) and a glowing endpoint dot (`r 2.8`, `drop-shadow(0 0 5px {color})`). Line `stroke-width 2`, round caps/joins, `drop-shadow(0 0 4px {color}88)`. Auto-scales to data min/max. Empty data → blank SVG.

**`RadarChart({ axes = [], size = 220, color = '#45B7E8', goalColor = 'rgba(255,255,255,0.25)', goal })`**
Spider chart for multi-axis scores (`axes: [{label, value 0–100}]`). Draws 4 concentric grid polygons (25/50/75/100, `rgba(255,255,255,0.06)`), radial spokes, optional dashed `goal` ring (`3 3` dash), then the data polygon filled with a `radialGradient` (`{color}` `0.45 → 0.12`), `stroke-width 2`, `drop-shadow(0 0 6px {color}66)`. Vertex dots `r 3` + mono axis labels (`8.5px`, muted) placed at radius 122. `R = size/2 - 26`.

**`MiniBars({ items = [], max, height = 8 })`**
Horizontal labeled comparison bars. Each row: 70px mono truncating label (11px muted) + flex track (`rgba(255,255,255,0.05)`, `radius 999`) with fill (`it.color || #45B7E8`, `0 0 8px {color}66` glow, width animates `700ms cubic-bezier(0.2,0.7,0.2,1)`) + 22px right-aligned mono value (in item color). `max` auto-derives from largest value if absent. Row `gap: 9`.

### 5.13 Sheet — `Sheet.jsx`

`Sheet({ open, onClose, children, maxHeight = '90%' })`. Owns its own mount lifecycle so it can **animate out before unmounting** (instead of snapping shut). On `open=false` it sets `closing`, waits **240ms** (matches `sheetOut`/`scrimOut`), then unmounts. Renders `.scrim` (+`.scrim-closing`) over `.sheet` (+`.sheet-closing`) containing a `.sheet-handle` grabber and children. `overflow-y: auto`, clamped to `maxHeight`.

### 5.14 TabBar — `TabBar.jsx`

`TabBar({ active, onChange, onFab, onFabLong, badges = {} })`. Four tabs + a floating capture FAB. The AI ("Intelligence") is reached via an orb everywhere, so it has no tab.

**TABS** (exported):
| id | label | Icon | color |
|---|---|---|---|
| `today` | Command | `IconTarget` | `#45B7E8` cyan |
| `life` | Map | `IconBrain` | `#E9C46A` gold |
| `perform` | Move | `IconBolt` | `#34D399` green |
| `build` | Build | `IconTrendUp` | `#FF6B5B` coral |

- Container: absolute, full-width, `height: 96`, `z-index: 40`, `pointer-events: none` (children re-enable). A top gradient veil (`transparent → rgba(6,6,10,0.7) → #0A0B0D`) fades content into the bar.
- Bar: insets `12px` L/R, bottom `env(safe-area-inset-bottom)+24px`, `height 60` (see §4 for material).
- Each tab: flex column, `gap 3`, color = tab color if active else `--muted`, `transition: color 220ms`. Active state adds a 22×2 top indicator pill (glowing in tab color) and bumps icon stroke `1.5 → 1.9` and label weight `500 → 700`. Label = mono `9.5px`, `0.1em`, uppercase.
- **Badges:** `badges[id] > 0` renders a small pill (min 15×15) in the tab color, dark text, `0 0 8px {color}` glow, `1.5px solid #101214` ring; shows `9+` past 9.
- **FAB:** `54×54`, `radius 18`, `linear-gradient(135deg, #45B7E8 → #2DD4BF)`, `IconPlus` (size 26, stroke 2.4, dark `#0A0B0D`). Carries `.fab-glow` pulse. Positioned `right 18`, bottom `env(safe-area-inset-bottom)+96`. **Long-press (450ms)** fires `onFabLong`; a short tap fires `onFab` — implemented with a timer + `longPressed` ref guard.

### 5.15 ObjectMenu — `ObjectMenu.jsx`

`ObjectMenu({ open, onClose, title, subtitle, accent = 'var(--cyan)', actions = [], onPrimary, primaryLabel })`. The contextual action layer for an "interactive object." Long-press a major card → this springs up (built on `Sheet`, `maxHeight 86%`) with verbs that fit it. **AI actions run inline** — no jump to a chat window.

**Action shape:** `[{ id, icon, label, hint, tone?, ai?, run }]`
- `ai: false` → `run()` fires, menu closes (navigate/edit/toggle).
- `ai: true` → `run()` returns `Promise<string>`; the text **types itself out in place**.

**Three views** via internal state: `menu | thinking | result`.
- **menu:** action rows (`.pressable .action-in`, staggered `i*32ms`), each `padding 12px 13px`, `radius 13`, `rgba(255,255,255,0.035)` bg, `--line` border. Icon chip 30×30 `radius 9`; AI actions tint the chip `{accent}1c` and show a trailing `IconSparkles` in accent; non-AI show `IconChevronRight` in `--dim`. Row title 14/650, hint 11 dim.
- **thinking:** three `.think-dot` breathing dots in accent + mono "THINKING…" (11px, `0.1em`, muted).
- **result:** `.unfold` container; a **typewriter** reveal (2 chars / 12ms `setInterval`) shows the AI text (14/`line-height 1.55`, `pre-wrap`); the `.ai-caret` class is applied while still typing. Footer: optional primary CTA (flex, 46 tall, `radius 13`, `linear-gradient(135deg, {accent}, #45B7E8)`, dark bold text + `IconArrowRight`) and a "Back" button (`rgba(255,255,255,0.05)`, `--line-strong` border) returning to `menu`.
- Header: accent eyebrow (`'Actions'` or the action label), `.display` 22px title, optional muted subtitle (menu view only), and a 32×32 round close button (`IconClose`).

---

## 6. CARDS, BUTTONS, PILLS — patterns

### 6.1 Cards
The canonical card is `HUDCard` (`.glass .hud` + optional `glow-*` / `mesh-*`). Tier escalation: use `.glass-canvas` for recessed list wells, `.panel` for flat utility rows, `.glass` for default cards, `.glass-strong` for emphasis, `.glass-hero` (with a `mesh-*`) for the top-of-screen hero. Entrance: `cardIn` staggered (see §8).

### 6.2 Press / tactile pattern
`.pressable` is the universal tap target: `transition transform/box-shadow/border-color 180ms cubic-bezier(0.2,0.7,0.2,1)`, `cursor: pointer`, `user-select: none`, `-webkit-tap-highlight-color: transparent`, `touch-action: manipulation`. **Press-scale** is `:active { transform: scale(0.96) }` (an earlier rule set `0.97`; the later override wins at `0.96`). The "press-scale" idiom = attach `.pressable` and let the active-scale do the work.

### 6.3 Buttons
No global `.button` class — buttons are composed inline as `.pressable` boxes:
- **Primary gradient button** (ObjectMenu CTA, FAB): `linear-gradient(135deg, {accent}, #45B7E8)` or `#45B7E8 → #2DD4BF`, dark text `#0A0B0D`, bold (`800`), `radius 13–18`, ~46–54 tall.
- **Secondary/ghost button** (ObjectMenu "Back"): `rgba(255,255,255,0.05)`, `1px solid var(--line-strong)`, muted text, 700.
- Pattern: **dark text on bright gradient** for primary; **translucent fill + hairline** for secondary.

### 6.4 Pills (`.pill` + variants)
Base `.pill`: inline-flex, `gap 6`, `padding 4px 9px`, `radius 999`, **mono `9px`/600**, `letter-spacing 0.14em`, `uppercase`, `1px solid var(--line-strong)`, `background rgba(255,255,255,0.04)`, `white-space: nowrap`. `.pill-dot` = 6px `currentColor` circle.

Colored variants each set `color`, a `0.35`-alpha border in their hue, and a `0.08`-alpha fill:
| Variant | Color | Border / fill base |
|---|---|---|
| `.pill-red` | `--ona-red` | `rgba(255,107,91,…)` |
| `.pill-cyan` | `--cyan` | `rgba(69,183,232,…)` |
| `.pill-lime` | `--lime` | `rgba(52,211,153,…)` |
| `.pill-violet` | `--violet` | `rgba(45,212,191,…)` |
| `.pill-gold` | `--gold` | `rgba(233,196,106,…)` |
| `.pill-orange` | `--orange` | `rgba(244,162,97,…)` |
| `.pill-muted` | `--muted` | (inherits base border/fill) |

### 6.5 Progress bars (`.bar-track` / `.bar-fill`)
Track: `height 4`, `radius 999`, `rgba(255,255,255,0.06)`, clipped. Fill: `radius 999`, default `var(--cyan)`, `transition width 800ms cubic-bezier(0.2,0.7,0.2,1)`, plus a `::after` traveling shine (`bar-shine 2.4s`). In calm mode the shine is removed (`display: none`).

---

## 7. ICONS

### 7.1 System
Lucide-style **stroke-based** inline SVG icons. Comment: *"Stroke-based, 24x24 viewBox."* All routed through the **`Ico`** wrapper:

`Ico({ size = 20, color = 'currentColor', stroke = 1.6, style, children })` → `<svg width/height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0, ...style}}>`. Default size **20**, default stroke **1.6**, rounded caps/joins, `fill: none` (a few icons use `fill="currentColor"` for tiny dot details).

### 7.2 Full icon list (exported)
`IconHome` (target rings), `IconBolt`, `IconPlay`, `IconNinja`, `IconSparkles`, `IconPlus`, `IconCheck`, `IconMic`, `IconChevronRight`, `IconChevronDown`, `IconClose`, `IconLock`, `IconCircle`, `IconFlame`, `IconCamera`, `IconCopy`, `IconUsers`, `IconTrendUp`, `IconTarget`, `IconWarn`, `IconCalendar`, `IconClock`, `IconArrowRight`, `IconSend`, `IconActivity`, `IconSliders`, `IconDownload`, `IconBrain`, `IconInbox`, `IconArchive`, `IconTrash`, `IconBook`, `IconCompass`, `IconHeart`, `IconGlobe`, `IconPulse`.

### 7.3 Domain & kind icon maps

Comment: *"Stroke icons by life domain / mission kind — replaces emoji-as-icons."*

**`DOMAIN_ICON`** (via `domainIcon(id)`, fallback `IconCircle`):
| domain | icon |
|---|---|
| athlete | `IconBolt` |
| business | `IconTrendUp` |
| relationships | `IconHeart` |
| health | `IconPulse` |
| creativity | `IconPlay` |
| learning | `IconBook` |
| adventure | `IconGlobe` |
| growth | `IconCompass` |
| ona | `IconNinja` |
| podium | `IconTrendUp` |
| social | `IconPlay` |
| self | `IconCompass` |
| movement | `IconBolt` |

**`KIND_ICON`** (via `kindIcon(kind)`, fallback `IconCircle`):
| kind | icon |
|---|---|
| focus | `IconTarget` |
| train | `IconBolt` |
| build | `IconTrendUp` |
| ritual | `IconCompass` |

---

## 8. ANIMATIONS

Every `@keyframes` and its driver class, with what it does and where used. Default timing function across interactions: `cubic-bezier(0.2, 0.7, 0.2, 1)` (a quick weightless ease-out).

### 8.1 Ambient / living layer
| Keyframe | Driver | Duration / ease | Effect / use |
|---|---|---|---|
| `auroraDrift` | `.screen-host::before` | `30s ease-in-out infinite alternate` | Slow translate+scale+opacity drift of the aurora blobs — the "alive and breathing" base. |
| `grainShift` | `.screen-host::after` | `1.6s steps(3) infinite` | Jitters the film-grain background-position so texture isn't static. |
| `meshGlow` | `.mesh-*` (under `prefers-reduced-motion: no-preference`) | `13s ease-in-out infinite` | Slow saturate/brightness pulse of hero meshes (`1 → 1.16/1.07 → 1`). |
| `screenFade` | `.screen-content` | `320ms ease` | Opacity fade-in on screen change. |
| `cardIn` | `.screen-content > *` | `340ms cubic-bezier(0.2,0.7,0.2,1) both` | Staggered entrance (`translateY 8→0`, fade). Delays: 0/35/70/105/140/170/200ms, then 225ms for child 8+. Comment: *"quick and weightless, never laggy."* |
| `screenIn` | (defined, generic) | — | `translateY 10→0` + fade variant. |

### 8.2 Command-center / glow flourishes (suppressed in calm)
| Keyframe | Driver | Effect |
|---|---|---|
| `shimmer-cell` | `.shimmer-cell` | `3.5s` brightness pulse (`1 → 1.35`). |
| `pulse-node` | `.pulse-node` | `2.2s` expanding cyan ring + glow (network-node ping). |
| `orb-spin` | `.orb-spin` | `12s linear` rotate (calm: 30s). |
| `orb-spin-fast` | `.orb-spin-fast` | `6s linear` reverse rotate (calm: 18s). |
| `blink` | `.blink` | `1.6s` opacity blink (`1 ↔ 0.3`). |
| `glow-pulse-red` | `.glow-pulse-red` | `3.4s` pulsing red halo + inset ring (critical/alert card). |
| `fab-glow` | `.fab-glow` | `2.6s` expanding cyan FAB ring + lift shadow. |
| `bar-shine` | `.bar-fill::after` | `2.4s` traveling white sheen across progress fills (calm: hidden). |
| `shimmer-cell` etc. all killed in calm | — | `animation: none !important`. |

### 8.3 Interaction-motion layer ("calm at rest, alive on touch")
Comment block: *"Object reacts the instant a long-press registers; AI answers unfold in place."*
| Keyframe | Driver | Duration / ease | Effect / use |
|---|---|---|---|
| `objPulse` | `.obj-pulse` | `520ms cubic-bezier(0.2,0.7,0.2,1)` | Cyan ring flash when a long-press registers on an interactive object. |
| `unfold` | `.unfold` | `300ms cubic-bezier(0.2,0.8,0.2,1)` | Content slides down into place (`translateY -6→0`) — used for AI result reveal. |
| `actionIn` | `.action-in` | `260ms cubic-bezier(0.34,1.4,0.64,1) both` | Springy staggered entrance for ObjectMenu action rows. |
| `thinkDot` | `.think-dot` (×3) | `1.1s infinite`, staggered `0 / 0.15s / 0.3s` | Three breathing dots = "AI thinking." 5px round, `currentColor`. |
| `caretBlink` | `.ai-caret::after` | `0.9s steps(1) infinite` | Blinking `▋` cyan caret appended while AI text streams. |
| (static) | `.obj-active` | — | `border-color: rgba(69,183,232,0.45)` lift while a card's menu is open. |

### 8.4 Overlays
| Keyframe | Driver | Duration / ease | Effect |
|---|---|---|---|
| `scrimIn` | `.scrim` | `240ms ease` | Scrim fade-in. |
| `scrimOut` | `.scrim-closing` | `220ms ease forwards` | Scrim fade-out. |
| `sheetIn` | `.sheet` | `380ms cubic-bezier(0.2,0.7,0.2,1)` | Sheet slides up `translateY 100%→0`. |
| `sheetOut` | `.sheet-closing` | `240ms cubic-bezier(0.4,0,1,1) forwards` | Sheet slides down to dismiss (drives the `Sheet.jsx` 240ms unmount delay). |

### 8.5 Confetti
| Keyframe | Driver | Effect |
|---|---|---|
| `confetti-burst` | `.confetti-piece` | `1100ms cubic-bezier(0.2,0.7,0.2,1) forwards` — translate by `--dx/--dy`, rotate `--rot`, scale `0.6→1`, fade out. 8×14 rounded chips. |

### 8.6 Boot / splash (cinematic open)
`bootOut` (480ms scale+blur exit), `bootOrbIn` (900ms `cubic-bezier(0.16,1,0.3,1)` overshoot), `bootGlow` (2.4s orb glow pulse), `bootCorePulse` (2.4s core shadow pulse), `bootWord` (1000ms letter-spacing collapse `0.5em→0.06em`, delay 320ms), `bootTag` (800ms fade-up, delay 760ms). The orb is built from conic-gradient rings (`#45B7E8 → #2DD4BF → #FF8A4C → #E9C46A`) masked into thin bands + a radial core.

### 8.7 Skeleton
| Keyframe | Driver | Effect |
|---|---|---|
| `skeletonShimmer` | `.skeleton::after` | `1.4s ease-in-out infinite` traveling highlight (`translateX -100%→100%`). Base `.skeleton` = `rgba(255,255,255,0.05)`, `radius 7`. Comment: *"show structure while async content loads."* |

### 8.8 Motion safety
`@media (prefers-reduced-motion: reduce)` forces `animation-duration` / `transition-duration` to `0.001ms`, iteration count to 1, and `scroll-behavior: auto` on `*`, `::before`, `::after`. Plus the gating of `meshGlow` behind `no-preference`.

---

## 9. LAYOUT SYSTEM

The app renders inside a **simulated iPhone device frame**, centered in a black ambient room.

- **`#root`** — full viewport, flex-centered, black with the ambient radial wash (§1.3) and the masked HUD grid (`#root::before`). `overflow: hidden` on `html, body` (no page scroll).
- **Device frame** — the iconic dimensions referenced for this product are **402 × 874** (the iPhone-frame the app is designed against). The audit brief cites the device shell; the visible app fills it.
- **`.screen-host`** — `position: absolute; inset: 0`, `background: var(--bg-0)`, `overflow: hidden`. Hosts the aurora (`::before`) and grain (`::after`) under everything.
- **`.screen-scroll`** — absolute, fills host, `overflow-y: auto` / `overflow-x: hidden`, `padding-top: 56px` (status bar), `padding-bottom: 130px` (tab bar), `z-index: 1` (above ambience), momentum scrolling. `.ios-fullbleed` variant swaps to `env(safe-area-inset-*)` padding for installed PWA / real notch.
- **`.screen-content`** — `padding: 0 16px` (calm: `0 18px`), `screenFade` entrance, children get staggered `cardIn`.
- **Bottom tab bar + FAB** — see §5.14. Bar floats 24px above the safe-area bottom; FAB floats above the bar at the right.
- Scrollbars are globally hidden (`::-webkit-scrollbar { width:0;height:0;display:none }`, `scrollbar-width: none`).

**Z-index ladder:** ambience 0 → content 1 → tab bar 40 → scrim 150 → sheet 160 → confetti 200 → boot 400.

---

## 10. DARK MODE RULES

**Dark-only. There is no light theme.** `html, body { background: #000 }` and the entire token set is authored for a near-black canvas (`--bg-0 #0A0B0D`). Surfaces are built by stacking low-alpha **white** overlays (`0.02 → 0.05`) on black, with white-alpha hairlines (`--line` / `--line-strong`) and a single inset white top-highlight (`--top-hi`) for depth. Text is an off-white-to-slate ramp (`#F5F5F7 → #A7ADBA → #6B7280`). Color enters only as accents and gradients. There is no `prefers-color-scheme` branch; the only theme switch is **glow vs. calm** (`data-vibe`), both of which are dark — calm merely raises hairline contrast slightly (`--line` `0.06→0.07`, `--line-strong` `0.11→0.13`), warms `--muted`/`--dim`, and strips spectacle. Dark text (`#0A0B0D` / `#101214`) appears only as foreground **on** bright gradient fills (FAB, primary CTAs, bright brand tiles, badges).

---

## 11. VISUAL HIERARCHY

### 11.1 The L1/L2/L3 model
Hierarchy is carried by **material tier + type face + accent**, layered:

- **L1 — Hero / primary signal.** `.glass-hero` (+ a `mesh-*` background, optionally `glow-*` in glow mode). Big `.display` numbers (`RadialGauge`, `StatTile` at 36px), one bold accent. This is the "what matters now" surface at the top of a screen.
- **L2 — Standard cards.** `.glass` / `.glass-strong` (`HUDCard`). `.section-title` (Bebas 26) headings, supporting data-visuals (`Sparkline`, `MiniBars`, `RadarChart`), pills for status. The working body of a screen.
- **L3 — Recessed / quiet.** `.glass-canvas` and `.panel` wells, dim text (`--dim`/`--text-3`), `.section-label` mono caps, `EmptyState` dashed placeholders, hints. Background structure and metadata.

The tier opacity/blur ramp (§4) and the text ramp (§1.1) reinforce the same three steps.

### 11.2 "One accent per surface"
A given card commits to **one** hue. The mesh heroes, glow utilities, pill variants, and tab colors are all single-accent. Tab identity is fixed (Command=cyan, Map=gold, Move=green, Build=coral). The ObjectMenu takes a single `accent` prop and threads it through eyebrow, AI chips, thinking dots, caret, and the primary CTA gradient. Mixing accents on one surface is against the grain of the system — color is used to *assign meaning*, not decorate.

### 11.3 Eyebrow → title → display usage
The repeated heading rhythm (codified in `SectionHead`):
1. **Eyebrow** (`.eyebrow`, Inter 11/600, sentence case, muted) — a quiet contextual label.
2. **Section title** (`.section-title`, Bebas 26, near-zero tracking) — the heading.
3. **Display** (`.display`, Bebas, large) — reserved for the *number* that is the point of the card (gauge center, stat tile, big metric).

Mono (`.mono` / `.section-label`) is the **data + system** voice: timestamps, units, pill text, tab labels, axis labels, the lone uppercase `.section-label`. The recent restraint pass deliberately pulled the eyebrow out of mono-caps into calm Inter so the mono voice now reads as a signal, not the baseline. Net hierarchy intent: **Bebas = magnitude, Inter = language, JetBrains Mono = data.**

---

*End of design-system reference. All values verified against source on 2026-06-19.*
