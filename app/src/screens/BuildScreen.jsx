// ─────────────────────────────────────────────────────────
// LifeOS V2 — BUILD. Business, content, projects, operations.
//
// V1 showed numbers. V2 opens with the ACTION CENTER: every metric
// is converted into a recommended move with a WHY and an estimated
// impact — and one tap sends it into today's mission. The full
// ONA and Studio workspaces live underneath, one segment away.
// ─────────────────────────────────────────────────────────
import { useState } from 'react';
import { SectionHead, HUDTicks, TickCounter } from '../components/atoms.jsx';
import { IconCheck, IconPlus } from '../components/icons.jsx';
import { ONAHQ } from './ONAHQ.jsx';
import { ContentStudio } from './ContentStudio.jsx';
import { snapshot, recommendOna, recommendContent } from '../lib/mission.js';
import { useSyncedState } from '../useSyncedState.js';
import { celebrate } from '../lib/haptics.js';
import { logEvent } from '../lib/telemetry.js';

// ─────────────────────────────────────────────────────────
// PODIUM — the second company gets its own command hub.
// KPIs are tap-to-edit; projects/notes flow in from the
// Podium folder (route captures there from the Life Map inbox).
// ─────────────────────────────────────────────────────────
function PodiumStat({ label, value, prefix, color, onChange }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const save = () => {
    const n = parseInt(String(draft).replace(/[^0-9]/g, ''), 10);
    if (!Number.isNaN(n)) onChange?.(n);
    setEditing(false);
  };
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div className="eyebrow" style={{ marginBottom: 4 }}>{label}</div>
      {editing ? (
        <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={save} onKeyDown={(e) => e.key === 'Enter' && save()} inputMode="numeric"
          style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: `1px solid ${color}`, borderRadius: 8, padding: '4px 6px', color: 'var(--text)', fontFamily: 'var(--font-display)', fontSize: 22, outline: 'none' }} />
      ) : (
        <div className="pressable" onClick={() => { setDraft(String(value)); setEditing(true); }} style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
          {prefix && <span className="display" style={{ fontSize: 14, color, opacity: 0.7 }}>{prefix}</span>}
          <span className="display" style={{ fontSize: 28, color, lineHeight: 0.9 }}>
            <TickCounter value={value} format={(v) => Math.round(v).toLocaleString()} />
          </span>
        </div>
      )}
      <div className="mono" style={{ fontSize: 8, color: 'var(--dim)', marginTop: 3, letterSpacing: '0.1em' }}>TAP TO EDIT</div>
    </div>
  );
}

