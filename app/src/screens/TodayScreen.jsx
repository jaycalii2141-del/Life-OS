// ─────────────────────────────────────────────────────────
// LifeOS V2 — TODAY. The operating system's front door.
//
// Hierarchy is strict:
//   L1 · Today's Mission — what matters, what's next, progress.
//   L2 · Check-in (readiness) + Momentum (streak).
//   L3 · Intelligence brief + timeline — collapsed until wanted.
// Opening the app answers, in one glance: what matters most,
// what to do next, what can wait, and how the campaign is going.
// ─────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { ProgressBar, StateMeter, ConfettiBurst, TimelineEvent, Pill, RadialGauge, Sparkline } from '../components/atoms.jsx';
import { IconCheck, IconSparkles, IconChevronDown, IconChevronRight, IconCalendar, IconClose, IconPlus, IconSliders, IconMic } from '../components/icons.jsx';
import { ChiefBrief } from '../ChiefBrief.jsx';
import { celebrate } from '../lib/haptics.js';
import { estimateLabel } from '../lib/mission.js';
import { SEED_QUESTS, questProgress, nextMilestone, alignmentScore, recentWins, LIFE_MAP_DOMAINS } from '../lib/quests.js';
import { GoalDecomposer } from '../GoalDecomposer.jsx';
import { useSyncedState } from '../useSyncedState.js';
import { TIMELINE } from '../data.js';

function realDateLabel() {
  const d = new Date();
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}
function greetingLabel() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning, Jay' : h < 18 ? 'Good afternoon, Jay' : 'Good evening, Jay';
}

const KIND_COLORS = { focus: '#FF6B5B', train: '#34D399', build: '#E9C46A', ritual: '#45B7E8' };

