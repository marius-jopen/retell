'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ImageGallerySliderProps {
  images: Array<{
    id: string
    image_url: string
    image_name: string
    sort_order: number
  }>
  className?: string
}

export function ImageGallerySlider({ images, className = '' }: ImageGallerySliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Reset current index when images change
  useEffect(() => {
    setCurrentIndex(0)
  }, [images])

  if (!images || images.length === 0) {
    return null
  }

  const sortedImages = [...images].sort((a, b) => a.sort_order - b.sort_order)

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? sortedImages.length - 1 : prevIndex - 1
    )
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === sortedImages.length - 1 ? 0 : prevIndex + 1
    )
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  const openFullscreen = () => {
    setIsFullscreen(true)
  }

  const closeFullscreen = () => {
    setIsFullscreen(false)
  }

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isFullscreen) return
      
      if (event.key === 'ArrowLeft') {
        goToPrevious()
      } else if (event.key === 'ArrowRight') {
        goToNext()
      } else if (event.key === 'Escape') {
        closeFullscreen()
      }
    }

    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isFullscreen])

  return (
    <>
      {/* Main Slider */}
      <div className={`relative ${className}`}>
        <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-100">
          {sortedImages.length > 0 && (
            <>
              <img
                src={sortedImages[currentIndex].image_url}
                alt={sortedImages[currentIndex].image_name}
                className="w-full h-full object-cover cursor-pointer"
                onClick={openFullscreen}
              />
              
              {/* Navigation Arrows */}
              {sortedImages.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                    onClick={goToPrevious}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                    onClick={goToNext}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </>
              )}

              {/* Image Counter */}
              <div className="absolute bottom-2 right-2 bg-black/50 text-white text-sm px-2 py-1 rounded">
                {currentIndex + 1} / {sortedImages.length}
              </div>
            </>
          )}
        </div>

        {/* Thumbnail Navigation */}
        {sortedImages.length > 1 && (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2 justify-center">
            {sortedImages.map((image, index) => (
              <button
                key={image.id}
                onClick={() => goToSlide(index)}
                className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentIndex
                    ? 'border-red-500 ring-2 ring-red-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <img
                  src={image.image_url}
                  alt={image.image_name}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white"
              onClick={closeFullscreen}
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Fullscreen Image */}
            <div className="relative max-w-full max-h-full">
              <img
                src={sortedImages[currentIndex].image_url}
                alt={sortedImages[currentIndex].image_name}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {/* Fullscreen Navigation */}
            {sortedImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                  onClick={goToPrevious}
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                  onClick={goToNext}
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}

            {/* Fullscreen Image Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-lg px-4 py-2 rounded">
              {currentIndex + 1} / {sortedImages.length}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
