-- Fix RSS-imported podcast update issues
-- This script addresses common problems with RSS-imported podcasts

-- 1. Add auto_publish_episodes column if it doesn't exist
ALTER TABLE podcasts ADD COLUMN IF NOT EXISTS auto_publish_episodes BOOLEAN DEFAULT true;

-- 2. Fix language codes for RSS-imported podcasts
UPDATE podcasts 
SET language = CASE 
    WHEN language = 'en' THEN 'en'
    WHEN language = 'de' THEN 'de'  
    WHEN language = 'fr' THEN 'fr'
    WHEN language = 'es' THEN 'es'
    WHEN language = 'it' THEN 'it'
    WHEN language = 'pt' THEN 'pt'
    WHEN language = 'nl' THEN 'nl'
    WHEN language = 'pl' THEN 'pl'
    WHEN language = 'ru' THEN 'ru'
    WHEN language = 'zh' THEN 'zh'
    WHEN language = 'ja' THEN 'ja'
    WHEN language = 'ko' THEN 'ko'
    WHEN language = 'ar' THEN 'ar'
    WHEN language = 'hi' THEN 'hi'
    WHEN language ILIKE '%english%' THEN 'en'
    WHEN language ILIKE '%german%' THEN 'de'
    WHEN language ILIKE '%french%' THEN 'fr'
    WHEN language ILIKE '%spanish%' THEN 'es'
    WHEN language ILIKE '%italian%' THEN 'it'
    WHEN language ILIKE '%portuguese%' THEN 'pt'
    WHEN language ILIKE '%dutch%' THEN 'nl'
    WHEN language ILIKE '%polish%' THEN 'pl'
    WHEN language ILIKE '%russian%' THEN 'ru'
    WHEN language ILIKE '%chinese%' THEN 'zh'
    WHEN language ILIKE '%japanese%' THEN 'ja'
    WHEN language ILIKE '%korean%' THEN 'ko'
    WHEN language ILIKE '%arabic%' THEN 'ar'
    WHEN language ILIKE '%hindi%' THEN 'hi'
    ELSE 'en' -- Default to English for unknown languages
END
WHERE rss_url IS NOT NULL;

-- 3. Fix country values for RSS-imported podcasts
UPDATE podcasts 
SET country = CASE 
    WHEN country = 'Unknown' OR country IS NULL THEN 'Other'
    WHEN country ILIKE '%united states%' OR country ILIKE '%usa%' OR country ILIKE '%us%' THEN 'United States'
    WHEN country ILIKE '%canada%' OR country ILIKE '%ca%' THEN 'Canada'
    WHEN country ILIKE '%united kingdom%' OR country ILIKE '%uk%' OR country ILIKE '%britain%' THEN 'United Kingdom'
    WHEN country ILIKE '%australia%' OR country ILIKE '%au%' THEN 'Australia'
    WHEN country ILIKE '%germany%' OR country ILIKE '%de%' THEN 'Germany'
    WHEN country ILIKE '%france%' OR country ILIKE '%fr%' THEN 'France'
    WHEN country ILIKE '%spain%' OR country ILIKE '%es%' THEN 'Spain'
    WHEN country ILIKE '%italy%' OR country ILIKE '%it%' THEN 'Italy'
    WHEN country ILIKE '%netherlands%' OR country ILIKE '%nl%' THEN 'Netherlands'
    WHEN country ILIKE '%japan%' OR country ILIKE '%jp%' THEN 'Japan'
    WHEN country ILIKE '%south korea%' OR country ILIKE '%korea%' OR country ILIKE '%kr%' THEN 'South Korea'
    WHEN country ILIKE '%brazil%' OR country ILIKE '%br%' THEN 'Brazil'
    WHEN country ILIKE '%mexico%' OR country ILIKE '%mx%' THEN 'Mexico'
    WHEN country ILIKE '%argentina%' OR country ILIKE '%ar%' THEN 'Argentina'
    WHEN country ILIKE '%india%' OR country ILIKE '%in%' THEN 'India'
    WHEN country ILIKE '%china%' OR country ILIKE '%cn%' THEN 'China'
    WHEN country ILIKE '%russia%' OR country ILIKE '%ru%' THEN 'Russia'
    ELSE 'Other'
END
WHERE rss_url IS NOT NULL;

-- 4. Fix category values for RSS-imported podcasts
UPDATE podcasts 
SET category = CASE 
    WHEN category IS NULL OR category = '' THEN 'Other'
    WHEN category ILIKE '%business%' THEN 'Business'
    WHEN category ILIKE '%tech%' OR category ILIKE '%technology%' THEN 'Technology'
    WHEN category ILIKE '%entertainment%' THEN 'Entertainment'
    WHEN category ILIKE '%education%' THEN 'Education'
    WHEN category ILIKE '%news%' THEN 'News'
    WHEN category ILIKE '%health%' THEN 'Health'
    WHEN category ILIKE '%sport%' THEN 'Sports'
    WHEN category ILIKE '%music%' THEN 'Music'
    WHEN category ILIKE '%comedy%' THEN 'Comedy'
    WHEN category ILIKE '%crime%' THEN 'True Crime'
    WHEN category ILIKE '%science%' THEN 'Science'
    WHEN category ILIKE '%history%' THEN 'History'
    WHEN category ILIKE '%politics%' THEN 'Politics'
    WHEN category ILIKE '%arts%' THEN 'Arts'
    ELSE 'Other'
END
WHERE rss_url IS NOT NULL;

-- 5. Set auto_publish_episodes to true for RSS-imported podcasts
UPDATE podcasts 
SET auto_publish_episodes = true 
WHERE rss_url IS NOT NULL AND auto_publish_episodes IS NULL;

-- 6. Ensure all required fields are not null for RSS-imported podcasts
UPDATE podcasts 
SET 
    title = COALESCE(title, 'Untitled Podcast'),
    description = COALESCE(description, 'No description available'),
    category = COALESCE(category, 'Other'),
    language = COALESCE(language, 'en'),
    country = COALESCE(country, 'Other')
WHERE rss_url IS NOT NULL;

-- 7. Check for any remaining issues
SELECT 
    id,
    title,
    category,
    language,
    country,
    auto_publish_episodes,
    rss_url IS NOT NULL as is_rss_imported
FROM podcasts 
WHERE rss_url IS NOT NULL
ORDER BY created_at DESC;

-- 8. Show any potential validation issues
SELECT 
    'Language Issues' as issue_type,
    COUNT(*) as count
FROM podcasts 
WHERE rss_url IS NOT NULL 
    AND language NOT IN ('en', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'pl', 'ru', 'zh', 'ja', 'ko', 'ar', 'hi', 'other')

UNION ALL

SELECT 
    'Country Issues' as issue_type,
    COUNT(*) as count
FROM podcasts 
WHERE rss_url IS NOT NULL 
    AND country NOT IN ('United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France', 'Spain', 'Italy', 'Netherlands', 'Japan', 'South Korea', 'Brazil', 'Mexico', 'Argentina', 'India', 'China', 'Russia', 'Other')

UNION ALL

SELECT 
    'Category Issues' as issue_type,
    COUNT(*) as count
FROM podcasts 
WHERE rss_url IS NOT NULL 
    AND category NOT IN ('Business', 'Technology', 'Entertainment', 'Education', 'News', 'Health', 'Sports', 'Music', 'Comedy', 'True Crime', 'Science', 'History', 'Politics', 'Arts', 'Other'); 