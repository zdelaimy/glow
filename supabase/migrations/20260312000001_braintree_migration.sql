-- Braintree migration: add braintree_transaction_id to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS braintree_transaction_id TEXT UNIQUE;
