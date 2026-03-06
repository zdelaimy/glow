-- Create get_downline() recursive function — walks down referral tree up to max_levels
CREATE OR REPLACE FUNCTION get_downline(p_glow_girl_id uuid, p_max_levels integer DEFAULT 7)
RETURNS TABLE(level integer, glow_girl_id uuid, recruited_by uuid)
LANGUAGE sql STABLE
AS $$
  WITH RECURSIVE downline AS (
    -- Base case: direct recruits = level 1
    SELECT 1 AS level, r.referred_id AS glow_girl_id, r.referrer_id AS recruited_by
    FROM glow_girl_referrals r
    WHERE r.referrer_id = p_glow_girl_id

    UNION ALL

    -- Recursive: each recruit's recruits = next level
    SELECT d.level + 1, r.referred_id, r.referrer_id
    FROM downline d
    JOIN glow_girl_referrals r ON r.referrer_id = d.glow_girl_id
    WHERE d.level < p_max_levels
  )
  SELECT downline.level, downline.glow_girl_id, downline.recruited_by FROM downline ORDER BY downline.level, downline.glow_girl_id;
$$;
