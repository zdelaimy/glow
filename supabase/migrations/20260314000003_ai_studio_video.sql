-- AI Studio V2: Video Inspo Templates

-- Video inspo templates (curated viral formats with examples)
create table ai_studio_templates (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  category text not null check (category in ('grwm', 'before_after', 'product_spotlight', 'testimonial')),
  filming_instructions text,       -- Step-by-step filming guide
  example_url text,                -- Link to example viral video (TikTok/IG)
  thumbnail_url text,              -- Static thumbnail for the picker
  platform text not null default 'both' check (platform in ('tiktok', 'instagram', 'both')),
  duration_hint text,              -- e.g. "15-30 seconds"
  suggested_sound text,            -- Name of trending sound to search for
  active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- Extend ai_studio_projects type constraint to include 'video'
alter table ai_studio_projects drop constraint ai_studio_projects_type_check;
alter table ai_studio_projects add constraint ai_studio_projects_type_check
  check (type in ('generate', 'analyze', 'video'));

-- Extend ai_studio_outputs output_type constraint to include 'video_package'
alter table ai_studio_outputs drop constraint ai_studio_outputs_output_type_check;
alter table ai_studio_outputs add constraint ai_studio_outputs_output_type_check
  check (output_type in ('post_package', 'analysis', 'video_package'));

-- Indexes
create index idx_ai_studio_templates_active on ai_studio_templates(active, sort_order);

-- RLS
alter table ai_studio_templates enable row level security;

create policy "Glow girls read active templates"
  on ai_studio_templates for select
  using (active = true);

create policy "Admins manage all templates"
  on ai_studio_templates for all
  using (is_admin())
  with check (is_admin());

-- Seed templates
insert into ai_studio_templates (name, description, category, filming_instructions, duration_hint, suggested_sound, sort_order) values
(
  'Get Ready With Me',
  'The #1 beauty format. Film your skincare or makeup routine — viewers love watching the process.',
  'grwm',
  '1. Set up your phone in front of your mirror or vanity (vertical!)
2. Start bare-faced — show the "before"
3. Apply each product one at a time, holding it up to camera briefly
4. Show the final result with a smile or hair flip
5. Keep it 15-30 seconds — the faster the better',
  '15-30 seconds',
  'Search "get ready with me" or "GRWM" in TikTok sounds',
  1
),
(
  'Before & After',
  'Transformation content gets the highest save rate. Show your skin/look before and after.',
  'before_after',
  '1. Film a close-up of your face BEFORE (natural lighting, no filter)
2. Quick transition — cover the camera with your hand or do a snap cut
3. Film the AFTER with the same angle and lighting
4. Hold the final look for 3-5 seconds so people can see the difference
5. Keep it under 15 seconds for maximum replays',
  '10-15 seconds',
  'Search "glow up" or "transformation" in TikTok sounds',
  2
),
(
  'Product Spotlight',
  'Show off a product you love. Hold it up, talk about it, show the texture.',
  'product_spotlight',
  '1. Start with the product in your hand, label facing camera
2. Open it or squeeze it out — show the texture/color
3. Apply it and react genuinely ("this feels so good")
4. Show the result on your skin
5. End with a recommendation: "you need this"',
  '15-20 seconds',
  'Search "product review" or use a trending sound',
  3
),
(
  'Testimonial',
  'Just talk to camera about your honest experience. Authenticity wins.',
  'testimonial',
  '1. Look directly into the camera (front-facing)
2. Start with your biggest result or surprise ("I did NOT expect this...")
3. Share what you were struggling with before
4. Show or mention the product naturally
5. End with what your skin/hair looks like now',
  '20-30 seconds',
  'Use a soft background sound or trending lo-fi beat',
  4
);

