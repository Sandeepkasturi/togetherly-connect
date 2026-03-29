-- ============================================================================
-- PHASE 3: INTERVIEW ROOM DATABASE SCHEMA
-- Togetherly v2 - Interview Rooms with Code Execution & Scorecards
-- ============================================================================
-- IMPORTANT: Run this in Supabase Dashboard → SQL Editor → New query

-- ============================================================================
-- 1. INTERVIEW_QUESTIONS TABLE
-- ============================================================================
-- Question bank for interviews
create table if not exists public.interview_questions (
  id              uuid primary key default gen_random_uuid(),
  space_id        uuid references public.spaces(id) on delete cascade,
  title           text not null,
  description     text not null,
  difficulty      text check (difficulty in ('easy', 'medium', 'hard')) default 'medium',
  category        text,
  example_input   text,
  example_output  text,
  constraints     text,
  is_custom       boolean default false,  -- true if added by host
  created_by      uuid references public.users(id) on delete set null,
  created_at      timestamptz default now()
);

create index if not exists idx_interview_questions_space on public.interview_questions(space_id);
create index if not exists idx_interview_questions_difficulty on public.interview_questions(difficulty);

-- ============================================================================
-- 2. CODE_SUBMISSIONS TABLE
-- ============================================================================
-- Track code submissions during interviews
create table if not exists public.code_submissions (
  id              uuid primary key default gen_random_uuid(),
  space_id        uuid references public.spaces(id) on delete cascade not null,
  user_id         uuid references public.users(id) on delete cascade not null,
  question_id     uuid references public.interview_questions(id) on delete set null,
  language        text check (language in ('javascript', 'python', 'java', 'cpp', 'go', 'rust')),
  code            text not null,
  execution_time  integer,  -- milliseconds
  memory_used     integer,  -- MB
  status          text check (status in ('pending', 'accepted', 'wrong_answer', 'timeout', 'error')),
  output          text,
  error_message   text,
  submitted_at    timestamptz default now(),
  executed_at     timestamptz
);

create index if not exists idx_code_submissions_space on public.code_submissions(space_id);
create index if not exists idx_code_submissions_user on public.code_submissions(user_id);
create index if not exists idx_code_submissions_status on public.code_submissions(status);

-- ============================================================================
-- 3. INTERVIEW_SCORECARDS TABLE
-- ============================================================================
-- Post-interview evaluation forms
create table if not exists public.interview_scorecards (
  id              uuid primary key default gen_random_uuid(),
  space_id        uuid references public.spaces(id) on delete cascade not null,
  candidate_id    uuid references public.users(id) on delete cascade not null,
  evaluator_id    uuid references public.users(id) on delete set null,
  problem_solving integer check (problem_solving >= 0 and problem_solving <= 5),
  communication   integer check (communication >= 0 and communication <= 5),
  code_quality    integer check (code_quality >= 0 and code_quality <= 5),
  feedback_notes  text,
  overall_score   numeric(3,1),  -- computed: avg of above 3
  submitted_at    timestamptz default now(),
  
  unique(space_id, candidate_id, evaluator_id)
);

create index if not exists idx_scorecards_space on public.interview_scorecards(space_id);
create index if not exists idx_scorecards_candidate on public.interview_scorecards(candidate_id);
create index if not exists idx_scorecards_evaluator on public.interview_scorecards(evaluator_id);

-- ============================================================================
-- 4. INTERVIEW_SESSIONS TABLE
-- ============================================================================
-- Track interview session metadata
create table if not exists public.interview_sessions (
  id              uuid primary key default gen_random_uuid(),
  space_id        uuid references public.spaces(id) on delete cascade not null,
  interviewer_id  uuid references public.users(id) on delete cascade not null,
  candidate_id    uuid references public.users(id) on delete cascade not null,
  started_at      timestamptz default now(),
  ended_at        timestamptz,
  duration_mins   integer,
  questions_asked integer default 0,
  solutions_submitted integer default 0,
  status          text check (status in ('in_progress', 'completed', 'cancelled')) default 'in_progress'
);

create index if not exists idx_interview_sessions_space on public.interview_sessions(space_id);
create index if not exists idx_interview_sessions_candidate on public.interview_sessions(candidate_id);

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- interview_questions: Members can read, host can insert
alter table public.interview_questions enable row level security;

create policy "Members can read questions" on public.interview_questions
  for select using (
    space_id is null or exists (
      select 1 from public.space_members
      where space_members.space_id = interview_questions.space_id
        and space_members.user_id = auth.uid()
    )
  );

create policy "Host can insert questions" on public.interview_questions
  for insert with check (
    exists (
      select 1 from public.space_members
      where space_members.space_id = interview_questions.space_id
        and space_members.user_id = auth.uid()
        and space_members.role = 'owner'
    )
  );

-- code_submissions: Members can read and insert own submissions
alter table public.code_submissions enable row level security;

create policy "Members can read submissions" on public.code_submissions
  for select using (
    exists (
      select 1 from public.space_members
      where space_members.space_id = code_submissions.space_id
        and space_members.user_id = auth.uid()
    )
  );

create policy "Users can insert own submissions" on public.code_submissions
  for insert with check (
    user_id = auth.uid() and
    exists (
      select 1 from public.space_members
      where space_members.space_id = code_submissions.space_id
        and space_members.user_id = auth.uid()
    )
  );

-- interview_scorecards: Members can read, evaluator can insert
alter table public.interview_scorecards enable row level security;

create policy "Members can read scorecards" on public.interview_scorecards
  for select using (
    exists (
      select 1 from public.space_members
      where space_members.space_id = interview_scorecards.space_id
        and space_members.user_id = auth.uid()
    )
  );

create policy "Evaluator can insert scorecard" on public.interview_scorecards
  for insert with check (
    evaluator_id = auth.uid() and
    exists (
      select 1 from public.space_members
      where space_members.space_id = interview_scorecards.space_id
        and space_members.user_id = auth.uid()
        and space_members.role = 'owner'
    )
  );

-- interview_sessions: Members can read
alter table public.interview_sessions enable row level security;

create policy "Members can read sessions" on public.interview_sessions
  for select using (
    exists (
      select 1 from public.space_members
      where space_members.space_id = interview_sessions.space_id
        and space_members.user_id = auth.uid()
    )
  );

create policy "Interviewer can insert session" on public.interview_sessions
  for insert with check (
    interviewer_id = auth.uid() and
    exists (
      select 1 from public.space_members
      where space_members.space_id = interview_sessions.space_id
        and space_members.user_id = auth.uid()
        and space_members.role = 'owner'
    )
  );

-- ============================================================================
-- 6. HELPER FUNCTIONS
-- ============================================================================

-- Auto-calculate overall_score on scorecard insert/update
create or replace function calculate_scorecard_overall()
returns trigger as $$
begin
  new.overall_score := round(
    (coalesce(new.problem_solving, 0) +
     coalesce(new.communication, 0) +
     coalesce(new.code_quality, 0))::numeric / 3, 1
  );
  return new;
end;
$$ language plpgsql;

create trigger trg_scorecard_overall
  before insert or update on public.interview_scorecards
  for each row
  execute function calculate_scorecard_overall();
