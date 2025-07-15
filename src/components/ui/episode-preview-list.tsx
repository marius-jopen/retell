import { forwardRef, HTMLAttributes } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Button } from './button'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export interface Episode {
  id: string
  title: string
  description: string
  episode_number: number
  season_number?: number
  duration?: number
  created_at: string
  updated_at: string
  status: 'published' | 'draft' | 'pending'
}

export interface EpisodePreviewListProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  episodes: Episode[]
  maxHeight?: string
  emptyStateMessage?: string
  emptyStateIcon?: string
  getEpisodeHref?: (episode: Episode) => string
  onEpisodeClick?: (episode: Episode) => void
  showActions?: boolean
  podcastId?: string
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const formatDuration = (seconds?: number) => {
  if (!seconds) return ''
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const statusVariants = {
  published: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  draft: 'bg-gray-100 text-gray-800',
}

const EpisodePreviewList = forwardRef<HTMLDivElement, EpisodePreviewListProps>(
  ({ 
    title,
    episodes,
    maxHeight = '400px',
    emptyStateMessage = "No episodes yet",
    emptyStateIcon = "🎙️",
    getEpisodeHref,
    onEpisodeClick,
    showActions = true,
    podcastId,
    className,
    ...props 
  }, ref) => {
    
    const isEmpty = !episodes || episodes.length === 0

    return (
      <Card ref={ref} className={cn('flex flex-col h-full w-full', className)} {...props}>
        <CardHeader className="p-4 border-b border-gray-100 flex-shrink-0">
          <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            {episodes.length > 0 
              ? `${episodes.length} episode${episodes.length === 1 ? '' : 's'}`
              : emptyStateMessage
            }
          </p>
        </CardHeader>
        
        <CardContent className="p-0 flex-1 flex flex-col min-h-0">
          {isEmpty ? (
            <div className="text-center py-8 px-4 flex-1 flex flex-col justify-center">
              <div className="text-3xl mb-3">{emptyStateIcon}</div>
              <p className="text-sm text-gray-500">{emptyStateMessage}</p>
            </div>
          ) : (
            <div 
              className="overflow-y-auto flex-1"
              style={{ maxHeight }}
            >
              <div className="w-full space-y-0">
                {episodes
                  .sort((a, b) => b.episode_number - a.episode_number)
                  .map((episode) => {
                    const content = (
                      <div
                        key={episode.id}
                        className={cn(
                          'flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0',
                          (getEpisodeHref || onEpisodeClick) ? 'cursor-pointer' : ''
                        )}
                        onClick={() => onEpisodeClick?.(episode)}
                      >
                        {/* Episode Number Badge */}
                        <div className="flex-shrink-0 mt-0.5">
                          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-medium text-xs">
                            {episode.episode_number}
                          </div>
                        </div>

                        {/* Episode Content */}
                        <div className="flex-1 min-w-0">
                          {/* Episode Meta */}
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
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
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                  {formatDuration(episode.duration)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Episode Title */}
                          <h3 className="text-sm font-semibold text-gray-900 mb-1 leading-snug hover:text-red-600 transition-colors">
                            {episode.title}
                          </h3>

                          {/* Episode Description */}
                          <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                            {episode.description}
                          </p>

                          {/* Status and Actions */}
                          {showActions && (
                            <div className="flex items-center justify-between mt-2">
                              <span className={cn(
                                'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                                statusVariants[episode.status] || 'bg-gray-100 text-gray-800'
                              )}>
                                {episode.status}
                              </span>

                              <div className="flex items-center gap-1">
                                {getEpisodeHref && (
                                  <Link href={getEpisodeHref(episode)} onClick={(e) => e.stopPropagation()}>
                                    <Button variant="outline" size="sm" className="text-xs h-6 px-2">
                                      Edit
                                    </Button>
                                  </Link>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )

                    if (getEpisodeHref && !onEpisodeClick) {
                      return (
                        <Link key={episode.id} href={getEpisodeHref(episode)}>
                          {content}
                        </Link>
                      )
                    }

                    return content
                  })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }
)
EpisodePreviewList.displayName = 'EpisodePreviewList'

export { EpisodePreviewList } 