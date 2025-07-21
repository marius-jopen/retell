import { requireRole } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase'
import { StatsCard } from '@/components/ui/stats-card'
import { ActionCard } from '@/components/ui/action-card'
import { PodcastList } from '@/components/ui/podcast-list'

export default async function AdminDashboard() {
  const user = await requireRole(['admin'])
  const supabase = await createServerSupabaseClient()

  // Get system stats
  const [
    { count: totalUsers },
    { count: totalPodcasts },
    { count: totalEpisodes },
    { count: approvedPodcasts },
    { count: pendingPodcasts },
    { count: draftPodcasts }
  ] = await Promise.all([
    supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
    supabase.from('podcasts').select('id', { count: 'exact', head: true }),
    supabase.from('episodes').select('id', { count: 'exact', head: true }),
    supabase.from('podcasts').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('podcasts').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('podcasts').select('id', { count: 'exact', head: true }).eq('status', 'draft')
  ])

  // Get recent podcasts
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
        id
      ),
      user_profiles!podcasts_author_id_fkey (
        full_name,
        email
      )
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-lg text-gray-600">
          Welcome back, {user.profile.full_name}! Here&apos;s your system overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatsCard
          title="Total Users"
          value={totalUsers || 0}
          color="orange"
          icon="👥"
        />

        <StatsCard
          title="Total Podcasts"
          value={totalPodcasts || 0}
          color="amber"
          icon="🎙️"
        />

        <StatsCard
          title="Total Episodes"
          value={totalEpisodes || 0}
          color="rose"
          icon="🎵"
        />

        <StatsCard
          title="Approved Podcasts"
          value={approvedPodcasts || 0}
          color="stone"
          icon="✅"
        />

        <StatsCard
          title="Pending Approval"
          value={pendingPodcasts || 0}
          color="yellow"
          icon="⏳"
        />

        <StatsCard
          title="Draft Podcasts"
          value={draftPodcasts || 0}
          color="gray"
          icon="📝"
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ActionCard
            title="Manage Podcasts"
            icon="🎙️"
            href="/admin/podcasts"
            description="Review and manage podcast submissions"
          />
          
          <ActionCard
            title="Manage Users"
            icon="👥"
            href="/admin/users"
            description="User management and permissions"
          />

          <ActionCard
            title="View Analytics"
            icon="📈"
            href="/admin/analytics"
            description="System analytics and insights"
          />
        </div>
      </div>

      {/* Recent Podcasts */}
      <PodcastList
        title="Recent Podcasts"
        podcasts={recentPodcasts}
        emptyStateMessage="No podcasts yet"
        viewAllHref="/admin/podcasts"
        getItemHref={(podcast) => `/admin/podcasts/${podcast.id}`}
        showAuthor={true}
      />
    </div>
  )
} 