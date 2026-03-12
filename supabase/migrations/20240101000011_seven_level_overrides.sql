-- ============================================================
-- 00011: Seven-Level Override Compensation Plan
-- Replaces 2-level referral match + pod override with 7-level deep overrides
-- ============================================================

-- 1. Add LEVEL_OVERRIDE to commission_type enum
ALTER TYPE commission_type ADD VALUE IF NOT EXISTS 'LEVEL_OVERRIDE';

-- 2. Add override_level column to commissions table (1-7 for LEVEL_OVERRIDE rows)
ALTER TABLE commissions ADD COLUMN IF NOT EXISTS override_level smallint;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_override_level'
  ) THEN
    ALTER TABLE commissions ADD CONSTRAINT chk_override_level
      CHECK (override_level IS NULL OR (override_level >= 1 AND override_level <= 7));
  END IF;
END;
$$;

-- 3. Create glow_girl_ranks table
CREATE TABLE IF NOT EXISTS glow_girl_ranks (
  glow_girl_id uuid PRIMARY KEY REFERENCES glow_girls(id) ON DELETE CASCADE,
  personal_recruits integer NOT NULL DEFAULT 0,
  group_volume_cents bigint NOT NULL DEFAULT 0,
  unlocked_levels smallint NOT NULL DEFAULT 0,
  rank_label text NOT NULL DEFAULT 'Starter',
  computed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_glow_girl_ranks_unlocked ON glow_girl_ranks(unlocked_levels);

-- 4. Create glow_girl_gv_snapshots table (monthly GV history)
CREATE TABLE IF NOT EXISTS glow_girl_gv_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  glow_girl_id uuid NOT NULL REFERENCES glow_girls(id) ON DELETE CASCADE,
  period text NOT NULL, -- 'YYYY-MM'
  group_volume_cents bigint NOT NULL DEFAULT 0,
  personal_recruits integer NOT NULL DEFAULT 0,
  unlocked_levels smallint NOT NULL DEFAULT 0,
  rank_label text NOT NULL DEFAULT 'Starter',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(glow_girl_id, period)
);

CREATE INDEX IF NOT EXISTS idx_gv_snapshots_period ON glow_girl_gv_snapshots(period);

-- 5. Add 7 levelN_override_rate columns to commission_settings
ALTER TABLE commission_settings
  ADD COLUMN IF NOT EXISTS level1_override_rate numeric(5,4) NOT NULL DEFAULT 0.10,
  ADD COLUMN IF NOT EXISTS level2_override_rate numeric(5,4) NOT NULL DEFAULT 0.05,
  ADD COLUMN IF NOT EXISTS level3_override_rate numeric(5,4) NOT NULL DEFAULT 0.04,
  ADD COLUMN IF NOT EXISTS level4_override_rate numeric(5,4) NOT NULL DEFAULT 0.03,
  ADD COLUMN IF NOT EXISTS level5_override_rate numeric(5,4) NOT NULL DEFAULT 0.02,
  ADD COLUMN IF NOT EXISTS level6_override_rate numeric(5,4) NOT NULL DEFAULT 0.01,
  ADD COLUMN IF NOT EXISTS level7_override_rate numeric(5,4) NOT NULL DEFAULT 0.01;

-- 6. Add rank threshold columns to commission_settings
ALTER TABLE commission_settings
  ADD COLUMN IF NOT EXISTS rank_l2_min_recruits integer NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS rank_l3_min_recruits integer NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS rank_l3_min_gv_cents bigint NOT NULL DEFAULT 500000,
  ADD COLUMN IF NOT EXISTS rank_l4_min_gv_cents bigint NOT NULL DEFAULT 2500000,
  ADD COLUMN IF NOT EXISTS rank_l5_min_gv_cents bigint NOT NULL DEFAULT 7500000,
  ADD COLUMN IF NOT EXISTS rank_l6_min_gv_cents bigint NOT NULL DEFAULT 20000000,
  ADD COLUMN IF NOT EXISTS rank_l7_min_gv_cents bigint NOT NULL DEFAULT 50000000;

