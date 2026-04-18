import { create } from 'zustand';
import { supabase, SITE_URL } from '../lib/supabase';
import type { User, Session, AuthError } from '@supabase/supabase-js';

export type AuthMode = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  user:        User | null;
  session:     Session | null;
  mode:        AuthMode;
  syncStatus:  'idle' | 'syncing' | 'synced' | 'error';
  syncError:   string | null;

  isLoggedIn:   () => boolean;
  displayName:  () => string;
  avatarUrl:    () => string | null;
  userId:       () => string | null;

  signIn:       (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInMagic:  (email: string) => Promise<{ error: AuthError | null }>;
  signOut:      () => Promise<void>;
  loadSession:  () => Promise<void>;
  setSyncStatus:(s: AuthState['syncStatus'], err?: string) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null, session: null, mode: 'idle', syncStatus: 'idle', syncError: null,

  isLoggedIn:  () => !!get().user,
  displayName: () =>
    (get().user?.user_metadata?.['display_name'] as string | undefined) ??
    (get().user?.user_metadata?.['full_name']    as string | undefined) ??
    get().user?.email?.split('@')[0] ??
    'Traveller',
  avatarUrl: () => (get().user?.user_metadata?.['avatar_url'] as string | undefined) ?? null,
  userId:    () => get().user?.id ?? null,

  loadSession: async () => {
    set({ mode: 'loading' });
    const { data: { session } } = await supabase.auth.getSession();
    if (session) set({ user: session.user, session, mode: 'authenticated' });
    else         set({ user: null, session: null, mode: 'unauthenticated' });

    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) set({ user: session.user, session, mode: 'authenticated' });
      else         set({ user: null, session: null, mode: 'unauthenticated' });
    });
  },

  signIn: async (email, password) => {
    set({ mode: 'loading' });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { set({ mode: 'unauthenticated' }); return { error }; }
    set({ user: data.user, session: data.session, mode: 'authenticated' });
    return { error: null };
  },

  // Magic link — redirectTo must exactly match an entry in Supabase → Auth → URL Configuration → Redirect URLs
  signInMagic: async (email) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: SITE_URL,
      },
    });
    return { error: error ?? null };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, mode: 'unauthenticated', syncStatus: 'idle' });
  },

  setSyncStatus: (syncStatus, syncError?) => set({ syncStatus, syncError: syncError ?? null }),
}));
