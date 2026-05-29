// ─────────────────────────────────────────────────────────
// useSyncedState — local-first state that also syncs to Supabase
// when the user is signed in. Falls back to localStorage-only
// when Supabase isn't configured or there's no session.
//
// Strategy: localStorage is always the instant source of truth
// (fast paint, offline-safe). When a session exists we pull the
// remote row once on login, then push every local change up.
// ─────────────────────────────────────────────────────────
import { useEffect, useRef } from 'react';
import { usePersistentState } from './usePersistentState.js';
import { useAuth } from './auth/AuthProvider.jsx';
import { supabase } from './lib/supabase.js';

export function useSyncedState(key, initial) {
  const [value, setValue] = usePersistentState(key, initial);
  const { session, configured } = useAuth();
  const uid = session?.user?.id;
  const pulled = useRef(false);

  // Pull the remote value once when a session becomes available.
  useEffect(() => {
    pulled.current = false;
    if (!configured || !uid) return;
    let active = true;
    supabase
      .from('app_state')
      .select('value')
      .eq('user_id', uid)
      .eq('key', key)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return;
        if (data?.value != null) setValue(data.value);
        pulled.current = true;
      });
    return () => { active = false; };
  }, [uid, key, configured]);

  // Push local changes up to Supabase (after the initial pull).
  useEffect(() => {
    if (!configured || !uid || !pulled.current) return;
    supabase
      .from('app_state')
      .upsert(
        { user_id: uid, key, value, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,key' }
      )
      .then(() => {});
  }, [value, uid, key, configured]);

  return [value, setValue];
}
