-- Update default value for auto_publish_episodes to true
ALTER TABLE podcasts ALTER COLUMN auto_publish_episodes SET DEFAULT true;

-- Update existing podcasts to have auto_publish_episodes = true
UPDATE podcasts 
SET auto_publish_episodes = true 
WHERE auto_publish_episodes IS NULL OR auto_publish_episodes = false;

-- Verify the changes
SELECT 
    title, 
    status, 
    auto_publish_episodes,
    rss_url IS NOT NULL as has_rss_feed
FROM podcasts 
ORDER BY created_at DESC 
LIMIT 10; 