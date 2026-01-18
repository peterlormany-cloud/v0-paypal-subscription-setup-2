-- RLS has been disabled for all account tables
-- Row Level Security is not needed for this application
ALTER TABLE roblox_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE account_purchases DISABLE ROW LEVEL SECURITY;
ALTER TABLE account_deliveries DISABLE ROW LEVEL SECURITY;
