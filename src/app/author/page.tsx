import { createServerSupabaseClient } from '@/lib/supabase'
import { requireAuthor } from '@/lib/auth'
import { StatsCard } from '@/components/ui/stats-card'
import { ActionCard } from '@/components/ui/action-card'
import { PodcastList } from '@/components/ui/podcast-list'

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
      cover_image_url,
      episodes (
        id,
        title,
        status
      )
    `)
    .eq('author_id', user.id)
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
            icon="🎙️"
          />

          <StatsCard
            title="Total Episodes"
            value={totalEpisodes || 0}
            color="amber"
            icon="🎵"
          />

          <StatsCard
            title="Approved"
            value={approvedPodcasts || 0}
            color="rose"
            icon="✅"
          />

          <StatsCard
            title="Pending Review"
            value={pendingPodcasts || 0}
            color="stone"
            icon="⏳"
          />

          <StatsCard
            title="Draft"
            value={draftPodcasts || 0}
            color="yellow"
            icon="📝"
          />

          <StatsCard
            title="Published"
            value={(approvedPodcasts || 0)}
            color="gray"
            icon="🌟"
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

        {/* Recent Podcasts */}
        <PodcastList
          title="Your Recent Podcasts"
          podcasts={recentPodcasts}
          emptyStateMessage="Upload your first podcast and share your voice with the world!"
          viewAllHref="/author/podcasts"
          getItemHref={(podcast) => `/author/podcasts/${podcast.id}/edit`}
          showAuthor={false}
        />
      </div>
    </div>
  )
}