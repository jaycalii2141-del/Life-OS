// ─────────────────────────────────────────────────────────
// Close the day — the evening ritual that completes the daily loop.
//
// Check-in opens the day; this closes it. A quiet trigger appears in the
// evening (or once the mission is done): review what moved, leave one line
// of reflection (→ journal), and close — a ceremony lands, the day is
// marked closed, and tomorrow starts from a finished day, not an abandoned
// one. Closing is a ritual, not points: it never inflates the day's score.
// ─────────────────────────────────────────────────────────
import { useState } from 'react';
import { Sheet } from './Sheet.jsx';
import { IconCheck, IconChevronRight } from './icons.jsx';
import { useSyncedState } from '../useSyncedState.js';
import { fireCeremony } from '../lib/ceremony.js';
import { logEvent } from '../lib/telemetry.js';

export function CloseDay({ state, setState, doneCount, totalCount, becoming, streak }) {
  const [open, setOpen] = useState(false);
  const [line, setLine] = useState('');
  const [, setJournal] = useSyncedState('lifeos:journal', []);

  const evening = new Date().getHours() >= 17;
  const allDone = totalCount > 0 && doneCount >= totalCount;
  const closed = !!state.closed;

  // Nothing to show until the day is closable (evening, or the work is done).
  if (!closed && !evening && !allDone) return null;

  // After closing — a quiet, settled strip. The day is finished, not abandoned.
  if (closed) {
    return (
      <div className="card card-quiet" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px' }}>
        <IconCheck size={15} color="var(--lime)" stroke={2.4} style={{ flexShrink: 0 }} />
        <span style={{ flex: 1, fontSize: 13, color: 'var(--muted)' }}>Day closed — rest easy.</span>
        {streak > 0 && <span className="mono" style={{ fontSize: 10, color: 'var(--dim)' }}>day {streak}</span>}
      </div>
    );
  }

  const close = () => {
    const text = line.trim();
    if (text) {
      setJournal((j) => [{ id: Date.now(), text, ts: Date.now() }, ...j].slice(0, 200));
    }
    setState((s) => ({ ...s, closed: true }));
    fireCeremony({
      kicker: 'DAY CLOSED',
      title: 'You showed up',
      subtitle: `Day ${Math.max(1, streak)} of the streak${becoming ? ` · Becoming ${becoming.score}${becoming.delta > 0 ? ` ▲+${becoming.delta}` : ''}` : ''}`,
    });
    logEvent('today', 'close-day', text ? 'with-reflection' : 'plain');
    setOpen(false);
    setLine('');
  };

  return (
    <>
      <div className="pressable card" onClick={() => setOpen(true)}
        style={{ display: 'flex', alignItems: 'center', gap: 12, borderColor: 'rgba(52,211,153,0.25)' }}>
        <div style={{ width: 34, height: 34, borderRadius: 'var(--r-sm)', flexShrink: 0, background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--lime)' }}>
          <IconCheck size={16} stroke={2.2} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 650, color: 'var(--text)' }}>Close the day</div>
          <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 1 }}>
            {allDone ? 'Everything moved — seal it.' : 'A minute to land the day well.'}
          </div>
        </div>
        <IconChevronRight size={15} color="var(--dim)" style={{ flexShrink: 0 }} />
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} maxHeight="72%">
        <div className="center" style={{ paddingBottom: 'var(--space-2)' }}>
          <div className="eyebrow" style={{ color: 'var(--lime)' }}>The evening ritual</div>
          <div className="serif" style={{ fontSize: 28, marginTop: 4, lineHeight: 1.1 }}>Close the day</div>
        </div>

        {/* what moved today — honest, no inflation */}
        <div className="card card-quiet" style={{ marginTop: 'var(--space-3)' }}>
          <div className="row-between">
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>Mission</span>
            <span className="mono" style={{ fontSize: 12, color: doneCount > 0 ? 'var(--lime)' : 'var(--dim)' }}>{doneCount}/{totalCount} moved</span>
          </div>
          {becoming && (
            <div className="row-between" style={{ marginTop: 'var(--space-2)' }}>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>Becoming</span>
              <span className="mono" style={{ fontSize: 12, color: 'var(--text-2)' }}>{becoming.score}{becoming.delta !== 0 ? ` · ${becoming.delta > 0 ? '▲+' : '▼'}${Math.abs(becoming.delta)} 7d` : ''}</span>
            </div>
          )}
          {streak > 0 && (
            <div className="row-between" style={{ marginTop: 'var(--space-2)' }}>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>Streak</span>
              <span className="mono" style={{ fontSize: 12, color: 'var(--gold)' }}>day {streak}</span>
            </div>
          )}
        </div>

        {/* one line of reflection — optional, becomes a journal entry */}
        <div style={{ marginTop: 'var(--space-4)' }}>
          <div className="eyebrow" style={{ marginBottom: 'var(--space-2)' }}>One line about today (optional)</div>
          <input
            value={line}
            onChange={(e) => setLine(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') close(); }}
            placeholder="What did today teach you…"
            style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line-strong)', borderRadius: 'var(--r-md)', padding: '13px 14px', color: 'var(--text)', fontSize: 14, outline: 'none', fontFamily: 'var(--font-body)' }}
          />
        </div>

        <button className="btn btn-primary btn-block btn-lg" onClick={close} style={{ marginTop: 'var(--space-4)' }}>
          <IconCheck size={17} stroke={2.6} /> Close the day
        </button>
        <div style={{ height: 60 }} />
      </Sheet>
    </>
  );
}
