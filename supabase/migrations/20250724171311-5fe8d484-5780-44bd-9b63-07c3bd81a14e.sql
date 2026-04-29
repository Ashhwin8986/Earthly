
-- Enable Row Level Security on grow_guide_crops table
ALTER TABLE public.grow_guide_crops ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to grow_guide_crops
CREATE POLICY "Allow public read access to grow guide crops" 
ON public.grow_guide_crops 
FOR SELECT 
USING (true);

-- Only authenticated users can insert/update/delete grow guide crops
CREATE POLICY "Only authenticated users can modify grow guide crops" 
ON public.grow_guide_crops 
FOR ALL 
USING (auth.role() = 'authenticated') 
WITH CHECK (auth.role() = 'authenticated');

-- Enable RLS on earth_feed table (if not already enabled)
ALTER TABLE public.earth_feed ENABLE ROW LEVEL SECURITY;

-- Enable RLS on eco_products table (if not already enabled)  
ALTER TABLE public.eco_products ENABLE ROW LEVEL SECURITY;

-- Enable RLS on eco_tips table (if not already enabled)
ALTER TABLE public.eco_tips ENABLE ROW LEVEL SECURITY;

-- Create profiles table for user data
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, new.raw_user_meta_data->>'username');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
