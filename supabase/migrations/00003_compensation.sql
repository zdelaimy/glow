-- Compensation & Rewards Schema

-- Enums
create type commission_type as enum ('PERSONAL', 'REFERRAL_MATCH');
create type commission_status as enum ('PENDING', 'APPROVED', 'PAID', 'CANCELLED');
create type payout_status as enum ('PENDING', 'PROCESSING', 'PAID', 'FAILED');
create type bonus_type as enum ('MONTHLY_TIER', 'NEW_CREATOR');
create type reward_tier as enum ('PEARL', 'OPAL', 'ROSE_QUARTZ', 'AMETHYST', 'SAPPHIRE', 'DIAMOND');

-- Add referral columns to creators
alter table creators add column referral_code text unique;
alter table creators add column referred_by_code text;

-- Commission settings (single-row global config)
create table commission_settings (
  id uuid primary key default gen_random_uuid(),
  commission_rate numeric(5,4) not null default 0.25, -- 25%
  referral_match_rate numeric(5,4) not null default 0.10, -- 10% of referred creator's commission
  new_creator_bonus_cents int not null default 50000, -- $500 total available
  new_creator_bonus_window_days int not null default 45,
  points_personal_multiplier int not null default 4,
  points_referral_multiplier int not null default 1,
  commission_hold_days int not null default 14,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Seed default settings
insert into commission_settings (id) values (gen_random_uuid());

-- Monthly bonus tiers (15 rows)
create table monthly_bonus_tiers (
  id uuid primary key default gen_random_uuid(),
  min_commission_cents int not null,
  max_commission_cents int, -- null = unlimited (top tier)
  bonus_cents int not null,
  tier_label text not null,
  sort_order int not null default 0
);

-- Seed bonus tiers
insert into monthly_bonus_tiers (min_commission_cents, max_commission_cents, bonus_cents, tier_label, sort_order) values
  (0,       4999,   0,      'Starter',       1),
  (5000,    9999,   2500,   'Bronze',        2),
  (10000,   19999,  5000,   'Silver',        3),
  (20000,   29999,  10000,  'Gold',          4),
  (30000,   39999,  17500,  'Gold+',         5),
  (40000,   49999,  25000,  'Platinum',      6),
  (50000,   74999,  40000,  'Platinum+',     7),
  (75000,   99999,  62500,  'Ruby',          8),
  (100000,  149999, 100000, 'Ruby+',         9),
  (150000,  199999, 150000, 'Emerald',      10),
  (200000,  299999, 225000, 'Emerald+',     11),
  (300000,  499999, 375000, 'Diamond',      12),
  (500000,  749999, 625000, 'Diamond+',     13),
  (750000,  999999, 875000, 'Elite',        14),
  (1000000, null,   1250000,'Top Seller',   15);

-- Creator referrals
create table creator_referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references creators(id) on delete cascade,
  referred_id uuid not null references creators(id) on delete cascade,
  match_expires_at timestamptz not null, -- 12 months from creation
  created_at timestamptz not null default now(),
  unique(referrer_id, referred_id),
  constraint different_creators check (referrer_id <> referred_id)
);

-- Commissions (one row per order per beneficiary)
create table commissions (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references creators(id) on delete cascade,
  order_id uuid not null references orders(id) on delete cascade,
  commission_type commission_type not null,
  amount_cents int not null,
  rate numeric(5,4) not null,
  status commission_status not null default 'PENDING',
  approved_at timestamptz,
  paid_at timestamptz,
  period text, -- 'YYYY-MM' for monthly grouping
  created_at timestamptz not null default now()
);

-- Bonuses
create table bonuses (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references creators(id) on delete cascade,
  bonus_type bonus_type not null,
  amount_cents int not null,
  period text, -- 'YYYY-MM'
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);

-- Reward points ledger (append-only)
create table reward_points_ledger (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references creators(id) on delete cascade,
  order_id uuid references orders(id) on delete set null,
  points int not null,
  source commission_type not null, -- PERSONAL (4x) or REFERRAL_MATCH (1x)
  description text,
  created_at timestamptz not null default now()
);

-- Reward points balance (materialized running total)
create table reward_points_balance (
  creator_id uuid primary key references creators(id) on delete cascade,
  total_points int not null default 0,
  updated_at timestamptz not null default now()
);

-- Reward milestones
create table reward_milestones (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references creators(id) on delete cascade,
  tier reward_tier not null,
  points_at_crossing int not null,
  created_at timestamptz not null default now(),
  unique(creator_id, tier)
);

