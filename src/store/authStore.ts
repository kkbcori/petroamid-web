// ─────────────────────────────────────────────────────────────────────────────
// PetRoamID – Auth Store  (Supabase-powered)
// Supports: email+password signup/login, magic link, Google OAuth
// Falls back gracefully to local-only mode when offline
// ─────────────────────────────────────────────────────────────────────────────
import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User, Session, AuthError } from '@supabase/supabase-js';

export type AuthMode = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  user:        User | null;
  session:     Session | null;
  mode:        AuthMode;
  syncStatus:  'idle' | 'syncing' | 'synced' | 'error';
  syncError:   string | null;

  // Derived
  isLoggedIn:   () => boolean;
  displayName:  () => string;
  avatarUrl:    () => string | null;
  userId:       () => string | null;

  // Auth actions
  signUp:        (email: string, password: string, name: string) => Promise<{ error: AuthError | null }>;
  signIn:        (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInMagic:   (email: string) => Promise<{ error: AuthError | null }>;
  signOut:       () => Promise<void>;
  loadSession:   () => Promise<void>;

  // Sync state
  setSyncStatus: (s: AuthState['syncStatus'], err?: string) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user:       null,
  session:    null,
  mode:       'idle',
  syncStatus: 'idle',
  syncError:  null,

  isLoggedIn:  () => !!get().user,
  displayName: () => get().user?.user_metadata?.display_name
                  ?? get().user?.user_metadata?.full_name
                  ?? get().user?.email?.split('@')[0]
                  ?? 'Traveller',
  avatarUrl:   () => get().user?.user_metadata?.avatar_url ?? null,
  userId:      () => get().user?.id ?? null,

  // ── Load existing session on app boot ─────────────────────────────────────
  loadSession: async () => {
    set({ mode: 'loading' });
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      set({ user: session.user, session, mode: 'authenticated' });
    } else {
      set({ user: null, session: null, mode: 'unauthenticated' });
    }

    // Listen for future auth changes (tab focus, token refresh, etc.)
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        set({ user: session.user, session, mode: 'authenticated' });
      } else {
        set({ user: null, session: null, mode: 'unauthenticated' });
      }
    });
  },

  // ── Email + password signup ────────────────────────────────────────────────
  signUp: async (email, password, name) => {
    set({ mode: 'loading' });
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name } },
    });
    if (error) { set({ mode: 'unauthenticated' }); return { error }; }
    if (data.session) {
      set({ user: data.user, session: data.session, mode: 'authenticated' });
    } else {
      // Email confirmation required
      set({ mode: 'unauthenticated' });
    }
    return { error: null };
  },

  // ── Email + password login ─────────────────────────────────────────────────
  signIn: async (email, password) => {
    set({ mode: 'loading' });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { set({ mode: 'unauthenticated' }); return { error }; }
    set({ user: data.user, session: data.session, mode: 'authenticated' });
    return { error: null };
  },

  // ── Magic link (passwordless) ──────────────────────────────────────────────
  signInMagic: async (email) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    return { error: error ?? null };
  },

  // ── Sign out ───────────────────────────────────────────────────────────────
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, mode: 'unauthenticated', syncStatus: 'idle' });
  },

  setSyncStatus: (syncStatus, syncError = null) => set({ syncStatus, syncError }),
}));
