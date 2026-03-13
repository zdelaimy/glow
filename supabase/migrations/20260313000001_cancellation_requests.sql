-- Cancellation requests with 7-day cooling-off period
create table if not exists cancellation_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  glow_girl_id uuid not null references glow_girls(id) on delete cascade,
  subscription_id text not null,
  reason text not null,            -- 'too_expensive', 'not_enough_sales', 'time_commitment', 'switching_companies', 'other'
  reason_detail text,              -- free-text elaboration
  status text not null default 'pending',  -- 'pending', 'cancelled', 'retained'
  cooling_off_ends_at timestamptz not null,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  unique(user_id, status)          -- only one active request at a time
);

create index if not exists idx_cancellation_requests_user
  on cancellation_requests(user_id);

create index if not exists idx_cancellation_requests_status
  on cancellation_requests(status)
  where status = 'pending';

-- RLS
alter table cancellation_requests enable row level security;

create policy "Users can view own cancellation requests"
  on cancellation_requests for select
  using (auth.uid() = user_id);

create policy "Users can insert own cancellation requests"
  on cancellation_requests for insert
  with check (auth.uid() = user_id);
