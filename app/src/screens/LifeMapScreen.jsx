// ─────────────────────────────────────────────────────────
// JAM HQ — THE LIFE MAP
// A living ecosystem, not a checklist. Eight domains orbit the
// center; each node's ring shows its score, computed from real
// activity. Tap a domain to enter it — Health, Relationships,
// Learning Lab, Adventure Hub, and the daily Inbox/Journal all
// live here.
// ─────────────────────────────────────────────────────────
import { useState, useMemo, useRef } from 'react';
import { SectionHead, ProgressBar, RadarChart, Sparkline, useCountUp } from '../components/atoms.jsx';
import { Sheet } from '../components/Sheet.jsx';
import { IconInbox, IconBook, IconCompass, IconArchive, IconTrash, IconCheck, IconPlus, IconChevronRight, IconSparkles, IconCalendar, IconArrowRight, IconTarget, IconWarn, IconActivity } from '../components/icons.jsx';
import { ObjectMenu } from '../components/ObjectMenu.jsx';
import { askCompanion } from '../lib/aiActions.js';
import { LIFE_DOMAINS, SEED_FOLDERS, DOMAIN_ALIASES, DISCIPLINES } from '../data.js';
import { useSyncedState } from '../useSyncedState.js';
import { logEvent } from '../lib/telemetry.js';
import { celebrate } from '../lib/haptics.js';
import { googleCalendarUrl, openExternal } from '../lib/actions.js';
import { LIFE_MAP_DOMAINS, domainScores, alignmentScore } from '../lib/quests.js';
import { snapshot } from '../lib/mission.js';
import { lifeLevel } from '../lib/level.js';
import { becomingLine } from '../lib/becoming.js';
import { TheSelf } from '../components/TheSelf.jsx';
import { BecomingTimeLapse } from '../components/BecomingTimeLapse.jsx';
import { evaluateMilestones } from '../lib/milestones.js';

function folderForDomain(folders, domain) {
  let f = folders.find((x) => x.domain === domain);
  if (f) return f;
  const aliases = DOMAIN_ALIASES[domain] || [];
  return folders.find((x) => aliases.includes((x.name || '').trim().toLowerCase()));
}

const TAG_COLORS = { idea: '#45B7E8', ona: '#FF6B5B', dream: '#2DD4BF', task: '#34D399' };

function fmtDay(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return `Today ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  const yest = new Date(today); yest.setDate(today.getDate() - 1);
  if (d.toDateString() === yest.toDateString()) return 'Yesterday';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// ─────────────────────────────────────────────────────────
// The map itself — an orbital SVG ecosystem.
// ─────────────────────────────────────────────────────────
// Contextual AI actions for a life domain (long-press a node).
function domainActions(dom, enter) {
  const ctx = `my "${dom.name}" life domain (currently ${dom.score}/100)`;
  return [
    { id: 'analyze', ai: true, icon: <IconActivity size={15} />, label: 'Analyze this domain', hint: 'Where it stands + why', run: () => askCompanion(`Give me an honest 2-3 sentence read on ${ctx}: where it stands, what's driving the score, and whether it's trending right. Specific, no preamble.`) },
    { id: 'levelup', ai: true, icon: <IconTarget size={15} />, label: 'One move to level it up', hint: 'The highest-leverage action', run: () => askCompanion(`What is the single highest-leverage move this week to raise ${ctx}? One concrete action, 1-2 sentences, no preamble.`) },
    { id: 'limiter', ai: true, icon: <IconWarn size={15} />, label: "What's pulling it down", hint: 'The limiter + the fix', run: () => askCompanion(`What's most likely holding back ${ctx}, and the fix? 2 sentences, specific.`) },
    { id: 'enter', ai: false, icon: <IconCompass size={15} />, label: 'Enter domain', hint: 'Open this space', run: () => enter() },
  ];
}

