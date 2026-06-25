import { useState } from 'react';
import { HUDTicks, TickCounter, Pill, ProgressBar, EmptyState } from '../components/atoms.jsx';
import { IconWarn, IconPlus, IconClose, IconCheck, IconActivity } from '../components/icons.jsx';
import { ONA_STATS, SALES_STAGES, COACHES, BENCH, INITIATIVES } from '../data.js';
import { useSyncedState } from '../useSyncedState.js';

// ─────────────────────────────────────────────────────────
// SCREEN 4 — ONA HQ (fully editable + synced)
// ─────────────────────────────────────────────────────────

const inp = {
  width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)',
  borderRadius: 10, padding: '8px 10px', color: 'var(--text)', fontSize: 13, outline: 'none',
  fontFamily: 'var(--font-body)', boxSizing: 'border-box',
};

function Stepper({ children, onClick }) {
  return (
    <div className="pressable" onClick={onClick} style={{
      width: 26, height: 26, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)', fontSize: 16, fontWeight: 700,
    }}>{children}</div>
  );
}

// Editable big stat (Members, MRR, NPS)
function ONAStat({ label, value, prefix, suffix, color, trend, onChange }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));

  const fmt = (v) => {
    if (typeof v !== 'number') return v;
    if (v >= 1000) return Math.round(v).toLocaleString();
    return Math.round(v);
  };

  const save = () => {
    const n = parseInt(String(draft).replace(/[^0-9]/g, ''), 10);
    if (!Number.isNaN(n)) onChange?.(n);
    setEditing(false);
  };

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div className="eyebrow" style={{ marginBottom: 4 }}>{label}</div>
      {editing ? (
        <input
          autoFocus value={draft} onChange={(e) => setDraft(e.target.value)}
          onBlur={save} onKeyDown={(e) => e.key === 'Enter' && save()} inputMode="numeric"
          style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: `1px solid ${color}`, borderRadius: 8, padding: '4px 6px', color: 'var(--text)', fontFamily: 'var(--font-display)', fontSize: 24, outline: 'none' }}
        />
      ) : (
        <div className="pressable" onClick={() => { setDraft(String(value)); setEditing(true); }} style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
          {prefix && <span className="display" style={{ fontSize: 16, color, opacity: 0.7 }}>{prefix}</span>}
          <span className="display" style={{ fontSize: 30, color, lineHeight: 0.9 }}>
            <TickCounter value={value} format={fmt} />
          </span>
          {suffix && <span className="mono" style={{ fontSize: 10, color: 'var(--muted)', marginLeft: 2 }}>{suffix}</span>}
        </div>
      )}
      {trend && !editing && (
        <div className="mono" style={{ fontSize: 9, color: 'var(--dim)', marginTop: 4, letterSpacing: '0.1em' }}>{trend}</div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Sales pipeline — a real mini-CRM, not just counts.
// Tap a stage to open it: every person with phone, first/last
// visit, notes, days since contact, and one-tap actions —
// CALL, TEXT, mark touched, advance to the next stage.
// ─────────────────────────────────────────────────────────
const STAGE_FLOW = { leads: 'trials', trials: 'closing', closing: 'new' };
const STAGE_NEXT_LABEL = { leads: '→ TRIAL', trials: '→ CLOSING', closing: '→ MEMBER' };

function daysSince(dateStr) {
  if (!dateStr) return null;
  const d = new Date(`${dateStr}T12:00:00`);
  if (isNaN(d)) return null;
  return Math.max(0, Math.round((Date.now() - d.getTime()) / 864e5));
}
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
const isStale = (p) => {
  const ds = daysSince(p.lastContact || p.lastVisit || p.addedOn);
  return ds != null && ds > 7;
};

function PersonCard({ p, color, stageId, onUpdate, onDelete, onAdvance }) {
  const [editing, setEditing] = useState(false);
  const contactDays = daysSince(p.lastContact || p.lastVisit || p.addedOn);
  const stale = isStale(p);
  const inp = {
    width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)',
    borderRadius: 10, padding: '8px 10px', color: 'var(--text)', fontSize: 13, outline: 'none',
    fontFamily: 'var(--font-body)', boxSizing: 'border-box',
  };
  const chip = (bg, border, fg) => ({
    padding: '6px 10px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 4,
    background: bg, border: `1px solid ${border}`, color: fg,
    fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
  });

  return (
    <div style={{ padding: '10px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: `1px solid ${stale ? 'rgba(255,107,91,0.4)' : 'var(--line)'}` }}>
      <div className="pressable" onClick={() => setEditing((e) => !e)} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 650, color: 'var(--text)' }}>{p.name}</span>
            {stale && <span className="mono" style={{ fontSize: 8, color: 'var(--ona-red)', letterSpacing: '0.08em' }}>⚠ {contactDays}D SILENT</span>}
          </div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', marginTop: 3 }}>
            {p.phone || 'no phone'}{p.interest ? ` · ${p.interest}` : ''}
          </div>
          <div className="mono" style={{ fontSize: 8.5, color: 'var(--dim)', letterSpacing: '0.06em', marginTop: 3 }}>
            {p.firstVisit ? `FIRST ${p.firstVisit}` : 'NEVER VISITED'}{p.lastVisit ? ` · LAST ${p.lastVisit}` : ''}{p.lastContact ? ` · TOUCHED ${p.lastContact}` : ''}
          </div>
          {p.note && !editing && <div style={{ fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.4, marginTop: 4 }}>{p.note}</div>}
        </div>
        <span style={{ color: 'var(--dim)', fontSize: 12, transform: editing ? 'rotate(90deg)' : 'none', transition: 'transform 200ms', flexShrink: 0 }}>›</span>
      </div>

      {/* action row — always visible, one tap each */}
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 9 }}>
        {p.phone && (
          <>
            <a href={`tel:${p.phone.replace(/[^0-9+]/g, '')}`} className="pressable" style={{ ...chip('rgba(52,211,153,0.12)', 'rgba(52,211,153,0.45)', 'var(--lime)'), textDecoration: 'none' }}>📞 CALL</a>
            <a href={`sms:${p.phone.replace(/[^0-9+]/g, '')}`} className="pressable" style={{ ...chip('rgba(69,183,232,0.12)', 'rgba(69,183,232,0.45)', 'var(--cyan)'), textDecoration: 'none' }}>💬 TEXT</a>
          </>
        )}
        <div className="pressable" onClick={() => onUpdate({ lastContact: todayStr() })} style={chip('rgba(255,255,255,0.05)', 'var(--line-strong)', 'var(--muted)')}>✓ TOUCHED</div>
        {STAGE_FLOW[stageId] && (
          <div className="pressable" onClick={onAdvance} style={chip('rgba(233,196,106,0.12)', 'rgba(233,196,106,0.5)', 'var(--gold)')}>{STAGE_NEXT_LABEL[stageId]}</div>
        )}
      </div>

      {/* editor */}
      {editing && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={p.name} onChange={(e) => onUpdate({ name: e.target.value })} placeholder="Name" style={{ ...inp, flex: 1.2 }} />
            <input value={p.phone || ''} onChange={(e) => onUpdate({ phone: e.target.value })} placeholder="Phone" style={{ ...inp, flex: 1 }} />
          </div>
          <input value={p.interest || ''} onChange={(e) => onUpdate({ interest: e.target.value })} placeholder="Interested in (kids ninja, adult, open gym…)" style={inp} />
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <div className="eyebrow" style={{ marginBottom: 4 }}>First visit</div>
              <input type="date" value={p.firstVisit || ''} onChange={(e) => onUpdate({ firstVisit: e.target.value })} style={{ ...inp, fontFamily: 'var(--font-mono)', fontSize: 11, colorScheme: 'dark' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="eyebrow" style={{ marginBottom: 4 }}>Last visit</div>
              <input type="date" value={p.lastVisit || ''} onChange={(e) => onUpdate({ lastVisit: e.target.value })} style={{ ...inp, fontFamily: 'var(--font-mono)', fontSize: 11, colorScheme: 'dark' }} />
            </div>
          </div>
          <textarea value={p.note || ''} onChange={(e) => onUpdate({ note: e.target.value })} placeholder="Notes — objections, family, what they care about…" rows={2} style={{ ...inp, resize: 'vertical', lineHeight: 1.45 }} />
          <div className="pressable" onClick={onDelete} style={{ alignSelf: 'flex-start', padding: '6px 12px', borderRadius: 10, background: 'rgba(255,107,91,0.1)', border: '1px solid rgba(255,107,91,0.4)', color: 'var(--ona-red)', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', fontWeight: 700 }}>REMOVE</div>
        </div>
      )}
    </div>
  );
}

function SalesPipeline({ stages, onUpdate, people, onPeopleChange }) {
  const [openStage, setOpenStage] = useState(null);
  const [adding, setAdding] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftPhone, setDraftPhone] = useState('');

  const listFor = (id) => people[id] || [];
  const countFor = (stage) => (listFor(stage.id).length > 0 ? listFor(stage.id).length : stage.count);
  const staleFor = (stage) => {
    const list = listFor(stage.id);
    return list.length ? list.filter(isStale).length : (stage.stale || 0);
  };
  const totalStale = stages.reduce((s, x) => s + staleFor(x), 0);

  const setList = (stageId, fn) => onPeopleChange((pp) => ({ ...pp, [stageId]: fn(pp[stageId] || []) }));
  const addPerson = (stageId) => {
    if (!draftName.trim()) return;
    setList(stageId, (l) => [{ id: Date.now(), name: draftName.trim(), phone: draftPhone.trim(), addedOn: todayStr(), note: '' }, ...l]);
    setDraftName(''); setDraftPhone(''); setAdding(false);
  };
  const advance = (stageId, personId) => {
    const next = STAGE_FLOW[stageId];
    if (!next) return;
    const person = listFor(stageId).find((p) => p.id === personId);
    if (!person) return;
    onPeopleChange((pp) => ({
      ...pp,
      [stageId]: (pp[stageId] || []).filter((p) => p.id !== personId),
      [next]: [{ ...person, lastContact: todayStr() }, ...(pp[next] || [])],
    }));
  };

  return (
    <div className="card">
      <HUDTicks />
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div className="eyebrow">Sales pipeline · tap a stage for the people</div>
          <div className="section-title" style={{ fontSize: 22, marginTop: 2 }}>Funnel</div>
        </div>
        {totalStale > 0 && <Pill variant="red">⚠ {totalStale} stale</Pill>}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {stages.map((stage, idx) => {
          const open = openStage === stage.id;
          const list = listFor(stage.id);
          const count = countFor(stage);
          const stale = staleFor(stage);
          return (
            <div key={stage.id}>
              <div className="pressable" onClick={() => { setOpenStage(open ? null : stage.id); setAdding(false); }} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ minWidth: 50, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', color: open ? stage.color : 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>{stage.label}</div>
                <div style={{ flex: 1, height: 28, background: 'rgba(255,255,255,0.04)', borderRadius: 8, border: `1px solid ${open ? stage.color + '60' : 'var(--line)'}`, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${Math.min(100, (count / 30) * 100)}%`, background: `linear-gradient(90deg, ${stage.color}30, ${stage.color}10)`, borderRight: `2px solid ${stage.color}`, transition: 'width 600ms cubic-bezier(0.2,0.7,0.2,1)' }} />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', padding: '0 10px', gap: 8 }}>
                    <span className="display" style={{ fontSize: 16, color: stage.color, lineHeight: 1 }}>{count}</span>
                    {list.length === 0 && <span className="mono" style={{ fontSize: 8, color: 'var(--dim)', letterSpacing: '0.08em' }}>NO PEOPLE YET</span>}
                    {stale > 0 && (
                      <span className="mono" style={{ fontSize: 9, color: 'var(--ona-red)', fontWeight: 700, marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <IconWarn size={11} />{stale} STALE
                      </span>
                    )}
                    <span style={{ marginLeft: stale > 0 ? 0 : 'auto', color: 'var(--dim)', fontSize: 11, transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 200ms' }}>›</span>
                  </div>
                </div>
              </div>

              {open && (
                <div style={{ margin: '8px 0 4px', paddingLeft: 8, borderLeft: `2px solid ${stage.color}40`, display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {/* manual count fallback while the list is empty */}
                  {list.length === 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 0 4px' }}>
                      <span className="mono" style={{ fontSize: 9, color: 'var(--dim)', letterSpacing: '0.08em' }}>ROUGH COUNT</span>
                      <Stepper onClick={() => onUpdate(idx, { count: Math.max(0, stage.count - 1) })}>−</Stepper>
                      <span className="mono" style={{ fontSize: 12, color: 'var(--text)', minWidth: 20, textAlign: 'center' }}>{stage.count}</span>
                      <Stepper onClick={() => onUpdate(idx, { count: stage.count + 1 })}>+</Stepper>
                      <span className="mono" style={{ fontSize: 8, color: 'var(--dim)' }}>— ADD PEOPLE TO MAKE IT REAL →</span>
                    </div>
                  )}

                  {list.map((p) => (
                    <PersonCard
                      key={p.id}
                      p={p}
                      color={stage.color}
                      stageId={stage.id}
                      onUpdate={(patch) => setList(stage.id, (l) => l.map((x) => (x.id === p.id ? { ...x, ...patch } : x)))}
                      onDelete={() => setList(stage.id, (l) => l.filter((x) => x.id !== p.id))}
                      onAdvance={() => advance(stage.id, p.id)}
                    />
                  ))}

                  {adding ? (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <input autoFocus value={draftName} onChange={(e) => setDraftName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addPerson(stage.id)} placeholder="Name"
                        style={{ flex: 1.2, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', borderRadius: 10, padding: '9px 10px', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'var(--font-body)' }} />
                      <input value={draftPhone} onChange={(e) => setDraftPhone(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addPerson(stage.id)} placeholder="Phone"
                        style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', borderRadius: 10, padding: '9px 10px', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'var(--font-mono)' }} />
                      <div className="pressable" onClick={() => addPerson(stage.id)} style={{ width: 40, borderRadius: 10, background: `linear-gradient(135deg, ${stage.color}, #45B7E8)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A0B0D' }}><IconCheck size={15} stroke={2.6} /></div>
                    </div>
                  ) : (
                    <div className="pressable" onClick={() => setAdding(true)} style={{
                      padding: '9px 0', borderRadius: 10, textAlign: 'center',
                      border: `1px dashed ${stage.color}50`, color: stage.color,
                      fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '0.14em', fontWeight: 700,
                    }}>+ ADD {stage.id === 'new' ? 'MEMBER' : stage.label.replace(/s$/i, '').toUpperCase()}</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CoachAvatar({ coach, size = 36 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size,
      background: `linear-gradient(135deg, ${coach.color}, ${coach.color}50)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#0A0B0D', fontWeight: 800, fontSize: size * 0.42, flexShrink: 0,
      border: '1px solid rgba(255,255,255,0.15)', boxShadow: `0 0 14px -4px ${coach.color}`,
    }}>{coach.initial || (coach.name || '?')[0].toUpperCase()}</div>
  );
}

const GRADES = ['A', 'A-', 'B+', 'B', 'B-', 'C'];
const gradeColor = (g) => (g?.startsWith('A') ? '#34D399' : g?.startsWith('B') ? '#E9C46A' : '#F4A261');
const COACH_COLORS = ['#FF6B5B', '#F4A261', '#45B7E8', '#2DD4BF', '#34D399', '#FF8A4C', '#E9C46A'];

function CoachRow({ coach, onUpdate, onDelete }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: `1px solid ${open ? gradeColor(coach.grade) : 'var(--line)'}`, transition: 'border-color 200ms' }}>
      <div className="pressable" onClick={() => setOpen((o) => !o)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px' }}>
        <CoachAvatar coach={coach} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', letterSpacing: '-0.01em' }}>{coach.name}</div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{(coach.role || '').toUpperCase()}{coach.active === false ? ' · INACTIVE' : ''}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="mono" style={{ fontSize: 11, color: 'var(--text)', fontWeight: 600 }}>${coach.plPrice}/hr</div>
          <div className="mono" style={{ fontSize: 9, color: 'var(--dim)', marginTop: 1 }}>PRIVATE LESSON</div>
        </div>
        <div style={{ width: 30, height: 30, borderRadius: 8, border: `1.5px solid ${gradeColor(coach.grade)}`, background: `${gradeColor(coach.grade)}18`, color: gradeColor(coach.grade), display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, boxShadow: `0 0 10px -3px ${gradeColor(coach.grade)}` }}>{coach.grade}</div>
      </div>

      {open && (
        <div style={{ padding: '0 12px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={coach.name} onChange={(e) => onUpdate({ name: e.target.value, initial: (e.target.value || '?')[0].toUpperCase() })} placeholder="Name" style={{ ...inp, flex: 1 }} />
            <input value={coach.role} onChange={(e) => onUpdate({ role: e.target.value })} placeholder="Role" style={{ ...inp, flex: 1 }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="eyebrow">Price/hr</span>
            <Stepper onClick={() => onUpdate({ plPrice: Math.max(0, coach.plPrice - 5) })}>−</Stepper>
            <span className="mono" style={{ fontSize: 12, color: 'var(--text)', minWidth: 44, textAlign: 'center' }}>${coach.plPrice}</span>
            <Stepper onClick={() => onUpdate({ plPrice: coach.plPrice + 5 })}>+</Stepper>
            <div className="pressable" onClick={() => onUpdate({ active: coach.active === false })} style={{ marginLeft: 'auto', padding: '5px 10px', borderRadius: 999, fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', background: coach.active === false ? 'rgba(255,255,255,0.04)' : 'rgba(52,211,153,0.12)', border: `1px solid ${coach.active === false ? 'var(--line)' : 'rgba(52,211,153,0.4)'}`, color: coach.active === false ? 'var(--muted)' : 'var(--lime)' }}>
              {coach.active === false ? 'INACTIVE' : 'ACTIVE'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="eyebrow">Grade</span>
            {GRADES.map((g) => {
              const on = coach.grade === g;
              return (
                <div key={g} className="pressable" onClick={() => onUpdate({ grade: g })} style={{ padding: '4px 9px', borderRadius: 999, fontFamily: 'var(--font-display)', fontSize: 13, background: on ? `${gradeColor(g)}20` : 'rgba(255,255,255,0.04)', border: `1px solid ${on ? gradeColor(g) : 'var(--line)'}`, color: on ? gradeColor(g) : 'var(--muted)' }}>{g}</div>
              );
            })}
            <div className="pressable" onClick={onDelete} style={{ marginLeft: 'auto', width: 30, height: 30, borderRadius: 8, background: 'rgba(255,107,91,0.12)', border: '1px solid rgba(255,107,91,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ona-red)' }}><IconClose size={15} /></div>
          </div>
        </div>
      )}
    </div>
  );
}

function CoachRoster({ coaches, onAdd, onUpdate, onDelete }) {
  const active = coaches.filter((c) => c.active !== false).length;
  const addCoach = () => onAdd({
    id: Date.now(), name: 'New Coach', plPrice: 80, grade: 'B', role: 'Coach', active: true,
    initial: 'N', color: COACH_COLORS[coaches.length % COACH_COLORS.length],
  });

  return (
    <div className="card">
      <HUDTicks />
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div className="eyebrow">Roster · {active} active · {BENCH.length} bench</div>
          <div className="section-title" style={{ fontSize: 22, marginTop: 2 }}>COACHES</div>
        </div>
        <div className="pressable" onClick={addCoach} style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(69,183,232,0.12)', border: '1px solid rgba(69,183,232,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cyan)' }}>
          <IconPlus size={16} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {coaches.map((c) => (
          <CoachRow key={c.id} coach={c} onUpdate={(patch) => onUpdate(c.id, patch)} onDelete={() => onDelete(c.id)} />
        ))}
      </div>

      <div style={{ marginTop: 12, padding: 10, borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}>
        <div className="eyebrow" style={{ marginBottom: 8, color: 'var(--dim)' }}>Bench · backup</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {BENCH.map((b) => (
            <div key={b.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
              <CoachAvatar coach={b} size={32} />
              <span className="mono" style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.08em' }}>{b.name.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Initiatives — full CRUD, cloud-synced
// ─────────────────────────────────────────────────────────
const PRIORITIES = ['P0', 'P1', 'P2'];
const priColor = { P0: '#FF6B5B', P1: '#E9C46A', P2: '#45B7E8' };
const priBg = { P0: 'rgba(255,107,91,0.12)', P1: 'rgba(233,196,106,0.12)', P2: 'rgba(69,183,232,0.12)' };

function InitiativeRow({ it, onUpdate, onDelete }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ padding: '12px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: `1px solid ${open ? priColor[it.priority] : 'var(--line)'}`, transition: 'border-color 200ms' }}>
      <div className="pressable" onClick={() => setOpen((o) => !o)} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <span style={{ padding: '3px 7px', borderRadius: 6, background: priBg[it.priority], color: priColor[it.priority], border: `1px solid ${priColor[it.priority]}50`, fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 800, letterSpacing: '0.06em', boxShadow: `0 0 8px -3px ${priColor[it.priority]}`, flexShrink: 0, marginTop: 1 }}>{it.priority}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', textWrap: 'pretty', lineHeight: 1.3 }}>{it.title}</div>
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1 }}><ProgressBar value={it.pct} color={priColor[it.priority]} height={3} /></div>
            <span className="mono" style={{ fontSize: 9, color: 'var(--muted)' }}>{it.pct}%</span>
          </div>
          <div className="mono" style={{ fontSize: 9, color: 'var(--dim)', marginTop: 6 }}>{it.due ? `DUE ${String(it.due).toUpperCase()}` : 'NO DUE DATE'}</div>
        </div>
      </div>
      {open && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input value={it.title} onChange={(e) => onUpdate({ title: e.target.value })} placeholder="Initiative" style={inp} />
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {PRIORITIES.map((p) => {
              const on = it.priority === p;
              return (
                <div key={p} className="pressable" onClick={() => onUpdate({ priority: p })} style={{ padding: '5px 10px', borderRadius: 999, fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 800, background: on ? priBg[p] : 'rgba(255,255,255,0.04)', border: `1px solid ${on ? priColor[p] : 'var(--line)'}`, color: on ? priColor[p] : 'var(--muted)' }}>{p}</div>
              );
            })}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
              <Stepper onClick={() => onUpdate({ pct: Math.max(0, it.pct - 5) })}>−</Stepper>
              <span className="mono" style={{ fontSize: 11, color: 'var(--text)', minWidth: 34, textAlign: 'center' }}>{it.pct}%</span>
              <Stepper onClick={() => onUpdate({ pct: Math.min(100, it.pct + 5) })}>+</Stepper>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={it.due} onChange={(e) => onUpdate({ due: e.target.value })} placeholder="Due (e.g. Jun 14)" style={{ ...inp, flex: 1 }} />
            <div className="pressable" onClick={onDelete} style={{ width: 44, borderRadius: 10, background: 'rgba(255,107,91,0.12)', border: '1px solid rgba(255,107,91,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ona-red)' }}><IconClose size={16} /></div>
          </div>
        </div>
      )}
    </div>
  );
}

function InitiativeList({ items, onAdd, onUpdate, onDelete }) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const p0 = items.filter((i) => i.priority === 'P0').length;

  const submit = () => {
    if (!title.trim()) return;
    onAdd({ id: Date.now(), title: title.trim(), priority: 'P1', pct: 0, due: '' });
    setTitle('');
    setAdding(false);
  };

  return (
    <div className="card">
      <HUDTicks />
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div className="eyebrow">Initiatives · Q2 active</div>
          <div className="section-title" style={{ fontSize: 22, marginTop: 2 }}>WHAT MOVES</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Pill variant="red">{p0} · P0</Pill>
          <div className="pressable" onClick={() => setAdding((a) => !a)} style={{ width: 30, height: 30, borderRadius: 9, background: adding ? 'rgba(255,255,255,0.06)' : 'rgba(69,183,232,0.12)', border: `1px solid ${adding ? 'var(--line-strong)' : 'rgba(69,183,232,0.4)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: adding ? 'var(--muted)' : 'var(--cyan)' }}>{adding ? <IconClose size={15} /> : <IconPlus size={16} />}</div>
        </div>
      </div>
      {adding && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} placeholder="New initiative…" style={{ ...inp, flex: 1 }} />
          <div className="pressable" onClick={submit} style={{ width: 44, borderRadius: 10, background: 'linear-gradient(135deg, #45B7E8, #2DD4BF)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A0B0D' }}><IconCheck size={16} stroke={2.4} /></div>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.length === 0 && <EmptyState icon={<IconPlus size={22} />} text="No initiatives yet — tap + to add one." />}
        {items.map((it) => (
          <InitiativeRow key={it.id} it={it} onUpdate={(patch) => onUpdate(it.id, patch)} onDelete={() => onDelete(it.id)} />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// ONA HQ screen
// ─────────────────────────────────────────────────────────
// Live GymDesk metrics (fed via Zapier webhook). Hidden until data arrives.
const LIVE_FIELDS = [
  { k: 'members', label: 'Members', color: 'var(--text)' },
  { k: 'active_members', label: 'Active', color: 'var(--lime)' },
  { k: 'mrr', label: 'MRR', prefix: '$', color: 'var(--lime)' },
  { k: 'visits_today', label: 'Today', color: 'var(--cyan)' },
  { k: 'attendance_week', label: 'Visits/wk', color: 'var(--cyan)' },
  { k: 'new_members_month', label: 'New (mo)', color: 'var(--gold)' },
  { k: 'churn_month', label: 'Churn (mo)', color: 'var(--ona-red)' },
  { k: 'nps', label: 'NPS', color: 'var(--violet)' },
];

function relTime(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

function LiveOnaCard({ live }) {
  if (!live) return null;
  const present = LIVE_FIELDS.filter((f) => live[f.k] != null && live[f.k] !== '');
  if (!present.length) return null;
  const fmt = (v, f) => `${f.prefix || ''}${typeof v === 'number' ? v.toLocaleString() : v}`;
  return (
    <div className="card" style={{ borderColor: 'rgba(52,211,153,0.25)' }}>
      <HUDTicks />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ width: 7, height: 7, borderRadius: 999, background: 'var(--lime)', boxShadow: '0 0 8px var(--lime)' }} className="blink" />
          <span className="eyebrow" style={{ color: 'var(--lime)' }}>Live · GymDesk</span>
        </div>
        <span className="mono" style={{ fontSize: 9, color: 'var(--dim)', letterSpacing: '0.08em' }}>{relTime(live.updated_at)}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {present.map((f) => (
          <div key={f.k} style={{ textAlign: 'center' }}>
            <div className="display" style={{ fontSize: 19, color: f.color, lineHeight: 1.1 }}>{fmt(live[f.k], f)}</div>
            <div className="eyebrow" style={{ marginTop: 3, fontSize: 8 }}>{f.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ONAHQ({ embedded = false }) {
  const [ona, setOna] = useSyncedState('lifeos:ona', {
    stats: { members: ONA_STATS.members, mrr: ONA_STATS.mrr, nps: ONA_STATS.nps },
    initiatives: INITIATIVES,
    sales: SALES_STAGES,
    coaches: COACHES,
  });

  // Live stats pushed in from GymDesk via Zapier → /api/ona-webhook.
  const [live] = useSyncedState('lifeos:ona:live', null);

  const stats = ona.stats ?? ONA_STATS;
  const initiatives = ona.initiatives ?? INITIATIVES;
  const sales = ona.sales ?? SALES_STAGES;
  const coaches = ona.coaches ?? COACHES;

  const setStat = (k, v) => setOna((s) => ({ ...s, stats: { ...(s.stats ?? ONA_STATS), [k]: v } }));
  const addInitiative = (it) => setOna((s) => ({ ...s, initiatives: [it, ...(s.initiatives ?? INITIATIVES)] }));
  const updateInitiative = (id, patch) => setOna((s) => ({ ...s, initiatives: (s.initiatives ?? INITIATIVES).map((i) => (i.id === id ? { ...i, ...patch } : i)) }));
  const deleteInitiative = (id) => setOna((s) => ({ ...s, initiatives: (s.initiatives ?? INITIATIVES).filter((i) => i.id !== id) }));
  const updateSale = (idx, patch) => setOna((s) => ({ ...s, sales: (s.sales ?? SALES_STAGES).map((st, i) => (i === idx ? { ...st, ...patch } : st)) }));
  // The funnel's actual people — a mini-CRM keyed by stage id.
  const pipelinePeople = ona.pipelinePeople ?? {};
  const setPipelinePeople = (fn) => setOna((s) => ({ ...s, pipelinePeople: fn(s.pipelinePeople ?? {}) }));
  const addCoach = (c) => setOna((s) => ({ ...s, coaches: [...(s.coaches ?? COACHES), c] }));
  const updateCoach = (id, patch) => setOna((s) => ({ ...s, coaches: (s.coaches ?? COACHES).map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
  const deleteCoach = (id) => setOna((s) => ({ ...s, coaches: (s.coaches ?? COACHES).filter((c) => c.id !== id) }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="hud glass-strong mesh-ona" style={{ padding: 'var(--space-5)', borderRadius: 'var(--r-xl)' }}>
        <HUDTicks />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <div className="eyebrow">Obstacle Ninja Academy · Orlando</div>
            <div className="display" style={{ fontSize: 30, marginTop: 2, lineHeight: 1, color: 'var(--ona-red)' }}>ONA · HQ</div>
          </div>
          <Pill variant="red" dot="#FF6B5B">LIVE</Pill>
        </div>
        <div style={{ display: 'flex', gap: 14 }}>
          <ONAStat label="Members" value={stats.members} color="var(--text)" trend="tap to edit" onChange={(v) => setStat('members', v)} />
          <ONAStat label="MRR" value={stats.mrr} prefix="$" color="var(--lime)" trend="tap to edit" onChange={(v) => setStat('mrr', v)} />
          <ONAStat label="NPS" value={stats.nps} color="var(--cyan)" trend="tap to edit" onChange={(v) => setStat('nps', v)} />
        </div>
      </div>

      <LiveOnaCard live={live} />

      <SalesPipeline stages={sales} onUpdate={updateSale} people={pipelinePeople} onPeopleChange={setPipelinePeople} />
      <CoachRoster coaches={coaches} onAdd={addCoach} onUpdate={updateCoach} onDelete={deleteCoach} />
      <InitiativeList items={initiatives} onAdd={addInitiative} onUpdate={updateInitiative} onDelete={deleteInitiative} />
    </div>
  );
}

export { ONAHQ, SalesPipeline, CoachRoster, InitiativeList };
