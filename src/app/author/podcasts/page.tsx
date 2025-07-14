import { requireRole } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
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
    episode_number: number
    status: 'draft' | 'pending' | 'approved' | 'rejected'
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
        episode_number,
        status,
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
    draft: podcasts.filter(p => p.status === 'draft').length,
    pending: podcasts.filter(p => p.status === 'pending').length,
    approved: podcasts.filter(p => p.status === 'approved').length,
    totalEpisodes: podcasts.reduce((sum, p) => sum + p.episodes.length, 0)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                My Podcasts
              </h1>
              <p className="mt-2 text-gray-600">
                Manage your podcast content and episodes
              </p>
            </div>
            <div className="flex space-x-2">
              <Link href="/author/upload">
                <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                  Create New Podcast
                </Button>
              </Link>
              <Link href="/author">
                <Button variant="outline">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Podcasts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-500 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Draft</p>
                <p className="text-2xl font-bold text-gray-900">{stats.draft}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Episodes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEpisodes}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Podcast List */}
        <div className="space-y-6">
          {podcasts.length === 0 ? (
            <div className="bg-white rounded-lg shadow text-center py-16">
              <div className="text-6xl mb-4">🎙️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No podcasts yet</h3>
              <p className="text-gray-600 mb-8">
                Get started by creating your first podcast and share your voice with the world.
              </p>
              <Link href="/author/upload">
                <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                  Create Your First Podcast
                </Button>
              </Link>
            </div>
          ) : (
            podcasts.map((podcast) => (
              <div key={podcast.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-300">
                {/* Main Content */}
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {podcast.cover_image_url ? (
                        <img 
                          src={podcast.cover_image_url} 
                          alt={podcast.title}
                          className="h-24 w-24 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-24 w-24 rounded-lg bg-gray-300 flex items-center justify-center">
                          <span className="text-gray-600 font-bold text-xl">
                            {podcast.title.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-xl font-semibold text-gray-900">{podcast.title}</h3>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800`}>
                            Published
                          </span>
                        </div>
                      </div>
                      
                      <p className="mt-2 text-gray-600 line-clamp-2">
                        {podcast.description}
                      </p>
                      
                      {/* Metadata */}
                      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <span className="capitalize">{podcast.category}</span>
                        <span>•</span>
                        <span>{podcast.language.toUpperCase()}</span>
                        <span>•</span>
                        <span>{podcast.country}</span>
                        <span>•</span>
                        <span>{podcast.episodes.length} episodes</span>
                        <span>•</span>
                        <span>Created {formatDate(podcast.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Link href={`/podcast/${podcast.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                      <Link href={`/author/podcasts/${podcast.id}/edit`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                      <Link href={`/author/podcasts/${podcast.id}/episodes`}>
                        <Button variant="outline" size="sm">
                          Episodes
                        </Button>
                      </Link>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {podcast.rss_url && (
                        <RSSUpdate 
                          podcastId={podcast.id}
                          podcastTitle={podcast.title}
                          hasRssUrl={!!podcast.rss_url}
                        />
                      )}
                      <AuthorPodcastActions
                        podcastId={podcast.id}
                        podcastTitle={podcast.title}
                        status={podcast.status}
                        authorId={user.id}
                      />
                    </div>
                  </div>
                </div>

                {/* Episodes Preview */}
                {podcast.episodes.length > 0 && (
                  <div className="bg-gray-50 border-t px-6 py-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-semibold text-gray-900">Recent Episodes</h4>
                      <Link href={`/author/podcasts/${podcast.id}/episodes`}>
                        <Button variant="ghost" size="sm" className="text-xs">
                          View All {podcast.episodes.length} →
                        </Button>
                      </Link>
                    </div>
                    
                    <div className="space-y-2">
                      {podcast.episodes.slice(0, 3).map((episode) => (
                        <div key={episode.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-500 text-white text-xs font-medium">
                                #{episode.episode_number}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{episode.title}</p>
                              <p className="text-xs text-gray-500">{formatDate(episode.created_at)}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Published
                            </span>
                            <Link href={`/author/podcasts/${podcast.id}/episodes/${episode.id}/edit`}>
                              <Button variant="ghost" size="sm" className="text-xs">
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
