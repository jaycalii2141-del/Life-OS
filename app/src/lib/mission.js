// ─────────────────────────────────────────────────────────
// LifeOS V2 — Mission Engine
// The brain that decides what deserves Jay's attention today.
//
// Every data source in the app (readiness, skills, sessions, Podium,
// content, projects, captures, calendar, cadence) feeds ONE ranked
// list of missions. The Home screen renders it; the Companion
// references it; Build's Action Center appends to it.
//
// Design rules:
//  • Pure-ish functions over a localStorage snapshot — no React here.
//  • Every mission answers "what is the next best action?", carries a
//    WHY (so trust builds), an estimated time, and a destination tab.
//  • Recommendations never auto-execute anything. Jay stays in command.
// ─────────────────────────────────────────────────────────
import { todayKey } from '../usePersistentState.js';
import { DISCIPLINES } from '../data.js';
import {
  withoutRetiredOnaSnapshot,
  withoutRetiredOnaText,
  withoutRetiredOnaTimeline,
} from './retiredOna.js';
import { gmailHighlights, recommendGmail } from './gmail.js';

function readJSON(key, fb) {
  try { const r = localStorage.getItem(key); return r != null ? JSON.parse(r) : fb; } catch { return fb; }
}

// One read of everything the engine cares about.
export function snapshot() {
  const dailyRaw = readJSON(`lifeos:daily:${todayKey()}`, {});
  const daily = {
    ...dailyRaw,
    timeline: withoutRetiredOnaTimeline(dailyRaw.timeline),
  };
  return withoutRetiredOnaSnapshot({
    daily,
    readiness: daily.energy != null
      ? Math.round(((daily.energy + daily.focus + daily.body + daily.mood) / 40) * 100)
      : null,
    skills: readJSON('lifeos:skills:v2', {}),
    sessions: readJSON('lifeos:sessions', []),
    podium: readJSON('lifeos:podium', {}),
    gmail: readJSON('lifeos:gmail', {}),
    content: readJSON('lifeos:content', {}),
    folders: readJSON('lifeos:folders', []),
    captures: readJSON('lifeos:captures', []),
    weeklyFocus: withoutRetiredOnaText(readJSON('lifeos:weeklyfocus', {}).text),
    journal: readJSON('lifeos:journal', []),
  });
}

// ─────────────────────────────────────────────────────────
// Skill progression meta — powers the progression engine.
// Tier → readiness gate (don't attempt high-risk work run down)
// and a base mastery-time estimate used for "~N weeks left".
// ─────────────────────────────────────────────────────────
export const TIER_META = {
  Foundation: { gate: 40, weeks: 4,  color: '#34D399' },
  Developing: { gate: 55, weeks: 8,  color: '#45B7E8' },
  Advanced:   { gate: 65, weeks: 16, color: '#E9C46A' },
  Elite:      { gate: 75, weeks: 30, color: '#FF6B5B' },
};

export function masteryEstimate(skill) {
  const meta = TIER_META[skill.tier] || TIER_META.Developing;
  if (skill.status === 'done') return null;
  const remaining = Math.max(0, 100 - (skill.pct || 0)) / 100;
  const weeks = Math.max(1, Math.round(meta.weeks * remaining));
  return weeks;
}

// Prerequisite = the skill before it in the tree that isn't mastered.
export function prereqFor(skills, idx) {
  for (let i = idx - 1; i >= 0; i--) {
    if (skills[i].status !== 'done') return skills[i];
  }
  return null;
}

// The single skill closest to its next breakthrough across all trees.
export function nextBreakthrough(skills) {
  let best = null;
  DISCIPLINES.forEach((d) => (skills[d.id] || []).forEach((s) => {
    if (s.status !== 'active') return;
    if (!best || s.pct > best.skill.pct) best = { disc: d, skill: s };
  }));
  return best;
}

// Locked skills whose path is ≥80% clear — "about to unlock".
export function upcomingUnlocks(skills, limit = 3) {
  const out = [];
  DISCIPLINES.forEach((d) => {
    const list = skills[d.id] || [];
    list.forEach((s, i) => {
      if (s.status !== 'locked') return;
      const prereq = prereqFor(list, i);
      if (!prereq || (prereq.status === 'active' && prereq.pct >= 70)) {
        out.push({ disc: d, skill: s, prereq });
      }
    });
  });
  return out.slice(0, limit);
}

