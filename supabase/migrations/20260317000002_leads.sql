-- Lead capture form for Glow Girl recruitment & product interest
create table leads (
  id uuid primary key default gen_random_uuid(),
  glow_girl_id uuid not null references glow_girls(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  instagram_handle text,
  location text,
  income_goal text,
  message text,
  interest text not null default 'general', -- 'become_glow_girl', 'products', 'general'
  status text not null default 'NEW', -- NEW, CONTACTED, CONVERTED
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_leads_glow_girl on leads(glow_girl_id);
create index idx_leads_created_at on leads(created_at desc);

-- RLS
alter table leads enable row level security;

-- Glow Girls can view their own leads
create policy "Glow Girls can view own leads"
  on leads for select
  using (
    glow_girl_id in (
      select id from glow_girls where user_id = auth.uid()
    )
  );

-- Anyone can insert (public form)
create policy "Anyone can submit a lead"
  on leads for insert
  with check (true);

-- Add connect page fields to glow_girls
alter table glow_girls add column if not exists calendly_url text;
alter table glow_girls add column if not exists connect_bio text;
alter table glow_girls add column if not exists connect_headline text;
alter table glow_girls add column if not exists connect_photo_url text;