// ─────────────────────────────────────────────────────────
// L1 — Today's Mission
// ─────────────────────────────────────────────────────────
function MissionCard({ missions, doneIds, onToggle, onRegenerate, readiness, streak, onGo, oneThing, onSetOneThing, alignment, adaptedAt }) {
  const [party, setParty] = useState(0);
  const [editingFocus, setEditingFocus] = useState(false);
  const [draft, setDraft] = useState('');

  // Flash a brief "re-planned" badge when the engine adapts to readiness.
  const [adaptedFlash, setAdaptedFlash] = useState(false);
  useEffect(() => {
    if (!adaptedAt) return;
    if (Date.now() - adaptedAt > 8000) return;
    setAdaptedFlash(true);
    const t = setTimeout(() => setAdaptedFlash(false), 6000);
    return () => clearTimeout(t);
  }, [adaptedAt]);

  const total = missions.length;
  const done = missions.filter((m) => doneIds.includes(m.id)).length;
  const allDone = total > 0 && done === total;
  const next = missions.find((m) => !doneIds.includes(m.id));

  const toggle = (m) => {
    const isDone = doneIds.includes(m.id);
    if (!isDone) {
      celebrate();
      if (done + 1 === total) setParty((p) => p + 1);
    }
    onToggle(m.id);
  };

  return (
    <div className="hud glass-strong mesh-readiness" style={{ padding: '18px 16px 16px', borderRadius: 22, position: 'relative', overflow: 'visible' }}>
      <ConfettiBurst trigger={party} />

      {/* header — greeting + the cockpit's one number (alignment) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <span className="eyebrow">{realDateLabel()}</span>
          <div style={{ fontSize: 18, fontWeight: 650, letterSpacing: '-0.01em', marginTop: 3 }}>{greetingLabel()}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 8 }}>
            {readiness != null && (
              <span className="mono" style={{ fontSize: 10, color: readiness >= 75 ? 'var(--lime)' : readiness >= 50 ? 'var(--gold)' : 'var(--ona-red)', letterSpacing: '0.1em' }}>READY {readiness}</span>
            )}
            {streak > 0 && <span className="mono" style={{ fontSize: 10, color: 'var(--gold)', letterSpacing: '0.08em' }}>🔥 {streak} DAY</span>}
          </div>
        </div>
        {alignment != null && (
          <div style={{ flexShrink: 0 }}>
            <RadialGauge value={alignment} size={80} stroke={7} color="#45B7E8" label="ALIGN" />
          </div>
        )}
      </div>

      {/* progress line */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="eyebrow" style={{ color: 'var(--cyan)' }}>Today's mission</span>
          {adaptedFlash && (
            <span className="mono" style={{ fontSize: 8, color: 'var(--gold)', letterSpacing: '0.1em', padding: '2px 6px', borderRadius: 999, background: 'rgba(233,196,106,0.14)', border: '1px solid rgba(233,196,106,0.4)', animation: 'screenFade 300ms ease' }}>⟳ RE-PLANNED FOR READINESS</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="mono" style={{ fontSize: 10, color: 'var(--muted)' }}>
            {done}/{total} · {estimateLabel(missions, doneIds)}
          </span>
          <div className="pressable" onClick={onRegenerate} title="Re-plan"
            style={{ width: 26, height: 26, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--violet)', background: 'rgba(45,212,191,0.1)' }}>
            <IconSparkles size={14} />
          </div>
        </div>
      </div>
      <ProgressBar value={total ? (done / total) * 100 : 0} color={allDone ? 'var(--lime)' : 'var(--cyan)'} height={4} />

      {/* mission list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
        {missions.map((m) => {
          const isDone = doneIds.includes(m.id);
          const isNext = next && next.id === m.id;
          const c = KIND_COLORS[m.kind] || 'var(--cyan)';
          return (
            <div key={m.id} style={{
              padding: '10px 12px', borderRadius: 14,
              background: isNext ? 'rgba(69,183,232,0.07)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${isNext ? 'rgba(69,183,232,0.45)' : 'var(--line)'}`,
              opacity: isDone ? 0.5 : 1, transition: 'all 200ms',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
                <div className="pressable" onClick={() => toggle(m)} style={{
                  width: 24, height: 24, borderRadius: 8, flexShrink: 0, marginTop: 1,
                  border: `1.5px solid ${isDone ? 'var(--lime)' : c}`,
                  background: isDone ? 'var(--lime)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {isDone && <IconCheck size={14} color="#0A0B0D" stroke={3} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }} className="pressable" onClick={() => onGo(m)}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3, textDecoration: isDone ? 'line-through' : 'none', textWrap: 'pretty' }}>
                      {m.icon} {m.title}
                    </span>
                  </div>
                  {!isDone && (
                    <div style={{ fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.4, marginTop: 3 }}>{m.why}</div>
                  )}
                  {isNext && (
                    <div className="mono" style={{ fontSize: 9, color: 'var(--cyan)', letterSpacing: '0.16em', marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
                      NEXT UP · ~{m.est}M <IconChevronRight size={11} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {allDone && (
          <div style={{ textAlign: 'center', padding: '10px 0 4px' }}>
            <div className="display" style={{ fontSize: 22, color: 'var(--lime)' }}>MISSION COMPLETE</div>
            <div className="eyebrow" style={{ marginTop: 4 }}>day {streak} of the streak · rest easy</div>
          </div>
        )}
      </div>

      {/* one-thing setter (only when unset) */}
      {!oneThing && !allDone && (
        editingFocus ? (
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && draft.trim()) { onSetOneThing(draft.trim()); setEditingFocus(false); } }}
              placeholder="The one win that makes today a success…"
              style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,107,91,0.4)', borderRadius: 12, padding: '10px 12px', color: 'var(--text)', fontSize: 14, outline: 'none', fontFamily: 'var(--font-body)' }} />
            <div className="pressable" onClick={() => { if (draft.trim()) { onSetOneThing(draft.trim()); } setEditingFocus(false); }}
              style={{ width: 44, borderRadius: 12, background: 'linear-gradient(135deg, #FF6B5B, #2DD4BF)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <IconCheck size={16} stroke={2.4} />
            </div>
          </div>
        ) : (
          <div className="pressable" onClick={() => setEditingFocus(true)} style={{
            marginTop: 12, padding: '10px 12px', borderRadius: 12, textAlign: 'center',
            border: '1px dashed rgba(255,107,91,0.45)', color: 'var(--ona-red)',
            fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', fontWeight: 700,
          }}>+ SET YOUR ONE THING</div>
        )
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// MISSIONS — the long campaigns (quest system). Each breaks into
// milestones; checking one off is a real win, not a task tick.
// ─────────────────────────────────────────────────────────
function MissionsCard({ quests, onToggleMilestone, onNewGoal }) {
  const [openId, setOpenId] = useState(null);
  const active = quests.filter((q) => questProgress(q) < 100);

  return (
    <div className="hud glass" style={{ padding: '13px 14px', borderRadius: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span className="eyebrow" style={{ color: 'var(--gold)' }}>Missions</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="mono" style={{ fontSize: 9, color: 'var(--dim)' }}>{active.length} CAMPAIGNS</span>
          <div className="pressable" onClick={onNewGoal} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 9px', borderRadius: 999, background: 'rgba(69,183,232,0.12)', border: '1px solid rgba(69,183,232,0.4)', color: 'var(--cyan)', fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.06em' }}>
            <IconSparkles size={11} /> NEW GOAL
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {active.map((q) => {
          const pct = questProgress(q);
          const next = nextMilestone(q);
          const open = openId === q.id;
          return (
            <div key={q.id} style={{ padding: '10px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: `1px solid ${open ? 'var(--line-strong)' : 'var(--line)'}` }}>
              <div className="pressable" onClick={() => setOpenId(open ? null : q.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <span style={{ fontSize: 15, flexShrink: 0 }}>{q.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 650, color: 'var(--text)', lineHeight: 1.25, textWrap: 'pretty' }}>{q.title}</div>
                    {!open && next && (
                      <div className="mono" style={{ fontSize: 9, color: 'var(--cyan)', letterSpacing: '0.06em', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        ▸ {next.text.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="display" style={{ fontSize: 16, color: pct >= 60 ? 'var(--lime)' : 'var(--cyan)', flexShrink: 0 }}>{pct}%</span>
                </div>
                <div style={{ marginTop: 8 }}><ProgressBar value={pct} color={pct >= 60 ? 'var(--lime)' : 'var(--cyan)'} height={3} /></div>
              </div>
              {open && (
                <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {q.why && <div style={{ fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.4 }}>{q.why}</div>}
                  {(q.milestones || []).map((m) => (
                    <div key={m.id} className="pressable" onClick={() => { onToggleMilestone(q.id, m.id); if (!m.done) celebrate(); }}
                      style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '4px 0' }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: 6, flexShrink: 0,
                        border: `1.5px solid ${m.done ? 'var(--lime)' : 'var(--line-strong)'}`,
                        background: m.done ? 'var(--lime)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {m.done && <IconCheck size={11} color="#0A0B0D" stroke={3} />}
                      </div>
                      <span style={{ fontSize: 12.5, color: m.done ? 'var(--dim)' : 'var(--text)', textDecoration: m.done ? 'line-through' : 'none', lineHeight: 1.3 }}>{m.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Recent wins — momentum is fuel. Surface it.
// ─────────────────────────────────────────────────────────
function WinsStrip({ wins }) {
  if (!wins.length) return null;
  return (
    <div className="hud glass" style={{ padding: '12px 14px', borderRadius: 16, border: '1px solid rgba(52,211,153,0.2)' }}>
      <span className="eyebrow" style={{ color: 'var(--lime)' }}>Recent wins</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
        {wins.map((w, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13 }}>{w.icon}</span>
            <span style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.3 }}>{w.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Ask bar — the door to the Intelligence, always one tap away.
// ─────────────────────────────────────────────────────────
function AskBar({ onOpen }) {
  return (
    <div className="pressable hud glass" onClick={() => onOpen(false)} style={{
      padding: '13px 14px', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 10,
      border: '1px solid rgba(45,212,191,0.3)',
    }}>
      <div style={{ width: 28, height: 28, borderRadius: 9, background: 'linear-gradient(135deg, #2DD4BF, #45B7E8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A0B0D', flexShrink: 0 }}>
        <IconSparkles size={15} />
      </div>
      <span style={{ flex: 1, fontSize: 13.5, color: 'var(--muted)' }}>Ask your AI anything…</span>
      <div className="pressable" onClick={(e) => { e.stopPropagation(); onOpen(true); }} style={{
        width: 34, height: 34, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(255,107,91,0.1)', border: '1px solid rgba(255,107,91,0.35)', color: 'var(--ona-red)',
      }}>
        <IconMic size={17} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// L2 — Check-in (sets readiness, which re-plans the mission)
// ─────────────────────────────────────────────────────────
function CheckInCard({ state, onMeter, readiness, trend, onOpenSettings }) {
  const [open, setOpen] = useState(!state.checkedIn);
  return (
    <div className="hud glass" style={{ padding: '13px 14px', borderRadius: 16 }}>
      <div className="pressable" onClick={() => setOpen((o) => !o)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span className="eyebrow">Check-in</span>
          <span className="display" style={{ fontSize: 20, color: readiness >= 75 ? 'var(--lime)' : readiness >= 50 ? 'var(--gold)' : 'var(--ona-red)' }}>{readiness}</span>
          <span className="mono" style={{ fontSize: 9, color: 'var(--dim)', letterSpacing: '0.1em' }}>
            {trend == null ? 'BASELINE' : `${trend >= 0 ? '▲+' : '▼'}${trend} VS 7D`}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div className="pressable" onClick={(e) => { e.stopPropagation(); onOpenSettings(); }}
            style={{ width: 26, height: 26, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', color: 'var(--muted)' }}>
            <IconSliders size={13} />
          </div>
          <IconChevronDown size={15} color="var(--muted)" style={{ transform: open ? 'none' : 'rotate(-90deg)', transition: 'transform 200ms' }} />
        </div>
      </div>
      {open && (
        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          <StateMeter label="Energy" value={state.energy} color="#45B7E8" onChange={(v) => onMeter('energy', v)} />
          <StateMeter label="Focus" value={state.focus} color="#2DD4BF" onChange={(v) => onMeter('focus', v)} />
          <StateMeter label="Body" value={state.body} color="#34D399" onChange={(v) => onMeter('body', v)} />
          <StateMeter label="Mood" value={state.mood} color="#E9C46A" onChange={(v) => onMeter('mood', v)} />
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// L2 — Momentum (14-day heatmap + streak)
// ─────────────────────────────────────────────────────────
function MomentumStrip({ momentum = [], streak = 0 }) {
  return (
    <div className="hud glass" style={{ padding: '13px 14px', borderRadius: 16 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 9 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
          <span className="eyebrow">Momentum</span>
          <span className="display" style={{ fontSize: 20, color: 'var(--gold)' }}>{streak}</span>
          <span className="mono" style={{ fontSize: 9, color: 'var(--muted)' }}>DAY STREAK</span>
        </div>
        <span className="mono" style={{ fontSize: 9, color: 'var(--dim)' }}>14D</span>
      </div>
      {momentum.length > 1 && (
        <div style={{ marginBottom: 9, opacity: 0.9 }}>
          <Sparkline data={momentum} width={304} height={28} color="#E9C46A" />
        </div>
      )}
      <div style={{ display: 'flex', gap: 4 }}>
        {momentum.map((v, i) => {
          const isToday = i === momentum.length - 1;
          const color = v === 0 ? '#5A5A66' : v === 1 ? '#1E6F9F' : v === 2 ? '#45B7E8' : v === 3 ? '#E9C46A' : '#34D399';
          return (
            <div key={i} style={{
              flex: 1, height: 24, borderRadius: 5, background: color,
              opacity: v === 0 ? 0.12 : 0.3 + (v / 4) * 0.7,
              border: isToday ? '1.5px solid rgba(255,255,255,0.8)' : 'none',
            }} />
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// L3 — Later today (timeline, collapsed by default)
// ─────────────────────────────────────────────────────────
const TL_CATEGORIES = [
  { kind: 'Body', color: '#45B7E8' }, { kind: 'Create', color: '#FF8A4C' },
  { kind: 'Train', color: '#F4A261' }, { kind: 'ONA', color: '#34D399' },
  { kind: 'Acro', color: '#2DD4BF' }, { kind: 'Focus', color: '#FF6B5B' },
];

function TimelineCard({ events, calendarEvents = [], onAdd, onDelete, onOpenCalendar }) {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [time, setTime] = useState('');
  const [label, setLabel] = useState('');
  const [cat, setCat] = useState(0);

  const calItems = calendarEvents.map((e) => ({ time: e.time, label: e.label, color: '#45B7E8', kind: 'CAL', cal: true }));
  const manualItems = events.map((e, i) => ({ ...e, cal: false, _idx: i }));
  const sortKey = (t) => (t === 'all-day' ? '00:00' : t);
  const combined = [...calItems, ...manualItems].sort((a, b) => sortKey(a.time).localeCompare(sortKey(b.time)));

  const submit = () => {
    if (!label.trim()) return;
    const c = TL_CATEGORIES[cat];
    onAdd({ time: time.trim() || '12:00', label: label.trim(), kind: c.kind, color: c.color });
    setTime(''); setLabel(''); setCat(0); setAdding(false);
  };

  return (
    <div className="hud glass" style={{ padding: '13px 14px', borderRadius: 16 }}>
      <div className="pressable" onClick={() => setOpen((o) => !o)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span className="eyebrow">Later today</span>
          <span className="mono" style={{ fontSize: 10, color: 'var(--muted)' }}>{combined.length} BLOCKS{calItems.length ? ' · SYNCED' : ''}</span>
        </div>
        <IconChevronDown size={15} color="var(--muted)" style={{ transform: open ? 'none' : 'rotate(-90deg)', transition: 'transform 200ms' }} />
      </div>

      {open && (
        <div style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            <div className="pressable" onClick={onOpenCalendar} style={{
              flex: 1, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', color: 'var(--muted)', fontSize: 11, fontWeight: 600,
            }}><IconCalendar size={14} /> Calendar</div>
            <div className="pressable" onClick={() => setAdding((a) => !a)} style={{
              flex: 1, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              background: adding ? 'rgba(255,255,255,0.05)' : 'rgba(69,183,232,0.1)',
              border: `1px solid ${adding ? 'var(--line-strong)' : 'rgba(69,183,232,0.35)'}`,
              color: adding ? 'var(--muted)' : 'var(--cyan)', fontSize: 11, fontWeight: 600,
            }}>{adding ? <IconClose size={13} /> : <IconPlus size={14} />} Block</div>
          </div>

          {adding && (
            <div style={{ marginBottom: 12, padding: 10, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input value={time} onChange={(e) => setTime(e.target.value)} placeholder="06:30"
                  style={{ width: 64, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', borderRadius: 10, padding: '8px 9px', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: 12, outline: 'none' }} />
                <input value={label} onChange={(e) => setLabel(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} placeholder="What's happening?"
                  style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', borderRadius: 10, padding: '8px 10px', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'var(--font-body)' }} />
              </div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 }}>
                {TL_CATEGORIES.map((c, i) => (
                  <div key={c.kind} className="pressable" onClick={() => setCat(i)} style={{
                    padding: '4px 8px', borderRadius: 999, fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                    background: cat === i ? `${c.color}20` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${cat === i ? c.color + '90' : 'var(--line)'}`, color: cat === i ? c.color : 'var(--muted)',
                  }}>{c.kind}</div>
                ))}
              </div>
              <div className="pressable" onClick={submit} style={{ height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #45B7E8, #2DD4BF)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#0A0B0D', fontWeight: 700, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                <IconPlus size={14} stroke={2.4} /> Add
              </div>
            </div>
          )}

          {combined.length === 0 && (
            <div className="eyebrow" style={{ color: 'var(--dim)', padding: '6px 0' }}>Nothing scheduled — your time is yours to direct.</div>
          )}
          {combined.map((e, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <TimelineEvent time={e.time} label={e.label} color={e.color} kind={e.kind} last={i === combined.length - 1} />
              </div>
              {!e.cal && (
                <div className="pressable" onClick={() => onDelete(e._idx)} style={{
                  width: 22, height: 22, borderRadius: 7, flexShrink: 0, marginTop: 2,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--dim)',
                }}><IconClose size={12} /></div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// The screen
// ─────────────────────────────────────────────────────────
export function TodayScreen({
  state, setState, missions, doneIds, adaptedAt, onToggleMission, onRegenerate,
  momentum, streak, trend, icalUrl,
  onOpenSettings, onOpenCalendar, onOpenCompanion, onGoTab,
}) {
  const setMeter = (k, v) => setState((s) => ({ ...s, [k]: v, checkedIn: true }));
  const readiness = Math.round(((state.energy + state.focus + state.body + state.mood) / 40) * 100);

  // Quest system — the long campaigns behind the daily mission.
  const [quests, setQuests] = useSyncedState('lifeos:quests', SEED_QUESTS);
  const toggleMilestone = (qid, mid) => setQuests((list) => list.map((q) => (
    q.id !== qid ? q : {
      ...q,
      milestones: (q.milestones || []).map((m) => (m.id === mid ? { ...m, done: !m.done, doneAt: !m.done ? Date.now() : undefined } : m)),
    }
  )));

  // Goal decomposition — name a goal, AI breaks it into a campaign.
  const [goalOpen, setGoalOpen] = useState(false);
  const addQuest = (q) => setQuests((list) => [q, ...list]);

  // Life Alignment + wins — computed fresh each open (cheap, local).
  const [alignment, setAlignment] = useState(null);
  const [wins, setWins] = useState([]);
  useEffect(() => {
    try { setAlignment(alignmentScore()); setWins(recentWins()); } catch { /* first run */ }
  }, [doneIds, quests]);

  // Real calendar events for today (read-only).
  const [calendarEvents, setCalendarEvents] = useState([]);
  useEffect(() => {
    if (!icalUrl) { setCalendarEvents([]); return; }
    let active = true;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const n = new Date();
    const date = `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
    fetch(`/api/calendar?url=${encodeURIComponent(icalUrl)}&tz=${encodeURIComponent(tz)}&date=${date}`)
      .then((r) => (r.ok ? r.json() : { events: [] }))
      .then((d) => { if (active) setCalendarEvents(d.events || []); })
      .catch(() => { if (active) setCalendarEvents([]); });
    return () => { active = false; };
  }, [icalUrl]);

  const events = state.timeline ?? TIMELINE;
  const addEvent = (ev) => setState((s) => ({ ...s, timeline: [...(s.timeline ?? TIMELINE), ev].sort((a, b) => a.time.localeCompare(b.time)) }));
  const deleteEvent = (idx) => setState((s) => ({ ...s, timeline: (s.timeline ?? TIMELINE).filter((_, i) => i !== idx) }));

  const goMission = (m) => {
    if (m.kind === 'focus') return; // the One Thing lives here
    onGoTab?.(m.go);
  };

  return (
    <div className="screen-content" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <MissionCard
        missions={missions}
        doneIds={doneIds}
        onToggle={onToggleMission}
        onRegenerate={onRegenerate}
        readiness={readiness}
        streak={streak}
        onGo={goMission}
        oneThing={state.oneThing}
        onSetOneThing={(txt) => setState((s) => ({ ...s, oneThing: txt }))}
        alignment={alignment}
        adaptedAt={adaptedAt}
      />

      <AskBar onOpen={onOpenCompanion} />

      <MissionsCard quests={quests} onToggleMilestone={toggleMilestone} onNewGoal={() => setGoalOpen(true)} />

      <GoalDecomposer open={goalOpen} onClose={() => setGoalOpen(false)} onAddQuest={addQuest} />

      <CheckInCard state={state} onMeter={setMeter} readiness={readiness} trend={trend} onOpenSettings={onOpenSettings} />

      <MomentumStrip momentum={momentum} streak={streak} />

      <WinsStrip wins={wins} />

      <ChiefBrief
        readiness={readiness}
        oneThing={state.oneThing}
        calendarEvents={calendarEvents}
        onAddEvent={addEvent}
        onGoMind={() => onGoTab?.('life')}
        defaultOpen={true}
      />

      <TimelineCard events={events} calendarEvents={calendarEvents} onAdd={addEvent} onDelete={deleteEvent} onOpenCalendar={onOpenCalendar} />
    </div>
  );
}
