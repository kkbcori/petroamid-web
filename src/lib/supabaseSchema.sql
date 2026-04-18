-- ═══════════════════════════════════════════════════════════════
-- PetRoamID – Supabase Schema
-- Run this once in your Supabase SQL Editor:
-- https://yhlbdmmkrenkhgxwrxmt.supabase.co/project/default/sql
-- ═══════════════════════════════════════════════════════════════

-- 1. User data table (one row per authenticated user)
CREATE TABLE IF NOT EXISTS public.user_data (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  pets        jsonb NOT NULL DEFAULT '[]',
  trips       jsonb NOT NULL DEFAULT '[]',
  purchases   jsonb NOT NULL DEFAULT '[]',
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 2. Automatically update updated_at on every write
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER set_user_data_updated_at
  BEFORE UPDATE ON public.user_data
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. Row-Level Security (each user can only see/edit their own row)
ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own data"
  ON public.user_data
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Allow users to INSERT their first row
CREATE POLICY "Users can insert their own row"
  ON public.user_data
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Done! You can verify with:
-- SELECT * FROM public.user_data;
