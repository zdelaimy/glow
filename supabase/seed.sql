-- Seed data for Glow Custom Serum

-- Base Formulas
insert into base_formulas (id, name, slug, description, benefit_summary, sort_order) values
  ('b1000000-0000-0000-0000-000000000001', 'Barrier Silk', 'barrier-silk', 'A rich, protective base that supports skin barrier health with ceramide-inspired emollients.', 'Supports skin barrier, locks in moisture, silky smooth finish', 1),
  ('b1000000-0000-0000-0000-000000000002', 'Clear Gel', 'clear-gel', 'A lightweight, water-based gel that absorbs quickly without residue.', 'Lightweight hydration, oil-free feel, refreshing finish', 2),
  ('b1000000-0000-0000-0000-000000000003', 'Glow Milk', 'glow-milk', 'A luminous, milky serum that imparts a natural radiance to the skin.', 'Natural radiance, nourishing hydration, dewy finish', 3);

-- Boosters
insert into boosters (id, name, slug, need_key, description, benefit_summary, sort_order) values
  ('a1000000-0000-0000-0000-000000000001', 'Calm', 'calm', 'BARRIER', 'Soothing botanical complex to help comfort sensitive skin.', 'Soothes and comforts skin, reduces visible redness', 1),
  ('a1000000-0000-0000-0000-000000000002', 'Pore', 'pore', 'CLARIFY', 'Refining blend to help minimize the appearance of pores.', 'Minimizes appearance of pores, refines skin texture', 2),
  ('a1000000-0000-0000-0000-000000000003', 'Dew', 'dew', 'HYDRATE', 'Deep hydration complex for a plump, dewy appearance.', 'Deep hydration, plumping effect, dewy glow', 3),
  ('a1000000-0000-0000-0000-000000000004', 'Even', 'even', 'BRIGHTEN', 'Brightening blend to help even out skin tone appearance.', 'Helps even skin tone, brightening effect, luminous look', 4),
  ('a1000000-0000-0000-0000-000000000005', 'Smooth', 'smooth', 'SMOOTH', 'Smoothing complex to help refine skin texture and fine lines.', 'Smooths skin texture, softens appearance of fine lines', 5),
  ('a1000000-0000-0000-0000-000000000006', 'Prep', 'prep', 'PREP', 'Priming complex that creates the perfect canvas for makeup.', 'Primes for makeup, blurs imperfections, long-wear base', 6);

-- Textures
insert into textures (id, name, slug, description, sort_order) values
  ('c1000000-0000-0000-0000-000000000001', 'Silky', 'silky', 'Smooth, silky finish that melts into skin', 1),
  ('c1000000-0000-0000-0000-000000000002', 'Gel', 'gel', 'Lightweight gel that absorbs quickly', 2),
  ('c1000000-0000-0000-0000-000000000003', 'Milky', 'milky', 'Rich, milky texture for extra nourishment', 3);

-- Scents
insert into scents (id, name, slug, description, sort_order) values
  ('d1000000-0000-0000-0000-000000000001', 'Fragrance-Free', 'fragrance-free', 'No added fragrance, ideal for sensitive skin', 1),
  ('d1000000-0000-0000-0000-000000000002', 'Citrus', 'citrus', 'Light, uplifting citrus notes', 2),
  ('d1000000-0000-0000-0000-000000000003', 'Vanilla', 'vanilla', 'Warm, comforting vanilla notes', 3);

-- Compatibility: Base <-> Booster (most combos allowed, a few restricted)
-- Barrier Silk works with: Calm, Dew, Even, Smooth
insert into compatibility_base_booster (base_id, booster_id) values
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001'),
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000003'),
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000004'),
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000005');

-- Clear Gel works with: Pore, Dew, Even, Prep
insert into compatibility_base_booster (base_id, booster_id) values
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002'),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000003'),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000004'),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000006');

-- Glow Milk works with: Calm, Dew, Even, Smooth, Prep
insert into compatibility_base_booster (base_id, booster_id) values
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001'),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000003'),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000004'),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000005'),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000006');

-- Compatibility: Booster pairs (allowed combos, store with lower UUID first)
insert into compatibility_booster_pair (booster_a_id, booster_b_id) values
  ('a1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000003'), -- Calm + Dew
  ('a1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000004'), -- Calm + Even
  ('a1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000005'), -- Calm + Smooth
  ('a1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000003'), -- Pore + Dew
  ('a1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000006'), -- Pore + Prep
  ('a1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000004'), -- Dew + Even
  ('a1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000005'), -- Dew + Smooth
  ('a1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000006'), -- Dew + Prep
  ('a1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000005'), -- Even + Smooth
  ('a1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000006'), -- Even + Prep
  ('a1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000006'); -- Smooth + Prep
