-- =============================================
-- RETELL Storage Bucket Setup
-- =============================================
-- This script creates the necessary storage buckets for the RETELL application

-- Create podcast-covers bucket for cover images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('podcast-covers', 'podcast-covers', true)
ON CONFLICT (id) DO NOTHING;

-- Create podcast-audio bucket for audio files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('podcast-audio', 'podcast-audio', true)
ON CONFLICT (id) DO NOTHING;

-- Create podcast-scripts bucket for script files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('podcast-scripts', 'podcast-scripts', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for podcast-covers bucket
-- Allow authenticated users to upload cover images
CREATE POLICY "Allow authenticated users to upload cover images" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'podcast-covers' AND 
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public access to view cover images
CREATE POLICY "Allow public access to cover images" ON storage.objects
FOR SELECT USING (bucket_id = 'podcast-covers');

-- Allow users to update their own cover images
CREATE POLICY "Allow users to update their own cover images" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'podcast-covers' AND 
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own cover images
CREATE POLICY "Allow users to delete their own cover images" ON storage.objects
FOR DELETE USING (
    bucket_id = 'podcast-covers' AND 
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Set up storage policies for podcast-audio bucket
-- Allow authenticated users to upload audio files
CREATE POLICY "Allow authenticated users to upload audio files" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'podcast-audio' AND 
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public access to audio files (for streaming)
CREATE POLICY "Allow public access to audio files" ON storage.objects
FOR SELECT USING (bucket_id = 'podcast-audio');

-- Allow users to update their own audio files
CREATE POLICY "Allow users to update their own audio files" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'podcast-audio' AND 
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own audio files
CREATE POLICY "Allow users to delete their own audio files" ON storage.objects
FOR DELETE USING (
    bucket_id = 'podcast-audio' AND 
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Set up storage policies for podcast-scripts bucket
-- Allow authenticated users to upload script files
CREATE POLICY "Allow authenticated users to upload script files" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'podcast-scripts' AND 
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public access to script files (for viewing)
CREATE POLICY "Allow public access to script files" ON storage.objects
FOR SELECT USING (bucket_id = 'podcast-scripts');

-- Allow users to update their own script files
CREATE POLICY "Allow users to update their own script files" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'podcast-scripts' AND 
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own script files
CREATE POLICY "Allow users to delete their own script files" ON storage.objects
FOR DELETE USING (
    bucket_id = 'podcast-scripts' AND 
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Confirm setup
SELECT 'Storage buckets and policies created successfully!' AS status;

-- Show created buckets
SELECT id, name, public FROM storage.buckets WHERE id IN ('podcast-covers', 'podcast-audio', 'podcast-scripts'); 