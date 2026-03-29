-- ============================================================================
-- PHASE 4 & 5: MONETIZATION & AI DATABASE SCHEMA
-- Togetherly v2 - Subscriptions, Feature Gating, AI Interactions
-- ============================================================================
-- IMPORTANT: Run this in Supabase Dashboard → SQL Editor → New query

-- ============================================================================
-- 1. SUBSCRIPTIONS TABLE
-- ============================================================================
-- User subscription management
create table if not exists public.subscriptions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references public.users(id) on delete cascade not null,
  plan_type       text check (plan_type in ('free', 'pro', 'premium')) default 'free',
  status          text check (status in ('active', 'cancelled', 'expired')) default 'active',
  billing_cycle   text check (billing_cycle in ('monthly', 'yearly')) default 'monthly',
  current_period_start  timestamptz,
  current_period_end    timestamptz,
  payment_method  text,  -- Last 4 digits
  razorpay_subscription_id  text unique,
  razorpay_customer_id      text,
  auto_renew      boolean default true,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  cancelled_at    timestamptz,
  
  unique(user_id)
);

create index if not exists idx_subscriptions_user on public.subscriptions(user_id);
create index if not exists idx_subscriptions_plan on public.subscriptions(plan_type);
create index if not exists idx_subscriptions_status on public.subscriptions(status);
create index if not exists idx_subscriptions_razorpay_id on public.subscriptions(razorpay_subscription_id);

-- ============================================================================
-- 2. USAGE_TRACKING TABLE
-- ============================================================================
-- Track feature usage for free tier limits
create table if not exists public.usage_tracking (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references public.users(id) on delete cascade not null,
  spaces_created_month      integer default 0,
  spaces_active            integer default 0,
  code_executions_month    integer default 0,
  ai_messages_month        integer default 0,
  storage_used_mb          integer default 0,
  period_start    date,
  period_end      date,
  updated_at      timestamptz default now(),
  
  unique(user_id, period_start, period_end)
);

create index if not exists idx_usage_tracking_user on public.usage_tracking(user_id);
create index if not exists idx_usage_tracking_period on public.usage_tracking(period_start, period_end);

