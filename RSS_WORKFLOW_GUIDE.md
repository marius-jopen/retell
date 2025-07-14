# RSS Workflow Management Guide

## Overview

The RETELL platform now features a comprehensive RSS workflow system that allows seamless transitions between manual and automated podcast management. This guide explains the three workflow modes and how to use them effectively.

## 🔧 Workflow Modes

### 1. **Manual Mode** ✏️
- **Description**: All podcast data is managed manually through the admin interface
- **Best for**: New podcasts, custom content, or when you want complete control
- **Features**:
  - Manual title, description, and metadata editing
  - Custom cover image uploads
  - Manual episode creation and management
  - No RSS synchronization

### 2. **RSS Mode** 📡
- **Description**: Podcast data is automatically synchronized from RSS feed
- **Best for**: Existing podcasts with established RSS feeds
- **Features**:
  - Automatic title, description, and metadata sync
  - RSS feed image download and storage
  - Automatic episode import from RSS
  - Configurable auto-publish settings
  - Duplicate prevention

### 3. **Hybrid Mode** 🔄
- **Description**: RSS sync with manual overrides for specific fields
- **Best for**: Podcasts that need RSS automation but require custom branding
- **Features**:
  - Field-by-field override control
  - RSS sync for non-overridden fields
  - Manual customization of title, description, images, etc.
  - Automatic episode sync with manual metadata control

## 🚀 Getting Started

### Starting with Manual Mode

1. **Create Podcast**: Use the standard "Create New Podcast" form
2. **Fill Details**: Add title, description, category, language, etc.
3. **Upload Cover**: Add a custom cover image
4. **Create Episodes**: Manually add episodes with audio files and scripts

### Starting with RSS Mode

1. **RSS Import**: Use the "📡 RSS Import" tab in "Create New Podcast"
2. **Enter RSS URL**: Paste your podcast's RSS feed URL
3. **Preview**: Click "👀 Preview" to see what will be imported
4. **Import**: Click "📥 Import" to create the podcast with all episodes
5. **Auto-Sync**: New episodes will be automatically imported

### Converting Between Modes

#### Manual → RSS
1. Go to podcast edit page
2. Click "🔧 Workflow Settings" tab
3. Select "Switch to RSS" 
4. Enter RSS feed URL
5. Choose sync options and confirm

#### RSS → Manual
1. Access workflow settings
2. Select "Switch to Manual"
3. Choose whether to preserve RSS data
4. Confirm transition

#### Manual/RSS → Hybrid
1. Access workflow settings
2. Select "Switch to Hybrid"
3. Enter RSS URL (if coming from manual)
4. Configure field overrides
5. Confirm transition

## 🎨 Image Handling

### RSS Feed Images
- **Automatic Download**: Images from RSS feeds are now downloaded and stored locally
- **Fallback Support**: If image download fails, direct URL is used as fallback
- **Format Support**: JPEG, PNG, GIF, WebP, SVG
- **Size Limits**: Maximum 5MB per image
- **Storage**: Base64 encoding (temporary) with planned migration to storage buckets

### Manual Image Uploads
- **Direct Upload**: Standard file upload interface
- **Validation**: File type and size validation
- **Preview**: Real-time image preview
- **Override Support**: Manual images can override RSS images in hybrid mode

## 📊 Field Override System

### Available Override Fields
- **Title**: Podcast title
- **Description**: Podcast description  
- **Cover Image**: Podcast cover art
- **Category**: Podcast category
- **Language**: Podcast language
- **Country**: Podcast country/region

### How Overrides Work
1. **Toggle Control**: Simple on/off switch for each field
2. **Visual Indicators**: "(Manual Override)" labels on overridden fields
3. **Sync Behavior**: Non-overridden fields sync from RSS; overridden fields stay manual
4. **Granular Control**: Override only the fields you need to customize

## 🔄 Synchronization

### Automatic Sync
- **Scheduled Sync**: Automatic RSS feed checking (via Supabase Edge Functions)
- **Duplicate Prevention**: Smart detection prevents importing the same episode twice
- **Metadata Updates**: Podcast metadata is kept in sync with RSS feed
- **Episode Status**: New episodes default to "draft" or "approved" based on settings

