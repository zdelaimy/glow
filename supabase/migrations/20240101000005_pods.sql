-- ============================================================
-- 00005_pods.sql — Pods (team) system
-- ============================================================

-- Pod override commission type
ALTER TYPE commission_type ADD VALUE IF NOT EXISTS 'POD_OVERRIDE';

-- Pod override rate on commission settings
ALTER TABLE commission_settings ADD COLUMN IF NOT EXISTS pod_override_rate numeric NOT NULL DEFAULT 0.05;

-- ============================================================
-- pods table
-- ============================================================
CREATE TABLE pods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  leader_id uuid NOT NULL REFERENCES glow_girls(id) ON DELETE CASCADE,
  pod_code text NOT NULL UNIQUE DEFAULT upper(substr(md5(random()::text), 1, 8)),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  disbanded_at timestamptz
);

CREATE INDEX idx_pods_leader_id ON pods(leader_id);
CREATE INDEX idx_pods_pod_code ON pods(pod_code);

-- Trigger for updated_at
CREATE TRIGGER set_pods_updated_at
  BEFORE UPDATE ON pods
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- pod_memberships table
-- ============================================================
CREATE TYPE pod_role AS ENUM ('LEADER', 'MEMBER');

CREATE TABLE pod_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pod_id uuid NOT NULL REFERENCES pods(id) ON DELETE CASCADE,
  glow_girl_id uuid NOT NULL REFERENCES glow_girls(id) ON DELETE CASCADE,
  role pod_role NOT NULL DEFAULT 'MEMBER',
  joined_at timestamptz NOT NULL DEFAULT now(),
  left_at timestamptz
);

CREATE INDEX idx_pod_memberships_pod_id ON pod_memberships(pod_id);
CREATE INDEX idx_pod_memberships_glow_girl_id ON pod_memberships(glow_girl_id);

-- Partial unique: one active pod per glow girl
CREATE UNIQUE INDEX idx_pod_memberships_active_unique
  ON pod_memberships(glow_girl_id)
  WHERE left_at IS NULL;

-- ============================================================
-- RLS policies
-- ============================================================
ALTER TABLE pods ENABLE ROW LEVEL SECURITY;
ALTER TABLE pod_memberships ENABLE ROW LEVEL SECURITY;

-- Pods: leaders can manage their own pods
CREATE POLICY "pods_select" ON pods FOR SELECT
  USING (true);

CREATE POLICY "pods_insert" ON pods FOR INSERT
  WITH CHECK (leader_id IN (
    SELECT gg.id FROM glow_girls gg
    JOIN profiles p ON p.id = gg.user_id
    WHERE p.id = auth.uid()
  ));

CREATE POLICY "pods_update" ON pods FOR UPDATE
  USING (leader_id IN (
    SELECT gg.id FROM glow_girls gg
    JOIN profiles p ON p.id = gg.user_id
    WHERE p.id = auth.uid()
  ));

-- Pod memberships: members can see their own pod, leaders can manage
CREATE POLICY "pod_memberships_select" ON pod_memberships FOR SELECT
  USING (true);

CREATE POLICY "pod_memberships_insert" ON pod_memberships FOR INSERT
  WITH CHECK (glow_girl_id IN (
    SELECT gg.id FROM glow_girls gg
    JOIN profiles p ON p.id = gg.user_id
    WHERE p.id = auth.uid()
  ));

CREATE POLICY "pod_memberships_update" ON pod_memberships FOR UPDATE
  USING (
    glow_girl_id IN (
      SELECT gg.id FROM glow_girls gg
      JOIN profiles p ON p.id = gg.user_id
      WHERE p.id = auth.uid()
    )
    OR pod_id IN (
      SELECT po.id FROM pods po
      JOIN glow_girls gg ON gg.id = po.leader_id
      JOIN profiles p ON p.id = gg.user_id
      WHERE p.id = auth.uid()
    )
  );