-- ============================================================================
-- 3. PAYMENT_HISTORY TABLE
-- ============================================================================
-- Transaction history for audit and analytics
create table if not exists public.payment_history (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references public.users(id) on delete cascade not null,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  razorpay_payment_id     text unique,
  razorpay_order_id       text,
  amount_paid     integer,  -- In paise (₹ * 100)
  currency        text default 'INR',
  plan_type       text,
  billing_cycle   text,
  status          text check (status in ('authorized', 'captured', 'failed', 'refunded')),
  payment_method  text,  -- card, upi, etc.
  failure_reason  text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists idx_payment_history_user on public.payment_history(user_id);
create index if not exists idx_payment_history_status on public.payment_history(status);
create index if not exists idx_payment_history_razorpay on public.payment_history(razorpay_payment_id);

-- ============================================================================
-- 4. AI_CONVERSATIONS TABLE
-- ============================================================================
-- Store AI chat history for context and feedback
create table if not exists public.ai_conversations (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references public.users(id) on delete cascade not null,
  space_id        uuid references public.spaces(id) on delete cascade,
  context_type    text check (context_type in ('study', 'interview', 'general')),
  title           text,
  messages        jsonb,  -- Array of {role, content, timestamp}
  total_tokens_used integer default 0,
  model_used      text default 'gemini-2.5-flash',
  created_at      timestamptz default now(),
  last_message_at timestamptz
);

create index if not exists idx_ai_conversations_user on public.ai_conversations(user_id);
create index if not exists idx_ai_conversations_space on public.ai_conversations(space_id);
create index if not exists idx_ai_conversations_created on public.ai_conversations(created_at);

-- ============================================================================
-- 5. AI_FEEDBACK TABLE
-- ============================================================================
-- Store AI-generated feedback on interview performance
create table if not exists public.ai_feedback (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references public.users(id) on delete cascade not null,
  space_id        uuid references public.spaces(id) on delete cascade,
  interview_session_id uuid references public.interview_sessions(id) on delete cascade,
  code_submission_id   uuid references public.code_submissions(id) on delete cascade,
  
  feedback_type   text check (feedback_type in ('code_quality', 'explanation', 'performance', 'communication')),
  strengths       text[],
  areas_to_improve text[],
  suggestions     text,
  score           numeric(3,1),  -- 1-5 stars
  
  generated_at    timestamptz default now(),
  tokens_used     integer
);

create index if not exists idx_ai_feedback_user on public.ai_feedback(user_id);
create index if not exists idx_ai_feedback_space on public.ai_feedback(space_id);
create index if not exists idx_ai_feedback_type on public.ai_feedback(feedback_type);

-- ============================================================================
-- 6. FEATURE_GATES TABLE
-- ============================================================================
-- Track which features are enabled per plan
create table if not exists public.feature_gates (
  id              uuid primary key default gen_random_uuid(),
  feature_id      text unique not null,
  feature_name    text not null,
  description     text,
  available_in    text[] not null,  -- ['free', 'pro', 'premium']
  created_at      timestamptz default now()
);

insert into public.feature_gates (feature_id, feature_name, available_in) values
  ('unlimited_spaces', 'Unlimited Spaces', ARRAY['pro', 'premium']),
  ('code_execution', 'Code Execution (Judge0)', ARRAY['pro', 'premium']),
  ('ai_feedback', 'AI-Powered Feedback', ARRAY['premium']),
  ('session_recording', 'Session Recording', ARRAY['pro', 'premium']),
  ('analytics', 'Advanced Analytics', ARRAY['premium']),
  ('api_access', 'API Access', ARRAY['premium']),
  ('custom_branding', 'Custom Branding', ARRAY['pro', 'premium']),
  ('priority_support', 'Priority Support', ARRAY['pro', 'premium'])
on conflict (feature_id) do nothing;

-- ============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- subscriptions: Users can read/manage own subscription
alter table public.subscriptions enable row level security;

create policy "Users can read own subscription" on public.subscriptions
  for select using (user_id = auth.uid());

create policy "System can update subscription" on public.subscriptions
  for update using (user_id = auth.uid());

-- usage_tracking: Users can read own usage
alter table public.usage_tracking enable row level security;

create policy "Users can read own usage" on public.usage_tracking
  for select using (user_id = auth.uid());

-- payment_history: Users can read own payments
alter table public.payment_history enable row level security;

create policy "Users can read own payments" on public.payment_history
  for select using (user_id = auth.uid());

-- ai_conversations: Users can read/manage own conversations
alter table public.ai_conversations enable row level security;

create policy "Users can read own conversations" on public.ai_conversations
  for select using (user_id = auth.uid());

create policy "Users can create conversations" on public.ai_conversations
  for insert with check (user_id = auth.uid());

create policy "Users can update own conversations" on public.ai_conversations
  for update using (user_id = auth.uid());

-- ai_feedback: Users can read own feedback, space members can read space feedback
alter table public.ai_feedback enable row level security;

create policy "Users can read own feedback" on public.ai_feedback
  for select using (
    user_id = auth.uid() or
    exists (
      select 1 from public.space_members
      where space_members.space_id = ai_feedback.space_id
        and space_members.user_id = auth.uid()
    )
  );

-- feature_gates: Anyone can read
alter table public.feature_gates enable row level security;

create policy "Anyone can read features" on public.feature_gates
  for select using (true);

-- ============================================================================
-- 8. HELPER FUNCTIONS
-- ============================================================================

-- Function to check if user has access to feature
create or replace function has_feature_access(
  p_user_id uuid,
  p_feature_id text
)
returns boolean as $$
declare
  v_plan_type text;
  v_available_in text[];
begin
  -- Get user's current plan
  select plan_type into v_plan_type from public.subscriptions
  where user_id = p_user_id
  limit 1;
  
  -- Default to free if no subscription
  if v_plan_type is null then
    v_plan_type := 'free';
  end if;
  
  -- Check if feature is available in user's plan
  select available_in into v_available_in from public.feature_gates
  where feature_id = p_feature_id;
  
  return v_available_in @> ARRAY[v_plan_type];
end;
$$ language plpgsql;

-- Function to reset monthly usage
create or replace function reset_monthly_usage()
returns void as $$
begin
  update public.usage_tracking
  set spaces_created_month = 0,
      code_executions_month = 0,
      ai_messages_month = 0,
      period_start = date_trunc('month', now())::date,
      period_end = (date_trunc('month', now()) + interval '1 month' - interval '1 day')::date
  where period_end < now()::date;
end;
$$ language plpgsql;

-- Function to create subscription after user signup
create or replace function create_default_subscription()
returns trigger as $$
begin
  insert into public.subscriptions (user_id, plan_type, status)
  values (new.id, 'free', 'active')
  on conflict do nothing;
  
  return new;
end;
$$ language plpgsql;

-- Trigger to auto-create free subscription for new users
create trigger trg_new_user_subscription
  after insert on public.users
  for each row
  execute function create_default_subscription();

-- ============================================================================
-- 9. VIEWS FOR DASHBOARD
-- ============================================================================

-- View for subscription status with plan details
create or replace view subscription_details as
select 
  s.id,
  s.user_id,
  s.plan_type,
  s.status,
  s.billing_cycle,
  s.current_period_start,
  s.current_period_end,
  u.full_name,
  u.email,
  (s.current_period_end > now()) as is_active
from public.subscriptions s
left join public.users u on s.user_id = u.id;

-- View for revenue analytics
create or replace view revenue_analytics as
select
  date_trunc('day', created_at)::date as date,
  plan_type,
  billing_cycle,
  count(*) as transactions,
  sum(amount_paid) / 100.0 as revenue_inr,
  avg(amount_paid) / 100.0 as avg_transaction_inr
from public.payment_history
where status in ('authorized', 'captured')
group by date_trunc('day', created_at), plan_type, billing_cycle;
