// ─────────────────────────────────────────────────────────
// SCREEN 1 — Mission Control
// ─────────────────────────────────────────────────────────

function ReadinessHero({ readiness, energy, focus, body, mood, onMeter }) {
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
        <span className="eyebrow">{TODAY.date}</span>
        <span className="mono" style={{
          fontSize: 9, color: 'var(--cyan)',
          padding: '3px 8px',
          border: '1px solid rgba(0,212,255,0.3)',
          borderRadius: 999,
          letterSpacing: '0.18em',
        }}>SYS · ONLINE</span>
      </div>

      <div style={{
        fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em',
        marginTop: 2, marginBottom: 14,
      }}>{TODAY.greeting}</div>

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
            fontSize: 10, color: 'var(--lime)', marginTop: 6,
            letterSpacing: '0.1em',
          }}>
            ▲ +6 vs 7-day avg
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
        <span className="display" style={{ fontSize: 14, color: 'var(--text)', marginTop: -2 }}>OPTIMAL</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// One Thing card
// ─────────────────────────────────────────────────────────
function OneThingCard({ done, onMark, onConfetti }) {
  const confettiTrigger = useRef(0);
  const [trigger, setTrigger] = useState(0);

  const handle = () => {
    if (done) return;
    setTrigger((t) => t + 1);
    onConfetti?.();
    setTimeout(() => onMark(), 80);
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
        <span className="mono" style={{ fontSize: 10, color: 'var(--muted)' }}>
          {done ? 'DONE · 06:42' : 'PRIORITY · P0'}
        </span>
      </div>

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
        <div style={{
          flex: 1,
          fontSize: 17, lineHeight: 1.25, fontWeight: 600,
          color: 'var(--text)',
          textDecoration: done ? 'line-through' : 'none',
          opacity: done ? 0.55 : 1,
          textWrap: 'pretty',
        }}>{TODAY.oneThing}</div>
      </div>

      {!done && (
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
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Momentum heatmap (14 days)
// ─────────────────────────────────────────────────────────
function MomentumStrip() {
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
            <span className="display" style={{ fontSize: 26, color: 'var(--gold)' }}>{TODAY.streak}</span>
            <span className="mono" style={{ fontSize: 10, color: 'var(--muted)' }}>DAY STREAK</span>
          </div>
        </div>
        <div className="mono" style={{ fontSize: 10, color: 'var(--dim)' }}>14d</div>
      </div>

      <div style={{ display: 'flex', gap: 4 }}>
        {MOMENTUM.map((v, i) => {
          const intensity = v / 4;
          const isToday = i === MOMENTUM.length - 1;
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
// Today's Timeline
// ─────────────────────────────────────────────────────────
function TodayTimeline() {
  return (
    <div className="hud glass" style={{ padding: 16, borderRadius: 16 }}>
      <HUDTicks />
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 14,
      }}>
        <div>
          <div className="eyebrow">Today · Timeline</div>
          <div className="section-title" style={{ fontSize: 22, marginTop: 2 }}>
            {TIMELINE.length} BLOCKS
          </div>
        </div>
        <IconCalendar size={18} color="var(--muted)" />
      </div>

      <div>
        {TIMELINE.map((e, i) => (
          <TimelineEvent
            key={i}
            time={e.time}
            label={e.label}
            color={e.color}
            kind={e.kind}
            last={i === TIMELINE.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Mission Control screen
// ─────────────────────────────────────────────────────────
function MissionControl({ state, setState }) {
  const setMeter = (k, v) => setState((s) => ({ ...s, [k]: v }));
  const markDone = () => setState((s) => ({ ...s, oneThingDone: true }));

  return (
    <div className="screen-content" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <ReadinessHero
        readiness={state.readiness}
        energy={state.energy}
        focus={state.focus}
        body={state.body}
        mood={state.mood}
        onMeter={setMeter}
      />
      <OneThingCard done={state.oneThingDone} onMark={markDone} />
      <MomentumStrip />
      <TodayTimeline />
    </div>
  );
}

Object.assign(window, { MissionControl });
