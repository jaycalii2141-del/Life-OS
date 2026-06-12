// ─────────────────────────────────────────────────────────
// LifeOS V2 — LIFE. The human side of the OS.
//   · Recovery — readiness trend and what it means for today.
//   · Relationships — the wife domain is a first-class citizen.
//   · Reflection — journal, Weekly Review, Monthly Upgrade.
//   · Inbox — triage everything you captured, route it home.
// ─────────────────────────────────────────────────────────
import { useState } from 'react';
import { SectionHead } from '../components/atoms.jsx';
import { IconInbox, IconBook, IconCompass, IconArchive, IconTrash, IconCheck, IconPlus, IconChevronRight, IconSparkles, IconCalendar } from '../components/icons.jsx';
import { LIFE_DOMAINS, SEED_FOLDERS, DOMAIN_ALIASES } from '../data.js';
import { useSyncedState } from '../useSyncedState.js';
import { logEvent } from '../lib/telemetry.js';
import { googleCalendarUrl, openExternal } from '../lib/actions.js';

function folderForDomain(folders, domain) {
  let f = folders.find((x) => x.domain === domain);
  if (f) return f;
  const aliases = DOMAIN_ALIASES[domain] || [];
  return folders.find((x) => aliases.includes((x.name || '').trim().toLowerCase()));
}

const TAG_COLORS = { idea: '#00D4FF', ona: '#FF0033', dream: '#B14CFF', task: '#B6FF3C' };

