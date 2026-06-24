// ─────────────────────────────────────────────────────────
// The Becoming Time-Lapse — scrub through who you've been becoming.
//
// Replays the daily Self-snapshots (lifeos:self-history) so you can watch
// The Self morph over time: shape (your eight facets), glow (Becoming) and
// level all move together. Drag the scrubber or hit play to run it.
//
// It gets richer every day the recorder runs. Days captured before facets
// were recorded fall back to an approximated shape (the live shape scaled
// to that day's Becoming) so the line still reads as continuous.
// ─────────────────────────────────────────────────────────
import { useState, useEffect, useMemo, useRef } from 'react';
import { Sheet } from './Sheet.jsx';
import { TheSelf } from './TheSelf.jsx';
import { IconSparkles } from './icons.jsx';

const FACET_ORDER = ['athlete', 'business', 'relationships', 'health', 'creativity', 'learning', 'adventure', 'growth'];

function fmtDate(key, isLast) {
  if (isLast) return 'Today';
  // key is YYYY-MM-DD — parse as local, not UTC, to avoid off-by-one.
  const [y, m, d] = (key || '').split('-').map(Number);
  if (!y) return key;
  const dt = new Date(y, (m || 1) - 1, d || 1);
  return dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// Build a facet array for a frame, falling back to a scaled live shape for
// older snapshots that predate facet recording.
function frameFacets(snap, liveFacets, liveBecoming) {
  if (snap?.facets?.length) return snap.facets;
  const ratio = liveBecoming > 0 ? Math.max(0.35, Math.min(1.15, (snap?.becoming ?? liveBecoming) / liveBecoming)) : 1;
  return (liveFacets || []).map((f) => ({ id: f.id, score: Math.round((f.score || 0) * ratio) }));
}

export function BecomingTimeLapse({ open, onClose, selfHistory = {}, liveFacets = [], liveBecoming = 0, liveLevel, liveTrend = 'steady' }) {
  // Ordered frames, oldest → newest.
  const frames = useMemo(() => {
    return Object.keys(selfHistory)
      .sort()
      .map((key) => ({ key, ...(selfHistory[key] || {}) }))
      .filter((f) => typeof f.becoming === 'number');
  }, [selfHistory]);

  const lastIdx = Math.max(0, frames.length - 1);
  const [idx, setIdx] = useState(lastIdx);
  const [playing, setPlaying] = useState(false);
  const timer = useRef(null);

  // When the sheet opens, start at the most recent day and reset playback.
  useEffect(() => {
    if (open) { setIdx(lastIdx); setPlaying(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Playback — advance ~one day per beat, stop at the end.
  useEffect(() => {
    if (!playing) return;
    timer.current = setInterval(() => {
      setIdx((i) => {
        if (i >= lastIdx) { setPlaying(false); return i; }
        return i + 1;
      });
    }, 850);
    return () => clearInterval(timer.current);
  }, [playing, lastIdx]);

  useEffect(() => () => clearInterval(timer.current), []);

  if (!open) return null;

  // Not enough history yet — be honest about it.
  if (frames.length < 2) {
    return (
      <Sheet open={open} onClose={onClose} maxHeight="70%">
        <div style={{ textAlign: 'center', padding: '12px 18px 24px' }}>
          <div className="eyebrow" style={{ color: 'var(--cyan)' }}>BECOMING · TIME-LAPSE</div>
          <div className="display" style={{ fontSize: 22, marginTop: 6 }}>Your story is just beginning</div>
          <div style={{ margin: '20px auto 0', width: 196 }}>
            <TheSelf facets={liveFacets} becoming={liveBecoming} level={liveLevel} trend={liveTrend} size={196} />
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, marginTop: 22, maxWidth: 280, marginInline: 'auto' }}>
            One snapshot of who you're becoming is recorded each day. Come back tomorrow — the time-lapse fills in as the days stack up.
          </div>
        </div>
      </Sheet>
    );
  }

  const cur = frames[Math.min(idx, lastIdx)];
  const onLast = idx >= lastIdx;
  const facets = frameFacets(cur, liveFacets, liveBecoming);
  const trend = cur.trend || (onLast ? liveTrend : 'steady');

  const first = frames[0];
  const totalDelta = (cur.becoming ?? 0) - (first.becoming ?? 0);
  const deltaColor = totalDelta > 0 ? 'var(--lime)' : totalDelta < 0 ? 'var(--ona-red)' : 'var(--dim)';
  const deltaSign = totalDelta > 0 ? '▲ +' : totalDelta < 0 ? '▼ ' : '';

  const togglePlay = () => {
    if (onLast && !playing) setIdx(0); // replay from the start
    setPlaying((p) => !p);
  };

  return (
    <Sheet open={open} onClose={onClose} maxHeight="86%">
      {/* bottom padding clears the fixed tab bar so the journey line stays visible */}
      <div style={{ textAlign: 'center', paddingBottom: 88 }}>
        <div className="eyebrow" style={{ color: 'var(--cyan)' }}>BECOMING · TIME-LAPSE</div>
        <div className="display" style={{ fontSize: 20, marginTop: 4 }}>{fmtDate(cur.key, onLast)}</div>
        <div className="mono" style={{ fontSize: 9, color: 'var(--dim)', letterSpacing: '0.14em', marginTop: 3 }}>
          DAY {idx + 1} OF {frames.length}
        </div>

        {/* The Self for this day */}
        <div style={{ margin: '18px auto 6px', width: 200, height: 200 }}>
          {/* key forces a fresh count-up/morph as the frame changes */}
          <TheSelf key={cur.key} facets={facets} becoming={cur.becoming} level={cur.level} trend={trend} size={200} />
        </div>

        {/* Scrubber */}
        <input
          type="range"
          min={0}
          max={lastIdx}
          value={Math.min(idx, lastIdx)}
          onChange={(e) => { setPlaying(false); setIdx(Number(e.target.value)); }}
          className="timelapse-range"
          style={{ width: '86%', margin: '14px auto 0', display: 'block', accentColor: '#45B7E8' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '86%', margin: '6px auto 0' }}>
          <span className="mono" style={{ fontSize: 8.5, color: 'var(--dim)', letterSpacing: '0.1em' }}>{fmtDate(first.key, false)}</span>
          <span className="mono" style={{ fontSize: 8.5, color: 'var(--dim)', letterSpacing: '0.1em' }}>TODAY</span>
        </div>

        {/* Controls + total journey */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginTop: 18 }}>
          <div className="pressable" onClick={togglePlay} style={{
            height: 44, padding: '0 22px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            background: 'rgba(69,183,232,0.14)', border: '1px solid rgba(69,183,232,0.5)', color: 'var(--cyan)', fontWeight: 700, fontSize: 13, letterSpacing: '0.04em',
          }}>
            {playing ? <PauseGlyph /> : <PlayGlyph />}
            {playing ? 'Pause' : onLast ? 'Replay' : 'Play'}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 18, color: 'var(--muted)' }}>
          <IconSparkles size={14} />
          <span style={{ fontSize: 12.5 }}>
            <span className="mono" style={{ color: deltaColor, fontWeight: 700 }}>{deltaSign}{Math.abs(totalDelta)}</span>
            {' '}becoming over {frames.length} days
          </span>
        </div>
      </div>
    </Sheet>
  );
}

function PlayGlyph() {
  return <svg width="13" height="13" viewBox="0 0 13 13"><path d="M3 2.2 L11 6.5 L3 10.8 Z" fill="currentColor" /></svg>;
}
function PauseGlyph() {
  return <svg width="13" height="13" viewBox="0 0 13 13"><rect x="3" y="2.4" width="2.6" height="8.2" rx="0.6" fill="currentColor" /><rect x="7.4" y="2.4" width="2.6" height="8.2" rx="0.6" fill="currentColor" /></svg>;
}
