# LifeOS — Founder's Blueprint

*The operating system for an extraordinary life. Written for Jay Martinez — co-owner of Obstacle Ninja Academy & Podium Creations, movement athlete, coach, creator, husband, builder.*

---

## 0. Read this first: where we actually are

You asked me to think like a founder, not just a coder. The most founder-like thing I can tell you up front: **you don't have a blank page. You have a real, shipped product.** LifeOS already exists as a deployed PWA (`life-os-ochre-one.vercel.app`) with auth, cloud sync, and live data screens. The wrong move now is to redesign from zero. The right move is to treat what's built as **v1**, name what it's missing, and pour energy into the few things that create disproportionate clarity.

**What's already live today:**

- **Mission Control** — daily "one thing," timeline, readiness, greeting, streak/momentum.
- **Training HQ** — researched skill trees across 6 disciplines (gymnastics, tricking, calisthenics, acro, parkour, ninja) with tiered progressions + learning cues; session logging; and a new **AI Coach** that builds today's session from your skill tree, recent training, and readiness.
- **ONA** — editable members/retention/revenue/initiatives/coaches/sales pipeline.
- **Create** — brand folders (ONA, Podium, Movement, @jayy_martinez, Wife & I) with notes + projects, pinning, capture-import.
- **AI tab** — a chat that reasons over your app data (full LLM once your Anthropic key is added).
- **Calendar** — read-only Google Calendar sync into the timeline + a 14-day view + quick-add.
- **Foundation** — Supabase auth + per-user cloud sync, PWA install, dark "HUD" design language.

So the question this blueprint answers is not *"what should LifeOS be?"* It's *"how do we evolve the LifeOS you already use into the self-improving, agent-driven life operating system you described — without bloating it?"*

---

## 1. The thesis (one sentence) and the filter

**Thesis:** LifeOS is the single surface where Jay sees what matters today, captures everything in one place, and lets a team of AI agents turn his businesses, training, and life from *chaos he manages* into *systems that run and improve themselves.*

