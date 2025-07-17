import { requireAdmin } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { StatsCard } from '@/components/ui/stats-card'
import { AdminPodcastClient } from '@/components/admin/admin-podcast-client'
import Link from 'next/link'

interface Podcast {
  id: string
  title: string
  description: string
  cover_image_url: string | null
  author_id: string
  category: string
  language: string
  country: string
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  rss_url: string | null
  created_at: string
  updated_at: string
  user_profiles: {
    full_name: string
    email: string
    company: string | null
  } | null
  episodes: Array<{
    id: string
    title: string
    status: 'draft' | 'pending' | 'approved' | 'rejected'
  }>
}

async function getPodcasts() {
  const supabase = await createServerSupabaseClient()
  
  const { data: podcasts, error } = await supabase
    .from('podcasts')
    .select(`
      *,
      user_profiles!podcasts_author_id_fkey (
        full_name,
        email,
        company
      ),
      episodes (
        id,
        title,
        status
      )
    `)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching podcasts:', error)
    return []
  }
  
  // Debug log to see what we're getting
  console.log('Fetched podcasts:', podcasts?.slice(0, 2)?.map(p => ({
    id: p.id,
    title: p.title,
    author_id: p.author_id,
    user_profiles: p.user_profiles
  })))
  
  return podcasts as Podcast[]
}

export default async function AdminPodcastsPage() {
  const user = await requireAdmin()
  const podcasts = await getPodcasts()
  
  const stats = {
    total: podcasts.length,
    pending: podcasts.filter(p => p.status === 'pending').length,
    approved: podcasts.filter(p => p.status === 'approved').length,
    rejected: podcasts.filter(p => p.status === 'rejected').length
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Podcast Management</h1>
            <p className="mt-2 text-lg text-gray-600">
              Review and moderate podcast submissions
            </p>
          </div>
          <Link href="/admin">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Podcasts"
          value={stats.total}
          icon="🎙️"
          color="blue"
        />
        <StatsCard
          title="Pending Review"
          value={stats.pending}
          icon="⏳"
          color="yellow"
        />
        <StatsCard
          title="Approved"
          value={stats.approved}
          icon="✅"
          color="green"
        />
        <StatsCard
          title="Rejected"
          value={stats.rejected}
          icon="❌"
          color="red"
        />
      </div>

      {/* Podcast Table */}
      <AdminPodcastClient podcasts={podcasts} />
    </div>
  )
} 