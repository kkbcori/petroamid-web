import React, { createContext, useContext } from 'react';
import { useProfileStore } from './profileStore';
import { createAppStore } from './appStore';

type AppState = ReturnType<ReturnType<typeof createAppStore>['getState']>;

const AppContext = createContext<AppState | null>(null);

// Cache stores per profile ID
const storeCache = new Map<string, ReturnType<typeof createAppStore>>();

function getStore(profileId: string) {
  if (!storeCache.has(profileId)) {
    storeCache.set(profileId, createAppStore(profileId));
  }
  return storeCache.get(profileId)!;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const profileId = useProfileStore(s => s.activeProfileId);
  const store     = profileId ? getStore(profileId) : null;
  const state     = store ? store.getState() : null;

  // Subscribe to store updates
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);
  React.useEffect(() => {
    if (!store) return;
    return store.subscribe(() => forceUpdate());
  }, [store]);

  return (
    <AppContext.Provider value={state}>
      {children}
    </AppContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useData must be used inside AppProvider with an active profile');
  return ctx;
}