-- 7. Create get_upline() recursive function — walks up to max_levels via glow_girl_referrals
CREATE OR REPLACE FUNCTION get_upline(p_glow_girl_id uuid, p_max_levels integer DEFAULT 7)
RETURNS TABLE(level integer, glow_girl_id uuid)
LANGUAGE sql STABLE
AS $$
  WITH RECURSIVE upline AS (
    -- Base case: direct referrer = level 1
    SELECT 1 AS level, r.referrer_id AS glow_girl_id
    FROM glow_girl_referrals r
    WHERE r.referred_id = p_glow_girl_id

    UNION ALL

    -- Recursive: each referrer's referrer = next level
    SELECT u.level + 1, r.referrer_id
    FROM upline u
    JOIN glow_girl_referrals r ON r.referred_id = u.glow_girl_id
    WHERE u.level < p_max_levels
  )
  SELECT upline.level, upline.glow_girl_id FROM upline ORDER BY upline.level;
$$;

-- 8. Create increment_gv() function for atomic GV updates
CREATE OR REPLACE FUNCTION increment_gv(p_glow_girl_id uuid, p_amount_cents bigint)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO glow_girl_ranks (glow_girl_id, group_volume_cents, computed_at)
  VALUES (p_glow_girl_id, p_amount_cents, now())
  ON CONFLICT (glow_girl_id)
  DO UPDATE SET
    group_volume_cents = glow_girl_ranks.group_volume_cents + p_amount_cents,
    computed_at = now();
END;
$$;

-- 9. RLS policies for new tables
ALTER TABLE glow_girl_ranks ENABLE ROW LEVEL SECURITY;
ALTER TABLE glow_girl_gv_snapshots ENABLE ROW LEVEL SECURITY;

-- glow_girl_ranks: Glow Girls can read their own, admins manage all
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Glow Girls can read own rank' AND tablename = 'glow_girl_ranks') THEN
    CREATE POLICY "Glow Girls can read own rank" ON glow_girl_ranks FOR SELECT
      USING (EXISTS (SELECT 1 FROM glow_girls gg WHERE gg.id = glow_girl_ranks.glow_girl_id AND gg.user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins manage ranks' AND tablename = 'glow_girl_ranks') THEN
    CREATE POLICY "Admins manage ranks" ON glow_girl_ranks FOR ALL USING (is_admin());
  END IF;
END $$;

-- glow_girl_gv_snapshots: Glow Girls can read their own, admins manage all
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Glow Girls can read own GV snapshots' AND tablename = 'glow_girl_gv_snapshots') THEN
    CREATE POLICY "Glow Girls can read own GV snapshots" ON glow_girl_gv_snapshots FOR SELECT
      USING (EXISTS (SELECT 1 FROM glow_girls gg WHERE gg.id = glow_girl_gv_snapshots.glow_girl_id AND gg.user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins manage GV snapshots' AND tablename = 'glow_girl_gv_snapshots') THEN
    CREATE POLICY "Admins manage GV snapshots" ON glow_girl_gv_snapshots FOR ALL USING (is_admin());
  END IF;
END $$;

-- 10. Backfill: populate glow_girl_ranks for all existing Glow Girls
-- Count personal recruits from existing referral records, GV starts at 0
INSERT INTO glow_girl_ranks (glow_girl_id, personal_recruits, group_volume_cents, unlocked_levels, rank_label, computed_at)
SELECT
  gg.id,
  COALESCE(rc.cnt, 0),
  0,
  CASE
    WHEN COALESCE(rc.cnt, 0) >= 5 THEN 2  -- L1 + L2 (L3+ require GV which starts at 0)
    WHEN COALESCE(rc.cnt, 0) >= 3 THEN 2
    WHEN COALESCE(rc.cnt, 0) >= 1 THEN 1
    ELSE 0
  END,
  CASE
    WHEN COALESCE(rc.cnt, 0) >= 5 THEN 'Leader'
    WHEN COALESCE(rc.cnt, 0) >= 3 THEN 'Builder'
    WHEN COALESCE(rc.cnt, 0) >= 1 THEN 'Starter'
    ELSE 'Starter'
  END,
  now()
FROM glow_girls gg
LEFT JOIN (
  SELECT referrer_id, count(*)::integer AS cnt
  FROM glow_girl_referrals
  GROUP BY referrer_id
) rc ON rc.referrer_id = gg.id
ON CONFLICT (glow_girl_id) DO NOTHING;

-- Index for commission override queries
CREATE INDEX IF NOT EXISTS idx_commissions_override_level ON commissions(override_level) WHERE override_level IS NOT NULL;
