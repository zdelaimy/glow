-- Add shipping column to pending_orders for storing shipping info collected at checkout
ALTER TABLE pending_orders ADD COLUMN IF NOT EXISTS shipping JSONB;
