-- Square migration: pending_orders table + square_payment_id on orders

-- Pending orders table to hold checkout context (Square doesn't support freeform metadata)
CREATE TABLE IF NOT EXISTS pending_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  items JSONB NOT NULL,
  glow_girl_id UUID REFERENCES glow_girls(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '24 hours')
);

ALTER TABLE pending_orders ENABLE ROW LEVEL SECURITY;

-- Allow the service role (webhooks) to read/write; no public access needed
CREATE POLICY "Service role full access on pending_orders"
  ON pending_orders FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add Square payment ID to orders for deduplication
ALTER TABLE orders ADD COLUMN IF NOT EXISTS square_payment_id TEXT UNIQUE;
