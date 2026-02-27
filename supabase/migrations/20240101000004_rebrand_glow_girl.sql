-- Rebrand: "Creator" → "Glow Girl"

-- ============================================================
-- 1. Rename tables
-- ============================================================
ALTER TABLE creators RENAME TO glow_girls;
ALTER TABLE creator_signatures RENAME TO glow_girl_signatures;
ALTER TABLE creator_referrals RENAME TO glow_girl_referrals;

-- ============================================================
-- 2. Rename columns (creator_id → glow_girl_id)
-- ============================================================
ALTER TABLE glow_girl_signatures RENAME COLUMN creator_id TO glow_girl_id;
ALTER TABLE events RENAME COLUMN creator_id TO glow_girl_id;
ALTER TABLE orders RENAME COLUMN creator_id TO glow_girl_id;
ALTER TABLE subscriptions RENAME COLUMN creator_id TO glow_girl_id;
ALTER TABLE commissions RENAME COLUMN creator_id TO glow_girl_id;
ALTER TABLE bonuses RENAME COLUMN creator_id TO glow_girl_id;
ALTER TABLE reward_points_ledger RENAME COLUMN creator_id TO glow_girl_id;
ALTER TABLE reward_points_balance RENAME COLUMN creator_id TO glow_girl_id;
ALTER TABLE reward_milestones RENAME COLUMN creator_id TO glow_girl_id;
ALTER TABLE payouts RENAME COLUMN creator_id TO glow_girl_id;

-- ============================================================
-- 3. Update user_role enum: CREATOR → GLOW_GIRL
-- ============================================================
ALTER TYPE user_role RENAME VALUE 'CREATOR' TO 'GLOW_GIRL';

-- ============================================================
-- 4. Update bonus_type enum: NEW_CREATOR → NEW_GLOW_GIRL
-- ============================================================
ALTER TYPE bonus_type RENAME VALUE 'NEW_CREATOR' TO 'NEW_GLOW_GIRL';

-- ============================================================
-- 5. Rename helper functions
-- ============================================================
ALTER FUNCTION is_creator_owner(uuid) RENAME TO is_glow_girl_owner;

-- ============================================================
-- 6. Rename aggregate RPC (if it exists)
--    Safe with DO block to skip if missing
-- ============================================================
DO $$
BEGIN
  ALTER FUNCTION aggregate_commissions_by_creator(text) RENAME TO aggregate_commissions_by_glow_girl;
EXCEPTION WHEN undefined_function THEN
  -- Function doesn't exist yet, skip
END;
$$;

-- ============================================================
-- 7. Recreate triggers with new table names
-- ============================================================
DROP TRIGGER IF EXISTS creators_updated_at ON glow_girls;
CREATE TRIGGER glow_girls_updated_at
  BEFORE UPDATE ON glow_girls
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS creator_signatures_updated_at ON glow_girl_signatures;
CREATE TRIGGER glow_girl_signatures_updated_at
  BEFORE UPDATE ON glow_girl_signatures
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 8. Drop old indexes and create new ones
-- ============================================================
-- glow_girls indexes (formerly creators)
DROP INDEX IF EXISTS idx_creators_slug;
CREATE INDEX idx_glow_girls_slug ON glow_girls(slug);

DROP INDEX IF EXISTS idx_creators_user_id;
CREATE INDEX idx_glow_girls_user_id ON glow_girls(user_id);

DROP INDEX IF EXISTS idx_creators_referral_code;
CREATE INDEX idx_glow_girls_referral_code ON glow_girls(referral_code);

-- glow_girl_signatures indexes
DROP INDEX IF EXISTS idx_creator_signatures_creator_id;
CREATE INDEX idx_glow_girl_signatures_glow_girl_id ON glow_girl_signatures(glow_girl_id);

-- events
DROP INDEX IF EXISTS idx_events_creator_id;
CREATE INDEX idx_events_glow_girl_id ON events(glow_girl_id);

-- orders
DROP INDEX IF EXISTS idx_orders_creator_id;
CREATE INDEX idx_orders_glow_girl_id ON orders(glow_girl_id);

-- commissions
DROP INDEX IF EXISTS idx_commissions_creator_id;
CREATE INDEX idx_commissions_glow_girl_id ON commissions(glow_girl_id);

