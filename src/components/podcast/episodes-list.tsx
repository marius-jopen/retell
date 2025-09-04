'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import AudioPlayer from '@/components/ui/audio-player'

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
  user_metadata?: {
    role: string
  }
}

interface EpisodesListProps {
  episodes: Episode[]
  user?: User | null
}

export function EpisodesList({ episodes, user }: EpisodesListProps) {
  const [showAll, setShowAll] = useState(false)
  
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

  const displayedEpisodes = showAll ? episodes : episodes.slice(0, 4)
  const hasMoreEpisodes = episodes.length > 4

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Episodes</h2>
        <p className="text-gray-600">
          {episodes.length} episodes available
        </p>
      </div>

      {/* Episodes List - Simple vertical list */}
      <div className="space-y-4">
        {displayedEpisodes.map((episode: Episode) => (
          <div key={episode.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-sm font-medium text-gray-500">
                    Episode {episode.episode_number}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="text-sm text-gray-500">
                    {new Date(episode.created_at).toLocaleDateString()}
                  </span>
                  {episode.duration && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span className="text-sm text-gray-500">
                        {Math.floor(episode.duration / 60)}:{String(episode.duration % 60).padStart(2, '0')}
                      </span>
                    </>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {episode.title}
                </h3>
                {episode.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {episode.description}
                  </p>
                )}
                
                {/* Minimal Audio Player */}
                {episode.audio_url && (
                  <div className="mt-3">
                    <AudioPlayer 
                      src={episode.audio_url}
                    />
                  </div>
                )}
              </div>
              
              {/* Script Button */}
              {user?.user_metadata?.role === 'client' && episode.script_url && (
                <div className="ml-4 flex-shrink-0">
                  <button className="px-3 py-1 text-xs bg-gray-100 text-gray-700 border border-gray-300 rounded hover:bg-gray-200 transition-colors">
                    Script
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {hasMoreEpisodes && (
        <div className="text-center mt-8">
          <Button
            onClick={() => setShowAll(!showAll)}
            variant="outline"
            className="px-8 py-2"
          >
            {showAll ? 'Show Less' : `Load More (${episodes.length - 4} more)`}
          </Button>
        </div>
      )}
    </div>
  )
}