### Manual Sync
- **Sync Button**: "🔄 Sync RSS" button on podcast pages
- **On-Demand**: Trigger sync whenever needed
- **Progress Feedback**: Visual feedback on sync status
- **Error Handling**: Clear error messages for failed syncs

## 🛠️ API Endpoints

### Workflow Management
- `GET /api/podcasts/[id]/workflow` - Get current workflow state
- `POST /api/podcasts/[id]/workflow` - Transition workflow or set overrides

### RSS Operations
- `POST /api/rss/import` - Import podcast from RSS feed
- `POST /api/rss/update` - Update podcast from RSS feed
- `POST /api/rss/parse` - Preview RSS feed before importing

## 📋 Best Practices

### Choosing the Right Mode

#### Use Manual Mode When:
- Creating original podcast content
- Need complete control over all metadata
- Don't have an existing RSS feed
- Want custom branding and descriptions

#### Use RSS Mode When:
- Importing existing podcast with established RSS feed
- Want fully automated content management
- RSS feed metadata is accurate and complete
- Minimal manual intervention needed

#### Use Hybrid Mode When:
- Need RSS automation but custom branding
- Want to override specific fields (e.g., custom descriptions)
- RSS feed has good episodes but poor metadata
- Need mix of automation and manual control

### Workflow Transitions

#### Safe Transitions:
- Manual → RSS (with RSS URL)
- RSS → Manual (with data preservation option)
- Any mode → Hybrid (most flexible)

#### Consider Before Transitioning:
- **Data Loss**: Some transitions may overwrite manual changes
- **RSS Quality**: Ensure RSS feed is reliable before switching to RSS mode
- **Backup**: Consider exporting data before major transitions

## 🔍 Troubleshooting

### Common Issues

#### RSS Import Fails
- **Check URL**: Ensure RSS URL is valid and accessible
- **Feed Format**: Verify RSS 2.0 format with proper enclosures
- **Network Issues**: RSS feed server may be temporarily unavailable

#### Image Download Fails
- **Image URL**: RSS image URL may be invalid or inaccessible
- **File Size**: Image may exceed 5MB limit
- **Format**: Unsupported image format
- **Solution**: System falls back to direct URL linking

#### Sync Conflicts
- **Duplicate Episodes**: Check episode titles and audio URLs
- **Metadata Mismatch**: RSS feed metadata may have changed
- **Override Conflicts**: Manual overrides may conflict with RSS data

### Error Messages
- **"RSS URL is required"**: RSS/Hybrid modes need valid RSS feed URL
- **"Invalid transition"**: Attempted transition is not allowed
- **"Failed to parse RSS feed"**: RSS feed is malformed or inaccessible
- **"Image download failed"**: RSS image could not be downloaded

## 📈 Monitoring and Analytics

### Workflow Status
- **Current Mode**: Visible in podcast edit interface
- **Last Sync**: Timestamp of last RSS synchronization
- **Override Status**: Visual indicators for overridden fields
- **Sync History**: Track of successful/failed synchronizations

### Performance Metrics
- **Import Speed**: RSS import processing time
- **Sync Frequency**: How often RSS feeds are checked
- **Error Rates**: Failed import/sync attempts
- **Image Processing**: Download success rates

## 🔮 Future Enhancements

### Planned Features
- **Storage Buckets**: Migration from base64 to proper file storage
- **Batch Operations**: Bulk workflow transitions
- **Advanced Scheduling**: Custom sync schedules per podcast
- **Webhook Support**: Real-time RSS feed notifications
- **Analytics Dashboard**: Detailed workflow performance metrics

### API Improvements
- **Pagination**: For large RSS feeds
- **Filtering**: Episode filtering during import
- **Validation**: Enhanced RSS feed validation
- **Rate Limiting**: Prevent abuse of RSS endpoints

This comprehensive workflow system provides the flexibility to handle any podcast management scenario while maintaining ease of use and reliability. 