import { forwardRef, HTMLAttributes, ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Button } from './button'
import { formatDate } from '@/lib/utils'

export interface Podcast {
  id: string
  title: string
  category: string
  language: string
  status: string
  created_at: string
  cover_image_url?: string
  episodes?: { length: number } | Array<any>
  user_profiles?: {
    full_name: string
    email: string
  } | Array<{
    full_name: string
    email: string
  }>
}

export interface PodcastListProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  podcasts: Podcast[] | null
  emptyStateMessage?: string
  emptyStateIcon?: string
  viewAllHref?: string
  getItemHref?: (podcast: Podcast) => string
  showAuthor?: boolean
  variant?: 'default' | 'featured'
}

const statusVariants = {
  approved: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  draft: 'bg-gray-100 text-gray-800',
  published: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
}

const PodcastList = forwardRef<HTMLDivElement, PodcastListProps>(
  ({ 
    title, 
    podcasts, 
    emptyStateMessage = "No podcasts yet",
    emptyStateIcon = "🎙️",
    viewAllHref,
    getItemHref,
    showAuthor = false,
    variant = 'default',
    className, 
    ...props 
  }, ref) => {
    
    const isEmpty = !podcasts || podcasts.length === 0
    const episodeCount = (podcast: Podcast) => {
      if (Array.isArray(podcast.episodes)) {
        return podcast.episodes.length
      }
      return podcast.episodes?.length || 0
    }

    const getAuthorName = (podcast: Podcast) => {
      if (!podcast.user_profiles) return 'Unknown Author'
      
      if (Array.isArray(podcast.user_profiles)) {
        return podcast.user_profiles[0]?.full_name || 'Unknown Author'
      }
      
      return podcast.user_profiles.full_name || 'Unknown Author'
    }

    return (
      <Card 
        ref={ref} 
        variant={variant === 'featured' ? 'gradient' : 'default'}
        className={cn('', className)} 
        {...props}
      >
        <CardHeader className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
            {viewAllHref && (
              <Link href={viewAllHref}>
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {isEmpty ? (
            <div className="text-center py-6">
              <div className="text-3xl mb-3">{emptyStateIcon}</div>
              <p className="text-sm text-gray-500">{emptyStateMessage}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {podcasts?.map((podcast) => (
                <div key={podcast.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  {/* Podcast Image */}
                  <div className="flex-shrink-0">
                    {podcast.cover_image_url ? (
                      <img 
                        src={podcast.cover_image_url} 
                        alt={podcast.title}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xs">
                          {podcast.title.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Podcast Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {podcast.title}
                    </h3>
                    <div className="flex items-center space-x-1.5 text-xs text-gray-500">
                      <span>{podcast.category}</span>
                      <span>•</span>
                      <span>{podcast.language.toUpperCase()}</span>
                      {showAuthor && (
                        <>
                          <span>•</span>
                          <span>by {getAuthorName(podcast)}</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center space-x-1.5 text-xs text-gray-400 mt-0.5">
                      <span>{episodeCount(podcast)} episodes</span>
                      <span>•</span>
                      <span>Created {formatDate(podcast.created_at)}</span>
                    </div>
                  </div>

                  {/* Status and Action */}
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      statusVariants[podcast.status as keyof typeof statusVariants] || 'bg-gray-100 text-gray-800'
                    }`}>
                      {podcast.status}
                    </span>
                    {getItemHref && (
                      <Link href={getItemHref(podcast)}>
                        <Button variant="outline" size="sm" className="text-xs px-2 py-1 h-7">
                          {showAuthor ? 'View' : 'Edit'}
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }
)
PodcastList.displayName = 'PodcastList'

export { PodcastList } 