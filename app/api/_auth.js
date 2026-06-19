// ─────────────────────────────────────────────────────────
// Shared auth + rate-limit gate for the AI serverless endpoints.
//
// Without this, /api/companion, /api/chief, /api/coach, /api/ai and
// /api/decompose were fully open — anyone with the deploy URL could
// POST to them and burn the Anthropic key as a free LLM proxy.
//
// We verify the caller's Supabase session JWT against Supabase Auth,
// reusing the project's existing URL + anon key (no new env vars).
// ─────────────────────────────────────────────────────────

function supabaseEnv() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  return { url, anon };
}

// Verify the Authorization: Bearer <access_token> header against Supabase.
// Returns { ok:true, user } or { ok:false, status, error }.
export async function verifyUser(req) {
  const { url, anon } = supabaseEnv();
  if (!url || !anon) return { ok: false, status: 503, error: 'Auth not configured' };

  const header = req.headers?.authorization || req.headers?.Authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return { ok: false, status: 401, error: 'Sign in required' };

  try {
    const r = await fetch(`${url}/auth/v1/user`, {
      headers: { apikey: anon, authorization: `Bearer ${token}` },
    });
    if (!r.ok) return { ok: false, status: 401, error: 'Invalid session' };
    const user = await r.json();
    if (!user?.id) return { ok: false, status: 401, error: 'Invalid session' };
    return { ok: true, user };
  } catch {
    return { ok: false, status: 401, error: 'Auth check failed' };
  }
}

// Best-effort per-user rate limit. In-memory, so it only spans a warm
// serverless instance — a backstop against runaway loops/abuse, not a
// hard guarantee. Default: 40 requests / minute per user.
const hits = new Map();
export function rateLimit(id, max = 40, windowMs = 60000) {
  const now = Date.now();
  let rec = hits.get(id);
  if (!rec || now > rec.reset) {
    rec = { count: 0, reset: now + windowMs };
    hits.set(id, rec);
  }
  rec.count += 1;
  return rec.count <= max;
}

// One-call guard for handlers: verifies auth + rate limit, writes the
// error response itself, and returns the user (or null if blocked).
export async function gate(req, res) {
  const auth = await verifyUser(req);
  if (!auth.ok) { res.status(auth.status).json({ error: auth.error }); return null; }
  if (!rateLimit(auth.user.id)) { res.status(429).json({ error: 'Too many requests — slow down a moment.' }); return null; }
  return auth.user;
}