// ─────────────────────────────────────────────────────────
// Action recommendations — metrics → moves.
// Every dashboard number must answer "so what should I do?"
// ─────────────────────────────────────────────────────────
export function recommendPodium(podium = {}, folders = []) {
  const recs = [];
  const orders = Math.max(0, Number(podium.orders) || 0);
  const builds = Math.max(0, Number(podium.builds) || 0);
  const folder = (folders || []).find((f) =>
    f?.domain === 'podium' || String(f?.name || '').trim().toLowerCase() === 'podium'
  );
  const projects = (folder?.projects || []).filter((project) => {
    const steps = project.steps || [];
    return !steps.length || steps.some((step) => !step.done);
  });

  if (builds > 0) {
    recs.push({
      id: 'podium-builds', domain: 'podium', icon: '🛠️',
      title: `Move ${builds} active Podium build${builds === 1 ? '' : 's'} toward ship`,
      why: 'Work in progress is the closest business value to becoming delivered revenue.',
      impact: 'Converts fabrication time into shipped work',
      est: 60,
    });
  }

  const queued = Math.max(0, orders - builds);
  if (queued > 0) {
    recs.push({
      id: 'podium-queue', domain: 'podium', icon: '📐',
      title: `Turn ${queued} queued Podium order${queued === 1 ? '' : 's'} into build plans`,
      why: 'A clear materials list, owner, and next fabrication step keeps orders from waiting silently.',
      impact: 'Moves paid demand into production',
      est: 45,
    });
  }

  const project = projects.find((p) => (p.steps || []).some((step) => !step.done)) || projects[0];
  const next = (project?.steps || []).find((step) => !step.done);
  if (project && next) {
    recs.push({
      id: `podium-project-${project.id}`, domain: 'podium', icon: '🏆',
      title: `${project.title}: ${next.text}`,
      why: 'This is the next unfinished step in your active Podium project.',
      impact: 'Moves the highest-priority build forward',
      est: 45,
    });
  }

  return recs;
}

export function recommendContent(content, folders) {
  const recs = [];
  const brands = content.brands || [];
  const items = content.items || [];

  const behind = brands
    .filter((b) => b.status !== 'Paused' && (b.pct ?? 100) < 60)
    .sort((a, b) => (a.pct ?? 0) - (b.pct ?? 0))[0];
  if (behind) {
    recs.push({
      id: 'content-behind', domain: 'social', icon: '🎬',
      title: `Batch 3 clips for ${behind.name}`,
      why: `${behind.name} is at ${behind.pct}% of "${behind.weeklyGoal}" — one shoot block catches it up.`,
      impact: 'Keeps the weekly cadence unbroken',
      est: 45,
    });
  }
  const stuck = items.filter((it) => it.stage === 'edit' || it.stage === 'shoot');
  if (stuck.length >= 2) {
    recs.push({
      id: 'content-stuck', domain: 'social', icon: '✂️',
      title: `Clear the edit queue (${stuck.length} pieces)`,
      why: 'Shot-but-unposted content is banked value earning nothing.',
      impact: `${stuck.length} posts ready to ship`,
      est: 40,
    });
  }
  const hookCount = (content.hooks || []).length;
  if (hookCount < 4) {
    recs.push({
      id: 'content-hooks', domain: 'social', icon: '🪝',
      title: 'Refill the Hook Bank',
      why: `Only ${hookCount} hook${hookCount === 1 ? '' : 's'} left — write 5 while the ideas are cheap.`,
      impact: 'A week of openers, banked',
      est: 15,
    });
  }

  // Project next-actions with near deadlines, from any folder.
  const today = new Date(); today.setHours(0, 0, 0, 0);
  (folders || []).forEach((f) => (f.projects || []).forEach((p) => {
    if (!p.due) return;
    const d = new Date(`${p.due}T00:00:00`);
    if (isNaN(d)) return;
    const days = Math.round((d - today) / 864e5);
    const next = (p.steps || []).find((s) => !s.done);
    if (days <= 3 && next) {
      recs.push({
        id: `proj-${p.id}`, domain: f.domain || 'self', icon: '📌',
        title: `${p.title}: ${next.text}`,
        why: days < 0 ? `Overdue by ${-days}d — this is the unblocking step.` : `Due in ${days}d — this is the next step.`,
        impact: 'Keeps the project on schedule',
        est: 30,
      });
    }
  }));
  return recs;
}

