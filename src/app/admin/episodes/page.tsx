import { requireRole } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatDate, formatDuration } from '@/lib/utils'

interface Episode {
  id: string
  title: string
  description: string
  episode_number: number
  season_number: number | null
  duration: number | null
  created_at: string
  updated_at: string
  podcast_id: string
  podcasts: {
    id: string
    title: string
    cover_image_url: string | null
    user_profiles: {
      full_name: string
      email: string
    } | null
  }
}

async function getEpisodes(): Promise<Episode[]> {
  const supabase = await createServerSupabaseClient()
  
  const { data: episodes, error } = await supabase
    .from('episodes')
    .select(`
      *,
      podcasts (
        id,
        title,
        cover_image_url,
        user_profiles!author_id (
          full_name,
          email
        )
      )
    `)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching episodes:', error)
    return []
  }
  
  return episodes || []
}

export default async function AdminEpisodesPage() {
  const user = await requireRole(['admin'])
  const episodes = await getEpisodes()
  
  // Get more detailed stats
  const stats = {
    total: episodes.length,
    totalPodcasts: new Set(episodes.map(ep => ep.podcast_id)).size,
    latestEpisodeNumber: Math.max(...episodes.map(ep => ep.episode_number), 0),
    avgEpisodesPerPodcast: episodes.length > 0 ? Math.round(episodes.length / new Set(episodes.map(ep => ep.podcast_id)).size * 10) / 10 : 0
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">Episode Management</h1>
              <p className="mt-2 text-gray-600">
                View and manage episodes from all podcasts
              </p>
            </div>
            <Link href="/admin">
              <Button 
                variant="outline" 
                size="lg" 
                rounded="full"
              >
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Enhanced Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center shadow-sm">
                <div className="w-6 h-6 bg-white rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Episodes in Database</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shadow-sm">
                <div className="w-6 h-6 bg-white rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Podcasts with Episodes</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalPodcasts}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center shadow-sm">
                <div className="w-6 h-6 bg-white rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Latest Episode #</p>
                <p className="text-3xl font-bold text-gray-900">{stats.latestEpisodeNumber}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center shadow-sm">
                <div className="w-6 h-6 bg-white rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg per Podcast</p>
                <p className="text-3xl font-bold text-gray-900">{stats.avgEpisodesPerPodcast}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Episodes Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">All Episodes</h2>
            <p className="text-sm text-gray-600 mt-1">
              {stats.total} episodes across {stats.totalPodcasts} podcasts
            </p>
          </div>
          
          {episodes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Episode
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Podcast
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {episodes.map((episode) => (
                    <tr key={episode.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-medium text-xs flex-shrink-0">
                            {episode.episode_number}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold text-gray-900 line-clamp-1">
                              {episode.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              Episode {episode.episode_number}
                              {episode.season_number && episode.season_number > 1 && (
                                <span> • Season {episode.season_number}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          {episode.podcasts.cover_image_url ? (
                            <img
                              src={episode.podcasts.cover_image_url}
                              alt={episode.podcasts.title}
                              className="w-10 h-10 rounded-lg object-cover shadow-sm flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                              <span className="text-white font-bold text-xs">
                                {episode.podcasts.title.substring(0, 2).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-gray-900 line-clamp-1">
                              {episode.podcasts.title}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {episode.podcasts.user_profiles?.full_name || 'Unknown Author'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {episode.podcasts.user_profiles?.email || 'No email'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {formatDuration(episode.duration)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(episode.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/admin/episodes/${episode.id}/edit`}>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            rounded="full"
                          >
                            Edit
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-6">🎙️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">No Episodes Found</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">No episodes have been created yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 