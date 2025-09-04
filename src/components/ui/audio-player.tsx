'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { PlayIcon, PauseIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline'

interface AudioPlayerProps {
  src: string | File | null
  className?: string
  title?: string
  onLoadSuccess?: () => void
  onLoadError?: (error: Error) => void
}

export default function AudioPlayer({ 
  src, 
  className = '', 
  title = 'Audio File',
  onLoadSuccess,
  onLoadError 
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

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

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

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

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    if (!audio || !duration) return

    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newTime = (clickX / rect.width) * duration
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }, [duration])

  const handleMouseDown = useCallback(() => {
    setIsDragging(true)
  }, [])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return
    handleSeek(e)
  }, [isDragging, handleSeek])

  const formatTime = useCallback((time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }, [])

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0

  if (!src) {
    return (
      <div className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center ${className}`}>
        <div className="text-gray-500">
          <SpeakerWaveIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm">No audio file selected</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <div className="flex items-center space-x-2">
          <SpeakerWaveIcon className="h-5 w-5 text-gray-400" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-sm text-gray-600 w-8">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>

      {/* Audio Player */}
      <div className="p-4">
        {error ? (
          <div className="text-center py-8">
            <div className="text-red-600 mb-2">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-red-600 font-medium">Error loading audio</p>
            <p className="text-red-500 text-sm mt-1">{error}</p>
          </div>
        ) : (
          <>
            <audio ref={audioRef} src={typeof src === 'string' ? src : URL.createObjectURL(src)} />
            
            {/* Play/Pause Button */}
            <div className="flex items-center justify-center mb-4">
              <Button
                onClick={togglePlayPause}
                disabled={isLoading || !!error}
                className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white p-0"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                ) : isPlaying ? (
                  <PauseIcon className="h-6 w-6" />
                ) : (
                  <PlayIcon className="h-6 w-6 ml-1" />
                )}
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div
                className="relative h-2 bg-gray-200 rounded-full cursor-pointer"
                onClick={handleSeek}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseUp}
              >
                <div
                  className="absolute top-0 left-0 h-full bg-red-600 rounded-full transition-all duration-100"
                  style={{ width: `${progressPercentage}%` }}
                />
                <div
                  className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-red-600 rounded-full shadow-lg"
                  style={{ left: `calc(${progressPercentage}% - 8px)` }}
                />
              </div>

              {/* Time Display */}
              <div className="flex justify-between text-sm text-gray-600">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}