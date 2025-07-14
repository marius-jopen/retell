import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import Parser from 'rss-parser'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only authors can parse RSS feeds
    if (user.profile.role !== 'author') {
      return NextResponse.json({ error: 'Only authors can parse RSS feeds' }, { status: 403 })
    }

    const { rssUrl } = await request.json()
    
    if (!rssUrl) {
      return NextResponse.json({ error: 'RSS URL is required' }, { status: 400 })
    }

    const parser = new Parser()
    
    // Parse RSS feed
    try {
      const feed = await parser.parseURL(rssUrl)
      
      // Process feed data for preview
      const podcastData = {
        title: feed.title || 'Untitled Podcast',
        description: feed.description || feed.itunes?.summary || '',
        image: feed.image?.url || feed.itunes?.image || null,
        category: feed.itunes?.category?.[0] || 'General',
        language: feed.language || 'en',
        author: feed.itunes?.author || '',
        episodeCount: feed.items.length
      }

      const episodes = feed.items.slice(0, 5).map((item, index) => ({
        title: item.title || `Episode ${index + 1}`,
        description: item.contentSnippet || item.content || item.itunes?.summary || '',
        duration: item.itunes?.duration || null,
        episodeNumber: item.itunes?.episode || index + 1,
        season: item.itunes?.season || 1,
        audioUrl: item.enclosure?.url || null,
        pubDate: item.pubDate || null
      }))

      return NextResponse.json({
        success: true,
        podcast: podcastData,
        episodes: episodes,
        totalEpisodes: feed.items.length
      })

    } catch (error) {
      console.error('RSS parsing error:', error)
      return NextResponse.json({ error: 'Failed to parse RSS feed. Please check the URL and try again.' }, { status: 400 })
    }

  } catch (error) {
    console.error('RSS parse error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 