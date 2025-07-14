'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { createBrowserSupabaseClient } from '@/lib/supabase'

interface AuthorPodcastActionsProps {
  podcastId: string
  podcastTitle: string
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  authorId: string
}

export default function AuthorPodcastActions({ podcastId, podcastTitle, status, authorId }: AuthorPodcastActionsProps) {
  const [loading, setLoading] = useState<'submit' | 'delete' | null>(null)
  const { addToast } = useToast()
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()

  const submitForReview = async () => {
    setLoading('submit')
    
    try {
      const { error } = await supabase
        .from('podcasts')
        .update({ status: 'pending' })
        .eq('id', podcastId)
        .eq('author_id', authorId)

      if (error) {
        addToast({
          type: 'error',
          message: `Failed to submit podcast for review: ${error.message}`
        })
        return
      }

      addToast({
        type: 'success',
        message: `Successfully submitted "${podcastTitle}" for review`
      })

      router.refresh()
    } catch (error) {
      addToast({
        type: 'error',
        message: `An error occurred while submitting the podcast`
      })
    } finally {
      setLoading(null)
    }
  }

  const deletePodcast = async () => {
    const confirmMessage = status === 'approved' 
      ? `Are you sure you want to delete the published podcast "${podcastTitle}"? This will permanently remove it from public view and cannot be undone.`
      : `Are you sure you want to delete "${podcastTitle}"? This action cannot be undone.`
    
    if (!confirm(confirmMessage)) {
      return
    }

    setLoading('delete')
    
    try {
      // First, check if there are any episodes
      const { data: episodes, error: episodeCheckError } = await supabase
        .from('episodes')
        .select('id')
        .eq('podcast_id', podcastId)

      if (episodeCheckError) {
        addToast({
          type: 'error',
          message: `Error checking episodes: ${episodeCheckError.message}`
        })
        return
      }

      if (episodes && episodes.length > 0) {
        if (!confirm(`This podcast has ${episodes.length} episode(s). Deleting the podcast will also delete all episodes. Are you sure you want to continue?`)) {
          setLoading(null)
          return
        }
      }

      const { error } = await supabase
        .from('podcasts')
        .delete()
        .eq('id', podcastId)
        .eq('author_id', authorId)

      if (error) {
        addToast({
          type: 'error',
          message: `Failed to delete podcast: ${error.message}`
        })
        return
      }

      addToast({
        type: 'success',
        message: `Successfully deleted "${podcastTitle}"`
      })

      router.refresh()
    } catch (error) {
      addToast({
        type: 'error',
        message: `An error occurred while deleting the podcast`
      })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex space-x-2">
      {/* Submit/Resubmit button for draft and rejected podcasts */}
      {(status === 'draft' || status === 'rejected') && (
        <Button
          size="sm"
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg"
          onClick={submitForReview}
          disabled={loading !== null}
        >
          {loading === 'submit' ? 'Submitting...' : status === 'rejected' ? 'Resubmit' : 'Submit for Review'}
        </Button>
      )}
      
      {/* Delete button - available for all statuses */}
      <Button
        size="sm"
        variant="destructive"
        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg"
        onClick={deletePodcast}
        disabled={loading !== null}
      >
        {loading === 'delete' ? 'Deleting...' : '🗑️ Delete'}
      </Button>
    </div>
  )
} 