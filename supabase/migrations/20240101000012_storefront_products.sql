-- Add selected_product_ids to glow_girls so each Glow Girl can curate her storefront
ALTER TABLE glow_girls
  ADD COLUMN IF NOT EXISTS selected_product_ids UUID[] DEFAULT '{}';
