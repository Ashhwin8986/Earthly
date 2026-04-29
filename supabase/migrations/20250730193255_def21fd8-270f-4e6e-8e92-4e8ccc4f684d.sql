
-- Migration: Make updated_at NOT NULL with default and auto-update trigger
-- First, update any existing NULL values to current timestamp
UPDATE profiles 
SET updated_at = NOW() 
WHERE updated_at IS NULL;

-- Alter the column to be NOT NULL with default value
ALTER TABLE profiles 
ALTER COLUMN updated_at SET NOT NULL,
ALTER COLUMN updated_at SET DEFAULT NOW();

-- Create a function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger that calls the function before any UPDATE on profiles table
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
