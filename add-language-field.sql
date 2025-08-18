-- Add language field to podcasts table
-- This is separate from country - language is what language the podcast is spoken in

ALTER TABLE podcasts ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'en';

-- Set default languages based on existing data or country
UPDATE podcasts 
SET language = CASE 
  WHEN country = 'DE' THEN 'de'
  WHEN country = 'FR' THEN 'fr'
  WHEN country = 'ES' THEN 'es'
  WHEN country = 'IT' THEN 'it'
  WHEN country = 'NL' THEN 'nl'
  WHEN country = 'PT' THEN 'pt'
  WHEN country = 'PL' THEN 'pl'
  ELSE 'en'
END
WHERE language IS NULL OR language = '';

-- Show results
SELECT 'Language field added!' as status;

SELECT 
  'Languages distribution:' as summary,
  language,
  COUNT(*) as count
FROM podcasts 
GROUP BY language
ORDER BY count DESC;
