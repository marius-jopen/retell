import { createServerSupabaseClient } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { Database } from '@/types/database'
import { PodcastHero } from '@/components/podcast/podcast-hero'
import { PodcastSidebar } from '@/components/podcast/podcast-sidebar'
import { EpisodesList } from '@/components/podcast/episodes-list'
import { ErrorState } from '@/components/ui/error-state'

type Episode = Database['public']['Tables']['episodes']['Row']
type Podcast = Database['public']['Tables']['podcasts']['Row'] & {
  episodes: Episode[]
  user_profiles: {
    full_name: string
    avatar_url: string | null
    company: string | null
  }
}

interface PodcastDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function PodcastDetailPage({ params }: PodcastDetailPageProps) {
  const supabase = await createServerSupabaseClient()
  const user = await getCurrentUser()
  
  // Await params in Next.js 15
  const { id } = await params

  // Get podcast details with episodes
  const { data: podcast } = await supabase
    .from('podcasts')
    .select(`
      *,
      episodes (
        id,
        title,
        description,
        audio_url,
        script_url,
        duration,
        episode_number,
        season_number,
        created_at
      ),
      user_profiles!author_id (
        full_name,
        avatar_url,
        company
      )
    `)
    .eq('id', id)
    .single()

  if (!podcast) {
    return (
      <ErrorState
        title="Podcast Not Found"
        message="The podcast you're looking for doesn't exist or might have been removed."
        actionText="Browse All Podcasts"
        actionHref="/catalog"
        icon="not-found"
      />
    )
  }

  // Check if user can access this podcast
  const canAccess = podcast.status === 'approved' || 
                   (user && (user.profile.role === 'admin' || user.profile.id === podcast.author_id))

  if (!canAccess) {
    return (
      <ErrorState
        title="Access Restricted"
        message="This podcast is not yet available for public viewing. Please check back later."
        actionText="Back to Catalog"
        actionHref="/catalog"
        icon="access-denied"
      />
    )
  }

  const episodes = podcast.episodes || []

  return (
    <div className="min-h-screen bg-stone-50">
      <PodcastHero podcast={podcast} user={user} />

      {/* Main Content - 2 Column Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <PodcastSidebar podcast={podcast} />
          <EpisodesList episodes={episodes} user={user} />
        </div>
      </div>
    </div>
  )
} 