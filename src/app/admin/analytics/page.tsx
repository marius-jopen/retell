import { requireRole } from '@/lib/auth'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { StatsCard } from '@/components/ui/stats-card'
import { ContentBox } from '@/components/ui/content-box'
import { ListItemCard } from '@/components/ui/list-item-card'
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">📊 Platform Analytics</h1>
              <p className="mt-2 text-gray-600">
                Comprehensive insights into your platform's performance and growth
              </p>
            </div>
            <Link href="/admin">
              <Button variant="outline" size="lg" rounded="full">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Platform Users"
            value={totalUsers || 0}
            icon="👥"
            color="red"
            trend={(newUsersWeek || 0) > 0 ? { value: newUsersWeek || 0, isPositive: true, label: "this week" } : undefined}
          />
          
          <StatsCard
            title="Total Podcasts"
            value={totalPodcasts || 0}
            icon="🎙️"
            color="red"
            trend={(newPodcastsWeek || 0) > 0 ? { value: newPodcastsWeek || 0, isPositive: true, label: "this week" } : undefined}
          />
          
          <StatsCard
            title="Total Episodes"
            value={totalEpisodes || 0}
            icon="🎵"
            color="red"
            trend={(newEpisodesWeek || 0) > 0 ? { value: newEpisodesWeek || 0, isPositive: true, label: "this week" } : undefined}
          />
          
          <StatsCard
            title="Approval Rate"
            value={`${approvalRate}%`}
            icon="✅"
            color="red"
          />
        </div>

        {/* Status & User Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Approved"
            value={approvedPodcasts || 0}
            icon="🟢"
            color="green"
          />
          
          <StatsCard
            title="Pending Review"
            value={pendingPodcasts || 0}
            icon="🟡"
            color="yellow"
          />
          
          <StatsCard
            title="Administrators"
            value={adminUsers || 0}
            icon="👑"
            color="red"
          />
          
          <StatsCard
            title="Content Authors"
            value={authorUsers || 0}
            icon="✍️"
            color="blue"
          />
        </div>

        {/* Content Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Categories */}
          <ContentBox
            title="🎯 Popular Categories"
            isEmpty={Object.keys(categoryBreakdown).length === 0}
            emptyState={{
              message: "No category data available",
              icon: "🎯"
            }}
          >
            {Object.entries(categoryBreakdown)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 10)
              .map(([category, count]) => (
                <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 capitalize font-medium">{category}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ 
                          width: `${(count / Math.max(...Object.values(categoryBreakdown))) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-6 text-right">{count}</span>
                  </div>
                </div>
              ))}
          </ContentBox>

          {/* Languages */}
          <ContentBox
            title="🌍 Language Distribution"
            isEmpty={Object.keys(languageBreakdown).length === 0}
            emptyState={{
              message: "No language data available",
              icon: "🌍"
            }}
          >
            {Object.entries(languageBreakdown)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 10)
              .map(([language, count]) => (
                <div key={language} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 uppercase font-medium">{language}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ 
                          width: `${(count / Math.max(...Object.values(languageBreakdown))) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-6 text-right">{count}</span>
                  </div>
                </div>
              ))}
          </ContentBox>
        </div>

        {/* Top Creators */}
        <ContentBox
          title="🏆 Top Content Creators"
          isEmpty={topCreatorsList.length === 0}
          emptyState={{
            message: "No creator data available",
            icon: "🏆"
          }}
        >
          {topCreatorsList.map(([authorId, creator], index) => (
            <ListItemCard
              key={authorId}
              title={creator.name}
              subtitle={creator.email}
              metadata={`${creator.count} podcasts`}
              avatar={{ 
                fallback: `${index + 1}` 
              }}
            />
          ))}
        </ContentBox>
      </div>
    </div>
  )
} 