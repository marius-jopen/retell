import { requireRole } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import EpisodeActions from '@/components/author/episode-actions'

interface Episode {
  id: string
  title: string
  description: string
  audio_url: string
  script_url: string
  duration: number | null
  episode_number: number
  season_number: number | null
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
}

interface Podcast {
  id: string
  title: string
  description: string
  author_id: string
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  episodes: Episode[]
}

async function getPodcastWithEpisodes(podcastId: string, authorId: string): Promise<Podcast | null> {
  const supabase = await createServerSupabaseClient()
  
  const { data: podcast, error } = await supabase
    .from('podcasts')
    .select(`
      *,
      episodes (
        id,
        title,
        description,
        audio_url,
        script_url,
        duration,
        episode_number,
        season_number,
        status,
        created_at,
        updated_at
      )
    `)
    .eq('id', podcastId)
    .eq('author_id', authorId)
    .single()

  if (error) {
    console.error('Error fetching podcast:', error)
    return null
  }

  return podcast as Podcast
}

function formatDuration(duration: number | null): string {
  if (!duration) return 'Unknown'
  
  const hours = Math.floor(duration / 3600)
  const minutes = Math.floor((duration % 3600) / 60)
  const seconds = duration % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
}

export default async function EpisodesPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole(['author'])
  
  // Await params in Next.js 15
  const { id } = await params
  
  const podcast = await getPodcastWithEpisodes(id, user.id)

  if (!podcast) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Podcast Not Found</h1>
          <p className="mt-2 text-gray-600">The podcast you're looking for doesn't exist or you don't have permission to view it.</p>
          <Link href="/author/podcasts">
            <Button className="mt-4">Back to Podcasts</Button>
          </Link>
        </div>
      </div>
    )
  }

  const episodes = podcast.episodes || []
  const stats = {
    total: episodes.length,
    published: episodes.length,
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Episodes</h1>
            <p className="mt-2 text-lg text-gray-600">
              Manage episodes for "{podcast.title}"
            </p>
          </div>
          <div className="flex space-x-2">
            <Link href={`/author/podcasts/${podcast.id}/episodes/new`}>
              <Button>Add Episode</Button>
            </Link>
            <Link href="/author/podcasts">
              <Button variant="outline">Back to Podcasts</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-lg shadow px-6 py-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-500">Total:</span>
              <span className="text-lg font-bold text-blue-600">{stats.total}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-500">Published:</span>
              <span className="text-lg font-bold text-green-600">{stats.published}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Episodes List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Episodes</h2>
        </div>
        
        {episodes.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 616 0v6a3 3 0 01-3 3z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No episodes yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first episode.
            </p>
            <div className="mt-6">
              <Link href={`/author/podcasts/${podcast.id}/episodes/new`}>
                <Button>Create Your First Episode</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {episodes
              .sort((a, b) => b.episode_number - a.episode_number)
              .map((episode) => (
                <div key={episode.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-500">
                            Episode {episode.episode_number}
                            {episode.season_number && episode.season_number > 1 && (
                              <span> • Season {episode.season_number}</span>
                            )}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Published
                          </span>
                        </div>
                      </div>
                      <h3 className="mt-2 text-lg font-medium text-gray-900">{episode.title}</h3>
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">{episode.description}</p>
                      <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
                        <span>Duration: {formatDuration(episode.duration)}</span>
                        <span>•</span>
                        <span>Created: {formatDate(episode.created_at)}</span>
                        <span>•</span>
                        <span>Updated: {formatDate(episode.updated_at)}</span>
                      </div>
                    </div>
                    <div className="ml-4 flex items-center space-x-2">
                      <Link href={`/author/podcasts/${podcast.id}/episodes/${episode.id}/edit`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                      <EpisodeActions
                        episodeId={episode.id}
                        episodeTitle={episode.title}
                        podcastId={podcast.id}
                      />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
} 