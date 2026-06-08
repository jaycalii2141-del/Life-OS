// ─────────────────────────────────────────────────────────
// ONA live-stats webhook. GymDesk has no public REST API, so the
// supported path is GymDesk → Zapier → this endpoint. Zapier POSTs
// updated stats here; we write them into Jay's app_state row
// (key "lifeos:ona:live") using the Supabase service role, and the
// ONA screen reads that key like any other synced value.
//
// Security: gated by a shared secret (ONA_WEBHOOK_SECRET) sent as
// ?token= or X-Webhook-Secret header. The service-role key never
// leaves the server. Set these in Vercel → Environment Variables:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ONA_WEBHOOK_SECRET, ONA_USER_ID
// ─────────────────────────────────────────────────────────
import { createClient } from '@supabase/supabase-js';

const KEY = 'lifeos:ona:live';
// Stat fields we accept (anything else in the body is ignored).
const FIELDS = ['members', 'active_members', 'mrr', 'nps', 'attendance_week', 'new_members_month', 'churn_month', 'visits_today'];

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const secret = process.env.ONA_WEBHOOK_SECRET;
  const provided = req.headers['x-webhook-secret'] || req.query.token;
  if (!secret || provided !== secret) { res.status(401).json({ error: 'Unauthorized' }); return; }

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const userId = process.env.ONA_USER_ID;
  if (!url || !serviceKey || !userId) { res.status(503).json({ error: 'Pipeline not configured' }); return; }

  const body = req.body || {};
  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

  try {
    // Merge incoming fields onto the existing live snapshot.
    const { data: existing } = await supabase.from('app_state').select('value').eq('user_id', userId).eq('key', KEY).maybeSingle();
    const current = (existing && existing.value) || {};

    const next = { ...current };
    for (const f of FIELDS) {
      if (body[f] != null && body[f] !== '') {
        const num = Number(body[f]);
        next[f] = Number.isFinite(num) ? num : body[f];
      }
    }
    // Optional increments: { "inc": { "members": 1, "visits_today": 1 } }
    if (body.inc && typeof body.inc === 'object') {
      for (const [f, amt] of Object.entries(body.inc)) {
        if (!FIELDS.includes(f)) continue;
        next[f] = (Number(next[f]) || 0) + (Number(amt) || 0);
      }
    }
    next.updated_at = new Date().toISOString();
    if (body.source) next.source = String(body.source).slice(0, 40);

    const { error } = await supabase
      .from('app_state')
      .upsert({ user_id: userId, key: KEY, value: next }, { onConflict: 'user_id,key' });
    if (error) { res.status(500).json({ error: error.message }); return; }

    res.status(200).json({ ok: true, stored: next });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
