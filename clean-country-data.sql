-- First: Update all podcasts to have 'DE' as default country
UPDATE podcasts 
SET country = 'DE', updated_at = NOW()
WHERE country IS NULL OR country = '' OR country = 'unknown';

-- Second: Clean up any invalid country translations
DELETE FROM podcast_country_translations 
WHERE country_code IS NULL 
   OR country_code = '' 
   OR country_code = 'unknown'
   OR LENGTH(country_code) != 2;

-- Third: Remove any duplicate or self-referencing translations 
-- (where translation country is same as podcast's default country)
DELETE pct FROM podcast_country_translations pct
JOIN podcasts p ON pct.podcast_id = p.id
WHERE pct.country_code = p.country;

-- Fourth: Ensure all country codes are uppercase
UPDATE podcast_country_translations 
SET country_code = UPPER(country_code)
WHERE country_code != UPPER(country_code);

UPDATE podcasts 
SET country = UPPER(country)
WHERE country != UPPER(country);

-- Check results
SELECT 'Data cleanup completed!' as status;

SELECT 
  'Podcasts by country:' as summary,
  country,
  COUNT(*) as count
FROM podcasts 
GROUP BY country
ORDER BY count DESC;

SELECT 
  'Country translations:' as summary,
  country_code,
  COUNT(*) as count
FROM podcast_country_translations
GROUP BY country_code
ORDER BY count DESC;
