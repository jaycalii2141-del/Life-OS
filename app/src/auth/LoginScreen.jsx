// ─────────────────────────────────────────────────────────
// Email + password login — sign in or create an account.
// Matches the dark HUD aesthetic.
// ─────────────────────────────────────────────────────────
import { useState } from 'react';
import { IOSDevice } from '../components/IOSDevice.jsx';
import { HUDTicks } from '../components/atoms.jsx';
import { IconSparkles, IconArrowRight } from '../components/icons.jsx';
import { useAuth } from './AuthProvider.jsx';

export default function LoginScreen() {
  const { signInWithPassword, signUp } = useAuth();
  const [mode, setMode] = useState('signin'); // signin | signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const isSignup = mode === 'signup';

  const submit = async () => {
    const e = email.trim();
    const p = password;
    if (!e || !p || busy) return;
    setBusy(true);
    setError('');
    setNotice('');

    const fn = isSignup ? signUp : signInWithPassword;
    const { data, error: err } = await fn(e, p);

    if (err) {
      setError(err.message || 'Something went wrong. Try again.');
      setBusy(false);
      return;
    }
    // If sign-up returns a user but no session, email confirmation is still on.
    if (isSignup && data?.user && !data?.session) {
      setNotice('Account created. Confirm email is still ON in Supabase — turn it off, or check your inbox to confirm.');
      setBusy(false);
      return;
    }
    // Success: onAuthStateChange will swap to the app. Leave busy=true.
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
            background: 'radial-gradient(circle at 30% 30%, #fff 0%, #45B7E8 35%, #2DD4BF 80%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 40px -6px rgba(69,183,232,0.6)', marginBottom: 16,
          }}>
            <IconSparkles size={30} color="#fff" stroke={1.8} />
          </div>

          <div className="display" style={{ fontSize: 34, letterSpacing: '0.04em', lineHeight: 1, textAlign: 'center' }}>
            JAM HQ
          </div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.2em', marginTop: 8 }}>
            {isSignup ? 'CREATE YOUR ACCOUNT' : 'WELCOME BACK'}
          </div>

          <div style={{ width: '100%', marginTop: 24 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Email</div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoFocus
              style={inputStyle}
            />

            <div className="eyebrow" style={{ marginTop: 14, marginBottom: 8 }}>Password</div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              placeholder={isSignup ? 'At least 6 characters' : 'Your password'}
              style={inputStyle}
            />

            {error && (
              <div className="mono" style={{ fontSize: 11, color: 'var(--ona-red)', marginTop: 10, lineHeight: 1.4 }}>
                {error}
              </div>
            )}
            {notice && (
              <div className="mono" style={{ fontSize: 11, color: 'var(--gold)', marginTop: 10, lineHeight: 1.4 }}>
                {notice}
              </div>
            )}

            <div
              className="pressable"
              onClick={submit}
              style={{
                marginTop: 16, height: 50, borderRadius: 14,
                background: 'linear-gradient(135deg, #45B7E8 0%, #2DD4BF 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                color: '#0A0B0D', fontWeight: 700, fontSize: 14,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                opacity: busy ? 0.6 : 1,
                boxShadow: '0 10px 30px -8px rgba(69,183,232,0.5)',
              }}
            >
              {busy ? 'Working…' : (isSignup ? 'Create Account' : 'Sign In')}
              {!busy && <IconArrowRight size={17} stroke={2.2} />}
            </div>

            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>
                {isSignup ? 'Already have an account? ' : 'New here? '}
              </span>
              <span
                className="pressable mono"
                onClick={() => { setMode(isSignup ? 'signin' : 'signup'); setError(''); setNotice(''); }}
                style={{ fontSize: 11, color: 'var(--cyan)', letterSpacing: '0.08em' }}
              >
                {isSignup ? 'SIGN IN' : 'CREATE ONE'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </IOSDevice>
  );
}

const inputStyle = {
  width: '100%', background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(69,183,232,0.35)', borderRadius: 14,
  padding: '13px 14px', color: 'var(--text)', fontSize: 16,
  fontFamily: 'var(--font-body)', outline: 'none',
  boxShadow: '0 0 30px -10px rgba(69,183,232,0.4)',
  boxSizing: 'border-box',
};
