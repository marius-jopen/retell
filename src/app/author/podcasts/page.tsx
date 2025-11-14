import { requireRole } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { StatsCard } from '@/components/ui/stats-card'
import Link from 'next/link'
import AuthorPodcastActions from '@/components/author/podcast-actions'
import RSSUpdate from '@/components/rss/rss-update'
import EpisodeActions from '@/components/author/episode-actions'

interface Podcast {
  id: string
  title: string
  description: string
  cover_image_url: string | null
  category: string
  language: string
  country: string
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  rss_url: string | null
  created_at: string
  updated_at: string
  episodes: Array<{
    id: string
    title: string
    title_english: string | null
    episode_number: number
    created_at: string
  }>
}

async function getAuthorPodcasts(authorId: string) {
  const supabase = await createServerSupabaseClient()
  
  const { data: podcasts, error } = await supabase
    .from('podcasts')
    .select(`
      *,
      episodes (
        id,
        title,
        title_english,
        episode_number,
        created_at
      )
    `)
    .eq('author_id', authorId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching podcasts:', error)
    return []
  }
  
  return podcasts as Podcast[]
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export default async function AuthorPodcastsPage() {
  const user = await requireRole(['author'])
  const podcasts = await getAuthorPodcasts(user.id)
  
  const stats = {
    total: podcasts.length,
    totalEpisodes: podcasts.reduce((sum, p) => sum + p.episodes.length, 0)
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
                My Podcasts
              </h1>
              <p className="mt-2 text-sm sm:text-base text-gray-600">
                Manage your podcast content and episodes
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:space-x-3 w-full sm:w-auto">
              <Link href="/author/upload" className="w-full sm:w-auto">
                <Button 
                  variant="primary" 
                  size="lg" 
                  rounded="full"
                  className="font-semibold w-full sm:w-auto text-sm sm:text-base"
                >
                  Create New Podcast
                </Button>
              </Link>
              <Link href="/author" className="w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  size="lg" 
                  rounded="full"
                  className="w-full sm:w-auto text-sm sm:text-base"
                >
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatsCard
            title="Total Podcasts"
            value={stats.total}
            icon="🎙️"
            color="red"
          />
          <StatsCard
            title="Total Episodes"
            value={stats.totalEpisodes}
            icon="🎵"
            color="red"
          />
        </div>

        {/* Podcast List */}
        <div className="space-y-4 sm:space-y-6">
          {podcasts.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 text-center py-12 sm:py-16 px-4">
              <div className="text-5xl sm:text-6xl mb-4 sm:mb-6">🎙️</div>
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2 sm:mb-3">No podcasts yet</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto">
                Get started by creating your first podcast and share your voice with the world.
              </p>
              <Link href="/author/upload" className="inline-block w-full sm:w-auto">
                <Button 
                  variant="primary" 
                  size="lg" 
                  rounded="full"
                  className="font-semibold w-full sm:w-auto text-sm sm:text-base"
                >
                  Create Your First Podcast
                </Button>
              </Link>
            </div>
          ) : (
            podcasts.map((podcast) => (
              <div key={podcast.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden">
                {/* Main Content */}
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    <div className="flex-shrink-0">
                      {podcast.cover_image_url ? (
                        <img 
                          src={podcast.cover_image_url} 
                          alt={podcast.title}
                          className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover shadow-sm"
                        />
                      ) : (
                        <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-sm">
                          <span className="text-white font-bold text-base sm:text-lg">
                            {podcast.title.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 break-words">{podcast.title}</h3>
                          <p className="text-sm sm:text-base text-gray-600 line-clamp-2 leading-relaxed break-words">
                            {podcast.description}
                          </p>
                        </div>
                      </div>
                      
                      {/* Metadata */}
                      <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500">
                        <span className="capitalize font-medium">{podcast.category}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="font-medium">{podcast.language.toUpperCase()}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>{podcast.episodes.length} episodes</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="w-full sm:w-auto">Created {formatDate(podcast.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/podcast/${podcast.id}`} className="flex-1 sm:flex-none min-w-0">
                        <Button variant="outline" size="sm" rounded="full" className="w-full sm:w-auto text-xs sm:text-sm">
                          View
                        </Button>
                      </Link>
                      <Link href={`/author/podcasts/${podcast.id}/edit`} className="flex-1 sm:flex-none min-w-0">
                        <Button variant="outline" size="sm" rounded="full" className="w-full sm:w-auto text-xs sm:text-sm">
                          Edit
                        </Button>
                      </Link>
                      <Link href={`/author/podcasts/${podcast.id}/episodes`} className="flex-1 sm:flex-none min-w-0">
                        <Button variant="outline" size="sm" rounded="full" className="w-full sm:w-auto text-xs sm:text-sm">
                          Episodes
                        </Button>
                      </Link>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2">
                      {podcast.rss_url && (
                        <div className="flex-1 sm:flex-none min-w-0">
                          <RSSUpdate 
                            podcastId={podcast.id}
                            podcastTitle={podcast.title}
                            hasRssUrl={!!podcast.rss_url}
                          />
                        </div>
                      )}
                      <div className="flex-1 sm:flex-none min-w-0">
                        <AuthorPodcastActions
                          podcastId={podcast.id}
                          podcastTitle={podcast.title}
                          status={podcast.status}
                          authorId={user.id}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Episodes Preview */}
                {podcast.episodes.length > 0 && (
                  <div className="bg-gray-50 border-t border-gray-100 px-4 sm:px-6 py-4 sm:py-5 rounded-b-2xl">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
                      <h4 className="text-xs sm:text-sm font-semibold text-gray-900">Recent Episodes</h4>
                      <Link href={`/author/podcasts/${podcast.id}/episodes`} className="self-start sm:self-auto">
                        <Button variant="ghost" size="sm" className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 p-1 sm:p-2">
                          View All {podcast.episodes.length} →
                        </Button>
                      </Link>
                    </div>
                    
                    <div className="space-y-2 sm:space-y-3">
                      {podcast.episodes.slice(0, 3).map((episode) => (
                        <div key={episode.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                            <div className="flex-shrink-0">
                              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-medium text-xs">
                                {episode.episode_number}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs sm:text-sm font-medium text-gray-900 break-words">{episode.title_english || episode.title}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{formatDate(episode.created_at)}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 self-start sm:self-auto">
                            <Link href={`/author/podcasts/${podcast.id}/episodes/${episode.id}/edit`}>
                              <Button variant="outline" size="sm" className="text-xs text-gray-600 hover:text-red-600 hover:bg-red-50 border-gray-200 hover:border-red-200 px-2 sm:px-3">
                                Edit
                              </Button>
                            </Link>
                            <EpisodeActions
                              episodeId={episode.id}
                              episodeTitle={episode.title_english || episode.title}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
