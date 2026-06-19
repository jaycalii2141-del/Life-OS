// ─────────────────────────────────────────────────────────
// aiFetch — POST to an /api AI endpoint with the user's Supabase
// session token attached. The endpoints now require a valid session
// (so the Anthropic key can't be used as an open proxy), so every AI
// call must go through here rather than a bare fetch().
// ─────────────────────────────────────────────────────────
import { supabase } from './supabase.js';

export async function aiFetch(path, body) {
  let token = '';
  try {
    if (supabase) {
      const { data } = await supabase.auth.getSession();
      token = data?.session?.access_token || '';
    }
  } catch {
    /* not signed in / not configured — call proceeds tokenless and 401s,
       which the callers already handle by falling back to local logic. */
  }
  return fetch(path, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
}
