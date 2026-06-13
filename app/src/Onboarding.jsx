// First-run welcome — a considered first open that orients you to the
// four surfaces + the Intelligence, then gets out of the way.
import { IconTarget, IconBolt, IconBrain, IconSparkles, IconArrowRight, IconTrendUp } from './components/icons.jsx';

const HIGHLIGHTS = [
  { Icon: IconTarget, color: '#45B7E8', title: 'Command', body: 'The cockpit. Your daily mission, alignment score, missions, and wins — what matters today.' },
  { Icon: IconBrain, color: '#E9C46A', title: 'Map', body: 'A living map of 8 life domains — health, relationships, learning, adventure — each scored from real activity.' },
  { Icon: IconBolt, color: '#34D399', title: 'Move', body: 'The Movement OS: identity meters, the movement pyramid, and mastery roadmaps toward world-class.' },
  { Icon: IconTrendUp, color: '#FF6B5B', title: 'Build', body: 'ONA, Podium, and the Creator Studio — with an Action Center that turns metrics into moves.' },
  { Icon: IconSparkles, color: '#2DD4BF', title: 'Intelligence', body: 'One AI partner, many hats — open it anywhere with the orb, talk to it hands-free.' },
];

export function Onboarding({ onDone }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 300,
      background: 'radial-gradient(120% 90% at 50% 0%, #16191C 0%, #0A0B0D 70%)',
      display: 'flex', flexDirection: 'column',
      padding: 'calc(env(safe-area-inset-top, 0px) + 8%) 24px calc(env(safe-area-inset-bottom, 0px) + 24px)',
      animation: 'screenFade 400ms ease',
      overflowY: 'auto',
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28 }}>
        <div style={{ position: 'relative', width: 72, height: 72, marginBottom: 16 }}>
          <div style={{ position: 'absolute', inset: -12, borderRadius: '50%', background: 'radial-gradient(circle, rgba(69,183,232,0.35) 0%, transparent 65%)' }} />
          <div className="orb-spin" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'conic-gradient(from 0deg, #45B7E8, #2DD4BF, #45B7E8)', WebkitMask: 'radial-gradient(circle, transparent 60%, #000 62%)', mask: 'radial-gradient(circle, transparent 60%, #000 62%)' }} />
          <div style={{ position: 'absolute', inset: '34%', borderRadius: '50%', background: '#45B7E8', boxShadow: '0 0 20px rgba(69,183,232,0.7)' }} />
        </div>
        <div className="eyebrow" style={{ color: 'var(--muted)' }}>Welcome to</div>
        <div className="display" style={{ fontSize: 40, lineHeight: 1, marginTop: 4, background: 'linear-gradient(90deg, #45B7E8, #2DD4BF, #FF8A4C)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>JAM HQ</div>
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
        background: 'linear-gradient(135deg, #45B7E8 0%, #2DD4BF 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        color: '#0A0B0D', fontWeight: 800, fontSize: 15, letterSpacing: '0.12em', textTransform: 'uppercase',
        boxShadow: '0 14px 40px -12px rgba(69,183,232,0.6)',
      }}>
        Let's build <IconArrowRight size={19} stroke={2.4} />
      </div>
      <div className="eyebrow" style={{ textAlign: 'center', marginTop: 12, color: 'var(--dim)' }}>Capture with the + button from anywhere</div>
    </div>
  );
}
