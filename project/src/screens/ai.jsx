// ─────────────────────────────────────────────────────────
// SCREEN 5 — AI Command Sheet
// (The "5th tab" — JARVIS-style assistant orb + commands)
// ─────────────────────────────────────────────────────────

// Spinning conic-gradient AI orb
function AIOrb({ size = 140, listening = false }) {
  return (
    <div style={{
      position: 'relative',
      width: size, height: size,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      {/* outer glow */}
      <div style={{
        position: 'absolute',
        inset: -20,
        background: 'radial-gradient(circle, rgba(177,76,255,0.35) 0%, transparent 60%)',
        filter: 'blur(8px)',
      }} className={listening ? 'glow-pulse-red' : ''} />

      {/* outer ring (slow spin) */}
      <div className="orb-spin" style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        background: 'conic-gradient(from 0deg, #00D4FF, #B14CFF, #FF3CC8, #FFD23C, #00D4FF)',
        WebkitMask: 'radial-gradient(circle, transparent 60%, #000 62%, #000 75%, transparent 76%)',
                mask: 'radial-gradient(circle, transparent 60%, #000 62%, #000 75%, transparent 76%)',
      }} />

      {/* mid ring (counter-spin) */}
      <div className="orb-spin-fast" style={{
        position: 'absolute',
        inset: '15%',
        borderRadius: '50%',
        background: 'conic-gradient(from 90deg, transparent 0deg, #00D4FF 30deg, transparent 60deg, transparent 180deg, #B14CFF 210deg, transparent 240deg)',
        WebkitMask: 'radial-gradient(circle, transparent 50%, #000 52%, #000 90%, transparent 92%)',
                mask: 'radial-gradient(circle, transparent 50%, #000 52%, #000 90%, transparent 92%)',
      }} />

      {/* core */}
      <div style={{
        position: 'absolute',
        inset: '30%',
        borderRadius: '50%',
        background: 'radial-gradient(circle at 30% 30%, #fff 0%, #00D4FF 30%, #B14CFF 70%, #06060A 100%)',
        boxShadow: '0 0 30px rgba(0, 212, 255, 0.6), inset 0 0 14px rgba(255,255,255,0.4)',
      }} />

      {/* center sparkle */}
      <IconSparkles size={size * 0.18} color="#fff" stroke={1.8} style={{
        position: 'relative',
        zIndex: 2,
        filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.8))',
      }} />
    </div>
  );
}

// Predefined commands
const AI_COMMANDS = [
  { id: 'plan',   label: 'Plan my day',          icon: IconCalendar, color: '#00D4FF' },
  { id: 'shoot',  label: 'Generate shot list',   icon: IconCamera,   color: '#FF3CC8' },
  { id: 'recov',  label: 'Am I recovered?',      icon: IconActivity, color: '#B6FF3C' },
  { id: 'hook',   label: 'Write me a hook',      icon: IconFlame,    color: '#FF8A3C' },
  { id: 'review', label: 'Coach review (Riley)', icon: IconUsers,    color: '#FFD23C' },
  { id: 'pulse',  label: 'ONA pulse check',      icon: IconTarget,   color: '#FF0033' },
];

const RECENT = [
  { time: '06:14', text: 'Drafted 3 hooks for B-twist breakdown.',  tone: '#FF3CC8' },
  { time: '05:58', text: 'Logged 7h sleep · readiness +6.',          tone: '#00D4FF' },
  { time: 'Y · 22:40', text: 'Re-scheduled Riley 1:1 to Thu 13:00.', tone: '#B6FF3C' },
];

function AIScreen() {
  const [input, setInput] = useState('');
  const [listening, setListening] = useState(false);

  return (
    <div className="screen-content" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* hero with orb */}
      <div className="hud glass-strong mesh-ai" style={{
        padding: '22px 18px',
        borderRadius: 22,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <HUDTicks />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 14 }}>
          <Pill variant="violet" dot="#B14CFF">CLAUDE · 3.7</Pill>
          <span className="mono" style={{ fontSize: 9, color: 'var(--lime)', letterSpacing: '0.18em' }}>
            ● ONLINE
          </span>
        </div>

        <AIOrb size={140} listening={listening} />

        <div className="display" style={{
          fontSize: 28, marginTop: 16,
          background: 'linear-gradient(90deg, #00D4FF, #B14CFF, #FF3CC8)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
        }}>
          HOW CAN I MOVE YOU?
        </div>
        <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4, letterSpacing: '0.16em' }}>
          ASK · DECIDE · ROUTE
        </div>

        {/* input */}
        <div style={{
          width: '100%', marginTop: 18,
          display: 'flex', gap: 8,
        }}>
          <div style={{
            flex: 1,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(177,76,255,0.35)',
            borderRadius: 14,
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 0 30px -8px rgba(177,76,255,0.4)',
          }}>
            <IconSparkles size={16} color="var(--violet)" />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Claude anything…"
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none', outline: 'none',
                color: 'var(--text)',
                fontSize: 14,
                fontFamily: 'var(--font-body)',
              }}
            />
          </div>
          <div
            className="pressable"
            onClick={() => setListening((l) => !l)}
            style={{
              width: 48,
              borderRadius: 14,
              background: listening ? 'rgba(255,0,51,0.18)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${listening ? 'rgba(255,0,51,0.5)' : 'var(--line-strong)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: listening ? 'var(--ona-red)' : 'var(--text)',
            }}
          >
            <IconMic size={20} className={listening ? 'blink' : ''} />
          </div>
        </div>
      </div>

      {/* Quick commands */}
      <div>
        <SectionHead eyebrow="Tap a command" title="QUICK ACTIONS" />
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 8,
        }}>
          {AI_COMMANDS.map((cmd) => (
            <div
              key={cmd.id}
              className="pressable hud"
              style={{
                padding: '12px 12px',
                borderRadius: 14,
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${cmd.color}30`,
                display: 'flex', alignItems: 'center', gap: 10,
                position: 'relative',
                boxShadow: `0 0 16px -8px ${cmd.color}`,
              }}
            >
              <HUDTicks />
              <div style={{
                width: 32, height: 32,
                borderRadius: 10,
                background: `${cmd.color}18`,
                border: `1px solid ${cmd.color}50`,
                color: cmd.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <cmd.icon size={16} />
              </div>
              <span style={{
                fontSize: 12,
                color: 'var(--text)',
                fontWeight: 600,
                lineHeight: 1.2,
              }}>{cmd.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent */}
      <div className="hud glass" style={{ padding: 14, borderRadius: 16 }}>
        <HUDTicks />
        <div style={{ marginBottom: 12 }}>
          <div className="eyebrow">Recent · auto-routed</div>
          <div className="section-title" style={{ fontSize: 20, marginTop: 2 }}>HISTORY</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {RECENT.map((r, i) => (
            <div key={i} style={{
              display: 'flex',
              gap: 10,
              alignItems: 'flex-start',
              padding: '8px 10px',
              borderRadius: 10,
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--line)',
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: 999,
                background: r.tone,
                boxShadow: `0 0 8px ${r.tone}`,
                marginTop: 6,
                flexShrink: 0,
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.3 }}>{r.text}</div>
                <div className="mono" style={{ fontSize: 9, color: 'var(--dim)', marginTop: 3, letterSpacing: '0.1em' }}>
                  {r.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="eyebrow" style={{ textAlign: 'center', color: 'var(--dim)' }}>
        Claude routes captures, scores readiness, generates hooks, runs ONA pulse checks.
      </div>
    </div>
  );
}

Object.assign(window, { AIScreen, AIOrb });
