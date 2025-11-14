import { requireRole } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import EpisodeActions from '@/components/author/episode-actions'
import EpisodesLayout from '@/components/author/episodes-layout'
import TranslateAllEpisodes from '@/components/author/translate-all-episodes'

interface Episode {
  id: string
  title: string
  description: string
  title_english: string | null
  description_english: string | null
  audio_url: string
  script_url: string
  duration: number | null
  episode_number: number
  season_number: number | null
  created_at: string
  updated_at: string
}

interface Podcast {
  id: string
  title: string
  description: string
  author_id: string
  cover_image_url: string | null
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  episodes: Episode[]
  user_profiles?: {
    full_name: string
    email: string
  }
}

async function getPodcastWithEpisodes(podcastId: string): Promise<Podcast | null> {
  const supabase = await createServerSupabaseClient()
  
  // Admin can access any podcast
  const { data: podcast, error } = await supabase
    .from('podcasts')
    .select(`
      *,
      user_profiles (
        full_name,
        email
      ),
      episodes (
        id,
        title,
        description,
        title_english,
        description_english,
        audio_url,
        script_url,
        duration,
        episode_number,
        season_number,
        created_at,
        updated_at
      )
    `)
    .eq('id', podcastId)
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

export default async function AdminEpisodesPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ id: string }>
  searchParams: Promise<{ selected?: string }> 
}) {
  await requireRole(['admin'])
  
  // Await params in Next.js 15
  const { id } = await params
  const { selected } = await searchParams
  
  const podcast = await getPodcastWithEpisodes(id)

  if (!podcast) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Podcast Not Found</h1>
          <p className="text-gray-600 mb-6">The podcast you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.</p>
          <Link href="/admin/podcasts">
            <Button className="bg-red-600 hover:bg-red-700 text-white rounded-full">Back to Podcasts</Button>
          </Link>
        </div>
      </div>
    )
  }

  const episodes = podcast.episodes || []

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Episodes</h1>
              <p className="mt-2 text-base sm:text-lg text-gray-600 break-words">{podcast.title}</p>
              <p className="text-xs sm:text-sm text-gray-500">{episodes.length} episodes</p>
              {podcast.user_profiles && (
                <p className="text-xs sm:text-sm text-gray-500 mt-1 break-words">
                  Author: {podcast.user_profiles.full_name} ({podcast.user_profiles.email})
                </p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-x-4 w-full sm:w-auto">
              {episodes.length > 0 && (
                <div className="w-full sm:w-auto">
                  <TranslateAllEpisodes podcastId={id} episodes={episodes} />
                </div>
              )}
              <Link href={`/admin/podcasts/${id}/episodes/new`} className="w-full sm:w-auto">
                <Button className="bg-red-600 hover:bg-red-700 text-white rounded-full w-full sm:w-auto text-sm sm:text-base">
                  Add Episode
                </Button>
              </Link>
              <Link href={`/admin/podcasts/${id}/edit`} className="w-full sm:w-auto">
                <Button variant="outline" className="rounded-full border-gray-300 text-gray-700 hover:bg-gray-50 w-full sm:w-auto text-sm sm:text-base">
                  Back to Podcast
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column - Episodes List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-modern-lg shadow-modern border border-gray-200 overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">All Episodes</h2>
              </div>

              <div className="divide-y divide-gray-200">
                {episodes.length === 0 ? (
                  <div className="p-8 sm:p-12 text-center">
                    <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🎧</div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No episodes yet</h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">This podcast doesn&apos;t have any episodes yet.</p>
                    <Link href={`/admin/podcasts/${id}/episodes/new`} className="inline-block w-full sm:w-auto">
                      <Button className="bg-red-600 hover:bg-red-700 text-white rounded-full w-full sm:w-auto text-sm sm:text-base">
                        Create First Episode
                      </Button>
                    </Link>
                  </div>
                ) : (
                  episodes.map((episode) => (
                    <div 
                      key={episode.id} 
                      className={`p-4 sm:p-6 hover:bg-gray-50 transition-colors ${
                        selected === episode.id ? 'bg-gray-50 border-l-4 border-red-500' : ''
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                            <span className="inline-flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 bg-red-600 text-white text-xs sm:text-sm font-medium rounded-full">
                              #{episode.episode_number}
                            </span>
                            {episode.season_number && (
                              <span className="inline-flex items-center px-2 sm:px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                Season {episode.season_number}
                              </span>
                            )}
                          </div>
                          
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 break-words">
                            {episode.title_english || episode.title}
                          </h3>
                          
                          <p className="text-sm sm:text-base text-gray-600 mb-2 sm:mb-3 line-clamp-2 break-words">
                            {episode.description_english || episode.description}
                          </p>
                          
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                            <span>Duration: {formatDuration(episode.duration)}</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="w-full sm:w-auto">Created: {formatDate(episode.created_at)}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:ml-6 sm:space-x-2">
                          <Link 
                            href={`/admin/podcasts/${id}/episodes?selected=${episode.id}`}
                            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-full transition-colors text-center ${
                              selected === episode.id 
                                ? 'bg-red-600 text-white' 
                                : 'bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-700'
                            }`}
                          >
                            {selected === episode.id ? 'Selected' : 'Select'}
                          </Link>
                          <Link href={`/admin/podcasts/${id}/episodes/${episode.id}/edit`} className="w-full sm:w-auto">
                            <Button variant="outline" size="sm" className="rounded-full w-full sm:w-auto text-xs sm:text-sm">
                              Edit
                            </Button>
                          </Link>
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
            <div className="lg:sticky lg:top-2 lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto">
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