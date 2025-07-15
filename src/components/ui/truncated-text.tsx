'use client'

import { useState } from 'react'

interface TruncatedTextProps {
  text: string
  maxLines?: number
  className?: string
}

export default function TruncatedText({ 
  text, 
  maxLines = 3, 
  className = "text-gray-600 leading-relaxed" 
}: TruncatedTextProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // If text is short, don't show read more
  const isLongText = text.length > 150 // rough estimate for 3 lines

  return (
    <div className="space-y-2">
      <p 
        className={`${className} transition-all duration-300`}
        style={
          !isExpanded && isLongText 
            ? {
                display: '-webkit-box',
                WebkitLineClamp: maxLines,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }
            : {}
        }
      >
        {text}
      </p>
      
      {isLongText && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors duration-200 flex items-center space-x-1"
        >
          <span>{isExpanded ? 'Read less' : 'Read more'}</span>
          <svg 
            className={`w-4 h-4 transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 9l-7 7-7-7" 
            />
          </svg>
        </button>
      )}
    </div>
  )
} 