import React, { useState } from 'react';
import { HUDTicks, TickCounter, Pill, SectionHead } from '../components/atoms.jsx';
import { IconChevronRight, IconCopy, IconCheck, IconPlus, IconClose } from '../components/icons.jsx';
import { BRANDS, PIPELINE_STAGES, HOOKS } from '../data.js';
import { useSyncedState } from '../useSyncedState.js';

// ─────────────────────────────────────────────────────────
// SCREEN 3 — Content Studio
// ─────────────────────────────────────────────────────────

const STATUS_OPTIONS = ['Hot', 'On Track', 'Steady', 'Building', 'Cold', 'Paused'];

const statusColors = {
  'Hot':       { bg: 'rgba(255,0,51,0.85)', fg: '#fff' },
  'On Track':  { bg: 'rgba(0, 212, 255, 0.85)', fg: '#06060A' },
  'Steady':    { bg: 'rgba(182, 255, 60, 0.85)', fg: '#06060A' },
  'Cold':      { bg: 'rgba(0, 85, 255, 0.6)', fg: '#fff' },
  'Building':  { bg: 'rgba(255, 210, 60, 0.85)', fg: '#06060A' },
  'Paused':    { bg: 'rgba(138, 138, 149, 0.85)', fg: '#06060A' },
};

