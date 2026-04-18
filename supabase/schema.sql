-- ═══════════════════════════════════════════════════════════════════════════
-- PetRoamID – Supabase Schema
-- Run this in the Supabase SQL Editor to set up your project.
-- Strategy: store each entity as a JSONB blob keyed by uuid.
--   Pros: zero migrations when the app schema changes; app logic stays pure TS
--   Cons: no server-side column filtering (not needed here)
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. PETS ─────────────────────────────────────────────────────────────────
create table if not exists public.pets (
  id          uuid        primary key,
  user_id     uuid        not null references auth.users (id) on delete cascade,
  data        jsonb       not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── 2. TRIPS ────────────────────────────────────────────────────────────────
create table if not exists public.trips (
  id          uuid        primary key,
  user_id     uuid        not null references auth.users (id) on delete cascade,
  data        jsonb       not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── 3. PURCHASES ────────────────────────────────────────────────────────────
create table if not exists public.purchases (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users (id) on delete cascade,
  trip_id     uuid        not null,
  data        jsonb       not null,
  created_at  timestamptz not null default now()
);

-- ── 4. USER PROFILES (display name, avatar) ─────────────────────────────────
create table if not exists public.profiles (
  id            uuid        primary key references auth.users (id) on delete cascade,
  display_name  text        not null default '',
  avatar_emoji  text        not null default '🐾',
  updated_at    timestamptz not null default now()
);

-- Auto-create a profile row whenever a new user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, display_name, avatar_emoji)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_emoji', '🐾')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── 5. updated_at triggers ──────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger pets_updated_at    before update on public.pets    for each row execute procedure public.set_updated_at();
create or replace trigger trips_updated_at   before update on public.trips   for each row execute procedure public.set_updated_at();
create or replace trigger profiles_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();

-- ── 6. ROW LEVEL SECURITY ───────────────────────────────────────────────────
alter table public.pets       enable row level security;
alter table public.trips      enable row level security;
alter table public.purchases  enable row level security;
alter table public.profiles   enable row level security;

-- Pets: owner-only
create policy "pets: owner access" on public.pets      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "trips: owner access" on public.trips    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "purchases: owner access" on public.purchases for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "profiles: owner access" on public.profiles   for all using (auth.uid() = id)      with check (auth.uid() = id);

-- ── 7. REALTIME ─────────────────────────────────────────────────────────────
-- Enable realtime replication so devices sync instantly when another device saves
alter publication supabase_realtime add table public.pets;
alter publication supabase_realtime add table public.trips;
