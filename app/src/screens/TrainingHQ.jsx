import { useState, useEffect } from 'react';
import { HUDTicks, TickCounter, ProgressBar, SectionHead, Pill, ConfettiBurst } from '../components/atoms.jsx';
import { celebrate } from '../lib/haptics.js';
import { IconCheck, IconLock, IconChevronDown, IconCamera, IconActivity, IconCalendar } from '../components/icons.jsx';
import { RADAR_AXES, RADAR_CURRENT, RADAR_GOAL, SKILLS, DISCIPLINES } from '../data.js';
import { useSyncedState } from '../useSyncedState.js';
import { CoachSheet } from '../CoachSheet.jsx';
import { WeekPlanSheet } from '../WeekPlanSheet.jsx';
import { Sheet } from '../components/Sheet.jsx';
import { drillsFor, fundamentalsFor } from '../coaching.js';
import { TIER_META, masteryEstimate, prereqFor, upcomingUnlocks, nextBreakthrough } from '../lib/mission.js';

// Sessions already logged before persistence existed (seed baseline)
const BASE_SESSIONS = 38;

// ─────────────────────────────────────────────────────────
// SCREEN 2 — Training HQ
// ─────────────────────────────────────────────────────────

function Stepper({ children, onClick }) {
  return (
    <div className="pressable" onClick={onClick} style={{
      width: 26, height: 26, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)', fontSize: 16, fontWeight: 700,
    }}>{children}</div>
  );
}

const TIER_COLORS = {
  Foundation: '#34D399',
  Developing: '#45B7E8',
  Advanced: '#E9C46A',
  Elite: '#FF6B5B',
};

// Tap-to-cycle tracker for any drill or fundamental: todo → working → done.
const TRACK_STATES = {
  todo:    { label: 'TRACK',   bg: 'rgba(255,255,255,0.05)', border: 'var(--line-strong)', color: 'var(--muted)' },
  working: { label: 'WORKING', bg: 'rgba(69,183,232,0.16)',   border: 'rgba(69,183,232,0.6)', color: '#45B7E8' },
  done:    { label: '✓ GOT IT', bg: 'rgba(52,211,153,0.16)', border: 'rgba(52,211,153,0.6)', color: '#34D399' },
};
function TrackBtn({ status = 'todo', onClick }) {
  const s = TRACK_STATES[status] || TRACK_STATES.todo;
  return (
    <div className="pressable" onClick={(e) => { e.stopPropagation(); onClick?.(); }} style={{
      flexShrink: 0, padding: '4px 9px', borderRadius: 999,
      background: s.bg, border: `1px solid ${s.border}`, color: s.color,
      fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
      display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 58, textAlign: 'center',
    }}>{s.label}</div>
  );
}

// Body radar chart (6 axes, current vs goal)
function BodyRadar({ size = 260, values = RADAR_CURRENT }) {
  const cx = size / 2;
  const cy = size / 2;
  const max = 100;
  const radius = size / 2 - 36;
  const axes = RADAR_AXES.length;

  // points along an axis at a given value (0..100)
  const pointAt = (i, v) => {
    const angle = -Math.PI / 2 + (i / axes) * Math.PI * 2;
    const r = (v / max) * radius;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  };

  const polyPoints = (vals) => vals.map((v, i) => pointAt(i, v).join(',')).join(' ');

  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setDrawn(true), 100);
    return () => clearTimeout(t);
  }, []);

  const currentPts = drawn ? polyPoints(values) : polyPoints(values.map(() => 0));
  const goalPts = drawn ? polyPoints(RADAR_GOAL) : polyPoints(RADAR_GOAL.map(() => 0));

  const rings = [0.25, 0.5, 0.75, 1];

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <svg width={size} height={size} style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id="radar-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#45B7E8" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#45B7E8" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* concentric polygons */}
        {rings.map((rPct, idx) => {
          const pts = Array.from({ length: axes }).map((_, i) => {
            const angle = -Math.PI / 2 + (i / axes) * Math.PI * 2;
            const r = rPct * radius;
            return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
          }).join(' ');
          return (
            <polygon
              key={idx}
              points={pts}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
              strokeDasharray={idx === rings.length - 1 ? '0' : '2 4'}
            />
          );
        })}

        {/* axes */}
        {Array.from({ length: axes }).map((_, i) => {
          const angle = -Math.PI / 2 + (i / axes) * Math.PI * 2;
          return (
            <line
              key={i}
              x1={cx} y1={cy}
              x2={cx + radius * Math.cos(angle)}
              y2={cy + radius * Math.sin(angle)}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
            />
          );
        })}

        {/* goal polygon (dashed violet) */}
        <polygon
          points={goalPts}
          fill="rgba(45, 212, 191, 0.04)"
          stroke="#2DD4BF"
          strokeWidth="1.2"
          strokeDasharray="3 4"
          style={{ transition: 'all 1100ms cubic-bezier(0.2,0.7,0.2,1)' }}
        />

        {/* current polygon */}
        <polygon
          points={currentPts}
          fill="rgba(69, 183, 232, 0.18)"
          stroke="#45B7E8"
          strokeWidth="2"
          style={{
            filter: 'drop-shadow(0 0 8px rgba(69, 183, 232, 0.6))',
            transition: 'all 1100ms cubic-bezier(0.2,0.7,0.2,1)',
          }}
        />

        {/* current points (dots) */}
        {values.map((v, i) => {
          const [x, y] = drawn ? pointAt(i, v) : pointAt(i, 0);
          return (
            <circle
              key={i}
              cx={x} cy={y} r="3"
              fill="#45B7E8"
              style={{
                filter: 'drop-shadow(0 0 6px rgba(69, 183, 232, 0.8))',
                transition: 'all 1100ms cubic-bezier(0.2,0.7,0.2,1)',
              }}
            />
          );
        })}
      </svg>

      {/* axis labels */}
      {RADAR_AXES.map((label, i) => {
        const angle = -Math.PI / 2 + (i / axes) * Math.PI * 2;
        const labelR = radius + 18;
        const x = cx + labelR * Math.cos(angle);
        const y = cy + labelR * Math.sin(angle);
        return (
          <div key={label} style={{
            position: 'absolute',
            left: x, top: y,
            transform: 'translate(-50%, -50%)',
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--muted)',
            whiteSpace: 'nowrap',
          }}>
            <div style={{ textAlign: 'center' }}>{label}</div>
            <div style={{ color: 'var(--cyan)', fontWeight: 700, fontSize: 10, marginTop: 1 }}>
              {values[i]}
            </div>
          </div>
        );
      })}

      {/* center label */}
      <div style={{
        position: 'absolute',
        left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        pointerEvents: 'none',
      }}>
        <div className="eyebrow" style={{ color: 'var(--dim)' }}>OVERALL</div>
        <div className="display" style={{ fontSize: 28, color: 'var(--cyan)', lineHeight: 1 }}>
          <TickCounter value={Math.round(values.reduce((s, v) => s + v, 0) / values.length)} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// MOVEMENT IDENTITY — "How close am I to the athlete I want
