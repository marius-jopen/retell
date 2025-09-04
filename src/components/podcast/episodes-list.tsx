'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { EpisodeCard } from './episode-card'
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
  const [showAllEpisodes, setShowAllEpisodes] = useState(false)
  
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

  const featuredEpisodes = episodes.slice(0, 4)
  const remainingEpisodes = episodes.slice(4)

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Latest Episodes</h2>
        <p className="text-xl text-gray-600">
          {episodes.length} episodes available • Featuring the most recent content
        </p>
      </div>

      {/* Featured Episodes - 2x2 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {featuredEpisodes.map((episode: Episode) => (
          <div key={episode.id}>
            <EpisodeCard episode={episode} user={user} isCompact={false} isFeatured={true} />
          </div>
        ))}
      </div>

      {/* Remaining Episodes - Condensed Accordion */}
      {remainingEpisodes.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <button
              onClick={() => setShowAllEpisodes(!showAllEpisodes)}
              className="flex items-center justify-between w-full text-left"
            >
              <div>
                <h3 className="text-lg font-bold text-gray-900">More Episodes</h3>
                <p className="text-sm text-gray-600">
                  {remainingEpisodes.length} additional episodes available
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500">
                  {showAllEpisodes ? 'Hide' : 'Show'} All
                </span>
                <svg 
                  className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${showAllEpisodes ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
          </div>
          
          {showAllEpisodes && (
            <div className="divide-y divide-gray-100">
              {remainingEpisodes.map((episode: Episode, index: number) => (
                <div key={episode.id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      {/* Episode Number */}
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                        {episode.episode_number}
                      </div>
                      
                      {/* Episode Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">
                          {episode.title}
                        </h4>
                        <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                          <span>Episode {episode.episode_number}</span>
                          <span>•</span>
                          <span>{new Date(episode.created_at).toLocaleDateString()}</span>
                          {episode.duration && (
                            <>
                              <span>•</span>
                              <span>{Math.floor(episode.duration / 60)}:{String(episode.duration % 60).padStart(2, '0')}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {user?.user_metadata?.role === 'client' && (
                        <button className="px-3 py-1 text-xs bg-red-50 text-red-600 border border-red-200 rounded-full hover:bg-red-100 transition-colors duration-150">
                          Script
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Audio Player */}
                  {episode.audio_url && (
                    <div className="ml-12">
                      <AudioPlayer 
                        src={episode.audio_url} 
                        title={episode.title}
                        showDeleteButton={false}
                        className="text-sm"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
} 