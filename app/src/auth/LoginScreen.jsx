// ─────────────────────────────────────────────────────────
// Magic-link login — single screen, matches the dark HUD aesthetic.
// ─────────────────────────────────────────────────────────
import { useState } from 'react';
import { IOSDevice } from '../components/IOSDevice.jsx';
import { HUDTicks } from '../components/atoms.jsx';
import { IconSparkles, IconSend, IconCheck } from '../components/icons.jsx';
import { useAuth } from './AuthProvider.jsx';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [error, setError] = useState('');

  const submit = async () => {
    const value = email.trim();
    if (!value || status === 'sending') return;
    setStatus('sending');
    setError('');
    const { error: err } = await signIn(value);
    if (err) {
      setStatus('error');
      setError(err.message || 'Something went wrong. Try again.');
    } else {
      setStatus('sent');
    }
  };

  return (
    <IOSDevice dark width={402} height={874}>
      <div style={{
        position: 'absolute', inset: 0, background: 'var(--bg-0)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '0 28px',
      }}>
        <div className="hud glass-strong mesh-ai" style={{
          width: '100%', padding: '28px 22px', borderRadius: 24,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          <HUDTicks />

          <div style={{
            width: 64, height: 64, borderRadius: 20,
            background: 'radial-gradient(circle at 30% 30%, #fff 0%, #00D4FF 35%, #B14CFF 80%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 40px -6px rgba(0,212,255,0.6)', marginBottom: 16,
          }}>
            <IconSparkles size={30} color="#fff" stroke={1.8} />
          </div>

          <div className="display" style={{
            fontSize: 34, letterSpacing: '0.04em', lineHeight: 1, textAlign: 'center',
          }}>LIFE OS</div>
          <div className="mono" style={{
            fontSize: 10, color: 'var(--muted)', letterSpacing: '0.2em', marginTop: 8, textAlign: 'center',
          }}>MOVE WITH PURPOSE</div>

          {status === 'sent' ? (
            <div style={{
              marginTop: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: 999,
                background: 'rgba(182,255,60,0.15)', border: '1px solid rgba(182,255,60,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 40px -10px rgba(182,255,60,0.6)',
              }}>
                <IconCheck size={28} color="#B6FF3C" stroke={2.5} />
              </div>
              <div className="display" style={{ fontSize: 22, color: 'var(--lime)' }}>CHECK YOUR EMAIL</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', lineHeight: 1.4 }}>
                We sent a magic link to<br /><span style={{ color: 'var(--text)' }}>{email.trim()}</span>.
                Tap it to sign in.
              </div>
              <span
                className="pressable mono"
                onClick={() => setStatus('idle')}
                style={{ fontSize: 10, color: 'var(--cyan)', letterSpacing: '0.14em', marginTop: 4 }}
              >USE A DIFFERENT EMAIL</span>
            </div>
          ) : (
            <div style={{ width: '100%', marginTop: 28 }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Your email</div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
                placeholder="you@example.com"
                autoFocus
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(0,212,255,0.35)', borderRadius: 14,
                  padding: '13px 14px', color: 'var(--text)', fontSize: 16,
                  fontFamily: 'var(--font-body)', outline: 'none',
                  boxShadow: '0 0 30px -10px rgba(0,212,255,0.4)',
                }}
              />

              {status === 'error' && (
                <div className="mono" style={{ fontSize: 11, color: 'var(--ona-red)', marginTop: 8 }}>
                  {error}
                </div>
              )}

              <div
                className="pressable"
                onClick={submit}
                style={{
                  marginTop: 14, height: 50, borderRadius: 14,
                  background: 'linear-gradient(135deg, #00D4FF 0%, #B14CFF 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  color: '#06060A', fontWeight: 700, fontSize: 14,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  opacity: status === 'sending' ? 0.6 : 1,
                  boxShadow: '0 10px 30px -8px rgba(0,212,255,0.5)',
                }}
              >
                <IconSend size={17} stroke={2.2} />
                {status === 'sending' ? 'Sending…' : 'Send Magic Link'}
              </div>

              <div className="eyebrow" style={{ textAlign: 'center', marginTop: 14, color: 'var(--dim)' }}>
                No password. We email you a one-tap sign-in link.
              </div>
            </div>
          )}
        </div>
      </div>
    </IOSDevice>
  );
}