function LifeMapViz({ scores, facets, becoming, level, trend, onPick, onLongPick }) {
  const size = 340;
  const cx = size / 2, cy = size / 2;
  const orbit = 128;
  // Inline long-press: tap enters the domain, hold opens AI actions.
  const timer = useRef(null);
  const longRef = useRef(false);
  const down = (id) => () => { longRef.current = false; clearTimeout(timer.current); timer.current = setTimeout(() => { longRef.current = true; try { navigator.vibrate?.(12); } catch { /* */ } onLongPick(id); }, 440); };
  const up = (id) => () => { clearTimeout(timer.current); if (!longRef.current) onPick(id); };
  const leave = () => clearTimeout(timer.current);
  const nodes = LIFE_MAP_DOMAINS.map((d, i) => {
    const angle = -Math.PI / 2 + (i / LIFE_MAP_DOMAINS.length) * Math.PI * 2;
    return { ...d, x: cx + orbit * Math.cos(angle), y: cy + orbit * Math.sin(angle), score: scores[d.id]?.score ?? 0 };
  });
  const ringFor = (score, r) => {
    const c = 2 * Math.PI * r;
    return { strokeDasharray: `${(c * score) / 100} ${c}`, strokeDashoffset: 0 };
  };

  return (
    <div className="hud glass-strong mesh-readiness" style={{ borderRadius: 22, padding: '10px 0 4px', position: 'relative' }}>
      <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${size} ${size}`} style={{ width: '100%', display: 'block' }}>
        {/* connections — everything feeds everything */}
        {nodes.map((n) => (
          <line key={`l-${n.id}`} x1={cx} y1={cy} x2={n.x} y2={n.y}
            stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        ))}
        {nodes.map((n, i) => {
          const next = nodes[(i + 1) % nodes.length];
          return <line key={`c-${n.id}`} x1={n.x} y1={n.y} x2={next.x} y2={next.y} stroke="rgba(255,255,255,0.035)" strokeWidth="1" strokeDasharray="2 5" />;
        })}

        {/* domain nodes orbit The Self */}
        {nodes.map((n) => (
          <g key={n.id} onPointerDown={down(n.id)} onPointerUp={up(n.id)} onPointerLeave={leave} style={{ cursor: 'pointer', touchAction: 'manipulation' }}>
            <circle cx={n.x} cy={n.y} r={26} fill="rgba(16,18,20,0.85)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            <circle cx={n.x} cy={n.y} r={29} fill="none" stroke={n.color} strokeWidth="2" strokeLinecap="round"
              style={ringFor(n.score, 29)} transform={`rotate(-90 ${n.x} ${n.y})`} />
            <text x={n.x} y={n.y + 1} textAnchor="middle" style={{ font: '14px sans-serif' }}>{n.icon}</text>
            <text x={n.x} y={n.y + 15} textAnchor="middle" fill={n.color} style={{ font: '700 8px JetBrains Mono, monospace' }}>{n.score}</text>
            <text x={n.x} y={n.y + 42} textAnchor="middle" fill="#9AA0AC" style={{ font: '600 9.5px JetBrains Mono, monospace', letterSpacing: '0.1em' }}>{n.name.toUpperCase()}</text>
          </g>
        ))}
      </svg>
        {/* The Self lives at the heart, with the domains orbiting it */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <TheSelf facets={facets} becoming={becoming} level={level} trend={trend} size={150} />
        </div>
      </div>
      <div className="eyebrow" style={{ textAlign: 'center', paddingBottom: 8, color: 'var(--dim)' }}>tap a domain to enter it</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Domain panels — each opens in a sheet.
// ─────────────────────────────────────────────────────────
function ListHub({ title, accent, placeholder, items, onAdd, onToggle, onDelete, doneLabel = 'DONE', emptyCopy }) {
  const [draft, setDraft] = useState('');
  const add = () => { if (!draft.trim()) return; onAdd(draft.trim()); setDraft(''); };
  const open = items.filter((i) => !i.done);
  const done = items.filter((i) => i.done);
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} placeholder={placeholder}
          style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', borderRadius: 12, padding: '11px 13px', color: 'var(--text)', fontSize: 14, outline: 'none', fontFamily: 'var(--font-body)' }} />
        <div className="pressable" onClick={add} style={{ width: 44, borderRadius: 12, background: `linear-gradient(135deg, ${accent}, #45B7E8)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A0B0D' }}><IconPlus size={18} stroke={2.4} /></div>
      </div>
      {!items.length && <div className="eyebrow" style={{ color: 'var(--dim)', lineHeight: 1.6 }}>{emptyCopy}</div>}
      {open.map((it) => (
        <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 2px', borderTop: '1px solid var(--line)' }}>
          <div className="pressable" onClick={() => { onToggle(it.id); celebrate(); }} style={{ width: 20, height: 20, borderRadius: 7, flexShrink: 0, border: `1.5px solid ${accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
          <span style={{ flex: 1, fontSize: 14, color: 'var(--text)', lineHeight: 1.3 }}>{it.text}</span>
          <div className="pressable" onClick={() => onDelete(it.id)} style={{ color: 'var(--dim)' }}><IconTrash size={14} /></div>
        </div>
      ))}
      {done.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <div className="eyebrow" style={{ color: accent, marginBottom: 6 }}>{doneLabel} · {done.length}</div>
          {done.map((it) => (
            <div key={it.id} className="pressable" onClick={() => onToggle(it.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 2px' }}>
              <IconCheck size={14} color={accent} stroke={2.6} />
              <span style={{ flex: 1, fontSize: 13, color: 'var(--dim)', textDecoration: 'line-through' }}>{it.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DomainSheet({ domainId, onClose, ctx }) {
  const meta = LIFE_MAP_DOMAINS.find((d) => d.id === domainId);
  const { scores, readiness, trend, folders, onGoTab, onOpenReview, onOpenUpgrade, learning, setLearning, adventure, setAdventure } = ctx;
  if (!meta) return null;
  const d = scores[domainId] || { score: 0, signal: '' };

  const listProps = (items, setItems) => ({
    items,
    onAdd: (text) => setItems((l) => [{ id: Date.now(), text, done: false, ts: Date.now() }, ...l]),
    onToggle: (id) => setItems((l) => l.map((x) => (x.id === id ? { ...x, done: !x.done, doneAt: !x.done ? Date.now() : undefined } : x))),
    onDelete: (id) => setItems((l) => l.filter((x) => x.id !== id)),
  });

  const GoBtn = ({ tab, label }) => (
    <div className="pressable" onClick={() => { onClose(); onGoTab?.(tab); }} style={{
      marginTop: 14, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
      background: `${meta.color}14`, border: `1px solid ${meta.color}55`, color: meta.color, fontWeight: 700, fontSize: 12.5, letterSpacing: '0.08em', textTransform: 'uppercase',
    }}>{label} <IconArrowRight size={15} /></div>
  );

  let body = null;
  if (domainId === 'health') {
    const verdict = readiness >= 75 ? ['Green light', 'Fully charged — push intensity or attempt new skills today.', 'var(--lime)']
      : readiness >= 55 ? ['Steady', 'Train with intent, cap intensity ~80%, protect sleep tonight.', 'var(--gold)']
      : ['Recover', 'Mobility, food, an early night. Recovery is the workout today.', 'var(--ona-red)'];
    body = (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="display" style={{ fontSize: 52, lineHeight: 0.9, color: verdict[2] }}>{readiness}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: verdict[2] }}>{verdict[0]}</div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.5, marginTop: 2 }}>{verdict[1]}</div>
            {trend != null && <div className="mono" style={{ fontSize: 9, color: trend >= 0 ? 'var(--lime)' : 'var(--ona-red)', marginTop: 4 }}>{trend >= 0 ? '▲ +' : '▼ '}{trend} VS 7-DAY AVG</div>}
          </div>
        </div>
        <div className="eyebrow" style={{ marginTop: 14, lineHeight: 1.6 }}>Check in daily on Command — energy, focus, body, mood. The mission engine plans around it.</div>
      </div>
    );
  } else if (domainId === 'relationships') {
    const wife = folderForDomain(folders, 'wife');
    const notes = (wife?.notes || []).slice(0, 4);
    body = (
      <div>
        <div className="pressable" onClick={() => { openExternal(googleCalendarUrl({ title: 'Date night ❤️', time: '19:00', durationMin: 120, details: 'Planned from JAM HQ' })); logEvent('map', 'date-night'); }}
          style={{ height: 46, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: 'rgba(255,138,76,0.12)', border: '1px solid rgba(255,138,76,0.45)', color: '#FF8A4C', fontWeight: 700, fontSize: 13 }}>
          <IconCalendar size={15} /> Plan date night
        </div>
        <div className="eyebrow" style={{ margin: '14px 0 8px' }}>Wife & I — shared notes</div>
        {notes.length ? notes.map((n) => (
          <div key={n.id} style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.45, padding: '7px 0', borderTop: '1px solid var(--line)' }}>{n.title}</div>
        )) : <div className="eyebrow" style={{ color: 'var(--dim)', lineHeight: 1.6 }}>Capture ideas, plans and moments — route them to Wife & I from the inbox.</div>}
      </div>
    );
  } else if (domainId === 'learning') {
    body = (
      <ListHub title="Learning Lab" accent={meta.color} placeholder="Book, course, skill, question…"
        doneLabel="LEARNED" emptyCopy="What are you studying? Books, courses, research rabbit holes — track the inputs that compound."
        {...listProps(learning, setLearning)} />
    );
  } else if (domainId === 'adventure') {
    body = (
      <ListHub title="Adventure Hub" accent={meta.color} placeholder="Trip, experience, challenge…"
        doneLabel="LIVED" emptyCopy="Your digital passport. Bucket-list trips, experiences to create, challenges to attempt — then mark them LIVED."
        {...listProps(adventure, setAdventure)} />
    );
  } else if (domainId === 'athlete') {
    const s = snapshot();
    let mastered = 0, total = 0;
    DISCIPLINES.forEach((x) => (s.skills[x.id] || []).forEach((sk) => { total += 1; if (sk.status === 'done') mastered += 1; }));
    body = (
      <div>
        <div style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.55 }}>
          {mastered} of {total} skills mastered across {DISCIPLINES.length} disciplines. The full Movement OS — identity meters, the pyramid, mastery roadmaps — lives in Move.
        </div>
        <GoBtn tab="perform" label="Open Movement OS" />
      </div>
    );
  } else if (domainId === 'business') {
    const s = snapshot();
    const st = s.ona.stats || {};
    body = (
      <div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div><div className="eyebrow">ONA Members</div><div className="display" style={{ fontSize: 26 }}>{st.members ?? '—'}</div></div>
          <div><div className="eyebrow">MRR</div><div className="display" style={{ fontSize: 26, color: 'var(--lime)' }}>${(st.mrr ?? 0).toLocaleString()}</div></div>
          <div><div className="eyebrow">Initiatives</div><div className="display" style={{ fontSize: 26, color: 'var(--gold)' }}>{(s.ona.initiatives || []).length}</div></div>
        </div>
        <GoBtn tab="build" label="Open Build · ONA + Podium" />
      </div>
    );
  } else if (domainId === 'creativity') {
    const s = snapshot();
    const brands = (s.content.brands || []).filter((b) => b.status !== 'Paused');
    body = (
      <div>
        {brands.length ? brands.map((b) => (
          <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderTop: '1px solid var(--line)' }}>
            <span style={{ flex: 1, fontSize: 13.5, color: 'var(--text)' }}>{b.name}</span>
            <div style={{ width: 90 }}><ProgressBar value={b.pct || 0} color={meta.color} height={3} /></div>
            <span className="mono" style={{ fontSize: 10, color: 'var(--muted)', width: 34, textAlign: 'right' }}>{b.pct || 0}%</span>
          </div>
        )) : <div className="eyebrow" style={{ color: 'var(--dim)' }}>No active brands tracked yet.</div>}
        <GoBtn tab="build" label="Open Creator Studio" />
      </div>
    );
  } else if (domainId === 'growth') {
    body = (
      <div>
        <div style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.55 }}>
          Reflection compounds. The journal and inbox live below the map; the weekly and monthly rituals live here.
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <div className="pressable" onClick={() => { onClose(); onOpenReview(); }} style={{ flex: 1, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'rgba(45,212,191,0.12)', border: '1px solid rgba(45,212,191,0.45)', color: 'var(--violet)', fontWeight: 700, fontSize: 12 }}><IconCompass size={14} /> WEEKLY REVIEW</div>
          <div className="pressable" onClick={() => { onClose(); onOpenUpgrade(); }} style={{ flex: 1, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.45)', color: 'var(--lime)', fontWeight: 700, fontSize: 12 }}><IconSparkles size={14} /> UPGRADE</div>
        </div>
      </div>
    );
  }

  return (
    <Sheet open={!!domainId} onClose={onClose} maxHeight="82%">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span style={{ fontSize: 24 }}>{meta.icon}</span>
        <div style={{ flex: 1 }}>
          <div className="eyebrow" style={{ color: meta.color }}>{d.signal}</div>
          <div className="display" style={{ fontSize: 24, marginTop: 1 }}>{meta.name.toUpperCase()}</div>
        </div>
        <span className="display" style={{ fontSize: 26, color: meta.color }}>{d.score}</span>
      </div>
      {body}
      <div style={{ height: 10 }} />
    </Sheet>
  );
}

// ─────────────────────────────────────────────────────────
// The screen — map on top, daily mind tools below.
// ─────────────────────────────────────────────────────────
export function LifeMapScreen({ captures, setCaptures, readiness, trend, history, becoming, onOpenReview, onOpenUpgrade, onGoTab }) {
  const [view, setView] = useState('inbox'); // inbox | journal
  const [journal, setJournal] = useSyncedState('lifeos:journal', []);
  const [folders, setFolders] = useSyncedState('lifeos:folders', SEED_FOLDERS);
  const [learning, setLearning] = useSyncedState('lifeos:learning', []);
  const [adventure, setAdventure] = useSyncedState('lifeos:adventure', []);
  const [draft, setDraft] = useState('');
  const [openDomain, setOpenDomain] = useState(null);
  const [menuDomain, setMenuDomain] = useState(null);
  const [timeLapseOpen, setTimeLapseOpen] = useState(false);
  const [identityOpen, setIdentityOpen] = useState(false);
  const [milestones] = useSyncedState('lifeos:milestones', {});

  const scores = useMemo(() => { try { return domainScores(); } catch { return {}; } }, [openDomain, learning, adventure]);
  const alignment = useMemo(() => { try { return alignmentScore(scores); } catch { return null; } }, [scores]);
  const lvl = useMemo(() => { try { return lifeLevel(); } catch { return null; } }, [scores]);
  const selfFacets = useMemo(() => LIFE_MAP_DOMAINS.map((d) => ({ id: d.id, score: scores[d.id]?.score ?? 0 })), [scores]);
  const [selfHistory] = useSyncedState('lifeos:self-history', {});
  const evolution = useMemo(() => Object.keys(selfHistory).sort().map((k) => selfHistory[k]?.becoming ?? 0).filter((v) => typeof v === 'number'), [selfHistory]);

  // Identity milestones — the catalog with current earned/progress, merged
  // with the date each was first crossed (from the synced record).
  const milestoneList = useMemo(() => {
    try {
      return evaluateMilestones({ scores, becoming }).map((m) => {
        // Identity unlocks are permanent: once earned (recorded), they stay
        // earned even if a live metric later dips below the threshold.
        const earnedAt = milestones[m.id]?.earnedAt;
        const done = m.done || !!earnedAt;
        return { ...m, done, progress: done ? 100 : m.progress, earnedAt };
      });
    } catch { return []; }
  }, [scores, becoming, milestones]);
  const earnedMilestones = milestoneList.filter((m) => m.done);
  const latestMilestone = [...earnedMilestones].sort((a, b) => (b.earnedAt || '').localeCompare(a.earnedAt || ''))[0];
  const nextMilestone = milestoneList.filter((m) => !m.done).sort((a, b) => b.progress - a.progress)[0];

  const inbox = (captures || []).filter((c) => (c.status || 'inbox') === 'inbox');
  const triaged = (captures || []).filter((c) => c.status === 'triaged');

  const route = (id, domain) => {
    const cap = (captures || []).find((c) => c.id === id);
    if (cap) {
      setFolders((list) => {
        const target = folderForDomain(list, domain);
        const note = { id: Date.now(), title: cap.text, body: '', fromCapture: true };
        if (target) return list.map((f) => (f === target ? { ...f, notes: [note, ...(f.notes || [])] } : f));
        const meta = LIFE_DOMAINS.find((x) => x.id === domain) || { name: domain, color: '#45B7E8', emoji: '📁' };
        return [...list, { id: Date.now() + 1, name: meta.name, domain, color: meta.color, emoji: meta.emoji, pinned: false, notes: [note], projects: [] }];
      });
    }
    setCaptures((list) => list.map((c) => (c.id === id ? { ...c, status: 'triaged', domain, routedAt: Date.now() } : c)));
    logEvent('map', 'route', domain);
  };
  const archive = (id) => { setCaptures((list) => list.map((c) => (c.id === id ? { ...c, status: 'archived' } : c))); logEvent('map', 'archive'); };
  const remove = (id) => { setCaptures((list) => list.filter((c) => c.id !== id)); logEvent('map', 'delete'); };
  const addJournal = () => {
    if (!draft.trim()) return;
    setJournal((j) => [{ id: Date.now(), text: draft.trim(), ts: Date.now() }, ...j].slice(0, 200));
    setDraft('');
    logEvent('map', 'journal');
  };

  return (
    <div className="screen-content" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <SectionHead eyebrow="A living map of who you're becoming" title="LIFE MAP" />

      {/* The Self at the heart, domains orbiting it — one unified hero */}
      <LifeMapViz scores={scores} facets={selfFacets} becoming={becoming?.score ?? 0} level={lvl?.level} trend={becoming?.trend}
        onPick={(id) => { setOpenDomain(id); logEvent('map', 'domain', id); }}
        onLongPick={(id) => setMenuDomain(id)} />

      {becoming && (
        <div style={{ textAlign: 'center', marginTop: -4 }}>
          <div style={{ fontSize: 12.5, color: 'var(--text-2)', padding: '0 16px', textWrap: 'pretty' }}>{becomingLine(becoming)}</div>
          {evolution.length >= 2 && (
            <div className="pressable" onClick={() => { setTimeLapseOpen(true); logEvent('map', 'timelapse'); }}
              style={{ width: '82%', margin: '12px auto 0', cursor: 'pointer' }}>
              <div className="mono" style={{ fontSize: 8, color: 'var(--dim)', letterSpacing: '0.14em', marginBottom: 5 }}>BECOMING · {evolution.length}-DAY EVOLUTION</div>
              <Sparkline data={evolution} width={240} height={26} color="#45B7E8" />
              <div className="eyebrow" style={{ color: 'var(--cyan)', marginTop: 6 }}>▶ tap to replay the time-lapse</div>
            </div>
          )}
        </div>
      )}

      {/* Identity — the milestones you've crossed becoming who you are */}
      {milestoneList.length > 0 && (
        <div className="hud glass pressable" onClick={() => { setIdentityOpen(true); logEvent('map', 'identity'); }}
          style={{ borderRadius: 18, padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="eyebrow" style={{ color: 'var(--cyan)' }}>Identity · who you've become</div>
            <span className="mono" style={{ fontSize: 10, color: 'var(--muted)' }}>{earnedMilestones.length}/{milestoneList.length}</span>
          </div>
          {latestMilestone ? (
            <div style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <IconCheck size={15} color={latestMilestone.accent} stroke={2.6} />
                <span className="display" style={{ fontSize: 17, color: 'var(--text)' }}>{latestMilestone.name}</span>
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.45, marginTop: 3 }}>{latestMilestone.statement}</div>
            </div>
          ) : (
            <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.45, marginTop: 8 }}>
              No identity milestones yet — the evidence is building. Tap to see what you're closest to becoming.
            </div>
          )}
          {nextMilestone && (
            <div style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span className="eyebrow" style={{ color: 'var(--dim)' }}>Next · {nextMilestone.name}</span>
                <span className="mono" style={{ fontSize: 9, color: 'var(--dim)' }}>{nextMilestone.progress}%</span>
              </div>
              <ProgressBar value={nextMilestone.progress} color={nextMilestone.accent} height={3} />
            </div>
          )}
        </div>
      )}

      {(() => {
        const dom = menuDomain ? LIFE_MAP_DOMAINS.find((d) => d.id === menuDomain) : null;
        if (!dom) return null;
        const score = scores[dom.id]?.score ?? 0;
        return (
          <ObjectMenu
            open={!!menuDomain}
            onClose={() => setMenuDomain(null)}
            title={dom.name}
            subtitle={`Life domain · ${score}/100`}
            accent={dom.color || 'var(--cyan)'}
            actions={domainActions({ ...dom, score }, () => { setOpenDomain(dom.id); setMenuDomain(null); logEvent('map', 'domain', dom.id); })}
          />
        );
      })()}

      {/* Balance — the same eight domains read as a single shape. A
          lopsided web shows instantly where life is out of balance. */}
      <div className="hud glass" style={{ borderRadius: 18, padding: '14px 10px 6px' }}>
        <div style={{ textAlign: 'center', marginBottom: 4 }}>
          <div className="eyebrow" style={{ color: 'var(--cyan)' }}>The shape of your life</div>
          <div className="section-title" style={{ fontSize: 18, marginTop: 1 }}>BALANCE</div>
        </div>
        <RadarChart
          axes={LIFE_MAP_DOMAINS.map((d) => ({ label: ({ relationships: 'BONDS', creativity: 'CREATE', adventure: 'EXPLORE', business: 'BIZ' }[d.id] || d.name.slice(0, 6).toUpperCase()), value: scores[d.id]?.score ?? 0 }))}
          size={240}
          color="#45B7E8"
        />
        <div className="eyebrow" style={{ textAlign: 'center', color: 'var(--dim)', marginTop: 2 }}>each point = that domain's live score · aim for a full, even web</div>
      </div>

      {/* View toggle — the daily mind tools */}
      <div style={{ display: 'flex', gap: 8 }}>
        {[{ id: 'inbox', label: 'Inbox', Icon: IconInbox, n: inbox.length }, { id: 'journal', label: 'Journal', Icon: IconBook }].map((v) => {
          const on = view === v.id;
          return (
            <div key={v.id} className="pressable" onClick={() => setView(v.id)} style={{
              flex: 1, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              background: on ? 'rgba(69,183,232,0.14)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${on ? 'rgba(69,183,232,0.5)' : 'var(--line)'}`, color: on ? 'var(--cyan)' : 'var(--muted)',
              fontSize: 13, fontWeight: 700, letterSpacing: '0.04em',
            }}>
              <v.Icon size={17} /> {v.label}{v.n ? <span className="mono" style={{ fontSize: 11, opacity: 0.8 }}>· {v.n}</span> : null}
            </div>
          );
        })}
      </div>

      {view === 'inbox' && (
        <div>
          {inbox.length === 0 ? (
            <div className="hud glass" style={{ padding: '24px 18px', borderRadius: 16, textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8, color: 'var(--lime)' }}><IconCheck size={26} stroke={2.2} /></div>
              <div className="display" style={{ fontSize: 17, color: 'var(--lime)' }}>INBOX ZERO</div>
            </div>
          ) : (
            <>
              <div className="eyebrow" style={{ marginBottom: 10 }}>{inbox.length} to triage — route each to where it belongs</div>
              {inbox.map((c) => {
                const tagColor = c.color || TAG_COLORS[c.tag] || '#45B7E8';
                return (
                  <div key={c.id} className="hud glass" style={{ padding: 14, borderRadius: 16, marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 999, background: tagColor, marginTop: 6 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.4 }}>{c.text}</div>
                        <div className="mono" style={{ fontSize: 9, color: 'var(--dim)', letterSpacing: '0.1em', marginTop: 5 }}>{(c.tag || 'idea').toUpperCase()} · {fmtDay(c.ts || c.id)}</div>
                      </div>
                      <div className="pressable" onClick={() => remove(c.id)} style={{ color: 'var(--dim)', padding: 2 }}><IconTrash size={16} /></div>
                    </div>
                    <RouteRow c={c} onRoute={(dom) => route(c.id, dom)} onArchive={() => archive(c.id)} />
                  </div>
                );
              })}
            </>
          )}
          {triaged.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Recently routed</div>
              {triaged.slice(0, 6).map((c) => {
                const dd = LIFE_DOMAINS.find((x) => x.id === c.domain);
                return (
                  <div key={c.id} className="hud glass" style={{ padding: '9px 13px', borderRadius: 12, marginBottom: 7, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 13 }}>{dd?.emoji || '•'}</span>
                    <div style={{ flex: 1, fontSize: 13, color: 'var(--muted)' }}>{c.text}</div>
                    <span className="mono" style={{ fontSize: 9, color: dd?.color || 'var(--dim)' }}>{dd?.name || c.domain}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {view === 'journal' && (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') addJournal(); }} placeholder="A thought, a reflection, a win…"
              style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', borderRadius: 12, padding: '12px 14px', color: 'var(--text)', fontSize: 14, outline: 'none', fontFamily: 'var(--font-body)' }} />
            <div className="pressable" onClick={addJournal} style={{ width: 48, borderRadius: 12, background: 'linear-gradient(135deg, #45B7E8, #2DD4BF)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A0B0D' }}><IconPlus size={20} stroke={2.4} /></div>
          </div>
          {journal.length === 0 ? (
            <div className="eyebrow" style={{ textAlign: 'center', opacity: 0.7, padding: '16px 0' }}>nothing yet — write your first line above</div>
          ) : journal.slice(0, 30).map((e) => (
            <div key={e.id} className="hud glass" style={{ padding: 13, borderRadius: 14, marginBottom: 9 }}>
              <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.5 }}>{e.text}</div>
              <div className="mono" style={{ fontSize: 9, color: 'var(--dim)', letterSpacing: '0.1em', marginTop: 5 }}>{fmtDay(e.ts)}</div>
            </div>
          ))}
        </div>
      )}

      <DomainSheet
        domainId={openDomain}
        onClose={() => setOpenDomain(null)}
        ctx={{ scores, readiness, trend, history, folders, onGoTab, onOpenReview, onOpenUpgrade, learning, setLearning, adventure, setAdventure }}
      />

      <BecomingTimeLapse
        open={timeLapseOpen}
        onClose={() => setTimeLapseOpen(false)}
        selfHistory={selfHistory}
        liveFacets={selfFacets}
        liveBecoming={becoming?.score ?? 0}
        liveLevel={lvl?.level}
        liveTrend={becoming?.trend}
      />

      <IdentitySheet open={identityOpen} onClose={() => setIdentityOpen(false)} list={milestoneList} earnedCount={earnedMilestones.length} />

      <div style={{ height: 80 }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Identity sheet — the full milestone catalog: earned (dated) + the
// ones you're still becoming (with how close you are).
// ─────────────────────────────────────────────────────────
function fmtMilestoneDate(key) {
  if (!key) return '';
  const [y, m, d] = key.split('-').map(Number);
  if (!y) return '';
  return new Date(y, (m || 1) - 1, d || 1).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function IdentitySheet({ open, onClose, list, earnedCount }) {
  if (!open) return null;
  const earned = list.filter((m) => m.done);
  const locked = list.filter((m) => !m.done).sort((a, b) => b.progress - a.progress);
  return (
    <Sheet open={open} onClose={onClose} maxHeight="86%">
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <div className="eyebrow" style={{ color: 'var(--cyan)' }}>IDENTITY · WHO YOU'VE BECOME</div>
        <div className="display" style={{ fontSize: 24, marginTop: 3 }}>{earnedCount} OF {list.length} UNLOCKED</div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>Earned from real evidence — never self-reported.</div>
      </div>

      {earned.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          {earned.map((m) => (
            <div key={m.id} className="hud glass" style={{ borderRadius: 14, padding: 13, marginBottom: 9, borderLeft: `2px solid ${m.accent}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <IconCheck size={16} color={m.accent} stroke={2.6} />
                <span className="display" style={{ fontSize: 17, color: 'var(--text)', flex: 1 }}>{m.name}</span>
                {m.earnedAt && <span className="mono" style={{ fontSize: 9, color: 'var(--dim)', letterSpacing: '0.1em' }}>{fmtMilestoneDate(m.earnedAt)}</span>}
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.45, marginTop: 4 }}>{m.statement}</div>
            </div>
          ))}
        </div>
      )}

      {locked.length > 0 && (
        <div>
          <div className="eyebrow" style={{ color: 'var(--dim)', marginBottom: 8 }}>Still becoming</div>
          {locked.map((m) => (
            <div key={m.id} className="hud glass-canvas" style={{ borderRadius: 14, padding: 13, marginBottom: 9, opacity: 0.92 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text-2)' }}>{m.name}</span>
                <span className="mono" style={{ fontSize: 9, color: 'var(--dim)' }}>{m.progress}%</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--dim)', lineHeight: 1.4, margin: '4px 0 9px' }}>{m.hint}</div>
              <ProgressBar value={m.progress} color={m.accent} height={3} />
            </div>
          ))}
        </div>
      )}
      <div style={{ height: 80 }} />
    </Sheet>
  );
}

// Inline routing row for inbox cards.
function RouteRow({ c, onRoute, onArchive }) {
  const [routing, setRouting] = useState(false);
  if (routing) {
    return (
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
        {[...LIFE_DOMAINS].sort((a, b) => (b.id === c.tag ? 1 : 0) - (a.id === c.tag ? 1 : 0)).map((d) => {
          const suggested = d.id === c.tag;
          return (
            <div key={d.id} className="pressable" onClick={() => onRoute(d.id)} style={{
              padding: '7px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
              background: `${d.color}${suggested ? '2e' : '1a'}`, border: `1px solid ${d.color}${suggested ? 'cc' : '66'}`, color: d.color,
            }}>{suggested ? '★ ' : ''}{d.emoji} {d.name}</div>
          );
        })}
        <div className="pressable" onClick={() => setRouting(false)} style={{ padding: '7px 10px', borderRadius: 999, color: 'var(--muted)', border: '1px solid var(--line)', fontSize: 11 }}>cancel</div>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
      <div className="pressable" onClick={() => setRouting(true)} style={{
        flex: 1, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        background: 'rgba(69,183,232,0.12)', border: '1px solid rgba(69,183,232,0.4)', color: 'var(--cyan)',
        fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
      }}><IconChevronRight size={14} /> Route</div>
      <div className="pressable" onClick={onArchive} style={{
        width: 44, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', color: 'var(--muted)',
      }}><IconArchive size={16} /></div>
    </div>
  );
}
