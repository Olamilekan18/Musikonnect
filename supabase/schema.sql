-- Run this in the Supabase SQL editor before connecting real accounts.
-- Profiles are private until a person explicitly enables discoverability.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 40),
  age smallint check (age between 18 and 100),
  city text check (char_length(city) <= 80),
  bio text check (char_length(bio) <= 220),
  instagram text check (char_length(instagram) <= 40),
  avatar_url text,
  discoverable boolean not null default false,
  constraint complete_discoverable_profile check (not discoverable or (age is not null and city is not null and char_length(trim(city)) > 0)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.music_tastes (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  artists jsonb not null default '[]'::jsonb,
  tracks jsonb not null default '[]'::jsonb,
  synced_at timestamptz not null default now()
);

create index if not exists profiles_discoverable_idx on public.profiles(discoverable) where discoverable = true;

alter table public.profiles enable row level security;
alter table public.music_tastes enable row level security;

drop policy if exists "Profile owner can read" on public.profiles;
drop policy if exists "Discoverable profiles can be read" on public.profiles;
drop policy if exists "Profile owner can insert" on public.profiles;
drop policy if exists "Profile owner can update" on public.profiles;
drop policy if exists "Taste owner can read" on public.music_tastes;
drop policy if exists "Discoverable taste can be read" on public.music_tastes;
drop policy if exists "Taste owner can insert" on public.music_tastes;
drop policy if exists "Taste owner can update" on public.music_tastes;

create policy "Profile owner can read" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "Discoverable profiles can be read" on public.profiles for select to authenticated using (discoverable = true);
create policy "Profile owner can insert" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "Profile owner can update" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "Taste owner can read" on public.music_tastes for select to authenticated using ((select auth.uid()) = user_id);
create policy "Discoverable taste can be read" on public.music_tastes for select to authenticated using (exists (select 1 from public.profiles where profiles.id = music_tastes.user_id and profiles.discoverable = true));
create policy "Taste owner can insert" on public.music_tastes for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Taste owner can update" on public.music_tastes for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
