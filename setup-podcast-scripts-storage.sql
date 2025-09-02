-- Create storage bucket for podcast scripts
INSERT INTO storage.buckets (id, name, public) 
VALUES ('podcast-scripts', 'podcast-scripts', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for podcast-scripts bucket (simplified like podcast-covers)
-- Allow authenticated users to upload script files
CREATE POLICY "Allow authenticated users to upload script files" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'podcast-scripts' AND 
    auth.role() = 'authenticated'
);

-- Allow public access to view script files
CREATE POLICY "Allow public access to script files" ON storage.objects
FOR SELECT USING (bucket_id = 'podcast-scripts');

-- Allow users to update script files
CREATE POLICY "Allow users to update script files" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'podcast-scripts' AND 
    auth.role() = 'authenticated'
);

-- Allow users to delete script files
CREATE POLICY "Allow users to delete script files" ON storage.objects
FOR DELETE USING (
    bucket_id = 'podcast-scripts' AND 
    auth.role() = 'authenticated'
);
