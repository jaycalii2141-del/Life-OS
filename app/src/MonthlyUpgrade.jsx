// ─────────────────────────────────────────────────────────
// Monthly Upgrade Report — the self-improving loop, made safe.
// LifeOS reflects on how Jay used it this month, surfaces patterns,
// and PROPOSES improvements he can Accept or Dismiss. Nothing changes
// automatically: accepting just records the decision to a changelog
// and bumps the LifeOS version. The app stays his to steer.
// ─────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { IconClose, IconSparkles, IconCheck, IconArrowRight, IconTrendUp } from './components/icons.jsx';
import { LIFE_DOMAINS } from './data.js';
import { usageBySurface } from './lib/telemetry.js';
import { useSyncedState } from './useSyncedState.js';
import { Sheet } from './components/Sheet.jsx';

function readJSON(key, fb) {
  try { const r = localStorage.getItem(key); return r != null ? JSON.parse(r) : fb; } catch { return fb; }
}
const SURFACE_NAMES = { home: 'Home', train: 'Train', create: 'Create', ona: 'ONA', mind: 'Mind', ai: 'Agents', capture: 'Capture', today: 'Today', life: 'Life', perform: 'Perform', build: 'Build', companion: 'Intelligence', mission: 'Mission' };

// Crunch the month from local data + telemetry.
function buildMonth() {
  const now = Date.now();
  const monthAgo = now - 30 * 864e5;
  const history = readJSON('lifeos:history', {});
  const sessions = readJSON('lifeos:sessions', []);
  const captures = readJSON('lifeos:captures', []);
  const folders = readJSON('lifeos:folders', []);
  const focus = readJSON('lifeos:weeklyfocus', {});

  // Active days + readiness over ~30 days.
  let active = 0, rTotal = 0, rDays = 0;
  Object.entries(history).forEach(([k, e]) => {
    const t = new Date(k).getTime();
    if (isNaN(t) || t < monthAgo) return;
    if ((e.score ?? 0) >= 1) active += 1;
    if (typeof e.readiness === 'number') { rTotal += e.readiness; rDays += 1; }
  });
  const avgReadiness = rDays ? Math.round(rTotal / rDays) : null;

  const mSessions = sessions.filter((s) => new Date(s.date || s.ts || 0).getTime() >= monthAgo);
  const minutes = mSessions.reduce((n, s) => n + (s.duration || 0), 0);
  const trained = new Set(mSessions.map((s) => s.discipline));

  const inbox = captures.filter((c) => (c.status || 'inbox') === 'inbox').length;
  const triaged = captures.filter((c) => c.status === 'triaged' && (c.routedAt || 0) >= monthAgo).length;
  const byDomain = {};
  captures.forEach((c) => { if (c.domain && (c.routedAt || c.ts || 0) >= monthAgo) byDomain[c.domain] = (byDomain[c.domain] || 0) + 1; });
  const staleFolders = folders.filter((f) => (f.notes || []).length === 0 && (f.projects || []).length === 0);

  const usage = usageBySurface(30);
  const usageSorted = Object.entries(usage).filter(([k]) => k !== 'capture').sort((a, b) => b[1] - a[1]);

  return { active, avgReadiness, mSessions: mSessions.length, minutes, trained, inbox, triaged, byDomain, staleFolders, usage, usageSorted, hasFocus: !!focus.text };
}

