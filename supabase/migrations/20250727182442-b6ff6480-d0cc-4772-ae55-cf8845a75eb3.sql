
-- Update the profiles table to include email and ensure proper constraints
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email text UNIQUE;

-- Make email required (not null)
ALTER TABLE public.profiles 
ALTER COLUMN email SET NOT NULL;

-- Set default values for existing columns
ALTER TABLE public.profiles 
ALTER COLUMN bio SET DEFAULT NULL;

ALTER TABLE public.profiles 
ALTER COLUMN avatar_url SET DEFAULT NULL;

ALTER TABLE public.profiles 
ALTER COLUMN updated_at SET DEFAULT NULL;

-- Add unique constraint on username to prevent duplicates
ALTER TABLE public.profiles 
ADD CONSTRAINT unique_username UNIQUE (username);

-- Create or replace the trigger function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, bio, avatar_url, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    NULL,
    NULL,
    NULL
  );
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
