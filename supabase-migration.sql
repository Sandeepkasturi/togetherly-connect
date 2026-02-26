-- ============================================================
--  Togetherly — Supabase SQL Migration
--  Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- 1. Users table
create table if not exists public.users (
  id            uuid primary key default gen_random_uuid(),
  google_sub    text unique not null,
  email         text unique not null,
  display_name  text not null,
  photo_url     text,
  peer_id       text unique not null,
  is_online     boolean default false,
  last_seen     timestamptz default now(),
  created_at    timestamptz default now()
);

-- 2. Follow relationships
create table if not exists public.follows (
  id            uuid primary key default gen_random_uuid(),
  follower_id   uuid references public.users(id) on delete cascade,
  following_id  uuid references public.users(id) on delete cascade,
  status        text check (status in ('pending','accepted')) default 'pending',
  created_at    timestamptz default now(),
  unique(follower_id, following_id)
);

-- 3. Row Level Security — enable but allow all for now
--    (tighten later with proper policies)
alter table public.users  enable row level security;
alter table public.follows enable row level security;

-- Allow anon to read all users (needed for Discover tab)
create policy "Users are publicly readable"
  on public.users for select using (true);

-- Allow anon to insert/update their own row (upsert on login)
create policy "Users can upsert themselves"
  on public.users for insert with check (true);

create policy "Users can update themselves"
  on public.users for update using (true);

-- Allow anon to read/write follows (simplest for now)
create policy "Follows are readable"
  on public.follows for select using (true);

create policy "Follows can be inserted"
  on public.follows for insert with check (true);

create policy "Follows can be updated"
  on public.follows for update using (true);

create policy "Follows can be deleted"
  on public.follows for delete using (true);

-- 4. Indexes for performance
create index if not exists idx_users_google_sub  on public.users(google_sub);
create index if not exists idx_users_peer_id     on public.users(peer_id);
create index if not exists idx_follows_follower  on public.follows(follower_id);
create index if not exists idx_follows_following on public.follows(following_id);
create index if not exists idx_follows_status    on public.follows(status);

-- 5. Youtube Shorts Interactions
create table if not exists public.youtube_shorts_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    video_id TEXT NOT NULL,
    watch_time_ms INTEGER NOT NULL DEFAULT 0,
    liked BOOLEAN NOT NULL DEFAULT false,
    skipped BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

alter table public.youtube_shorts_interactions enable row level security;

create policy "Users can insert their own interactions"
    on public.youtube_shorts_interactions for insert
    to authenticated with check (auth.uid() = user_id);

create policy "Users can view their own interactions"
    on public.youtube_shorts_interactions for select
    to authenticated using (auth.uid() = user_id);

create policy "Users can update their own interactions"
    on public.youtube_shorts_interactions for update
    to authenticated using (auth.uid() = user_id);

