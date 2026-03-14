-- Journey Platform: Training Academy, Product Education, Marketing Templates

-- ═══════════════════════════════════════════
-- Journey Weeks (10-week program)
-- ═══════════════════════════════════════════
create table journey_weeks (
  id uuid primary key default gen_random_uuid(),
  week_number int not null unique check (week_number between 1 and 10),
  title text not null,
  subtitle text not null,
  description text,
  milestone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger journey_weeks_updated_at before update on journey_weeks
  for each row execute function update_updated_at();

-- ═══════════════════════════════════════════
-- Journey Modules (groups of lessons per week)
-- ═══════════════════════════════════════════
create table journey_modules (
  id uuid primary key default gen_random_uuid(),
  week_id uuid not null references journey_weeks(id) on delete cascade,
  title text not null,
  description text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_journey_modules_week_id on journey_modules(week_id);

create trigger journey_modules_updated_at before update on journey_modules
  for each row execute function update_updated_at();

-- ═══════════════════════════════════════════
-- Journey Lessons
-- ═══════════════════════════════════════════
create table journey_lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references journey_modules(id) on delete cascade,
  title text not null,
  description text,
  video_url text,
  content text,
  resources jsonb not null default '[]',
  duration_minutes int not null default 15,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_journey_lessons_module_id on journey_lessons(module_id);

create trigger journey_lessons_updated_at before update on journey_lessons
  for each row execute function update_updated_at();

-- ═══════════════════════════════════════════
-- Journey Progress (per glow girl)
-- ═══════════════════════════════════════════
create table journey_progress (
  id uuid primary key default gen_random_uuid(),
  glow_girl_id uuid not null references glow_girls(id) on delete cascade,
  lesson_id uuid not null references journey_lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique(glow_girl_id, lesson_id)
);

create index idx_journey_progress_glow_girl on journey_progress(glow_girl_id);
create index idx_journey_progress_lesson on journey_progress(lesson_id);

-- ═══════════════════════════════════════════
-- Product Education (1:1 with products)
-- ═══════════════════════════════════════════
create table product_education (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null unique references products(id) on delete cascade,
  talking_points text[] not null default '{}',
  ingredients_detail text,
  benefits text[] not null default '{}',
  faqs jsonb not null default '[]',
  pitch_scripts jsonb not null default '[]',
  objection_handling jsonb not null default '[]',
  compliance_notes text,
  usage_directions text,
  who_its_for text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_product_education_product on product_education(product_id);

create trigger product_education_updated_at before update on product_education
  for each row execute function update_updated_at();

-- ═══════════════════════════════════════════
-- Marketing Templates
-- ═══════════════════════════════════════════
create table templates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  subcategory text,
  platform text not null default 'universal',
  funnel_stage text not null default 'awareness',
  body text not null,
  variables text[] not null default '{}',
  product_tags text[] not null default '{}',
  example_usage text,
  compliance_notes text,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_templates_category on templates(category);
create index idx_templates_platform on templates(platform);
create index idx_templates_active on templates(active);

create trigger templates_updated_at before update on templates
  for each row execute function update_updated_at();

-- ═══════════════════════════════════════════
-- Template Favorites (per glow girl)
-- ═══════════════════════════════════════════
create table template_favorites (
  id uuid primary key default gen_random_uuid(),
  glow_girl_id uuid not null references glow_girls(id) on delete cascade,
  template_id uuid not null references templates(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(glow_girl_id, template_id)
);

create index idx_template_favorites_glow_girl on template_favorites(glow_girl_id);

-- ═══════════════════════════════════════════
-- RLS Policies
-- ═══════════════════════════════════════════

-- Journey content: readable by all glow girls
alter table journey_weeks enable row level security;
alter table journey_modules enable row level security;
alter table journey_lessons enable row level security;
alter table journey_progress enable row level security;
alter table product_education enable row level security;
alter table templates enable row level security;
alter table template_favorites enable row level security;

-- Read-only for glow girls on content tables
create policy "Glow girls can read journey weeks" on journey_weeks for select
  using (exists (select 1 from profiles where id = auth.uid() and role in ('GLOW_GIRL', 'ADMIN')));

create policy "Glow girls can read journey modules" on journey_modules for select
  using (exists (select 1 from profiles where id = auth.uid() and role in ('GLOW_GIRL', 'ADMIN')));

create policy "Glow girls can read journey lessons" on journey_lessons for select
  using (exists (select 1 from profiles where id = auth.uid() and role in ('GLOW_GIRL', 'ADMIN')));

create policy "Glow girls can read product education" on product_education for select
  using (exists (select 1 from profiles where id = auth.uid() and role in ('GLOW_GIRL', 'ADMIN')));

create policy "Glow girls can read active templates" on templates for select
  using (
    active = true
    and exists (select 1 from profiles where id = auth.uid() and role in ('GLOW_GIRL', 'ADMIN'))
  );

-- Admin full access on content tables
create policy "Admin full access journey weeks" on journey_weeks for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'ADMIN'));

create policy "Admin full access journey modules" on journey_modules for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'ADMIN'));

