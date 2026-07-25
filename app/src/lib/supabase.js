// ─────────────────────────────────────────────────────────
// Supabase client — created only when env vars are present.
// If not configured, the app falls back to localStorage-only.
// ─────────────────────────────────────────────────────────
import { createClient } from '@supabase/supabase-js';

// Publishable client configuration is safe to ship in a browser bundle when
// every exposed table is protected by RLS. Keep env overrides for deployments,
// with the Life OS project as a resilient production fallback so cloud sync
// cannot silently disappear when a Vercel environment variable is missing.
const url = import.meta.env.VITE_SUPABASE_URL
  || 'https://nuhpeeimvmdrcrljbzjv.supabase.co';
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  || 'sb_publishable_mUtBmgAl7NpuC7lL9ThLTQ_tLcN7Aaf';

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
