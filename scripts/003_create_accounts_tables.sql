-- Create roblox_accounts table to store account credentials
CREATE TABLE IF NOT EXISTS roblox_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  package_size INTEGER NOT NULL, -- 25, 50, or 100
  is_claimed BOOLEAN DEFAULT FALSE,
  claimed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create account_purchases table to track who bought which package
CREATE TABLE IF NOT EXISTS account_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_email TEXT,
  payment_id TEXT UNIQUE NOT NULL,
  payment_type TEXT NOT NULL, -- 'onetime' or 'subscription'
  package_size INTEGER NOT NULL, -- 25, 50, or 100
  amount NUMERIC(10, 2),
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending',
  accounts_delivered BOOLEAN DEFAULT FALSE,
  paypal_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create account_deliveries table to link accounts to purchases
CREATE TABLE IF NOT EXISTS account_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id UUID REFERENCES account_purchases(id) ON DELETE CASCADE,
  account_id UUID REFERENCES roblox_accounts(id) ON DELETE CASCADE,
  delivered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(account_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_roblox_accounts_claimed ON roblox_accounts(is_claimed);
CREATE INDEX IF NOT EXISTS idx_roblox_accounts_package ON roblox_accounts(package_size);
CREATE INDEX IF NOT EXISTS idx_account_purchases_user_id ON account_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_account_purchases_payment_id ON account_purchases(payment_id);
CREATE INDEX IF NOT EXISTS idx_account_deliveries_purchase_id ON account_deliveries(purchase_id);