create policy "Admin full access journey lessons" on journey_lessons for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'ADMIN'));

create policy "Admin full access product education" on product_education for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'ADMIN'));

create policy "Admin full access templates" on templates for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'ADMIN'));

-- Progress: glow girls manage their own
create policy "Glow girls manage own progress" on journey_progress for all
  using (
    glow_girl_id in (select id from glow_girls where user_id = auth.uid())
  );

create policy "Admin read all progress" on journey_progress for select
  using (exists (select 1 from profiles where id = auth.uid() and role = 'ADMIN'));

-- Favorites: glow girls manage their own
create policy "Glow girls manage own favorites" on template_favorites for all
  using (
    glow_girl_id in (select id from glow_girls where user_id = auth.uid())
  );

-- ═══════════════════════════════════════════
-- Seed: 10 Journey Weeks
-- ═══════════════════════════════════════════
insert into journey_weeks (week_number, title, subtitle, description, milestone) values
(1,  'Set Up & Believe',        'Your foundation starts here',
     'Get your storefront live, learn the dashboard, dive into your products, and define your "why." This week is about believing you can do this — because you can.',
     'Storefront live, first link shared'),
(2,  'Know What You''re Selling', 'Become the product expert',
     'Deep dive into every Glow product — ingredients, benefits, who it''s for. Practice your pitch until it feels natural. Confidence comes from knowledge.',
     'Can pitch every product confidently'),
(3,  'Make Your First Sales',    'It''s go time',
     'Start with warm outreach — friends, family, your existing network. Use DM scripts, share your link, post your first content. Your first sale changes everything.',
     'First sales on the board'),
(4,  'Content That Sells',       'Create content that converts',
     'Master hook formulas, write captions that drive action, use AI Studio to batch-create content. Learn story selling and before/after frameworks.',
     'Consistent posting rhythm'),
(5,  'DM Like a Pro',            'Conversations that convert',
     'Move beyond warm outreach. Learn cold DM strategies, objection handling, and follow-up sequences that feel authentic, not pushy.',
     'Active DM pipeline'),
(6,  'Grow Your Audience',       'Expand your reach',
     'Platform growth strategies for Instagram and TikTok. Hashtags, Reels, collaborations, and community engagement tactics that actually work.',
     'Audience growing week over week'),
(7,  'Go Live & Show Up',        'Your voice matters',
     'Overcome camera fear, learn live selling techniques, create story sequences, and write video scripts. The more you show up, the more you sell.',
     'First live sale'),
(8,  'Build Your Brand',         'Stand out from the crowd',
     'Define your personal brand, find your niche, master storytelling. What makes you different is what makes you powerful.',
     'Recognizable personal brand'),
(9,  'Build Your Team',          'Multiply your impact',
     'Share the Glow opportunity authentically. Learn recruiting conversations, how to support your Glow Babes, and pod leadership basics.',
     'First recruit'),
(10, '$10K & Beyond',            'You did it — now scale',
     'Review your numbers, double down on what works, build sustainable routines, and plan your rank advancement. This is just the beginning.',
     '$10K in total sales');
