// ─────────────────────────────────────────────────────────────────────────────
// PetRoamID – Local Profile Store
// No backend. No passwords. Profiles live in localStorage.
// Multiple profiles supported (e.g. family members with different pets).
// Cross-device sync = export .petroamid JSON → import on other device.
// ─────────────────────────────────────────────────────────────────────────────
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Profile {
  id: string;
  displayName: string;
  avatarEmoji: string;
  createdAt: string;
}

const AVATARS = ['🐶','🐱','🦮','🐕','🐈','🐩','🦜','🐇','🐾','🌍'];

interface ProfileState {
  profiles:        Profile[];
  activeProfileId: string | null;

  activeProfile:   () => Profile | null;
  createProfile:   (name: string) => Profile;
  switchProfile:   (id: string) => void;
  deleteProfile:   (id: string) => void;
  updateProfile:   (id: string, updates: Partial<Pick<Profile, 'displayName' | 'avatarEmoji'>>) => void;
  logout:          () => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profiles: [],
      activeProfileId: null,

      activeProfile: () => {
        const { profiles, activeProfileId } = get();
        return profiles.find(p => p.id === activeProfileId) ?? null;
      },

      createProfile: (name) => {
        const profile: Profile = {
          id: crypto.randomUUID(),
          displayName: name.trim(),
          avatarEmoji: AVATARS[Math.floor(Math.random() * AVATARS.length)],
          createdAt: new Date().toISOString(),
        };
        set(s => ({ profiles: [...s.profiles, profile], activeProfileId: profile.id }));
        return profile;
      },

      switchProfile: (id) => set({ activeProfileId: id }),

      deleteProfile: (id) => {
        // Clear the profile's data store too
        try { localStorage.removeItem(`petroam-data-${id}`); } catch { /* noop */ }
        set(s => ({
          profiles: s.profiles.filter(p => p.id !== id),
          activeProfileId: s.activeProfileId === id ? null : s.activeProfileId,
        }));
      },

      updateProfile: (id, updates) =>
        set(s => ({ profiles: s.profiles.map(p => p.id === id ? { ...p, ...updates } : p) })),

      logout: () => set({ activeProfileId: null }),
    }),
    { name: 'petroam-profiles', storage: createJSONStorage(() => localStorage) },
  ),
);
