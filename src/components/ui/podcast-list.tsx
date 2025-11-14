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
        <CardHeader className="p-5 sm:p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900">{title}</CardTitle>
            {viewAllHref && (
              <Link href={viewAllHref}>
                <Button variant="outline" size="sm" className="text-xs sm:text-sm w-full sm:w-auto">View All</Button>
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-5 sm:p-6">
          {isEmpty ? (
            <div className="text-center py-8 sm:py-12">
              <div className="text-4xl sm:text-5xl mb-4">{emptyStateIcon}</div>
              <p className="text-sm sm:text-base text-gray-500">{emptyStateMessage}</p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-5">
              {podcasts?.map((podcast) => (
                <div key={podcast.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  {/* Podcast Image */}
                  <div className="flex-shrink-0">
                    {podcast.cover_image_url ? (
                      <img 
                        src={podcast.cover_image_url} 
                        alt={podcast.title}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shadow-sm"
                      />
                    ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-sm">
                        <span className="text-white font-bold text-sm sm:text-base">
                          {podcast.title.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Podcast Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 break-words">
                      {podcast.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 mb-2">
                      <span className="capitalize font-medium">{podcast.category}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="font-medium uppercase">{podcast.language}</span>
                      {showAuthor && (
                        <>
                          <span className="hidden sm:inline">•</span>
                          <span className="w-full sm:w-auto">by {getAuthorName(podcast)}</span>
                        </>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-gray-500">
                      <span>{episodeCount(podcast)} episodes</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="w-full sm:w-auto">Created {formatDate(podcast.created_at)}</span>
                    </div>
                  </div>

                  {/* Status and Action */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-x-3 flex-shrink-0">
                    <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-medium ${
                      statusVariants[podcast.status as keyof typeof statusVariants] || 'bg-gray-100 text-gray-800'
                    }`}>
                      {podcast.status}
                    </span>
                    {getItemHref && (
                      <Link href={getItemHref(podcast)} className="w-full sm:w-auto">
                        <Button variant="outline" size="sm" className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 h-8 sm:h-9 w-full sm:w-auto">
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