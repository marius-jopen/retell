import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatDate, formatDuration } from '@/lib/utils'
import EpisodeActions from '@/components/author/episode-actions'
import AudioPlayer from '@/components/ui/audio-player'

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

interface EpisodesListProps {
  podcast: Podcast
  isAdmin?: boolean
  backUrl: string
  newEpisodeUrl?: string
  getEditUrl: (episodeId: string) => string
}

export default function EpisodesList({ 
  podcast, 
  isAdmin = false, 
  backUrl, 
  newEpisodeUrl,
  getEditUrl 
}: EpisodesListProps) {
  const episodes = podcast.episodes || []
  const stats = {
    total: episodes.length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Podcast Cover Image */}
              <div className="flex-shrink-0">
                {podcast.cover_image_url ? (
                  <img
                    src={podcast.cover_image_url}
                    alt={podcast.title}
                    className="w-16 h-16 rounded-2xl object-cover shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-sm">
                    <span className="text-white font-bold text-lg">
                      {podcast.title.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Title and Description */}
              <div>
                <h1 className="text-3xl font-semibold text-gray-900 mb-2">Episodes</h1>
                <p className="text-gray-600">
                  Manage episodes for "{podcast.title}"
                </p>
                {isAdmin && podcast.user_profiles && (
                  <p className="text-sm text-gray-500 mt-1">
                    Author: {podcast.user_profiles.full_name} ({podcast.user_profiles.email})
                  </p>
                )}
              </div>
            </div>
            <div className="flex space-x-3">
              {!isAdmin && newEpisodeUrl && (
                <Link href={newEpisodeUrl}>
                  <Button 
                    variant="primary" 
                    size="lg" 
                    rounded="full"
                    className="font-semibold"
                  >
                    Add Episode
                  </Button>
                </Link>
              )}
              <Link href={backUrl}>
                <Button 
                  variant="outline" 
                  size="lg" 
                  rounded="full"
                >
                  Back to Podcasts
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center shadow-sm">
                <div className="w-6 h-6 bg-white rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Episodes</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Episodes List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">Episodes</h2>
          </div>
          
          {episodes.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-6">🎙️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">No episodes yet</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {isAdmin 
                  ? "This podcast doesn't have any episodes yet." 
                  : "Get started by creating your first episode."
                }
              </p>
              {!isAdmin && newEpisodeUrl && (
                <div className="mt-6">
                  <Link href={newEpisodeUrl}>
                    <Button 
                      variant="primary" 
                      size="lg" 
                      rounded="full"
                      className="font-semibold"
                    >
                      Create Your First Episode
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {episodes
                .sort((a, b) => b.episode_number - a.episode_number)
                .map((episode) => (
                  <div key={episode.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        {/* Episode Number Badge */}
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                            {episode.episode_number}
                          </div>
                        </div>
                        
                        {/* Episode Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="text-sm font-medium text-gray-500">
                              Episode {episode.episode_number}
                              {episode.season_number && episode.season_number > 1 && (
                                <span> • Season {episode.season_number}</span>
                              )}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-snug">{episode.title}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-3">{episode.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                            <span className="bg-gray-100 px-2 py-1 rounded-full">
                              Duration: {formatDuration(episode.duration)}
                            </span>
                            <span>•</span>
                            <span>Created: {formatDate(episode.created_at)}</span>
                            <span>•</span>
                            <span>Updated: {formatDate(episode.updated_at)}</span>
                          </div>
                          
                          {/* Audio Player */}
                          {episode.audio_url && (
                            <div className="mb-3">
                              <AudioPlayer 
                                src={episode.audio_url} 
                                title={episode.title}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="ml-6 flex items-center space-x-2 flex-shrink-0">
                        <Link href={getEditUrl(episode.id)}>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            rounded="full"
                          >
                            Edit
                          </Button>
                        </Link>
                        {!isAdmin && (
                          <EpisodeActions
                            episodeId={episode.id}
                            episodeTitle={episode.title}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 