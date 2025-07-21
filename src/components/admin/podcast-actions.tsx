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
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function PodcastActions({ 
  podcastId, 
  podcastTitle, 
  status, 
  size = 'sm',
  className = '' 
}: PodcastActionsProps) {
  const [loading, setLoading] = useState<'approve' | 'reject' | 'pending' | null>(null)
  const { addToast } = useToast()
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()

  const updatePodcastStatus = async (newStatus: 'approved' | 'rejected' | 'pending') => {
    const action = newStatus === 'approved' ? 'approve' : newStatus === 'rejected' ? 'reject' : 'pending'
    setLoading(action)
    
    try {
      const { error } = await supabase
        .from('podcasts')
        .update({ status: newStatus })
        .eq('id', podcastId)

      if (error) {
        addToast({
          type: 'error',
          message: `Failed to ${action} podcast: ${error.message}`
        })
        return
      }

      const actionMessage = {
        approved: 'approved',
        rejected: 'rejected', 
        pending: 'marked as pending'
      }[newStatus]

      addToast({
        type: 'success',
        message: `Successfully ${actionMessage} "${podcastTitle}"`
      })

      // Refresh the page to show updated status
      router.refresh()
    } catch {
      addToast({
        type: 'error',
        message: `An error occurred while updating the podcast status`
      })
    } finally {
      setLoading(null)
    }
  }

  const getAvailableActions = () => {
    switch (status) {
      case 'pending':
        return [
          { action: 'approved', label: 'Approve', variant: 'primary' as const },
          { action: 'rejected', label: 'Reject', variant: 'destructive' as const }
        ]
      case 'approved':
        return [
          { action: 'pending', label: 'Mark Pending', variant: 'outline' as const },
          { action: 'rejected', label: 'Reject', variant: 'destructive' as const }
        ]
      case 'rejected':
        return [
          { action: 'approved', label: 'Approve', variant: 'primary' as const },
          { action: 'pending', label: 'Mark Pending', variant: 'outline' as const }
        ]
      case 'draft':
        return [
          { action: 'pending', label: 'Submit for Review', variant: 'outline' as const }
        ]
      default:
        return []
    }
  }

  const availableActions = getAvailableActions()

  if (availableActions.length === 0) {
    return null
  }

  return (
    <div className={`flex space-x-1 ${className}`}>
      {availableActions.map(({ action, label, variant }) => (
        <Button
          key={action}
          variant={variant}
          size="sm"
          onClick={() => updatePodcastStatus(action as 'approved' | 'rejected' | 'pending')}
          disabled={loading !== null}
          className="text-xs px-2 py-1 h-7"
        >
          {loading === (action === 'approved' ? 'approve' : action === 'rejected' ? 'reject' : 'pending') ? 
            `${action === 'approved' ? 'Approving' : action === 'rejected' ? 'Rejecting' : 'Updating'}...` : 
            label
          }
        </Button>
      ))}
    </div>
  )
} 