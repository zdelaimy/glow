-- Glow Girl Applications
-- Applicants submit before becoming Glow Girls; admin reviews manually.

create type application_status as enum ('PENDING', 'APPROVED', 'REJECTED');

create table glow_girl_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references profiles(id) on delete cascade,
  full_name text not null,
  phone text not null,
  date_of_birth date not null,
  city text not null,
  state text not null,
  social_platforms text[] not null default '{}',
  primary_handle text,
  follower_range text not null,
  creates_content boolean not null default false,
  heard_from text not null,
  interested_products text[] not null default '{}',
  why_glow text not null,
  previous_direct_sales boolean not null default false,
  previous_company text,
  agreed_to_terms boolean not null default true,
  status application_status not null default 'PENDING',
  reviewed_at timestamptz,
  reviewed_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_applications_user_id on glow_girl_applications(user_id);
create index idx_applications_status on glow_girl_applications(status);

create trigger applications_updated_at before update on glow_girl_applications
  for each row execute function update_updated_at();

-- RLS
alter table glow_girl_applications enable row level security;

-- Users can read their own application
create policy "Users can view own application"
  on glow_girl_applications for select
  using (auth.uid() = user_id);

-- Users can insert their own application (one per user, enforced by unique constraint)
create policy "Users can submit application"
  on glow_girl_applications for insert
  with check (auth.uid() = user_id);

-- Admins can read all applications
create policy "Admins can view all applications"
  on glow_girl_applications for select
  using (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'ADMIN'
    )
  );

-- Admins can update applications (approve/reject)
create policy "Admins can update applications"
  on glow_girl_applications for update
  using (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'ADMIN'
    )
  );
