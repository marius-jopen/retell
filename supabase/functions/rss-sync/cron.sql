-- Create a cron job to run RSS sync every hour
-- This requires the pg_cron extension to be enabled in your Supabase project

-- Enable pg_cron extension (run this once)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a function to call the Edge Function
CREATE OR REPLACE FUNCTION sync_rss_feeds()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Call the Edge Function
  PERFORM net.http_post(
    url := 'https://your-project-id.supabase.co/functions/v1/rss-sync',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key')
    )
  );
END;
$$;

-- Schedule the function to run every hour
SELECT cron.schedule(
  'rss-sync-hourly',
  '0 * * * *', -- Every hour at minute 0
  'SELECT sync_rss_feeds();'
);

-- Alternative: Run every 30 minutes
-- SELECT cron.schedule(
--   'rss-sync-30min',
--   '*/30 * * * *',
--   'SELECT sync_rss_feeds();'
-- );

-- Alternative: Run daily at 6 AM
-- SELECT cron.schedule(
--   'rss-sync-daily',
--   '0 6 * * *',
--   'SELECT sync_rss_feeds();'
-- );

-- To check scheduled jobs:
-- SELECT * FROM cron.job;

-- To remove a job:
-- SELECT cron.unschedule('rss-sync-hourly'); 