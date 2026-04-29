
-- Enable RLS on grow_guide_crops table
ALTER TABLE public.grow_guide_crops ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access for educational content
CREATE POLICY "Anyone can view grow guide crops" 
  ON public.grow_guide_crops 
  FOR SELECT 
  USING (true);

-- Create policy to allow authenticated users to insert crops
CREATE POLICY "Authenticated users can insert grow guide crops" 
  ON public.grow_guide_crops 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to update crops
CREATE POLICY "Authenticated users can update grow guide crops" 
  ON public.grow_guide_crops 
  FOR UPDATE 
  USING (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to delete crops
CREATE POLICY "Authenticated users can delete grow guide crops" 
  ON public.grow_guide_crops 
  FOR DELETE 
  USING (auth.role() = 'authenticated');