function fmtDay(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const today = new Date();
  const same = d.toDateString() === today.toDateString();
  const yest = new Date(today); yest.setDate(today.getDate() - 1);
  if (same) return `Today ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  if (d.toDateString() === yest.toDateString()) return 'Yesterday';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// ── Recovery — what your body is telling you ──
function RecoveryCard({ readiness, trend, history }) {
  const last7 = Object.entries(history || {})
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .slice(0, 7)
    .map(([, v]) => v.readiness)
    .filter((v) => typeof v === 'number');
  const avg = last7.length ? Math.round(last7.reduce((s, v) => s + v, 0) / last7.length) : null;
  const verdict = readiness >= 75 ? { label: 'Green light', detail: 'Fully charged — a good day to push intensity or attempt new skills.', color: 'var(--lime)' }
    : readiness >= 55 ? { label: 'Steady', detail: 'Train with intent, cap intensity around 80%, protect sleep tonight.', color: 'var(--gold)' }
    : { label: 'Recover', detail: 'Mobility, food, an early night. The gains today come from recovering.', color: 'var(--ona-red)' };

  return (
    <div className="hud glass" style={{ padding: 14, borderRadius: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span className="eyebrow">Recovery</span>
        <span className="mono" style={{ fontSize: 9, color: 'var(--dim)' }}>{avg != null ? `7D AVG ${avg}` : 'BUILDING BASELINE'}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div className="display" style={{ fontSize: 44, lineHeight: 0.9, color: verdict.color }}>{readiness}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: verdict.color }}>{verdict.label}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.45, marginTop: 2 }}>{verdict.detail}</div>
          {trend != null && (
            <div className="mono" style={{ fontSize: 9, color: trend >= 0 ? 'var(--lime)' : 'var(--ona-red)', marginTop: 4, letterSpacing: '0.1em' }}>
              {trend >= 0 ? '▲ +' : '▼ '}{trend} vs your 7-day average
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Relationships — protect the most important domain ──
function RelationshipCard({ folders }) {
  const wife = folderForDomain(folders, 'wife');
  const notes = (wife?.notes || []).slice(0, 2);
  const planDate = () => {
    openExternal(googleCalendarUrl({ title: 'Date night ❤️', time: '19:00', durationMin: 120, details: 'Planned from LifeOS' }));
    logEvent('life', 'date-night');
  };
  return (
    <div className="hud glass" style={{ padding: 14, borderRadius: 16, border: '1px solid rgba(255,60,200,0.25)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span className="eyebrow" style={{ color: '#FF3CC8' }}>Wife & I</span>
        <div className="pressable" onClick={planDate} style={{
          display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', borderRadius: 999,
          background: 'rgba(255,60,200,0.12)', border: '1px solid rgba(255,60,200,0.4)', color: '#FF3CC8',
          fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
        }}><IconCalendar size={12} /> PLAN DATE NIGHT</div>
      </div>
      {notes.length ? notes.map((n) => (
        <div key={n.id} style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.4, padding: '6px 0', borderTop: '1px solid var(--line)' }}>
          {n.title}
        </div>
      )) : (
        <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.5 }}>
          Ideas, plans and moments live in the Wife & I folder. Route captures here from the inbox below.
        </div>
      )}
    </div>
  );
}

// ── A single inbox card with inline routing ──
function InboxCard({ c, onRoute, onArchive, onDelete }) {
  const [routing, setRouting] = useState(false);
  const tagColor = c.color || TAG_COLORS[c.tag] || '#00D4FF';
  return (
    <div className="hud glass" style={{ padding: 14, borderRadius: 16, marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <span style={{ width: 8, height: 8, borderRadius: 999, background: tagColor, marginTop: 6 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.4 }}>{c.text}</div>
          <div className="mono" style={{ fontSize: 9, color: 'var(--dim)', letterSpacing: '0.1em', marginTop: 5 }}>
            {(c.tag || 'idea').toUpperCase()} · {fmtDay(c.ts || c.id)}
          </div>
        </div>
        <div className="pressable" onClick={onDelete} style={{ color: 'var(--dim)', padding: 2 }}><IconTrash size={16} /></div>
      </div>

      {routing ? (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
          {[...LIFE_DOMAINS].sort((a, b) => (b.id === c.tag ? 1 : 0) - (a.id === c.tag ? 1 : 0)).map((d) => {
            const suggested = d.id === c.tag;
            return (
              <div key={d.id} className="pressable" onClick={() => onRoute(d.id)} style={{
                padding: '7px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                background: `${d.color}${suggested ? '2e' : '1a'}`, border: `1px solid ${d.color}${suggested ? 'cc' : '66'}`, color: d.color,
              }}>{suggested ? '★ ' : ''}{d.emoji} {d.name}</div>
            );
          })}
          <div className="pressable" onClick={() => setRouting(false)} style={{ padding: '7px 10px', borderRadius: 999, color: 'var(--muted)', border: '1px solid var(--line)', fontSize: 11 }}>cancel</div>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <div className="pressable" onClick={() => setRouting(true)} style={{
            flex: 1, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.4)', color: 'var(--cyan)',
            fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
          }}><IconChevronRight size={14} /> Route</div>
          <div className="pressable" onClick={onArchive} style={{
            width: 44, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', color: 'var(--muted)',
          }}><IconArchive size={16} /></div>
        </div>
      )}
    </div>
  );
}

export function LifeScreen({ captures, setCaptures, readiness, trend, history, onOpenReview, onOpenUpgrade }) {
  const [view, setView] = useState('inbox'); // inbox | journal
  const [journal, setJournal] = useSyncedState('lifeos:journal', []);
  const [folders, setFolders] = useSyncedState('lifeos:folders', SEED_FOLDERS);
  const [draft, setDraft] = useState('');

  const inbox = (captures || []).filter((c) => (c.status || 'inbox') === 'inbox');
  const triaged = (captures || []).filter((c) => c.status === 'triaged');

  const route = (id, domain) => {
    const cap = (captures || []).find((c) => c.id === id);
    if (cap) {
      setFolders((list) => {
        const target = folderForDomain(list, domain);
        const note = { id: Date.now(), title: cap.text, body: '', fromCapture: true };
        if (target) return list.map((f) => (f === target ? { ...f, notes: [note, ...(f.notes || [])] } : f));
        const meta = LIFE_DOMAINS.find((d) => d.id === domain) || { name: domain, color: '#00D4FF', emoji: '📁' };
        return [...list, { id: Date.now() + 1, name: meta.name, domain, color: meta.color, emoji: meta.emoji, pinned: false, notes: [note], projects: [] }];
      });
    }
    setCaptures((list) => list.map((c) => (c.id === id ? { ...c, status: 'triaged', domain, routedAt: Date.now() } : c)));
    logEvent('life', 'route', domain);
  };
  const archive = (id) => { setCaptures((list) => list.map((c) => (c.id === id ? { ...c, status: 'archived' } : c))); logEvent('life', 'archive'); };
  const remove = (id) => { setCaptures((list) => list.filter((c) => c.id !== id)); logEvent('life', 'delete'); };

  const addJournal = () => {
    if (!draft.trim()) return;
    setJournal((j) => [{ id: Date.now(), text: draft.trim(), ts: Date.now() }, ...j].slice(0, 200));
    setDraft('');
    logEvent('life', 'journal');
  };

  return (
    <div className="screen-content" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <SectionHead eyebrow="Recovery · relationships · reflection" title="LIFE" trailing={
        <div style={{ display: 'flex', gap: 6 }}>
          <div className="pressable" onClick={onOpenReview} style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: '8px 11px', borderRadius: 999,
            background: 'rgba(177,76,255,0.12)', border: '1px solid rgba(177,76,255,0.4)', color: 'var(--violet)',
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
          }}><IconCompass size={14} /> WEEKLY</div>
          <div className="pressable" onClick={onOpenUpgrade} style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: '8px 11px', borderRadius: 999,
            background: 'rgba(182,255,60,0.12)', border: '1px solid rgba(182,255,60,0.4)', color: 'var(--lime)',
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
          }}><IconSparkles size={14} /> UPGRADE</div>
        </div>
      } />

      <RecoveryCard readiness={readiness} trend={trend} history={history} />
      <RelationshipCard folders={folders} />

      {/* View toggle */}
      <div style={{ display: 'flex', gap: 8 }}>
        {[{ id: 'inbox', label: 'Inbox', Icon: IconInbox, n: inbox.length }, { id: 'journal', label: 'Journal', Icon: IconBook }].map((v) => {
          const on = view === v.id;
          return (
            <div key={v.id} className="pressable" onClick={() => { setView(v.id); logEvent('life', 'view', v.id); }} style={{
              flex: 1, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              background: on ? 'rgba(0,212,255,0.14)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${on ? 'rgba(0,212,255,0.5)' : 'var(--line)'}`, color: on ? 'var(--cyan)' : 'var(--muted)',
              fontSize: 13, fontWeight: 700, letterSpacing: '0.04em',
            }}>
              <v.Icon size={17} /> {v.label}{v.n ? <span className="mono" style={{ fontSize: 11, opacity: 0.8 }}>· {v.n}</span> : null}
            </div>
          );
        })}
      </div>

      {view === 'inbox' && (
        <div>
          {inbox.length === 0 ? (
            <div className="hud glass" style={{ padding: '26px 18px', borderRadius: 16, textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10, color: 'var(--lime)' }}><IconCheck size={28} stroke={2.2} /></div>
              <div className="display" style={{ fontSize: 18, color: 'var(--lime)' }}>INBOX ZERO</div>
              <div className="eyebrow" style={{ marginTop: 6, opacity: 0.8 }}>everything's routed · tap + to capture more</div>
            </div>
          ) : (
            <>
              <div className="eyebrow" style={{ marginBottom: 10 }}>{inbox.length} to triage — route each to where it belongs</div>
              {inbox.map((c) => (
                <InboxCard key={c.id} c={c} onRoute={(d) => route(c.id, d)} onArchive={() => archive(c.id)} onDelete={() => remove(c.id)} />
              ))}
            </>
          )}

          {triaged.length > 0 && (
            <div style={{ marginTop: 18 }}>
              <div className="eyebrow" style={{ marginBottom: 10 }}>Recently routed</div>
              {triaged.slice(0, 8).map((c) => {
                const d = LIFE_DOMAINS.find((x) => x.id === c.domain);
                return (
                  <div key={c.id} className="hud glass" style={{ padding: '10px 14px', borderRadius: 12, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 14 }}>{d?.emoji || '•'}</span>
                    <div style={{ flex: 1, fontSize: 13, color: 'var(--muted)' }}>{c.text}</div>
                    <span className="mono" style={{ fontSize: 9, color: d?.color || 'var(--dim)', letterSpacing: '0.08em' }}>{d?.name || c.domain}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {view === 'journal' && (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addJournal(); }}
              placeholder="A thought, a reflection, a win…"
              style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', borderRadius: 12, padding: '12px 14px', color: 'var(--text)', fontSize: 14, outline: 'none', fontFamily: 'var(--font-body)' }}
            />
            <div className="pressable" onClick={addJournal} style={{ width: 48, borderRadius: 12, background: 'linear-gradient(135deg, #00D4FF, #B14CFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#06060A' }}><IconPlus size={20} stroke={2.4} /></div>
          </div>
          {journal.length === 0 ? (
            <div className="eyebrow" style={{ textAlign: 'center', opacity: 0.7, padding: '20px 0' }}>nothing yet — write your first line above</div>
          ) : journal.map((e) => (
            <div key={e.id} className="hud glass" style={{ padding: 14, borderRadius: 14, marginBottom: 10 }}>
              <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.5 }}>{e.text}</div>
              <div className="mono" style={{ fontSize: 9, color: 'var(--dim)', letterSpacing: '0.1em', marginTop: 6 }}>{fmtDay(e.ts)}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ height: 90 }} />
    </div>
  );
}
