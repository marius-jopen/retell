import { requireRole } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import PodcastActions from '@/components/admin/podcast-actions'
import Link from 'next/link'
import { formatDate, formatDuration } from '@/lib/utils'

interface Episode {
  id: string
  title: string
  description: string
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
  category: string
  language: string
  country: string
  rss_url: string | null
  cover_image_url: string | null
  author_id: string
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  auto_publish_episodes: boolean
  created_at: string
  updated_at: string
  episodes: Episode[]
  user_profiles?: {
    full_name: string
    email: string
  }
}

async function getPodcastWithEpisodes(podcastId: string): Promise<Podcast | null> {
  const supabase = await createServerSupabaseClient()
  
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

export default async function AdminPodcastViewPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole(['admin'])
  
  // Await params in Next.js 15
  const { id } = await params
  
  const podcast = await getPodcastWithEpisodes(id)

  if (!podcast) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <div className="text-6xl mb-6">🎙️</div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-3">Podcast Not Found</h1>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">The podcast you're looking for doesn't exist.</p>
          <Link href="/admin/podcasts">
            <Button 
              variant="primary" 
              size="lg" 
              rounded="full"
              className="font-semibold"
            >
              Back to Podcasts
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const episodes = podcast.episodes || []
  const stats = {
    total: episodes.length,
    totalDuration: episodes.reduce((sum, ep) => sum + (ep.duration || 0), 0)
  }

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800 border-gray-200',
    pending: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    approved: 'bg-green-50 text-green-800 border-green-200',
    rejected: 'bg-red-50 text-red-800 border-red-200',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-6">
              {/* Podcast Cover Image */}
              <div className="flex-shrink-0">
                {podcast.cover_image_url ? (
                  <img
                    src={podcast.cover_image_url}
                    alt={podcast.title}
                    className="w-24 h-24 rounded-2xl object-cover shadow-lg border border-gray-200"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-2xl">
                      {podcast.title.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Title and Description */}
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h1 className="text-3xl font-bold text-gray-900">{podcast.title}</h1>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize border ${statusColors[podcast.status]}`}>
                    {podcast.status}
                  </span>
                </div>
                <p className="text-gray-600 mb-4 leading-relaxed max-w-3xl">
                  {podcast.description}
                </p>
                {podcast.user_profiles && (
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="font-medium text-gray-700">Author:</span>
                    <span className="text-gray-600">{podcast.user_profiles.full_name}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500">{podcast.user_profiles.email}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col space-y-3">
              {/* Admin Actions for Status Changes */}
              <PodcastActions 
                podcastId={podcast.id}
                podcastTitle={podcast.title}
                status={podcast.status}
                size="md"
                className="justify-end"
              />
              
              {/* Management Actions */}
              <div className="flex space-x-3">
                <Link href={`/admin/podcasts/${podcast.id}/edit`}>
                  <Button 
                    variant="primary" 
                    size="lg" 
                    rounded="full"
                    className="font-semibold"
                  >
                    Edit Podcast
                  </Button>
                </Link>
                <Link href="/admin/podcasts">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    rounded="full"
                  >
                    Back to Podcasts
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Podcast Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Podcast Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Podcast Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Category</label>
                  <p className="text-gray-900 font-medium mt-1">{podcast.category}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Language</label>
                  <p className="text-gray-900 font-medium mt-1">{podcast.language.toUpperCase()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Country</label>
                  <p className="text-gray-900 font-medium mt-1">{podcast.country || 'Unknown'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Auto-Publish Episodes</label>
                  <p className="text-gray-900 font-medium mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      podcast.auto_publish_episodes 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {podcast.auto_publish_episodes ? 'Yes' : 'No'}
                    </span>
                  </p>
                </div>
                {podcast.rss_url && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">RSS Feed</label>
                    <p className="text-gray-900 text-sm break-all mt-1 bg-gray-50 p-3 rounded-lg border">
                      {podcast.rss_url}
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Created</label>
                  <p className="text-gray-900 font-medium mt-1">{formatDate(podcast.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Last Updated</label>
                  <p className="text-gray-900 font-medium mt-1">{formatDate(podcast.updated_at)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center shadow-sm">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Episodes</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-sm">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Duration</p>
                  <p className="text-3xl font-bold text-gray-900">{Math.floor(stats.totalDuration / 60)}m</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Episodes List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Episodes</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {stats.total} episodes • {Math.floor(stats.totalDuration / 60)} minutes total
                </p>
              </div>
              <Link href={`/admin/podcasts/${podcast.id}/episodes`}>
                <Button 
                  variant="outline" 
                  size="sm" 
                  rounded="full"
                >
                  Manage Episodes
                </Button>
              </Link>
            </div>
          </div>
          
          {episodes.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-6">🎙️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">No episodes yet</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                This podcast doesn't have any episodes yet.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {episodes
                .sort((a, b) => b.episode_number - a.episode_number)
                .slice(0, 10) // Show only first 10 episodes on overview
                .map((episode) => (
                  <div key={episode.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        {/* Episode Number Badge */}
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                            {episode.episode_number}
                          </div>
                        </div>
                        
                        {/* Episode Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="text-sm font-medium text-gray-500">
                              Episode {episode.episode_number}
                              {episode.season_number && episode.season_number > 1 && (
                                <span> • Season {episode.season_number}</span>
                              )}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-snug">{episode.title}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-3">{episode.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="bg-gray-100 px-2 py-1 rounded-full">
                              {formatDuration(episode.duration)}
                            </span>
                            <span>•</span>
                            <span>{formatDate(episode.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              
              {episodes.length > 10 && (
                <div className="p-6 text-center border-t border-gray-200 bg-gray-50">
                  <p className="text-sm text-gray-600 mb-4">
                    Showing 10 of {episodes.length} episodes
                  </p>
                  <Link href={`/admin/podcasts/${podcast.id}/episodes`}>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      rounded="full"
                    >
                      View All Episodes
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 