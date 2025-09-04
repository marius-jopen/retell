-- Create storage bucket for podcast images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'podcast-images',
  'podcast-images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
);

-- Create RLS policies for the podcast-images bucket
CREATE POLICY "Anyone can view podcast images" ON storage.objects
  FOR SELECT USING (bucket_id = 'podcast-images');

CREATE POLICY "Authenticated users can upload podcast images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'podcast-images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own podcast images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'podcast-images' 
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM podcast_image_gallery 
      WHERE podcast_image_gallery.image_url LIKE '%' || storage.objects.name
      AND EXISTS (
        SELECT 1 FROM podcasts 
        WHERE podcasts.id = podcast_image_gallery.podcast_id 
        AND podcasts.author_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete their own podcast images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'podcast-images' 
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM podcast_image_gallery 
      WHERE podcast_image_gallery.image_url LIKE '%' || storage.objects.name
      AND EXISTS (
        SELECT 1 FROM podcasts 
        WHERE podcasts.id = podcast_image_gallery.podcast_id 
        AND podcasts.author_id = auth.uid()
      )
    )
  );
