import { requireRole } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { EpisodesList } from '@/components/episodes'

interface Episode {
  id: string
  title: string
  description: string
  audio_url: string
  script_url: string
  duration: number | null
  episode_number: number
  season_number: number | null
  created_at: string
  updated_at: string
}

interface Podcast {
  id: string
  title: string
  description: string
  author_id: string
  cover_image_url: string | null
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  episodes: Episode[]
  user_profiles?: {
    full_name: string
    email: string
  }
}

async function getPodcastWithEpisodes(podcastId: string, userId: string, isAdmin: boolean): Promise<Podcast | null> {
  const supabase = await createServerSupabaseClient()
  
  // Build query based on user role
  let query = supabase
    .from('podcasts')
    .select(`
      *,
      user_profiles (
        full_name,
        email
      ),
      episodes (
        id,
        title,
        description,
        audio_url,
        script_url,
        duration,
        episode_number,
        season_number,
        created_at,
        updated_at
      )
    `)
    .eq('id', podcastId)

  // If not admin, restrict to user's own podcasts
  if (!isAdmin) {
    query = query.eq('author_id', userId)
  }

  const { data: podcast, error } = await query.single()

  if (error) {
    console.error('Error fetching podcast:', error)
    return null
  }

  return podcast as Podcast
}

export default async function EpisodesPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole(['author', 'admin'])
  
  // Await params in Next.js 15
  const { id } = await params
  
  const isAdmin = user.profile.role === 'admin'
  const podcast = await getPodcastWithEpisodes(id, user.id, isAdmin)

  if (!podcast) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <div className="text-6xl mb-6">🎙️</div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-3">Podcast Not Found</h1>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">The podcast you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.</p>
          <Link href={isAdmin ? "/admin/podcasts" : "/author/podcasts"}>
            <Button 
              variant="primary" 
              size="lg" 
              rounded="full"
              className="font-semibold"
            >
              Back to Podcasts
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <EpisodesList
      podcast={podcast}
      isAdmin={isAdmin}
      backUrl={isAdmin ? "/admin/podcasts" : "/author/podcasts"}
      newEpisodeUrl={!isAdmin ? `/author/podcasts/${podcast.id}/episodes/new` : undefined}
      getEditUrl={(episodeId: string) => 
        isAdmin 
          ? `/admin/episodes/${episodeId}/edit` 
          : `/author/podcasts/${podcast.id}/episodes/${episodeId}/edit`
      }
    />
  )
} 