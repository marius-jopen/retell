import { createServerSupabaseClient } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

export default async function AdminDashboard() {
  const user = await requireAdmin()
  const supabase = await createServerSupabaseClient()

  // Get dashboard stats
  const [
    { count: totalPodcasts },
    { count: totalEpisodes },
    { count: totalUsers },
    { count: pendingPodcasts },
    { count: pendingEpisodes },
    { count: totalAuthors },
  ] = await Promise.all([
    supabase.from('podcasts').select('id', { count: 'exact', head: true }),
    supabase.from('episodes').select('id', { count: 'exact', head: true }),
    supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
    supabase.from('podcasts').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('episodes').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('user_profiles').select('id', { count: 'exact', head: true }).eq('role', 'author'),
  ])

  // Get recent activity
  const { data: recentPodcasts } = await supabase
    .from('podcasts')
    .select(`
      id,
      title,
      status,
      created_at,
      user_profiles!author_id (
        full_name
      )
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: recentUsers } = await supabase
    .from('user_profiles')
    .select('id, full_name, role, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  const stats = [
    {
      title: 'Total Podcasts',
      value: totalPodcasts || 0,
      change: '+12%',
      changeType: 'positive',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 616 0v6a3 3 0 01-3 3z" />
        </svg>
      ),
    },
    {
      title: 'Total Episodes',
      value: totalEpisodes || 0,
      change: '+8%',
      changeType: 'positive',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      ),
    },
    {
      title: 'Total Users',
      value: totalUsers || 0,
      change: '+23%',
      changeType: 'positive',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
    },
    {
      title: 'Pending Approvals',
      value: (pendingPodcasts || 0) + (pendingEpisodes || 0),
      change: '3 new',
      changeType: 'neutral',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: 'Active Authors',
      value: totalAuthors || 0,
      change: '+15%',
      changeType: 'positive',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-lg text-gray-600">
          Welcome back, {user.profile.full_name}. Here's what's happening with your platform.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                  {stat.icon}
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  stat.changeType === 'positive' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {stat.change}
                </span>
                <span className="ml-2 text-gray-500">from last month</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Link href="/admin/podcasts">
          <Button className="w-full h-20 flex flex-col items-center justify-center space-y-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 616 0v6a3 3 0 01-3 3z" />
            </svg>
            <span>Manage Podcasts</span>
          </Button>
        </Link>
        <Link href="/admin/users">
          <Button className="w-full h-20 flex flex-col items-center justify-center space-y-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <span>Manage Users</span>
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
        <Link href="/admin/questionnaire">
          <Button className="w-full h-20 flex flex-col items-center justify-center space-y-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>Questionnaire</span>
          </Button>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Podcasts */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Podcasts</h2>
          </div>
          <div className="p-6 space-y-4">
            {recentPodcasts && recentPodcasts.length > 0 ? (
              recentPodcasts.map((podcast) => (
                <div key={podcast.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">{podcast.title}</h3>
                    <p className="text-sm text-gray-500">
                      by {(podcast.user_profiles as any)?.full_name || 'Unknown'} • {formatDate(podcast.created_at)}
                    </p>
                  </div>
                  <div className="ml-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      podcast.status === 'approved' ? 'bg-green-100 text-green-800' :
                      podcast.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      podcast.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {podcast.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent podcasts</p>
            )}
          </div>
          <div className="p-6 border-t border-gray-200">
            <Link href="/admin/podcasts">
              <Button variant="outline" className="w-full">
                View All Podcasts
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
          </div>
          <div className="p-6 space-y-4">
            {recentUsers && recentUsers.length > 0 ? (
              recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">{user.full_name}</h3>
                    <p className="text-sm text-gray-500">
                      {formatDate(user.created_at)}
                    </p>
                  </div>
                  <div className="ml-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'author' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent users</p>
            )}
          </div>
          <div className="p-6 border-t border-gray-200">
            <Link href="/admin/users">
              <Button variant="outline" className="w-full">
                View All Users
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 