import { requireRole } from '@/lib/auth'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

export default async function AnalyticsPage() {
  const user = await requireRole(['admin'])
  const supabase = await createAdminSupabaseClient()

  // Get comprehensive stats
  const [
    { count: totalUsers },
    { count: totalPodcasts },
    { count: totalEpisodes },
    { count: approvedPodcasts },
    { count: pendingPodcasts },
    { count: draftPodcasts },
    { count: rejectedPodcasts },
    { count: adminUsers },
    { count: authorUsers },
    { count: clientUsers }
  ] = await Promise.all([
    supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
    supabase.from('podcasts').select('id', { count: 'exact', head: true }),
    supabase.from('episodes').select('id', { count: 'exact', head: true }),
    supabase.from('podcasts').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('podcasts').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('podcasts').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('podcasts').select('id', { count: 'exact', head: true }).eq('status', 'rejected'),
    supabase.from('user_profiles').select('id', { count: 'exact', head: true }).eq('role', 'admin'),
    supabase.from('user_profiles').select('id', { count: 'exact', head: true }).eq('role', 'author'),
    supabase.from('user_profiles').select('id', { count: 'exact', head: true }).eq('role', 'client')
  ])

  // Get recent activity trends (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const [
    { count: newUsersWeek },
    { count: newPodcastsWeek },
    { count: newEpisodesWeek }
  ] = await Promise.all([
    supabase.from('user_profiles').select('id', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo.toISOString()),
    supabase.from('podcasts').select('id', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo.toISOString()),
    supabase.from('episodes').select('id', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo.toISOString())
  ])

  // Get content breakdown by category
  const { data: categoryStats } = await supabase
    .from('podcasts')
    .select('category')
    .eq('status', 'approved')

  const categoryBreakdown = categoryStats?.reduce((acc: Record<string, number>, podcast) => {
    if (podcast.category) {
      acc[podcast.category] = (acc[podcast.category] || 0) + 1
    }
    return acc
  }, {}) || {}

  // Get language breakdown
  const { data: languageStats } = await supabase
    .from('podcasts')
    .select('language')
    .eq('status', 'approved')

  const languageBreakdown = languageStats?.reduce((acc: Record<string, number>, podcast) => {
    if (podcast.language) {
      acc[podcast.language] = (acc[podcast.language] || 0) + 1
    }
    return acc
  }, {}) || {}

  // Get top creators by podcast count
  const { data: topCreators } = await supabase
    .from('podcasts')
    .select(`
      author_id,
      user_profiles!author_id (
        full_name,
        email
      )
    `)
    .eq('status', 'approved')

  const creatorStats = topCreators?.reduce((acc: Record<string, { name: string; count: number; email: string }>, podcast) => {
    const authorId = podcast.author_id
    const profile = podcast.user_profiles as any
    if (authorId && profile) {
      if (!acc[authorId]) {
        acc[authorId] = { name: profile.full_name || 'Unknown', count: 0, email: profile.email || '' }
      }
      acc[authorId].count += 1
    }
    return acc
  }, {}) || {}

  const topCreatorsList = Object.entries(creatorStats)
    .sort(([,a], [,b]) => b.count - a.count)
    .slice(0, 5)

  // Calculate approval rates
  const totalSubmissions = totalPodcasts || 0
  const approvalRate = totalSubmissions > 0 ? ((approvedPodcasts || 0) / totalSubmissions * 100).toFixed(1) : '0'
  const pendingRate = totalSubmissions > 0 ? ((pendingPodcasts || 0) / totalSubmissions * 100).toFixed(1) : '0'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📊 Platform Analytics</h1>
            <p className="mt-2 text-lg text-gray-600">
              Comprehensive insights into your platform's performance and growth
            </p>
          </div>
          <Link href="/admin">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Platform Users</p>
              <p className="text-3xl font-bold text-gray-900">{totalUsers || 0}</p>
              <p className="text-sm text-blue-600">+{newUsersWeek || 0} this week</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 016 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Podcasts</p>
              <p className="text-3xl font-bold text-gray-900">{totalPodcasts || 0}</p>
              <p className="text-sm text-green-600">+{newPodcastsWeek || 0} this week</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Episodes</p>
              <p className="text-3xl font-bold text-gray-900">{totalEpisodes || 0}</p>
              <p className="text-sm text-purple-600">+{newEpisodesWeek || 0} this week</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approval Rate</p>
              <p className="text-3xl font-bold text-gray-900">{approvalRate}%</p>
              <p className="text-sm text-red-600">{approvedPodcasts || 0} approved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">📈 Content Status Overview</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">Approved</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-gray-900">{approvedPodcasts || 0}</span>
                  <p className="text-sm text-gray-500">{((approvedPodcasts || 0) / Math.max(totalPodcasts || 1, 1) * 100).toFixed(1)}%</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">Pending Review</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-gray-900">{pendingPodcasts || 0}</span>
                  <p className="text-sm text-gray-500">{((pendingPodcasts || 0) / Math.max(totalPodcasts || 1, 1) * 100).toFixed(1)}%</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">Draft</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-gray-900">{draftPodcasts || 0}</span>
                  <p className="text-sm text-gray-500">{((draftPodcasts || 0) / Math.max(totalPodcasts || 1, 1) * 100).toFixed(1)}%</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">Rejected</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-gray-900">{rejectedPodcasts || 0}</span>
                  <p className="text-sm text-gray-500">{((rejectedPodcasts || 0) / Math.max(totalPodcasts || 1, 1) * 100).toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">👥 User Role Distribution</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">Administrators</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-gray-900">{adminUsers || 0}</span>
                  <p className="text-sm text-gray-500">{((adminUsers || 0) / Math.max(totalUsers || 1, 1) * 100).toFixed(1)}%</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">Content Authors</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-gray-900">{authorUsers || 0}</span>
                  <p className="text-sm text-gray-500">{((authorUsers || 0) / Math.max(totalUsers || 1, 1) * 100).toFixed(1)}%</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">Clients</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-gray-900">{clientUsers || 0}</span>
                  <p className="text-sm text-gray-500">{((clientUsers || 0) / Math.max(totalUsers || 1, 1) * 100).toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Categories & Languages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">🎯 Popular Categories</h2>
          </div>
          <div className="p-6">
            {Object.keys(categoryBreakdown).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(categoryBreakdown)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 10)
                  .map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-gray-700 capitalize">{category}</span>
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${(count / Math.max(...Object.values(categoryBreakdown))) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No category data available</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">🌍 Language Distribution</h2>
          </div>
          <div className="p-6">
            {Object.keys(languageBreakdown).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(languageBreakdown)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 10)
                  .map(([language, count]) => (
                    <div key={language} className="flex items-center justify-between">
                      <span className="text-gray-700 uppercase">{language}</span>
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${(count / Math.max(...Object.values(languageBreakdown))) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No language data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Top Creators */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">🏆 Top Content Creators</h2>
        </div>
        <div className="p-6">
          {topCreatorsList.length > 0 ? (
            <div className="space-y-4">
              {topCreatorsList.map(([authorId, creator], index) => (
                <div key={authorId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4 ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{creator.name}</h3>
                      <p className="text-sm text-gray-600">{creator.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{creator.count}</p>
                    <p className="text-sm text-gray-500">podcasts</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No creator data available</p>
          )}
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">⚡ Platform Health Summary</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{approvalRate}%</div>
              <p className="text-gray-600">Content Approval Rate</p>
              <p className="text-xs text-gray-500 mt-1">Quality content pipeline</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {totalEpisodes && totalPodcasts ? (totalEpisodes / totalPodcasts).toFixed(1) : '0'}
              </div>
              <p className="text-gray-600">Avg Episodes per Podcast</p>
              <p className="text-xs text-gray-500 mt-1">Content depth metric</p>
            </div>
            
            <div className="text-3xl font-bold text-purple-600 mb-2 text-center">
              {((authorUsers || 0) / Math.max(totalUsers || 1, 1) * 100).toFixed(1)}%
            </div>
            <div className="text-center">
              <p className="text-gray-600">Creator Ratio</p>
              <p className="text-xs text-gray-500 mt-1">Active content creators</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 