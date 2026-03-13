-- AI Studio tables for Glow Girl content creation

-- Projects (campaigns)
create table ai_studio_projects (
  id uuid default gen_random_uuid() primary key,
  glow_girl_id uuid not null references glow_girls(id) on delete cascade,
  title text not null,
  type text not null check (type in ('generate', 'analyze')),
  platform text check (platform in ('tiktok', 'instagram', 'both')),
  goal text,
  product_id uuid references products(id),
  tone text,
  audience text,
  status text not null default 'draft' check (status in ('draft', 'processing', 'completed', 'failed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Assets (uploaded media)
create table ai_studio_assets (
  id uuid default gen_random_uuid() primary key,
  project_id uuid not null references ai_studio_projects(id) on delete cascade,
  glow_girl_id uuid not null references glow_girls(id) on delete cascade,
  file_name text not null,
  file_type text not null,
  file_size integer not null,
  storage_path text not null,
  created_at timestamptz default now()
);

-- Outputs (AI-generated content)
create table ai_studio_outputs (
  id uuid default gen_random_uuid() primary key,
  project_id uuid not null references ai_studio_projects(id) on delete cascade,
  output_type text not null check (output_type in ('post_package', 'analysis')),
  content jsonb not null default '{}'::jsonb,
  model text not null default 'gpt-5.4',
  tokens_used integer,
  created_at timestamptz default now()
);

-- Indexes
create index idx_ai_studio_projects_glow_girl on ai_studio_projects(glow_girl_id);
create index idx_ai_studio_assets_project on ai_studio_assets(project_id);
create index idx_ai_studio_outputs_project on ai_studio_outputs(project_id);

-- RLS
alter table ai_studio_projects enable row level security;
alter table ai_studio_assets enable row level security;
alter table ai_studio_outputs enable row level security;

-- Projects: glow girls own data
create policy "Glow girls manage own projects"
  on ai_studio_projects for all
  using (glow_girl_id in (select id from glow_girls where user_id = auth.uid()))
  with check (glow_girl_id in (select id from glow_girls where user_id = auth.uid()));

create policy "Admins manage all projects"
  on ai_studio_projects for all
  using (is_admin())
  with check (is_admin());

-- Assets: glow girls own data
create policy "Glow girls manage own assets"
  on ai_studio_assets for all
  using (glow_girl_id in (select id from glow_girls where user_id = auth.uid()))
  with check (glow_girl_id in (select id from glow_girls where user_id = auth.uid()));

create policy "Admins manage all assets"
  on ai_studio_assets for all
  using (is_admin())
  with check (is_admin());

-- Outputs: via project ownership
create policy "Glow girls view own outputs"
  on ai_studio_outputs for all
  using (project_id in (
    select id from ai_studio_projects
    where glow_girl_id in (select id from glow_girls where user_id = auth.uid())
  ))
  with check (project_id in (
    select id from ai_studio_projects
    where glow_girl_id in (select id from glow_girls where user_id = auth.uid())
  ));

create policy "Admins manage all outputs"
  on ai_studio_outputs for all
  using (is_admin())
  with check (is_admin());

-- Storage bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'ai-studio',
  'ai-studio',
  false,
  104857600, -- 100MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/quicktime', 'video/webm']
);

-- Storage RLS: folder-based isolation using glow_girl_id prefix
create policy "Glow girls upload to own folder"
  on storage.objects for insert
  with check (
    bucket_id = 'ai-studio'
    and (storage.foldername(name))[1] in (
      select id::text from glow_girls where user_id = auth.uid()
    )
  );

create policy "Glow girls read own files"
  on storage.objects for select
  using (
    bucket_id = 'ai-studio'
    and (storage.foldername(name))[1] in (
      select id::text from glow_girls where user_id = auth.uid()
    )
  );

create policy "Glow girls delete own files"
  on storage.objects for delete
  using (
    bucket_id = 'ai-studio'
    and (storage.foldername(name))[1] in (
      select id::text from glow_girls where user_id = auth.uid()
    )
  );

create policy "Admins manage all ai-studio files"
  on storage.objects for all
  using (bucket_id = 'ai-studio' and is_admin())
  with check (bucket_id = 'ai-studio' and is_admin());
