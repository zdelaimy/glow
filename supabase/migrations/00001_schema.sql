-- Glow Custom Serum - Full Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Enum for user roles
create type user_role as enum ('ADMIN', 'CREATOR', 'CUSTOMER');

-- Enum for publish status
create type publish_status as enum ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- Profiles
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'CUSTOMER',
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Creators
create table creators (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references profiles(id) on delete cascade,
  slug text not null unique,
  approved boolean not null default false,
  brand_name text,
  hero_headline text,
  benefits text[] default '{}',
  story text,
  logo_url text,
  hero_image_url text,
  label_template text default 'A',
  accent_color text default '#8B5CF6',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint slug_format check (slug ~ '^[a-z0-9][a-z0-9-]{2,30}[a-z0-9]$')
);

-- Base Formulas
create table base_formulas (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique,
  description text,
  benefit_summary text,
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Boosters
create table boosters (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique,
  need_key text not null, -- maps to BARRIER, CLARIFY, BRIGHTEN, HYDRATE, SMOOTH, PREP
  description text,
  benefit_summary text,
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Textures
create table textures (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique,
  description text,
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Scents
create table scents (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique,
  description text,
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Compatibility: Base <-> Booster
create table compatibility_base_booster (
  id uuid primary key default uuid_generate_v4(),
  base_id uuid not null references base_formulas(id) on delete cascade,
  booster_id uuid not null references boosters(id) on delete cascade,
  unique(base_id, booster_id)
);

-- Compatibility: Booster pairs
create table compatibility_booster_pair (
  id uuid primary key default uuid_generate_v4(),
  booster_a_id uuid not null references boosters(id) on delete cascade,
  booster_b_id uuid not null references boosters(id) on delete cascade,
  unique(booster_a_id, booster_b_id),
  constraint different_boosters check (booster_a_id <> booster_b_id)
);

-- Creator Signatures (their custom serum products)
create table creator_signatures (
  id uuid primary key default uuid_generate_v4(),
  creator_id uuid not null references creators(id) on delete cascade,
  signature_name text not null,
  slug text not null,
  base_id uuid not null references base_formulas(id),
  booster_primary_id uuid not null references boosters(id),
  booster_secondary_id uuid references boosters(id),
  texture_id uuid references textures(id),
  scent_id uuid references scents(id),
  one_time_price_cents int not null default 4900,
  subscription_price_cents int not null default 3900,
  description text,
  benefit_bullets text[] default '{}',
  ritual_instructions text,
  publish_status publish_status not null default 'DRAFT',
  stripe_price_id_onetime text,
  stripe_price_id_subscription text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(creator_id, slug)
);

-- Analytics events
create table events (
  id uuid primary key default uuid_generate_v4(),
  event_type text not null, -- storefront_view, quiz_start, quiz_complete, add_to_cart, purchase
  creator_id uuid references creators(id) on delete set null,
  signature_id uuid references creator_signatures(id) on delete set null,
  user_id uuid references profiles(id) on delete set null,
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);

-- Orders
create table orders (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references profiles(id) on delete set null,
  creator_id uuid not null references creators(id),
  signature_id uuid not null references creator_signatures(id),
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  status text not null default 'pending', -- pending, paid, shipped, delivered, cancelled
  is_subscription boolean not null default false,
  amount_cents int not null,
  currency text not null default 'usd',
  shipping_name text,
  shipping_address jsonb,
  line_items jsonb not null default '[]',
  blend_components jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Subscriptions
create table subscriptions (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references profiles(id) on delete set null,
  creator_id uuid not null references creators(id),
  signature_id uuid not null references creator_signatures(id),
  stripe_subscription_id text unique,
  stripe_customer_id text,
  status text not null default 'active', -- active, paused, cancelled, past_due
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index idx_creators_slug on creators(slug);
create index idx_creators_user_id on creators(user_id);
create index idx_events_creator_id on events(creator_id);
create index idx_events_type on events(event_type);
create index idx_events_created_at on events(created_at);
create index idx_orders_creator_id on orders(creator_id);
create index idx_orders_customer_id on orders(customer_id);
create index idx_subscriptions_customer_id on subscriptions(customer_id);
create index idx_creator_signatures_creator_id on creator_signatures(creator_id);

-- Updated_at trigger function
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on profiles for each row execute function update_updated_at();
create trigger creators_updated_at before update on creators for each row execute function update_updated_at();
create trigger creator_signatures_updated_at before update on creator_signatures for each row execute function update_updated_at();
create trigger orders_updated_at before update on orders for each row execute function update_updated_at();
create trigger subscriptions_updated_at before update on subscriptions for each row execute function update_updated_at();

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, role, full_name, avatar_url)
  values (
    new.id,
    'CUSTOMER',
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
