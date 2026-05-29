import { useState, useEffect } from 'react';
import { HUDTicks, TickCounter, ProgressBar, SectionHead, Pill } from '../components/atoms.jsx';
import { IconCheck, IconLock, IconChevronDown, IconCamera, IconActivity } from '../components/icons.jsx';
import { RADAR_AXES, RADAR_CURRENT, RADAR_GOAL, SKILLS, DISCIPLINES } from '../data.js';
import { usePersistentState } from '../usePersistentState.js';

// Sessions already logged before persistence existed (seed baseline)
const BASE_SESSIONS = 38;

// ─────────────────────────────────────────────────────────
// SCREEN 2 — Training HQ
// ─────────────────────────────────────────────────────────

// Body radar chart (6 axes, current vs goal)
function BodyRadar({ size = 260 }) {
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

  const currentPts = drawn ? polyPoints(RADAR_CURRENT) : polyPoints(RADAR_CURRENT.map(() => 0));
  const goalPts = drawn ? polyPoints(RADAR_GOAL) : polyPoints(RADAR_GOAL.map(() => 0));

  const rings = [0.25, 0.5, 0.75, 1];

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <svg width={size} height={size} style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id="radar-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#00D4FF" stopOpacity="0" />
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
          fill="rgba(177, 76, 255, 0.04)"
          stroke="#B14CFF"
          strokeWidth="1.2"
          strokeDasharray="3 4"
          style={{ transition: 'all 1100ms cubic-bezier(0.2,0.7,0.2,1)' }}
        />

        {/* current polygon */}
        <polygon
          points={currentPts}
          fill="rgba(0, 212, 255, 0.18)"
          stroke="#00D4FF"
          strokeWidth="2"
          style={{
            filter: 'drop-shadow(0 0 8px rgba(0, 212, 255, 0.6))',
            transition: 'all 1100ms cubic-bezier(0.2,0.7,0.2,1)',
          }}
        />

        {/* current points (dots) */}
        {RADAR_CURRENT.map((v, i) => {
          const [x, y] = drawn ? pointAt(i, v) : pointAt(i, 0);
          return (
            <circle
              key={i}
              cx={x} cy={y} r="3"
              fill="#00D4FF"
              style={{
                filter: 'drop-shadow(0 0 6px rgba(0, 212, 255, 0.8))',
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
              {RADAR_CURRENT[i]}
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
          <TickCounter value={74} />
        </div>
      </div>
    </div>
  );
}

// Skill node (3 states: done, active, locked)
function SkillNode({ skill, color }) {
  const stateMap = {
    done: {
      bg: `${color}20`,
      border: `${color}80`,
      iconBg: color,
      icon: <IconCheck size={11} color="#06060A" stroke={3} />,
      label: 'MASTERED',
      pctColor: color,
    },
    active: {
      bg: 'rgba(0, 212, 255, 0.10)',
      border: 'rgba(0, 212, 255, 0.5)',
      iconBg: '#00D4FF',
      icon: <span style={{ width: 6, height: 6, borderRadius: 99, background: '#06060A' }} />,
      label: 'IN PROGRESS',
      pctColor: '#00D4FF',
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

  return (
    <div
      className={`pressable ${skill.status === 'active' ? '' : ''}`}
      style={{
        padding: '10px 12px',
        borderRadius: 12,
        background: s.bg,
        border: `1px solid ${s.border}`,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        position: 'relative',
        opacity: skill.status === 'locked' ? 0.55 : 1,
      }}
    >
      <div className={skill.status === 'active' ? 'pulse-node' : ''} style={{
        width: 22, height: 22, borderRadius: 8,
        background: s.iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>{s.icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14, fontWeight: 600,
          color: skill.status === 'locked' ? 'var(--muted)' : 'var(--text)',
        }}>{skill.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
          <div style={{ flex: 1, height: 3 }}>
            <ProgressBar value={skill.pct} color={s.pctColor} height={3} />
          </div>
          <span className="mono" style={{ fontSize: 10, color: s.pctColor, minWidth: 32, textAlign: 'right' }}>
            {skill.pct}%
          </span>
        </div>
      </div>
    </div>
  );
}

// Collapsible skill tree section
function SkillTree({ discipline, expanded, onToggle }) {
  const skills = SKILLS[discipline.id];
  const done = skills.filter(s => s.status === 'done').length;
  const active = skills.filter(s => s.status === 'active').length;

  return (
    <div className="glass" style={{ borderRadius: 14, overflow: 'hidden' }}>
      <div
        className="pressable"
        onClick={onToggle}
        style={{
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div style={{
          width: 30, height: 30, borderRadius: 9,
          background: `${discipline.color}18`,
          border: `1px solid ${discipline.color}50`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: discipline.color,
          fontFamily: 'var(--font-mono)',
          fontWeight: 700,
          fontSize: 16,
          flexShrink: 0,
          boxShadow: `0 0 14px -4px ${discipline.color}`,
        }}>{discipline.icon}</div>

        <div style={{ flex: 1 }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 18,
              letterSpacing: '0.04em',
              color: 'var(--text)',
            }}>{discipline.name.toUpperCase()}</span>
            <span style={{
              transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
              transition: 'transform 240ms',
              color: 'var(--muted)',
            }}>
              <IconChevronDown size={16} />
            </span>
          </div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>
            {done}/{skills.length} MASTERED · {active} ACTIVE
          </div>
        </div>
      </div>

      {expanded && (
        <div style={{
          padding: '0 14px 14px',
          display: 'flex', flexDirection: 'column', gap: 8,
          animation: 'screenIn 320ms cubic-bezier(0.2,0.7,0.2,1)',
        }}>
          {skills.map((skill) => (
            <SkillNode key={skill.name} skill={skill} color={discipline.color} />
          ))}
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

  if (!open) return null;
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
    <>
      <div className="scrim" onClick={onClose} />
      <div className="sheet" style={{ maxHeight: '76%', overflowY: 'auto' }}>
        <div className="sheet-handle" />

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
                    background: duration === m ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${duration === m ? 'rgba(0,212,255,0.6)' : 'var(--line)'}`,
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
                color: '#06060A',
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
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────
// Training HQ screen
// ─────────────────────────────────────────────────────────
function TrainingHQ() {
  const [expanded, setExpanded] = useState({ tricking: true, calisthenics: true });
  const [logOpen, setLogOpen] = useState(false);
  const [sessions, setSessions] = usePersistentState('lifeos:sessions', []);
  const sessionCount = BASE_SESSIONS + sessions.length;
  const logSession = (s) => setSessions((list) => [s, ...list].slice(0, 200));

  return (
    <>
      <div className="screen-content" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* header */}
        <div className="hud glass-strong mesh-train" style={{
          padding: 16, borderRadius: 20,
        }}>
          <HUDTicks />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="eyebrow">Phase 03 · Cycle 2</div>
              <div className="display" style={{ fontSize: 30, marginTop: 2, lineHeight: 1 }}>
                EXPLOSIVE POWER
              </div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>
                DAY 47/90 · {sessionCount} SESSIONS LOGGED
              </div>
            </div>
            <Pill variant="cyan" dot="#00D4FF">ACTIVE</Pill>
          </div>

          <div style={{ marginTop: 14 }}>
            <ProgressBar value={52} color="var(--cyan)" height={5} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <span className="mono" style={{ fontSize: 9, color: 'var(--dim)' }}>DAY 1</span>
              <span className="mono" style={{ fontSize: 9, color: 'var(--cyan)' }}>52% · 43 DAYS LEFT</span>
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
            <div style={{ display: 'flex', gap: 10, fontSize: 9 }}>
              <div className="mono" style={{ color: 'var(--cyan)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 2, background: '#00D4FF' }} /> NOW
              </div>
              <div className="mono" style={{ color: 'var(--violet)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 2, background: '#B14CFF', borderTop: '1px dashed #B14CFF' }} /> GOAL
              </div>
            </div>
          </div>
          <BodyRadar size={260} />
        </div>

        {/* skill trees */}
        <div>
          <SectionHead eyebrow="6 disciplines · 23 skills" title="SKILL TREES" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {DISCIPLINES.map((d) => (
              <SkillTree
                key={d.id}
                discipline={d}
                expanded={!!expanded[d.id]}
                onToggle={() => setExpanded(e => ({ ...e, [d.id]: !e[d.id] }))}
              />
            ))}
          </div>
        </div>

        {/* CTA */}
        <div
          className="pressable"
          onClick={() => setLogOpen(true)}
          style={{
            height: 56,
            borderRadius: 16,
            background: 'linear-gradient(135deg, #00D4FF 0%, #B6FF3C 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 8,
            color: '#06060A',
            fontWeight: 800,
            fontSize: 14,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            boxShadow: '0 12px 36px -8px rgba(0,212,255,0.5)',
            marginTop: 4,
          }}
        >
          <IconActivity size={20} stroke={2.4} />
          Log Session
        </div>
      </div>

      <LogSessionSheet open={logOpen} onClose={() => setLogOpen(false)} onLog={logSession} />
    </>
  );
}

export { TrainingHQ, BodyRadar, SkillTree, SkillNode, LogSessionSheet };