Every feature must pass **the filter** (yours, kept verbatim because it's good): does it make life easier, help me execute faster, help me grow, reduce chaos, create freedom, make the businesses better, or move me toward who I want to become? If a feature doesn't clearly answer one of those, it doesn't ship — it goes on the "later" pile or dies.

**The honest founder's reframe of your goal:** you don't actually want "an app with everything in it." You want *fewer decisions and less mental clutter.* Those are opposite forces. Every screen, integration, and agent you add is a tax on attention. The whole discipline of this blueprint is spending that tax only where it buys real clarity.

---

## 2. Blind spots & hard truths (you asked me to challenge you)

1. **The enemy is bloat, and your own prompt is the threat.** You listed ~12 life areas, ~11 agents, ~20 integrations. Build all of that and you'll get the exact "corporate dashboard" energy you said you hate. The skill here is subtraction. This blueprint deliberately cuts ~70% of it out of the near term.

2. **Capture is the keystone — and it's your current weakest point.** Notes and projects live inside separate screens. But thoughts don't arrive sorted by screen; they arrive mid-training, mid-drive, mid-conversation. If there isn't **one frictionless capture box that sorts itself later**, the whole "second brain" promise collapses. This is the single highest-leverage thing to build next.

3. **"Self-improving" is mostly a measurement problem, not an AI problem.** An app can't improve what it doesn't observe. Before any fancy agent rewrites your dashboards, LifeOS needs lightweight **usage telemetry** (what you open, what you ignore, what you abandon). 90% of "self-improvement" is just reflecting that back to you weekly. Build the mirror before the magician.

4. **Integrations are where dreams go to die.** Oura, Whoop, Stripe, Square, GymDesk, QuickBooks — each is a real backend project with OAuth, tokens, rate limits, and maintenance. Wiring even three of them is more work than everything you've built so far. Treat integrations as a *paced* program, not an MVP checkbox. Start with the ones that are cheap and already half-done (Google Calendar — done; Gmail/Drive/Notion — available through me right now).

5. **You already have two LifeOS halves and haven't named them.** There's (a) **the app** you tap every day, and (b) **me — your agent in Cowork** — who can actually read your Gmail, calendar, Notion, and Drive and *act*. The "team of agents" you want is realized faster as *scheduled tasks + me operating your connectors* than as code baked into the PWA. Naming this split changes the build plan (see §6).

6. **Two businesses + elite training + marriage + travel is a focus-allocation problem, not a feature problem.** The most valuable thing LifeOS can show you isn't another metric — it's *"you've put 9 days into Podium and 1 into ONA; is that the bet you meant to make?"* Time/attention allocation across your domains is the insight no off-the-shelf tool gives you. Make that a first-class feature, not an afterthought.

7. **Beware the app becoming a second job.** If LifeOS needs more than ~3 minutes of input a day, you'll abandon it like everyone abandons habit trackers. Design every feature to *pull data automatically or infer it*, and make manual entry optional, fast, and rewarding.

---

## 3. Core user journeys (the moments that matter)

Design the product around five repeated moments, not around screens.

**A. The Morning Brief (≤ 60 seconds).** You open LifeOS. The Chief of Staff has already assembled: today's calendar (ONA coaching, etc.), your readiness, the single highest-leverage action, anything falling behind, and one nudge toward a goal. You read, you adjust the "one thing," you go. *This already half-exists in Mission Control — it becomes a true brief once it pulls calendar + email + the agents.*

**B. Capture (≤ 5 seconds, any time).** A thought hits — a content idea, a Podium order issue, a skill to drill, a gift idea for Chelsea. One box. You dump it. You never decide *where* it goes in the moment. Later, triage (you or an agent) routes it to the right folder/project/skill.

**C. Train (pre-session).** You're about to move. "Build my session" reads your skill tree, recent load, and readiness and hands you today's plan, then you log it in one tap. *Just shipped — this is the template for how every domain should feel.*

**D. The Weekly Review (Sunday, ~10 min).** LifeOS shows the week: what you completed, what slipped, where your time/attention actually went across ONA / Podium / training / marriage / self, wins, and the one focus for next week. This is the heartbeat that keeps the system honest.

**E. The Monthly Upgrade Report.** LifeOS reflects on *itself*: what you used, what you ignored, what created friction — and proposes concrete, reviewable changes (new automation, a dead feature to remove, a better routine). You approve or reject. This is the self-improving loop made tangible and safe.

If LifeOS nails these five moments, it's magical. Everything else is detail.

---

## 4. Information architecture (consolidate, don't multiply)

You listed ~13 screens. That's a bloat trap. Collapse to **five surfaces + a universal capture bar**:

1. **Today (Command Center)** — the morning brief, one thing, timeline, readiness, what-needs-attention. *(Mission Control, evolved.)*
2. **Build** — everything you're creating: brand/business folders, projects, notes, content. ONA and Podium operations live here as folders with their own dashboards. *(Create + ONA, merged conceptually.)*
3. **Train** — skill trees, AI coach, session log, body/readiness trends. *(Training HQ.)*
4. **Mind** — capture inbox/triage, journal/reflection, learning, weekly & monthly reviews. *(New, mostly — this is where "second brain" lives.)*
5. **Agents** — your AI team: chat with any agent, see what they did, approve their proposals. *(AI tab, evolved into an agent hub.)*

Plus a **persistent capture button** present on every screen.

The discipline: **no sixth top-level tab without killing one.** Depth lives *inside* these five, not as new siblings. "Finance," "Health," "Relationships," "Learning" are *sections inside Build/Mind/Today*, surfaced only when they have data worth showing.

---

## 5. Data model — evolving past key/value

Today LifeOS stores everything as `app_state(user_id, key, value jsonb)`. That was the right call to move fast, and it should stay as the sync substrate. But "self-improving" and cross-domain insight need a few **typed tables** so agents can query, not just blob-read. Proposed Supabase evolution (additive — nothing breaks):

- **`captures`** — `id, user_id, text, source, created_at, status(inbox/triaged/archived), routed_to(jsonb), tags[]`. The inbox that feeds everything.
- **`items`** — unified tasks/projects/notes: `id, user_id, type, title, body, domain(ona/podium/movement/social/wife/self), status, due, parent_id, priority, created_at, updated_at`. One table for "things to do/track" across all domains — this is what lets the Chief of Staff reason across your whole life.
- **`sessions`** — training log (already conceptually exists): `id, user_id, discipline, skills[], duration, intensity, readiness, notes, date`.
- **`events_telemetry`** — `id, user_id, surface, action, ts`. The mirror that powers self-improvement. Cheap, append-only, privacy-local.
- **`reviews`** — `id, user_id, kind(weekly/monthly), period, summary(jsonb), proposals(jsonb), status(draft/accepted/dismissed)`. Where agent proposals wait for your approval.
- **`agent_runs`** — `id, user_id, agent, input, output, created_at, status`. Audit log of what every agent did — essential for trust and the "reviewable before applied" safety rule.

Keep RLS per-user (already in place). Keep the `useSyncedState` blob path for UI state; move *entities* (captures, items, sessions, reviews) to typed tables as they mature. Migrate one domain at a time, starting with `captures`.

---

## 6. AI & agent architecture (realistic, on the stack you have)

You don't need a sci-fi multi-agent swarm. You need a **Chief of Staff orchestrator** plus a small set of **specialist system prompts**, each callable as a serverless endpoint, plus **scheduled tasks** that run them on a cadence, plus **me** for anything that touches your real connectors. That's it. It's buildable now.

**The pattern (you already proved it twice — `/api/ai` and `/api/coach`):**
each "agent" = one serverless function with (1) a sharp system prompt defining its role, (2) a `context` payload assembled from your data, (3) a structured response. No orchestration framework, no vector DB on day one.

**The roster — sequenced, not all at once:**

- **Chief of Staff (build first).** Assembles the Morning Brief and runs triage. Reads calendar + items + captures + readiness; outputs today's priorities and the "one thing." This is the agent that makes LifeOS feel alive.
- **Performance Coach (shipped).** Already live as the session builder.
- **Creative Director (cheap win).** Reads your content folders/hooks; proposes posts, captions, campaign angles for @jayy_martinez, ONA, Podium.
- **ONA Ops & Podium Ops (next).** Each reads its folder's data and surfaces retention risks / order & inventory issues, suggests next actions. Start rule-based + LLM summary; deepen when real integrations land.
- **Weekly Reviewer & Systems Architect (the self-improvement pair).** One summarizes your week; the other reads telemetry and drafts upgrade proposals.
- **Later:** Health & Recovery, Learning Coach, Financial Strategy, Relationship, Future Self. Add each only when there's real data to feed it — an agent with no data is theater.

**Memory.** Start with "recent + relevant rows queried from Postgres" as context (cheap, transparent). Add a vector store (pgvector in Supabase) *only* when journal/notes volume makes semantic recall worth it — likely V2, not MVP.

**The two halves, named.** The PWA agents run on your data inside the app. **I (your Cowork agent)** am the half that reaches your live Gmail, Google Calendar, Google Drive, and Notion and can *act* — draft the email, create the calendar event, file the doc, build the Canva asset. The practical "agent team" you want this quarter is largely *scheduled tasks that invoke me* to do real work and drop results into LifeOS. That's available today; the in-app agents are the durable long-term form.

---

## 7. Self-improving architecture (with the safety rail you asked for)

The loop, concretely:

1. **Observe.** `events_telemetry` logs what you open, edit, ignore, abandon. Local-first, yours only.
2. **Reflect.** A weekly job (scheduled task) reads telemetry + your items/sessions and writes a `reviews` row: what you used, what's dead, where friction is, what slipped.
3. **Propose.** The Systems Architect agent drafts specific, bounded upgrade proposals ("you never open the Sales pipeline — archive it?"; "you capture content ideas daily but never schedule them — add a 2-tap 'schedule post'?"; "your Tuesday mornings are always overbooked — protect them?").
4. **Review (the rail).** Proposals land in an **Upgrade Report** you approve or dismiss. **Nothing structural auto-applies.** No agent deletes data, changes a business number, or rewrites a screen without your explicit yes. Every agent action is logged in `agent_runs`. This directly honors your constraint: *suggest automatically, change only on review.*
5. **Apply & version.** Accepted proposals bump LifeOS v1 → v2 → v3 in a visible changelog, so the system's evolution is legible, not mysterious.

Crucial point: the value is 80% in steps 1–3 (the mirror and the suggestions). Resist letting agents *act* on the app's structure autonomously — that's where unsafe, "why did my app change" moments come from.

---

## 8. Integrations — value, and MVP vs. later (be honest)

| Source | Why it matters | MVP? | How |
|---|---|---|---|
| **Google Calendar** | Truth of your time; powers the brief | **Done** | Read-only iCal feed parsed server-side |
| **Gmail** | Follow-ups, opportunities, ONA/Podium inbox | **Now (via me)** | Cowork connector — triage, draft, surface; in-app later |
| **Google Drive** | Docs, SOPs, assets | **Now (via me)** | Cowork connector — read/organize/create |
| **Notion** | If you keep ops/wikis there | **Now (via me)** | Cowork connector — read/write pages & DBs |
| **Canva** | Content & Podium creative | **Now (via me)** | Cowork connector — generate designs |
| **Apple Health / Oura / Whoop** | Sleep, recovery, readiness — auto-fills Training | **Later (V2)** | Real OAuth + backend; start by manual readiness (done) |
| **Stripe / Square** | ONA & Podium revenue, live cash flow | **Later (V2)** | OAuth + webhook ingestion → `items`/dashboards |
| **GymDesk / member CRM** | ONA retention, attendance, churn risk | **Later (V2)** | API or CSV import to start |
| **QuickBooks / bank** | Real finance picture | **Later (V3)** | High-trust, high-effort; defer until businesses demand it |
| **Shopify / Woo** | Podium orders & fulfillment | **Later (V2/V3)** | When Podium sells online at volume |
| **Voice notes / photos / training video** | Capture & review at the speed of life | **Phased** | Voice→capture inbox is a strong V2 magic moment |

Rule: an integration earns its place only when it *removes manual entry* or *unlocks an insight you can't get otherwise.* Everything that's "Now (via me)" needs zero new app code — it's available immediately through your connected tools.

---

## 9. Design system (codify what's already good)

You've already established the aesthetic — keep it, formalize it so it stays consistent as the app grows:

- **Dark HUD** base; restrained, premium, calm. CSS variables already define the palette (cyan `#00D4FF`, violet, lime `#B6FF3C`, gold, ONA-red `#FF0033`, muted/dim/line/text).
- **Per-domain accent colors** (the tier colors, brand colors) for instant orientation.
- **Components already in use:** `hud glass` cards, `pressable`, `eyebrow`/`display`/`mono` type roles, bottom **sheets** (`scrim` + `sheet` + `sheet-handle`), `HUDTicks`. Treat these as the locked design kit; new features compose from them rather than inventing styles.
- **Motion & feel:** fast, tactile, one-tap. Every primary action is a single thumb-reachable button. No nested menus.
- **The 3-minute rule:** any daily interaction must be completable in under 3 minutes, mostly taps not typing.

Don't redesign. Constrain. The premium feeling comes from *consistency and restraint*, which you already have — protect it.

---

## 10. MVP — the smallest magical version

The MVP is **not** "all areas." It's the five moments (§3) running on the app you have, plus the keystone you're missing. Concretely, MVP = current app **+ these four additions:**

1. **Universal Capture + Triage inbox** (the keystone). One button everywhere → dump → later route to domain/project/skill. *(Mind tab + `captures` table.)*
2. **Chief of Staff Morning Brief** on Today, pulling calendar + items + readiness into one glanceable brief with the single highest-leverage action.
3. **Weekly Review** screen — completed/slipped, where your attention went across domains, one focus for next week.
4. **Usage telemetry + a first Monthly Upgrade Report** — the mirror, even if proposals are simple at first.

**Explicitly cut from MVP** (say it out loud so it doesn't creep in): finance integrations, Oura/Whoop, GymDesk, Podium inventory automation, vector memory, the full 11-agent roster, video review, learning curriculum. They're real and they're coming — just not in the version that has to feel magical first.

MVP success test: *for two weeks straight, you open LifeOS first thing every morning and it tells you something true and useful you'd otherwise have missed.* If yes, it's working. If no, fix the brief before adding anything.

---

## 11. Roadmap

**V1 (now → ~4 weeks): Clarity & Capture.** Ship the MVP four. Make the Morning Brief and Capture genuinely good. Wire me (Cowork agent) into your real Gmail/Calendar/Notion/Drive so the "agent team" delivers value before the in-app versions exist.

**V2 (~1–3 months): Intelligence & the first real integrations.** Chief of Staff gets sharper (learns your patterns). Add ONA Ops + Podium Ops + Creative Director agents on real data. Land the first *automatic* data feed (readiness from Apple Health/Oura) and the first business feed (Square/Stripe revenue). Voice capture. pgvector memory for journal/notes recall.

**V3 (~3–9 months): The self-running businesses.** Member/retention intelligence for ONA; order/inventory/fulfillment for Podium; finance picture (QuickBooks). Monthly Upgrade Reports that meaningfully reshape the app with your approval. Relationship + Future Self agents for the longer-horizon decisions.

**Long term: the OS for an extraordinary life.** LifeOS quietly runs the operational layer of both businesses, keeps your training progressing, protects time with Chelsea and for travel, and hands you — every morning — a life that feels *chosen* rather than reacted to. The measure isn't features shipped; it's hours of chaos removed and clarity returned.

---

## 12. Risks & tradeoffs (eyes open)

- **Bloat / abandonment** *(highest risk).* Mitigation: the §1 filter, the 5-surface cap, the 3-minute rule, ruthless cutting.
- **Maintenance load.** You're not a full-time dev; every integration is forever-maintenance. Mitigation: prefer connectors-through-me and read-only feeds over fragile two-way syncs; add integrations slowly.
- **AI cost & latency.** Multiple agents on every screen = real API spend. Mitigation: cache, use Haiku for routine summarization (already chosen), reserve bigger models for weekly/monthly reflection.
- **Trust & safety of agent actions.** Mitigation: the review rail, `agent_runs` audit log, and the hard rule that nothing irreversible (delete, business change, money) happens without your explicit confirmation.
- **Data lock-in / portability.** It's your life in here. Mitigation: keep export easy; Supabase is yours; never trap data.
- **Single point of failure (you).** If only you understand it, it's fragile. Mitigation: keep the architecture legible — typed tables, audit logs, a visible changelog.

---

## 13. First build sprint (concrete, maps to the current codebase)

This is what I'd build next, in order. Each is a self-contained, shippable step on the existing Vite + React + Supabase + Vercel stack.

1. **Universal Capture.** A floating capture button on every screen + a `captures` Supabase table + a triage view in a new **Mind** tab. Dump now, route later (to a folder/project/skill/task). *This is the keystone — I'd start here.*
2. **Chief of Staff brief.** A `/api/chief` endpoint (same pattern as `/api/coach`) that takes calendar + items + readiness + open captures and returns today's priorities + the one highest-leverage action; render it at the top of Today. Graceful local fallback when no API key, exactly like the coach.
3. **Telemetry.** A tiny `logEvent(surface, action)` helper writing to `events_telemetry`; instrument tab opens and key actions. Invisible to you, foundational for everything self-improving.
4. **Weekly Review.** A screen (and optional scheduled task) that summarizes the week from sessions + items + telemetry and asks you to set one focus for next week.

I'd ship #1 first as its own round (it changes daily behavior the most), then #2, then #3+#4 together.

**One thing I need from you to unlock the full experience:** add your **`ANTHROPIC_API_KEY`** in Vercel (the same key powers the AI tab, the coach, and the Chief of Staff). Until then everything degrades gracefully to local logic — but with the key, LifeOS goes from "tracks my life" to "thinks about my life with me."

---

*Tell me which sprint item to build first and I'll start. My recommendation: Universal Capture. It's the keystone the whole "second brain" rests on, it changes how you use the app every single day, and everything else — triage, the brief, the agents — gets better the moment capture exists.*
