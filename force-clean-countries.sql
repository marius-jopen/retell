-- AGGRESSIVE CLEANUP SCRIPT FOR COUNTRY DATA
-- Run this in Supabase SQL Editor

-- 1. Delete ALL translations with invalid country codes
DELETE FROM podcast_country_translations 
WHERE country_code IS NULL 
   OR country_code = '' 
   OR country_code = 'unknown'
   OR UPPER(country_code) = 'UNKNOWN'
   OR LENGTH(country_code) != 2
   OR country_code NOT SIMILAR TO '[A-Z]{2}';

-- 2. Update all podcasts to have valid country codes (default to 'DE')
UPDATE podcasts 
SET country = 'DE', updated_at = NOW()
WHERE country IS NULL 
   OR country = '' 
   OR country = 'unknown'
   OR UPPER(country) = 'UNKNOWN'
   OR LENGTH(country) != 2
   OR country NOT SIMILAR TO '[A-Z]{2}';

-- 3. Remove translations that match the podcast's default country
DELETE FROM podcast_country_translations 
WHERE id IN (
  SELECT pct.id 
  FROM podcast_country_translations pct
  JOIN podcasts p ON pct.podcast_id = p.id
  WHERE pct.country_code = p.country
);

-- 4. Ensure all country codes are uppercase
UPDATE podcast_country_translations 
SET country_code = UPPER(country_code)
WHERE country_code != UPPER(country_code);

UPDATE podcasts 
SET country = UPPER(country)
WHERE country != UPPER(country);

-- 5. Final check - show what's left
SELECT 'Podcasts by country:' as summary, country, COUNT(*) as count
FROM podcasts 
GROUP BY country
ORDER BY count DESC;

SELECT 'Country translations:' as summary, country_code, COUNT(*) as count
FROM podcast_country_translations
GROUP BY country_code
ORDER BY count DESC;

SELECT 'Cleanup completed!' as status;