-- bonuses
DROP INDEX IF EXISTS idx_bonuses_creator_id;
CREATE INDEX idx_bonuses_glow_girl_id ON bonuses(glow_girl_id);

-- reward_points_ledger
DROP INDEX IF EXISTS idx_reward_points_ledger_creator_id;
CREATE INDEX idx_reward_points_ledger_glow_girl_id ON reward_points_ledger(glow_girl_id);

-- reward_milestones
DROP INDEX IF EXISTS idx_reward_milestones_creator_id;
CREATE INDEX idx_reward_milestones_glow_girl_id ON reward_milestones(glow_girl_id);

-- payouts
DROP INDEX IF EXISTS idx_payouts_creator_id;
CREATE INDEX idx_payouts_glow_girl_id ON payouts(glow_girl_id);

-- glow_girl_referrals
DROP INDEX IF EXISTS idx_creator_referrals_referrer;
CREATE INDEX idx_glow_girl_referrals_referrer ON glow_girl_referrals(referrer_id);

DROP INDEX IF EXISTS idx_creator_referrals_referred;
CREATE INDEX idx_glow_girl_referrals_referred ON glow_girl_referrals(referred_id);

-- ============================================================
-- 9. Drop and recreate RLS policies with new names
-- ============================================================

-- GLOW_GIRLS (formerly creators)
DROP POLICY IF EXISTS "Anyone can read approved creators" ON glow_girls;
DROP POLICY IF EXISTS "Creators can read own record" ON glow_girls;
DROP POLICY IF EXISTS "Creators can insert own record" ON glow_girls;
DROP POLICY IF EXISTS "Creators can update own record" ON glow_girls;
DROP POLICY IF EXISTS "Admins can do anything with creators" ON glow_girls;

CREATE POLICY "Anyone can read approved glow girls" ON glow_girls FOR SELECT USING (approved = true);
CREATE POLICY "Glow girls can read own record" ON glow_girls FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Glow girls can insert own record" ON glow_girls FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Glow girls can update own record" ON glow_girls FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Admins can do anything with glow girls" ON glow_girls FOR ALL USING (is_admin());

-- GLOW_GIRL_SIGNATURES (formerly creator_signatures)
DROP POLICY IF EXISTS "Anyone can read published signatures" ON glow_girl_signatures;
DROP POLICY IF EXISTS "Creators can read own signatures" ON glow_girl_signatures;
DROP POLICY IF EXISTS "Creators can insert own signatures" ON glow_girl_signatures;
DROP POLICY IF EXISTS "Creators can update own signatures" ON glow_girl_signatures;
DROP POLICY IF EXISTS "Admins manage signatures" ON glow_girl_signatures;

CREATE POLICY "Anyone can read published signatures" ON glow_girl_signatures FOR SELECT USING (publish_status = 'PUBLISHED');
CREATE POLICY "Glow girls can read own signatures" ON glow_girl_signatures FOR SELECT USING (
  EXISTS (SELECT 1 FROM glow_girls WHERE glow_girls.id = glow_girl_signatures.glow_girl_id AND glow_girls.user_id = auth.uid())
);
CREATE POLICY "Glow girls can insert own signatures" ON glow_girl_signatures FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM glow_girls WHERE glow_girls.id = glow_girl_signatures.glow_girl_id AND glow_girls.user_id = auth.uid())
);
CREATE POLICY "Glow girls can update own signatures" ON glow_girl_signatures FOR UPDATE USING (
  EXISTS (SELECT 1 FROM glow_girls WHERE glow_girls.id = glow_girl_signatures.glow_girl_id AND glow_girls.user_id = auth.uid())
);
CREATE POLICY "Admins manage signatures" ON glow_girl_signatures FOR ALL USING (is_admin());

-- EVENTS
DROP POLICY IF EXISTS "Creators can read own events" ON events;
CREATE POLICY "Glow girls can read own events" ON events FOR SELECT USING (
  EXISTS (SELECT 1 FROM glow_girls WHERE glow_girls.id = events.glow_girl_id AND glow_girls.user_id = auth.uid())
);

-- ORDERS
DROP POLICY IF EXISTS "Creators can read own orders" ON orders;
CREATE POLICY "Glow girls can read own orders" ON orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM glow_girls WHERE glow_girls.id = orders.glow_girl_id AND glow_girls.user_id = auth.uid())
);

