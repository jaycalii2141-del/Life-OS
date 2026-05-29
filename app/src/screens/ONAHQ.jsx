import { HUDTicks, TickCounter, Pill, ProgressBar } from '../components/atoms.jsx';
import { IconWarn } from '../components/icons.jsx';
import { ONA_STATS, SALES_STAGES, COACHES, BENCH, INITIATIVES } from '../data.js';

// ─────────────────────────────────────────────────────────
// SCREEN 4 — ONA HQ
// ─────────────────────────────────────────────────────────

// Big stat (Members, MRR, NPS)
function ONAStat({ label, value, prefix, suffix, color, trend }) {
  const fmt = (v) => {
    if (typeof v !== 'number') return v;
    if (v >= 1000) return Math.round(v).toLocaleString();
    return Math.round(v);
  };
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div className="eyebrow" style={{ marginBottom: 4 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
        {prefix && <span className="display" style={{ fontSize: 16, color: color, opacity: 0.7 }}>{prefix}</span>}
        <span className="display" style={{ fontSize: 30, color: color, lineHeight: 0.9 }}>
          <TickCounter value={value} format={fmt} />
        </span>
        {suffix && <span className="mono" style={{ fontSize: 10, color: 'var(--muted)', marginLeft: 2 }}>{suffix}</span>}
      </div>
      {trend && (
        <div className="mono" style={{ fontSize: 9, color: 'var(--lime)', marginTop: 4, letterSpacing: '0.1em' }}>
          {trend}
        </div>
      )}
    </div>
  );
}

// Sales pipeline
function SalesPipeline() {
  return (
    <div className="hud glass" style={{ padding: 14, borderRadius: 16 }}>
      <HUDTicks />
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div className="eyebrow">Sales Pipeline</div>
          <div className="section-title" style={{ fontSize: 22, marginTop: 2 }}>FUNNEL</div>
        </div>
        <Pill variant="red">⚠ 7 STALE</Pill>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {SALES_STAGES.map((stage) => (
          <div key={stage.id} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <div style={{
              minWidth: 50,
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.14em',
              color: 'var(--muted)',
              fontWeight: 700,
              textTransform: 'uppercase',
            }}>{stage.label}</div>

            <div style={{
              flex: 1,
              height: 28,
              background: 'rgba(255,255,255,0.04)',
              borderRadius: 8,
              border: '1px solid var(--line)',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute',
                left: 0, top: 0, bottom: 0,
                width: `${Math.min(100, (stage.count / 30) * 100)}%`,
                background: `linear-gradient(90deg, ${stage.color}30, ${stage.color}10)`,
                borderRight: `2px solid ${stage.color}`,
                boxShadow: `inset 0 0 12px ${stage.color}40`,
                transition: 'width 1000ms cubic-bezier(0.2,0.7,0.2,1)',
              }} />
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                padding: '0 10px',
                gap: 6,
              }}>
                <span className="display" style={{ fontSize: 16, color: stage.color, lineHeight: 1 }}>
                  <TickCounter value={stage.count} />
                </span>
                {stage.stale > 0 && (
                  <span className="mono blink" style={{
                    fontSize: 9,
                    color: 'var(--ona-red)',
                    fontWeight: 700,
                    marginLeft: 'auto',
                    display: 'flex', alignItems: 'center', gap: 3,
                  }}>
                    <IconWarn size={11} />
                    {stage.stale} STALE
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="eyebrow" style={{ marginTop: 10, color: 'var(--dim)' }}>
        ⚠ stale = lead untouched 48h+
      </div>
    </div>
  );
}

// Coach avatar
function CoachAvatar({ coach, size = 36 }) {
  return (
    <div style={{
      width: size, height: size,
      borderRadius: size,
      background: `linear-gradient(135deg, ${coach.color}, ${coach.color}50)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#06060A',
      fontWeight: 800,
      fontSize: size * 0.42,
      flexShrink: 0,
      border: '1px solid rgba(255,255,255,0.15)',
      boxShadow: `0 0 14px -4px ${coach.color}`,
    }}>{coach.initial}</div>
  );
}

// Coach roster
function CoachRoster() {
  const gradeColor = (g) => {
    if (g.startsWith('A')) return '#B6FF3C';
    if (g.startsWith('B')) return '#FFD23C';
    return '#FF8A3C';
  };

  return (
    <div className="hud glass" style={{ padding: 14, borderRadius: 16 }}>
      <HUDTicks />
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div className="eyebrow">Roster · {COACHES.length} active · {BENCH.length} bench</div>
          <div className="section-title" style={{ fontSize: 22, marginTop: 2 }}>COACHES</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {COACHES.map((c) => (
          <div
            key={c.id}
            className="pressable"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 12px',
              borderRadius: 12,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--line)',
            }}
          >
            <CoachAvatar coach={c} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontWeight: 600, fontSize: 14,
                color: 'var(--text)',
                letterSpacing: '-0.01em',
              }}>{c.name}</div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>
                {c.role.toUpperCase()}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="mono" style={{ fontSize: 11, color: 'var(--text)', fontWeight: 600 }}>
                ${c.plPrice}/hr
              </div>
              <div className="mono" style={{
                fontSize: 9,
                color: 'var(--dim)',
                marginTop: 1,
              }}>PRIVATE LESSON</div>
            </div>
            <div style={{
              width: 30, height: 30,
              borderRadius: 8,
              border: `1.5px solid ${gradeColor(c.grade)}`,
              background: `${gradeColor(c.grade)}18`,
              color: gradeColor(c.grade),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)',
              fontSize: 14,
              fontWeight: 700,
              boxShadow: `0 0 10px -3px ${gradeColor(c.grade)}`,
            }}>{c.grade}</div>
          </div>
        ))}
      </div>

      {/* bench */}
      <div style={{
        marginTop: 12,
        padding: 10,
        borderRadius: 12,
        background: 'rgba(255,255,255,0.02)',
        border: '1px dashed rgba(255,255,255,0.08)',
      }}>
        <div className="eyebrow" style={{ marginBottom: 8, color: 'var(--dim)' }}>Bench · backup</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {BENCH.map((b) => (
            <div key={b.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
              <CoachAvatar coach={b} size={32} />
              <span className="mono" style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.08em' }}>
                {b.name.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Initiatives
function InitiativeList() {
  const priColor = { P0: '#FF0033', P1: '#FFD23C', P2: '#00D4FF' };
  const priBg    = { P0: 'rgba(255,0,51,0.12)', P1: 'rgba(255,210,60,0.12)', P2: 'rgba(0,212,255,0.12)' };

  return (
    <div className="hud glass" style={{ padding: 14, borderRadius: 16 }}>
      <HUDTicks />
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div className="eyebrow">Initiatives · Q2 active</div>
          <div className="section-title" style={{ fontSize: 22, marginTop: 2 }}>WHAT MOVES</div>
        </div>
        <Pill variant="red">2 · P0</Pill>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {INITIATIVES.map((it) => (
          <div
            key={it.id}
            className="pressable"
            style={{
              padding: '12px',
              borderRadius: 12,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--line)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
            }}
          >
            <span style={{
              padding: '3px 7px',
              borderRadius: 6,
              background: priBg[it.priority],
              color: priColor[it.priority],
              border: `1px solid ${priColor[it.priority]}50`,
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: '0.06em',
              boxShadow: `0 0 8px -3px ${priColor[it.priority]}`,
              flexShrink: 0,
              marginTop: 1,
            }}>{it.priority}</span>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 13, fontWeight: 600,
                color: 'var(--text)',
                textWrap: 'pretty',
                lineHeight: 1.3,
              }}>{it.title}</div>

              <div style={{
                marginTop: 8,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <div style={{ flex: 1 }}>
                  <ProgressBar value={it.pct} color={priColor[it.priority]} height={3} />
                </div>
                <span className="mono" style={{ fontSize: 9, color: 'var(--muted)' }}>{it.pct}%</span>
              </div>

              <div className="mono" style={{ fontSize: 9, color: 'var(--dim)', marginTop: 6 }}>
                DUE {it.due.toUpperCase()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// ONA HQ screen
// ─────────────────────────────────────────────────────────
function ONAHQ() {
  return (
    <div className="screen-content" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* hero */}
      <div className="hud glass-strong mesh-ona" style={{ padding: 18, borderRadius: 20 }}>
        <HUDTicks />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <div className="eyebrow">Obstacle Ninja Academy · Orlando</div>
            <div className="display" style={{ fontSize: 30, marginTop: 2, lineHeight: 1, color: 'var(--ona-red)' }}>
              ONA · HQ
            </div>
          </div>
          <Pill variant="red" dot="#FF0033">LIVE</Pill>
        </div>

        <div style={{ display: 'flex', gap: 14 }}>
          <ONAStat label="Members" value={ONA_STATS.members} color="var(--text)" trend="▲ +12 MTD" />
          <ONAStat label="MRR" value={ONA_STATS.mrr} prefix="$" color="var(--lime)" trend="▲ +8.4%" />
          <ONAStat label="NPS" value={ONA_STATS.nps} color="var(--cyan)" trend="▲ +4 pts" />
        </div>
      </div>

      <SalesPipeline />
      <CoachRoster />
      <InitiativeList />
    </div>
  );
}

export { ONAHQ, SalesPipeline, CoachRoster, InitiativeList };
