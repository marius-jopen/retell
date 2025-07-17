import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { EpisodeCard } from './episode-card'

interface Episode {
  id: string
  title: string
  description: string
  audio_url?: string | null
  script_url?: string | null
  duration?: number | null
  episode_number?: number | null
  season_number?: number | null
  created_at: string
}

interface User {
  profile: {
    role: string
  }
}

interface EpisodesListProps {
  episodes: Episode[]
  user?: User | null
}

export function EpisodesList({ episodes, user }: EpisodesListProps) {
  if (episodes.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mb-8">
          <svg className="mx-auto h-16 w-16 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 616 0v6a3 3 0 01-3 3z" />
          </svg>
        </div>
        <h3 className="text-xl font-light text-stone-800 mb-3">No Episodes Available</h3>
        <p className="text-stone-600 mb-8 font-light">This podcast doesn't have any episodes available yet. Check back soon for new content!</p>
        <Link href="/catalog">
          <Button className="bg-red-500 hover:bg-red-600 text-white">
            Explore Other Podcasts
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="lg:col-span-2">
      <div className="mb-6">
        <h2 className="text-xl font-light text-stone-800 mb-1">Episodes</h2>
        <p className="text-sm text-stone-500">
          {episodes.length} episodes
        </p>
      </div>

      <div className="space-y-3">
        {episodes.map((episode: Episode) => (
          <EpisodeCard key={episode.id} episode={episode} user={user} />
        ))}
      </div>
    </div>
  )
} 