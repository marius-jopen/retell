-- Fix RLS policies to allow public read access to translation data
-- This allows logged-out users to see country and language translations

-- Allow public read access to podcast_country_translations
DROP POLICY IF EXISTS "Public can read country translations" ON podcast_country_translations;
CREATE POLICY "Public can read country translations" 
ON podcast_country_translations FOR SELECT 
TO anon, authenticated
USING (true);

-- Allow public read access to podcast_translations  
DROP POLICY IF EXISTS "Public can read language translations" ON podcast_translations;
CREATE POLICY "Public can read language translations"
ON podcast_translations FOR SELECT
TO anon, authenticated  
USING (true);

-- Verify the policies are working
-- You can test this by running these queries in the Supabase SQL editor:
-- SELECT * FROM podcast_country_translations WHERE podcast_id = 'bfe4d861-e181-46b2-8f44-bf583fb52d40';
-- SELECT * FROM podcast_translations WHERE podcast_id = 'bfe4d861-e181-46b2-8f44-bf583fb52d40';
