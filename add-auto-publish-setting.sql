-- Add auto-publish setting to podcasts table
ALTER TABLE podcasts 
ADD COLUMN auto_publish_episodes BOOLEAN DEFAULT true;

-- Add comment for clarity
COMMENT ON COLUMN podcasts.auto_publish_episodes IS 'When true, new episodes from RSS feeds are automatically published (approved status). When false, they remain in draft status for manual author review. Episodes never require admin approval.';

-- Update existing podcasts to have auto_publish_episodes = true (auto-publish by default)
UPDATE podcasts 
SET auto_publish_episodes = true 
WHERE auto_publish_episodes IS NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_podcasts_auto_publish ON podcasts(auto_publish_episodes);

-- Check results
SELECT 
    title, 
    status, 
    auto_publish_episodes,
    rss_url IS NOT NULL as has_rss_feed
FROM podcasts 
ORDER BY created_at DESC 
LIMIT 10; 