import { useState, useEffect, useRef } from 'react';
import { HUDTicks, TickCounter, Pill, ConfettiBurst, StateMeter, TimelineEvent } from '../components/atoms.jsx';
import { IconCheck, IconCalendar, IconClose, IconPlus, IconSliders } from '../components/icons.jsx';
import { TODAY, TIMELINE, MOMENTUM } from '../data.js';

// ─────────────────────────────────────────────────────────
// SCREEN 1 — Mission Control
// ─────────────────────────────────────────────────────────

// Live date + time-of-day greeting
function realDateLabel() {
  const d = new Date();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const mons = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[d.getDay()]} · ${mons[d.getMonth()]} ${d.getDate()}`;
}
function greetingLabel() {
  const h = new Date().getHours();
  const part = h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening';
  return `Good ${part}, Jay`;
}

// Categories for timeline blocks (kind label + dot color)
const TL_CATEGORIES = [
  { kind: 'Body',   color: '#00D4FF' },
  { kind: 'Create', color: '#FF3CC8' },
  { kind: 'Train',  color: '#FF8A3C' },
  { kind: 'ONA',    color: '#B6FF3C' },
  { kind: 'Acro',   color: '#B14CFF' },
  { kind: 'Focus',  color: '#FF0033' },
];

function ReadinessHero({ readiness, trend, energy, focus, body, mood, onMeter, onOpenSettings }) {
  return (
    <div className="hud glass-strong mesh-readiness" style={{
      padding: '18px 18px 16px',
      borderRadius: 22,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <HUDTicks />

      {/* date + greeting */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 4,
      }}>
        <span className="eyebrow">{realDateLabel()}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="mono" style={{
            fontSize: 9, color: 'var(--cyan)',
            padding: '3px 8px',
            border: '1px solid rgba(0,212,255,0.3)',
            borderRadius: 999,
            letterSpacing: '0.18em',
          }}>SYS · ONLINE</span>
          <div
            className="pressable"
            onClick={onOpenSettings}
            style={{
              width: 28, height: 28, borderRadius: 999,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.06)', border: '1px solid var(--line)',
              color: 'var(--muted)',
            }}
          >
            <IconSliders size={15} />
          </div>
        </div>
      </div>

      <div style={{
        fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em',
        marginTop: 2, marginBottom: 14,
      }}>{greetingLabel()}</div>

      {/* big readiness number + ring */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18,
      }}>
        <ReadinessRing value={readiness} />
        <div style={{ flex: 1 }}>
          <div className="eyebrow" style={{ marginBottom: 4 }}>Readiness · 0–100</div>
          <div className="display" style={{
            fontSize: 64, lineHeight: 0.85, color: 'var(--text)',
            textShadow: '0 0 30px rgba(0,212,255,0.25)',
          }}>
            <TickCounter value={readiness} format={(v) => Math.round(v)} />
          </div>
          <div className="mono" style={{
            fontSize: 10, marginTop: 6, letterSpacing: '0.1em',
            color: trend == null ? 'var(--muted)' : trend >= 0 ? 'var(--lime)' : 'var(--ona-red)',
          }}>
            {trend == null
              ? 'building your baseline…'
              : `${trend >= 0 ? '▲ +' : '▼ '}${trend} vs 7-day avg`}
          </div>
        </div>
      </div>

      {/* 4 state meters */}
      <div style={{ display: 'flex', gap: 10 }}>
        <StateMeter label="Energy" value={energy} color="#00D4FF" onChange={(v) => onMeter('energy', v)} />
        <StateMeter label="Focus"  value={focus}  color="#B14CFF" onChange={(v) => onMeter('focus', v)}  />
        <StateMeter label="Body"   value={body}   color="#B6FF3C" onChange={(v) => onMeter('body', v)}   />
        <StateMeter label="Mood"   value={mood}   color="#FFD23C" onChange={(v) => onMeter('mood', v)}   />
      </div>

      <div className="eyebrow" style={{ marginTop: 8, color: 'var(--dim)' }}>
        swipe across bars to adjust →
      </div>
    </div>
  );
}

function ReadinessRing({ value }) {
  const size = 88;
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setProgress(value), 50);
    return () => clearTimeout(t);
  }, [value]);
  const dash = (c * progress) / 100;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"  stopColor="#00D4FF" />
            <stop offset="100%" stopColor="#B14CFF" />
          </linearGradient>
        </defs>
        <circle cx={size/2} cy={size/2} r={r} stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size/2} cy={size/2} r={r}
          stroke="url(#ring-grad)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          style={{
            transition: 'stroke-dasharray 1100ms cubic-bezier(0.2, 0.7, 0.2, 1)',
            filter: 'drop-shadow(0 0 6px rgba(0, 212, 255, 0.5))',
          }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column',
      }}>
        <span className="mono" style={{ fontSize: 9, color: 'var(--cyan)', letterSpacing: '0.18em' }}>READY</span>
        <span className="display" style={{ fontSize: 14, color: 'var(--text)', marginTop: -2 }}>
          {value >= 80 ? 'OPTIMAL' : value >= 60 ? 'STRONG' : value >= 40 ? 'STEADY' : 'LOW'}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// One Thing card — editable text
// ─────────────────────────────────────────────────────────
function OneThingCard({ text, done, onMark, onEdit }) {
  const [trigger, setTrigger] = useState(0);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(text);

  const handle = () => {
    if (done || !text) return;
    setTrigger((t) => t + 1);
    setTimeout(() => onMark(), 80);
  };

  const startEdit = () => {
    setDraft(text);
    setEditing(true);
  };
  const saveEdit = () => {
    const v = draft.trim();
    if (v) onEdit(v);
    setEditing(false);
  };

  return (
    <div className={`hud glass-strong ${done ? '' : 'glow-pulse-red'}`} style={{
      padding: 16,
      borderRadius: 20,
      position: 'relative',
      overflow: 'visible',
      borderColor: done ? 'rgba(182,255,60,0.35)' : 'rgba(255,0,51,0.35)',
      background: done
        ? 'linear-gradient(135deg, rgba(182,255,60,0.04), rgba(11,11,18,0.4))'
        : 'linear-gradient(135deg, rgba(255,0,51,0.06), rgba(11,11,18,0.4))',
    }}>
      <HUDTicks />
      <ConfettiBurst trigger={trigger} />

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Pill variant={done ? 'lime' : 'red'} dot={done ? '#B6FF3C' : '#FF0033'}>
            {done ? 'COMPLETE' : 'TODAY'}
          </Pill>
          <span className="eyebrow" style={{ color: done ? 'var(--lime)' : 'var(--ona-red)' }}>
            One Thing
          </span>
        </div>
        {!done && !editing && (
          <span
            className="pressable mono"
            onClick={startEdit}
            style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.14em', padding: '2px 6px' }}
          >EDIT</span>
        )}
        {done && (
          <span className="mono" style={{ fontSize: 10, color: 'var(--muted)' }}>DONE</span>
        )}
      </div>

      {editing ? (
        <div>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={2}
            autoFocus
            placeholder="What's the one thing that matters most today?"
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,0,51,0.4)',
              borderRadius: 12,
              padding: '10px 12px',
              color: 'var(--text)',
              fontSize: 16, fontWeight: 600, lineHeight: 1.25,
              fontFamily: 'var(--font-body)',
              outline: 'none', resize: 'none',
              boxShadow: '0 0 24px -10px rgba(255,0,51,0.6)',
            }}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <div
              className="pressable"
              onClick={saveEdit}
              style={{
                flex: 1, height: 40, borderRadius: 12,
                background: 'linear-gradient(135deg, #FF0033 0%, #B14CFF 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                color: '#fff', fontWeight: 700, fontSize: 12,
                letterSpacing: '0.12em', textTransform: 'uppercase',
              }}
            >
              <IconCheck size={14} stroke={2.4} /> Save
            </div>
            <div
              className="pressable"
              onClick={() => setEditing(false)}
              style={{
                width: 48, height: 40, borderRadius: 12,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--line-strong)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--muted)',
              }}
            >
              <IconClose size={16} />
            </div>
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div
              className="pressable"
              onClick={handle}
              style={{
                width: 28, height: 28,
                flexShrink: 0,
                borderRadius: 8,
                border: `1.5px solid ${done ? 'var(--lime)' : 'rgba(255,0,51,0.6)'}`,
                background: done ? 'var(--lime)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: done ? '0 0 16px -2px rgba(182,255,60,0.5)' : '0 0 16px -2px rgba(255,0,51,0.5)',
                marginTop: 2,
              }}
            >
              {done && <IconCheck size={16} color="#06060A" stroke={3} />}
            </div>
            <div
              onClick={done ? undefined : startEdit}
              style={{
                flex: 1,
                fontSize: 17, lineHeight: 1.25, fontWeight: 600,
                color: text ? 'var(--text)' : 'var(--muted)',
                textDecoration: done ? 'line-through' : 'none',
                opacity: done ? 0.55 : 1,
                textWrap: 'pretty',
                cursor: done ? 'default' : 'text',
              }}
            >{text || 'Set your One Thing for today →'}</div>
          </div>

          {!done && text && (
            <div
              className="pressable"
              onClick={handle}
              style={{
                marginTop: 14,
                height: 44,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #FF0033 0%, #B14CFF 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 6,
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#fff',
                boxShadow: '0 8px 24px -6px rgba(255,0,51,0.6)',
              }}
            >
              <IconCheck size={16} stroke={2.4} />
              Mark Done
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Momentum heatmap (14 days)
// ─────────────────────────────────────────────────────────
function MomentumStrip({ momentum = MOMENTUM, streak = 0 }) {
  return (
    <div className="hud glass" style={{ padding: 14, borderRadius: 16 }}>
      <HUDTicks />
      <div style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        marginBottom: 10,
      }}>
        <div>
          <div className="eyebrow">Momentum</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
            <span className="display" style={{ fontSize: 26, color: 'var(--gold)' }}>{streak}</span>
            <span className="mono" style={{ fontSize: 10, color: 'var(--muted)' }}>DAY STREAK</span>
          </div>
        </div>
        <div className="mono" style={{ fontSize: 10, color: 'var(--dim)' }}>14d</div>
      </div>

      <div style={{ display: 'flex', gap: 4 }}>
        {momentum.map((v, i) => {
          const intensity = v / 4;
          const isToday = i === momentum.length - 1;
          const opacity = v === 0 ? 0.08 : 0.25 + intensity * 0.75;
          const color = v === 0 ? '#5A5A66'
            : v === 1 ? '#0055FF'
            : v === 2 ? '#00D4FF'
            : v === 3 ? '#FFD23C'
            : '#FF0033';
          return (
            <div
              key={i}
              className={v > 1 ? 'shimmer-cell' : ''}
              style={{
                flex: 1,
                height: 32,
                borderRadius: 5,
                background: color,
                opacity: opacity,
                boxShadow: v >= 3 ? `0 0 10px ${color}` : 'none',
                border: isToday ? '1.5px solid #fff' : 'none',
                animationDelay: `${i * 100}ms`,
              }}
            />
          );
        })}
      </div>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        marginTop: 6,
      }}>
        <span className="mono" style={{ fontSize: 9, color: 'var(--dim)' }}>14 DAYS AGO</span>
        <span className="mono" style={{ fontSize: 9, color: 'var(--cyan)' }}>TODAY</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Today's Timeline — add / delete blocks
// ─────────────────────────────────────────────────────────
function TodayTimeline({ events, calendarEvents = [], onAdd, onDelete }) {
  const [adding, setAdding] = useState(false);
  const [time, setTime] = useState('');
  const [label, setLabel] = useState('');
  const [cat, setCat] = useState(0);

  const submit = () => {
    if (!label.trim()) return;
    const c = TL_CATEGORIES[cat];
    onAdd({
      time: time.trim() || '12:00',
      label: label.trim(),
      kind: c.kind,
      color: c.color,
    });
    setTime(''); setLabel(''); setCat(0); setAdding(false);
  };

  // Merge real calendar events (read-only) with manual blocks, sorted by time.
  const calItems = calendarEvents.map((e) => ({ time: e.time, label: e.label, color: '#00D4FF', kind: 'CAL', cal: true }));
  const manualItems = events.map((e, i) => ({ ...e, cal: false, _idx: i }));
  const sortKey = (t) => (t === 'all-day' ? '00:00' : t);
  const combined = [...calItems, ...manualItems].sort((a, b) => sortKey(a.time).localeCompare(sortKey(b.time)));

  return (
    <div className="hud glass" style={{ padding: 16, borderRadius: 16 }}>
      <HUDTicks />
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 14,
      }}>
        <div>
          <div className="eyebrow">{calItems.length > 0 ? 'Today · synced with Google' : 'Today · Timeline'}</div>
          <div className="section-title" style={{ fontSize: 22, marginTop: 2 }}>
            {combined.length} BLOCKS
          </div>
        </div>
        <div
          className="pressable"
          onClick={() => setAdding((a) => !a)}
          style={{
            width: 30, height: 30, borderRadius: 9,
            background: adding ? 'rgba(255,255,255,0.06)' : 'rgba(0,212,255,0.12)',
            border: `1px solid ${adding ? 'var(--line-strong)' : 'rgba(0,212,255,0.4)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: adding ? 'var(--muted)' : 'var(--cyan)',
          }}
        >
          {adding ? <IconClose size={15} /> : <IconPlus size={16} />}
        </div>
      </div>

      {/* add form */}
      {adding && (
        <div style={{
          marginBottom: 14, padding: 12, borderRadius: 12,
          background: 'rgba(255,255,255,0.03)', border: '1px solid var(--line)',
        }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="06:30"
              style={{
                width: 70, background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--line)', borderRadius: 10,
                padding: '8px 10px', color: 'var(--text)',
                fontFamily: 'var(--font-mono)', fontSize: 13, outline: 'none',
              }}
            />
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="What's happening?"
              style={{
                flex: 1, background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--line)', borderRadius: 10,
                padding: '8px 10px', color: 'var(--text)',
                fontSize: 14, outline: 'none', fontFamily: 'var(--font-body)',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
            {TL_CATEGORIES.map((c, i) => {
              const active = cat === i;
              return (
                <div
                  key={c.kind}
                  className="pressable"
                  onClick={() => setCat(i)}
                  style={{
                    padding: '5px 9px', borderRadius: 999,
                    fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    background: active ? `${c.color}20` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${active ? c.color + '90' : 'var(--line)'}`,
                    color: active ? c.color : 'var(--muted)',
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: 999, background: c.color }} />
                  {c.kind}
                </div>
              );
            })}
          </div>
          <div
            className="pressable"
            onClick={submit}
            style={{
              height: 40, borderRadius: 12,
              background: 'linear-gradient(135deg, #00D4FF 0%, #B14CFF 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              color: '#06060A', fontWeight: 700, fontSize: 12,
              letterSpacing: '0.12em', textTransform: 'uppercase',
            }}
          >
            <IconPlus size={15} stroke={2.4} /> Add Block
          </div>
        </div>
      )}

      <div>
        {combined.length === 0 && (
          <div className="eyebrow" style={{ color: 'var(--dim)', padding: '8px 0' }}>
            No blocks yet — tap + to add one, or connect Google Calendar in settings.
          </div>
        )}
        {combined.map((e, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <TimelineEvent
                time={e.time}
                label={e.label}
                color={e.color}
                kind={e.kind}
                last={i === combined.length - 1}
              />
            </div>
            {e.cal ? (
              <div style={{ width: 24, height: 24, flexShrink: 0, marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--dim)' }} title="From Google Calendar">
                <IconCalendar size={13} />
              </div>
            ) : (
              <div
                className="pressable"
                onClick={() => onDelete(e._idx)}
                style={{
                  width: 24, height: 24, borderRadius: 7, flexShrink: 0, marginTop: 2,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--dim)',
                }}
              >
                <IconClose size={13} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Mission Control screen
// ─────────────────────────────────────────────────────────
function MissionControl({ state, setState, momentum, streak, trend, icalUrl, onOpenSettings }) {
  const setMeter = (k, v) => setState((s) => ({ ...s, [k]: v }));
  const markDone = () => setState((s) => ({ ...s, oneThingDone: true }));
  const editOneThing = (txt) => setState((s) => ({ ...s, oneThing: txt }));

  // Pull today's real events from the connected Google Calendar.
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

  // Readiness is derived live from the four meters (each 0–10) → 0–100.
  const readiness = Math.round(((state.energy + state.focus + state.body + state.mood) / 40) * 100);

  // Fall back to seed for daily states saved before these fields existed
  const oneThingText = state.oneThing ?? TODAY.oneThing;
  const events = state.timeline ?? TIMELINE;

  const addEvent = (ev) =>
    setState((s) => {
      const list = [...(s.timeline ?? TIMELINE), ev].sort((a, b) => a.time.localeCompare(b.time));
      return { ...s, timeline: list };
    });
  const deleteEvent = (idx) =>
    setState((s) => {
      const list = (s.timeline ?? TIMELINE).filter((_, i) => i !== idx);
      return { ...s, timeline: list };
    });

  return (
    <div className="screen-content" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <ReadinessHero
        readiness={readiness}
        trend={trend}
        energy={state.energy}
        focus={state.focus}
        body={state.body}
        mood={state.mood}
        onMeter={setMeter}
        onOpenSettings={onOpenSettings}
      />
      <OneThingCard text={oneThingText} done={state.oneThingDone} onMark={markDone} onEdit={editOneThing} />
      <MomentumStrip momentum={momentum} streak={streak} />
      <TodayTimeline events={events} calendarEvents={calendarEvents} onAdd={addEvent} onDelete={deleteEvent} />
    </div>
  );
}

export { MissionControl };