-- Payouts (aggregated monthly)
create table payouts (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references creators(id) on delete cascade,
  period text not null, -- 'YYYY-MM'
  commission_total_cents int not null default 0,
  bonus_total_cents int not null default 0,
  total_cents int not null default 0,
  status payout_status not null default 'PENDING',
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  unique(creator_id, period)
);

-- Indexes
create index idx_commissions_creator_id on commissions(creator_id);
create index idx_commissions_order_id on commissions(order_id);
create index idx_commissions_period on commissions(period);
create index idx_commissions_status on commissions(status);
create index idx_bonuses_creator_id on bonuses(creator_id);
create index idx_bonuses_period on bonuses(period);
create index idx_reward_points_ledger_creator_id on reward_points_ledger(creator_id);
create index idx_reward_milestones_creator_id on reward_milestones(creator_id);
create index idx_payouts_creator_id on payouts(creator_id);
create index idx_payouts_period on payouts(period);
create index idx_creator_referrals_referrer on creator_referrals(referrer_id);
create index idx_creator_referrals_referred on creator_referrals(referred_id);
create index idx_creators_referral_code on creators(referral_code);

-- Trigger: auto-update reward_points_balance on ledger insert
create or replace function update_points_balance()
returns trigger as $$
begin
  insert into reward_points_balance (creator_id, total_points, updated_at)
  values (new.creator_id, new.points, now())
  on conflict (creator_id)
  do update set
    total_points = reward_points_balance.total_points + new.points,
    updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger reward_points_balance_update
  after insert on reward_points_ledger
  for each row execute function update_points_balance();

-- Updated_at triggers for new tables
create trigger commission_settings_updated_at before update on commission_settings for each row execute function update_updated_at();

-- RLS for new tables
alter table commission_settings enable row level security;
alter table monthly_bonus_tiers enable row level security;
alter table creator_referrals enable row level security;
alter table commissions enable row level security;
alter table bonuses enable row level security;
alter table reward_points_ledger enable row level security;
alter table reward_points_balance enable row level security;
alter table reward_milestones enable row level security;
alter table payouts enable row level security;

-- Commission settings: admins manage, anyone can read
create policy "Anyone can read commission settings" on commission_settings for select using (true);
create policy "Admins manage commission settings" on commission_settings for all using (is_admin());

-- Monthly bonus tiers: public read
create policy "Anyone can read bonus tiers" on monthly_bonus_tiers for select using (true);
create policy "Admins manage bonus tiers" on monthly_bonus_tiers for all using (is_admin());

-- Creator referrals: creators read own, admins manage
create policy "Creators can read own referrals as referrer" on creator_referrals for select using (
  exists (select 1 from creators where creators.id = creator_referrals.referrer_id and creators.user_id = auth.uid())
);
create policy "Creators can read own referrals as referred" on creator_referrals for select using (
  exists (select 1 from creators where creators.id = creator_referrals.referred_id and creators.user_id = auth.uid())
);
create policy "Admins manage referrals" on creator_referrals for all using (is_admin());

-- Commissions: creators read own, admins manage
create policy "Creators can read own commissions" on commissions for select using (
  exists (select 1 from creators where creators.id = commissions.creator_id and creators.user_id = auth.uid())
);
create policy "Admins manage commissions" on commissions for all using (is_admin());

-- Bonuses: creators read own, admins manage
create policy "Creators can read own bonuses" on bonuses for select using (
  exists (select 1 from creators where creators.id = bonuses.creator_id and creators.user_id = auth.uid())
);
create policy "Admins manage bonuses" on bonuses for all using (is_admin());

-- Reward points ledger: creators read own, admins manage
create policy "Creators can read own points" on reward_points_ledger for select using (
  exists (select 1 from creators where creators.id = reward_points_ledger.creator_id and creators.user_id = auth.uid())
);
create policy "Admins manage points" on reward_points_ledger for all using (is_admin());

-- Reward points balance: creators read own, admins manage
create policy "Creators can read own balance" on reward_points_balance for select using (
  exists (select 1 from creators where creators.id = reward_points_balance.creator_id and creators.user_id = auth.uid())
);
create policy "Admins manage balances" on reward_points_balance for all using (is_admin());

-- Reward milestones: creators read own, admins manage
create policy "Creators can read own milestones" on reward_milestones for select using (
  exists (select 1 from creators where creators.id = reward_milestones.creator_id and creators.user_id = auth.uid())
);
create policy "Admins manage milestones" on reward_milestones for all using (is_admin());

-- Payouts: creators read own, admins manage
create policy "Creators can read own payouts" on payouts for select using (
  exists (select 1 from creators where creators.id = payouts.creator_id and creators.user_id = auth.uid())
);
create policy "Admins manage payouts" on payouts for all using (is_admin());
