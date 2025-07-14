# RSS Import & Sync Setup Guide

## Overview

This guide explains how to set up and use the RSS import and sync functionality for your RETELL podcast platform. The system allows authors to:

1. **Import podcasts from RSS feeds** - Create new podcasts by importing from existing RSS feeds
2. **Sync episodes automatically** - Keep episodes up to date with automatic RSS feed syncing
3. **Manual RSS updates** - Manually trigger RSS feed updates from the UI

## Features

### 🎯 What You Can Do

- **Import from RSS**: Paste any RSS feed URL and automatically create a podcast with all episodes
- **Preview before import**: See what will be imported before creating anything
- **Automatic episode sync**: New episodes from RSS feeds are automatically imported
- **Duplicate prevention**: Smart duplicate detection prevents importing the same episode twice
- **Manual sync**: Authors can manually trigger RSS sync from the podcast management page
- **Metadata sync**: Podcast title, description, and cover image are kept in sync with RSS feed

### 📋 What Gets Imported

From RSS feeds, the system imports:
- **Podcast**: Title, description, cover image, category, language
- **Episodes**: Title, description, audio URL, duration, episode number, season number
- **Episode metadata**: Publication date, iTunes-specific data

## Setup Instructions

### 1. Manual RSS Import (Available Now)

The basic RSS import functionality is already available in the author dashboard:

1. Go to **Author Dashboard** > **Create New Podcast**
2. Click on the **📡 RSS Import** tab
3. Paste your RSS feed URL
4. Click **👀 Preview** to see what will be imported
5. Click **📥 Import** to create the podcast with all episodes

### 2. Manual RSS Sync (Available Now)

For existing podcasts with RSS feeds:

1. Go to **Author Dashboard** > **My Podcasts**
2. Find podcasts with RSS feeds (they show a **🔄 Sync RSS** button)
3. Click **🔄 Sync RSS** to check for new episodes
4. New episodes will be imported automatically

### 3. Automatic RSS Sync (Requires Supabase Setup)

For fully automatic RSS syncing, you need to set up Supabase Edge Functions:

#### Prerequisites
- Supabase project with Edge Functions enabled
- Supabase CLI installed
- Access to your Supabase project

#### Step 1: Deploy the Edge Function

```bash
# Install Supabase CLI if you haven't already
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_ID

# Deploy the RSS sync function
supabase functions deploy rss-sync --no-verify-jwt
```

#### Step 2: Set up Environment Variables

In your Supabase project dashboard:
1. Go to **Settings** > **Edge Functions**
2. Add these environment variables:
   - `SUPABASE_URL`: Your Supabase URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Your service role key

#### Step 3: Enable pg_cron Extension

In your Supabase SQL editor, run:
```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
```

#### Step 4: Set up Cron Job

Run the SQL script from `supabase/functions/rss-sync/cron.sql` in your Supabase SQL editor:

```sql
-- Update the URL to match your project
-- Replace 'your-project-id' with your actual project ID
```

#### Step 5: Test the Function

You can test the function manually:
```bash
curl -X POST 'https://your-project-id.supabase.co/functions/v1/rss-sync' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json'
```

## Usage Guide

### For Authors

#### Creating a Podcast from RSS

1. **Go to Upload Page**: Navigate to "Create New Podcast"
2. **Switch to RSS Import**: Click on the "📡 RSS Import" tab
3. **Enter RSS URL**: Paste your podcast's RSS feed URL
4. **Preview Import**: Click "Preview" to see what will be imported
5. **Review Details**: Check podcast info and episode list
6. **Import**: Click "Import" to create the podcast

#### Updating RSS Feeds

1. **Go to My Podcasts**: View your podcast list
2. **Find RSS Podcasts**: Look for the "🔄 Sync RSS" button
3. **Click Sync**: Trigger a manual sync to check for new episodes
4. **Review New Episodes**: New episodes will appear in "Draft" status

### For Administrators

#### Monitoring RSS Sync

1. **Check Logs**: Monitor Supabase Edge Function logs
2. **Review Episodes**: New episodes appear in the admin episode management
3. **Approve Content**: RSS-imported content still requires approval

## Technical Details

### RSS Feed Requirements

The system supports standard RSS 2.0 feeds with:
- `<channel>` with basic metadata
- `<item>` elements with `<enclosure>` for audio files
- iTunes namespace support (`<itunes:*>` tags)

### Supported RSS Elements

**Podcast Level:**
- `<title>`, `<description>`, `<link>`, `<language>`
- `<image>` or `<itunes:image>`
- `<itunes:author>`, `<itunes:category>`

**Episode Level:**
- `<title>`, `<description>`, `<link>`, `<pubDate>`
- `<enclosure>` (required for audio)
- `<itunes:duration>`, `<itunes:episode>`, `<itunes:season>`
- `<itunes:summary>`, `<itunes:explicit>`

### Duplicate Detection

The system prevents duplicates by checking:
- Episode titles (case-insensitive)
- Audio URLs
- Episode numbers

### Episode Status

All RSS-imported episodes are created with:
- **Status**: `draft` (requires approval)
- **Script URL**: Empty (needs to be added manually)
- **Episode numbering**: Auto-generated or from RSS

## API Endpoints

### RSS Import
- **URL**: `POST /api/rss/import`
- **Purpose**: Import a new podcast from RSS feed
- **Body**: `{ "rssUrl": "https://..." }`

### RSS Update
- **URL**: `POST /api/rss/update`
- **Purpose**: Update specific podcast from RSS feed
- **Body**: `{ "podcastId": "uuid" }`

### RSS Parse (Preview)
- **URL**: `POST /api/rss/parse`
- **Purpose**: Preview RSS feed without importing
- **Body**: `{ "rssUrl": "https://..." }`

## Troubleshooting

### Common Issues

1. **"Failed to parse RSS feed"**
   - Check if the RSS URL is valid and accessible
   - Ensure the RSS feed follows standard RSS 2.0 format
   - Try the preview function first

2. **"No episodes found"**
   - Check if episodes have `<enclosure>` tags with audio files
   - Verify the RSS feed has `<item>` elements

3. **"Duplicate episodes"**
   - This is normal behavior - duplicates are automatically skipped
   - The system tracks episodes by title and audio URL

4. **Cron job not running**
   - Check if pg_cron extension is enabled
   - Verify the Edge Function is deployed
   - Check Supabase logs for errors

### Getting Help

- Check Supabase Edge Function logs
- Review the RSS feed in a browser
- Test individual API endpoints
- Monitor the admin dashboard for new content

## Best Practices

1. **Test First**: Always use the preview function before importing
2. **Regular Sync**: Set up automatic sync for active podcasts
3. **Content Review**: Review imported episodes before approval
4. **Script URLs**: Add script URLs manually after import
5. **Metadata Check**: Verify imported metadata is correct

## Security Considerations

- RSS feeds are fetched server-side to prevent CORS issues
- Only authenticated authors can import RSS feeds
- All imported content requires admin approval
- Service role key is used for automatic syncing

## Future Enhancements

Planned features:
- Webhook support for instant RSS updates
- Better RSS feed validation
- Custom import mapping
- Episode image import
- RSS feed monitoring dashboard 