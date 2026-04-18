// ─────────────────────────────────────────────────────────────────────────────
// PetRoamID – App Context  (local-only, no sync)
// Provides the active profile's data store to the component tree.
// ─────────────────────────────────────────────────────────────────────────────
import React, { createContext, useContext, useMemo } from 'react';
import { useProfileStore } from './profileStore';
import { getAppStore } from './appStore';

type StoreInstance = ReturnType<typeof getAppStore>;
const AppContext = createContext<StoreInstance | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const activeProfileId = useProfileStore(s => s.activeProfileId);
  const store = useMemo(
    () => (activeProfileId ? getAppStore(activeProfileId) : null),
    [activeProfileId],
  );
  return <AppContext.Provider value={store}>{children}</AppContext.Provider>;
}

export function useData() {
  const store = useContext(AppContext);
  if (!store) throw new Error('useData: no active profile');
  return store();
}
