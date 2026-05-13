-- Add columns to farmer_profiles for display and lookup
ALTER TABLE farmer_profiles ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE farmer_profiles ADD COLUMN IF NOT EXISTS email text UNIQUE;
ALTER TABLE farmer_profiles ADD COLUMN IF NOT EXISTS category text DEFAULT 'Open';
