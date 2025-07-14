-- Fix language codes in existing podcasts
-- This script converts full language names to language codes for consistency

-- Update language names to language codes
UPDATE podcasts 
SET language = CASE 
    WHEN language = 'English' THEN 'en'
    WHEN language = 'Spanish' THEN 'es'
    WHEN language = 'French' THEN 'fr'
    WHEN language = 'German' THEN 'de'
    WHEN language = 'Italian' THEN 'it'
    WHEN language = 'Portuguese' THEN 'pt'
    WHEN language = 'Dutch' THEN 'nl'
    WHEN language = 'Polish' THEN 'pl'
    WHEN language = 'Russian' THEN 'ru'
    WHEN language = 'Mandarin' THEN 'zh'
    WHEN language = 'Chinese (Mandarin)' THEN 'zh'
    WHEN language = 'Chinese' THEN 'zh'
    WHEN language = 'Japanese' THEN 'ja'
    WHEN language = 'Korean' THEN 'ko'
    WHEN language = 'Arabic' THEN 'ar'
    WHEN language = 'Hindi' THEN 'hi'
    WHEN language = 'Other' THEN 'other'
    ELSE language -- Keep existing if already in code format
END
WHERE language IN (
    'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 
    'Dutch', 'Polish', 'Russian', 'Mandarin', 'Chinese (Mandarin)', 'Chinese',
    'Japanese', 'Korean', 'Arabic', 'Hindi', 'Other'
);

-- Check results
SELECT language, COUNT(*) as count 
FROM podcasts 
GROUP BY language 
ORDER BY count DESC; 