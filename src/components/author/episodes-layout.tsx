'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

interface Episode {
  id: string
  title: string
  description: string
  audio_url: string
  script_url: string
  duration: number | null
  episode_number: number
  season_number: number | null
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
}

interface EpisodesLayoutProps {
  podcastId: string
  episodes: Episode[]
  selectedEpisodeId?: string
}

function formatDuration(duration: number | null): string {
  if (!duration) return 'Unknown'
  
  const hours = Math.floor(duration / 3600)
  const minutes = Math.floor((duration % 3600) / 60)
  const seconds = duration % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
}

export default function EpisodesLayout({ 
  podcastId, 
  episodes, 
  selectedEpisodeId 
}: EpisodesLayoutProps) {
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null)

  useEffect(() => {
    if (selectedEpisodeId) {
      const episode = episodes.find(ep => ep.id === selectedEpisodeId)
      setSelectedEpisode(episode || null)
    } else if (episodes.length > 0) {
      // Auto-select first episode if none selected
      setSelectedEpisode(episodes[0])
    }
  }, [selectedEpisodeId, episodes])

  if (episodes.length === 0) {
    return (
      <div className="bg-white rounded-modern-lg shadow-modern border border-orange-200 p-8 text-center">
        <div className="text-4xl mb-4">📝</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Episodes Yet</h3>
        <p className="text-gray-600 mb-6">Create your first episode to get started</p>
        <Link href={`/author/podcasts/${podcastId}/episodes/new`}>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full">
            Create Episode
          </Button>
        </Link>
      </div>
    )
  }

  if (!selectedEpisode) {
    return (
      <div className="bg-white rounded-modern-lg shadow-modern border border-orange-200 p-8 text-center">
        <div className="text-4xl mb-4">👈</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Select an Episode</h3>
        <p className="text-gray-600">Choose an episode from the list to view and edit its details</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-modern-lg shadow-modern border border-orange-200">
      {/* Episode Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3 mb-3">
          <span className="inline-flex items-center justify-center h-8 w-8 bg-orange-600 text-white text-sm font-medium rounded-full">
            #{selectedEpisode.episode_number}
          </span>
          <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${
            selectedEpisode.status === 'approved' ? 'bg-green-100 text-green-800' :
            selectedEpisode.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            selectedEpisode.status === 'rejected' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {selectedEpisode.status}
          </span>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {selectedEpisode.title}
        </h2>
      </div>

      {/* Episode Details */}
      <div className="p-6 space-y-6">
        {/* Description */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            {selectedEpisode.description || 'No description available'}
          </p>
        </div>

        {/* Episode Info */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-1">Duration</h3>
            <p className="text-gray-600 text-sm">{formatDuration(selectedEpisode.duration)}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-1">Created</h3>
            <p className="text-gray-600 text-sm">{formatDate(selectedEpisode.created_at)}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-1">Last Updated</h3>
            <p className="text-gray-600 text-sm">{formatDate(selectedEpisode.updated_at)}</p>
          </div>
        </div>

        {/* Audio Player */}
        {selectedEpisode.audio_url && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Audio</h3>
            <div className="bg-orange-50 rounded-modern p-4 border border-orange-200">
              <audio 
                controls 
                className="w-full"
                preload="metadata"
              >
                <source src={selectedEpisode.audio_url} type="audio/mpeg" />
                <source src={selectedEpisode.audio_url} type="audio/wav" />
                <source src={selectedEpisode.audio_url} type="audio/ogg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          </div>
        )}

        {/* Script/Transcript */}
        {selectedEpisode.script_url && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Transcript</h3>
            <a 
              href={selectedEpisode.script_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-full hover:bg-orange-100 transition-colors"
            >
              📄 View Transcript
            </a>
          </div>
        )}

        {/* Actions */}
        <div className="pt-4 border-t border-gray-200 space-y-3">
          <Link href={`/author/podcasts/${podcastId}/episodes/${selectedEpisode.id}/edit`}>
            <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-full">
              Edit Episode
            </Button>
          </Link>
          
          <Link href={`/author/podcasts/${podcastId}/episodes/new`}>
            <Button variant="outline" className="w-full rounded-full border-orange-200 text-orange-600 hover:bg-orange-50">
              Create New Episode
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}