// ─────────────────────────────────────────────────────────
// Mission generation — the daily campaign.
// Returns ≤5 ranked missions: {id, icon, title, why, est, go, kind}
// `go` = tab to jump to. `kind` lets the UI treat some specially.
// ─────────────────────────────────────────────────────────
export function generateMissions(s = snapshot()) {
  const missions = [];
  const day = new Date().getDay(); // 0=Sun … 6=Sat

  // 1 · The One Thing — always mission #1 when set.
  if (s.daily.oneThing) {
    missions.push({
      id: 'one-thing', kind: 'focus', icon: '🎯',
      title: s.daily.oneThing,
      why: 'Your One Thing — the single win that makes today a success.',
      est: 90, go: 'today',
    });
  }

  // 2 · Training — readiness decides WHAT, not WHETHER.
  const r = s.readiness;
  const edge = nextBreakthrough(s.skills);
  if (r == null || r >= 60) {
    if (edge) {
      missions.push({
        id: 'train-edge', kind: 'train', icon: '💪',
        title: `Train ${edge.skill.name} (${edge.skill.pct}%)`,
        why: `Your closest breakthrough in ${edge.disc.name}${r != null ? ` — readiness ${r} says push` : ''}.`,
        est: 75, go: 'perform',
      });
    }
  } else if (r >= 45) {
    missions.push({
      id: 'train-tech', kind: 'train', icon: '🧘',
      title: 'Technique-only session — no max efforts',
      why: `Readiness ${r}: train the nervous system, spare the tissue.`,
      est: 45, go: 'perform',
    });
  } else {
    missions.push({
      id: 'train-recover', kind: 'train', icon: '🛌',
      title: 'Recovery block: mobility + food + early night',
      why: `Readiness ${r} — today the gains come from recovering, not pushing.`,
      est: 30, go: 'life',
    });
  }

  // 3 · The highest-leverage business move.
  const podiumRec = recommendGmail(s.gmail) || recommendPodium(s.podium, s.folders)[0];
  if (podiumRec) missions.push({ ...podiumRec, kind: 'build', go: 'build' });

  // 4 · The highest-leverage content/project move.
  const contentRec = recommendContent(s.content, s.folders)[0];
  if (contentRec) missions.push({ ...contentRec, kind: 'build', go: 'build' });

  // 5 · Mind hygiene + cadence rituals.
  const inbox = s.captures.filter((c) => (c.status || 'inbox') === 'inbox').length;
  if (day === 0) {
    missions.push({
      id: 'weekly-review', kind: 'ritual', icon: '🧭',
      title: 'Run your Weekly Review',
      why: 'Sunday ritual — see where the week went, pick one focus for the next.',
      est: 15, go: 'life',
    });
  } else if (inbox >= 3) {
    missions.push({
      id: 'inbox', kind: 'ritual', icon: '📥',
      title: `Clear the capture inbox (${inbox})`,
      why: 'Open loops tax your focus. Five minutes routes them all.',
      est: 5, go: 'life',
    });
  } else if (day === 5 || day === 6) {
    missions.push({
      id: 'date', kind: 'ritual', icon: '❤️',
      title: 'Plan something with Chelsea',
      why: 'It\'s the weekend — the relationship is a domain too. Protect it.',
      est: 20, go: 'life',
    });
  }

  return missions.slice(0, 5);
}

// Total remaining time, formatted for the mission header.
export function estimateLabel(missions, doneIds) {
  const mins = missions
    .filter((m) => !doneIds.includes(m.id))
    .reduce((s, m) => s + (m.est || 30), 0);
  if (mins <= 0) return 'done for today';
  const h = Math.floor(mins / 60), mm = mins % 60;
  return h ? `~${h}h ${mm ? `${mm}m` : ''}`.trim() : `~${mm}m`;
}

