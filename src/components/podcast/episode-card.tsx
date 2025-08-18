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
  isCompact?: boolean
  isFeatured?: boolean
}

export function EpisodeCard({ episode, user, isCompact = false, isFeatured = false }: EpisodeCardProps) {
  if (isCompact) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 h-full">
        <div className="p-6">
          {/* Episode Number Badge */}
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {episode.episode_number}
            </div>
            {episode.duration && (
              <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">
                {Math.floor(episode.duration / 60)}:{String(episode.duration % 60).padStart(2, '0')}
              </span>
            )}
          </div>
          
          {/* Episode Info */}
          <div className="mb-4">
            <div className="text-xs text-gray-500 mb-2 flex items-center gap-2">
              <span>Episode {episode.episode_number}</span>
              <span>•</span>
              <span>{formatDate(episode.created_at)}</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight line-clamp-2">
              {episode.title}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
              {episode.description}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-auto pt-4">
            {episode.audio_url && (
              <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white flex-1 rounded-lg">
                Play
              </Button>
            )}
            {user?.profile.role === 'client' && (
              <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50 rounded-lg">
                Script
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (isFeatured) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
        <div className="p-8">
          {/* Episode Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
              {episode.episode_number}
            </div>
            {episode.duration && (
              <span className="text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-full font-medium">
                {Math.floor(episode.duration / 60)}:{String(episode.duration % 60).padStart(2, '0')}
              </span>
            )}
          </div>
          
          {/* Episode Meta */}
          <div className="mb-4">
            <div className="text-sm text-gray-500 mb-3 flex items-center gap-2">
              <span>Episode {episode.episode_number}</span>
              <span>•</span>
              <span>{formatDate(episode.created_at)}</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 leading-tight">
              {episode.title}
            </h3>
            <p className="text-gray-600 leading-relaxed line-clamp-4">
              {episode.description}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-6 border-t border-gray-100">
            {episode.audio_url && (
              <Button size="lg" className="bg-red-500 hover:bg-red-600 text-white flex-1 rounded-xl font-semibold">
                ▶ Play Episode
              </Button>
            )}
            {user?.profile.role === 'client' && (
              <Button variant="outline" size="lg" className="text-red-600 border-red-300 hover:bg-red-50 rounded-xl px-6">
                📄 Script
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Original full-size card for non-featured, non-compact mode
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