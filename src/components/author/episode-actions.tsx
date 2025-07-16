'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/toast'
import { createBrowserSupabaseClient } from '@/lib/supabase'

interface EpisodeActionsProps {
  episodeId: string
  episodeTitle: string
  podcastId: string
}

export default function EpisodeActions({ episodeId, episodeTitle, podcastId }: EpisodeActionsProps) {
  const [loading, setLoading] = useState(false)
  const { addToast } = useToast()
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()

  const handleDelete = async () => {
    const confirmMessage = `Are you sure you want to delete "${episodeTitle}"? This action cannot be undone.`
    
    if (!confirm(confirmMessage)) {
      return
    }

    setLoading(true)
    
    try {
      const { error } = await supabase
        .from('episodes')
        .delete()
        .eq('id', episodeId)

      if (error) {
        throw error
      }

      addToast({
        type: 'success',
        message: `Episode "${episodeTitle}" deleted successfully`
      })

      router.refresh()
    } catch (error) {
      console.error('Error deleting episode:', error)
      addToast({
        type: 'error',
        message: 'Failed to delete episode. Please try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDelete}
      disabled={loading}
      className="text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      {loading ? 'Deleting...' : 'Delete'}
    </Button>
  )
} 