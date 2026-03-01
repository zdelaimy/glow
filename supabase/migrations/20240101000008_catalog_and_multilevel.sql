-- Phase 1: Products catalog, multi-level commissions, fulfillment, returns

-- ─── Products table ───
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  tagline TEXT,
  description TEXT,
  price_cents INTEGER NOT NULL,
  compare_at_price_cents INTEGER,
  image_url TEXT,
  ingredients TEXT[] DEFAULT '{}',
  category TEXT,
  sku TEXT UNIQUE,
  weight_oz NUMERIC(6,2),
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  stripe_price_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Everyone can read active products
CREATE POLICY "Products are publicly readable"
  ON products FOR SELECT
  USING (active = true);

-- Only admins can manage products
CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- ─── Order items table (multi-product cart) ───
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price_cents INTEGER NOT NULL,
  total_cents INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Order items follow order access"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_items.order_id
      AND (o.customer_id = auth.uid()
        OR EXISTS (SELECT 1 FROM glow_girls gg WHERE gg.id = o.glow_girl_id AND gg.user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'))
    )
  );

CREATE POLICY "Service role can insert order items"
  ON order_items FOR INSERT
  WITH CHECK (true);

-- ─── Return requests table ───
CREATE TYPE return_reason AS ENUM ('DAMAGED', 'WRONG_ITEM', 'NOT_AS_DESCRIBED', 'CHANGED_MIND', 'OTHER');
CREATE TYPE return_status AS ENUM ('REQUESTED', 'APPROVED', 'DENIED', 'COMPLETED');

CREATE TABLE return_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  customer_email TEXT NOT NULL,
  reason return_reason NOT NULL,
  reason_detail TEXT,
  status return_status DEFAULT 'REQUESTED',
  refund_amount_cents INTEGER,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE return_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage return requests"
  ON return_requests FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

CREATE POLICY "Anyone can insert return requests"
  ON return_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Customers can view own returns"
  ON return_requests FOR SELECT
  USING (
    customer_email IN (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  );

-- ─── Modify orders table ───
CREATE TYPE fulfillment_status AS ENUM ('UNFULFILLED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id),
  ADD COLUMN IF NOT EXISTS fulfillment_status fulfillment_status DEFAULT 'UNFULFILLED',
  ADD COLUMN IF NOT EXISTS tracking_number TEXT,
  ADD COLUMN IF NOT EXISTS tracking_carrier TEXT,
  ADD COLUMN IF NOT EXISTS tracking_url TEXT,
  ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS customer_email TEXT;

-- Make signature_id nullable (catalog products don't have signatures)
ALTER TABLE orders ALTER COLUMN signature_id DROP NOT NULL;

-- ─── Add Level 2 referral match rate to commission_settings ───
ALTER TABLE commission_settings
  ADD COLUMN IF NOT EXISTS level2_referral_match_rate NUMERIC(5,4) DEFAULT 0.05;

-- ─── Seed products ───
INSERT INTO products (name, slug, tagline, description, price_cents, image_url, ingredients, category, sku, weight_oz, sort_order) VALUES
  ('Shine Shampoo', 'shine-shampoo', 'Argan & silk protein gloss shampoo', 'A sulfate-free, salon-grade shampoo infused with argan oil, silk amino acids, and panthenol that cleanses gently while leaving hair impossibly glossy and smooth.', 4200, '/shop/shampoo2.png', ARRAY['Argan Oil', 'Silk Amino Acids', 'Panthenol'], 'hair', 'GLOW-SHAMPOO-01', 12.0, 1),
  ('Glow Serum', 'glow-serum', 'Vitamin C & hyaluronic radiance serum', 'A potent brightening serum combining 15% vitamin C, niacinamide, and triple-weight hyaluronic acid for glass-skin radiance and visibly faded dark spots.', 5400, '/shop/serum2.png', ARRAY['15% Vitamin C', 'Niacinamide', 'Hyaluronic Acid'], 'skin', 'GLOW-SERUM-01', 1.0, 2),
  ('Beauty Gummies', 'beauty-gummies', 'Collagen + biotin daily supplement', 'Delicious strawberry-flavored gummies packed with marine collagen, biotin, and vitamin C — your daily beauty ritual from the inside out. 30-day supply.', 4400, '/shop/gummies.png', ARRAY['Marine Collagen', 'Biotin', 'Vitamin C'], 'supplement', 'GLOW-GUMMIES-01', 6.0, 3);

-- Index for product lookups
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_active ON products(active) WHERE active = true;
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_return_requests_order ON return_requests(order_id);
CREATE INDEX idx_orders_fulfillment ON orders(fulfillment_status);
