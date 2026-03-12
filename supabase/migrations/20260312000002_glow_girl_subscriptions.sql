-- Add subscription fields to profiles for Glow Girl membership
alter table profiles
  add column if not exists subscription_plan text,          -- 'pro' or 'elite'
  add column if not exists subscription_billing text,       -- 'monthly' or 'annual'
  add column if not exists subscription_id text,            -- PayPal subscription ID
  add column if not exists subscription_status text,        -- 'active', 'cancelled', 'past_due'
  add column if not exists subscribed_at timestamptz;

-- Index for quick lookups of active subscribers
create index if not exists idx_profiles_subscription_status
  on profiles(subscription_status)
  where subscription_status is not null;
