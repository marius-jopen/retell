import { requireRole } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import EpisodeActions from '@/components/author/episode-actions'
import EpisodesLayout from '@/components/author/episodes-layout'

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

export default async function EpisodesPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ id: string }>
  searchParams: Promise<{ selected?: string }> 
}) {
  const user = await requireRole(['author'])
  
  // Await params in Next.js 15
  const { id } = await params
  const { selected } = await searchParams
  
  const podcast = await getPodcastWithEpisodes(id, user.id)

  if (!podcast) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Podcast Not Found</h1>
          <p className="text-gray-600 mb-6">The podcast you're looking for doesn't exist or you don't have permission to view it.</p>
          <Link href="/author/podcasts">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full">Back to Podcasts</Button>
          </Link>
        </div>
      </div>
    )
  }

  const episodes = podcast.episodes || []

  return (
    <div className="min-h-screen bg-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Episodes</h1>
              <p className="mt-2 text-lg text-gray-600">{podcast.title}</p>
              <p className="text-sm text-gray-500">{episodes.length} episodes</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href={`/author/podcasts/${id}/episodes/new`}>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full">
                  Add Episode
                </Button>
              </Link>
              <Link href={`/author/podcasts/${id}/edit`}>
                <Button variant="outline" className="rounded-full border-orange-200 text-orange-600 hover:bg-orange-50">
                  Back to Podcast
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Episodes List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-modern-lg shadow-modern border border-orange-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">All Episodes</h2>
              </div>

              <div className="divide-y divide-gray-200">
                {episodes.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="text-4xl mb-4">🎧</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No episodes yet</h3>
                    <p className="text-gray-600 mb-6">Create your first episode to get started</p>
                    <Link href={`/author/podcasts/${id}/episodes/new`}>
                      <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full">
                        Create First Episode
                      </Button>
                    </Link>
                  </div>
                ) : (
                  episodes.map((episode) => (
                    <div 
                      key={episode.id} 
                      className={`p-6 hover:bg-orange-50 transition-colors ${
                        selected === episode.id ? 'bg-orange-50 border-l-4 border-orange-500' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-3">
                            <span className="inline-flex items-center justify-center h-8 w-8 bg-orange-600 text-white text-sm font-medium rounded-full">
                              #{episode.episode_number}
                            </span>
                            <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${
                              episode.status === 'approved' ? 'bg-green-100 text-green-800' :
                              episode.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              episode.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {episode.status}
                            </span>
                          </div>
                          
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {episode.title}
                          </h3>
                          
                          <p className="text-gray-600 mb-3 line-clamp-2">
                            {episode.description}
                          </p>
                          
                          <div className="flex items-center text-sm text-gray-500 space-x-4">
                            <span>Duration: {formatDuration(episode.duration)}</span>
                            <span>Created: {formatDate(episode.created_at)}</span>
                          </div>
                        </div>
                        
                        <div className="ml-6 flex items-center space-x-2">
                          <Link 
                            href={`/author/podcasts/${id}/episodes?selected=${episode.id}`}
                            className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                              selected === episode.id 
                                ? 'bg-orange-500 text-white' 
                                : 'bg-gray-100 text-gray-700 hover:bg-orange-100 hover:text-orange-700'
                            }`}
                          >
                            {selected === episode.id ? 'Selected' : 'Select'}
                          </Link>
                          <EpisodeActions
                            episodeId={episode.id}
                            episodeTitle={episode.title}
                            podcastId={podcast.id}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Episode Details (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky-sidebar">
              <EpisodesLayout 
                podcastId={id}
                episodes={episodes}
                selectedEpisodeId={selected}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 