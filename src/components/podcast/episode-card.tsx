import { Button } from '@/components/ui/button'
import TruncatedText from '@/components/ui/truncated-text'
import AudioPlayer from '@/components/ui/audio-player'
import { formatDate } from '@/lib/utils'

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

interface EpisodeCardProps {
  episode: Episode
  user?: User | null
}

export function EpisodeCard({ episode, user }: EpisodeCardProps) {
  return (
    <div className="bg-white/70 rounded-lg border border-stone-200/30 hover:bg-white hover:border-stone-300/50 transition-all duration-200">
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-medium text-xs flex-shrink-0 mt-0.5">
            {episode.episode_number}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <span>Episode {episode.episode_number}</span>
                {episode.season_number && episode.season_number > 1 && (
                  <>
                    <span>•</span>
                    <span>Season {episode.season_number}</span>
                  </>
                )}
                <span>•</span>
                <span>{formatDate(episode.created_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                {episode.duration && (
                  <span className="text-xs text-stone-500 bg-stone-100 px-2 py-1 rounded-full">
                    {Math.floor(episode.duration / 60)}:{String(episode.duration % 60).padStart(2, '0')}
                  </span>
                )}
                {user?.profile.role === 'client' && (
                  <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50 text-xs h-6 px-2">
                    Script
                  </Button>
                )}
              </div>
            </div>
            <h3 className="text-base font-medium text-stone-800 mb-2 leading-snug">
              {episode.title}
            </h3>
            <TruncatedText text={episode.description} className="text-sm text-stone-600 leading-relaxed" />
          </div>
        </div>
        
        {/* Audio Player */}
        {episode.audio_url && (
          <div className="mt-3">
            <AudioPlayer 
              src={episode.audio_url} 
              title={episode.title}
            />
          </div>
        )}
      </div>
    </div>
  )
} 