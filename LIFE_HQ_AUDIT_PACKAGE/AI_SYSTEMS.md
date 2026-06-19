# JAM HQ / Life HQ — AI Systems Documentation

**Audit package · AI subsystem inventory**
**Codebase:** `/Users/jaymartinez/Life-OS/app`
**Owner:** Jay Martinez (movement athlete & coach; co-owns Obstacle Ninja Academy [ONA] and Podium Creations; creator `@jayy_martinez`; wife Chelsea)
**Prepared:** documentation pass over the actual source.

---

## 0. Executive summary & honesty notes

Life HQ is a React PWA whose "intelligence" is split across two cleanly separated layers:

1. **A live LLM layer.** Every genuine AI call goes through a Vercel serverless function (`api/*.js`) that calls the **Anthropic Messages API** with model **`claude-haiku-4-5-20251001`**. There are five AI endpoints: `api/ai.js` (legacy multi-agent), `api/companion.js` (the unified companion), `api/chief.js` (brief / weekly review / monthly upgrade), `api/coach.js` (session + week builder), `api/decompose.js` (goal decomposition). All five are now protected by a JWT auth gate (`api/_auth.js`).
   - **Current state: the key is SET in Vercel, so the real model is LIVE.** When the key is present, the model produces the text. When absent (`ANTHROPIC_API_KEY` unset) the endpoint returns HTTP 503 and the client silently falls back to deterministic local logic.

2. **A deterministic "fallback brain."** Every AI feature has a hand-authored local fallback so the app is useful before/without the key, or when the user is signed out. The Companion's fallback is a **regex keyword router** (`localAnswer` in `lib/mission.js`). The mission list, ONA/content recommendations, blindspot analysis, periodization, drills, and goal scaffolds are all **hand-authored heuristics and static knowledge — NOT learned models.**

**Honesty flags carried throughout this document:**
- The recommendation engines (`recommendOna`, `recommendContent`, `generateMissions`) are **rule-based heuristics**, not ML.
- The dollar-impact figures shown next to ONA recommendations (e.g. `≈ +$X/mo if 1 in 4 converts`) are **invented impact math** — fixed conversion-rate assumptions (0.25, 0.30, 0.12) multiplied by an estimated average member value. They are persuasion/estimation devices, not measured outcomes.
- The "LifeOS version" in the Monthly Upgrade report is literally `1 + (number of accepted proposals)` — a cosmetic counter, not a real software version.
- Long-term "memory" is a single distilled text blob the model rewrites every ~5 exchanges, stored in localStorage/synced state — not a vector store or retrieval system.

---

## 1. Model, transport, and the live-vs-fallback contract

**Model (identical in all five endpoints):**
```js
const MODEL = 'claude-haiku-4-5-20251001';
```

**Transport** — every endpoint hits the same Anthropic REST endpoint with the server-side key:
```js
const r = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'x-api-key': key,                       // process.env.ANTHROPIC_API_KEY
    'anthropic-version': '2023-06-01',
  },
  body: JSON.stringify({ model: MODEL, max_tokens, system, messages }),
});
```

`max_tokens` per endpoint: `ai.js` 400, `chief.js` 600, `coach.js` 900 (session) / 1100 (week), `companion.js` 800, `decompose.js` 700.

**The "not configured" contract** (present in every AI endpoint):
```js
const key = process.env.ANTHROPIC_API_KEY;
if (!key) {
  // Not configured yet — client falls back to its built-in structured answers.
  res.status(503).json({ error: 'AI not configured' });
  return;
}
```

**Client transport — `src/lib/api.js`** attaches the Supabase session token so the endpoint's gate can verify the caller:
```js
export async function aiFetch(path, body) {
  let token = '';
  try {
    if (supabase) {
      const { data } = await supabase.auth.getSession();
      token = data?.session?.access_token || '';
    }
  } catch { /* tokenless call → 401 → caller falls back to local logic */ }
  return fetch(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json',
               ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
}
```

Every client caller uses the same pattern: `aiFetch(...)` → on `!r.ok` or empty text, `throw` → `catch` runs the deterministic local builder. So a 401 (signed out), 503 (no key), 429 (rate limit), or 502 (upstream error) all degrade gracefully to local logic.

---

## 2. Auth gate, rate limiting & the ONA webhook (security surface)

### 2.1 The JWT gate — `api/_auth.js`

Before this gate existed, `/api/companion`, `/api/chief`, `/api/coach`, `/api/ai`, and `/api/decompose` were **fully open** — the file comment states it plainly:

> *Without this, /api/companion, /api/chief, /api/coach, /api/ai and /api/decompose were fully open — anyone with the deploy URL could POST to them and burn the Anthropic key as a free LLM proxy.*

The gate verifies the caller's **Supabase session JWT** against Supabase Auth, reusing the project's existing URL + anon key (no new env vars):

```js
export async function verifyUser(req) {
  const { url, anon } = supabaseEnv();
  if (!url || !anon) return { ok: false, status: 503, error: 'Auth not configured' };
  const header = req.headers?.authorization || req.headers?.Authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return { ok: false, status: 401, error: 'Sign in required' };
  try {
    const r = await fetch(`${url}/auth/v1/user`, {
      headers: { apikey: anon, authorization: `Bearer ${token}` } });
    if (!r.ok) return { ok: false, status: 401, error: 'Invalid session' };
    const user = await r.json();
    if (!user?.id) return { ok: false, status: 401, error: 'Invalid session' };
    return { ok: true, user };
  } catch { return { ok: false, status: 401, error: 'Auth check failed' }; }
}
```

### 2.2 Rate limit — best-effort, in-memory

```js
// Best-effort per-user rate limit. In-memory, so it only spans a warm
// serverless instance — a backstop against runaway loops/abuse, not a
// hard guarantee. Default: 40 requests / minute per user.
const hits = new Map();
export function rateLimit(id, max = 40, windowMs = 60000) {
  const now = Date.now();
  let rec = hits.get(id);
  if (!rec || now > rec.reset) { rec = { count: 0, reset: now + windowMs }; hits.set(id, rec); }
  rec.count += 1;
  return rec.count <= max;
}
```
**Audit note:** because the limiter lives in `Map` memory it only protects a single warm serverless instance; it is explicitly documented as a backstop, not a guarantee. A determined attacker hitting cold instances or parallel regions can exceed 40/min.

### 2.3 One-call guard

```js
export async function gate(req, res) {
  const auth = await verifyUser(req);
  if (!auth.ok) { res.status(auth.status).json({ error: auth.error }); return null; }
  if (!rateLimit(auth.user.id)) { res.status(429).json({ error: 'Too many requests — slow down a moment.' }); return null; }
  return auth.user;
}
```
Every AI handler calls `if (!(await gate(req, res))) return;` immediately after the method check.

