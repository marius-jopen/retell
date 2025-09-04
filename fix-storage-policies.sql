-- Fix storage bucket policies for podcast images
-- First, let's check if the bucket exists and create it if not
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'podcast-images',
  'podcast-images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view podcast images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload podcast images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own podcast images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own podcast images" ON storage.objects;

-- Create simpler, more permissive policies
CREATE POLICY "Anyone can view podcast images" ON storage.objects
  FOR SELECT USING (bucket_id = 'podcast-images');

CREATE POLICY "Authenticated users can upload podcast images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'podcast-images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can update podcast images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'podcast-images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can delete podcast images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'podcast-images' 
    AND auth.role() = 'authenticated'
  );
