import { createServerSupabaseClient } from '@/lib/supabase'
import { requireAuthor } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

export default async function AuthorDashboard() {
  const user = await requireAuthor()
  const supabase = await createServerSupabaseClient()

  // Get author's content stats
  const [
    { count: totalPodcasts },
    { count: totalEpisodes },
    { count: approvedPodcasts },
    { count: pendingPodcasts },
    { count: draftPodcasts },
  ] = await Promise.all([
    supabase.from('podcasts').select('id', { count: 'exact', head: true }).eq('author_id', user.id),
    supabase.from('episodes').select('id', { count: 'exact', head: true }).eq('podcast_id', user.id),
    supabase.from('podcasts').select('id', { count: 'exact', head: true }).eq('author_id', user.id).eq('status', 'approved'),
    supabase.from('podcasts').select('id', { count: 'exact', head: true }).eq('author_id', user.id).eq('status', 'pending'),
    supabase.from('podcasts').select('id', { count: 'exact', head: true }).eq('author_id', user.id).eq('status', 'draft'),
  ])

  // Get author's recent podcasts
  const { data: recentPodcasts } = await supabase
    .from('podcasts')
    .select(`
      id,
      title,
      status,
      created_at,
      category,
      language,
      episodes (
        id,
        title,
        status
      )
    `)
    .eq('author_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Get recent episodes for author's content
  const { data: recentEpisodes } = await supabase
    .from('episodes')
    .select(`
      id,
      title,
      episode_number,
      created_at,
      podcasts!episodes_podcast_id_fkey (
        id,
        title,
        author_id
      )
    `)
    .eq('podcasts.author_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const stats = [
    {
      title: 'Total Podcasts',
      value: totalPodcasts || 0,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Episodes',
      value: totalEpisodes || 0,
      color: 'bg-green-500',
    },
    {
      title: 'Approved',
      value: approvedPodcasts || 0,
      color: 'bg-green-500',
    },
    {
      title: 'Pending Review',
      value: pendingPodcasts || 0,
      color: 'bg-yellow-500',
    },
    {
      title: 'Draft',
      value: draftPodcasts || 0,
      color: 'bg-gray-500',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Author Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user.profile.full_name}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.title} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link href="/author/upload">
              <div className="bg-white border border-gray-200 p-6 text-center hover:bg-gray-50 transition-colors">
                <div className="text-3xl mb-3">🎤</div>
                <div className="text-sm font-medium text-gray-900">Create New Podcast</div>
              </div>
            </Link>
            <Link href="/author/podcasts">
              <div className="bg-white border border-gray-200 p-6 text-center hover:bg-gray-50 transition-colors">
                <div className="text-3xl mb-3">📻</div>
                <div className="text-sm font-medium text-gray-900">My Podcasts</div>
              </div>
            </Link>
            <Link href="/catalog">
              <div className="bg-white border border-gray-200 p-6 text-center hover:bg-gray-50 transition-colors">
                <div className="text-3xl mb-3">🎧</div>
                <div className="text-sm font-medium text-gray-900">Browse Catalog</div>
              </div>
            </Link>
            <Link href="/author/analytics">
              <div className="bg-white border border-gray-200 p-6 text-center hover:bg-gray-50 transition-colors">
                <div className="text-3xl mb-3">📊</div>
                <div className="text-sm font-medium text-gray-900">Analytics</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Content and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Podcasts */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Your Recent Podcasts</h2>
            </div>
            <div className="p-6 space-y-4">
              {recentPodcasts && recentPodcasts.length > 0 ? (
                recentPodcasts.map((podcast) => (
                  <div key={podcast.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900">{podcast.title}</h3>
                      <p className="text-sm text-gray-600">
                        {podcast.category} • {podcast.language.toUpperCase()} • {podcast.episodes?.length || 0} episodes
                      </p>
                      <p className="text-xs text-gray-500">Created {formatDate(podcast.created_at)}</p>
                    </div>
                    <div className="ml-4 flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        podcast.status === 'approved' ? 'bg-green-100 text-green-800' :
                        podcast.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        podcast.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {podcast.status}
                      </span>
                      <Link href={`/author/podcasts/${podcast.id}/edit`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to start creating?</h3>
                  <p className="text-gray-600 mb-6">Upload your first podcast and share your voice with the world!</p>
                  <Link href="/author/upload">
                    <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                      Create Your First Podcast
                    </Button>
                  </Link>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200">
              <Link href="/author/podcasts">
                <Button variant="outline" className="w-full">
                  View All Podcasts
                </Button>
              </Link>
            </div>
          </div>

          {/* Recent Episodes */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Recent Episodes</h2>
            </div>
            <div className="p-6 space-y-4">
              {recentEpisodes && recentEpisodes.length > 0 ? (
                recentEpisodes.map((episode) => (
                  <div key={episode.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {episode.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Episode {episode.episode_number} • {(episode.podcasts as any)?.title || 'Unknown Podcast'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Created {formatDate(episode.created_at)}
                      </p>
                    </div>
                    <div className="ml-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Published
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No episodes yet!</h3>
                  <p className="text-gray-600 mb-6">
                    {(totalPodcasts || 0) > 0 
                      ? "Add some episodes to your podcasts to get started!"
                      : "Create your first podcast, then add episodes to it!"
                    }
                  </p>
                  <Link href={(totalPodcasts || 0) > 0 ? "/author/podcasts" : "/author/upload"}>
                    <Button className="bg-green-500 hover:bg-green-600 text-white">
                      {(totalPodcasts || 0) > 0 ? "Add Episodes" : "Create Podcast"}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200">
              <Link href="/author/podcasts">
                <Button variant="outline" className="w-full">
                  View All Episodes
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}