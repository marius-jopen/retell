import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import Parser from 'rss-parser'
import { downloadAndStoreImage } from '@/lib/image-utils'

interface RSSItem {
  title?: string
  contentSnippet?: string
  content?: string
  link?: string
  pubDate?: string
  enclosure?: {
    url: string
    type: string
    length: string
  }
  itunes?: {
    duration?: string
    episode?: string
    season?: string
    episodeType?: string
    explicit?: boolean
    image?: string
    summary?: string
  }
}

interface RSSFeed {
  title?: string
  description?: string
  link?: string
  language?: string
  copyright?: string
  image?: {
    url: string
    title: string
    link: string
  }
  itunes?: {
    author?: string
    summary?: string
    type?: string
    owner?: {
      name: string
      email: string
    }
    explicit?: boolean
    category?: string[]
    image?: string
  }
  items: RSSItem[]
}

// Parse duration string to seconds
function parseDuration(duration: string): number | null {
  if (!duration) return null
  
  const parts = duration.split(':').map(Number)
  if (parts.length === 3) {
    // HH:MM:SS
    return parts[0] * 3600 + parts[1] * 60 + parts[2]
  } else if (parts.length === 2) {
    // MM:SS
    return parts[0] * 60 + parts[1]
  } else if (parts.length === 1) {
    // SS
    return parts[0]
  }
  return null
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only authors can update RSS feeds
    if (user.profile.role !== 'author') {
      return NextResponse.json({ error: 'Only authors can update RSS feeds' }, { status: 403 })
    }

    const { podcastId } = await request.json()
    
    if (!podcastId) {
      return NextResponse.json({ error: 'Podcast ID is required' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()
    
    // Get podcast with RSS URL
    const { data: podcast, error: podcastError } = await supabase
      .from('podcasts')
      .select('*')
      .eq('id', podcastId)
      .eq('author_id', user.profile.id)
      .single()

    if (podcastError || !podcast) {
      return NextResponse.json({ error: 'Podcast not found or access denied' }, { status: 404 })
    }

    if (!podcast.rss_url) {
      return NextResponse.json({ error: 'This podcast does not have an RSS feed' }, { status: 400 })
    }

    const parser = new Parser()
    
    // Parse RSS feed
    let feed: RSSFeed
    try {
      feed = await parser.parseURL(podcast.rss_url) as RSSFeed
    } catch (error) {
      console.error('RSS parsing error:', error)
      return NextResponse.json({ error: 'Failed to parse RSS feed' }, { status: 400 })
    }

    // Update podcast metadata if needed
    let podcastUpdated = false
    const updates: any = {}

    if (feed.title && feed.title !== podcast.title) {
      updates.title = feed.title
      podcastUpdated = true
    }

    if (feed.description && feed.description !== podcast.description) {
      updates.description = feed.description
      podcastUpdated = true
    }

    // Download and store RSS feed image if available and changed
    const rssImageUrl = feed.image?.url || feed.itunes?.image
    if (rssImageUrl && rssImageUrl !== podcast.rss_image_url) {
      console.log('Downloading updated RSS feed image:', rssImageUrl)
      const imageResult = await downloadAndStoreImage(rssImageUrl, podcast.id, 'rss-cover')
      
      if (imageResult.success) {
        updates.cover_image_url = imageResult.imageUrl
        updates.rss_image_url = rssImageUrl
        podcastUpdated = true
        console.log('RSS feed image updated successfully')
      } else {
        console.warn('Failed to download RSS feed image:', imageResult.error)
        // Fall back to direct URL
        updates.cover_image_url = rssImageUrl
        updates.rss_image_url = rssImageUrl
        podcastUpdated = true
      }
    }

    // Update other metadata
    if (feed.itunes?.category?.[0] && feed.itunes.category[0] !== podcast.category) {
      updates.category = feed.itunes.category[0]
      podcastUpdated = true
    }

    if (feed.language && feed.language !== podcast.language) {
      updates.language = feed.language
      podcastUpdated = true
    }

    if (podcastUpdated) {
      updates.updated_at = new Date().toISOString()
      await supabase
        .from('podcasts')
        .update(updates)
        .eq('id', podcastId)
    }

    // Get existing episodes to avoid duplicates
    const { data: existingEpisodes } = await supabase
      .from('episodes')
      .select('title, episode_number, audio_url')
      .eq('podcast_id', podcastId)

    const existingTitles = new Set(existingEpisodes?.map(ep => ep.title.toLowerCase()) || [])
    const existingNumbers = new Set(existingEpisodes?.map(ep => ep.episode_number) || [])
    const existingAudioUrls = new Set(existingEpisodes?.map(ep => ep.audio_url) || [])

    // Process new episodes
    const newEpisodes = []
    let episodeCount = Math.max(...(existingEpisodes?.map(ep => ep.episode_number) || [0])) + 1

    for (const item of feed.items) {
      if (!item.title || !item.enclosure?.url) {
        continue // Skip items without title or audio
      }

      const episodeTitle = item.title.toLowerCase()
      
      // Skip if episode already exists (by title or audio URL)
      if (existingTitles.has(episodeTitle) || existingAudioUrls.has(item.enclosure.url)) {
        continue
      }

      const episodeNumber = item.itunes?.episode ? parseInt(item.itunes.episode) : episodeCount
      
      // Skip if episode number already exists
      if (existingNumbers.has(episodeNumber)) {
        episodeCount++
        continue
      }

      const duration = parseDuration(item.itunes?.duration || '')
      
      newEpisodes.push({
        podcast_id: podcastId,
        title: item.title,
        description: item.contentSnippet || item.content || item.itunes?.summary || '',
        audio_url: item.enclosure.url,
        script_url: '', // RSS feeds don't have script URLs, set empty for now
        duration: duration,
        episode_number: episodeNumber,
        season_number: item.itunes?.season ? parseInt(item.itunes.season) : 1
      })

      episodeCount++
    }

    // Insert new episodes
    let insertedEpisodes = []
    if (newEpisodes.length > 0) {
      const { data: episodes, error: episodeError } = await supabase
        .from('episodes')
        .insert(newEpisodes)
        .select()

      if (episodeError) {
        console.error('Episode creation error:', episodeError)
        return NextResponse.json({ error: 'Failed to create episodes' }, { status: 500 })
      }

      insertedEpisodes = episodes || []
    }

    return NextResponse.json({
      success: true,
      podcast: {
        id: podcast.id,
        title: feed.title || podcast.title,
        updated: podcastUpdated,
        imageUpdated: !!updates.cover_image_url
      },
      episodes: {
        total: feed.items.length,
        existing: existingEpisodes?.length || 0,
        new: insertedEpisodes.length
      }
    })

  } catch (error) {
    console.error('RSS update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET endpoint to update all RSS feeds for a user
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only authors can update RSS feeds
    if (user.profile.role !== 'author') {
      return NextResponse.json({ error: 'Only authors can update RSS feeds' }, { status: 403 })
    }

    const supabase = await createServerSupabaseClient()
    
    // Get all podcasts with RSS URLs for this author
    const { data: podcasts, error: podcastsError } = await supabase
      .from('podcasts')
      .select('id, title, rss_url')
      .eq('author_id', user.profile.id)
      .not('rss_url', 'is', null)

    if (podcastsError) {
      return NextResponse.json({ error: 'Failed to fetch podcasts' }, { status: 500 })
    }

    if (!podcasts || podcasts.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No podcasts with RSS feeds found',
        results: []
      })
    }

    const results = []
    const parser = new Parser()

    for (const podcast of podcasts) {
      try {
        // Parse RSS feed
        const feed = await parser.parseURL(podcast.rss_url) as RSSFeed
        
        // Get existing episodes
        const { data: existingEpisodes } = await supabase
          .from('episodes')
          .select('title, episode_number, audio_url')
          .eq('podcast_id', podcast.id)

        const existingTitles = new Set(existingEpisodes?.map(ep => ep.title.toLowerCase()) || [])
        const existingAudioUrls = new Set(existingEpisodes?.map(ep => ep.audio_url) || [])

        // Count new episodes
        const newEpisodes = feed.items.filter(item => {
          if (!item.title || !item.enclosure?.url) return false
          return !existingTitles.has(item.title.toLowerCase()) && !existingAudioUrls.has(item.enclosure.url)
        })

        results.push({
          podcast: {
            id: podcast.id,
            title: podcast.title
          },
          newEpisodes: newEpisodes.length,
          totalEpisodes: feed.items.length
        })

      } catch (error) {
        console.error(`Error processing RSS for podcast ${podcast.id}:`, error)
        results.push({
          podcast: {
            id: podcast.id,
            title: podcast.title
          },
          error: 'Failed to parse RSS feed'
        })
      }
    }

    return NextResponse.json({
      success: true,
      results
    })

  } catch (error) {
    console.error('RSS batch update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 