// Brand tile (2-column grid) — tap to select for editing
function BrandTile({ brand, selected, onSelect }) {
  const isLight = brand.id === 'ppp' || brand.id === 'ona';
  const fg = isLight ? '#06060A' : '#fff';
  const sub = isLight ? 'rgba(6,6,10,0.6)' : 'rgba(255,255,255,0.7)';
  const s = statusColors[brand.status] || statusColors['Steady'];

  return (
    <div
      className={`pressable ${brand.bgCls}`}
      onClick={onSelect}
      style={{
        borderRadius: 18, padding: 14, aspectRatio: '1 / 1.05',
        position: 'relative', overflow: 'hidden',
        border: selected ? '2px solid #fff' : '1px solid rgba(255,255,255,0.08)',
        boxShadow: `0 14px 36px -14px ${brand.color}, inset 0 1px 0 rgba(255,255,255,0.15)`,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      }}
    >
      {['tl', 'tr', 'bl', 'br'].map((k) => (
        <span key={k} className={`hud-tick ${k}`} style={{ borderColor: isLight ? 'rgba(6,6,10,0.3)' : 'rgba(255,255,255,0.3)' }} />
      ))}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse 80% 60% at 20% 0%, rgba(255,255,255,0.18) 0%, transparent 60%)`,
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', justifyContent: 'flex-end', position: 'relative' }}>
        <span style={{
          padding: '3px 8px', borderRadius: 999, fontFamily: 'var(--font-mono)', fontSize: 8,
          fontWeight: 700, letterSpacing: '0.14em', background: s.bg, color: s.fg, backdropFilter: 'blur(6px)',
        }}>{(brand.status || '').toUpperCase()}</span>
      </div>

      <div style={{ position: 'relative' }}>
        <div className="display" style={{ fontSize: 26, lineHeight: 0.95, color: fg, letterSpacing: '0.04em', textWrap: 'balance' }}>
          {brand.name}
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.16em',
          textTransform: 'uppercase', color: sub, marginTop: 6,
        }}>
          {brand.weeklyGoal} · {brand.posted} POSTED
        </div>
        <div style={{
          marginTop: 8, height: 3, borderRadius: 999,
          background: isLight ? 'rgba(6,6,10,0.15)' : 'rgba(0,0,0,0.3)', overflow: 'hidden',
        }}>
          <div style={{
            width: `${brand.pct}%`, height: '100%',
            background: isLight ? '#06060A' : '#fff',
            boxShadow: isLight ? 'none' : '0 0 6px rgba(255,255,255,0.5)',
            transition: 'width 900ms cubic-bezier(0.2,0.7,0.2,1)',
          }} />
        </div>
      </div>
    </div>
  );
}

// Editor panel for the selected brand
function BrandEditor({ brand, onUpdate, onClose }) {
  return (
    <div className="hud glass" style={{ padding: 14, borderRadius: 16, marginTop: 10 }}>
      <HUDTicks />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div className="display" style={{ fontSize: 20, color: brand.color }}>{brand.name}</div>
        <div className="pressable" onClick={onClose} style={{
          width: 28, height: 28, borderRadius: 999, background: 'rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)',
        }}><IconClose size={15} /></div>
      </div>

      <div className="eyebrow" style={{ marginBottom: 8 }}>Status</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
        {STATUS_OPTIONS.map((st) => {
          const on = brand.status === st;
          const c = statusColors[st];
          return (
            <div key={st} className="pressable" onClick={() => onUpdate({ status: st })} style={{
              padding: '6px 10px', borderRadius: 999, fontFamily: 'var(--font-mono)', fontSize: 9,
              fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
              background: on ? c.bg : 'rgba(255,255,255,0.04)',
              border: `1px solid ${on ? 'transparent' : 'var(--line)'}`,
              color: on ? c.fg : 'var(--muted)',
            }}>{st}</div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Posted this week</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Step onClick={() => onUpdate({ posted: Math.max(0, brand.posted - 1) })}>−</Step>
            <span className="display" style={{ fontSize: 22, color: 'var(--text)', minWidth: 28, textAlign: 'center' }}>{brand.posted}</span>
            <Step onClick={() => onUpdate({ posted: brand.posted + 1 })}>+</Step>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Progress %</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Step onClick={() => onUpdate({ pct: Math.max(0, brand.pct - 5) })}>−</Step>
            <span className="display" style={{ fontSize: 22, color: 'var(--text)', minWidth: 40, textAlign: 'center' }}>{brand.pct}%</span>
            <Step onClick={() => onUpdate({ pct: Math.min(100, brand.pct + 5) })}>+</Step>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step({ children, onClick }) {
  return (
    <div className="pressable" onClick={onClick} style={{
      width: 30, height: 30, borderRadius: 9, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--line)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)', fontSize: 18, fontWeight: 700,
    }}>{children}</div>
  );
}

// Pipeline strip (display only this round)
function PipelineStrip() {
  return (
    <div className="hud glass" style={{ padding: 14, borderRadius: 16 }}>
      <HUDTicks />
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div className="eyebrow">Pipeline</div>
          <div className="section-title" style={{ fontSize: 22, marginTop: 2 }}>IDEA → POSTED</div>
        </div>
        <span className="mono" style={{ fontSize: 10, color: 'var(--muted)' }}>
          {PIPELINE_STAGES.reduce((s, x) => s + x.count, 0)} ITEMS
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'stretch', gap: 0 }}>
        {PIPELINE_STAGES.map((stage, i) => (
          <React.Fragment key={stage.id}>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, background: `${stage.color}18`,
                border: `1px solid ${stage.color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: stage.color, fontFamily: 'var(--font-display)', fontSize: 18, boxShadow: `0 0 12px -3px ${stage.color}`,
              }}>
                <TickCounter value={stage.count} />
              </div>
              <span className="mono" style={{ fontSize: 8, letterSpacing: '0.16em', color: 'var(--muted)', textTransform: 'uppercase' }}>{stage.label}</span>
            </div>
            {i < PIPELINE_STAGES.length - 1 && (
              <div style={{ width: 8, paddingTop: 17, color: 'var(--dim)', display: 'flex', justifyContent: 'center' }}>
                <IconChevronRight size={10} color="var(--dim)" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// Hook bank — tap to copy, plus full CRUD
function HookBank({ hooks, onAdd, onUpdate, onDelete }) {
  const [copied, setCopied] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');

  const copy = (hook, id) => {
    try { navigator.clipboard?.writeText(hook); } catch { /* ignore */ }
    setCopied(id);
    setTimeout(() => setCopied((c) => (c === id ? null : c)), 1400);
  };

  const submitNew = () => {
    if (!draft.trim()) return;
    onAdd({ id: Date.now(), text: draft.trim() });
    setDraft('');
    setAdding(false);
  };

  return (
    <div className="hud glass" style={{ padding: 14, borderRadius: 16 }}>
      <HUDTicks />
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div className="eyebrow">Hook Bank · tap to copy</div>
          <div className="section-title" style={{ fontSize: 22, marginTop: 2 }}>VIRAL OPENERS</div>
        </div>
        <div className="pressable" onClick={() => setAdding((a) => !a)} style={{
          width: 30, height: 30, borderRadius: 9,
          background: adding ? 'rgba(255,255,255,0.06)' : 'rgba(177,76,255,0.14)',
          border: `1px solid ${adding ? 'var(--line-strong)' : 'rgba(177,76,255,0.4)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: adding ? 'var(--muted)' : 'var(--violet)',
        }}>{adding ? <IconClose size={15} /> : <IconPlus size={16} />}</div>
      </div>

      {adding && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitNew()} placeholder="New hook…" style={{ ...hkInp, flex: 1 }} />
          <div className="pressable" onClick={submitNew} style={{
            width: 44, borderRadius: 10, background: 'linear-gradient(135deg, #B14CFF, #FF3CC8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
          }}><IconCheck size={16} stroke={2.4} /></div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {hooks.map((hook, i) => {
          const isCopied = copied === hook.id;
          const isEditing = editingId === hook.id;
          if (isEditing) {
            return (
              <div key={hook.id} style={{ display: 'flex', gap: 8 }}>
                <input value={hook.text} onChange={(e) => onUpdate(hook.id, { text: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && setEditingId(null)} autoFocus style={{ ...hkInp, flex: 1 }} />
                <div className="pressable" onClick={() => onDelete(hook.id)} style={{
                  width: 40, borderRadius: 10, background: 'rgba(255,0,51,0.12)', border: '1px solid rgba(255,0,51,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ona-red)',
                }}><IconClose size={15} /></div>
                <div className="pressable" onClick={() => setEditingId(null)} style={{
                  width: 40, borderRadius: 10, background: 'rgba(182,255,60,0.12)', border: '1px solid rgba(182,255,60,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--lime)',
                }}><IconCheck size={15} stroke={2.4} /></div>
              </div>
            );
          }
          return (
            <div key={hook.id} style={{
              padding: '10px 12px',
              background: isCopied ? 'rgba(182,255,60,0.10)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${isCopied ? 'rgba(182,255,60,0.5)' : 'var(--line)'}`,
              borderRadius: 10, display: 'flex', alignItems: 'flex-start', gap: 10, transition: 'all 240ms',
            }}>
              <span className="mono" style={{ fontSize: 10, color: isCopied ? 'var(--lime)' : 'var(--dim)', flexShrink: 0, fontWeight: 700, marginTop: 2 }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="pressable" onClick={() => copy(hook.text, hook.id)} style={{ flex: 1, fontSize: 13, lineHeight: 1.35, color: 'var(--text)', textWrap: 'pretty' }}>
                {hook.text}
              </span>
              <span className="pressable" onClick={() => setEditingId(hook.id)} style={{ color: 'var(--dim)', flexShrink: 0, marginTop: 1, fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em' }}>EDIT</span>
              <span className="pressable" onClick={() => copy(hook.text, hook.id)} style={{ color: isCopied ? 'var(--lime)' : 'var(--dim)', flexShrink: 0, marginTop: 1 }}>
                {isCopied ? <IconCheck size={14} stroke={2.4} /> : <IconCopy size={14} />}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const hkInp = {
  width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)',
  borderRadius: 10, padding: '9px 11px', color: 'var(--text)', fontSize: 13, outline: 'none',
  fontFamily: 'var(--font-body)', boxSizing: 'border-box',
};

// 7-day calendar strip (display only)
function PostingCalendar() {
  const days = [
    { d: 'WED', n: 27, posts: [{ c: '#FF0033' }, { c: '#B6FF3C' }], today: true },
    { d: 'THU', n: 28, posts: [{ c: '#0055FF' }] },
    { d: 'FRI', n: 29, posts: [{ c: '#FF8A3C' }, { c: '#FF0033' }] },
    { d: 'SAT', n: 30, posts: [] },
    { d: 'SUN', n: 31, posts: [{ c: '#B14CFF' }] },
    { d: 'MON', n: 1, posts: [{ c: '#FF0033' }, { c: '#0055FF' }, { c: '#B6FF3C' }] },
    { d: 'TUE', n: 2, posts: [{ c: '#FF3CC8' }] },
  ];

  return (
    <div className="hud glass" style={{ padding: 14, borderRadius: 16 }}>
      <HUDTicks />
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div className="eyebrow">7-day calendar</div>
          <div className="section-title" style={{ fontSize: 22, marginTop: 2 }}>POSTING</div>
        </div>
        <span className="mono" style={{ fontSize: 10, color: 'var(--muted)' }}>
          {days.reduce((s, d) => s + d.posts.length, 0)} SCHEDULED
        </span>
      </div>

      <div style={{ display: 'flex', gap: 4 }}>
        {days.map((day, i) => (
          <div key={i} className="pressable" style={{
            flex: 1, minHeight: 88, borderRadius: 10, padding: '8px 4px',
            background: day.today ? 'rgba(0, 212, 255, 0.08)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${day.today ? 'rgba(0, 212, 255, 0.5)' : 'var(--line)'}`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
            boxShadow: day.today ? '0 0 18px -6px rgba(0,212,255,0.6)' : 'none',
          }}>
            <span className="mono" style={{ fontSize: 8, letterSpacing: '0.12em', color: day.today ? 'var(--cyan)' : 'var(--dim)', fontWeight: 700 }}>{day.d}</span>
            <span className="display" style={{ fontSize: 18, color: day.today ? 'var(--cyan)' : 'var(--text)', lineHeight: 1 }}>{day.n}</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center', marginTop: 'auto' }}>
              {day.posts.map((p, j) => (
                <div key={j} style={{ width: 16, height: 3, borderRadius: 999, background: p.c, boxShadow: `0 0 4px ${p.c}` }} />
              ))}
              {day.posts.length === 0 && <span className="mono" style={{ fontSize: 8, color: 'var(--dim)' }}>—</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Content Studio screen
// ─────────────────────────────────────────────────────────
function ContentStudio() {
  const [content, setContent] = useSyncedState('lifeos:content', {
    brands: BRANDS,
    hooks: HOOKS.map((text, i) => ({ id: i + 1, text })),
  });
  const [selected, setSelected] = useState(null);

  const brands = content.brands ?? BRANDS;
  const hooks = content.hooks ?? [];

  const updateBrand = (id, patch) =>
    setContent((c) => ({ ...c, brands: (c.brands ?? BRANDS).map((b) => (b.id === id ? { ...b, ...patch } : b)) }));
  const addHook = (h) => setContent((c) => ({ ...c, hooks: [h, ...(c.hooks ?? [])] }));
  const updateHook = (id, patch) =>
    setContent((c) => ({ ...c, hooks: (c.hooks ?? []).map((h) => (h.id === id ? { ...h, ...patch } : h)) }));
  const deleteHook = (id) => setContent((c) => ({ ...c, hooks: (c.hooks ?? []).filter((h) => h.id !== id) }));

  const selectedBrand = brands.find((b) => b.id === selected);

  return (
    <div className="screen-content" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="hud glass-strong mesh-content" style={{ padding: 16, borderRadius: 20 }}>
        <HUDTicks />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className="eyebrow">Studio · Week 21</div>
            <div className="display" style={{ fontSize: 30, marginTop: 2, lineHeight: 1 }}>SIX BRANDS · ONE FEED</div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>
              {brands.reduce((s, b) => s + (b.posted || 0), 0)} POSTS THIS WEEK · TAP A BRAND TO EDIT
            </div>
          </div>
          <Pill variant="violet" dot="#B14CFF">LIVE</Pill>
        </div>
      </div>

      <div>
        <SectionHead eyebrow="6 brands · tap to edit" title="BRAND OS" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {brands.map((b) => (
            <BrandTile key={b.id} brand={b} selected={selected === b.id} onSelect={() => setSelected(selected === b.id ? null : b.id)} />
          ))}
        </div>
        {selectedBrand && (
          <BrandEditor brand={selectedBrand} onUpdate={(patch) => updateBrand(selectedBrand.id, patch)} onClose={() => setSelected(null)} />
        )}
      </div>

      <PipelineStrip />
      <HookBank hooks={hooks} onAdd={addHook} onUpdate={updateHook} onDelete={deleteHook} />
      <PostingCalendar />
    </div>
  );
}

export { ContentStudio, BrandTile, PipelineStrip, HookBank, PostingCalendar };
