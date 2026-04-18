// ─────────────────────────────────────────────────────────────────────────────
// PetRoamID – App Context + Supabase Sync Bridge
// • Loads session on mount
// • Pulls cloud data when user signs in
// • Pushes to cloud (debounced) on every state change
// ─────────────────────────────────────────────────────────────────────────────
import React, { createContext, useContext, useEffect, useRef, useMemo } from 'react';
import { useAuthStore } from './authStore';
import { getAppStore } from './appStore';
import { pullFromCloud, debouncedPush } from '../lib/syncService';

type StoreInstance = ReturnType<typeof getAppStore>;
const AppContext = createContext<StoreInstance | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { loadSession, userId, isLoggedIn, setSyncStatus } = useAuthStore();
  const uid = userId();

  // Per-user store (localStorage key = user's Supabase uid)
  const store = useMemo(
    () => (uid ? getAppStore(uid) : null),
    [uid],
  );

  // ── Boot: restore Supabase session ──────────────────────────────────────────
  useEffect(() => { loadSession(); }, []);   // eslint-disable-line

  // ── When user logs in: pull latest data from cloud ──────────────────────────
  useEffect(() => {
    if (!uid || !store) return;
    (async () => {
      setSyncStatus('syncing');
      const cloud = await pullFromCloud(uid);
      if (cloud) {
        store.setState({
          pets:      cloud.pets,
          trips:     cloud.trips,
          purchases: cloud.purchases,
        });
      }
      setSyncStatus('synced');
    })();
  }, [uid]);   // eslint-disable-line

  // ── Subscribe to local store changes and push to cloud ──────────────────────
  const prevDataRef = useRef<string>('');
  useEffect(() => {
    if (!store || !uid) return;
    const unsub = store.subscribe((state) => {
      const snapshot = JSON.stringify({
        pets: state.pets, trips: state.trips, purchases: state.purchases,
      });
      if (snapshot === prevDataRef.current) return;   // no real change
      prevDataRef.current = snapshot;
      setSyncStatus('syncing');
      debouncedPush(uid, { pets: state.pets, trips: state.trips, purchases: state.purchases }, (err) => {
        if (err) setSyncStatus('error', err);
        else     setSyncStatus('synced');
      });
    });
    return unsub;
  }, [store, uid]);  // eslint-disable-line

  return <AppContext.Provider value={store}>{children}</AppContext.Provider>;
}

export function useData() {
  const store = useContext(AppContext);
  if (!store) throw new Error('useData: no active session');
  return store();
}

// Safe version that doesn't throw — use in components that render before login
export function useDataSafe() {
  const store = useContext(AppContext);
  return store ? store() : null;
}
