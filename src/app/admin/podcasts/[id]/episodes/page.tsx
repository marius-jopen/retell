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

async function getPodcastWithEpisodes(podcastId: string): Promise<Podcast | null> {
  const supabase = await createServerSupabaseClient()
  
  // Admin can access any podcast
  const { data: podcast, error } = await supabase
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
    .single()

  if (error) {
    console.error('Error fetching podcast:', error)
    return null
  }

  return podcast as Podcast
}

export default async function AdminEpisodesPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole(['admin'])
  
  // Await params in Next.js 15
  const { id } = await params
  
  const podcast = await getPodcastWithEpisodes(id)

  if (!podcast) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <div className="text-6xl mb-6">🎙️</div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-3">Podcast Not Found</h1>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">The podcast you're looking for doesn't exist.</p>
          <Link href="/admin/podcasts">
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
      isAdmin={true}
      backUrl="/admin/podcasts"
      getEditUrl={(episodeId: string) => `/admin/podcasts/${podcast.id}/episodes/${episodeId}/edit`}
    />
  )
} 