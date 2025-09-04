'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { PlayIcon, PauseIcon } from '@heroicons/react/24/outline'

interface AudioPlayerProps {
  src: string | File | null
  className?: string
  onLoadSuccess?: () => void
  onLoadError?: (error: Error) => void
}

export default function AudioPlayer({ 
  src, 
  className = '', 
  onLoadSuccess,
  onLoadError
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Update current time as audio plays
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleLoadStart = () => setIsLoading(true)
    const handleCanPlay = () => {
      setIsLoading(false)
      setError(null)
      onLoadSuccess?.()
    }
    const handleError = () => {
      setIsLoading(false)
      setError('Failed to load audio file')
      onLoadError?.(new Error('Failed to load audio file'))
    }
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('loadstart', handleLoadStart)
    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('error', handleError)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('loadstart', handleLoadStart)
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
    }
  }, [onLoadSuccess, onLoadError])

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play().catch(err => {
        setError('Failed to play audio')
        console.error('Audio play error:', err)
      })
    }
  }, [isPlaying])

  const formatTime = useCallback((time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }, [])

  if (!src) {
    return null
  }

  if (error) {
    return (
      <div className={`text-red-600 text-sm ${className}`}>
        <p>Error loading audio</p>
      </div>
    )
  }

  return (
    <div className={`bg-gray-50 rounded-lg p-3 border border-gray-200 ${className}`}>
      <div className="flex items-center space-x-3">
        <audio ref={audioRef} src={typeof src === 'string' ? src : URL.createObjectURL(src)} />
        
        {/* Play/Pause Button */}
        <Button
          onClick={togglePlayPause}
          disabled={isLoading}
          size="sm"
          className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white p-0"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : isPlaying ? (
            <PauseIcon className="h-4 w-4" />
          ) : (
            <PlayIcon className="h-4 w-4 ml-0.5" />
          )}
        </Button>

        {/* Time Display */}
        <div className="text-sm text-gray-600 min-w-0">
          <span>{formatTime(currentTime)}</span>
          {duration > 0 && (
            <>
              <span className="text-gray-400"> / </span>
              <span>{formatTime(duration)}</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}