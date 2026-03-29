-- ============================================================
--  Togetherly — Phase 0: Security & Infrastructure
--  RLS Policy Fixes
--  Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ────────────────────────────────────────────────────────
-- 1. FIX USERS TABLE RLS
-- ────────────────────────────────────────────────────────
-- Drop existing overly permissive policies
drop policy if exists "Users are publicly readable" on public.users;
drop policy if exists "Users can upsert themselves" on public.users;
drop policy if exists "Users can update themselves" on public.users;

-- Allow all authenticated users to view all users (for discovery)
create policy "Authenticated users can read all users"
  on public.users for select
  to authenticated using (true);

-- Allow authenticated users to insert their own row
create policy "Authenticated users can insert their own user"
  on public.users for insert
  to authenticated
  with check (auth.uid() = id);

-- Allow users to update only their own row
create policy "Users can update their own profile"
  on public.users for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ────────────────────────────────────────────────────────
-- 2. FIX FOLLOWS TABLE RLS
-- ────────────────────────────────────────────────────────
-- Drop existing overly permissive policies
drop policy if exists "Follows are readable" on public.follows;
drop policy if exists "Follows can be inserted" on public.follows;
drop policy if exists "Follows can be updated" on public.follows;
drop policy if exists "Follows can be deleted" on public.follows;

-- Allow all authenticated users to view all follows (for discovery)
create policy "Authenticated users can read all follows"
  on public.follows for select
  to authenticated using (true);

-- Allow authenticated users to insert follows (themselves only)
create policy "Authenticated users can create follow requests"
  on public.follows for insert
  to authenticated
  with check (auth.uid() = follower_id);

-- Allow users to update follows they initiated or are the target of
create policy "Users can update follows they initiated"
  on public.follows for update
  to authenticated
  using (auth.uid() = follower_id or auth.uid() = following_id)
  with check (auth.uid() = follower_id or auth.uid() = following_id);

-- Allow users to delete follows they initiated
create policy "Users can delete follows they initiated"
  on public.follows for delete
  to authenticated
  using (auth.uid() = follower_id);

-- ────────────────────────────────────────────────────────
-- 3. CREATE MESSAGES TABLE WITH PROPER RLS
-- ────────────────────────────────────────────────────────
create table if not exists public.messages (
  id            uuid primary key default gen_random_uuid(),
  sender_id     uuid not null references public.users(id) on delete cascade,
  recipient_id  uuid not null references public.users(id) on delete cascade,
  content       text not null,
  is_read       boolean default false,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

alter table public.messages enable row level security;

-- Allow users to read messages they sent or received
create policy "Users can read their own messages"
  on public.messages for select
  to authenticated
  using (auth.uid() = sender_id or auth.uid() = recipient_id);

-- Allow users to insert messages they are sending
create policy "Users can insert their own messages"
  on public.messages for insert
  to authenticated
  with check (auth.uid() = sender_id);

-- Allow users to update messages they sent or received
create policy "Users can update their own messages"
  on public.messages for update
  to authenticated
  using (auth.uid() = sender_id or auth.uid() = recipient_id)
  with check (auth.uid() = sender_id or auth.uid() = recipient_id);

-- Allow users to delete messages they sent
create policy "Users can delete their own messages"
  on public.messages for delete
  to authenticated
  using (auth.uid() = sender_id);

create index if not exists idx_messages_sender on public.messages(sender_id);
create index if not exists idx_messages_recipient on public.messages(recipient_id);
create index if not exists idx_messages_created_at on public.messages(created_at desc);

-- ────────────────────────────────────────────────────────
-- 4. CREATE CALLS TABLE WITH PROPER RLS
-- ────────────────────────────────────────────────────────
create table if not exists public.calls (
  id            uuid primary key default gen_random_uuid(),
  initiator_id  uuid not null references public.users(id) on delete cascade,
  recipient_id  uuid not null references public.users(id) on delete cascade,
  status        text check (status in ('pending','accepted','declined','ended')) default 'pending',
  started_at    timestamptz,
  ended_at      timestamptz,
  created_at    timestamptz default now()
);

alter table public.calls enable row level security;

-- Allow users to read calls involving them
create policy "Users can read their own calls"
  on public.calls for select
  to authenticated
  using (auth.uid() = initiator_id or auth.uid() = recipient_id);

-- Allow users to initiate calls
create policy "Users can create calls"
  on public.calls for insert
  to authenticated
  with check (auth.uid() = initiator_id);

-- Allow users to update calls involving them
create policy "Users can update their own calls"
  on public.calls for update
  to authenticated
  using (auth.uid() = initiator_id or auth.uid() = recipient_id)
  with check (auth.uid() = initiator_id or auth.uid() = recipient_id);

-- Allow users to delete calls they initiated
create policy "Users can delete their own calls"
  on public.calls for delete
  to authenticated
  using (auth.uid() = initiator_id);

create index if not exists idx_calls_initiator on public.calls(initiator_id);
create index if not exists idx_calls_recipient on public.calls(recipient_id);
create index if not exists idx_calls_status on public.calls(status);

-- ────────────────────────────────────────────────────────
-- 5. PUSH SUBSCRIPTIONS TABLE (for secure notification delivery)
-- ────────────────────────────────────────────────────────
create table if not exists public.push_subscriptions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null unique references public.users(id) on delete cascade,
  subscription  jsonb not null,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

alter table public.push_subscriptions enable row level security;

-- Allow users to read their own subscriptions
create policy "Users can read their own push subscriptions"
  on public.push_subscriptions for select
  to authenticated
  using (auth.uid() = user_id);

-- Allow users to manage their own subscriptions
create policy "Users can manage their own push subscriptions"
  on public.push_subscriptions for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own push subscriptions"
  on public.push_subscriptions for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own push subscriptions"
  on public.push_subscriptions for delete
  to authenticated
  using (auth.uid() = user_id);

create index if not exists idx_push_subscriptions_user_id on public.push_subscriptions(user_id);
