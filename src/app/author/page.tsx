import { createServerSupabaseClient } from '@/lib/supabase'
import { requireAuthor } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { StatsCard } from '@/components/ui/stats-card'
import { ActionCard } from '@/components/ui/action-card'
import { ContentBox } from '@/components/ui/content-box'
import { ListItemCard } from '@/components/ui/list-item-card'

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Total Podcasts"
            value={totalPodcasts || 0}
            color="orange"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 616 0v6a3 3 0 01-3 3z" />
              </svg>
            }
          />

          <StatsCard
            title="Total Episodes"
            value={totalEpisodes || 0}
            color="amber"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          />

          <StatsCard
            title="Approved"
            value={approvedPodcasts || 0}
            color="rose"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />

          <StatsCard
            title="Pending Review"
            value={pendingPodcasts || 0}
            color="stone"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />

          <StatsCard
            title="Draft"
            value={draftPodcasts || 0}
            color="yellow"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          />

          <StatsCard
            title="Published"
            value={(approvedPodcasts || 0)}
            color="gray"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            }
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ActionCard
              title="Create New Podcast"
              icon="🎙️"
              href="/author/upload"
              description="Upload a new podcast"
            />
            
            <ActionCard
              title="My Podcasts"
              icon="📻"
              href="/author/podcasts"
              description="Manage your content"
            />
            
            <ActionCard
              title="View Analytics"
              icon="📈"
              href="/author/analytics"
              description="View performance"
            />
          </div>
        </div>

        {/* Content and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Podcasts */}
          <ContentBox
            title="Your Recent Podcasts"
            isEmpty={!recentPodcasts || recentPodcasts.length === 0}
            emptyState={{
              message: "No podcasts yet",
              icon: "🎙️"
            }}
            action={
              <Link href="/author/podcasts">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            }
          >
            {recentPodcasts?.map((podcast) => (
              <ListItemCard
                key={podcast.id}
                title={podcast.title}
                subtitle={`${podcast.category} • ${podcast.language.toUpperCase()}`}
                metadata={`${podcast.episodes?.length || 0} episodes • Created ${formatDate(podcast.created_at)}`}
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

          {/* Recent Episodes */}
          <ContentBox
            title="Recent Episodes"
            isEmpty={!recentEpisodes || recentEpisodes.length === 0}
            emptyState={{
              message: "No episodes yet",
              icon: "🎵"
            }}
            action={
              <Link href="/author/podcasts">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            }
          >
            {recentEpisodes?.map((episode) => (
              <ListItemCard
                key={episode.id}
                title={episode.title}
                subtitle={`Episode ${episode.episode_number} • ${(episode.podcasts as any)?.title || 'Unknown Podcast'}`}
                metadata={`Created ${formatDate(episode.created_at)}`}
                status={{
                  label: "Published",
                  variant: "published"
                }}
                avatar={{
                  fallback: `E${episode.episode_number}`
                }}
              />
            ))}
          </ContentBox>
        </div>
      </div>
    </div>
  )
}