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
  ] = await Promise.all([
    supabase.from('podcasts').select('id', { count: 'exact', head: true }).eq('author_id', user.id),
    supabase.from('episodes').select('id', { count: 'exact', head: true }).eq('podcast_id', user.id),
    supabase.from('podcasts').select('id', { count: 'exact', head: true }).eq('author_id', user.id).eq('status', 'approved'),
    supabase.from('podcasts').select('id', { count: 'exact', head: true }).eq('author_id', user.id).eq('status', 'pending'),
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
      status,
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
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 616 0v6a3 3 0 01-3 3z" />
        </svg>
      ),
      color: 'bg-blue-500',
    },
    {
      title: 'Total Episodes',
      value: totalEpisodes || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      ),
      color: 'bg-green-500',
    },
    {
      title: 'Approved',
      value: approvedPodcasts || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-green-500',
    },
    {
      title: 'Pending Review',
      value: pendingPodcasts || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-yellow-500',
    },
    {
      title: 'Approved',
      value: approvedPodcasts || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-green-500',
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Author Dashboard</h1>
        <p className="mt-2 text-lg text-gray-600">
          Welcome back, {user.profile.full_name}. Manage your podcast content and track your performance.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 ${stat.color} rounded-lg flex items-center justify-center text-white`}>
                  {stat.icon}
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Link href="/author/upload">
          <Button className="w-full h-20 flex flex-col items-center justify-center space-y-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span>Upload Content</span>
          </Button>
        </Link>
        <Link href="/author/podcasts">
          <Button className="w-full h-20 flex flex-col items-center justify-center space-y-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 616 0v6a3 3 0 01-3 3z" />
            </svg>
            <span>My Podcasts</span>
          </Button>
        </Link>
        <Link href="/catalog">
          <Button className="w-full h-20 flex flex-col items-center justify-center space-y-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span>Browse Catalog</span>
          </Button>
        </Link>
        <Link href="/author/analytics">
          <Button className="w-full h-20 flex flex-col items-center justify-center space-y-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>Analytics</span>
          </Button>
        </Link>
      </div>

      {/* Content and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Podcasts */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Your Recent Podcasts</h2>
          </div>
          <div className="p-6 space-y-4">
            {recentPodcasts && recentPodcasts.length > 0 ? (
              recentPodcasts.map((podcast) => (
                <div key={podcast.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">{podcast.title}</h3>
                    <p className="text-sm text-gray-500">
                      {podcast.category} • {podcast.language.toUpperCase()} • {podcast.episodes?.length || 0} episodes
                    </p>
                    <p className="text-xs text-gray-400">{formatDate(podcast.created_at)}</p>
                  </div>
                  <div className="ml-4 flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      podcast.status === 'approved' ? 'bg-green-100 text-green-800' :
                      podcast.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      podcast.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {podcast.status}
                    </span>
                    <Link href={`/author/podcasts/${podcast.id}`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 616 0v6a3 3 0 01-3 3z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No podcasts yet</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by uploading your first podcast.</p>
                <div className="mt-6">
                  <Link href="/author/upload">
                    <Button>Upload Podcast</Button>
                  </Link>
                </div>
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
            <h2 className="text-lg font-semibold text-gray-900">Recent Episodes</h2>
          </div>
          <div className="p-6 space-y-4">
            {recentEpisodes && recentEpisodes.length > 0 ? (
              recentEpisodes.map((episode) => (
                <div key={episode.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">
                      {episode.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Episode {episode.episode_number} • {(episode.podcasts as any)?.title || 'Unknown Podcast'}
                    </p>
                    <p className="text-xs text-gray-400">
                      Created: {formatDate(episode.created_at)}
                    </p>
                  </div>
                  <div className="ml-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      episode.status === 'approved' ? 'bg-green-100 text-green-800' :
                      episode.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      episode.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {episode.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No episodes yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Start by uploading your first episode to get started.
                </p>
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
  )
} 