-- SUBSCRIPTIONS
DROP POLICY IF EXISTS "Creators can read own subscriptions" ON subscriptions;
CREATE POLICY "Glow girls can read own subscriptions" ON subscriptions FOR SELECT USING (
  EXISTS (SELECT 1 FROM glow_girls WHERE glow_girls.id = subscriptions.glow_girl_id AND glow_girls.user_id = auth.uid())
);

-- GLOW_GIRL_REFERRALS (formerly creator_referrals)
DROP POLICY IF EXISTS "Creators can read own referrals as referrer" ON glow_girl_referrals;
DROP POLICY IF EXISTS "Creators can read own referrals as referred" ON glow_girl_referrals;
DROP POLICY IF EXISTS "Admins manage referrals" ON glow_girl_referrals;

CREATE POLICY "Glow girls can read own referrals as referrer" ON glow_girl_referrals FOR SELECT USING (
  EXISTS (SELECT 1 FROM glow_girls WHERE glow_girls.id = glow_girl_referrals.referrer_id AND glow_girls.user_id = auth.uid())
);
CREATE POLICY "Glow girls can read own referrals as referred" ON glow_girl_referrals FOR SELECT USING (
  EXISTS (SELECT 1 FROM glow_girls WHERE glow_girls.id = glow_girl_referrals.referred_id AND glow_girls.user_id = auth.uid())
);
CREATE POLICY "Admins manage referrals" ON glow_girl_referrals FOR ALL USING (is_admin());

-- COMMISSIONS
DROP POLICY IF EXISTS "Creators can read own commissions" ON commissions;
CREATE POLICY "Glow girls can read own commissions" ON commissions FOR SELECT USING (
  EXISTS (SELECT 1 FROM glow_girls WHERE glow_girls.id = commissions.glow_girl_id AND glow_girls.user_id = auth.uid())
);

-- BONUSES
DROP POLICY IF EXISTS "Creators can read own bonuses" ON bonuses;
CREATE POLICY "Glow girls can read own bonuses" ON bonuses FOR SELECT USING (
  EXISTS (SELECT 1 FROM glow_girls WHERE glow_girls.id = bonuses.glow_girl_id AND glow_girls.user_id = auth.uid())
);

-- REWARD_POINTS_LEDGER
DROP POLICY IF EXISTS "Creators can read own points" ON reward_points_ledger;
CREATE POLICY "Glow girls can read own points" ON reward_points_ledger FOR SELECT USING (
  EXISTS (SELECT 1 FROM glow_girls WHERE glow_girls.id = reward_points_ledger.glow_girl_id AND glow_girls.user_id = auth.uid())
);

-- REWARD_POINTS_BALANCE
DROP POLICY IF EXISTS "Creators can read own balance" ON reward_points_balance;
CREATE POLICY "Glow girls can read own balance" ON reward_points_balance FOR SELECT USING (
  EXISTS (SELECT 1 FROM glow_girls WHERE glow_girls.id = reward_points_balance.glow_girl_id AND glow_girls.user_id = auth.uid())
);

-- REWARD_MILESTONES
DROP POLICY IF EXISTS "Creators can read own milestones" ON reward_milestones;
CREATE POLICY "Glow girls can read own milestones" ON reward_milestones FOR SELECT USING (
  EXISTS (SELECT 1 FROM glow_girls WHERE glow_girls.id = reward_milestones.glow_girl_id AND glow_girls.user_id = auth.uid())
);

-- PAYOUTS
DROP POLICY IF EXISTS "Creators can read own payouts" ON payouts;
CREATE POLICY "Glow girls can read own payouts" ON payouts FOR SELECT USING (
  EXISTS (SELECT 1 FROM glow_girls WHERE glow_girls.id = payouts.glow_girl_id AND glow_girls.user_id = auth.uid())
);

-- ============================================================
-- 10. Update the reward_points_balance trigger function
--     to use glow_girl_id column name
-- ============================================================
CREATE OR REPLACE FUNCTION update_points_balance()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO reward_points_balance (glow_girl_id, total_points, updated_at)
  VALUES (new.glow_girl_id, new.points, now())
  ON CONFLICT (glow_girl_id)
  DO UPDATE SET
    total_points = reward_points_balance.total_points + new.points,
    updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;
