import React, { useState } from 'react';
import { HUDTicks, TickCounter, Pill, SectionHead, ProgressBar } from '../components/atoms.jsx';
import { IconChevronRight, IconCopy, IconCheck, IconPlus, IconClose } from '../components/icons.jsx';
import { BRANDS, PIPELINE_STAGES, HOOKS, SEED_FOLDERS } from '../data.js';
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

// Pipeline strip — live counts from real content items
function PipelineStrip({ items = [] }) {
  const countFor = (stageId) => items.filter((it) => it.stage === stageId).length;
  return (
    <div className="hud glass" style={{ padding: 14, borderRadius: 16 }}>
      <HUDTicks />
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div className="eyebrow">Pipeline</div>
          <div className="section-title" style={{ fontSize: 22, marginTop: 2 }}>IDEA → POSTED</div>
        </div>
        <span className="mono" style={{ fontSize: 10, color: 'var(--muted)' }}>{items.length} ITEMS</span>
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
                <TickCounter value={countFor(stage.id)} />
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

// ── Content tracker — items moving through the pipeline ──
function ContentItemRow({ item, brands, onUpdate, onDelete }) {
  const [open, setOpen] = useState(false);
  const stage = PIPELINE_STAGES.find((s) => s.id === item.stage) || PIPELINE_STAGES[0];
  const brand = brands.find((b) => b.id === item.brandId);
  const stageIdx = PIPELINE_STAGES.findIndex((s) => s.id === item.stage);

  return (
    <div style={{ borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: `1px solid ${open ? stage.color : 'var(--line)'}`, transition: 'border-color 200ms' }}>
      <div className="pressable" onClick={() => setOpen((o) => !o)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px' }}>
        <span style={{ width: 8, height: 8, borderRadius: 999, background: brand?.color || '#8A8A95', boxShadow: `0 0 8px ${brand?.color || '#8A8A95'}`, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500, lineHeight: 1.25, textWrap: 'pretty' }}>{item.title}</div>
          <div className="mono" style={{ fontSize: 9, color: 'var(--dim)', marginTop: 3, letterSpacing: '0.1em' }}>{(brand?.name || 'NO BRAND').toUpperCase()}</div>
        </div>
        <span style={{ padding: '3px 8px', borderRadius: 999, background: `${stage.color}18`, border: `1px solid ${stage.color}60`, color: stage.color, fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', flexShrink: 0 }}>{stage.label}</span>
      </div>

      {open && (
        <div style={{ padding: '0 12px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input value={item.title} onChange={(e) => onUpdate({ title: e.target.value })} placeholder="Title" style={ctInp} />
          <div>
            <div className="eyebrow" style={{ marginBottom: 6 }}>Stage</div>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {PIPELINE_STAGES.map((s, i) => {
                const on = item.stage === s.id;
                return (
                  <div key={s.id} className="pressable" onClick={() => onUpdate({ stage: s.id })} style={{
                    padding: '5px 8px', borderRadius: 999, fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 700,
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    background: on ? `${s.color}20` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${on ? s.color : 'var(--line)'}`, color: on ? s.color : (i <= stageIdx ? 'var(--muted)' : 'var(--dim)'),
                  }}>{s.label}</div>
                );
              })}
            </div>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 6 }}>Brand</div>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {brands.map((b) => {
                const on = item.brandId === b.id;
                return (
                  <div key={b.id} className="pressable" onClick={() => onUpdate({ brandId: b.id })} style={{
                    padding: '5px 9px', borderRadius: 999, fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 700, letterSpacing: '0.06em',
                    background: on ? `${b.color}20` : 'rgba(255,255,255,0.04)', border: `1px solid ${on ? b.color : 'var(--line)'}`,
                    color: on ? b.color : 'var(--muted)', display: 'flex', alignItems: 'center', gap: 5,
                  }}>
                    <span style={{ width: 5, height: 5, borderRadius: 999, background: b.color }} />
                    {b.name}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="pressable" onClick={onDelete} style={{ alignSelf: 'flex-start', padding: '6px 12px', borderRadius: 10, background: 'rgba(255,0,51,0.1)', border: '1px solid rgba(255,0,51,0.4)', color: 'var(--ona-red)', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', fontWeight: 700 }}>DELETE</div>
        </div>
      )}
    </div>
  );
}

const ctInp = {
  width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)',
  borderRadius: 10, padding: '9px 11px', color: 'var(--text)', fontSize: 14, outline: 'none',
  fontFamily: 'var(--font-body)', boxSizing: 'border-box',
};

function ContentPipeline({ items, brands, onAdd, onUpdate, onDelete }) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [brandId, setBrandId] = useState(brands[0]?.id);

  const submit = () => {
    if (!title.trim()) return;
    onAdd({ id: Date.now(), title: title.trim(), brandId: brandId || brands[0]?.id, stage: 'idea' });
    setTitle('');
    setAdding(false);
  };

  // sort by pipeline stage order, then newest
  const order = PIPELINE_STAGES.map((s) => s.id);
  const sorted = [...items].sort((a, b) => order.indexOf(a.stage) - order.indexOf(b.stage) || b.id - a.id);

  return (
    <div className="hud glass" style={{ padding: 14, borderRadius: 16 }}>
      <HUDTicks />
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div className="eyebrow">In production · tap to move</div>
          <div className="section-title" style={{ fontSize: 22, marginTop: 2 }}>CONTENT</div>
        </div>
        <div className="pressable" onClick={() => setAdding((a) => !a)} style={{
          width: 30, height: 30, borderRadius: 9,
          background: adding ? 'rgba(255,255,255,0.06)' : 'rgba(0,212,255,0.12)',
          border: `1px solid ${adding ? 'var(--line-strong)' : 'rgba(0,212,255,0.4)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: adding ? 'var(--muted)' : 'var(--cyan)',
        }}>{adding ? <IconClose size={15} /> : <IconPlus size={16} />}</div>
      </div>

      {adding && (
        <div style={{ marginBottom: 12, padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--line)' }}>
          <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} placeholder="Content idea…" style={{ ...ctInp, marginBottom: 10 }} />
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
            {brands.map((b) => {
              const on = brandId === b.id;
              return (
                <div key={b.id} className="pressable" onClick={() => setBrandId(b.id)} style={{
                  padding: '5px 9px', borderRadius: 999, fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 700, letterSpacing: '0.06em',
                  background: on ? `${b.color}20` : 'rgba(255,255,255,0.04)', border: `1px solid ${on ? b.color : 'var(--line)'}`,
                  color: on ? b.color : 'var(--muted)', display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: 999, background: b.color }} />
                  {b.name}
                </div>
              );
            })}
          </div>
          <div className="pressable" onClick={submit} style={{ height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #00D4FF, #B14CFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#06060A', fontWeight: 700, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            <IconPlus size={15} stroke={2.4} /> Add to pipeline
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {sorted.length === 0 && (
          <div className="eyebrow" style={{ color: 'var(--dim)', padding: '6px 0' }}>No content yet — tap + to capture an idea.</div>
        )}
        {sorted.map((it) => (
          <ContentItemRow key={it.id} item={it} brands={brands} onUpdate={(patch) => onUpdate(it.id, patch)} onDelete={() => onDelete(it.id)} />
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

// 7-day calendar strip — real current week, tap a day to schedule posts
const POST_PALETTE = ['#FF0033', '#0055FF', '#B6FF3C', '#FF8A3C', '#B14CFF', '#FF3CC8'];

function ckey(d) {
  const p = (x) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
function weekDays() {
  const names = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const base = new Date();
  const out = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    out.push({ key: ckey(d), d: names[d.getDay()], n: d.getDate(), today: i === 0 });
  }
  return out;
}

function PostingCalendar({ calendar = {}, onCycle }) {
  const days = weekDays();
  const total = days.reduce((s, day) => s + (calendar[day.key] || 0), 0);

  return (
    <div className="hud glass" style={{ padding: 14, borderRadius: 16 }}>
      <HUDTicks />
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div className="eyebrow">This week · tap a day</div>
          <div className="section-title" style={{ fontSize: 22, marginTop: 2 }}>POSTING</div>
        </div>
        <span className="mono" style={{ fontSize: 10, color: 'var(--muted)' }}>{total} SCHEDULED</span>
      </div>

      <div style={{ display: 'flex', gap: 4 }}>
        {days.map((day) => {
          const posts = calendar[day.key] || 0;
          return (
            <div key={day.key} className="pressable" onClick={() => onCycle(day.key)} style={{
              flex: 1, minHeight: 88, borderRadius: 10, padding: '8px 4px',
              background: day.today ? 'rgba(0, 212, 255, 0.08)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${day.today ? 'rgba(0, 212, 255, 0.5)' : 'var(--line)'}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              boxShadow: day.today ? '0 0 18px -6px rgba(0,212,255,0.6)' : 'none',
            }}>
              <span className="mono" style={{ fontSize: 8, letterSpacing: '0.12em', color: day.today ? 'var(--cyan)' : 'var(--dim)', fontWeight: 700 }}>{day.d}</span>
              <span className="display" style={{ fontSize: 18, color: day.today ? 'var(--cyan)' : 'var(--text)', lineHeight: 1 }}>{day.n}</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center', marginTop: 'auto' }}>
                {Array.from({ length: posts }).map((_, j) => {
                  const c = POST_PALETTE[j % POST_PALETTE.length];
                  return <div key={j} style={{ width: 16, height: 3, borderRadius: 999, background: c, boxShadow: `0 0 4px ${c}` }} />;
                })}
                {posts === 0 && <span className="mono" style={{ fontSize: 8, color: 'var(--dim)' }}>—</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Projects & Steps — fully customizable in-app project system
// ─────────────────────────────────────────────────────────
const miniBtn = {
  width: 26, height: 26, borderRadius: 7, flexShrink: 0,
  background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 13,
};

function StepRow({ step, onToggle, onText, onDelete, onUp, onDown, canUp, canDown }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div className="pressable" onClick={onToggle} style={{
        width: 22, height: 22, borderRadius: 7, flexShrink: 0,
        border: `1.5px solid ${step.done ? 'var(--lime)' : 'var(--line-strong)'}`,
        background: step.done ? 'var(--lime)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {step.done && <IconCheck size={13} color="#06060A" stroke={3} />}
      </div>
      <input value={step.text} onChange={(e) => onText(e.target.value)} placeholder="Step"
        style={{ ...ctInp, flex: 1, padding: '7px 9px', fontSize: 13, textDecoration: step.done ? 'line-through' : 'none', opacity: step.done ? 0.6 : 1 }} />
      <div className="pressable" onClick={onUp} style={{ ...miniBtn, opacity: canUp ? 1 : 0.3 }}>↑</div>
      <div className="pressable" onClick={onDown} style={{ ...miniBtn, opacity: canDown ? 1 : 0.3 }}>↓</div>
      <div className="pressable" onClick={onDelete} style={{ ...miniBtn, color: 'var(--ona-red)' }}><IconClose size={13} /></div>
    </div>
  );
}

function ProjectCard({ project, brands, onUpdate, onDelete, onStepsChange }) {
  const [open, setOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(false);
  const [newStep, setNewStep] = useState('');
  const steps = project.steps || [];
  const done = steps.filter((s) => s.done).length;
  const pct = steps.length ? Math.round((done / steps.length) * 100) : 0;
  const brand = brands.find((b) => b.id === project.brandId);
  const color = brand?.color || '#00D4FF';

  const addStep = () => { if (!newStep.trim()) return; onStepsChange([...steps, { id: Date.now(), text: newStep.trim(), done: false }]); setNewStep(''); };
  const setStep = (id, patch) => onStepsChange(steps.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const delStep = (id) => onStepsChange(steps.filter((s) => s.id !== id));
  const move = (i, dir) => { const j = i + dir; if (j < 0 || j >= steps.length) return; const a = [...steps]; [a[i], a[j]] = [a[j], a[i]]; onStepsChange(a); };

  return (
    <div style={{ borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: `1px solid ${open ? color : 'var(--line)'}`, transition: 'border-color 200ms' }}>
      <div className="pressable" onClick={() => setOpen((o) => !o)} style={{ padding: '12px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: color, boxShadow: `0 0 8px ${color}`, flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', lineHeight: 1.25, textWrap: 'pretty' }}>{project.title}</div>
            <div className="mono" style={{ fontSize: 9, color: 'var(--dim)', marginTop: 2, letterSpacing: '0.1em' }}>{brands.length ? `${(brand?.name || 'NO BRAND').toUpperCase()} · ` : ''}{done}/{steps.length} STEPS</div>
          </div>
          <span className="display" style={{ fontSize: 18, color }}>{pct}%</span>
        </div>
        <div style={{ marginTop: 10 }}><ProgressBar value={pct} color={color} height={4} /></div>
      </div>

      {open && (
        <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {editTitle ? (
            <input autoFocus value={project.title} onChange={(e) => onUpdate({ title: e.target.value })} onBlur={() => setEditTitle(false)} onKeyDown={(e) => e.key === 'Enter' && setEditTitle(false)} style={ctInp} />
          ) : (
            <div className="pressable mono" onClick={() => setEditTitle(true)} style={{ fontSize: 10, color: 'var(--cyan)', letterSpacing: '0.12em' }}>RENAME PROJECT</div>
          )}

          <div className="eyebrow">Steps</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {steps.length === 0 && <div className="eyebrow" style={{ color: 'var(--dim)' }}>No steps yet — add the first one below.</div>}
            {steps.map((s, i) => (
              <StepRow key={s.id} step={s} onToggle={() => setStep(s.id, { done: !s.done })} onText={(t) => setStep(s.id, { text: t })} onDelete={() => delStep(s.id)} onUp={() => move(i, -1)} onDown={() => move(i, 1)} canUp={i > 0} canDown={i < steps.length - 1} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={newStep} onChange={(e) => setNewStep(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addStep()} placeholder="Add a step…" style={{ ...ctInp, flex: 1 }} />
            <div className="pressable" onClick={addStep} style={{ width: 44, borderRadius: 10, background: 'linear-gradient(135deg, #00D4FF, #B14CFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#06060A' }}><IconPlus size={16} stroke={2.4} /></div>
          </div>

          {brands.length > 0 && (
            <>
              <div className="eyebrow">Brand</div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {brands.map((b) => {
                  const on = project.brandId === b.id;
                  return (
                    <div key={b.id} className="pressable" onClick={() => onUpdate({ brandId: b.id })} style={{
                      padding: '5px 9px', borderRadius: 999, fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 700, letterSpacing: '0.06em',
                      background: on ? `${b.color}20` : 'rgba(255,255,255,0.04)', border: `1px solid ${on ? b.color : 'var(--line)'}`,
                      color: on ? b.color : 'var(--muted)', display: 'flex', alignItems: 'center', gap: 5,
                    }}>
                      <span style={{ width: 5, height: 5, borderRadius: 999, background: b.color }} />{b.name}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          <div className="pressable" onClick={onDelete} style={{ alignSelf: 'flex-start', padding: '6px 12px', borderRadius: 10, background: 'rgba(255,0,51,0.1)', border: '1px solid rgba(255,0,51,0.4)', color: 'var(--ona-red)', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', fontWeight: 700 }}>DELETE PROJECT</div>
        </div>
      )}
    </div>
  );
}

function Projects({ projects, brands, onAdd, onUpdate, onDelete }) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const submit = () => { if (!title.trim()) return; onAdd({ id: Date.now(), title: title.trim(), brandId: brands[0]?.id, steps: [] }); setTitle(''); setAdding(false); };

  return (
    <div className="hud glass" style={{ padding: 14, borderRadius: 16 }}>
      <HUDTicks />
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div className="eyebrow">{projects.length} active · tap to manage</div>
          <div className="section-title" style={{ fontSize: 22, marginTop: 2 }}>PROJECTS</div>
        </div>
        <div className="pressable" onClick={() => setAdding((a) => !a)} style={{ width: 30, height: 30, borderRadius: 9, background: adding ? 'rgba(255,255,255,0.06)' : 'rgba(0,212,255,0.12)', border: `1px solid ${adding ? 'var(--line-strong)' : 'rgba(0,212,255,0.4)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: adding ? 'var(--muted)' : 'var(--cyan)' }}>{adding ? <IconClose size={15} /> : <IconPlus size={16} />}</div>
      </div>

      {adding && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} placeholder="New project or idea…" style={{ ...ctInp, flex: 1 }} />
          <div className="pressable" onClick={submit} style={{ width: 44, borderRadius: 10, background: 'linear-gradient(135deg, #00D4FF, #B14CFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#06060A' }}><IconCheck size={16} stroke={2.4} /></div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {projects.length === 0 && <div className="eyebrow" style={{ color: 'var(--dim)', padding: '6px 0' }}>No projects yet — tap + to capture an idea or start one.</div>}
        {projects.map((p) => (
          <ProjectCard key={p.id} project={p} brands={brands} onUpdate={(patch) => onUpdate(p.id, patch)} onDelete={() => onDelete(p.id)} onStepsChange={(steps) => onUpdate(p.id, { steps })} />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Folders / Spaces — one per brand or life area
// ─────────────────────────────────────────────────────────
const FOLDER_COLORS = ['#FF0033', '#FFD23C', '#B6FF3C', '#00D4FF', '#FF3CC8', '#FF8A3C', '#B14CFF'];
const FOLDER_EMOJIS = ['🥷', '💪', '🤸', '🏆', '🎬', '🎥', '📱', '📈', '🔥', '⚡', '🎯', '❤️', '🏋️', '🧗', '🌀', '✨', '💡', '📁'];

function getCaptures() {
  try { return JSON.parse(localStorage.getItem('lifeos:captures') || '[]'); } catch { return []; }
}

function NoteCard({ note, onUpdate, onDelete }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: `1px solid ${open ? 'var(--cyan)' : 'var(--line)'}`, transition: 'border-color 200ms' }}>
      <div className="pressable" onClick={() => setOpen((o) => !o)} style={{ padding: '10px 12px' }}>
        <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500 }}>{note.title || 'Untitled note'}</div>
        {!open && note.body && (
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{note.body}</div>
        )}
      </div>
      {open && (
        <div style={{ padding: '0 12px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input autoFocus value={note.title} onChange={(e) => onUpdate({ title: e.target.value })} placeholder="Title" style={ctInp} />
          <textarea value={note.body} onChange={(e) => onUpdate({ body: e.target.value })} placeholder="Write it down…" rows={5}
            style={{ ...ctInp, resize: 'vertical', lineHeight: 1.5 }} />
          <div className="pressable" onClick={onDelete} style={{ alignSelf: 'flex-start', padding: '6px 12px', borderRadius: 10, background: 'rgba(255,0,51,0.1)', border: '1px solid rgba(255,0,51,0.4)', color: 'var(--ona-red)', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', fontWeight: 700 }}>DELETE NOTE</div>
        </div>
      )}
    </div>
  );
}

function FolderSheet({ folder, onUpdate, onDelete, onClose }) {
  const [showCaptures, setShowCaptures] = useState(false);
  if (!folder) return null;
  const notes = folder.notes || [];
  const projects = folder.projects || [];
  const captures = getCaptures();

  const addNote = () => onUpdate({ notes: [{ id: Date.now(), title: '', body: '' }, ...notes] });
  const updNote = (id, patch) => onUpdate({ notes: notes.map((n) => (n.id === id ? { ...n, ...patch } : n)) });
  const delNote = (id) => onUpdate({ notes: notes.filter((n) => n.id !== id) });
  const importCapture = (c) => { onUpdate({ notes: [{ id: Date.now(), title: c.text, body: '' }, ...notes] }); setShowCaptures(false); };

  const addProj = (p) => onUpdate({ projects: [p, ...projects] });
  const updProj = (id, patch) => onUpdate({ projects: projects.map((p) => (p.id === id ? { ...p, ...patch } : p)) });
  const delProj = (id) => onUpdate({ projects: projects.filter((p) => p.id !== id) });

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="sheet" style={{ maxHeight: '88%', overflowY: 'auto' }}>
        <div className="sheet-handle" />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: 26, flexShrink: 0, lineHeight: 1 }}>{folder.emoji || '📁'}</span>
            <input value={folder.name} onChange={(e) => onUpdate({ name: e.target.value })}
              style={{ flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text)', fontFamily: 'var(--font-display)', fontSize: 26, letterSpacing: '0.02em' }} />
          </div>
          <div className="pressable" onClick={onClose} style={{ width: 32, height: 32, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.06)', color: 'var(--muted)', flexShrink: 0 }}><IconClose size={16} /></div>
        </div>

        {/* color + emoji + pin */}
        <div style={{ display: 'flex', gap: 7, marginBottom: 10, flexWrap: 'wrap' }}>
          {FOLDER_COLORS.map((c) => (
            <div key={c} className="pressable" onClick={() => onUpdate({ color: c })} style={{
              width: 24, height: 24, borderRadius: 999, background: c,
              border: folder.color === c ? '2px solid #fff' : '2px solid transparent',
            }} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
          {FOLDER_EMOJIS.map((e) => (
            <div key={e} className="pressable" onClick={() => onUpdate({ emoji: e })} style={{
              width: 30, height: 30, borderRadius: 8, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: folder.emoji === e ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${folder.emoji === e ? 'var(--cyan)' : 'var(--line)'}`,
            }}>{e}</div>
          ))}
        </div>
        <div className="pressable" onClick={() => onUpdate({ pinned: !folder.pinned })} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999, marginBottom: 18,
          background: folder.pinned ? 'rgba(255,210,60,0.14)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${folder.pinned ? 'rgba(255,210,60,0.5)' : 'var(--line)'}`,
          color: folder.pinned ? 'var(--gold)' : 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', fontWeight: 700,
        }}>{folder.pinned ? '★ PINNED' : '☆ PIN TO TOP'}</div>

        {/* Notes */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 10 }}>
          <div className="section-title" style={{ fontSize: 18 }}>NOTES</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {captures.length > 0 && (
              <div className="pressable mono" onClick={() => setShowCaptures((s) => !s)} style={{ display: 'flex', alignItems: 'center', padding: '0 10px', height: 30, borderRadius: 9, background: showCaptures ? 'rgba(255,255,255,0.06)' : 'rgba(177,76,255,0.14)', border: `1px solid ${showCaptures ? 'var(--line-strong)' : 'rgba(177,76,255,0.4)'}`, color: showCaptures ? 'var(--muted)' : 'var(--violet)', fontSize: 9, letterSpacing: '0.1em', fontWeight: 700 }}>CAPTURES</div>
            )}
            <div className="pressable" onClick={addNote} style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cyan)' }}><IconPlus size={16} /></div>
          </div>
        </div>

        {showCaptures && (
          <div style={{ marginBottom: 12, padding: 10, borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--line)' }}>
            <div className="eyebrow" style={{ marginBottom: 8, color: 'var(--violet)' }}>Tap a capture to pull it in as a note</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflowY: 'auto' }}>
              {captures.slice(0, 20).map((c) => (
                <div key={c.id} className="pressable" onClick={() => importCapture(c)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--line)' }}>
                  <span style={{ width: 6, height: 6, borderRadius: 999, background: c.color || '#00D4FF', flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13, color: 'var(--text)', lineHeight: 1.3 }}>{c.text}</span>
                  <IconPlus size={14} color="var(--cyan)" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
          {notes.length === 0 && <div className="eyebrow" style={{ color: 'var(--dim)' }}>No notes yet — tap + to jot something down.</div>}
          {notes.map((n) => (
            <NoteCard key={n.id} note={n} onUpdate={(patch) => updNote(n.id, patch)} onDelete={() => delNote(n.id)} />
          ))}
        </div>

        {/* Projects (reused, no brand tagging inside a folder) */}
        <Projects projects={projects} brands={[]} onAdd={addProj} onUpdate={updProj} onDelete={delProj} />

        {/* Delete folder */}
        <div className="pressable" onClick={() => { if (window.confirm(`Delete the "${folder.name}" folder and everything in it?`)) onDelete(); }}
          style={{ marginTop: 16, textAlign: 'center', padding: '10px', borderRadius: 12, background: 'rgba(255,0,51,0.08)', border: '1px solid rgba(255,0,51,0.3)', color: 'var(--ona-red)', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', fontWeight: 700 }}>
          DELETE FOLDER
        </div>
        <div style={{ height: 8 }} />
      </div>
    </>
  );
}

function FoldersSection({ folders, onAdd, onOpen }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const submit = () => {
    if (!name.trim()) return;
    onAdd({ id: Date.now(), name: name.trim(), color: FOLDER_COLORS[folders.length % FOLDER_COLORS.length], emoji: '📁', pinned: false, notes: [], projects: [] });
    setName(''); setAdding(false);
  };

  const ordered = [...folders].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  return (
    <div>
      <SectionHead eyebrow="Tap a folder to open it" title="WORKSPACE" trailing={
        <div className="pressable" onClick={() => setAdding((a) => !a)} style={{ width: 30, height: 30, borderRadius: 9, background: adding ? 'rgba(255,255,255,0.06)' : 'rgba(0,212,255,0.12)', border: `1px solid ${adding ? 'var(--line-strong)' : 'rgba(0,212,255,0.4)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: adding ? 'var(--muted)' : 'var(--cyan)' }}>{adding ? <IconClose size={15} /> : <IconPlus size={16} />}</div>
      } />

      {adding && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} placeholder="New folder (brand or life area)…" style={{ ...ctInp, flex: 1 }} />
          <div className="pressable" onClick={submit} style={{ width: 44, borderRadius: 10, background: 'linear-gradient(135deg, #00D4FF, #B14CFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#06060A' }}><IconCheck size={16} stroke={2.4} /></div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {ordered.map((f) => {
          const noteN = (f.notes || []).length;
          const projN = (f.projects || []).length;
          return (
            <div key={f.id} className="pressable hud" onClick={() => onOpen(f.id)} style={{
              position: 'relative', padding: 14, borderRadius: 16, minHeight: 96,
              background: `linear-gradient(135deg, ${f.color}14, rgba(11,11,18,0.5))`,
              border: `1px solid ${f.color}50`, boxShadow: `0 10px 30px -16px ${f.color}`,
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            }}>
              <HUDTicks />
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 24, lineHeight: 1 }}>{f.emoji || '📁'}</span>
                {f.pinned && <span style={{ color: 'var(--gold)', fontSize: 12 }}>★</span>}
              </div>
              <div>
                <div className="display" style={{ fontSize: 19, color: 'var(--text)', letterSpacing: '0.02em', lineHeight: 1, textWrap: 'balance' }}>{f.name}</div>
                <div className="mono" style={{ fontSize: 8, color: 'var(--muted)', marginTop: 6, letterSpacing: '0.12em' }}>{noteN} NOTES · {projN} PROJECTS</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Content Studio screen
// ─────────────────────────────────────────────────────────
function ContentStudio() {
  const [content, setContent] = useSyncedState('lifeos:content', {
    hooks: HOOKS.map((text, i) => ({ id: i + 1, text })),
  });
  const [folders, setFolders] = useSyncedState('lifeos:folders', SEED_FOLDERS);
  const [openFolderId, setOpenFolderId] = useState(null);

  const addFolder = (f) => setFolders((fs) => [...fs, f]);
  const updateFolder = (id, patch) => setFolders((fs) => fs.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  const deleteFolder = (id) => { setFolders((fs) => fs.filter((f) => f.id !== id)); setOpenFolderId(null); };

  const hooks = content.hooks ?? [];
  const calendar = content.calendar ?? {};
  const addHook = (h) => setContent((c) => ({ ...c, hooks: [h, ...(c.hooks ?? [])] }));
  const updateHook = (id, patch) =>
    setContent((c) => ({ ...c, hooks: (c.hooks ?? []).map((h) => (h.id === id ? { ...h, ...patch } : h)) }));
  const deleteHook = (id) => setContent((c) => ({ ...c, hooks: (c.hooks ?? []).filter((h) => h.id !== id) }));
  const cycleDay = (key) =>
    setContent((c) => {
      const cur = (c.calendar?.[key]) || 0;
      return { ...c, calendar: { ...(c.calendar || {}), [key]: (cur + 1) % 5 } };
    });

  const totalProjects = folders.reduce((s, f) => s + (f.projects || []).length, 0);
  const currentFolder = folders.find((f) => f.id === openFolderId);

  return (
    <div className="screen-content" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="hud glass-strong mesh-content" style={{ padding: 16, borderRadius: 20 }}>
        <HUDTicks />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className="eyebrow">Studio</div>
            <div className="display" style={{ fontSize: 30, marginTop: 2, lineHeight: 1 }}>CREATE · BUILD · TRACK</div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>
              {folders.length} FOLDERS · {totalProjects} PROJECTS
            </div>
          </div>
          <Pill variant="violet" dot="#B14CFF">LIVE</Pill>
        </div>
      </div>

      <FoldersSection folders={folders} onAdd={addFolder} onOpen={setOpenFolderId} />

      <HookBank hooks={hooks} onAdd={addHook} onUpdate={updateHook} onDelete={deleteHook} />
      <PostingCalendar calendar={calendar} onCycle={cycleDay} />

      <FolderSheet
        folder={currentFolder}
        onUpdate={(patch) => updateFolder(openFolderId, patch)}
        onDelete={() => deleteFolder(openFolderId)}
        onClose={() => setOpenFolderId(null)}
      />
    </div>
  );
}

export { ContentStudio, BrandTile, PipelineStrip, HookBank, PostingCalendar };