function PodiumHub() {
  const [podium, setPodium] = useSyncedState('lifeos:podium', { orders: 0, revenue: 0, builds: 0 });
  const setStat = (k, v) => setPodium((p) => ({ ...p, [k]: v }));
  const s = snapshot();
  const folder = (s.folders || []).find((f) => f.domain === 'podium' || (f.name || '').toLowerCase() === 'podium');
  const projects = folder?.projects || [];
  const notes = (folder?.notes || []).slice(0, 4);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="hud glass-strong mesh-content" style={{ padding: 18, borderRadius: 20 }}>
        <HUDTicks />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
          <div>
            <div className="eyebrow">Premium obstacle equipment</div>
            <div className="display" style={{ fontSize: 30, marginTop: 2, lineHeight: 1, color: 'var(--gold)' }}>PODIUM</div>
          </div>
        </div>
        <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', margin: '6px 0 14px', lineHeight: 1.5 }}>
          VISION: EQUIPMENT REVENUE THAT COMPOUNDS WHILE YOU SLEEP
        </div>
        <div style={{ display: 'flex', gap: 14 }}>
          <PodiumStat label="Open orders" value={podium.orders ?? 0} color="var(--text)" onChange={(v) => setStat('orders', v)} />
          <PodiumStat label="Revenue (mo)" value={podium.revenue ?? 0} prefix="$" color="var(--lime)" onChange={(v) => setStat('revenue', v)} />
          <PodiumStat label="In build" value={podium.builds ?? 0} color="var(--cyan)" onChange={(v) => setStat('builds', v)} />
        </div>
      </div>

      <div className="hud glass" style={{ padding: 14, borderRadius: 16 }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>Projects · from the Podium folder</div>
        {projects.length ? projects.map((p) => {
          const steps = p.steps || [];
          const done = steps.filter((x) => x.done).length;
          const next = steps.find((x) => !x.done);
          return (
            <div key={p.id} style={{ padding: '9px 0', borderTop: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{p.title}</span>
                <span className="mono" style={{ fontSize: 10, color: 'var(--gold)' }}>{done}/{steps.length}</span>
              </div>
              {next && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>▸ {next.text}</div>}
            </div>
          );
        }) : (
          <div className="eyebrow" style={{ color: 'var(--dim)', lineHeight: 1.6 }}>
            No Podium projects yet — open the Podium folder in Studio to start one, or route a capture here.
          </div>
        )}
      </div>

      {notes.length > 0 && (
        <div className="hud glass" style={{ padding: 14, borderRadius: 16 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Latest notes</div>
          {notes.map((n) => (
            <div key={n.id} style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.45, padding: '6px 0', borderTop: '1px solid var(--line)' }}>{n.title}</div>
          ))}
        </div>
      )}
    </div>
  );
}

function ActionCenter({ onAddMission, missionIds }) {
  const s = snapshot();
  const recs = [...recommendOna(s.ona, s.onaLive), ...recommendContent(s.content, s.folders)].slice(0, 4);

  if (!recs.length) {
    return (
      <div className="hud glass" style={{ padding: 14, borderRadius: 16 }}>
        <span className="eyebrow" style={{ color: 'var(--lime)' }}>Action center</span>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6, lineHeight: 1.5 }}>
          Nothing urgent. Pipelines are clean and brands are on pace — bank momentum while you're ahead.
        </div>
      </div>
    );
  }

  return (
    <div className="hud glass" style={{ padding: 14, borderRadius: 16, border: '1px solid rgba(233,196,106,0.25)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
        <span className="eyebrow" style={{ color: 'var(--gold)' }}>Action center</span>
        <span className="mono" style={{ fontSize: 9, color: 'var(--dim)' }}>METRICS → MOVES</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {recs.map((r) => {
          const added = missionIds.includes(r.id);
          return (
            <div key={r.id} style={{ padding: '10px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ fontSize: 16, flexShrink: 0, lineHeight: '20px' }}>{r.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>{r.title}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.4, marginTop: 3 }}>{r.why}</div>
                  <div className="mono" style={{ fontSize: 9, color: 'var(--lime)', letterSpacing: '0.06em', marginTop: 4 }}>{r.impact?.toUpperCase()}</div>
                </div>
                <div className="pressable" onClick={() => { if (!added) { onAddMission(r); celebrate(); logEvent('build', 'mission-add', r.id); } }}
                  style={{
                    flexShrink: 0, padding: '6px 10px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 4,
                    background: added ? 'rgba(52,211,153,0.14)' : 'rgba(69,183,232,0.12)',
                    border: `1px solid ${added ? 'rgba(52,211,153,0.5)' : 'rgba(69,183,232,0.4)'}`,
                    color: added ? 'var(--lime)' : 'var(--cyan)',
                    fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
                  }}>
                  {added ? <><IconCheck size={11} stroke={2.6} /> ON IT</> : <><IconPlus size={11} stroke={2.6} /> DO TODAY</>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const SEGMENTS = [
  { id: 'ona', label: 'ONA', color: '#FF6B5B' },
  { id: 'podium', label: 'Podium', color: '#E9C46A' },
  { id: 'studio', label: 'Studio', color: '#FF8A4C' },
];

export function BuildScreen({ onAddMission, missionIds = [] }) {
  const [seg, setSeg] = useState('ona');

  return (
    <div className="screen-content" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <SectionHead eyebrow="Business · content · operations" title="BUILD" trailing={
        <div style={{ display: 'flex', gap: 6 }}>
          {SEGMENTS.map((x) => {
            const on = seg === x.id;
            return (
              <div key={x.id} className="pressable" onClick={() => { setSeg(x.id); logEvent('build', 'segment', x.id); }} style={{
                padding: '8px 14px', borderRadius: 999,
                background: on ? `${x.color}1c` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${on ? x.color : 'var(--line)'}`,
                color: on ? x.color : 'var(--muted)',
                fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
              }}>{x.label.toUpperCase()}</div>
            );
          })}
        </div>
      } />

      <ActionCenter onAddMission={onAddMission} missionIds={missionIds} />

      {seg === 'ona' ? <ONAHQ embedded /> : seg === 'podium' ? <PodiumHub /> : <ContentStudio embedded />}
    </div>
  );
}
