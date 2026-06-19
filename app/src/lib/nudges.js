// ─────────────────────────────────────────────────────────
// Local daily nudges (Phase 1).
//
// Fires a local notification when the app is opened — the "welcome back,
// here's your focus" moment on revisit. NOTE: true scheduled background
// push (firing when the app is fully closed) requires server-side Web Push
// with VAPID keys + a send endpoint — that's the Phase-2 follow-up. This
// opt-in + local nudge is the honest, infra-free slice that works today.
// ─────────────────────────────────────────────────────────
const PREF_KEY = 'lifeos:nudges';
const SHOWN_KEY = 'lifeos:nudge-shown';

export function nudgesEnabled() {
  try {
    return localStorage.getItem(PREF_KEY) === '1'
      && typeof Notification !== 'undefined'
      && Notification.permission === 'granted';
  } catch { return false; }
}

export function notificationsSupported() {
  return typeof Notification !== 'undefined';
}

// Ask permission + remember the preference. Returns true if enabled.
export async function enableNudges() {
  try {
    if (typeof Notification === 'undefined') return false;
    let perm = Notification.permission;
    if (perm === 'default') perm = await Notification.requestPermission();
    if (perm === 'granted') { localStorage.setItem(PREF_KEY, '1'); return true; }
    localStorage.removeItem(PREF_KEY);
    return false;
  } catch { return false; }
}

export function disableNudges() {
  try { localStorage.removeItem(PREF_KEY); } catch { /* */ }
}

function dayStamp() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

async function show(title, body) {
  try {
    if (!nudgesEnabled()) return;
    const reg = ('serviceWorker' in navigator) ? await navigator.serviceWorker.getRegistration() : null;
    const opts = { body, icon: '/icons/icon-192.png', badge: '/icons/icon-192.png', tag: 'jamhq-nudge' };
    if (reg && reg.showNotification) reg.showNotification(title, opts);
    else new Notification(title, opts);
  } catch { /* */ }
}

// Fire at most one morning nudge per day, on app open.
export function maybeMorningNudge(line) {
  try {
    if (!nudgesEnabled()) return;
    const k = dayStamp();
    if (localStorage.getItem(SHOWN_KEY) === k) return;
    localStorage.setItem(SHOWN_KEY, k);
    show('JAM HQ', line || 'Your headquarters is ready. What’s the one thing today?');
  } catch { /* */ }
}

// A one-off confirmation when the user first turns nudges on.
export function confirmNudge() {
  show('Nudges on', 'I’ll greet you here each day with your focus.');
}
