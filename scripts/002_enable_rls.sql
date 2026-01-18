-- Enable Row Level Security on all tables
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Purchases table policies
DROP POLICY IF EXISTS "purchases_select_own" ON purchases;
CREATE POLICY "purchases_select_own" 
  ON purchases FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "purchases_insert_own" ON purchases;
CREATE POLICY "purchases_insert_own" 
  ON purchases FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Subscriptions table policies
DROP POLICY IF EXISTS "subscriptions_select_own" ON subscriptions;
CREATE POLICY "subscriptions_select_own" 
  ON subscriptions FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "subscriptions_insert_own" ON subscriptions;
CREATE POLICY "subscriptions_insert_own" 
  ON subscriptions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "subscriptions_update_own" ON subscriptions;
CREATE POLICY "subscriptions_update_own" 
  ON subscriptions FOR UPDATE 
  USING (auth.uid() = user_id);