// Deterministic improvement proposals from the month's data.
function buildProposals(m) {
  const out = [];
  if (m.inbox >= 6) out.push({ id: 'triage-habit', accent: '#E9C46A', title: 'Make triage a daily 2-minute habit', body: `${m.inbox} thoughts are stuck in your inbox. A short daily triage keeps the mental clutter at zero.` });

  const neglected = LIFE_DOMAINS.filter((d) => !(m.byDomain[d.id] > 0));
  if (neglected.length) {
    const d = neglected[0];
    out.push({ id: `protect-${d.id}`, accent: d.color, title: `Protect weekly time for ${d.name}`, body: `${d.name} got almost no attention this month. Block a recurring slot so it doesn't keep slipping.` });
  }

  const untouched = LIFE_DOMAINS; // training discipline imbalance
  if (m.mSessions >= 3 && m.trained.size <= 2) out.push({ id: 'cross-train', accent: '#34D399', title: 'Add one cross-training micro-session', body: 'Your sessions clustered in one or two disciplines. One weekly micro-session in a neglected discipline keeps you well-rounded.' });

  if (m.avgReadiness != null && m.avgReadiness < 60) out.push({ id: 'recovery-block', accent: '#45B7E8', title: 'Build a real recovery block into the week', body: `Average readiness ran ${m.avgReadiness}/100 this month. A protected recovery day pays back in output.` });

  // Dead-feature surfacing (a surface barely opened).
  if (m.usageSorted.length >= 3) {
    const least = m.usageSorted[m.usageSorted.length - 1];
    if (least[1] <= 2) out.push({ id: `retire-${least[0]}`, accent: '#8A8A95', title: `Rethink the ${SURFACE_NAMES[least[0]] || least[0]} surface`, body: `You opened ${SURFACE_NAMES[least[0]] || least[0]} only ${least[1]}x in 30 days. Either it needs a reason to exist, or it's clutter worth hiding.` });
  }

  if (m.staleFolders.length >= 2) out.push({ id: 'prune-folders', accent: '#FF8A4C', title: 'Prune or seed your empty folders', body: `${m.staleFolders.length} Create folders are empty. Give each a first project, or archive it to keep the workspace sharp.` });

  if (!m.hasFocus) out.push({ id: 'weekly-ritual', accent: '#2DD4BF', title: 'Lock in the Sunday Weekly Review', body: 'You haven\'t been setting a weekly focus. The 10-minute Sunday review is the highest-leverage ritual in LifeOS.' });

  // Always give him something forward-looking if data is thin.
  if (out.length < 2) out.push({ id: 'capture-more', accent: '#45B7E8', title: 'Capture more, decide less in the moment', body: 'The more you dump into capture, the more LifeOS can organize for you. Build the one-tap capture reflex.' });

  return out;
}

