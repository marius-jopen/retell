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

    // Only authors can import RSS feeds
    if (user.profile.role !== 'author') {
      return NextResponse.json({ error: 'Only authors can import RSS feeds' }, { status: 403 })
    }

    const { rssUrl } = await request.json()
    
    if (!rssUrl) {
      return NextResponse.json({ error: 'RSS URL is required' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()
    const parser = new Parser()
    
    // Parse RSS feed
    let feed: RSSFeed
    try {
      feed = await parser.parseURL(rssUrl) as RSSFeed
    } catch (error) {
      console.error('RSS parsing error:', error)
      return NextResponse.json({ error: 'Failed to parse RSS feed' }, { status: 400 })
    }

    if (!feed.title) {
      return NextResponse.json({ error: 'RSS feed must have a title' }, { status: 400 })
    }

    // Check if podcast already exists for this RSS URL
    const { data: existingPodcast } = await supabase
      .from('podcasts')
      .select('*')
      .eq('rss_url', rssUrl)
      .eq('author_id', user.profile.id)
      .single()

    let podcast
    let coverImageUrl = null // Define at proper scope
    
    if (existingPodcast) {
      // Update existing podcast metadata from RSS feed
      const updates: Record<string, unknown> = {}
      let podcastUpdated = false

      if (feed.title && feed.title !== existingPodcast.title) {
        updates.title = feed.title
        podcastUpdated = true
      }

      if (feed.description && feed.description !== existingPodcast.description) {
        updates.description = feed.description
        podcastUpdated = true
      }

      // Download and store RSS feed image if available
      const rssImageUrl = feed.image?.url || feed.itunes?.image
      if (rssImageUrl && rssImageUrl !== existingPodcast.cover_image_url) {
        console.log('Downloading RSS feed image:', rssImageUrl)
        const imageResult = await downloadAndStoreImage(rssImageUrl, existingPodcast.id, 'rss-cover')
        
        if (imageResult.success) {
          updates.cover_image_url = imageResult.imageUrl
          podcastUpdated = true
          console.log('RSS feed image downloaded successfully')
          coverImageUrl = imageResult.imageUrl
        } else {
          console.warn('Failed to download RSS feed image:', imageResult.error)
          // Fall back to direct URL
          updates.cover_image_url = rssImageUrl
          podcastUpdated = true
          coverImageUrl = rssImageUrl
        }
      }

      if (feed.itunes?.category?.[0] && feed.itunes.category[0] !== existingPodcast.category) {
        updates.category = feed.itunes.category[0]
        podcastUpdated = true
      }

      if (feed.language && feed.language !== existingPodcast.language) {
        updates.language = feed.language
        podcastUpdated = true
      }

      if (podcastUpdated) {
        updates.updated_at = new Date().toISOString()
        const { error: updateError } = await supabase
          .from('podcasts')
          .update(updates)
          .eq('id', existingPodcast.id)

        if (updateError) {
          console.error('Error updating podcast metadata:', updateError)
          // Don't fail the import, just log the error
        }
      }

      podcast = { ...existingPodcast, ...updates }
    } else {
      // Create new podcast
      let imageResult = null
      
      // Download and store RSS feed image if available
      const feedImageUrl = feed.image?.url || feed.itunes?.image
      if (feedImageUrl) {
        console.log('Downloading RSS feed image for new podcast:', feedImageUrl)
        imageResult = await downloadAndStoreImage(feedImageUrl, 'temp-id', 'rss-cover')
        
        if (imageResult.success) {
          coverImageUrl = imageResult.imageUrl
          console.log('RSS feed image downloaded successfully for new podcast')
        } else {
          console.warn('Failed to download RSS feed image for new podcast:', imageResult.error)
          // Fall back to direct URL
          coverImageUrl = feedImageUrl
        }
      }

      const { data: newPodcast, error: podcastError } = await supabase
        .from('podcasts')
        .insert({
          title: feed.title,
          description: feed.description || feed.itunes?.summary || '',
          cover_image_url: coverImageUrl,
          author_id: user.id,
          category: feed.itunes?.category?.[0] || 'General',
          language: feed.language || 'en',
          country: 'Unknown',
          status: 'draft',
          rss_url: rssUrl,
          auto_publish_episodes: true
        })
        .select()
        .single()

      if (podcastError) {
        console.error('Podcast creation error:', podcastError)
        return NextResponse.json({ error: 'Failed to create podcast' }, { status: 500 })
      }

      // If we used a temp ID for image download, re-download with actual podcast ID
      if (coverImageUrl && imageResult?.success && newPodcast.id && feedImageUrl) {
        const reDownloadResult = await downloadAndStoreImage(feedImageUrl, newPodcast.id, 'rss-cover')
        if (reDownloadResult.success) {
          await supabase
            .from('podcasts')
            .update({ cover_image_url: reDownloadResult.imageUrl })
            .eq('id', newPodcast.id)
        }
      }

      podcast = newPodcast
    }

    // Get existing episodes to avoid duplicates
    const { data: existingEpisodes } = await supabase
      .from('episodes')
      .select('title, episode_number')
      .eq('podcast_id', podcast.id)

    const existingTitles = new Set(existingEpisodes?.map(ep => ep.title.toLowerCase()) || [])
    const existingNumbers = new Set(existingEpisodes?.map(ep => ep.episode_number) || [])

    // Process episodes
    const newEpisodes = []
    let episodeCount = 0

    for (const item of feed.items) {
      if (!item.title || !item.enclosure?.url) {
        continue // Skip items without title or audio
      }

      const episodeTitle = item.title.toLowerCase()
      if (existingTitles.has(episodeTitle)) {
        continue // Skip duplicates
      }

      episodeCount++
      const episodeNumber = item.itunes?.episode ? parseInt(item.itunes.episode) : episodeCount
      
      // Skip if episode number already exists
      if (existingNumbers.has(episodeNumber)) {
        continue
      }

      const duration = parseDuration(item.itunes?.duration || '')
      
      newEpisodes.push({
        podcast_id: podcast.id,
        title: item.title,
        description: item.contentSnippet || item.content || item.itunes?.summary || '',
        audio_url: item.enclosure.url,
        script_url: '', // RSS feeds don't have script URLs, set empty for now
        duration: duration,
        episode_number: episodeNumber,
        season_number: item.itunes?.season ? parseInt(item.itunes.season) : 1
      })
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
        title: podcast.title,
        isNew: !existingPodcast,
        imageDownloaded: !!coverImageUrl
      },
      episodes: {
        total: feed.items.length,
        imported: insertedEpisodes.length,
        skipped: feed.items.length - insertedEpisodes.length
      }
    })

  } catch (error) {
    console.error('RSS import error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 