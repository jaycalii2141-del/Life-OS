// Settings sheet — account, data export, and app info.
import { useState } from 'react';
import { IconClose, IconDownload, IconCheck } from './components/icons.jsx';
import { useAuth } from './auth/AuthProvider.jsx';
import { Sheet } from './components/Sheet.jsx';

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

export function Settings({ open, onClose, icalUrl, onSetIcal, vibe = 'calm', onSetVibe }) {
  const { configured, session, signOut } = useAuth();
  const [exported, setExported] = useState(false);
  const [cal, setCal] = useState(icalUrl || '');

  const email = session?.user?.email;

  const doExport = () => {
    exportData();
    setExported(true);
    setTimeout(() => setExported(false), 1800);
  };

  return (
    <Sheet open={open} onClose={onClose} maxHeight="82%">

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <div className="eyebrow">Settings</div>
            <div className="display" style={{ fontSize: 26, marginTop: 2 }}>YOUR HEADQUARTERS</div>
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
              border: '1px solid rgba(255,107,91,0.4)', background: 'rgba(255,107,91,0.08)',
            }}>
              <span className="mono" style={{ fontSize: 12, color: 'var(--ona-red)', letterSpacing: '0.14em', fontWeight: 700 }}>SIGN OUT</span>
            </div>
          </>
        ) : (
          <div style={{ ...rowStyle, marginBottom: 18 }}>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>Running offline — data saved on this device.</span>
          </div>
        )}

        {/* Visual system */}
        <div className="eyebrow" style={{ marginBottom: 8 }}>Visual system</div>
        <div style={{ ...rowStyle, marginBottom: 18 }}>
          <div style={{ minWidth: 0, paddingRight: 10 }}>
            <div style={{ fontSize: 14, color: 'var(--text)' }}>{vibe === 'glow' ? 'Glow' : 'Calm'}</div>
            <div className="mono" style={{ fontSize: 9, color: 'var(--dim)', marginTop: 2, letterSpacing: '0.08em' }}>
              {vibe === 'glow' ? 'FULL COMMAND-CENTER ENERGY' : 'QUIET FOCUS · LESS NOISE, MORE SIGNAL'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            {[{ id: 'calm', label: 'CALM' }, { id: 'glow', label: 'GLOW' }].map((v) => {
              const on = vibe === v.id;
              return (
                <div key={v.id} className="pressable" onClick={() => onSetVibe?.(v.id)} style={{
                  padding: '7px 13px', borderRadius: 999,
                  background: on ? 'rgba(69,183,232,0.14)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${on ? 'rgba(69,183,232,0.55)' : 'var(--line)'}`,
                  color: on ? 'var(--cyan)' : 'var(--muted)',
                  fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
                }}>{v.label}</div>
              );
            })}
          </div>
        </div>

        {/* Calendar */}
        <div className="eyebrow" style={{ marginBottom: 8 }}>Google Calendar</div>
        <div style={{ ...rowStyle, flexDirection: 'column', alignItems: 'stretch', gap: 8, marginBottom: 8 }}>
          <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
            Paste your calendar's <span style={{ color: 'var(--text)' }}>secret iCal link</span> to show today's real events on your timeline.
          </div>
          <input
            value={cal}
            onChange={(e) => setCal(e.target.value)}
            placeholder="https://calendar.google.com/calendar/ical/…/basic.ics"
            style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--line)', borderRadius: 10, padding: '9px 11px', color: 'var(--text)', fontSize: 12, outline: 'none', fontFamily: 'var(--font-mono)', boxSizing: 'border-box' }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <div className="pressable" onClick={() => onSetIcal(cal.trim())} style={{ flex: 1, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #45B7E8, #2DD4BF)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#0A0B0D', fontWeight: 700, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              <IconCheck size={14} stroke={2.4} /> {icalUrl ? 'Update' : 'Connect'}
            </div>
            {icalUrl && (
              <div className="pressable" onClick={() => { onSetIcal(''); setCal(''); }} style={{ width: 44, borderRadius: 10, background: 'rgba(255,107,91,0.1)', border: '1px solid rgba(255,107,91,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ona-red)' }}>
                <IconClose size={15} />
              </div>
            )}
          </div>
          {icalUrl && (
            <div className="mono" style={{ fontSize: 9, color: 'var(--lime)', letterSpacing: '0.1em' }}>● CONNECTED</div>
          )}
        </div>

        {/* Data */}
        <div className="eyebrow" style={{ marginBottom: 8 }}>Your data</div>
        <div className="pressable" onClick={doExport} style={{ ...rowStyle, marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10, background: 'rgba(69,183,232,0.12)', border: '1px solid rgba(69,183,232,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cyan)',
            }}>{exported ? <IconCheck size={16} color="#34D399" stroke={2.6} /> : <IconDownload size={16} />}</div>
            <div>
              <div style={{ fontSize: 14, color: 'var(--text)' }}>{exported ? 'Backup downloaded' : 'Export my data'}</div>
              <div className="mono" style={{ fontSize: 9, color: 'var(--dim)', marginTop: 2, letterSpacing: '0.1em' }}>JSON BACKUP OF EVERYTHING</div>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="eyebrow" style={{ marginBottom: 8 }}>About</div>
        <div style={{ ...rowStyle, flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
          <div className="display" style={{ fontSize: 20, letterSpacing: '0.06em' }}>JAM HQ</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
            Move with purpose. Create with passion. Live in motion.
          </div>
          <div className="mono" style={{ fontSize: 9, color: 'var(--dim)', letterSpacing: '0.12em', marginTop: 2 }}>VERSION 1.0 · JAY MARTINEZ</div>
        </div>

        <div style={{ height: 12 }} />
    </Sheet>
  );
}
