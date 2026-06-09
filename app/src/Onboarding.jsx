// First-run welcome — a considered first open that orients you to the
// five surfaces, then gets out of the way. Shown once (synced flag).
import { IconHome, IconBolt, IconBrain, IconSparkles, IconArrowRight } from './components/icons.jsx';

const HIGHLIGHTS = [
  { Icon: IconHome, color: '#00D4FF', title: 'Today', body: 'Your Chief of Staff briefs you each morning and hands you prefilled actions.' },
  { Icon: IconBolt, color: '#B6FF3C', title: 'Train', body: 'Skill trees, drills with gates, fundamentals, and a coach that hunts your blindspots.' },
  { Icon: IconBrain, color: '#FFD23C', title: 'Mind', body: 'Capture anything in seconds; triage it later. Nothing gets lost.' },
  { Icon: IconSparkles, color: '#B14CFF', title: 'Agents', body: 'Six specialists — Chief, Coach, Creative, ONA, Podium, Architect — on your data.' },
];

export function Onboarding({ onDone }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 300,
      background: 'radial-gradient(120% 90% at 50% 0%, #11111A 0%, #06060A 70%)',
      display: 'flex', flexDirection: 'column',
      padding: 'calc(env(safe-area-inset-top, 0px) + 8%) 24px calc(env(safe-area-inset-bottom, 0px) + 24px)',
      animation: 'screenFade 400ms ease',
      overflowY: 'auto',
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28 }}>
        <div style={{ position: 'relative', width: 72, height: 72, marginBottom: 16 }}>
          <div style={{ position: 'absolute', inset: -12, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,255,0.35) 0%, transparent 65%)' }} />
          <div className="orb-spin" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'conic-gradient(from 0deg, #00D4FF, #B14CFF, #00D4FF)', WebkitMask: 'radial-gradient(circle, transparent 60%, #000 62%)', mask: 'radial-gradient(circle, transparent 60%, #000 62%)' }} />
          <div style={{ position: 'absolute', inset: '34%', borderRadius: '50%', background: '#00D4FF', boxShadow: '0 0 20px rgba(0,212,255,0.7)' }} />
        </div>
        <div className="eyebrow" style={{ color: 'var(--muted)' }}>Welcome to</div>
        <div className="display" style={{ fontSize: 40, lineHeight: 1, marginTop: 4, background: 'linear-gradient(90deg, #00D4FF, #B14CFF, #FF3CC8)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>LIFE OS</div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 10, textAlign: 'center', lineHeight: 1.5, maxWidth: 280 }}>
          The operating system for an extraordinary life — your second brain, coach, and chief of staff in one.
        </div>
      </div>

      {/* Highlights */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {HIGHLIGHTS.map((h, i) => (
          <div key={i} className="hud glass" style={{ padding: 14, borderRadius: 16, display: 'flex', gap: 12, alignItems: 'center', animation: `cardIn 520ms cubic-bezier(0.2,0.7,0.2,1) both`, animationDelay: `${120 + i * 80}ms` }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, background: `${h.color}1a`, border: `1px solid ${h.color}55`, color: h.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <h.Icon size={20} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{h.title}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.4, marginTop: 2 }}>{h.body}</div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="pressable" onClick={onDone} style={{
        marginTop: 22, height: 54, borderRadius: 16,
        background: 'linear-gradient(135deg, #00D4FF 0%, #B14CFF 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        color: '#06060A', fontWeight: 800, fontSize: 15, letterSpacing: '0.12em', textTransform: 'uppercase',
        boxShadow: '0 14px 40px -12px rgba(0,212,255,0.6)',
      }}>
        Let's build <IconArrowRight size={19} stroke={2.4} />
      </div>
      <div className="eyebrow" style={{ textAlign: 'center', marginTop: 12, color: 'var(--dim)' }}>Capture with the + button from anywhere</div>
    </div>
  );
}