export function MonthlyUpgrade({ open, onClose }) {
  const [m, setM] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [note, setNote] = useState('');
  const [usedAI, setUsedAI] = useState(false);
  const [loading, setLoading] = useState(false);
  const [upgrades, setUpgrades] = useSyncedState('lifeos:upgrades', []);
  const [dismissed, setDismissed] = useSyncedState('lifeos:upgradeDismissed', []);

  const version = 1 + upgrades.length;

  useEffect(() => {
    if (!open) return;
    const month = buildMonth();
    setM(month);
    setProposals(buildProposals(month));
    setUsedAI(false);
    setNote('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!m) return <Sheet open={open} onClose={onClose} maxHeight="90%" />;

  const acceptedIds = new Set(upgrades.map((u) => u.id));
  const dismissedIds = new Set(dismissed);
  const active = proposals.filter((p) => !acceptedIds.has(p.id) && !dismissedIds.has(p.id));

  const accept = (p) => setUpgrades((list) => [{ id: p.id, title: p.title, version, ts: Date.now() }, ...list]);
  const dismiss = (p) => setDismissed((list) => [...list, p.id]);

  const reflect = async () => {
    setLoading(true);
    const ctx = [
      `Active days (30d): ${m.active}. Avg readiness: ${m.avgReadiness ?? 'n/a'}.`,
      `Training: ${m.mSessions} sessions, ${m.minutes} min, disciplines used: ${[...m.trained].join(', ') || 'none'}.`,
      `Capture: ${m.inbox} in inbox, ${m.triaged} routed this month.`,
      `Attention by domain: ${Object.entries(m.byDomain).map(([k, v]) => `${(LIFE_DOMAINS.find((d) => d.id === k) || {}).name || k} ${v}`).join(', ') || 'none routed'}.`,
      `Surface opens (30d): ${m.usageSorted.map(([k, v]) => `${SURFACE_NAMES[k] || k} ${v}`).join(', ') || 'n/a'}.`,
      `Empty folders: ${m.staleFolders.length}. Weekly focus set: ${m.hasFocus ? 'yes' : 'no'}.`,
    ].join('\n');
    try {
      const r = await fetch('/api/chief', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ mode: 'upgrade', context: ctx }) });
      if (!r.ok) throw new Error('no ai');
      const data = await r.json();
      const text = (data.text || '').trim();
      if (!text) throw new Error('empty');
      setNote(text); setUsedAI(true);
    } catch {
      setNote(`This month: active ${m.active}/30 days${m.avgReadiness != null ? `, readiness ${m.avgReadiness}` : ''}. ${m.mSessions} sessions. ${m.inbox ? `${m.inbox} thoughts waiting in your inbox.` : 'Inbox clear.'} Review the proposals below and accept the ones worth doing.`);
      setUsedAI(false);
    }
    setLoading(false);
  };

  return (
    <Sheet open={open} onClose={onClose} maxHeight="90%">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div className="eyebrow" style={{ color: 'var(--lime)' }}>Self-improvement · LifeOS v{version}</div>
            <div className="display" style={{ fontSize: 24, marginTop: 2 }}>UPGRADE REPORT</div>
          </div>
          <div className="pressable" onClick={onClose} style={{ width: 32, height: 32, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.06)', color: 'var(--muted)' }}><IconClose size={16} /></div>
        </div>

        {/* AI / data note */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div className="eyebrow">This month</div>
          <div className="pressable" onClick={reflect} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 999, background: 'rgba(45,212,191,0.12)', border: '1px solid rgba(45,212,191,0.4)', color: 'var(--violet)', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700 }}>
            <IconSparkles size={13} /> {loading ? 'THINKING…' : 'AI REFLECT'}
          </div>
        </div>
        {note && (
          <div className="hud glass" style={{ padding: 14, borderRadius: 14, marginBottom: 4 }}>
            <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{note}</div>
          </div>
        )}
        {note && <div className="mono" style={{ fontSize: 9, color: usedAI ? 'var(--lime)' : 'var(--dim)', letterSpacing: '0.1em', margin: '6px 0 14px', textAlign: 'center' }}>{usedAI ? '● REFLECTED BY AI' : '○ FROM YOUR USAGE'}</div>}

        {/* Proposals */}
        <div className="eyebrow" style={{ marginBottom: 10 }}>Proposed upgrades — you decide</div>
        {active.length === 0 ? (
          <div className="hud glass" style={{ padding: '24px 16px', borderRadius: 14, textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8, color: 'var(--lime)' }}><IconCheck size={26} stroke={2.2} /></div>
            <div className="display" style={{ fontSize: 16, color: 'var(--lime)' }}>ALL CLEAR</div>
            <div className="eyebrow" style={{ marginTop: 6, opacity: 0.8 }}>nothing to propose — keep running the system</div>
          </div>
        ) : active.map((p) => (
          <div key={p.id} className="hud glass" style={{ padding: 14, borderRadius: 16, marginBottom: 10, borderLeft: `3px solid ${p.accent}` }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{p.title}</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 12 }}>{p.body}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div className="pressable" onClick={() => accept(p)} style={{ flex: 1, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: `${p.accent}1f`, border: `1px solid ${p.accent}66`, color: p.accent, fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}><IconCheck size={14} stroke={2.4} /> Accept</div>
              <div className="pressable" onClick={() => dismiss(p)} style={{ width: 96, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', color: 'var(--muted)', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Dismiss</div>
            </div>
          </div>
        ))}

        {/* Changelog */}
        {upgrades.length > 0 && (
          <div style={{ marginTop: 18 }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>Accepted — your LifeOS changelog</div>
            {upgrades.slice(0, 12).map((u) => (
              <div key={u.ts} className="hud glass" style={{ padding: '10px 14px', borderRadius: 12, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                <IconTrendUp size={15} color="var(--lime)" />
                <div style={{ flex: 1, fontSize: 13, color: 'var(--text)' }}>{u.title}</div>
                <span className="mono" style={{ fontSize: 9, color: 'var(--dim)' }}>v{u.version}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ height: 10 }} />
    </Sheet>
  );
}
