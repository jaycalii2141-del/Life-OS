// Serverless reader for a Google Calendar "secret iCal" feed.
// Fetches the .ics server-side (no CORS), parses VEVENTs, expands simple
// daily/weekly recurrence, and returns today's events for the timeline.
// Only Google's ical host is allowed (prevents SSRF).

const WD = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
const pad = (n) => String(n).padStart(2, '0');

function unfold(text) {
  return text.replace(/\r\n/g, '\n').replace(/\n[ \t]/g, '');
}

function parseEvents(text) {
  const lines = unfold(text).split('\n');
  const events = [];
  let cur = null;
  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') cur = { _ex: [] };
    else if (line === 'END:VEVENT') { if (cur) events.push(cur); cur = null; }
    else if (cur) {
      const idx = line.indexOf(':');
      if (idx < 0) continue;
      const left = line.slice(0, idx);
      const val = line.slice(idx + 1);
      const semi = left.indexOf(';');
      const key = (semi < 0 ? left : left.slice(0, semi)).toUpperCase();
      const params = {};
      if (semi >= 0) {
        left.slice(semi + 1).split(';').forEach((p) => {
          const eq = p.indexOf('=');
          if (eq >= 0) params[p.slice(0, eq).toUpperCase()] = p.slice(eq + 1);
        });
      }
      if (key === 'EXDATE') cur._ex.push(...val.split(',').map((v) => v.replace(/T.*/, '')));
      else cur[key] = { val, params };
    }
  }
  return events;
}

function parseDt(prop) {
  if (!prop) return null;
  const v = prop.val;
  const isDate = prop.params.VALUE === 'DATE' || /^\d{8}$/.test(v);
  const m = v.match(/(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?/);
  if (!m) return null;
  return { y: +m[1], mo: +m[2], d: +m[3], hh: m[4] ? +m[4] : 0, mm: m[5] ? +m[5] : 0, utc: !!m[7], allDay: isDate };
}

function toUserTz(y, mo, d, hh, mm, tz) {
  const dt = new Date(Date.UTC(y, mo - 1, d, hh, mm));
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(dt);
  const o = {};
  parts.forEach((p) => { o[p.type] = p.value; });
  return { date: `${o.year}-${o.month}-${o.day}`, time: `${o.hour === '24' ? '00' : o.hour}:${o.minute}` };
}

function parseRRule(s) {
  const r = {};
  s.split(';').forEach((kv) => {
    const eq = kv.indexOf('=');
    if (eq >= 0) r[kv.slice(0, eq).toUpperCase()] = kv.slice(eq + 1);
  });
  return r;
}

// Does this event occur on `today` (a Date at UTC midnight of the user's local day)?
function occursOn(start, rule, exSet, todayUTC, startUTC) {
  const dayMs = 86400000;
  const diffDays = Math.round((todayUTC - startUTC) / dayMs);
  if (diffDays < 0) return false;

  const ymd = `${pad(new Date(todayUTC).getUTCFullYear())}`; // unused safety
  if (!rule) return diffDays === 0;

  if (rule.UNTIL) {
    const u = rule.UNTIL.match(/(\d{4})(\d{2})(\d{2})/);
    if (u) {
      const untilUTC = Date.UTC(+u[1], +u[2] - 1, +u[3]);
      if (todayUTC > untilUTC) return false;
    }
  }
  const interval = parseInt(rule.INTERVAL || '1', 10) || 1;
  const freq = rule.FREQ;

  if (freq === 'DAILY') {
    if (diffDays % interval !== 0) return false;
    if (rule.COUNT && diffDays / interval >= parseInt(rule.COUNT, 10)) return false;
    return true;
  }
  if (freq === 'WEEKLY') {
    const todayWd = new Date(todayUTC).getUTCDay();
    const days = rule.BYDAY ? rule.BYDAY.split(',').map((d) => WD.indexOf(d.slice(-2))) : [new Date(startUTC).getUTCDay()];
    if (!days.includes(todayWd)) return false;
    const weeks = Math.floor(diffDays / 7);
    if (weeks % interval !== 0) return false;
    return true;
  }
  if (freq === 'MONTHLY') {
    return new Date(todayUTC).getUTCDate() === start.d;
  }
  if (freq === 'YEARLY') {
    const t = new Date(todayUTC);
    return t.getUTCDate() === start.d && t.getUTCMonth() + 1 === start.mo;
  }
  return diffDays === 0;
}

function buildToday(text, todayStr, tz) {
  const events = parseEvents(text);
  const [ty, tmo, td] = todayStr.split('-').map(Number);
  const todayUTC = Date.UTC(ty, tmo - 1, td);
  const out = [];

  for (const ev of events) {
    const start = parseDt(ev.DTSTART);
    if (!start) continue;
    const summary = (ev.SUMMARY?.val || 'Untitled').replace(/\\,/g, ',').replace(/\\n/g, ' ').trim();
    const rule = ev.RRULE ? parseRRule(ev.RRULE.val) : null;
    const exSet = new Set(ev._ex.map((e) => e.replace(/[^0-9]/g, '').slice(0, 8)));

    // Determine the event's display date/time.
    let displayDate, displayTime;
    if (start.allDay) {
      displayDate = `${start.y}-${pad(start.mo)}-${pad(start.d)}`;
      displayTime = 'all-day';
    } else if (start.utc) {
      const u = toUserTz(start.y, start.mo, start.d, start.hh, start.mm, tz);
      displayDate = u.date;
      displayTime = u.time;
    } else {
      displayDate = `${start.y}-${pad(start.mo)}-${pad(start.d)}`;
      displayTime = `${pad(start.hh)}:${pad(start.mm)}`;
    }

    const startUTC = Date.UTC(...displayDate.split('-').map((n, i) => (i === 1 ? +n - 1 : +n)));
    if (exSet.has(todayStr.replace(/-/g, ''))) continue;
    if (!occursOn(start, rule, exSet, todayUTC, startUTC)) continue;

    out.push({ time: displayTime, label: summary, allDay: start.allDay });
  }

  out.sort((a, b) => {
    if (a.allDay && !b.allDay) return -1;
    if (!a.allDay && b.allDay) return 1;
    return a.time.localeCompare(b.time);
  });
  return out.slice(0, 40);
}

export default async function handler(req, res) {
  const { url, tz = 'UTC', date } = req.query;
  if (!url || !date) { res.status(400).json({ error: 'Missing url or date' }); return; }

  let parsed;
  try { parsed = new URL(url); } catch { res.status(400).json({ error: 'Bad url' }); return; }
  if (parsed.protocol !== 'https:' || parsed.hostname !== 'calendar.google.com') {
    res.status(400).json({ error: 'Only a Google Calendar secret iCal link is allowed' });
    return;
  }

  try {
    const r = await fetch(url);
    if (!r.ok) { res.status(502).json({ error: 'Could not read calendar (check the link)' }); return; }
    const text = await r.text();
    res.status(200).json({ events: buildToday(text, date, tz) });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
