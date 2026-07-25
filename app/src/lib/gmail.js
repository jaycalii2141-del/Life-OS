const ALLOWED_PRIORITIES = new Set(['high', 'medium', 'low']);
const ALLOWED_KINDS = new Set(['lead', 'order', 'ops', 'finance', 'admin']);

export const EMPTY_GMAIL_PULSE = {
  connected: false,
  account: '',
  mode: 'read_only',
  lastSyncedAt: null,
  sourceCount: 0,
  highlights: [],
};

const cleanText = (value, limit) =>
  String(value || '').replace(/\s+/g, ' ').trim().slice(0, limit);

export function gmailHighlights(pulse = {}, limit = 4) {
  if (!pulse?.connected || !Array.isArray(pulse.highlights)) return [];
  return pulse.highlights
    .map((item, index) => ({
      id: cleanText(item?.id, 100) || `gmail-${index}`,
      kind: ALLOWED_KINDS.has(item?.kind) ? item.kind : 'admin',
      priority: ALLOWED_PRIORITIES.has(item?.priority) ? item.priority : 'medium',
      title: cleanText(item?.title, 140),
      summary: cleanText(item?.summary, 320),
      from: cleanText(item?.from, 100),
      receivedAt: item?.receivedAt || null,
    }))
    .filter((item) => item.title)
    .sort((a, b) => {
      const rank = { high: 0, medium: 1, low: 2 };
      return rank[a.priority] - rank[b.priority]
        || new Date(b.receivedAt || 0) - new Date(a.receivedAt || 0);
    })
    .slice(0, limit);
}

export function gmailSyncLabel(pulse = {}, now = new Date()) {
  if (!pulse?.connected) return 'Not connected';
  const synced = new Date(pulse.lastSyncedAt || 0);
  if (Number.isNaN(synced.getTime()) || synced.getTime() === 0) return 'Connected · awaiting first sync';
  const mins = Math.max(0, Math.round((now.getTime() - synced.getTime()) / 60000));
  if (mins < 2) return 'Synced just now';
  if (mins < 60) return `Synced ${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `Synced ${hours}h ago`;
  return `Synced ${Math.round(hours / 24)}d ago`;
}

export function gmailContext(pulse = {}) {
  const highlights = gmailHighlights(pulse, 3);
  if (!pulse?.connected) return '';
  const account = cleanText(pulse.account, 100) || 'Podium Gmail';
  const urgent = highlights.filter((item) => item.priority === 'high').length;
  const signals = highlights.map((item) => `${item.title}: ${item.summary}`).join('; ');
  return `Podium inbox (${account}, read-only): ${urgent} high-priority signal${urgent === 1 ? '' : 's'}${signals ? `. ${signals}` : '. No actionable email signals in the latest sync.'}`;
}

export function recommendGmail(pulse = {}) {
  const top = gmailHighlights(pulse, 1)[0];
  if (!top || top.priority !== 'high') return null;
  return {
    id: `podium-email-${top.id}`,
    domain: 'podium',
    icon: '📨',
    title: top.title,
    why: top.summary || 'This is the highest-priority signal in the connected Podium inbox.',
    impact: top.kind === 'lead'
      ? 'Protects a live revenue opportunity'
      : top.kind === 'order'
        ? 'Keeps customer fulfillment moving'
        : 'Closes a high-priority operating loop',
    est: top.kind === 'lead' ? 20 : 15,
  };
}
