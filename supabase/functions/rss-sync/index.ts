import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

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

async function parseRSSFeed(url: string): Promise<RSSFeed | null> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const xmlText = await response.text()
    
    // Basic XML parsing - you might want to use a more robust parser
    const parser = new DOMParser()
    const doc = parser.parseFromString(xmlText, 'text/xml')
    
    if (doc.querySelector('parsererror')) {
      throw new Error('Invalid XML')
    }
    
    const channel = doc.querySelector('channel')
    if (!channel) {
      throw new Error('No channel found in RSS feed')
    }
    
    const feed: RSSFeed = {
      title: channel.querySelector('title')?.textContent || '',
      description: channel.querySelector('description')?.textContent || '',
      link: channel.querySelector('link')?.textContent || '',
      language: channel.querySelector('language')?.textContent || '',
      items: []
    }
    
    // Parse image
    const imageElement = channel.querySelector('image url') || channel.querySelector('itunes\\:image')
    if (imageElement) {
      feed.image = {
        url: imageElement.textContent || imageElement.getAttribute('href') || '',
        title: feed.title || '',
        link: feed.link || ''
      }
    }
    
    // Parse iTunes info
    const itunesAuthor = channel.querySelector('itunes\\:author')
    const itunesCategory = channel.querySelector('itunes\\:category')
    const itunesImage = channel.querySelector('itunes\\:image')
    
    if (itunesAuthor || itunesCategory || itunesImage) {
      feed.itunes = {
        author: itunesAuthor?.textContent || '',
        category: itunesCategory ? [itunesCategory.getAttribute('text') || ''] : [],
        image: itunesImage?.getAttribute('href') || ''
      }
    }
    
    // Parse items
    const items = channel.querySelectorAll('item')
    for (const item of items) {
      const enclosure = item.querySelector('enclosure')
      if (!enclosure) continue // Skip items without audio
      
      const rssItem: RSSItem = {
        title: item.querySelector('title')?.textContent || '',
        contentSnippet: item.querySelector('description')?.textContent || '',
        content: item.querySelector('content\\:encoded')?.textContent || item.querySelector('description')?.textContent || '',
        link: item.querySelector('link')?.textContent || '',
        pubDate: item.querySelector('pubDate')?.textContent || '',
        enclosure: {
          url: enclosure.getAttribute('url') || '',
          type: enclosure.getAttribute('type') || '',
          length: enclosure.getAttribute('length') || '0'
        }
      }
      
      // Parse iTunes episode info
      const itunesDuration = item.querySelector('itunes\\:duration')
      const itunesEpisode = item.querySelector('itunes\\:episode')
      const itunesSeason = item.querySelector('itunes\\:season')
      const itunesSummary = item.querySelector('itunes\\:summary')
      
      if (itunesDuration || itunesEpisode || itunesSeason || itunesSummary) {
        rssItem.itunes = {
          duration: itunesDuration?.textContent || '',
          episode: itunesEpisode?.textContent || '',
          season: itunesSeason?.textContent || '',
          summary: itunesSummary?.textContent || ''
        }
      }
      
      feed.items.push(rssItem)
    }
    
    return feed
  } catch (error) {
    console.error('Error parsing RSS feed:', error)
    return null
  }
}

async function syncPodcastRSS(supabase: any, podcast: any): Promise<{ newEpisodes: number, errors: string[] }> {
  const errors: string[] = []
  
  try {
    // Parse RSS feed
    const feed = await parseRSSFeed(podcast.rss_url)
    if (!feed) {
      errors.push(`Failed to parse RSS feed for ${podcast.title}`)
      return { newEpisodes: 0, errors }
    }
    
    // Update podcast metadata if needed
    const updates: any = {}
    let podcastUpdated = false
    
    if (feed.title && feed.title !== podcast.title) {
      updates.title = feed.title
      podcastUpdated = true
    }
    
    if (feed.description && feed.description !== podcast.description) {
      updates.description = feed.description
      podcastUpdated = true
    }
    
    if (feed.image?.url && feed.image.url !== podcast.cover_image_url) {
      updates.cover_image_url = feed.image.url
      podcastUpdated = true
    }

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
        .eq('id', podcast.id)
    }
    
    // Get existing episodes
    const { data: existingEpisodes } = await supabase
      .from('episodes')
      .select('title, episode_number, audio_url')
      .eq('podcast_id', podcast.id)
    
    const existingTitles = new Set(existingEpisodes?.map((ep: any) => ep.title.toLowerCase()) || [])
    const existingNumbers = new Set(existingEpisodes?.map((ep: any) => ep.episode_number) || [])
    const existingAudioUrls = new Set(existingEpisodes?.map((ep: any) => ep.audio_url) || [])
    
    // Process new episodes
    const newEpisodes = []
    let episodeCount = Math.max(...(existingEpisodes?.map((ep: any) => ep.episode_number) || [0])) + 1
    
    for (const item of feed.items) {
      if (!item.title || !item.enclosure?.url) continue
      
      const episodeTitle = item.title.toLowerCase()
      
      // Skip if episode already exists
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
        podcast_id: podcast.id,
        title: item.title,
        description: item.contentSnippet || item.content || item.itunes?.summary || '',
        audio_url: item.enclosure.url,
        script_url: '', // RSS feeds don't have script URLs
        duration: duration,
        episode_number: episodeNumber,
        season_number: item.itunes?.season ? parseInt(item.itunes.season) : 1
      })
      
      episodeCount++
    }
    
    // Insert new episodes
    if (newEpisodes.length > 0) {
      const { error: episodeError } = await supabase
        .from('episodes')
        .insert(newEpisodes)
      
      if (episodeError) {
        errors.push(`Failed to insert episodes for ${podcast.title}: ${episodeError.message}`)
        return { newEpisodes: 0, errors }
      }
    }
    
    return { newEpisodes: newEpisodes.length, errors }
    
  } catch (error) {
    errors.push(`Error syncing ${podcast.title}: ${error.message}`)
    return { newEpisodes: 0, errors }
  }
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    // Get all podcasts with RSS URLs
    const { data: podcasts, error: podcastsError } = await supabase
      .from('podcasts')
      .select('id, title, description, cover_image_url, rss_url, author_id, auto_publish_episodes')
      .not('rss_url', 'is', null)
      .eq('status', 'approved') // Only sync approved podcasts
    
    if (podcastsError) {
      throw new Error(`Failed to fetch podcasts: ${podcastsError.message}`)
    }
    
    if (!podcasts || podcasts.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No podcasts with RSS feeds found',
          results: []
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }
    
    // Process each podcast
    const results = []
    let totalNewEpisodes = 0
    const allErrors: string[] = []
    
    for (const podcast of podcasts) {
      const { newEpisodes, errors } = await syncPodcastRSS(supabase, podcast)
      
      results.push({
        podcast: {
          id: podcast.id,
          title: podcast.title
        },
        newEpisodes,
        errors: errors.length > 0 ? errors : undefined
      })
      
      totalNewEpisodes += newEpisodes
      allErrors.push(...errors)
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          podcastsProcessed: podcasts.length,
          totalNewEpisodes,
          totalErrors: allErrors.length
        },
        results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
    
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
}) 