### 2.4 Non-AI serverless endpoints (context-feeding, not LLM)

- **`api/calendar.js`** — server-side reader for a Google Calendar "secret iCal" feed. Fetches the `.ics`, parses VEVENTs, expands DAILY/WEEKLY/MONTHLY/YEARLY recurrence, returns today's (or an N-day range of) events. **SSRF guard:** only `https://calendar.google.com` is allowed:
  ```js
  if (parsed.protocol !== 'https:' || parsed.hostname !== 'calendar.google.com') {
    res.status(400).json({ error: 'Only a Google Calendar secret iCal link is allowed' });
  }
  ```
  This feeds the timeline that the Chief brief reasons over. **Not gated by `_auth.js`** (it's a read of a user-supplied public-secret URL, no Anthropic key involved).
- **`api/ona-webhook.js`** — GymDesk → Zapier → this endpoint pipeline for live ONA stats. Gated by a **shared secret** (`ONA_WEBHOOK_SECRET` via `?token=` or `X-Webhook-Secret`), writes to Supabase `app_state` key `lifeos:ona:live` using the **service-role key** (never leaves the server). Accepts a whitelist of stat fields only:
  ```js
  const FIELDS = ['members','active_members','mrr','nps','attendance_week','new_members_month','churn_month','visits_today'];
  ```
  Supports absolute set and `{ "inc": { ... } }` increments. This live snapshot is what `recommendOna` reads for churn-based win-back recommendations.

---

## 3. The agent architecture: "one intelligence, many hats"

V1 of the app had **six separate AI agents**. V2 collapsed them into **one companion with seven selectable modes ("hats")**. The header comment in `Companion.jsx`:

> *One mind, different hats. The six separate "agents" of V1 are now modes of a single companion that knows Jay's whole world and keeps one continuous, synced conversation.*

And in `companion.js`:

> *One intelligence, different hats. The mode shifts emphasis — it never changes who the intelligence is or what it knows.*

The legacy six-agent endpoint (`api/ai.js`) still exists with separate `PERSONAS`, but the live product routes through `api/companion.js` with `HATS`. Both are quoted below.

**The 7 hats (modes)** — defined client-side in `Companion.jsx`:
```js
const MODES = [
  { id: 'partner',   name: 'Partner',   color: '#2DD4BF', hint: 'whole-life thinking partner' },
  { id: 'chief',     name: 'Chief',     color: '#45B7E8', hint: 'runs your day & priorities' },
  { id: 'coach',     name: 'Coach',     color: '#34D399', hint: 'training & recovery' },
  { id: 'creative',  name: 'Creative',  color: '#FF8A4C', hint: 'content & brands' },
  { id: 'ona',       name: 'ONA',       color: '#FF6B5B', hint: 'gym operations' },
  { id: 'podium',    name: 'Podium',    color: '#E9C46A', hint: 'equipment & builds' },
  { id: 'architect', name: 'Architect', color: '#F4A261', hint: 'improves your systems' },
];
```

---

## 4. AI FEATURE INVENTORY

### 4.1 The Companion ("JAM Intelligence") — the always-present partner

- **Client:** `src/Companion.jsx` (component `Companion`, plus floating `CompanionLauncher` on every screen).
- **Endpoint:** `api/companion.js`.
- **Launcher:** floating orb bottom-left, present on every screen. **Tap = open chat; long-press (450ms) = open straight into voice.** Conversation persists/syncs at `lifeos:companion`, capped to the last 60 messages.
- **Voice loop:** Web Speech listening + TTS speaking. With "Voice on", it runs a full hands-free loop: speak the answer → on TTS end, hand the mic back and listen again.

**Request shape (client → `api/companion.js`):**
```js
const r = await aiFetch('/api/companion', { messages: next, context: buildGlobalContext(), mode });
```
- `messages`: full chat array `[{ role: 'user'|'ai', text }]` (server slices to last 16).
- `context`: the assembled global snapshot (see §6).
- `mode`: one of the seven hat ids.

**Response shape:** `{ text, actions }` where `actions` is the parsed `ACTIONS_JSON` array (see §5).

**THE LIVE SYSTEM PROMPT (`api/companion.js`)** — the hat fragment is prepended, then the shared identity:

The `HATS` map:
```
partner:   'You are currently wearing no particular hat — whole-life thinking partner.'
chief:     'Current hat: CHIEF OF STAFF. Run his day and priorities; think leverage, protect focus, end with one clear next action.'
coach:     'Current hat: PERFORMANCE COACH. Elite multi-discipline movement coaching grounded in biomechanics; scale advice to his readiness; hunt blindspots.'
creative:  'Current hat: CREATIVE DIRECTOR. Hooks, shot lists, angles; punchy and specific; scroll-stopping openers with payoffs.'
ona:       'Current hat: ONA OPERATIONS. Gym ops, retention, staffing, revenue; be metrics-aware and surface the next operational lever.'
podium:    'Current hat: PODIUM MANUFACTURING. Orders, inventory, fabrication, margins; be concrete about the next build/ship decision.'
architect: 'Current hat: SYSTEMS ARCHITECT. Find repeatable friction; propose better routines and automations; suggest, never impose.'
```

The assembled `system`:
```
{hat}

You are Jay Martinez's personal AI — his lifelong partner inside LifeOS, the app that runs his whole world. You are at once his coach, strategist, creative collaborator, teacher, and thinking partner. Jay co-owns Obstacle Ninja Academy (a ninja/movement gym in Orlando) and Podium Creations (premium obstacle equipment), is an elite movement athlete & coach (gymnastics, tricking, calisthenics, partner acrobatics & hand-balancing, parkour, ninja), a creator (@jayy_martinez), and travels with his wife Chelsea. He values clarity, calm, freedom, growth, and craft.

Your job is to help him think, decide, create, learn, train, and grow — and to genuinely collaborate, not just answer. How you show up:
- Be warm, direct, and encouraging. Talk like a sharp, caring partner who believes in him — never fawning or generic.
- Use his live data below to be specific. Reference what's actually going on in his training, businesses, and day.
- Think a few steps ahead: surface blind spots, connect dots across his life, and offer the next move — but keep his agency.
- When he's learning or developing something, teach in his language, give the why, and break it into doable steps.
- Ask a good question when it genuinely moves things forward; otherwise just help. Match his energy.
- Keep replies tight and phone-readable by default; go deeper when he wants depth. No preamble, no filler.

You can ACT in the app, not just advise. When an action would genuinely help, after your reply output the exact marker ACTIONS_JSON: followed by a compact JSON array (max 3) of one-tap actions. Each item is one of:
  {"type":"event","label":"<button text>","title":"...","time":"HH:MM","durationMin":60}  (blocks time; opens Google Calendar prefilled + adds to today)
  {"type":"session","label":"...","discipline":"tricking|gymnastics|calisthenics|acro|parkour|ninja|mixed","disciplineName":"...","duration":60,"intensity":7}  (logs a training session)
  {"type":"capture","label":"...","text":"...","tag":"idea|task|ona|dream"}  (saves a thought/draft/task to his capture inbox)
  {"type":"focus","label":"...","text":"..."}  (sets today's one thing)
  {"type":"email","label":"...","to":"","subject":"...","body":"..."}  (drafts an email, opens prefilled)
Only include actions that clearly follow from the conversation. If none, output ACTIONS_JSON: []

Jay's current world:
{context || '(no live context provided)'}
```

The history is mapped role-wise and each turn truncated to 4000 chars:
```js
messages: history.map((m) => ({ role: m.role === 'ai' ? 'assistant' : 'user',
                                content: String(m.text ?? m.content ?? '').slice(0, 4000) })),
```

**Fallback brain:** on any failure, `reply = localAnswer(q, mode)` (the regex router, §8).

---

### 4.2 Chief of Staff — morning brief (`mode: 'brief'`)

- **Client:** `src/ChiefBrief.jsx` — the glass card at the top of Home. Caches per day at `lifeos:brief:<day>`. Auto-generates ~600ms after mount (so the calendar can load), refreshable via the sparkle button.
- **Endpoint:** `api/chief.js`, `mode: 'brief'`.
- **Request:** `aiFetch('/api/chief', { mode: 'brief', context })` where context is built by `buildContext({ readiness, oneThing, calendarEvents })`:
  ```js
  lines.push(`Readiness today: ${readiness}/100.`);
  lines.push(`Calendar today: ${calendarEvents?.length ? ... : 'nothing scheduled'}.`);
  lines.push(`Capture inbox: ${inbox} thought... waiting to triage.`);
  lines.push(`Today's one thing: ${oneThing ? oneThing : 'not set yet'}.`);
  if (focus) lines.push(`This week's focus: ${focus}.`);
  if (sessions.length) lines.push(`Recent training: ...`);
  ```
- **Response:** `{ text, actions }`. The `ask` is always `'Give me my brief for today.'`

**LIVE SYSTEM PROMPT (`SYSTEMS.brief`):**
```
You are Jay Martinez's Chief of Staff. Jay co-owns Obstacle Ninja Academy (a ninja/movement gym) and Podium Creations (premium obstacle equipment), is an elite movement athlete and coach, and travels with his wife Chelsea. He values clarity, calm, and freedom, and hates clutter and busywork.

Using the data below, write a tight morning brief he can read in under a minute. Rules:
- Open with one warm, grounded sentence about today (no fluff, no clichés).
- Name what genuinely needs attention given his calendar, readiness, and open loops.
- End with ONE highest-leverage action — the single thing that, if done, makes today a win. Make it concrete.
- Be brief and specific. Short lines, no preamble, no headers like "Morning Brief". Speak directly to Jay.

After the brief, on a new line output the exact marker ACTIONS_JSON: followed by a compact JSON array (max 3) of concrete actions Jay could take in one tap. Each item: {"type":"event"|"email"|"note","label":"<short button text>", and for event: "title","time"(HH:MM 24h),"durationMin"; for email: "to"(if known else ""),"subject","body"; for note: "text","domain"(one of ona,podium,movement,social,wife,self)}. Only propose actions that clearly follow from the data (e.g. block prep time before a coaching session, draft a follow-up). If none are warranted, output ACTIONS_JSON: []
```

**Local fallback** (`buildLocal`) builds a tiered readiness sentence (`>=75` "sharp, push"; `>=55` "steady"; else "keep it technical"), lists the calendar, surfaces the inbox count, the weekly focus, and ends with a `▸ Highest leverage:` line — the One Thing or a prompt to set it.

**Action execution (`runAction` in ChiefBrief.jsx):** `event` → adds to the app timeline AND opens Google Calendar prefilled; `email` → opens `mailto:` prefilled. There is also an inline "Plan a block" composer (title/time/duration) that prefills Google Calendar on confirm.

---

### 4.3 Weekly Review (`mode: 'review'`)

- **Client:** `src/WeeklyReview.jsx`. Crunches the last 7 days locally via `buildWeek()` (active days, avg readiness, sessions/minutes, attention split by domain from routed captures, inbox left, surface-usage telemetry), renders a stat row, an attention-allocation bar chart, a **domain-balance check** (which life domains went "dark"), and an editable "one focus for next week."
- **Endpoint:** `api/chief.js`, `mode: 'review'`. Triggered by the "AI REFLECT" button.
- **Request context** (`reflect()` assembles): days active, avg readiness, training sessions + per-discipline counts, attention by domain, domain-balance `lit/total` and which were dark, inbox-left, and app-surface opens.

**LIVE SYSTEM PROMPT (`SYSTEMS.review`):**
```
You are Jay Martinez's Chief of Staff doing his weekly review. Jay co-owns Obstacle Ninja Academy and Podium Creations, trains as an elite movement athlete, and protects time with his wife Chelsea. He wants honest reflection, not cheerleading.

Using the week's data below, write a short, honest reflection. Rules:
- Note what went well and what slipped, plainly.
- Call out attention imbalance across his domains (ONA, Podium, Movement, social, wife, self) if you see it — gently but truthfully.
- Surface one blind spot or pattern worth his attention.
- Suggest one focus for next week. Keep it to a few short lines, no headers, speak directly to Jay.
```
No `ACTIONS_JSON` is requested for review/upgrade modes; the review screen instead offers "Block focus time" and "Plan [dark domain]" chips that prefill Google Calendar via `googleCalendarUrl`.

**Local fallback** (`buildLocalSummary`): active days, avg readiness, sessions/minutes, the top attention domain, which domains got nothing ("Intentional, or a blind spot?"), inbox left, and any barely-opened surface.

---

### 4.4 Monthly Upgrade Report (`mode: 'upgrade'`) — the "self-improving loop, made safe"

- **Client:** `src/MonthlyUpgrade.jsx`. Header comment: *"the self-improving loop, made safe … PROPOSES improvements he can Accept or Dismiss. Nothing changes automatically."*
- **Endpoint:** `api/chief.js`, `mode: 'upgrade'`.
- **Two parallel systems:**
  1. **Deterministic proposals** (`buildProposals`) — always generated locally from the month's data (see §7.4). Rendered as Accept/Dismiss cards. Accepting records to a changelog (`lifeos:upgrades`) and bumps `version = 1 + upgrades.length`. Dismissing records to `lifeos:upgradeDismissed`.
  2. **AI reflection note** ("AI REFLECT" button) — a free-text monthly note from the model.

**LIVE SYSTEM PROMPT (`SYSTEMS.upgrade`):**
```
You are the Systems Architect for Jay Martinez's LifeOS — a personal operating-system app. Your job is monthly meta-reflection: look at how Jay actually used the system this month and how his life is trending, then tell him plainly how to run his life and this app better. Jay co-owns Obstacle Ninja Academy and Podium Creations, trains as an elite movement athlete, and travels with his wife Chelsea.

Using the month's usage + life data below, write a short, sharp monthly note. Rules:
- Name what's working in how he's using LifeOS, and what he's ignoring (dead features, unused surfaces).
- Surface the strongest pattern or imbalance across his life this month.
- Be honest and specific, a few short lines, no headers. Speak directly to Jay. Do not propose anything destructive or automatic — he reviews and decides.
```

**Audit note:** the "LifeOS version" is a cosmetic counter (`1 + accepted proposals`), and the AI's role here is **reflection only** — it never mutates the app. The proposals it could act on are the hand-authored ones, gated behind explicit Accept clicks.

---

### 4.5 AI Coach — session builder (`api/coach.js`, default mode)

- **Client:** `src/CoachSheet.jsx` — "BUILD MY SESSION." User picks focus (Mixed or one discipline) and duration (30/45/60/90/120 min). Always shows a live **Blindspots** panel (from `analyzeBlindspots`). On "Build session" it calls the AI; on log it writes a session.
- **Endpoint:** `api/coach.js` (no `mode: 'week'`). `ask` = `'Build my training session for today.'`
- **Request context** (`buildContext`): focus + time, today's readiness with body/energy breakdown, then for each discipline: mastered count, active skills `(pct%, cue)`, next locked skill `(tier, cue)`; recent sessions; **blindspots to address** (severity + fix); and the concrete drill progression + fundamentals from `coaching.js` for each focus discipline.

**LIVE SYSTEM PROMPT (session):**
```
You are Jay Martinez's elite personal movement coach. You blend the expertise of the best coaches and athletes in the world across artistic gymnastics, tricking, calisthenics/street workout, partner acrobatics & hand-balancing, parkour/freerunning, ninja warrior, dance, and martial arts — plus sports science, biomechanics, motor learning, tissue/tendon adaptation, and periodization. Your mission is bigger than today's session: build Jay into a durable, well-rounded, ELITE all-around acrobat, and actively CATCH HIS BLINDSPOTS so weaknesses don't become plateaus or injuries.

Program TODAY'S session from the data below. Rules:
- Prioritize his ACTIVE skills and the immediate next progression. Respect prerequisites — never skip tiers, and if a foundation is shaky, fix it first.
- ADDRESS THE BLINDSPOTS listed in the data: weave in the neglected discipline, the missing foundation pillar, or the recovery need — don't just chase flashy skills.
- Prescribe SPECIFIC named drills with the key cue and concrete sets×reps or quality/time targets. Use the drills provided in the data where relevant; add better ones when you know them.
- Balance the body: pair pressing with pulling, include the relevant mobility/prehab (wrist, shoulder, spine, hips/ankles), and ALWAYS some landing/eccentric or line work — the most-skipped pieces.
- Scale intensity to readiness (low readiness = technique, prep, capacity; cap impact and max effort).
- Vary stimulus vs. recent sessions; avoid loading the same tissue/discipline two hard days running.
- Structure: PREP / MOBILITY & PREHAB, PRIMARY SKILL WORK (name skill, cue, sets/quality target, next progression), SUPPORTING STRENGTH (the straight-arm/pull/posterior work that earns the skills), COOL-DOWN. End with one short BLINDSPOT NOTE — the single thing he keeps under-training.
- Be specific, expert, and motivating. Tight enough for a phone — short labeled sections, short lines, no preamble. Start directly with the session.

Jay's training data:
{context}
```

**Local fallback** (`buildLocal`): a fully-structured deterministic session — readiness verdict, PREP/WARM-UP, PRIMARY SKILL WORK per discipline (sets scale with readiness), SUPPORTING STRENGTH, COOL-DOWN, and a `⚠ BLINDSPOT:` line picked by severity from `analyzeBlindspots`.

---

### 4.6 Plan-my-week — periodization (`api/coach.js`, `mode: 'week'`)

- **Client:** `src/WeekPlanSheet.jsx` — "PLAN MY WEEK." User picks training days (3–6) and a priority discipline. Always shows the proven `WEEK_TEMPLATE` microcycle + `PROGRAMMING_PRINCIPLES` from `coaching.js`; "Personalize with AI" overlays a tailored week.
- **Endpoint:** `api/coach.js`, `mode: 'week'`. `ask` = `'Plan my training week.'`, `max_tokens: 1100`.
- **Request context** (`buildContext`): days/week, priority discipline, readiness, active skills per discipline, blindspots to weave in.

**LIVE SYSTEM PROMPT (week):**
```
You are Jay Martinez's elite movement coach and program designer, building his TRAINING WEEK (microcycle). Jay is an all-around acrobat/movement athlete training gymnastics, tricking, calisthenics, partner acrobatics & hand-balancing, parkour, and ninja. Apply real periodization. Rules:
- Put the hardest, newest skill & power work on his freshest days; learn new skills fresh, never fatigued.
- Alternate high-impact days (tumbling/tricking/jumps/landings) with low-impact days (hand-balance, straight-arm strength, mobility).
- Strength 2–3×/week, pressing balanced with pulling; power/plyos crisp and early, never to fatigue.
- Mobility/prehab daily in small doses + one dedicated recovery day; at least one full rest day; note a deload every ~4th week.
- Address his blindspots and weave in the discipline he has been neglecting. Scale the number of training days to what he gives.
- Output a clear day-by-day week (Day 1…N) with each day's focus and 2–4 bullet items. Tight, phone-readable, no preamble. End with one short note on auto-regulating by readiness.

Jay's data:
{context}
```

**Local fallback:** if AI fails, the sheet shows **no AI block** and falls through to the visual `WEEK_TEMPLATE` (always rendered) — a balanced 7-day microcycle that dims days beyond the chosen count.

---

### 4.7 Goal Decomposition (`api/decompose.js`)

- **Clients:** (a) `src/GoalDecomposer.jsx` — "BREAK IT DOWN" sheet; (b) the inline `decomposeText()` helper used by long-press campaign actions (§4.8).
- **Endpoint:** `api/decompose.js`. Returns **strict JSON**.
- **Request:** `aiFetch('/api/decompose', { goal, domain, context })`. `GoalDecomposer` adds a `lightContext(domain)` (active training skills for `athlete`; ONA members/MRR for `business`).

**LIVE SYSTEM PROMPT:**
```
You are Jay Martinez's elite coach and strategist. Jay is a movement athlete & coach who co-owns Obstacle Ninja Academy (a ninja gym) and Podium Creations (obstacle equipment), creates content as @jayy_martinez, and is married to Chelsea. He trains gymnastics, tricking, calisthenics, partner acrobatics & hand-balancing, parkour, and ninja.

Break the goal below into a CLEAR, SEQUENCED progression: 3–6 concrete, checkable milestones in the order he should tackle them — each a real outcome (not vague advice), each building on the last, the last one BEING the goal achieved. Think like a world-class coach who has taken people to this exact outcome. Domain: {domain || 'general'}.

Respond with STRICT JSON only, no prose, no code fence:
{"title":"<a crisp version of the goal>","why":"<one short motivating line on why this matters>","milestones":["<m1>","<m2>","<m3>", "..."]}
```
The server hardens the JSON (`extractJSON` strips code fences, slices `{...}`), validates `Array.isArray(parsed.milestones)`, and clamps title (120 chars), why (200), and ≤6 milestones (160 chars each).

**Local fallback** (`buildLocal`): a 5-step generic scaffold — define "done", identify the biggest blocker + first step, build the weekly rep, hit the halfway marker, final push.

**Downstream:** saving a decomposed goal calls `onAddQuest(...)`, turning it into a campaign whose next milestone the mission engine can pull into the daily mission (`GoalDecomposer.jsx` footer: *"it becomes a campaign on Command — the engine pulls its next step into your daily mission"*).

---

### 4.8 Long-press contextual actions — the "interactive object" layer

This is the inline-AI layer: long-press a major card → a bottom sheet (`ObjectMenu`) of context-appropriate verbs → AI verbs run **inline** with a thinking-dots state and a **typewriter reveal**, never jumping to a chat window.

- **Gesture:** `src/lib/useLongPress.js` — `tap → onTap`, `long-press (440ms) → onLongPress` + `navigator.vibrate?.(12)` haptic, movement past 10px cancels both.
- **Menu shell:** `src/components/ObjectMenu.jsx` — three views `menu | thinking | result`. For `ai: true` actions, `run()` returns a `Promise<string>`; the resolved text is revealed character-by-character:
  ```js
  // Typewriter reveal — gives AI answers a living, streaming feel.
  const id = setInterval(() => { i += 2; setShown(result.slice(0, i)); if (i >= result.length) clearInterval(id); }, 12);
  ```
  Failure handling is graceful: `'Could not reach the AI just now. Give it a second and try again.'`
- **Shared helpers:** `src/lib/aiActions.js`:
  ```js
  export async function askCompanion(prompt, context = '') {
    const r = await aiFetch('/api/companion', { messages: [{ role: 'user', text: prompt }], context, mode: 'partner' });
    if (!r.ok) throw new Error('ai');
    const d = await r.json(); return d.text || '';
  }
  export async function decomposeText(title, domain) {
    const r = await aiFetch('/api/decompose', { goal: title, domain: domain || 'growth', context: '' });
    if (!r.ok) throw new Error('ai');
    const d = await r.json();
    const ms = Array.isArray(d.milestones) ? d.milestones : [];
    return (d.why ? d.why + '\n\n' : '') + ms.map((m, i) => `${i + 1}. ${m}`).join('\n');
  }
  ```
  Note: every `askCompanion` long-press action hits `/api/companion` in `partner` mode with `context: ''` (no global snapshot) — the context is baked into the prompt string itself.

**The wired actions and their exact inline prompts:**

**On a project card** — `BuildScreen.jsx` `projectActions(p)`; context string is `` `"${p.title}" (${p.folder.name}, ${p.pct}% done${p.next ? `, next step: ${p.next}` : ''})` ``:
- **Summarize progress** → `Summarize the state of my project {ctx}. 2-3 sentences: where it stands and its momentum. No preamble.`
- **Generate next steps** → `For my project {ctx}: give me the next 3-5 concrete steps to push it forward. Short lines, no preamble, no fluff.`
- **Surface blockers** → `For my project {ctx}: what's most likely blocking progress right now, and the single highest-leverage move to unblock it? 2-3 specific sentences.`

**On a skill node** — `TrainingHQ.jsx` `skillActions(skill, ...)`:
- **Fastest path to mastery** → `I'm training "{skill.name}" (currently {skill.pct||0}%). Give me the fastest, safest path to mastery: the key progression steps and the single drill that matters most right now. Tight, specific, no preamble.`
- **Analyze my limiter** → `For the movement skill "{skill.name}": what's the most common limiter or fault that stalls progress here, and the exact fix or correction? 2-3 sentences, specific and coach-grade.`
- **Generate a session** (`ai: false`) → opens the Coach sheet (`onCoach()`).
- **Review drills & detail** (`ai: false`) → expands the skill breakdown.

**On a daily mission** — `TodayScreen.jsx` `missionActions(m, ...)`:
- **How should I approach this?** → `For my task today — "{m.title}" — give me a tight, practical way to approach it in the next focused block. 2-3 sentences, specific, no preamble.`
- **Why does this matter?** → `In 2 sentences, why does "{m.title}" matter for me today? Then one sentence on the real cost of skipping it. Direct, no fluff.`
- **Set as my One Thing** (`ai: false`).

**On a goal/campaign** — `TodayScreen.jsx` `campaignActions(q, ...)`:
- **Break into next actions** → `decomposeText(q.title, q.domain)` (the JSON decomposer, rendered as a numbered list).
- **Analyze blockers** → `I'm working toward this goal: "{q.title}". In 3-4 tight, specific sentences: what's most likely blocking my progress right now, and the single highest-leverage move to unblock it? No preamble.`
- **Generate a plan** → `Give me a concrete, sequenced 5-step plan to make real progress on: "{q.title}". Short lines, no preamble, no fluff.`
- **View roadmap** (`ai: false`).

**Audit note:** the long-press layer has **no deterministic fallback** — if the AI is unreachable the user sees the graceful "try again" message rather than a local answer. (Distinct from the major features in §4.1–4.7, which all degrade to local logic.)

---

## 5. The propose-and-confirm operator-action model (`ACTIONS_JSON`)

The app never lets the model silently mutate state. The model is asked to emit a marker, the server parses it, and the **user must tap to confirm** each action.

**Generation:** `companion.js` and `chief.js` instruct the model to append `ACTIONS_JSON:` + a compact JSON array (max 3).

**Parsing (identical in both endpoints):**
```js
let text = raw, actions = [];
const mi = raw.indexOf('ACTIONS_JSON:');
if (mi !== -1) {
  text = raw.slice(0, mi).trim();
  try { const parsed = JSON.parse(raw.slice(mi + 'ACTIONS_JSON:'.length).trim());
        if (Array.isArray(parsed)) actions = parsed.slice(0, 3); } catch { /* ignore */ }
}
res.status(200).json({ text, actions });
```
Parse failures are swallowed → `actions = []`. The prose is always the part before the marker.

**Action types & execution — `runAction` in `App.jsx`** (the Companion's executor, wired via `onAction={runAction}`):
```js
const runAction = (a) => {
  if (!a || !a.type) return;
  if (a.type === 'event') {
    const time = a.time || '12:00';
    setMissionState((s) => ({ ...s, timeline: [...(s.timeline ?? TIMELINE),
      { time, label: a.title || a.label || 'Block', kind: 'Focus', color: '#2DD4BF' }]
      .sort((x, y) => x.time.localeCompare(y.time)) }));
    openExternal(googleCalendarUrl({ title: a.title || a.label || 'Block', time, durationMin: a.durationMin || 60, details: a.details }));
  } else if (a.type === 'email') {
    openExternal(mailtoUrl({ to: a.to || '', subject: a.subject || a.label || '', body: a.body || '' }));
  } else if (a.type === 'session') {
    logSession({ id: Date.now(), discipline: a.discipline || 'mixed', disciplineName: a.disciplineName || a.discipline || 'Mixed', duration: a.duration || 60, intensity: a.intensity || 7, date: new Date().toISOString() });
  } else if (a.type === 'capture') {
    const now = Date.now();
    addCapture({ id: now, ts: now, text: a.text || a.label || '', tag: a.tag || 'idea', color: '#45B7E8', status: 'inbox', time: ... });
  } else if (a.type === 'focus') {
    setMissionState((s) => ({ ...s, oneThing: a.text || a.label || '' }));
  }
};
```

| `type`    | Effect | External? |
|-----------|--------|-----------|
| `event`   | Adds a block to today's timeline **and** opens Google Calendar prefilled | yes (calendar) |
| `email`   | Opens `mailto:` prefilled | yes (mail client) |
| `session` | Logs a training session locally | no |
| `capture` | Saves a thought/task to the capture inbox (`status: 'inbox'`) | no |
| `focus`   | Sets today's One Thing | no |

In the Companion UI each action is a chip; on tap it fires `runAction`, marks itself done (`✓`), and `celebrate()` haptic plays. The Chief brief has its own `runAction` (event + email only) plus an inline event composer. **Note the deliberate boundary: even "external" actions only *prefill* Google Calendar / mail — the user still hits Save/Send. Nothing is auto-created on Google's side, and no email is auto-sent.**

---

## 6. Memory systems

### 6.1 Live context assembly — `buildGlobalContext()` (Companion.jsx)

Built fresh on **every** Companion turn from `snapshot()` + localStorage. Order/content:
1. Today's date.
2. `Readiness X/100. One thing: …` (if checked in).
3. This week's focus.
4. **Today's mission** (from `lifeos:mission:<day>` or freshly `generateMissions(s)`), with `[done]` flags.
5. **Training** — active skills `Discipline:Skill pct%`, sessions-logged count, and non-low **blindspots** (titles).
6. **Businesses** — ONA stats (members/MRR/NPS), ONA initiatives w/ priority+pct, content brands, active projects (≤8).
7. Capture-inbox count.
8. **Prepended at the very top:** the long-term memory blob (see §6.2):
   ```js
   const mem = readJSON('lifeos:companion:memory', '');
   if (mem) L.unshift(`LONG-TERM MEMORY (what you've learned about Jay over time, carry it forward): ${mem}`);
   ```

### 6.2 Long-term memory — distilled, persistent, synced

- **Storage:** `useSyncedState('lifeos:companion:memory', '')` — a single plain-text blob, synced across devices, capped to 1600 chars on write.
- **Distillation cadence:** every **5** AI exchanges. `memTickRef` counts successful AI replies; at ≥5 it resets and calls `updateMemory`.
- **Distillation call** (`updateMemory`) — an `[INTERNAL]` self-prompt in `partner` mode with `context: ''`:
  ```
  [INTERNAL] Update your long-term memory of Jay. Prior memory: """{memory || 'none yet'}""". From our recent conversation, write an updated, concise long-term memory — durable facts about who he is, his goals, preferences, recurring patterns, and what's worked or not. Keep it under 180 words as short plain lines. Merge with prior memory; drop nothing important. Output ONLY the memory text, no preamble.
  ```
  Result accepted only if `> 20` chars; stored sliced to 1600.
- **Feedback loop:** the stored blob is re-injected at the top of every `buildGlobalContext()`, so each conversation starts with a running portrait of Jay. The header shows a "REMEMBERS YOU" badge when memory exists.

**Limitations (audit):**
- It is **lossy summarization, not retrieval** — there is no transcript store, embeddings, or recall of specifics; the model rewrites one ~180-word blob and can drift or forget despite the "drop nothing important" instruction.
- The distill call uses `mode: 'partner'` and `context: ''`, so the memory update sees only the last ~14 turns, not the global snapshot.
- It updates **only when the AI is live** — `try/catch` makes it a no-op without the key (`/* no key → keep existing memory */`). Fallback (local) conversations never write memory.
- It is per-user but a single global blob — no per-domain or per-mode segmentation.

### 6.3 Other persisted state the AI reads (not "memory" per se)
Per-day mission docs (`lifeos:mission:<day>`), daily check-ins (`lifeos:daily:<day>`), sessions, skills (`lifeos:skills:v2`), ONA (`lifeos:ona`, `lifeos:ona:live`), content, folders, captures, weekly focus, journal, history, telemetry, upgrades changelog. All feed `snapshot()`/`buildGlobalContext()`.

---

## 7. Recommendation systems — hand-authored heuristics (NOT learned)

All recommendation logic lives in `src/lib/mission.js` and `src/MonthlyUpgrade.jsx`. **None of these are models** — they are `if/threshold` rules over the localStorage snapshot. They never auto-execute (`mission.js` header: *"Recommendations never auto-execute anything. Jay stays in command."*).

### 7.1 `recommendOna(ona, live)` — and the invented impact math

Average member value used in all dollar figures: `avgValue = stats.members ? round(mrr/members) : 120`.

- **Stale leads** (last contact > 7 days; prefers the real named-people CRM `pipelinePeople`):
  ```js
  impact: `≈ +$${Math.round(stale * avgValue * 0.25).toLocaleString()}/mo if 1 in 4 converts`,
  why: 'Warm leads close at 2× the rate.'  // (or for counts: 'close at half the rate')
  ```
- **Trial check-in:** `impact: ≈ +$… /mo at +30% close` (`× 0.3`); *"a personal touch during trial week is the single biggest conversion lever."*
- **Win-back** (from live `churn_month`): `impact: ≈ +$… /mo recovered` (`× 0.12`); *"a 'we miss you' message inside 2 weeks recovers 10–15% of cancellations."*
- **Top P0 initiative:** push the lowest-pct P0 past its current %.

**Audit flag — the impact dollars are fabricated estimates.** The conversion constants (0.25, 0.30, 0.12) and claims ("close at 2× the rate", "10–15%") are hard-coded persuasion heuristics, not measured from Jay's actual funnel. They should be read as motivational order-of-magnitude guesses, not analytics.

### 7.2 `recommendContent(content, folders)`
- **Behind-pace brand** (`pct < 60`, not Paused) → "Batch 3 clips for {brand}".
- **Edit-queue ≥ 2** (items in `edit`/`shoot` stage) → "Clear the edit queue ({n})"; *"shot-but-unposted content is banked value earning nothing."*
- **Hook bank < 4** → "Refill the Hook Bank."
- **Project next-actions** due within 3 days (any folder) → surfaces the first unfinished step; overdue ones flagged.

### 7.3 `generateMissions(s)` — the daily campaign (≤5 ranked missions)
Fixed priority order:
1. **The One Thing** (if set) — always #1, `kind: 'focus'`.
2. **Training** — readiness decides *what*, not *whether*: `r==null || r>=60` → push the closest breakthrough; `r>=45` → "Technique-only session — no max efforts"; else → "Recovery block."
3. **Highest-leverage ONA move** — `recommendOna(...)[0]`.
4. **Highest-leverage content/project move** — `recommendContent(...)[0]`.
5. **Cadence ritual** — Sunday → Weekly Review; else inbox≥3 → "Clear the capture inbox"; else Fri/Sat → "Plan something with Chelsea."

Each mission carries `{id, icon, title, why, est, go, kind}`. Time totals via `estimateLabel`. **The "why" strings build trust but are templated, not reasoned.**

### 7.4 Monthly proposals — `buildProposals(m)` (MonthlyUpgrade.jsx)
Threshold rules → Accept/Dismiss cards: inbox ≥ 6 → daily triage habit; any neglected life-domain → protect weekly time; ≥3 sessions but ≤2 disciplines → cross-train; avg readiness < 60 → recovery block; a barely-opened surface (≤2 opens/30d) → "rethink the {surface} surface" (dead-feature detection); ≥2 empty folders → prune/seed; no weekly focus → lock in the Sunday review; thin-data fallback → "capture more."

---

## 8. Decision systems

### 8.1 The fallback brain — `localAnswer(q, mode)` (regex router, mission.js)
When the live model is unreachable, the Companion routes to deterministic sub-answers built from live data. Routing is **mode-first, then keyword, then default to the day plan:**
```js
if (mode === 'coach') return /plan|day|mission/.test(t) ? planDay() : /recover|rest|sore|tired|ready/.test(t) ? recovery() : training();
if (mode === 'ona') return onaPulse();
if (mode === 'creative') return contentMove();
if (mode === 'podium') return 'Podium isn\'t wired to live order data yet … pick the one product that moves revenue …';
if (mode === 'architect') return systems();
if (/plan|day|today|mission|focus/.test(t)) return planDay();
if (/recover|ready|readiness|rest|sore|tired/.test(t)) return recovery();
if (/ona|member|mrr|gym|lead|trial/.test(t)) return onaPulse();
if (/content|hook|post|film|shoot|brand|edit/.test(t)) return contentMove();
if (/skill|train|trick|cork|twist|lever|planche/.test(t)) return training();
if (/system|friction|neglect|improve/.test(t)) return systems();
return planDay();
```
Sub-answers: `planDay` (readiness + ranked missions), `recovery` (verdict from body/energy thresholds 8/6/4), `onaPulse` (stats + `recommendOna`), `contentMove` (`recommendContent`), `training` (`nextBreakthrough` + `upcomingUnlocks` + mastery estimate), `systems` (inbox + weekly focus). **This is keyword matching, not NLU.**

### 8.2 Adaptive re-rank — readiness buckets (`lib/useMissionEngine.js`)
After check-in, if readiness crosses a bucket boundary the training mission is swapped in place, preserving order and completion:
```js
const r = Math.round(((energy + focus + body + mood) / 40) * 100);
const bucket = r >= 60 ? 'push' : r >= 45 ? 'tech' : 'recover';
... if (bucket !== lastBucket) { swap the kind:'train' mission for a freshly generated one; logEvent('mission','adapt',bucket); }
```
Done-state migrates with the swap. *"The cockpit re-plans itself."*

### 8.3 Mastery / progression estimates (mission.js)
`TIER_META` gives each tier a readiness `gate` and a base mastery-time in weeks (Foundation 4 → Elite 30). `masteryEstimate(skill)` = `round(weeks * remaining%)`. `nextBreakthrough` = highest-pct active skill across all trees. `upcomingUnlocks` = locked skills whose prerequisite is active ≥70%. **All linear/heuristic, not predictive.**

### 8.4 Alignment scoring & domain scores (`lib/quests.js`)
`domainScores()` computes 0–100 per life domain from real activity (athlete = avg skill mastery; health = 7-day readiness avg; business = avg of ONA initiatives + business quests; relationships = `40 + wifeNotes*6 + relQuest/2`; creativity = brand pace; learning = `30 + active*12 + done*6`; adventure = `25 + planned*8 + lived*12`; growth = `30 + streak*5 + min(20, journal*2)`). `alignmentScore` = the mean of the eight — the one number atop the cockpit. **The weights/offsets are hand-tuned constants.**

### 8.5 Blindspot analysis — `analyzeBlindspots` (coaching.js)
Reads skill tree + recent sessions (21-day window) + readiness, returns severity-tagged flags an elite coach would call:
1. No sessions in 3 weeks (`high`).
2. Neglected discipline — has active skills, untrained lately (`med`).
3. Shaky foundation — working `Advanced+` while Foundation tier isn't all `done` (`high`).
4. Training monotony — ≥4 recent sessions, all one discipline (`med`).
5. Under-recovered — readiness < 55 (`med`).
6. Always-on rotating nudge — one neglected `FOUNDATIONS` pillar, day-indexed (`low`).

Consumed by the Coach sheet (live panel + prompt context), the Week planner, and `buildGlobalContext`.

### 8.6 The coaching knowledge layer (static expertise, `coaching.js`)
Hand-authored, not generated: `DRILLS` (per discipline × 4 tiers, each drill with `cue`/`gate`/`fault`), `FOUNDATIONS` (10 cross-discipline athletic pillars), `FUNDAMENTALS_BY_DISCIPLINE`, `PROGRAMMING_PRINCIPLES` (7), and `WEEK_TEMPLATE` (a 7-day microcycle). These are fed into the Coach prompts (`drillsFor`, `fundamentalsFor`) and rendered directly in the skill tree and week planner. This is the deepest static-knowledge asset in the app — it grounds both the live coach prompts and the deterministic fallbacks.

---

## 9. Legacy multi-agent endpoint — `api/ai.js`

Still deployed (the V1 "Agents" surface). Same model/transport, `max_tokens: 400`, single-turn. Shares a `BASE` backdrop and switches `PERSONAS` by `agent`:

```
BASE: Jay Martinez is a movement athlete, coach, and creator. He co-owns Obstacle Ninja Academy (ONA, a ninja/movement gym in Orlando) and Podium Creations (premium obstacle equipment), creates content as @jayy_martinez, and travels with his wife Chelsea. He values clarity, calm, freedom, and execution; he hates clutter and busywork. Be concise, direct, and practical — answers must fit on a phone screen (a few short lines, no preamble). Use his live data below and never invent numbers.

PERSONAS:
  chief:     You are Jay's CHIEF OF STAFF. You run his day and priorities, protect his focus and time, and help him decide what matters most. Think in terms of leverage and one clear next action.
  coach:     You are Jay's PERFORMANCE COACH — elite multi-discipline movement coach (gymnastics, tricking, calisthenics, acro, parkour, ninja) grounded in sports science and biomechanics. Advise on training, progressions, recovery, and load, scaled to his readiness.
  creative:  You are Jay's CREATIVE DIRECTOR. You generate content ideas, hooks, captions, shot lists, and campaign angles for his brands and @jayy_martinez. Be punchy and specific; think in scroll-stopping openers and payoffs.
  ona:       You are Jay's ONA OPERATIONS partner. You improve gym operations, member retention, scheduling, staffing, events, and revenue. Be pragmatic and metrics-aware; surface the next operational lever.
  podium:    You are Jay's PODIUM MANUFACTURING partner. You track orders, inventory, product development, CNC/fabrication workflows, fulfillment, and margins. Be concrete about the next build/ship decision.
  architect: You are Jay's SYSTEMS ARCHITECT. You find repeatable friction, suggest automations and better routines, and help him run his life and LifeOS more efficiently. Propose, never impose — he reviews and decides.
```
The companion (`api/companion.js`) supersedes this with the same persona content compressed into the `HATS` map plus a richer shared identity and the action layer.

---

## 10. File map (where each AI thing lives)

| Concern | File |
|---|---|
| Model + transport (legacy agents) | `app/api/ai.js` |
| Companion brain + `ACTIONS_JSON` + memory-distill | `app/api/companion.js` |
| Brief / Weekly Review / Monthly Upgrade prompts | `app/api/chief.js` |
| Session + Week builder prompts | `app/api/coach.js` |
| Goal decomposition (strict JSON) | `app/api/decompose.js` |
| JWT auth gate + rate limit | `app/api/_auth.js` |
| Calendar iCal reader (SSRF-guarded) | `app/api/calendar.js` |
| ONA live-stats webhook | `app/api/ona-webhook.js` |
| Companion UI, hats, `buildGlobalContext`, memory | `app/src/Companion.jsx` |
| Chief brief card + `runAction` | `app/src/ChiefBrief.jsx` |
| Coach session sheet + blindspot panel | `app/src/CoachSheet.jsx` |
| Week periodization sheet | `app/src/WeekPlanSheet.jsx` |
| Weekly review | `app/src/WeeklyReview.jsx` |
| Monthly upgrade report + proposals | `app/src/MonthlyUpgrade.jsx` |
| Goal decomposer sheet | `app/src/GoalDecomposer.jsx` |
| Inline AI helpers (askCompanion/decomposeText) | `app/src/lib/aiActions.js` |
| Long-press interactive object menu | `app/src/components/ObjectMenu.jsx` |
| Long-press gesture hook | `app/src/lib/useLongPress.js` |
| Wired long-press prompts | `app/src/screens/{TodayScreen,TrainingHQ,BuildScreen}.jsx` |
| Mission engine (recommend/generate/localAnswer/snapshot) | `app/src/lib/mission.js` |
| Mission engine React hook + adaptive re-rank | `app/src/lib/useMissionEngine.js` |
| Coaching knowledge (drills/foundations/periodization/blindspots) | `app/src/coaching.js` |
| Domain/alignment scoring | `app/src/lib/quests.js` |
| Client AI fetch wrapper (token attach) | `app/src/lib/api.js` |
| Companion action executor | `app/src/App.jsx` (`runAction`) |

---

## 11. Auditor's bottom line

- **Live AI is real and scoped:** one Anthropic Haiku model, five purpose-built prompts, all gated behind a Supabase-JWT check and a soft 40/min rate limit. Prompts consistently instruct concision, honesty ("not cheerleading"), and "never invent numbers."
- **The operator-action model is conservative by design:** the model can only *propose* `ACTIONS_JSON`; the human taps to confirm; even calendar/email actions merely prefill external apps. No autonomous execution, no destructive operations.
- **The "intelligence" is mostly deterministic.** Behind the LLM, the day-to-day product runs on hand-authored heuristics: the mission ranking, ONA/content recommendations (with **invented dollar-impact math**), blindspot rules, periodization templates, domain scoring, and a regex fallback router. These are transparent and inspectable — but they are rules, not learned models, and should not be represented as predictive analytics.
- **Memory is lightweight:** a single ~180-word self-rewritten blob, live-only, lossy, no retrieval.
- **Known soft spots:** in-memory rate limiting (per-instance only); fabricated conversion constants in ONA impact figures; cosmetic "LifeOS version" counter; long-press AI actions have no offline fallback.
