-- ============================================================================
-- PHASE 1: SPACES DATABASE SCHEMA
-- Togetherly v2 - Navigation & Space Primitive
-- ============================================================================
-- IMPORTANT: Run this in Supabase Dashboard → SQL Editor → New query
-- DO NOT edit supabase-migration.sql - only add new schema here

-- ============================================================================
-- 1. SPACES TABLE
-- ============================================================================
-- Core table for collaboration spaces (study rooms, interview rooms, etc)
create table if not exists public.spaces (
  id              uuid primary key default gen_random_uuid(),
  created_by      uuid references public.users(id) on delete cascade not null,
  slug            text unique not null,                    -- URL-friendly identifier (e.g., "study-session-xyz")
  name            text not null,
  description     text,
  room_type       text check (room_type in ('study', 'interview', 'casual')) default 'study',
  is_active       boolean default true,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Generate slug from name + random suffix
-- Example: "Physics 101" → "physics-101-a1b2c3d4"
create index if not exists idx_spaces_slug on public.spaces(slug);
create index if not exists idx_spaces_created_by on public.spaces(created_by);
create index if not exists idx_spaces_room_type on public.spaces(room_type);

-- ============================================================================
-- 2. SPACE_MEMBERS TABLE
-- ============================================================================
-- Track who is in each space and their role
create table if not exists public.space_members (
  id              uuid primary key default gen_random_uuid(),
  space_id        uuid references public.spaces(id) on delete cascade not null,
  user_id         uuid references public.users(id) on delete cascade not null,
  role            text check (role in ('host', 'member')) default 'member',
  joined_at       timestamptz default now(),
  
  unique(space_id, user_id)
);

create index if not exists idx_space_members_space on public.space_members(space_id);
create index if not exists idx_space_members_user on public.space_members(user_id);

-- ============================================================================
-- 3. SPACE_SESSIONS TABLE
-- ============================================================================
-- Track active sessions within a space (for presence/activity)
create table if not exists public.space_sessions (
  id              uuid primary key default gen_random_uuid(),
  space_id        uuid references public.spaces(id) on delete cascade not null,
  user_id         uuid references public.users(id) on delete cascade not null,
  peer_id         text,                              -- WebRTC peer ID for this session
  
  -- Presence tracking
  is_active       boolean default true,
  last_heartbeat  timestamptz default now(),
  
  -- Activity log
  activity_type   text,                              -- 'editing', 'presenting', 'idle'
  started_at      timestamptz default now(),
  ended_at        timestamptz,
  
  unique(space_id, user_id, id)
);

create index if not exists idx_space_sessions_space on public.space_sessions(space_id);
create index if not exists idx_space_sessions_user on public.space_sessions(user_id);
create index if not exists idx_space_sessions_active on public.space_sessions(is_active);

-- ============================================================================
-- 4. SPACE_INVITES TABLE (Optional for Phase 1, required for Phase 2+)
-- ============================================================================
-- Track pending invitations to spaces
create table if not exists public.space_invites (
  id              uuid primary key default gen_random_uuid(),
  space_id        uuid references public.spaces(id) on delete cascade not null,
  invited_by      uuid references public.users(id) on delete cascade not null,
  invited_user_id uuid references public.users(id) on delete cascade,
  
  -- For email invites (if user doesn't exist yet)
  invite_email    text,
  
  status          text check (status in ('pending', 'accepted', 'declined')) default 'pending',
  created_at      timestamptz default now(),
  expires_at      timestamptz default (now() + interval '7 days'),
  
  -- Either invited_user_id or invite_email must be non-null
  check (
    (invited_user_id is not null and invite_email is null) or
    (invited_user_id is null and invite_email is not null)
  )
);

create index if not exists idx_space_invites_space on public.space_invites(space_id);
create index if not exists idx_space_invites_user on public.space_invites(invited_user_id);
create index if not exists idx_space_invites_email on public.space_invites(invite_email);

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all new tables
alter table public.spaces enable row level security;
alter table public.space_members enable row level security;
alter table public.space_sessions enable row level security;
alter table public.space_invites enable row level security;

-- SPACES: Only authenticated users can read spaces they are members of
create policy "Members can view their spaces"
  on public.spaces for select
  to authenticated
  using (
    exists (
      select 1 from public.space_members
      where space_members.space_id = spaces.id
      and space_members.user_id = auth.uid()
    )
    or created_by = auth.uid()
  );

-- SPACES: Only hosts can update spaces
create policy "Hosts can update their spaces"
  on public.spaces for update
  to authenticated
  using (created_by = auth.uid());

-- SPACES: Only creators can delete spaces
create policy "Creators can delete spaces"
  on public.spaces for delete
  to authenticated
  using (created_by = auth.uid());

-- SPACES: Authenticated users can create spaces
create policy "Users can create spaces"
  on public.spaces for insert
  to authenticated
  with check (created_by = auth.uid());

-- SPACE_MEMBERS: Users can view members of spaces they are in
create policy "View members of your spaces"
  on public.space_members for select
  to authenticated
  using (
    exists (
      select 1 from public.space_members sm2
      where sm2.space_id = space_members.space_id
      and sm2.user_id = auth.uid()
    )
  );

-- SPACE_MEMBERS: Hosts can manage members
create policy "Hosts can manage members"
  on public.space_members for delete
  to authenticated
  using (
    exists (
      select 1 from public.space_members sm2
      where sm2.space_id = space_members.space_id
      and sm2.user_id = auth.uid()
      and sm2.role = 'host'
    )
  );

-- SPACE_MEMBERS: Users can add themselves to spaces (join)
create policy "Users can join spaces"
  on public.space_members for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and role = 'member'
  );

-- SPACE_SESSIONS: Users can view sessions in their spaces
create policy "View sessions in your spaces"
  on public.space_sessions for select
  to authenticated
  using (
    exists (
      select 1 from public.space_members
      where space_members.space_id = space_sessions.space_id
      and space_members.user_id = auth.uid()
    )
  );

-- SPACE_SESSIONS: Users can create their own sessions
create policy "Users can create their own sessions"
  on public.space_sessions for insert
  to authenticated
  with check (user_id = auth.uid());

-- SPACE_SESSIONS: Users can update their own sessions
create policy "Users can update their own sessions"
  on public.space_sessions for update
  to authenticated
  using (user_id = auth.uid());

-- SPACE_INVITES: Users can view invites sent to them
create policy "View your invites"
  on public.space_invites for select
  to authenticated
  using (
    invited_user_id = auth.uid()
    or invited_by = auth.uid()
  );

-- SPACE_INVITES: Users can create invites (if host of space)
create policy "Hosts can invite to spaces"
  on public.space_invites for insert
  to authenticated
  with check (
    invited_by = auth.uid()
    and exists (
      select 1 from public.space_members
      where space_members.space_id = space_invites.space_id
      and space_members.user_id = auth.uid()
      and space_members.role = 'host'
    )
  );

-- SPACE_INVITES: Only invitees can accept/decline
create policy "Users can respond to invites"
  on public.space_invites for update
  to authenticated
  using (invited_user_id = auth.uid());

-- ============================================================================
-- 6. REALTIME SUBSCRIPTIONS
-- ============================================================================
-- Enable realtime for presence tracking
alter publication supabase_realtime add table public.space_sessions;

-- ============================================================================
-- 7. TRIGGERS (Optional - auto-update timestamps)
-- ============================================================================
-- Auto-update spaces.updated_at
create or replace function public.update_spaces_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_spaces_updated_at_trigger
before update on public.spaces
for each row
execute function public.update_spaces_updated_at();

-- ============================================================================
-- 8. SAMPLE DATA (Optional - remove in production)
-- ============================================================================
-- Uncomment to test:
/*
-- Create a test space
insert into public.spaces (created_by, slug, name, description, room_type)
values (
  (select id from public.users limit 1),
  'test-space-phase1',
  'Test Study Space',
  'Testing Phase 1 implementation',
  'study'
);
*/

-- ============================================================================
-- END OF PHASE 1 SCHEMA
-- ============================================================================
