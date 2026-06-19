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

// ─────────────────────────────────────────────────────────
// Workbench — every active project across every folder (ONA, Podium,
// Studio, personal), in one place, sorted by urgency, each with its
// surfaced next action. The single "what's on my plate" view.
// ─────────────────────────────────────────────────────────
function dueStatus(due) {
  if (!due) return { label: '', color: 'var(--dim)', rank: 4 };
  const d = new Date(`${due}T00:00:00`);
  if (isNaN(d)) return { label: '', color: 'var(--dim)', rank: 4 };
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const days = Math.round((d - today) / 864e5);
  if (days < 0) return { label: `OVERDUE ${-days}D`, color: '#FF6B5B', rank: 0 };
  if (days === 0) return { label: 'DUE TODAY', color: '#E9C46A', rank: 1 };
  if (days <= 3) return { label: `DUE ${days}D`, color: '#E9C46A', rank: 2 };
  return { label: `DUE ${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }).toUpperCase()}`, color: 'var(--dim)', rank: 3 };
}

function Workbench() {
  const s = snapshot();
  const all = [];
  (s.folders || []).forEach((f) => (f.projects || []).forEach((p) => {
    const steps = p.steps || [];
    const done = steps.filter((x) => x.done).length;
    const allDone = steps.length > 0 && done === steps.length;
    if (allDone) return; // active only
    all.push({
      id: p.id, title: p.title, folder: f,
      pct: steps.length ? Math.round((done / steps.length) * 100) : 0,
      next: steps.find((x) => !x.done)?.text,
      due: dueStatus(p.due),
    });
  }));
  all.sort((a, b) => a.due.rank - b.due.rank || b.pct - a.pct);

  return (
    <div className="hud glass" style={{ padding: 14, borderRadius: 16, border: '1px solid rgba(255,138,76,0.22)' }}>
      <HUDTicks />
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
        <span className="eyebrow" style={{ color: 'var(--orange)' }}>What's on your plate</span>
        <span className="mono" style={{ fontSize: 9, color: 'var(--dim)' }}>{all.length} ACTIVE PROJECTS</span>
      </div>
      {all.length === 0 ? (
        <div className="eyebrow" style={{ color: 'var(--dim)', lineHeight: 1.5 }}>No active projects. Start one in any folder (Studio) and it shows up here with its next move.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {all.slice(0, 12).map((p) => {
            const c = p.folder.color || '#FF8A4C';
            return (
              <div key={p.id} style={{ padding: '10px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <span style={{ width: 7, height: 7, borderRadius: 999, background: c, boxShadow: `0 0 7px ${c}`, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 650, color: 'var(--text)', lineHeight: 1.25, textWrap: 'pretty' }}>{p.title}</div>
                    <div className="mono" style={{ fontSize: 8, color: 'var(--dim)', letterSpacing: '0.08em', marginTop: 2 }}>
                      {(p.folder.emoji || '') + ' ' + (p.folder.name || '').toUpperCase()}{p.due.label ? <span style={{ color: p.due.color }}> · {p.due.label}</span> : null}
                    </div>
                  </div>
                  <span className="display" style={{ fontSize: 15, color: p.pct >= 60 ? 'var(--lime)' : 'var(--cyan)', flexShrink: 0 }}>{p.pct}%</span>
                </div>
                {p.next && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 7 }}>
                    <span style={{ color: c, fontWeight: 800, fontSize: 12 }}>▸</span>
                    <span style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.next}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
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

      <Workbench />

      {seg === 'ona' ? <ONAHQ embedded /> : seg === 'podium' ? <PodiumHub /> : <ContentStudio embedded />}
    </div>
  );
}
