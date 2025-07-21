import { createServerSupabaseClient } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { Database } from '@/types/database'
import { PodcastSidebar } from '@/components/podcast/podcast-sidebar'
import { EpisodesList } from '@/components/podcast/episodes-list'
import { ErrorState } from '@/components/ui/error-state'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

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
  
  // Calculate total duration of all episodes (in minutes)
  const totalDuration = episodes.reduce((sum: number, episode: Episode) => sum + (episode.duration || 0), 0)
  
  return (
    <div className="min-h-screen bg-orange-50">
      {/* Hero Section - Smaller */}
      <div className="bg-gradient-warm text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Cover Image - Smaller */}
            <div className="flex justify-center lg:justify-start">
              <div className="relative">
                {podcast.cover_image_url ? (
                  <img
                    src={podcast.cover_image_url}
                    alt={podcast.title}
                    className="w-64 h-64 object-cover rounded-modern-xl shadow-modern-lg"
                  />
                ) : (
                  <div className="w-64 h-64 bg-gradient-to-br from-orange-300 via-orange-400 to-orange-500 rounded-modern-xl flex items-center justify-center shadow-modern-lg">
                    <span className="text-white text-4xl font-bold">
                      {podcast.title.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="absolute -bottom-3 -right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="text-xs font-semibold text-gray-800">
                    {episodes.length} Episodes
                  </span>
                </div>
              </div>
            </div>

            {/* Podcast Info */}
            <div className="text-center lg:text-left">
              <div className="mb-3">
                <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide">
                  {podcast.category}
                </span>
              </div>
              
              <h1 className="text-2xl lg:text-3xl font-bold mb-4 leading-tight">
                {podcast.title}
              </h1>
              
              <p className="text-sm text-orange-100 mb-6 leading-relaxed">
                {podcast.description}
              </p>

              {/* Author Info */}
              <div className="flex items-center justify-center lg:justify-start space-x-3 mb-6">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-xs">
                    {podcast.user_profiles?.full_name?.substring(0, 2).toUpperCase() || 'AU'}
                  </span>
                </div>
                <div className="text-left">
                  <div className="text-base font-semibold text-white">
                    {podcast.user_profiles?.full_name || 'Unknown Author'}
                  </div>
                  {podcast.user_profiles?.company && (
                    <div className="text-xs text-orange-200">
                      {podcast.user_profiles.company}
                    </div>
                  )}
                </div>
              </div>

              {/* Podcast Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{episodes.length}</div>
                  <div className="text-xs text-orange-200">Episodes</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{Math.floor(totalDuration / 60)}h</div>
                  <div className="text-xs text-orange-200">Total Duration</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{podcast.language.toUpperCase()}</div>
                  <div className="text-xs text-orange-200">Language</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{podcast.country}</div>
                  <div className="text-xs text-orange-200">Country</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                {user?.profile.role === 'client' && (
                  <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 font-semibold px-6 py-3 rounded-full">
                    Request License
                  </Button>
                )}
                {!user && (
                  <Link href="/auth/signup?role=client">
                    <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 font-semibold px-6 py-3 rounded-full">
                      Sign Up to License
                    </Button>
                  </Link>
                )}
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-6 py-3 rounded-full">
                  Share Podcast
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

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