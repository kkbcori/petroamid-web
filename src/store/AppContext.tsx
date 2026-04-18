import React, { createContext, useContext, useEffect, useRef, useMemo } from 'react';
import { useAuthStore } from './authStore';
import { getAppStore } from './appStore';
import type { AppState } from './appStore';
import { pullFromCloud, debouncedPush } from '../lib/syncService';

type StoreInstance = ReturnType<typeof getAppStore>;
const AppContext = createContext<StoreInstance | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { loadSession, userId, isLoggedIn, setSyncStatus } = useAuthStore();
  const uid = userId();

  const store = useMemo(
    () => (uid ? getAppStore(uid) : null),
    [uid],
  );

  useEffect(() => { loadSession(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
  }, [uid]); // eslint-disable-line react-hooks/exhaustive-deps

  const prevDataRef = useRef<string>('');
  useEffect(() => {
    if (!store || !uid) return;
    const unsub = store.subscribe((state: AppState) => {
      const snapshot = JSON.stringify({ pets: state.pets, trips: state.trips, purchases: state.purchases });
      if (snapshot === prevDataRef.current) return;
      prevDataRef.current = snapshot;
      setSyncStatus('syncing');
      debouncedPush(uid, { pets: state.pets, trips: state.trips, purchases: state.purchases }, (err) => {
        if (err) setSyncStatus('error', err);
        else     setSyncStatus('synced');
      });
    });
    return unsub;
  }, [store, uid]); // eslint-disable-line react-hooks/exhaustive-deps

  return <AppContext.Provider value={store}>{children}</AppContext.Provider>;
}

export function useData() {
  const store = useContext(AppContext);
  if (!store) throw new Error('useData: no active session');
  return store();
}

export function useDataSafe() {
  const store = useContext(AppContext);
  return store ? store() : null;
}