// to become?" Each discipline carries a target identity; the
// hero shows the distance to World-Class Hybrid Athlete.
// ─────────────────────────────────────────────────────────
const IDENTITY_TARGETS = {
  gymnastics:   'Elite Gymnast',
  tricking:     'Advanced Tricker',
  calisthenics: 'Elite Calisthenics Athlete',
  acro:         'Elite Acrobat',
  parkour:      'Advanced Parkour Athlete',
  ninja:        'Elite Ninja Athlete',
};

export function identityScores(skills) {
  return DISCIPLINES.map((d) => {
    const list = skills[d.id] || [];
    const pct = list.length
      ? Math.round(list.reduce((s, x) => s + (x.status === 'done' ? 100 : (x.pct || 0)), 0) / list.length)
      : 0;
    return { disc: d, target: IDENTITY_TARGETS[d.id] || `Elite ${d.name}`, pct };
  });
}

function ProgressionHero({ skills, readiness, onCoach }) {
  let mastered = 0, total = 0, pctSum = 0;
  DISCIPLINES.forEach((d) => (skills[d.id] || []).forEach((s) => {
    total += 1;
    pctSum += s.status === 'done' ? 100 : (s.pct || 0);
    if (s.status === 'done') mastered += 1;
  }));
  const overall = total ? Math.round(pctSum / total) : 0;
  const edge = nextBreakthrough(skills);
  const unlocks = upcomingUnlocks(skills, 2);
  const identities = identityScores(skills);
  const [showIdentity, setShowIdentity] = useState(false);

  return (
    <div className="hud glass-strong mesh-train" style={{ padding: 16, borderRadius: 20 }}>
      <HUDTicks />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div className="eyebrow" style={{ color: 'var(--cyan)' }}>Movement identity</div>
          <div className="display" style={{ fontSize: 26, marginTop: 2, lineHeight: 1.05 }}>HYBRID ATHLETE</div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', marginTop: 5 }}>
            LEVEL {mastered} · {overall}% TOWARD WORLD-CLASS
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="eyebrow">Readiness</div>
          <div className="display" style={{ fontSize: 26, color: readiness >= 75 ? 'var(--lime)' : readiness >= 55 ? 'var(--gold)' : 'var(--ona-red)' }}>{readiness ?? '—'}</div>
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <ProgressBar value={overall} color="var(--cyan)" height={5} />
      </div>

      {/* identity meters — distance to each target identity */}
      <div className="pressable" onClick={() => setShowIdentity((x) => !x)} style={{ marginTop: 10 }}>
        <div className="mono" style={{ fontSize: 9, color: 'var(--dim)', letterSpacing: '0.14em' }}>
          {showIdentity ? '▾' : '▸'} WHO I'M BECOMING · {identities.length} IDENTITIES
        </div>
        {showIdentity && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 10 }}>
            {identities.map(({ disc, target, pct }) => (
              <div key={disc.id} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span style={{ width: 16, textAlign: 'center', color: disc.color, fontSize: 12, flexShrink: 0 }}>{disc.icon}</span>
                <span style={{ fontSize: 11.5, color: 'var(--muted)', width: 150, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{target}</span>
                <div style={{ flex: 1 }}><ProgressBar value={pct} color={disc.color} height={3} /></div>
                <span className="mono" style={{ fontSize: 10, color: disc.color, width: 30, textAlign: 'right', flexShrink: 0 }}>{pct}%</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {edge && (
        <div className="pressable" onClick={onCoach} style={{
          marginTop: 12, padding: '10px 12px', borderRadius: 12,
          background: 'rgba(69,183,232,0.07)', border: '1px solid rgba(69,183,232,0.35)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 16 }}>⚡</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
              Closest breakthrough: {edge.skill.name} · {edge.skill.pct}%
            </div>
            <div className="mono" style={{ fontSize: 9, color: 'var(--cyan)', letterSpacing: '0.08em', marginTop: 2 }}>
              {edge.disc.name.toUpperCase()} · ~{masteryEstimate(edge.skill)} WKS LEFT · TAP FOR A SESSION PLAN
            </div>
          </div>
        </div>
      )}
      {unlocks.length > 0 && (
        <div className="mono" style={{ fontSize: 9.5, color: 'var(--gold)', letterSpacing: '0.06em', marginTop: 9, lineHeight: 1.5 }}>
          🔓 ABOUT TO UNLOCK: {unlocks.map((u) => u.skill.name).join(' · ')}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// MOVEMENT PYRAMID — the four layers of the athlete and how
// they stack: Foundations → Capabilities → Disciplines → Skills.
// Capabilities are inferred from the disciplines that train them.
// ─────────────────────────────────────────────────────────
function MovementPyramid({ skills, radar }) {
  const [open, setOpen] = useState(false);
  const ids = identityScores(skills);
  const get = (id) => ids.find((x) => x.disc.id === id)?.pct ?? 0;
  const avg = (...vals) => Math.round(vals.reduce((s, v) => s + v, 0) / vals.length);

  const foundations = RADAR_AXES.map((label, i) => ({ label, value: radar[i] ?? 0 }))
    .filter((f) => f.label !== 'Skill');
  const capabilities = [
    { label: 'Coordination',      value: avg(get('acro'), get('calisthenics')) },
    { label: 'Balance',           value: avg(get('acro'), get('ninja')) },
    { label: 'Air awareness',     value: avg(get('gymnastics'), get('tricking')) },
    { label: 'Spatial awareness', value: avg(get('parkour'), get('tricking')) },
    { label: 'Rhythm & flow',     value: avg(get('tricking'), get('acro'), get('parkour')) },
  ];
  let mastered = 0, total = 0;
  DISCIPLINES.forEach((d) => (skills[d.id] || []).forEach((s) => { total += 1; if (s.status === 'done') mastered += 1; }));

  const layerScore = (items) => Math.round(items.reduce((s, x) => s + x.value, 0) / (items.length || 1));
  // Top → bottom (apex = Skills, base = Foundations).
  const LAYERS = [
    { n: 'L4', name: 'Skills', color: '#FF6B5B', items: [{ label: `${mastered}/${total} mastered`, value: total ? Math.round((mastered / total) * 100) : 0 }] },
    { n: 'L3', name: 'Disciplines', color: '#E9C46A', items: ids.map((x) => ({ label: x.disc.name, value: x.pct })) },
    { n: 'L2', name: 'Capabilities', color: '#2DD4BF', items: capabilities },
    { n: 'L1', name: 'Foundations', color: '#45B7E8', items: foundations },
  ];

  // ── Pyramid geometry: stacked trapezoids tapering to an apex. ──
  const W = 300, baseY = 200, apexY = 18, baseHalf = 142, apexHalf = 24, cx = 150, h = 40, gap = 6;
  const halfW = (y) => baseHalf - (baseHalf - apexHalf) * ((baseY - y) / (baseY - apexY));

  return (
    <div className="hud glass" style={{ padding: '13px 14px', borderRadius: 16 }}>
      <div className="pressable" onClick={() => setOpen((o) => !o)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span className="eyebrow" style={{ color: 'var(--cyan)' }}>How world-class is built</span>
          <div style={{ fontSize: 15, fontWeight: 700, marginTop: 1 }}>MOVEMENT PYRAMID</div>
        </div>
        <span className="mono" style={{ fontSize: 9, color: 'var(--dim)' }}>{open ? 'HIDE BREAKDOWN' : 'TAP A LAYER'}</span>
      </div>

      <svg viewBox={`0 0 ${W} 212`} style={{ width: '100%', display: 'block', marginTop: 8 }}>
        {LAYERS.map((layer, j) => {
          const yTop = apexY + j * (h + gap);
          const yBot = yTop + h;
          const hwTop = halfW(yTop), hwBot = halfW(yBot);
          const sc = layerScore(layer.items);
          const alpha = (0.16 + 0.55 * (sc / 100)).toFixed(2);
          const my = (yTop + yBot) / 2;
          return (
            <g key={layer.n} style={{ animation: 'cardIn 520ms cubic-bezier(0.2,0.7,0.2,1) both', animationDelay: `${j * 90}ms` }}>
              <polygon
                points={`${cx - hwBot},${yBot} ${cx + hwBot},${yBot} ${cx + hwTop},${yTop} ${cx - hwTop},${yTop}`}
                fill={layer.color} fillOpacity={alpha} stroke={layer.color} strokeOpacity="0.7" strokeWidth="1"
                style={{ filter: `drop-shadow(0 0 6px ${layer.color}40)` }} />
              <text x={cx} y={my - 3} textAnchor="middle" fill="#fff" fontFamily="var(--font-mono)" fontSize="8" fontWeight="700" style={{ letterSpacing: '0.12em', opacity: 0.85 }}>
                {layer.n} · {layer.name.toUpperCase()}
              </text>
              <text x={cx} y={my + 13} textAnchor="middle" fill="#fff" fontFamily="var(--font-display)" fontSize="16">{sc}</text>
            </g>
          );
        })}
      </svg>
      <div className="eyebrow" style={{ color: 'var(--dim)', textAlign: 'center', marginTop: 2 }}>each layer feeds the one above — brighter = more developed</div>

      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
          {LAYERS.map((layer) => (
            <div key={layer.n} style={{ borderLeft: `2px solid ${layer.color}`, paddingLeft: 10 }}>
              <div className="mono" style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: layer.color, marginBottom: 6 }}>{layer.n} · {layer.name.toUpperCase()}</div>
              <div style={{ display: 'flex', gap: 4 }}>
                {layer.items.map((it) => (
                  <div key={it.label} title={`${it.label} ${it.value}`} style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ height: 4, borderRadius: 999, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                      <div style={{ width: `${it.value}%`, height: '100%', background: layer.color, transition: 'width 600ms cubic-bezier(0.2,0.7,0.2,1)' }} />
                    </div>
                    <div className="mono" style={{ fontSize: 6.5, color: 'var(--dim)', letterSpacing: '0.04em', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.label.toUpperCase()}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Skill node (3 states: done, active, locked) — tap to edit
function SkillNode({ skill, color, onChange, disciplineId, track = {}, onCycleTrack, prereq, readiness, onCoach }) {
  const [editing, setEditing] = useState(false);
  const [party, setParty] = useState(0);

  const stateMap = {
    done: {
      bg: `${color}20`,
      border: `${color}80`,
      iconBg: color,
      icon: <IconCheck size={11} color="#0A0B0D" stroke={3} />,
      label: 'MASTERED',
      pctColor: color,
    },
    active: {
      bg: 'rgba(69, 183, 232, 0.10)',
      border: 'rgba(69, 183, 232, 0.5)',
      iconBg: '#45B7E8',
      icon: <span style={{ width: 6, height: 6, borderRadius: 99, background: '#0A0B0D' }} />,
      label: 'IN PROGRESS',
      pctColor: '#45B7E8',
    },
    locked: {
      bg: 'rgba(255,255,255,0.025)',
      border: 'var(--line)',
      iconBg: 'rgba(255,255,255,0.08)',
      icon: <IconLock size={11} color="var(--dim)" />,
      label: 'LOCKED',
      pctColor: 'var(--dim)',
    },
  };
  const s = stateMap[skill.status];

  const setStatus = (status) => {
    let pct = skill.pct;
    if (status === 'done') pct = 100;
    else if (status === 'locked') pct = 0;
    else if (status === 'active' && (skill.pct <= 0 || skill.pct >= 100)) pct = 50;
    if (status === 'done' && skill.status !== 'done') { setParty((p) => p + 1); celebrate(); }
    onChange?.({ status, pct });
  };
  const adjust = (delta) => {
    const pct = Math.max(5, Math.min(95, skill.pct + delta));
    onChange?.({ status: 'active', pct });
  };

  const STATUS_OPTS = [
    { id: 'locked', label: 'Locked' },
    { id: 'active', label: 'Active' },
    { id: 'done',   label: 'Mastered' },
  ];

  return (
    <div
      style={{
        padding: '10px 12px',
        borderRadius: 12,
        background: s.bg,
        border: `1px solid ${editing ? color : s.border}`,
        position: 'relative',
        opacity: skill.status === 'locked' && !editing ? 0.55 : 1,
        transition: 'border-color 200ms',
      }}
    >
      <ConfettiBurst trigger={party} />
      {/* compact row — one clean line; detail lives one tap away */}
      <div
        className="pressable"
        onClick={() => setEditing((e) => !e)}
        style={{ display: 'flex', alignItems: 'center', gap: 11 }}
      >
        <div style={{
          width: 20, height: 20, borderRadius: 7,
          background: s.iconBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>{s.icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: skill.status === 'locked' ? 'var(--muted)' : 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {skill.name}
          </div>
          {skill.status === 'active' && (
            <div style={{ marginTop: 5 }}>
              <ProgressBar value={skill.pct} color={s.pctColor} height={2.5} />
            </div>
          )}
        </div>
        {skill.status === 'active' && (
          <span className="mono" style={{ fontSize: 11, color: s.pctColor, fontWeight: 700, flexShrink: 0 }}>{skill.pct}%</span>
        )}
        <span style={{ color: 'var(--dim)', transform: editing ? 'rotate(90deg)' : 'none', transition: 'transform 200ms', flexShrink: 0, fontSize: 12 }}>›</span>
      </div>

      {/* detail + editor */}
      {editing && (
        <div style={{
          marginTop: 10, paddingTop: 10,
          borderTop: '1px solid var(--line)',
          display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
        }}>
          {skill.cue && (
            <div style={{ width: '100%', fontSize: 12, color: 'var(--muted)', lineHeight: 1.45, textWrap: 'pretty' }}>{skill.cue}</div>
          )}
          {skill.status === 'locked' && prereq && (
            <div className="mono" style={{ width: '100%', fontSize: 8.5, color: 'var(--dim)', letterSpacing: '0.06em' }}>
              🔒 UNLOCKS AFTER: {prereq.name.toUpperCase()}{prereq.status === 'active' ? ` (${prereq.pct}%)` : ''}
            </div>
          )}
          {skill.status === 'active' && (() => {
            const meta = TIER_META[skill.tier];
            const wks = masteryEstimate(skill);
            const gated = meta && readiness != null && readiness < meta.gate;
            return (
              <div className="mono" style={{ width: '100%', fontSize: 8.5, letterSpacing: '0.06em', color: gated ? 'var(--gold)' : 'var(--dim)' }}>
                ~{wks} WKS TO MASTERY{meta ? ` · ${gated ? `⚠ WAIT FOR READINESS ${meta.gate}+` : `READY AT ${meta.gate}+ ✓`}` : ''}
              </div>
            );
          })()}
          {STATUS_OPTS.map((o) => {
            const on = skill.status === o.id;
            return (
              <div
                key={o.id}
                className="pressable"
                onClick={() => setStatus(o.id)}
                style={{
                  padding: '5px 9px', borderRadius: 999,
                  fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  background: on ? `${color}20` : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${on ? color + '90' : 'var(--line)'}`,
                  color: on ? color : 'var(--muted)',
                }}
              >{o.label}</div>
            );
          })}
          {skill.status === 'active' && onCoach && (
            <div className="pressable" onClick={(e) => { e.stopPropagation(); onCoach(); }} style={{
              padding: '5px 9px', borderRadius: 999,
              fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
              background: 'rgba(69,183,232,0.12)', border: '1px solid rgba(69,183,232,0.45)', color: 'var(--cyan)',
            }}>✦ COACH ME</div>
          )}
          {skill.status === 'active' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
              <div
                className="pressable"
                onClick={() => adjust(-5)}
                style={{
                  width: 26, height: 26, borderRadius: 8,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text)', fontSize: 16, fontWeight: 700,
                }}
              >−</div>
              <div
                className="pressable"
                onClick={() => adjust(5)}
                style={{
                  width: 26, height: 26, borderRadius: 8,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text)', fontSize: 16, fontWeight: 700,
                }}
              >+</div>
            </div>
          )}

          {(() => {
            const dr = drillsFor(disciplineId, skill.tier);
            if (!dr.length) return null;
            return (
              <div style={{ width: '100%', marginTop: 4, paddingTop: 10, borderTop: '1px solid var(--line)' }}>
                <div className="eyebrow" style={{ marginBottom: 8, color }}>How to train it · {skill.tier} drills</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {dr.map((x, i) => {
                    const tk = `d|${disciplineId}|${skill.tier}|${x.name}`;
                    return (
                      <div key={i} style={{ display: 'flex', gap: 8 }}>
                        <span style={{ color, fontWeight: 800, fontSize: 12, lineHeight: '16px', flexShrink: 0 }}>›</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3, flex: 1 }}>{x.name}</div>
                            <TrackBtn status={track[tk]} onClick={() => onCycleTrack?.(tk)} />
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.4, marginTop: 1 }}>{x.cue}</div>
                          {x.fault && <div style={{ fontSize: 10, color: 'var(--ona-red)', lineHeight: 1.35, marginTop: 2 }}>⚠ {x.fault}</div>}
                          {x.gate && <div style={{ fontSize: 10, color, lineHeight: 1.35, marginTop: 2, letterSpacing: '0.02em' }}>✓ ready when: {x.gate}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

// "What I'm working on" — every active skill + drill/fundamental marked
// WORKING, pulled into one focused list of current edges.
function WorkingOnPanel({ skills, track = {}, onCycleTrack }) {
  const activeSkills = [];
  DISCIPLINES.forEach((d) => (skills[d.id] || []).forEach((s) => {
    if (s.status === 'active') activeSkills.push({ disc: d, name: s.name, pct: s.pct, tier: s.tier });
  }));
  const working = Object.entries(track).filter(([, v]) => v === 'working').map(([k]) => {
    const p = k.split('|');
    const disc = DISCIPLINES.find((x) => x.id === p[1]);
    return { key: k, type: p[0] === 'd' ? 'Drill' : 'Fundamental', disc, name: p[p.length - 1], tier: p[0] === 'd' ? p[2] : null };
  });
  const total = activeSkills.length + working.length;

  const Row = ({ color, name, meta, right }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 0', borderTop: '1px solid var(--line)' }}>
      <span style={{ width: 7, height: 7, borderRadius: 999, background: color, boxShadow: `0 0 7px ${color}`, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.3 }}>{name}</div>
        {meta && <div className="mono" style={{ fontSize: 8.5, color: 'var(--dim)', letterSpacing: '0.08em', marginTop: 1 }}>{meta}</div>}
      </div>
      {right}
    </div>
  );

  return (
    <div className="hud glass" style={{ padding: 14, borderRadius: 16, border: '1px solid rgba(69,183,232,0.22)' }}>
      <HUDTicks />
      <div style={{ marginBottom: total ? 8 : 0 }}>
        <div className="eyebrow" style={{ color: 'var(--cyan)' }}>Your current edges</div>
        <div className="section-title" style={{ fontSize: 20, marginTop: 2 }}>WORKING ON · {total}</div>
      </div>
      {total === 0 ? (
        <div className="eyebrow" style={{ color: 'var(--dim)', lineHeight: 1.5, marginTop: 8 }}>Mark a skill Active, or tap TRACK → WORKING on any drill or fundamental, and it shows up here as a current edge.</div>
      ) : (
        <div>
          {activeSkills.map((s, i) => (
            <Row key={`s${i}`} color={s.disc.color} name={s.name}
              meta={`${s.disc.name.toUpperCase()} · SKILL · ${s.tier || ''}`}
              right={<span className="display" style={{ fontSize: 15, color: s.disc.color }}>{s.pct}%</span>} />
          ))}
          {working.map((w) => (
            <Row key={w.key} color={w.disc?.color || '#45B7E8'} name={w.name}
              meta={`${(w.disc?.name || '').toUpperCase()} · ${w.type.toUpperCase()}${w.tier ? ' · ' + w.tier : ''}`}
              right={<TrackBtn status="working" onClick={() => onCycleTrack?.(w.key)} />} />
          ))}
        </div>
      )}
    </div>
  );
}

// Tier-grouped skill tree — one discipline at a time, quest-line clarity.
// Mastered skills fold away into a single line per tier; the eye lands
// on what's active and what unlocks next.
const TIERS = ['Foundation', 'Developing', 'Advanced', 'Elite'];

function SkillTree({ discipline, skills, onUpdate, track = {}, onCycleTrack, readiness, onCoach }) {
  const [showMastered, setShowMastered] = useState({});
  const indexed = skills.map((skill, idx) => ({ skill, idx }));

  // Biggest limiter — the first untrained fundamental for this discipline.
  const limiter = fundamentalsFor(discipline.id).find((f) => track[`f|${discipline.id}|${f.name}`] !== 'done');

  return (
    <div className="glass" style={{ borderRadius: 16, padding: '12px 12px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {limiter && (
        <div className="mono" style={{ fontSize: 9, color: 'var(--gold)', letterSpacing: '0.1em', padding: '2px 2px 0' }}>
          ⚠ BIGGEST LIMITER: {limiter.name.toUpperCase()} — TRAIN IT IN FUNDAMENTALS ↓
        </div>
      )}
      <FundamentalsPanel disciplineId={discipline.id} color={discipline.color} track={track} onCycleTrack={onCycleTrack} />

      {TIERS.map((tier) => {
        const inTier = indexed.filter(({ skill }) => skill.tier === tier);
        if (!inTier.length) return null;
        const tc = TIER_COLORS[tier];
        const mastered = inTier.filter(({ skill }) => skill.status === 'done');
        const open = inTier.filter(({ skill }) => skill.status !== 'done');
        const showAll = !!showMastered[tier];
        const meta = TIER_META[tier];

        return (
          <div key={tier}>
            {/* slim tier header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span className="mono" style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', color: tc, textTransform: 'uppercase' }}>{tier}</span>
              <div style={{ flex: 1, height: 2, borderRadius: 999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <div style={{ width: `${(mastered.length / inTier.length) * 100}%`, height: '100%', background: tc, transition: 'width 600ms cubic-bezier(0.2,0.7,0.2,1)' }} />
              </div>
              <span className="mono" style={{ fontSize: 9, color: mastered.length === inTier.length ? tc : 'var(--dim)' }}>
                {mastered.length}/{inTier.length}{meta ? ` · R${meta.gate}+` : ''}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {/* mastered fold into one quiet line */}
              {mastered.length > 0 && !showAll && (
                <div className="pressable" onClick={() => setShowMastered((m) => ({ ...m, [tier]: true }))} style={{
                  padding: '8px 12px', borderRadius: 10,
                  background: `${tc}0a`, border: `1px solid ${tc}30`,
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <IconCheck size={12} color={tc} stroke={2.6} />
                  <span style={{ flex: 1, fontSize: 12, color: 'var(--muted)' }}>
                    {mastered.length} mastered — {mastered.map(({ skill }) => skill.name).slice(0, 2).join(', ')}{mastered.length > 2 ? '…' : ''}
                  </span>
                  <span className="mono" style={{ fontSize: 9, color: tc, letterSpacing: '0.08em' }}>SHOW</span>
                </div>
              )}
              {(showAll ? inTier : open).map(({ skill, idx }) => (
                <SkillNode
                  key={skill.name}
                  skill={skill}
                  color={discipline.color}
                  disciplineId={discipline.id}
                  onChange={(patch) => onUpdate(idx, patch)}
                  track={track}
                  onCycleTrack={onCycleTrack}
                  prereq={skill.status === 'locked' ? prereqFor(skills, idx) : null}
                  readiness={readiness}
                  onCoach={onCoach}
                />
              ))}
              {showAll && mastered.length > 0 && (
                <div className="pressable mono" onClick={() => setShowMastered((m) => ({ ...m, [tier]: false }))} style={{ textAlign: 'center', fontSize: 9, color: 'var(--dim)', letterSpacing: '0.1em', padding: '4px 0' }}>
                  HIDE MASTERED
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// The athletic + technical bedrock for a discipline (currently tricking).
function FundamentalsPanel({ disciplineId, color, track = {}, onCycleTrack }) {
  const [open, setOpen] = useState(false);
  const items = fundamentalsFor(disciplineId);
  if (!items.length) return null;
  return (
    <div className="hud" style={{ borderRadius: 12, background: `${color}0d`, border: `1px solid ${color}40`, overflow: 'hidden' }}>
      <div className="pressable" onClick={() => setOpen((o) => !o)} style={{ padding: '11px 13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="eyebrow" style={{ color }}>The real foundation</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginTop: 1 }}>FUNDAMENTALS · {items.length} pillars</div>
        </div>
        <span style={{ color, fontSize: 18, transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 200ms' }}>›</span>
      </div>
      {open && (
        <div style={{ padding: '0 13px 13px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="eyebrow" style={{ color: 'var(--dim)', lineHeight: 1.5 }}>What separates "knows tricks" from elite. Train these alongside the skills.</div>
          {items.map((f, i) => {
            const tk = `f|${disciplineId}|${f.name}`;
            return (
              <div key={i} style={{ borderLeft: `2px solid ${color}`, paddingLeft: 10 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', flex: 1 }}>{i + 1}. {f.name}</div>
                  <TrackBtn status={track[tk]} onClick={() => onCycleTrack?.(tk)} />
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.45, marginTop: 3 }}>{f.why}</div>
                <div style={{ fontSize: 11.5, color: 'var(--text)', lineHeight: 1.45, marginTop: 4 }}><span style={{ color, fontWeight: 700 }}>Train: </span>{f.how}</div>
                <div style={{ fontSize: 11, color, lineHeight: 1.4, marginTop: 3 }}>✓ {f.standard}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Log Session sheet
// ─────────────────────────────────────────────────────────
function LogSessionSheet({ open, onClose, onLog }) {
  const [discipline, setDiscipline] = useState('tricking');
  const [duration, setDuration] = useState(60);
  const [intensity, setIntensity] = useState(7);
  const [logged, setLogged] = useState(false);

  useEffect(() => {
    if (open) {
      setLogged(false);
      setDiscipline('tricking');
      setDuration(60);
      setIntensity(7);
    }
  }, [open]);

  const d = DISCIPLINES.find(d => d.id === discipline);

  const submit = () => {
    onLog?.({
      id: Date.now(),
      discipline: d.id,
      disciplineName: d.name,
      duration,
      intensity,
      date: new Date().toISOString(),
    });
    setLogged(true);
    setTimeout(() => onClose(), 700);
  };

  return (
    <Sheet open={open} onClose={onClose} maxHeight="76%">

        {logged ? (
          <div style={{ padding: '32px 0 16px', textAlign: 'center' }}>
            <div className="display" style={{ fontSize: 28, color: 'var(--lime)' }}>SESSION LOGGED</div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', marginTop: 6 }}>
              {duration} MIN · {d.name.toUpperCase()} · INTENSITY {intensity}/10
            </div>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 12 }}>
              <div className="eyebrow">Log Session</div>
              <div className="display" style={{ fontSize: 24, marginTop: 2 }}>WHAT DID YOU TRAIN?</div>
            </div>

            {/* Discipline picker */}
            <div className="eyebrow" style={{ marginBottom: 8 }}>Discipline</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 14 }}>
              {DISCIPLINES.map((dd) => {
                const active = discipline === dd.id;
                return (
                  <div
                    key={dd.id}
                    className="pressable"
                    onClick={() => setDiscipline(dd.id)}
                    style={{
                      padding: '10px 0',
                      textAlign: 'center',
                      borderRadius: 10,
                      background: active ? `${dd.color}18` : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${active ? dd.color + '80' : 'var(--line)'}`,
                      color: active ? dd.color : 'var(--muted)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      letterSpacing: '0.12em',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      boxShadow: active ? `0 0 14px -4px ${dd.color}` : 'none',
                    }}
                  >
                    <span style={{ marginRight: 4 }}>{dd.icon}</span>
                    {dd.name}
                  </div>
                );
              })}
            </div>

            {/* Duration */}
            <div className="eyebrow" style={{ marginBottom: 8 }}>Duration · min</div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
              {[30, 45, 60, 90, 120].map((m) => (
                <div
                  key={m}
                  className="pressable"
                  onClick={() => setDuration(m)}
                  style={{
                    flex: 1,
                    padding: '10px 0',
                    textAlign: 'center',
                    borderRadius: 10,
                    background: duration === m ? 'rgba(69,183,232,0.15)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${duration === m ? 'rgba(69,183,232,0.6)' : 'var(--line)'}`,
                    color: duration === m ? 'var(--cyan)' : 'var(--muted)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >{m}</div>
              ))}
            </div>

            {/* Intensity */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span className="eyebrow">Intensity</span>
              <span className="mono" style={{ fontSize: 11, color: 'var(--ona-red)', fontWeight: 700 }}>
                {intensity}/10
              </span>
            </div>
            <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="pressable"
                  onClick={() => setIntensity(i + 1)}
                  style={{
                    flex: 1, height: 24, borderRadius: 4,
                    background: i < intensity
                      ? `hsl(${20 - i * 2}, 90%, ${55 - i * 1.5}%)`
                      : 'rgba(255,255,255,0.06)',
                    boxShadow: i < intensity ? `0 0 8px hsla(${20 - i * 2}, 90%, 55%, 0.6)` : 'none',
                  }}
                />
              ))}
            </div>

            {/* Notes + photo */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <div style={{
                flex: 1,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--line)',
                borderRadius: 12,
                padding: '10px 12px',
              }}>
                <div className="eyebrow" style={{ marginBottom: 4 }}>Notes</div>
                <div style={{ color: 'var(--muted)', fontSize: 13 }}>How did it feel?</div>
              </div>
              <div className="pressable" style={{
                width: 60,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--line)',
                borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--muted)',
              }}>
                <IconCamera size={20} />
              </div>
            </div>

            <div
              className="pressable"
              onClick={submit}
              style={{
                height: 52,
                borderRadius: 14,
                background: `linear-gradient(135deg, ${d.color}, ${d.color}80)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 8,
                color: '#0A0B0D',
                fontWeight: 700,
                fontSize: 14,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                boxShadow: `0 8px 24px -8px ${d.color}`,
              }}
            >
              <IconCheck size={18} stroke={2.4} />
              Log Session
            </div>
          </>
        )}
    </Sheet>
  );
}

// ─────────────────────────────────────────────────────────
// Training HQ screen
// ─────────────────────────────────────────────────────────
function TrainingHQ({ sessions: sessionsProp, onLogSession, readiness }) {
  // One discipline in focus at a time; remembered between visits.
  const [disc, setDisc] = useState(() => {
    try { return localStorage.getItem('lifeos:lastdisc') || 'tricking'; } catch { return 'tricking'; }
  });
  const pickDisc = (id) => { setDisc(id); try { localStorage.setItem('lifeos:lastdisc', id); } catch { /* ignore */ } };
  const activeDiscipline = DISCIPLINES.find((d) => d.id === disc) || DISCIPLINES[0];
  const [logOpen, setLogOpen] = useState(false);
  // Sessions are owned by the app shell so the Companion can log them too;
  // fall back to a local synced copy if rendered standalone.
  const [ownSessions, setOwnSessions] = useSyncedState('lifeos:sessions', []);
  const sessions = sessionsProp ?? ownSessions;
  const sessionCount = BASE_SESSIONS + sessions.length;
  const logSession = onLogSession || ((s) => setOwnSessions((list) => [s, ...list].slice(0, 200)));

  // Per-user progress on individual drills & fundamentals (tap to cycle).
  const [track, setTrack] = useSyncedState('lifeos:trackables', {});
  const cycleTrack = (key) => setTrack((t) => {
    const cur = t[key] || 'todo';
    const next = cur === 'todo' ? 'working' : cur === 'working' ? 'done' : 'todo';
    if (next === 'done') celebrate();
    return { ...t, [key]: next };
  });

  const [skills, setSkills] = useSyncedState('lifeos:skills:v2', SKILLS);
  const updateSkill = (disciplineId, idx, patch) =>
    setSkills((prev) => ({
      ...prev,
      [disciplineId]: prev[disciplineId].map((sk, i) => (i === idx ? { ...sk, ...patch } : sk)),
    }));

  const [training, setTraining] = useSyncedState('lifeos:training', {
    phaseLabel: 'Phase 03 · Cycle 2',
    phaseName: 'EXPLOSIVE POWER',
    day: 47,
    radar: RADAR_CURRENT,
  });
  const radar = training.radar ?? RADAR_CURRENT;
  const day = training.day ?? 47;
  const phasePct = Math.round((day / 90) * 100);
  const setTr = (patch) => setTraining((t) => ({ ...t, ...patch }));
  const setRadarAxis = (i, v) => setTraining((t) => ({ ...t, radar: (t.radar ?? RADAR_CURRENT).map((x, idx) => (idx === i ? Math.max(0, Math.min(100, v)) : x)) }));
  const [editHeader, setEditHeader] = useState(false);
  const [editRadar, setEditRadar] = useState(false);
  const [coachOpen, setCoachOpen] = useState(false);
  const [weekOpen, setWeekOpen] = useState(false);

  const tInp = {
    width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--line)',
    borderRadius: 8, padding: '6px 8px', color: 'var(--text)', outline: 'none', boxSizing: 'border-box',
  };

  return (
    <>
      <div className="screen-content" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* L1 — the progression engine (flagship) */}
        <ProgressionHero skills={skills} readiness={readiness} onCoach={() => setCoachOpen(true)} />

        {/* one clean action row — coach a session, log one, plan the week */}
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { label: 'Coach', Icon: IconActivity, onClick: () => setCoachOpen(true), grad: 'linear-gradient(135deg, #45B7E8, #34D399)' },
            { label: 'Log', Icon: IconCheck, onClick: () => setLogOpen(true), grad: 'linear-gradient(135deg, #34D399, #E9C46A)' },
            { label: 'Week', Icon: IconCalendar, onClick: () => setWeekOpen(true), grad: 'linear-gradient(135deg, #2DD4BF, #45B7E8)' },
          ].map((b) => (
            <div key={b.label} className="pressable" onClick={b.onClick} style={{
              flex: 1, height: 48, borderRadius: 14,
              background: b.grad,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              color: '#0A0B0D', fontWeight: 800, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>
              <b.Icon size={16} stroke={2.4} />
              {b.label}
            </div>
          ))}
        </div>

        <MovementPyramid skills={skills} radar={radar} />

        {/* skill trees — the flagship. One discipline in focus at a time. */}
        <div>
          <SectionHead eyebrow={`${DISCIPLINES.length} disciplines · ${DISCIPLINES.reduce((n, d) => n + (skills[d.id]?.length || 0), 0)} skills`} title="SKILL TREES" />
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 10, WebkitOverflowScrolling: 'touch' }}>
            {DISCIPLINES.map((d) => {
              const on = disc === d.id;
              const list = skills[d.id] || [];
              const doneN = list.filter((x) => x.status === 'done').length;
              return (
                <div key={d.id} className="pressable" onClick={() => pickDisc(d.id)} style={{
                  flexShrink: 0, padding: '8px 13px', borderRadius: 999,
                  display: 'flex', alignItems: 'center', gap: 7,
                  background: on ? `${d.color}1a` : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${on ? d.color : 'var(--line)'}`,
                  color: on ? d.color : 'var(--muted)',
                  transition: 'all 200ms',
                }}>
                  <span style={{ fontSize: 13 }}>{d.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.02em' }}>{d.name}</span>
                  <span className="mono" style={{ fontSize: 9, opacity: 0.75 }}>{doneN}/{list.length}</span>
                </div>
              );
            })}
          </div>
          <SkillTree
            key={disc}
            discipline={activeDiscipline}
            skills={skills[disc] || []}
            onUpdate={(idx, patch) => updateSkill(disc, idx, patch)}
            track={track}
            onCycleTrack={cycleTrack}
            readiness={readiness}
            onCoach={() => setCoachOpen(true)}
          />
        </div>

        <WorkingOnPanel skills={skills} track={track} onCycleTrack={cycleTrack} />

        {/* training phase */}
        <div className="hud glass" style={{
          padding: 16, borderRadius: 16,
        }}>
          <HUDTicks />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {editHeader ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input value={training.phaseLabel ?? ''} onChange={(e) => setTr({ phaseLabel: e.target.value })} placeholder="Phase 03 · Cycle 2" style={{ ...tInp, fontFamily: 'var(--font-mono)', fontSize: 11 }} />
                  <input value={training.phaseName ?? ''} onChange={(e) => setTr({ phaseName: e.target.value })} placeholder="Phase name" style={{ ...tInp, fontFamily: 'var(--font-display)', fontSize: 22 }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="eyebrow">Day</span>
                    <Stepper onClick={() => setTr({ day: Math.max(1, day - 1) })}>−</Stepper>
                    <span className="mono" style={{ fontSize: 12, color: 'var(--text)', minWidth: 44, textAlign: 'center' }}>{day}/90</span>
                    <Stepper onClick={() => setTr({ day: Math.min(90, day + 1) })}>+</Stepper>
                  </div>
                </div>
              ) : (
                <>
                  <div className="eyebrow">{training.phaseLabel}</div>
                  <div className="display" style={{ fontSize: 30, marginTop: 2, lineHeight: 1 }}>{training.phaseName}</div>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>
                    DAY {day}/90 · {sessionCount} SESSIONS LOGGED
                  </div>
                </>
              )}
            </div>
            <span className="pressable mono" onClick={() => setEditHeader((e) => !e)} style={{ fontSize: 9, color: editHeader ? 'var(--lime)' : 'var(--muted)', letterSpacing: '0.14em', padding: '2px 6px', flexShrink: 0 }}>
              {editHeader ? 'DONE' : 'EDIT'}
            </span>
          </div>

          <div style={{ marginTop: 14 }}>
            <ProgressBar value={phasePct} color="var(--cyan)" height={5} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <span className="mono" style={{ fontSize: 9, color: 'var(--dim)' }}>DAY 1</span>
              <span className="mono" style={{ fontSize: 9, color: 'var(--cyan)' }}>{phasePct}% · {Math.max(0, 90 - day)} DAYS LEFT</span>
            </div>
          </div>
        </div>

        {/* Body radar */}
        <div className="hud glass" style={{ padding: 16, borderRadius: 16 }}>
          <HUDTicks />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
            <div>
              <div className="eyebrow">Body Radar</div>
              <div className="section-title" style={{ fontSize: 22, marginTop: 2 }}>CURRENT vs GOAL</div>
            </div>
            <div style={{ display: 'flex', gap: 10, fontSize: 9, alignItems: 'center' }}>
              <div className="mono" style={{ color: 'var(--cyan)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 2, background: '#45B7E8' }} /> NOW
              </div>
              <div className="mono" style={{ color: 'var(--violet)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 2, background: '#2DD4BF', borderTop: '1px dashed #2DD4BF' }} /> GOAL
              </div>
              <span className="pressable mono" onClick={() => setEditRadar((e) => !e)} style={{ color: editRadar ? 'var(--lime)' : 'var(--muted)', letterSpacing: '0.12em', padding: '2px 4px' }}>
                {editRadar ? 'DONE' : 'EDIT'}
              </span>
            </div>
          </div>
          <BodyRadar size={260} values={radar} />
          {editRadar && (
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {RADAR_AXES.map((label, i) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="mono" style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.1em', minWidth: 78, textTransform: 'uppercase' }}>{label}</span>
                  <div style={{ flex: 1 }}><ProgressBar value={radar[i]} color="var(--cyan)" height={4} /></div>
                  <Stepper onClick={() => setRadarAxis(i, radar[i] - 5)}>−</Stepper>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--cyan)', minWidth: 30, textAlign: 'center' }}>{radar[i]}</span>
                  <Stepper onClick={() => setRadarAxis(i, radar[i] + 5)}>+</Stepper>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <LogSessionSheet open={logOpen} onClose={() => setLogOpen(false)} onLog={logSession} />
      <CoachSheet open={coachOpen} onClose={() => setCoachOpen(false)} skills={skills} onLog={logSession} />
      <WeekPlanSheet open={weekOpen} onClose={() => setWeekOpen(false)} skills={skills} />
    </>
  );
}

// V2 name — Perform: the progression engine for human performance.
const PerformScreen = TrainingHQ;
export { TrainingHQ, PerformScreen, BodyRadar, SkillTree, SkillNode, LogSessionSheet };
