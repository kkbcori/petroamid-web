import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL      = (import.meta as unknown as { env: Record<string, string> }).env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = (import.meta as unknown as { env: Record<string, string> }).env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase env vars');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage,
  },
});

// Redirect URL for magic link — must match Supabase dashboard "Redirect URLs"
export const SITE_URL = (import.meta as unknown as { env: Record<string, string> }).env.VITE_SITE_URL
  || window.location.origin + (window.location.pathname.includes('/petroamid-web') ? '/petroamid-web/' : '/');

export interface UserDataRow {
  id?: string;
  user_id: string;
  pets: unknown[];
  trips: unknown[];
  purchases: unknown[];
  updated_at?: string;
}
