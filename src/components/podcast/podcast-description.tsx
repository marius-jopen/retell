'use client'

import { useState } from 'react'

interface PodcastDescriptionProps {
  description: string
  className?: string
}

export function PodcastDescription({ description, className = '' }: PodcastDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Check if description is long enough to need truncation (rough estimation)
  const needsTruncation = description.length > 200

  return (
    <div className={className}>
      <p className={`text-base text-red-100 leading-relaxed ${!isExpanded && needsTruncation ? 'line-clamp-3' : ''}`}>
        {description}
      </p>
      
      {needsTruncation && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-sm text-white/80 hover:text-white underline transition-colors"
        >
          {isExpanded ? 'Read less' : 'Read more'}
        </button>
      )}
    </div>
  )
} 