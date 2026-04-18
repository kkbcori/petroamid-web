// ─────────────────────────────────────────────────────────────────────────────
// PetRoamID – Supabase Client
// ─────────────────────────────────────────────────────────────────────────────
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL  as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,   // handles magic-link & OAuth redirects
    storage: localStorage,
  },
});

// ── Database schema helpers ───────────────────────────────────────────────────
// Table: public.user_data
//   id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
//   user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE  UNIQUE
//   pets        jsonb DEFAULT '[]'
//   trips       jsonb DEFAULT '[]'
//   purchases   jsonb DEFAULT '[]'
//   updated_at  timestamptz DEFAULT now()
//
// Row-Level Security:
//   ENABLE ROW LEVEL SECURITY on user_data;
//   CREATE POLICY "Users own their data"
//     ON user_data FOR ALL
//     USING (auth.uid() = user_id)
//     WITH CHECK (auth.uid() = user_id);

export interface UserDataRow {
  id?: string;
  user_id: string;
  pets: unknown[];
  trips: unknown[];
  purchases: unknown[];
  updated_at?: string;
}
