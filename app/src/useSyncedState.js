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
  const lastSynced = useRef(undefined); // serialized value last seen from / sent to remote

  // Pull the remote value once when a session becomes available.
  useEffect(() => {
    pulled.current = false;
    lastSynced.current = undefined;
    if (!configured || !uid) return;
    let active = true;
    supabase
      .from('app_state')
      .select('value')
      .eq('user_id', uid)
      .eq('key', key)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;
        // A failed pull must never unlock pushing: the local cache could
        // belong to a previously signed-in account on this device.
        if (error) return;
        if (data?.value != null) {
          // Remember what we pulled so the push effect below doesn't
          // immediately echo the same value straight back up.
          lastSynced.current = JSON.stringify(data.value);
          setValue(data.value);
        } else {
          // A genuinely empty remote document starts from the supplied
          // default, not whatever another account left in localStorage.
          lastSynced.current = JSON.stringify(initial);
          setValue(initial);
        }
        pulled.current = true;
      });
    return () => { active = false; };
  }, [uid, key, configured]);

  // Push local changes up to Supabase (after the initial pull),
  // skipping no-op writes that just mirror what we already synced.
  useEffect(() => {
    if (!configured || !uid || !pulled.current) return;
    const serialized = JSON.stringify(value);
    if (serialized === lastSynced.current) return; // nothing actually changed
    lastSynced.current = serialized;
    supabase
      .from('app_state')
      .upsert(
        { user_id: uid, key, value, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,key' }
      )
      .then(({ error }) => {
        if (!error) {
          try { window.dispatchEvent(new CustomEvent('lifeos:sync')); } catch { /* ignore */ }
        } else if (lastSynced.current === serialized) {
          // Keep a failed write eligible for the next state-driven retry.
          lastSynced.current = undefined;
        }
      });
  }, [value, uid, key, configured]);

  return [value, setValue];
}
