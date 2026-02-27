-- Row Level Security Policies

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table creators enable row level security;
alter table base_formulas enable row level security;
alter table boosters enable row level security;
alter table textures enable row level security;
alter table scents enable row level security;
alter table compatibility_base_booster enable row level security;
alter table compatibility_booster_pair enable row level security;
alter table creator_signatures enable row level security;
alter table events enable row level security;
alter table orders enable row level security;
alter table subscriptions enable row level security;

-- Helper: check if current user is admin
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'ADMIN'
  );
$$ language sql security definer;

-- Helper: check if current user is a specific creator
create or replace function is_creator_owner(creator_user_id uuid)
returns boolean as $$
  select auth.uid() = creator_user_id;
$$ language sql security definer;

-- PROFILES
create policy "Users can read own profile" on profiles for select using (id = auth.uid());
create policy "Users can update own profile" on profiles for update using (id = auth.uid());
create policy "Admins can read all profiles" on profiles for select using (is_admin());
create policy "Admins can update all profiles" on profiles for update using (is_admin());

-- CREATORS
create policy "Anyone can read approved creators" on creators for select using (approved = true);
create policy "Creators can read own record" on creators for select using (user_id = auth.uid());
create policy "Creators can insert own record" on creators for insert with check (user_id = auth.uid());
create policy "Creators can update own record" on creators for update using (user_id = auth.uid());
create policy "Admins can do anything with creators" on creators for all using (is_admin());

-- CATALOG (public read)
create policy "Anyone can read active base formulas" on base_formulas for select using (active = true);
create policy "Admins manage base formulas" on base_formulas for all using (is_admin());

create policy "Anyone can read active boosters" on boosters for select using (active = true);
create policy "Admins manage boosters" on boosters for all using (is_admin());

create policy "Anyone can read active textures" on textures for select using (active = true);
create policy "Admins manage textures" on textures for all using (is_admin());

create policy "Anyone can read active scents" on scents for select using (active = true);
create policy "Admins manage scents" on scents for all using (is_admin());

create policy "Anyone can read compatibility_base_booster" on compatibility_base_booster for select using (true);
create policy "Admins manage compatibility_base_booster" on compatibility_base_booster for all using (is_admin());

create policy "Anyone can read compatibility_booster_pair" on compatibility_booster_pair for select using (true);
create policy "Admins manage compatibility_booster_pair" on compatibility_booster_pair for all using (is_admin());

-- CREATOR SIGNATURES
create policy "Anyone can read published signatures" on creator_signatures for select using (publish_status = 'PUBLISHED');
create policy "Creators can read own signatures" on creator_signatures for select using (
  exists (select 1 from creators where creators.id = creator_signatures.creator_id and creators.user_id = auth.uid())
);
create policy "Creators can insert own signatures" on creator_signatures for insert with check (
  exists (select 1 from creators where creators.id = creator_signatures.creator_id and creators.user_id = auth.uid())
);
create policy "Creators can update own signatures" on creator_signatures for update using (
  exists (select 1 from creators where creators.id = creator_signatures.creator_id and creators.user_id = auth.uid())
);
create policy "Admins manage signatures" on creator_signatures for all using (is_admin());

-- EVENTS (insert for anyone, read for creator/admin)
create policy "Anyone can insert events" on events for insert with check (true);
create policy "Creators can read own events" on events for select using (
  exists (select 1 from creators where creators.id = events.creator_id and creators.user_id = auth.uid())
);
create policy "Admins can read all events" on events for select using (is_admin());

-- ORDERS
create policy "Creators can read own orders" on orders for select using (
  exists (select 1 from creators where creators.id = orders.creator_id and creators.user_id = auth.uid())
);
create policy "Customers can read own orders" on orders for select using (customer_id = auth.uid());
create policy "Admins manage orders" on orders for all using (is_admin());

-- SUBSCRIPTIONS
create policy "Customers can read own subscriptions" on subscriptions for select using (customer_id = auth.uid());
create policy "Creators can read own subscriptions" on subscriptions for select using (
  exists (select 1 from creators where creators.id = subscriptions.creator_id and creators.user_id = auth.uid())
);
create policy "Admins manage subscriptions" on subscriptions for all using (is_admin());
