-- Payout method preferences for Glow Girls
-- Supports PayPal, Venmo, Zelle, and Direct Deposit

create table if not exists glow_girl_payout_methods (
  id uuid primary key default gen_random_uuid(),
  glow_girl_id uuid not null references glow_girls(id) on delete cascade,
  method text not null check (method in ('paypal', 'venmo', 'zelle', 'direct_deposit')),
  -- PayPal: email, Venmo: username, Zelle: email or phone
  handle text,
  -- Direct deposit only
  account_holder_name text,
  routing_number text,
  account_number_last4 text,
  account_type text check (account_type in ('checking', 'savings')),
  --
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (glow_girl_id)
);

-- RLS
alter table glow_girl_payout_methods enable row level security;

create policy "glow_girls_own_payout_method_select"
  on glow_girl_payout_methods for select
  using (glow_girl_id in (
    select id from glow_girls where user_id = auth.uid()
  ));

create policy "glow_girls_own_payout_method_insert"
  on glow_girl_payout_methods for insert
  with check (glow_girl_id in (
    select id from glow_girls where user_id = auth.uid()
  ));

create policy "glow_girls_own_payout_method_update"
  on glow_girl_payout_methods for update
  using (glow_girl_id in (
    select id from glow_girls where user_id = auth.uid()
  ));

create policy "admins_payout_methods_select"
  on glow_girl_payout_methods for select
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'ADMIN')
  );
