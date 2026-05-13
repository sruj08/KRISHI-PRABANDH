-- Add phone column to farmer_profiles for Gram Sabha lookup
ALTER TABLE farmer_profiles ADD COLUMN phone text UNIQUE;
