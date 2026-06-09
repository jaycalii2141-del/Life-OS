// Full calendar view (read-only) from the connected iCal feed,
// plus quick-add that opens Google Calendar pre-filled.
import { useState, useEffect } from 'react';
import { IconClose, IconPlus, IconCalendar, IconCheck } from './components/icons.jsx';
import { Sheet } from './components/Sheet.jsx';

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const pad = (n) => String(n).padStart(2, '0');

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function dayLabel(dateStr) {
  const t = todayStr();
  const d = new Date(dateStr + 'T00:00:00');
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const tStr = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}`;
  if (dateStr === t) return 'TODAY';
  if (dateStr === tStr) return 'TOMORROW';
  return `${DAYS[d.getDay()]} · ${MONS[d.getMonth()]} ${d.getDate()}`;
}

const inp = {
  width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--line)',
  borderRadius: 10, padding: '9px 11px', color: 'var(--text)', fontSize: 14, outline: 'none',
  fontFamily: 'var(--font-body)', boxSizing: 'border-box',
};

export function CalendarSheet({ open, onClose, icalUrl }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);

  // quick-add form
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(todayStr());
  const [start, setStart] = useState('09:00');
  const [end, setEnd] = useState('10:00');

  const load = () => {
    if (!icalUrl) { setEvents([]); return; }
    setLoading(true); setError('');
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    fetch(`/api/calendar?url=${encodeURIComponent(icalUrl)}&tz=${encodeURIComponent(tz)}&date=${todayStr()}&days=14`)
      .then((r) => r.json())
      .then((d) => { setEvents(d.events || []); setLoading(false); })
      .catch(() => { setError('Could not load your calendar.'); setLoading(false); });
  };

  useEffect(() => { if (open) load(); /* eslint-disable-next-line */ }, [open, icalUrl]);

  // group events by date
  const groups = {};
  for (const e of events) { (groups[e.date] = groups[e.date] || []).push(e); }
  const dates = Object.keys(groups).sort();

  const quickAdd = () => {
    if (!title.trim()) return;
    const d = date.replace(/-/g, '');
    const s = d + 'T' + start.replace(':', '') + '00';
    const en = d + 'T' + end.replace(':', '') + '00';
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title.trim())}&dates=${s}/${en}&ctz=${encodeURIComponent(tz)}`;
    window.open(url, '_blank');
    setTitle(''); setAdding(false);
  };

  return (
    <Sheet open={open} onClose={onClose} maxHeight="85%">

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div className="eyebrow">Next 14 days</div>
            <div className="display" style={{ fontSize: 26, marginTop: 2 }}>CALENDAR</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div className="pressable" onClick={() => setAdding((a) => !a)} style={{
              width: 32, height: 32, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: adding ? 'rgba(255,255,255,0.06)' : 'rgba(0,212,255,0.14)',
              border: `1px solid ${adding ? 'var(--line-strong)' : 'rgba(0,212,255,0.4)'}`,
              color: adding ? 'var(--muted)' : 'var(--cyan)',
            }}>{adding ? <IconClose size={16} /> : <IconPlus size={17} />}</div>
            <div className="pressable" onClick={onClose} style={{
              width: 32, height: 32, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.06)', color: 'var(--muted)',
            }}><IconClose size={16} /></div>
          </div>
        </div>

        {!icalUrl && (
          <div style={{ padding: '20px 0', textAlign: 'center' }}>
            <div className="eyebrow" style={{ color: 'var(--muted)' }}>Connect Google Calendar in Settings first.</div>
          </div>
        )}

        {adding && (
          <div style={{ marginBottom: 16, padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--line)' }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>New event → opens Google Calendar</div>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event title" style={{ ...inp, marginBottom: 8 }} />
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ ...inp, flex: 1 }} />
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <input type="time" value={start} onChange={(e) => setStart(e.target.value)} style={{ ...inp, flex: 1 }} />
              <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} style={{ ...inp, flex: 1 }} />
            </div>
            <div className="pressable" onClick={quickAdd} style={{
              height: 42, borderRadius: 12, background: 'linear-gradient(135deg, #00D4FF, #B14CFF)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              color: '#06060A', fontWeight: 700, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>
              <IconCheck size={15} stroke={2.4} /> Create in Google Calendar
            </div>
          </div>
        )}

        {loading && <div className="eyebrow" style={{ color: 'var(--dim)', padding: '8px 0' }}>Loading your calendar…</div>}
        {error && <div className="mono" style={{ fontSize: 11, color: 'var(--ona-red)', padding: '8px 0' }}>{error}</div>}
        {icalUrl && !loading && !error && dates.length === 0 && (
          <div className="eyebrow" style={{ color: 'var(--dim)', padding: '8px 0' }}>No events in the next two weeks.</div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {dates.map((d) => (
            <div key={d}>
              <div className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', color: 'var(--cyan)', fontWeight: 700, marginBottom: 8 }}>
                {dayLabel(d)}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {groups[d].map((e, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                    borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--line)',
                  }}>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--cyan)', minWidth: 52, fontWeight: 600 }}>
                      {e.time === 'all-day' ? 'ALL DAY' : e.time}
                    </span>
                    <span style={{ flex: 1, fontSize: 14, color: 'var(--text)', lineHeight: 1.3 }}>{e.label}</span>
                    <IconCalendar size={13} color="var(--dim)" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="eyebrow" style={{ textAlign: 'center', color: 'var(--dim)', marginTop: 16 }}>
          Read-only view · changes happen in Google Calendar
        </div>
        <div style={{ height: 8 }} />
    </Sheet>
  );
}
