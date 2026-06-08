// ─────────────────────────────────────────────────────────
// Action helpers — the Chief of Staff proposes and PREFILLS, the
// user confirms the irreversible step (send / create) in their own
// Google. No OAuth, no stored credentials: we hand off via deep links.
// ─────────────────────────────────────────────────────────
const tz = (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return 'America/New_York'; } })();

function pad(n) { return String(n).padStart(2, '0'); }

// Build a YYYYMMDDTHHMMSS stamp from a date + "HH:MM".
function stamp(date, hhmm) {
  const [h, m] = (hhmm || '12:00').split(':').map((x) => parseInt(x, 10));
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(h || 0)}${pad(m || 0)}00`;
}

// Google Calendar "create event" prefilled URL. Opens the user's own
// calendar with everything filled in; they hit save.
export function googleCalendarUrl({ title, time, durationMin = 60, details, date }) {
  const start = date ? new Date(date) : new Date();
  const startStamp = stamp(start, time);
  const end = new Date(start);
  const [h, m] = (time || '12:00').split(':').map((x) => parseInt(x, 10));
  end.setHours(h || 0, (m || 0) + durationMin, 0, 0);
  const endStamp = stamp(end, `${pad(end.getHours())}:${pad(end.getMinutes())}`);
  const p = new URLSearchParams({
    action: 'TEMPLATE',
    text: title || 'New block',
    dates: `${startStamp}/${endStamp}`,
    ctz: tz,
  });
  if (details) p.set('details', details);
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

// Prefilled email draft. Opens the user's mail client; they hit send.
export function mailtoUrl({ to = '', subject = '', body = '' }) {
  const p = new URLSearchParams();
  if (subject) p.set('subject', subject);
  if (body) p.set('body', body);
  const qs = p.toString();
  return `mailto:${encodeURIComponent(to)}${qs ? `?${qs}` : ''}`;
}

export function openExternal(url) {
  try { window.open(url, '_blank', 'noopener'); } catch { location.href = url; }
}
