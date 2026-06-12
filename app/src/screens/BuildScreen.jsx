// ─────────────────────────────────────────────────────────
// LifeOS V2 — BUILD. Business, content, projects, operations.
//
// V1 showed numbers. V2 opens with the ACTION CENTER: every metric
// is converted into a recommended move with a WHY and an estimated
// impact — and one tap sends it into today's mission. The full
// ONA and Studio workspaces live underneath, one segment away.
// ─────────────────────────────────────────────────────────
import { useState } from 'react';
import { SectionHead } from '../components/atoms.jsx';
import { IconCheck, IconPlus } from '../components/icons.jsx';
import { ONAHQ } from './ONAHQ.jsx';
import { ContentStudio } from './ContentStudio.jsx';
import { snapshot, recommendOna, recommendContent } from '../lib/mission.js';
import { celebrate } from '../lib/haptics.js';
import { logEvent } from '../lib/telemetry.js';

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
    <div className="hud glass" style={{ padding: 14, borderRadius: 16, border: '1px solid rgba(255,210,60,0.25)' }}>
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
                    background: added ? 'rgba(182,255,60,0.14)' : 'rgba(0,212,255,0.12)',
                    border: `1px solid ${added ? 'rgba(182,255,60,0.5)' : 'rgba(0,212,255,0.4)'}`,
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
  { id: 'ona', label: 'ONA', color: '#FF0033' },
  { id: 'studio', label: 'Studio', color: '#FF3CC8' },
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

      {seg === 'ona' ? <ONAHQ embedded /> : <ContentStudio embedded />}
    </div>
  );
}
