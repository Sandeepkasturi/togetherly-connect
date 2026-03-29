-- ============================================================================
-- PHASE 2: STUDY ROOM FEATURES DATABASE SCHEMA
-- Togetherly v2 - Study Room with PDF, Notes, and Pomodoro
-- ============================================================================
-- IMPORTANT: Run this in Supabase Dashboard → SQL Editor → New query
-- DO NOT edit other migration files

-- ============================================================================
-- 1. SPACE_NOTES TABLE
-- ============================================================================
-- Shared notes for study sessions
create table if not exists public.space_notes (
  id              uuid primary key default gen_random_uuid(),
  space_id        uuid references public.spaces(id) on delete cascade not null,
  content         text default '',
  created_by      uuid references public.users(id) on delete set null,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  
  unique(space_id)
);

create index if not exists idx_space_notes_space on public.space_notes(space_id);
create index if not exists idx_space_notes_updated_at on public.space_notes(updated_at);

-- ============================================================================
-- 2. SPACE_PDFs TABLE
-- ============================================================================
-- Track uploaded PDFs for each space
create table if not exists public.space_pdfs (
  id              uuid primary key default gen_random_uuid(),
  space_id        uuid references public.spaces(id) on delete cascade not null,
  file_url        text not null,
  file_name       text not null,
  file_size       integer,
  uploaded_by     uuid references public.users(id) on delete set null,
  current_page    integer default 1,
  total_pages     integer,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists idx_space_pdfs_space on public.space_pdfs(space_id);
create index if not exists idx_space_pdfs_created_at on public.space_pdfs(created_at desc);

-- ============================================================================
-- 3. POMODORO_SESSIONS TABLE
-- ============================================================================
-- Track Pomodoro timer sessions in spaces
create table if not exists public.pomodoro_sessions (
  id              uuid primary key default gen_random_uuid(),
  space_id        uuid references public.spaces(id) on delete cascade not null,
  host_id         uuid references public.users(id) on delete cascade not null,
  duration_mins   integer default 25,  -- 25 min work, 5 min break
  is_active       boolean default false,
  started_at      timestamptz,
  ended_at        timestamptz,
  completed_sessions integer default 0,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists idx_pomodoro_space on public.pomodoro_sessions(space_id);
create index if not exists idx_pomodoro_host on public.pomodoro_sessions(host_id);
create index if not exists idx_pomodoro_active on public.pomodoro_sessions(is_active);

-- ============================================================================
-- 4. SYNC_EVENTS TABLE
-- ============================================================================
-- Log sync events for collaborative features (notes, PDF page, timer state)
create table if not exists public.sync_events (
  id              uuid primary key default gen_random_uuid(),
  space_id        uuid references public.spaces(id) on delete cascade not null,
  user_id         uuid references public.users(id) on delete cascade not null,
  event_type      text check (event_type in ('notes_update', 'pdf_page', 'timer_start', 'timer_pause', 'timer_reset')),
  data            jsonb,  -- Flexible data: {page_num: 5}, {content_snapshot: "..."}, {action: "start"}
  created_at      timestamptz default now()
);

create index if not exists idx_sync_events_space on public.sync_events(space_id);
create index if not exists idx_sync_events_type on public.sync_events(event_type);
create index if not exists idx_sync_events_created_at on public.sync_events(created_at desc);

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- space_notes: Only members of the space can read/write
alter table public.space_notes enable row level security;

create policy "Members can read notes" on public.space_notes
  for select using (
    exists (
      select 1 from public.space_members
      where space_members.space_id = space_notes.space_id
        and space_members.user_id = auth.uid()
    )
  );

create policy "Members can update notes" on public.space_notes
  for update using (
    exists (
      select 1 from public.space_members
      where space_members.space_id = space_notes.space_id
        and space_members.user_id = auth.uid()
    )
  );

create policy "Members can insert notes" on public.space_notes
  for insert with check (
    exists (
      select 1 from public.space_members
      where space_members.space_id = space_notes.space_id
        and space_members.user_id = auth.uid()
    )
  );

-- space_pdfs: Only members of the space can read
alter table public.space_pdfs enable row level security;

create policy "Members can read PDFs" on public.space_pdfs
  for select using (
    exists (
      select 1 from public.space_members
      where space_members.space_id = space_pdfs.space_id
        and space_members.user_id = auth.uid()
    )
  );

create policy "Host can insert PDFs" on public.space_pdfs
  for insert with check (
    exists (
      select 1 from public.space_members
      where space_members.space_id = space_pdfs.space_id
        and space_members.user_id = auth.uid()
        and space_members.role = 'owner'
    )
  );

-- pomodoro_sessions: Members can read, host controls
alter table public.pomodoro_sessions enable row level security;

create policy "Members can read sessions" on public.pomodoro_sessions
  for select using (
    exists (
      select 1 from public.space_members
      where space_members.space_id = pomodoro_sessions.space_id
        and space_members.user_id = auth.uid()
    )
  );

create policy "Host can manage sessions" on public.pomodoro_sessions
  for all using (
    exists (
      select 1 from public.space_members
      where space_members.space_id = pomodoro_sessions.space_id
        and space_members.user_id = auth.uid()
        and space_members.role = 'owner'
    )
  );

-- sync_events: Members can read and insert
alter table public.sync_events enable row level security;

create policy "Members can read events" on public.sync_events
  for select using (
    exists (
      select 1 from public.space_members
      where space_members.space_id = sync_events.space_id
        and space_members.user_id = auth.uid()
    )
  );

create policy "Members can insert events" on public.sync_events
  for insert with check (
    exists (
      select 1 from public.space_members
      where space_members.space_id = sync_events.space_id
        and space_members.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 6. HELPER FUNCTION: Update space updated_at on note change
-- ============================================================================
create or replace function update_space_updated_at()
returns trigger as $$
begin
  update public.spaces
  set updated_at = now()
  where id = new.space_id;
  return new;
end;
$$ language plpgsql;

-- Trigger on space_notes updates
create trigger trg_space_notes_updated_at
  after insert or update on public.space_notes
  for each row
  execute function update_space_updated_at();

-- Trigger on sync_events inserts
create trigger trg_sync_events_updated_at
  after insert on public.sync_events
  for each row
  execute function update_space_updated_at();
