// Settings sheet — account, data export, and app info.
import { useState } from 'react';
import { IconClose, IconDownload, IconCheck } from './components/icons.jsx';
import { useAuth } from './auth/AuthProvider.jsx';

function exportData() {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith('lifeos:')) {
      try { data[k] = JSON.parse(localStorage.getItem(k)); } catch { /* skip */ }
    }
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `life-os-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const rowStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '14px 14px', borderRadius: 14,
  background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)',
};

export function Settings({ open, onClose }) {
  const { configured, session, signOut } = useAuth();
  const [exported, setExported] = useState(false);

  if (!open) return null;

  const email = session?.user?.email;

  const doExport = () => {
    exportData();
    setExported(true);
    setTimeout(() => setExported(false), 1800);
  };

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="sheet" style={{ maxHeight: '82%', overflowY: 'auto' }}>
        <div className="sheet-handle" />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <div className="eyebrow">Settings</div>
            <div className="display" style={{ fontSize: 26, marginTop: 2 }}>YOUR LIFE OS</div>
          </div>
          <div className="pressable" onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.06)', color: 'var(--muted)',
          }}><IconClose size={16} /></div>
        </div>

        {/* Account */}
        <div className="eyebrow" style={{ marginBottom: 8 }}>Account</div>
        {configured && session ? (
          <>
            <div style={{ ...rowStyle, marginBottom: 8 }}>
              <div style={{ minWidth: 0 }}>
                <div className="mono" style={{ fontSize: 9, color: 'var(--dim)', letterSpacing: '0.12em' }}>SIGNED IN AS</div>
                <div style={{ fontSize: 14, color: 'var(--text)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</div>
              </div>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--lime)', boxShadow: '0 0 8px var(--lime)', flexShrink: 0 }} />
            </div>
            <div className="pressable" onClick={signOut} style={{
              ...rowStyle, marginBottom: 18, justifyContent: 'center',
              border: '1px solid rgba(255,0,51,0.4)', background: 'rgba(255,0,51,0.08)',
            }}>
              <span className="mono" style={{ fontSize: 12, color: 'var(--ona-red)', letterSpacing: '0.14em', fontWeight: 700 }}>SIGN OUT</span>
            </div>
          </>
        ) : (
          <div style={{ ...rowStyle, marginBottom: 18 }}>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>Running offline — data saved on this device.</span>
          </div>
        )}

        {/* Data */}
        <div className="eyebrow" style={{ marginBottom: 8 }}>Your data</div>
        <div className="pressable" onClick={doExport} style={{ ...rowStyle, marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10, background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cyan)',
            }}>{exported ? <IconCheck size={16} color="#B6FF3C" stroke={2.6} /> : <IconDownload size={16} />}</div>
            <div>
              <div style={{ fontSize: 14, color: 'var(--text)' }}>{exported ? 'Backup downloaded' : 'Export my data'}</div>
              <div className="mono" style={{ fontSize: 9, color: 'var(--dim)', marginTop: 2, letterSpacing: '0.1em' }}>JSON BACKUP OF EVERYTHING</div>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="eyebrow" style={{ marginBottom: 8 }}>About</div>
        <div style={{ ...rowStyle, flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
          <div className="display" style={{ fontSize: 20, letterSpacing: '0.06em' }}>LIFE OS</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
            Move with purpose. Create with passion. Live in motion.
          </div>
          <div className="mono" style={{ fontSize: 9, color: 'var(--dim)', letterSpacing: '0.12em', marginTop: 2 }}>VERSION 1.0 · JAY MARTINEZ</div>
        </div>

        <div style={{ height: 12 }} />
      </div>
    </>
  );
}