// ─────────────────────────────────────────────────────────
// Local intelligence — keyword-routed answers from live data,
// used by the Companion when the live intelligence is unavailable.
// One mind, different hats: `mode` shifts what it reaches for first.
// ─────────────────────────────────────────────────────────
export function localAnswer(q, mode = 'partner') {
  const s = snapshot();
  const t = (q || '').toLowerCase();

  const planDay = () => {
    const missions = generateMissions(s);
    const head = s.readiness != null ? `Readiness ${s.readiness}/100.` : 'Set your check-in meters on Today to calibrate.';
    const list = missions.map((m, i) => `${i + 1}. ${m.icon} ${m.title} (~${m.est}m)`).join('\n');
    return `${head}\n\nToday's mission:\n${list}\n\nStart at the top — #1 is the highest-leverage move.`;
  };
  const recovery = () => {
    const d = s.daily;
    if (d.body == null) return 'Check in on Today (energy/focus/body/mood) and I\'ll call it.';
    const score = (d.body + d.energy) / 2;
    const verdict = score >= 8 ? 'Fully recovered — green light to push.'
      : score >= 6 ? 'Mostly recovered — train, cap intensity ~80%.'
      : score >= 4 ? 'Under-recovered — technique only, skip max efforts.'
      : 'Run down — mobility, food, sleep. Active recovery only.';
    return `Body ${d.body}/10 · Energy ${d.energy}/10\n\n${verdict}`;
  };
  const podiumPulse = () => {
    const p = s.podium || {};
    const email = gmailHighlights(s.gmail, 3);
    const emailRec = recommendGmail(s.gmail);
    const recs = [
      ...(emailRec ? [emailRec] : []),
      ...recommendPodium(p, s.folders),
    ];
    const metrics = `Open orders ${p.orders ?? 0} · Active builds ${p.builds ?? 0} · Revenue $${Number(p.revenue || 0).toLocaleString()}`;
    const inbox = email.length
      ? `\n\nInbox pulse:\n${email.map((item) => `• ${item.title} — ${item.summary}`).join('\n')}`
      : '';
    const moves = recs.length
      ? recs.map((r) => `• ${r.title} — ${r.impact}`).join('\n')
      : '• No urgent Podium move is visible. Add an order, active build, or project next step and I’ll prioritize it.';
    return `${metrics}${inbox}\n\nRecommended moves:\n${moves}`;
  };
  const contentMove = () => {
    const recs = recommendContent(s.content, s.folders);
    if (!recs.length) return 'All brands on pace. Bank extra content while you\'re ahead — batch 3 verticals: hook → demo → payoff.';
    return `Next content moves:\n${recs.map((r) => `• ${r.title} — ${r.why}`).join('\n')}`;
  };
  const training = () => {
    const edge = nextBreakthrough(s.skills);
    const unlocks = upcomingUnlocks(s.skills, 2);
    const bits = [];
    if (edge) bits.push(`Closest breakthrough: ${edge.skill.name} at ${edge.skill.pct}% (${edge.disc.name}). ~${masteryEstimate(edge.skill)} wks at current pace.`);
    if (unlocks.length) bits.push(`About to unlock: ${unlocks.map((u) => u.skill.name).join(', ')}.`);
    bits.push('Open Perform → tap the skill for its drills, gates and faults.');
    return bits.join('\n\n');
  };
  const systems = () => {
    const inbox = s.captures.filter((c) => (c.status || 'inbox') === 'inbox').length;
    const bits = [];
    bits.push(inbox ? `${inbox} thoughts untriaged — clear them in Life to cut mental load.` : 'Capture inbox is clean.');
    bits.push(s.weeklyFocus ? `Week's focus: "${s.weeklyFocus}". Protect a recurring block for it.` : 'No weekly focus set — run the Weekly Review (Life tab).');
    return bits.join('\n\n');
  };

  // Mode-first routing, then keywords, then the day plan.
  if (mode === 'coach') return /plan|day|mission/.test(t) ? planDay() : /recover|rest|sore|tired|ready/.test(t) ? recovery() : training();
  if (mode === 'creative') return contentMove();
  if (mode === 'podium') return podiumPulse();
  if (mode === 'architect') return systems();
  if (/plan|day|today|mission|focus/.test(t)) return planDay();
  if (/recover|ready|readiness|rest|sore|tired/.test(t)) return recovery();
  if (/podium|order|build|fabricat|product|revenue/.test(t)) return podiumPulse();
  if (/content|hook|post|film|shoot|brand|edit/.test(t)) return contentMove();
  if (/skill|train|trick|cork|twist|lever|planche/.test(t)) return training();
  if (/system|friction|neglect|improve/.test(t)) return systems();
  return planDay();
}
