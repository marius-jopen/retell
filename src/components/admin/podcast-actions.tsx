'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { createBrowserSupabaseClient } from '@/lib/supabase'

interface PodcastActionsProps {
  podcastId: string
  podcastTitle: string
  status: 'draft' | 'pending' | 'approved' | 'rejected'
}

export default function PodcastActions({ podcastId, podcastTitle, status }: PodcastActionsProps) {
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
  const { addToast } = useToast()
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()

  const updatePodcastStatus = async (newStatus: 'approved' | 'rejected') => {
    setLoading(newStatus === 'approved' ? 'approve' : 'reject')
    
    try {
      const { error } = await supabase
        .from('podcasts')
        .update({ status: newStatus })
        .eq('id', podcastId)

      if (error) {
        addToast({
          type: 'error',
          message: `Failed to ${newStatus === 'approved' ? 'approve' : 'reject'} podcast: ${error.message}`
        })
        return
      }

      addToast({
        type: 'success',
        message: `Successfully ${newStatus === 'approved' ? 'approved' : 'rejected'} "${podcastTitle}"`
      })

      // Refresh the page to show updated status
      router.refresh()
    } catch (error) {
      addToast({
        type: 'error',
        message: `An error occurred while updating the podcast status`
      })
    } finally {
      setLoading(null)
    }
  }

  if (status !== 'pending') {
    return null
  }

  return (
    <div className="flex space-x-2">
      <Button
        size="sm"
        className="bg-green-600 hover:bg-green-700"
        onClick={() => updatePodcastStatus('approved')}
        disabled={loading !== null}
      >
        {loading === 'approve' ? 'Approving...' : 'Approve'}
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={() => updatePodcastStatus('rejected')}
        disabled={loading !== null}
      >
        {loading === 'reject' ? 'Rejecting...' : 'Reject'}
      </Button>
    </div>
  )
} 