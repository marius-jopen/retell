'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'

interface RSSUpdateProps {
  podcastId: string
  podcastTitle: string
  hasRssUrl: boolean
  onUpdateSuccess?: () => void
}

export default function RSSUpdate({ 
  podcastId, 
  podcastTitle, 
  hasRssUrl, 
  onUpdateSuccess 
}: RSSUpdateProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { addToast } = useToast()

  const handleUpdate = async () => {
    if (!hasRssUrl) {
      setError('This podcast does not have an RSS feed URL')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/rss/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ podcastId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update RSS feed')
      }

      if (data.episodes.new > 0) {
        addToast({
          type: 'success',
          message: `🎙️ Found ${data.episodes.new} new episodes for "${podcastTitle}"! 🎉`
        })
      } else {
        addToast({
          type: 'info',
          message: `✅ "${podcastTitle}" is up to date! No new episodes found.`
        })
      }

      // Notify parent component
      if (onUpdateSuccess) {
        onUpdateSuccess()
      }

    } catch (error) {
      console.error('Update error:', error)
      setError(error instanceof Error ? error.message : 'Failed to update RSS feed')
    } finally {
      setLoading(false)
    }
  }

  if (!hasRssUrl) {
    return null
  }

  return (
    <div className="space-y-2 w-full sm:w-auto">
      <Button
        onClick={handleUpdate}
        disabled={loading}
        variant="outline"
        size="sm"
        className="rounded-2xl hover:bg-orange-50 transition-colors w-full sm:w-auto text-xs sm:text-sm whitespace-nowrap"
      >
        {loading ? '🔄 Syncing...' : '🔄 Sync RSS'}
      </Button>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-2 sm:p-3">
          <div className="flex items-start sm:items-center">
            <span className="text-red-600 mr-2 flex-shrink-0">⚠️</span>
            <p className="text-red-700 text-xs sm:text-sm break-words">{error}</p>
          </div>
        </div>
      )}
    </div>
  )
} 