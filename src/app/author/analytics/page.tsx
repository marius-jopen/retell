import { requireRole } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { StatsCard } from '@/components/ui/stats-card'
import { ContentBox } from '@/components/ui/content-box'
import { ListItemCard } from '@/components/ui/list-item-card'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

export default async function AuthorAnalyticsPage() {
  const user = await requireRole(['author'])
  const supabase = await createServerSupabaseClient()

  // Get author's comprehensive stats
  const [
    { count: totalPodcasts },
    { count: totalEpisodes },
    { count: approvedPodcasts },
    { count: pendingPodcasts },
    { count: draftPodcasts },
    { count: rejectedPodcasts }
  ] = await Promise.all([
    supabase.from('podcasts').select('id', { count: 'exact', head: true }).eq('author_id', user.id),
    supabase.from('episodes').select('id', { count: 'exact', head: true }),
    supabase.from('podcasts').select('id', { count: 'exact', head: true }).eq('author_id', user.id).eq('status', 'approved'),
    supabase.from('podcasts').select('id', { count: 'exact', head: true }).eq('author_id', user.id).eq('status', 'pending'),
    supabase.from('podcasts').select('id', { count: 'exact', head: true }).eq('author_id', user.id).eq('status', 'draft'),
    supabase.from('podcasts').select('id', { count: 'exact', head: true }).eq('author_id', user.id).eq('status', 'rejected')
  ])

  // Get weekly activity (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const [
    { count: newPodcastsWeek },
    { count: newEpisodesWeek }
  ] = await Promise.all([
    supabase.from('podcasts').select('id', { count: 'exact', head: true }).eq('author_id', user.id).gte('created_at', sevenDaysAgo.toISOString()),
    supabase.from('episodes').select('id', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo.toISOString())
  ])

  // Get author's podcast performance
  const { data: podcastsWithEpisodes } = await supabase
    .from('podcasts')
    .select(`
      id,
      title,
      status,
      category,
      language,
      created_at,
      episodes (
        id,
        title,
        duration,
        created_at
      )
    `)
    .eq('author_id', user.id)
    .order('created_at', { ascending: false })

  // Get recent activity
  const { data: recentEpisodes } = await supabase
    .from('episodes')
    .select(`
      id,
      title,
      created_at,
      updated_at,
      duration,
      podcast_id,
      podcasts (
        id,
        title
      )
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  // Calculate performance metrics
  const totalSubmissions = totalPodcasts || 0
  const approvalRate = totalSubmissions > 0 ? ((approvedPodcasts || 0) / totalSubmissions * 100).toFixed(1) : '0'
  const avgEpisodesPerPodcast = (totalPodcasts || 0) > 0 ? ((totalEpisodes || 0) / (totalPodcasts || 1)).toFixed(1) : '0'

  // Get category breakdown for author's content
  const categoryBreakdown = podcastsWithEpisodes?.reduce((acc: Record<string, number>, podcast) => {
    if (podcast.category) {
      acc[podcast.category] = (acc[podcast.category] || 0) + 1
    }
    return acc
  }, {}) || {}

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">📊 My Analytics</h1>
              <p className="mt-2 text-gray-600">
                Track your content performance and growth insights
              </p>
            </div>
            <Link href="/author">
              <Button variant="outline" size="lg" rounded="full">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
          
          <StatsCard
            title="Avg Episodes/Podcast"
            value={avgEpisodesPerPodcast}
            icon="📊"
            color="red"
          />
        </div>

        {/* Status Overview */}
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
            title="Drafts"
            value={draftPodcasts || 0}
            icon="📝"
            color="gray"
          />
          
          <StatsCard
            title="Rejected"
            value={rejectedPodcasts || 0}
            icon="🔴"
            color="red"
          />
        </div>

        {/* Content Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Categories */}
          <ContentBox
            title="Content Categories"
            isEmpty={Object.keys(categoryBreakdown).length === 0}
            emptyState={{
              message: "No category data available",
              icon: "🎯"
            }}
          >
            {Object.entries(categoryBreakdown)
              .sort(([,a], [,b]) => b - a)
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

          {/* Top Performing Podcasts */}
          <ContentBox
            title="Top Podcasts"
            isEmpty={!podcastsWithEpisodes || podcastsWithEpisodes.length === 0}
            emptyState={{
              message: "No podcasts created yet",
              icon: "🎙️",
              action: <Link href="/author/upload"><Button size="sm">Create Your First Podcast</Button></Link>
            }}
          >
            {podcastsWithEpisodes?.slice(0, 5).map((podcast) => (
              <ListItemCard
                key={podcast.id}
                title={podcast.title}
                subtitle={`${podcast.episodes?.length || 0} episodes • ${podcast.category}`}
                metadata={`Created ${formatDate(podcast.created_at)}`}
                status={{ 
                  label: podcast.status, 
                  variant: podcast.status as any 
                }}
                avatar={{ 
                  fallback: podcast.title.substring(0, 2).toUpperCase() 
                }}
                href={`/author/podcasts/${podcast.id}/edit`}
              />
            ))}
          </ContentBox>
        </div>

        {/* Recent Activity */}
        <ContentBox
          title="Recent Episodes"
          isEmpty={!recentEpisodes || recentEpisodes.length === 0}
          emptyState={{
            message: "No recent episode activity",
            icon: "🎵"
          }}
          action={
            <Link href="/author/podcasts">
              <Button variant="outline" size="sm" rounded="full">
                View All
              </Button>
            </Link>
          }
        >
          {recentEpisodes?.map((episode) => (
            <ListItemCard
              key={episode.id}
              title={episode.title}
              subtitle="Recent Episode"
              metadata={`Created ${formatDate(episode.created_at)} • ${episode.duration ? `${Math.floor(episode.duration / 60)}:${String(episode.duration % 60).padStart(2, '0')}` : 'No duration'}`}
              avatar={{ 
                fallback: episode.title.substring(0, 2).toUpperCase() 
              }}
            />
          ))}
        </ContentBox>
      </div>
    </div>
  )
} 